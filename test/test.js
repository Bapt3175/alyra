const Voting = artifacts.require("./Voting.sol");
const { BN , expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');


contract("addVoter", accounts => {
  const owner = accounts[0];
  const voter1 = accounts[1];
  const voter2 = accounts[2];

  let MyVotingInstance;

  beforeEach(async function(){
    MyVotingInstance= await Voting.new({from: owner});
  });


  describe("addVoter setter/getter/event", function () {

    beforeEach(async function(){
      MyVotingInstance= await Voting.new({from: owner});
    });

    it("should be registering status", async () => {
      expect(await MyVotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(0));
    });

    it("should not add voter if not owner", async () => {
      await MyVotingInstance.addVoter(voter1, { from: owner });
      await expectRevert.unspecified(MyVotingInstance.addVoter(voter2, { from: voter1 }));
    });

    it("should return if registered voter by a voter", async () => {
        await MyVotingInstance.addVoter(voter1, { from: owner });
        const storedData = await MyVotingInstance.getVoter(voter1, { from: voter1 });
        expect(storedData.isRegistered).to.equal(true);
        expect(new BN(storedData.votedProposalId)).to.be.bignumber.equal(new BN(0));
    });

    it("should return a voter has voted by a voter", async () => {
      await MyVotingInstance.addVoter(voter1, { from: owner });
      const storedData = await MyVotingInstance.getVoter(voter1, { from: voter1 });
      expect(storedData.hasVoted).to.equal(false);
  });

    it("should return a voter proposalID by a voter", async () => {
      await MyVotingInstance.addVoter(voter1, { from: owner });
      const storedData = await MyVotingInstance.getVoter(voter1, { from: voter1 });
      expect(new BN(storedData.votedProposalId)).to.be.bignumber.equal(new BN(0));
  });

  it("should add voter, get event voter Added", async () => {
    const findEvent = await MyVotingInstance.addVoter(voter1, { from: owner });
    expectEvent(findEvent,"VoterRegistered" ,{voterAddress: voter1});
  });


});

describe("proposal getter/setter/event", function () {

  beforeEach(async function(){
    MyVotingInstance= await Voting.new({from: owner});
    await MyVotingInstance.addVoter(voter1, { from: owner });
    await MyVotingInstance.addVoter(voter2, { from: owner });
    await MyVotingInstance.startProposalsRegistering( {from: owner });
  });

  it("should be start proposal status", async () => {
    expect(await MyVotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(1));
  });

  it("should return GENESIS proposal", async () => {
    const storedData = await MyVotingInstance.getOneProposal(0, { from: voter1 });
    expect(storedData.description).to.equal("GENESIS");
  });

  it("should return a proposal by a voter", async () => {
    await MyVotingInstance.addProposal("tarte à la myrtille", { from: voter1 });
    const storedData = await MyVotingInstance.getOneProposal(1, { from: voter2 });
    expect(storedData.description).to.equal("tarte à la myrtille");
});

  it("should add proposal, get event proposal added", async () => {
    const findEvent = await MyVotingInstance.addProposal("tarte à la myrtille", { from: voter1 });
    expectEvent(findEvent,"ProposalRegistered" ,{proposalId: new BN(1)});
  });

describe("vote, event", function () {

  beforeEach(async function(){
    MyVotingInstance= await Voting.new({from: owner});
    await MyVotingInstance.addVoter(voter1, { from: owner });
    await MyVotingInstance.addVoter(voter2, { from: owner });
    await MyVotingInstance.startProposalsRegistering( {from: owner });
    await MyVotingInstance.addProposal("tarte à la myrtille", { from: voter1 });
    await MyVotingInstance.addProposal("tarte au citron", { from: voter2 });
    await MyVotingInstance.endProposalsRegistering( {from: owner });
    await MyVotingInstance.startVotingSession( {from: owner });
  });

  it("should be start vote status", async () => {
    expect(await MyVotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(3));
  });

  it("should return a status vote by a voter", async () => {
    await MyVotingInstance.setVote(1, { from: voter1 });
    const storedData = await MyVotingInstance.getVoter(voter1, { from: voter2 });
    expect(storedData.hasVoted).to.equal(true); 
  });

  it("should return id by a voter", async () => {
    await MyVotingInstance.setVote(1, { from: voter1 });
    const storedData = await MyVotingInstance.getVoter(voter1, { from: voter2 });
    expect(new BN(storedData.votedProposalId)).to.be.bignumber.equal(new BN(1));
  });

  it("should add vote, get event vote added", async () => {
    const findEvent = await MyVotingInstance.setVote(1, { from: voter1 });
    expectEvent(findEvent,"Voted" ,{voter: voter1, proposalId: new BN(1)});
  });

});

describe("State, event", function () {

  beforeEach(async function(){
    MyVotingInstance= await Voting.new({from: owner});
  });

  it("should return start proposal status", async () => {
    await MyVotingInstance.startProposalsRegistering( {from: owner });
    expect(await MyVotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(1));
  });

  it("should start proposal, get event start proposal", async () => {
    const findEvent = await MyVotingInstance.startProposalsRegistering( {from: owner });
    expectEvent(findEvent,"WorkflowStatusChange" ,{previousStatus: new BN(0), newStatus: new BN(1) });
  });

  it("should return end proposal status", async () => {
    await MyVotingInstance.startProposalsRegistering( {from: owner });
    await MyVotingInstance.endProposalsRegistering( {from: owner });
    expect(await MyVotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(2));
  });

  it("should end proposal, get event end proposal", async () => {
    await MyVotingInstance.startProposalsRegistering( {from: owner });
    const findEvent = await MyVotingInstance.endProposalsRegistering( {from: owner });  
    expectEvent(findEvent,"WorkflowStatusChange" ,{previousStatus: new BN(1), newStatus: new BN(2) });
  });

  it("should return start vote status", async () => {
    await MyVotingInstance.startProposalsRegistering( {from: owner });
    await MyVotingInstance.endProposalsRegistering( {from: owner });
    await MyVotingInstance.startVotingSession( {from: owner });
    expect(await MyVotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(3));
  });

  it("should start vote, get event start vote", async () => {
    await MyVotingInstance.startProposalsRegistering( {from: owner });
    await MyVotingInstance.endProposalsRegistering( {from: owner });
    const findEvent = await MyVotingInstance.startVotingSession( {from: owner }); 
    expectEvent(findEvent,"WorkflowStatusChange" ,{previousStatus: new BN(2), newStatus: new BN(3) });
  });

  it("should return end vote status", async () => {
    await MyVotingInstance.startProposalsRegistering( {from: owner });
    await MyVotingInstance.endProposalsRegistering( {from: owner });
    await MyVotingInstance.startVotingSession( {from: owner });
    await MyVotingInstance.endVotingSession( {from: owner });
    expect(await MyVotingInstance.workflowStatus.call()).to.be.bignumber.equal(new BN(4));
  });

  it("should end vote, get event end vote", async () => {
    await MyVotingInstance.startProposalsRegistering( {from: owner });
    await MyVotingInstance.endProposalsRegistering( {from: owner });
    await MyVotingInstance.startVotingSession( {from: owner });
    const findEvent = await MyVotingInstance.endVotingSession( {from: owner }); 
    expectEvent(findEvent,"WorkflowStatusChange" ,{previousStatus: new BN(3), newStatus: new BN(4) });
  });

  it("should return winner", async () => {
    MyVotingInstance= await Voting.new({from: owner});
    await MyVotingInstance.addVoter(voter1, { from: owner });
    await MyVotingInstance.addVoter(voter2, { from: owner });
    await MyVotingInstance.startProposalsRegistering( {from: owner });
    await MyVotingInstance.addProposal("tarte à la myrtille", { from: voter1 });
    await MyVotingInstance.addProposal("tarte au citron", { from: voter2 });
    await MyVotingInstance.endProposalsRegistering( {from: owner });
    await MyVotingInstance.startVotingSession( {from: owner });
    await MyVotingInstance.setVote(1, { from: voter1 });
    await MyVotingInstance.setVote(1, { from: voter2 });
    await MyVotingInstance.endVotingSession( {from: owner }); 
    await MyVotingInstance.tallyVotes({ from: owner });
    const storedData = await MyVotingInstance.winningProposalID.call();
    expect(storedData).to.be.bignumber.equal(new BN(1)); 
  });


  it("should tallyvote, get event tallyvote", async () => {
    await MyVotingInstance.startProposalsRegistering( {from: owner });
    await MyVotingInstance.endProposalsRegistering( {from: owner });
    await MyVotingInstance.startVotingSession( {from: owner });
    await MyVotingInstance.endVotingSession( {from: owner });
    const findEvent = await MyVotingInstance.tallyVotes( {from: owner }); 
    expectEvent(findEvent,"WorkflowStatusChange" ,{previousStatus: new BN(4), newStatus: new BN(5) });
  });


});

describe("test require, revert", function () {

  beforeEach(async function(){
    MyVotingInstance= await Voting.new({from: owner});  
  });

  it("should not add voter if not registration status", async () => {
    await MyVotingInstance.startProposalsRegistering( {from: owner });
    await expectRevert.unspecified(MyVotingInstance.addVoter(voter1, { from: owner }));
  });


  it("should not add voter if already registered", async () => {
    await MyVotingInstance.addVoter(voter1, { from: owner });
    await expectRevert.unspecified(MyVotingInstance.addVoter(voter1, { from: owner }));
  });


  it("should not propose if not proposal status", async () => {
    await expectRevert.unspecified(MyVotingInstance.addProposal("tarte à la myrtille", { from: voter1 }));
  });

  it("should not send empty proposal", async () => {
    await MyVotingInstance.addVoter(voter1, { from: owner });
    await MyVotingInstance.startProposalsRegistering( {from: owner });
    await expectRevert.unspecified(MyVotingInstance.addProposal("", { from: voter1 }));
  });

  it("should not vote if not vote status", async () => {
    await MyVotingInstance.addVoter(voter1, { from: owner });
    await expectRevert.unspecified(MyVotingInstance.setVote(1, { from: voter1 }));
  });

  it("should not vote if already voted", async () => {
    await MyVotingInstance.addVoter(voter1, { from: owner });
    await MyVotingInstance.startProposalsRegistering( {from: owner });
    await MyVotingInstance.addProposal("tarte à la myrtille", { from: voter1 });
    await MyVotingInstance.endProposalsRegistering( {from: owner });
    await MyVotingInstance.startVotingSession( {from: owner });
    await MyVotingInstance.setVote(1, { from: voter1 })
    await expectRevert.unspecified(MyVotingInstance.setVote(1, { from: voter1 }));
  });

  it("should not vote for non existing proposal", async () => {
    await MyVotingInstance.addVoter(voter1, { from: owner });
    await MyVotingInstance.startProposalsRegistering( {from: owner });
    await MyVotingInstance.addProposal("tarte à la myrtille", { from: voter1 });
    await MyVotingInstance.endProposalsRegistering( {from: owner });
    await MyVotingInstance.startVotingSession( {from: owner });
    await expectRevert.unspecified(MyVotingInstance.setVote(2, { from: voter1 }));
  }); 

  it("should be registering status", async () => {
    await MyVotingInstance.startProposalsRegistering( {from: owner });   
    await expectRevert.unspecified(MyVotingInstance.startProposalsRegistering({ from: owner }));
  }); 

  it("should be registering proposals status", async () => {
    await expectRevert.unspecified(MyVotingInstance.endProposalsRegistering({ from: owner }));
  }); 

  it("should be starting vote status", async () => {
    await expectRevert.unspecified(MyVotingInstance.startVotingSession({ from: owner }));
  }); 

  it("should be end vote status", async () => {
    await expectRevert.unspecified(MyVotingInstance.endVotingSession({ from: owner }));
  }); 

  it("should be end vote status for tallyvotes", async () => {
    await expectRevert.unspecified(MyVotingInstance.tallyVotes({ from: owner }));
  }); 

});

});
});
