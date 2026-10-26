const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("test game scenario", function(){
  it("test my win loss function for a 'win' ", async function(){

          const Game = await ethers.deployContract("Gaming");

          const signers = await ethers.getSigners();

          const fundGame = await Game.fundGame({from: signers[0], value: ethers.parseEther('100')})
          
	  const preBalance = await ethers.provider.getBalance(signers[0])
 
	  // 'random number' from the blcck # to module + 1 is {0 10}
          const gameRound = await Game.winOrLose(11,true,{ from: signers[0], value: ethers.parseEther('1.0') } )
          
          const postBalance = await ethers.provider.getBalance(signers[0])
          
	  console.log("preBalance", preBalance)
	  console.log("postBalance", postBalance)

          expect(postBalance).to.be.greaterThan(preBalance + ethers.parseEther(".9"));  // member the gas fees will make it somewhat less than 1 ehter win

          const playerStats = await Game.players(signers[0])
          expect(playerStats[0]).to.equal(1)
          //assert.isAtLeast(initialBalanceInEther, postBalanceInEther + 1, 'Player account should have decreased by the amount of the wager')


  });

  it("test my win loss function for a 'loss' ", async function(){

          const Game = await ethers.deployContract("Gaming");

          const signers = await ethers.getSigners();

          const fundGame = await Game.fundGame({from: signers[0], value: ethers.parseEther('100')})

          const preBalance = await ethers.provider.getBalance(signers[0])
          const preBalanceContract = await ethers.provider.getBalance(Game.target)
          // 'random number' from the blcck # to module + 1 is {0 10}
          const gameRound = await Game.winOrLose(11,false,{ from: signers[0], value: ethers.parseEther('2.0') } )

          const postBalance = await ethers.provider.getBalance(signers[0])
          const postBalanceContract = await ethers.provider.getBalance(Game.target)
          console.log("preBalance", preBalance)
          console.log("postBalance", postBalance)

          expect(postBalanceContract).to.equal(preBalanceContract + ethers.parseEther("2.0"));  // member the gas fees will make it somewhat less than 1 ehter win
          const playerStats = await Game.players(signers[0])
          expect(playerStats[1]).to.equal(1)


  });

  it("test my win loss function for a 'win' ", async function(){

          const Game = await ethers.deployContract("Gaming");

          const signers = await ethers.getSigners();

          const fundGame = await Game.fundGame({from: signers[0], value: ethers.parseEther('100')})

          const preBalance = await ethers.provider.getBalance(signers[0])

          // 'random number' from the blcck # to module + 1 is {0 10}
          const gameRound = await Game.winOrLose(0, false,{ from: signers[0], value: ethers.parseEther('5.0') } )

          const postBalance = await ethers.provider.getBalance(signers[0])

          console.log("preBalance", preBalance)
          console.log("postBalance", postBalance)

          expect(postBalance).to.be.greaterThan(preBalance + ethers.parseEther("4.9"));  // member the gas fees will make it somewhat less than 1 ehter win

          const playerStats = await Game.players(signers[0])
          expect(playerStats[0]).to.equal(1)

  });

  it("test my win loss function for a 'win' ", async function(){

          const Game = await ethers.deployContract("Gaming");

          const signers = await ethers.getSigners();

          const fundGame = await Game.fundGame({from: signers[0], value: ethers.parseEther('100')})

          const preBalanceContract = await ethers.provider.getBalance(Game.target)

          // 'random number' from the blcck # to module + 1 is {0 10}
          const gameRound = await Game.winOrLose(0,true,{ from: signers[0], value: ethers.parseEther('7.0') } )

          const postBalanceContract = await ethers.provider.getBalance(Game.target)


          expect(postBalanceContract).to.equal(preBalanceContract + ethers.parseEther("7.0"));  // member the gas fees will make it somewhat less than 1 ehter win

          const playerStats = await Game.players(signers[0])
          expect(playerStats[1]).to.equal(1)

  });


  
});


describe("additional gaming tests", function () {
  let Game, owner, player;

  beforeEach(async function () {
    [owner, player] = await ethers.getSigners();
    Game = await ethers.deployContract("Gaming");
    await Game.fundGame({ value: ethers.parseEther("100") });
  });

  //Deployment: the deployer becomes the owner
  it("sets the deployer as the owner", async function () {
    expect(await Game.owner()).to.equal(owner.address);
  });

  //Access control: isOwner modifier blocks other accounts
  it("blocks non-owners from funding or withdrawing", async function () {
    await expect(
      Game.connect(player).fundGame({ value: ethers.parseEther("1") })
    ).to.be.revertedWith("Only owner can call this function");

    await expect(
      Game.connect(player).withdrawFunds()
    ).to.be.revertedWith("Only owner can call this function");
  });

  //Edge case: a tie loses whether the player guessed higher or lower
  it("treats a tie as a loss for both guesses", async function () {
    expect(await Game.determineWinner(5, 5, true)).to.equal(false);
    expect(await Game.determineWinner(5, 5, false)).to.equal(false);
  });

  //Forced win: pays 2x, emits event, updates player + game counters
  it("pays double and updates counters on a forced win", async function () {
    await Game.setMysteryNumber(3);
    const wager = ethers.parseEther("1");
    const before = await ethers.provider.getBalance(Game.target);

    await expect(Game.connect(player).winOrLoseTest(8, true, { value: wager }))
      .to.emit(Game, "RoundComplete")
      .withArgs(wager, 8, 3, true, "won");

    const after = await ethers.provider.getBalance(Game.target);
    expect(after).to.equal(before - wager); // took in 1 ETH, paid out 2 ETH

    expect((await Game.players(player.address)).wins).to.equal(1);
    expect(await Game.wins()).to.equal(1);
  });
});
