// We are going to skimp a bit on these tests...

const { assert, expect, use } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random IPFS NFT Unit Tests", function () {
          let randomIpfsNft, deployer, vrfCoordinatorV2Mock, user1

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              user1 = accounts[1]
              await deployments.fixture(["mocks", "randomipfs"])
              randomIpfsNft = await ethers.getContract("RandomIpfsNft")
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
          })

          describe("constructor", () => {
              it("sets starting values correctly", async function () {
                  const catTokenUriZero = await randomIpfsNft.getCatTokenUris(0)
                  const isInitialized = await randomIpfsNft.getInitialized()
                  assert(catTokenUriZero.includes("ipfs://"))
                  assert.equal(isInitialized, true)
              })
          })

          describe("requestNft", () => {
              it("fails if payment isn't sent with the request", async function () {
                  await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
                      "RandomIpfsNft__NeedMoreETHSent"
                  )
              })
              it("reverts if payment amount is less than the mint fee", async function () {
                  const fee = await randomIpfsNft.getMintFee()
                  await expect(
                      randomIpfsNft.requestNft({
                          value: fee.sub(ethers.utils.parseEther("0.001")),
                      })
                  ).to.be.revertedWith("RandomIpfsNft__NeedMoreETHSent")
              })
              it("emits an event and kicks off a random word request", async function () {
                  const fee = await randomIpfsNft.getMintFee()
                  await expect(randomIpfsNft.requestNft({ value: fee.toString() })).to.emit(
                      randomIpfsNft,
                      "NftRequested"
                  )
              })
          })
          describe("fulfillRandomWords", () => {
              it("mints NFT after random number is returned", async function () {
                  await new Promise(async (resolve, reject) => {
                      randomIpfsNft.once("NftMinted", async () => {
                          try {
                              const tokenUri = await randomIpfsNft.tokenURI("0")
                              const tokenCounter = await randomIpfsNft.getTokenCounter()
                              assert.equal(tokenUri.toString().includes("ipfs://"), true)
                              assert.equal(tokenCounter.toString(), "1")
                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                      })
                      try {
                          const fee = await randomIpfsNft.getMintFee()
                          const requestNftResponse = await randomIpfsNft.requestNft({
                              value: fee.toString(),
                          })
                          const requestNftReceipt = await requestNftResponse.wait(1)
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              requestNftReceipt.events[1].args.requestId,
                              randomIpfsNft.address
                          )
                      } catch (e) {
                          console.log(e)
                          reject(e)
                      }
                  })
              })
          })
          describe("getTypeFromModdedRng", () => {
              it("should return pug if moddedRng < 10", async function () {
                  const expectedValue = await randomIpfsNft.getTypeFromModdedRng(7)
                  assert.equal(0, expectedValue)
              })
              it("should return shiba-inu if moddedRng is between 10 - 39", async function () {
                  const expectedValue = await randomIpfsNft.getTypeFromModdedRng(21)
                  assert.equal(1, expectedValue)
              })
              it("should return st. bernard if moddedRng is between 40 - 99", async function () {
                  const expectedValue = await randomIpfsNft.getTypeFromModdedRng(77)
                  assert.equal(2, expectedValue)
              })
              it("should revert if moddedRng > 99", async function () {
                  await expect(randomIpfsNft.getTypeFromModdedRng(100)).to.be.revertedWith(
                      "RandomIpfsNft__RangeOutOfBounds"
                  )
              })
          })

          describe("Withdraw", () => {
              beforeEach(async () => {
                  const fee = await randomIpfsNft.getMintFee()
                  const requestNftResponse = await randomIpfsNft.requestNft({
                      value: fee.toString(),
                  })
              })

              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const ConnectedContract = await randomIpfsNft.connect(accounts[1])
                  await expect(ConnectedContract.withdraw()).to.be.revertedWith(
                      "Ownable: caller is not the owner"
                  )
              })

              it("transfers ownership", async function () {
                  const accounts = await ethers.getSigners()
                  const ConnectedContract = await randomIpfsNft.connect(accounts[0])
                  await ConnectedContract.transferOwnership(user1.address)
                  const updatedOwner = await randomIpfsNft.getOwner()
                  console.log(updatedOwner)
                  console.log(user1.address)
                  console.log(deployer.address)

                  assert.equal(updatedOwner, user1.address, "Ownership not transferred properly")
              })

              it("allows the new owner to withdraw all funds", async function () {
                  const accounts = await ethers.getSigners()
                  const ConnectedContract = await randomIpfsNft.connect(accounts[0])
                  await ConnectedContract.transferOwnership(user1.address)
                  const initialOwner = await randomIpfsNft.getOwner()
                  assert.equal(initialOwner, user1.address, "Test setup error")

                  const initialContractBalance = await randomIpfsNft.provider.getBalance(
                      randomIpfsNft.address
                  )
                  const initialDeployerBalance = await randomIpfsNft.provider.getBalance(
                      deployer.address
                  )
                  const initialNewOwnerBalance = await randomIpfsNft.provider.getBalance(
                      user1.address
                  )

                  console.log(`Initial contract balance: ${initialContractBalance.toString()}`)
                  console.log(`Initial deployer balance: ${initialDeployerBalance.toString()}`)
                  console.log(`Initial user1 balance: ${initialNewOwnerBalance.toString()}`)

                  const newOwnerContract = await randomIpfsNft.connect(accounts[1]) // Assuming accounts[1] is the new owner

                  const transactionResponse = await newOwnerContract.withdraw()
                  const transactionReceipt = await transactionResponse.wait()
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const finalContractBalance = await randomIpfsNft.provider.getBalance(
                      randomIpfsNft.address
                  )
                  const finalDeployerBalance = await randomIpfsNft.provider.getBalance(
                      deployer.address
                  )
                  const finalNewOwnerBalance = await randomIpfsNft.provider.getBalance(
                      user1.address
                  )

                  console.log(`Final contract balance: ${finalContractBalance.toString()}`)
                  console.log(`Final newOwner balance: ${finalNewOwnerBalance.toString()}`)
                  console.log(`Final deployer balance : ${finalDeployerBalance.toString()}`)
                  console.log(`Gas cost: ${gasCost.toString()}`)

                  assert.equal(finalContractBalance, 0, "All funds should be withdrawn")
                  assert.equal(
                      finalContractBalance.add(finalNewOwnerBalance).add(gasCost).toString(),
                      initialContractBalance.add(initialNewOwnerBalance).toString(),
                      "New owner did not receive the correct amount"
                  )
              })
          })
      })
