// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.17;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";
contract Voting is Ownable {
    
    /**
    * @dev Contract module that allows the owner to rule a voting session for registered account
    */
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    mapping (address => Voter) guestlist;
    WorkflowStatus public voteStatus;
    Proposal[] public proposals;
    uint  proposalId = 0;
    Proposal[]  winners;

    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);
    
    /**
    * @dev Throws if called by non registered account
    */
    modifier onlyRegistered(){
        require(guestlist[msg.sender].isRegistered, "Not registered");
        _;
    }

    /**
    * @dev Owner register addresses and allow them to vote
    */
    function voterRegister(address _address) external onlyOwner{
        require(voteStatus==WorkflowStatus.RegisteringVoters, "Status must be RegisteringVoters");
        require(guestlist[_address].isRegistered!=true, "Already registered");
        guestlist[_address]=Voter(true, false, 0);
        emit VoterRegistered(_address); 
    }

    /**
    * @dev Owner modify status of vote to start proposals
    */
    function startProposal() external onlyOwner{
        require(voteStatus==WorkflowStatus.RegisteringVoters, "Status must be RegisteringVoters");
        voteStatus=WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, voteStatus);
    }

    /**
    * @dev Registered account propose description
    */
    function propose(string calldata _description) external onlyRegistered {
        require(voteStatus==WorkflowStatus.ProposalsRegistrationStarted, "Status must be ProposalsRegistrationStarted");
        proposals.push(Proposal(_description, 0));
        proposalId++;
        emit ProposalRegistered(proposalId);
    }

    /**
    * @dev Owner ends session of proposals
    */
    function endProposal() external onlyOwner{
        require(voteStatus==WorkflowStatus.ProposalsRegistrationStarted, "Status must be ProposalsRegistrationStarted");
        voteStatus=WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, voteStatus);
    }

    /**
    * @dev Owner starts session of votes
    */
    function startVoting() external onlyOwner{
        require(voteStatus==WorkflowStatus.ProposalsRegistrationEnded, "Status must be ProposalsRegistrationEnded");
        voteStatus=WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, voteStatus);
    }

    /**
    * @dev Account registered can vote once for defined proposals by id
    */
    function vote(uint _proposalId) external onlyRegistered {
        require(voteStatus==WorkflowStatus.VotingSessionStarted, "Status must be VotingSessionStarted");
        require(!guestlist[msg.sender].hasVoted, "Already voted");
        require(proposalId-1>=_proposalId, "We don't have that much proposition");
        guestlist[msg.sender].hasVoted=true;
        guestlist[msg.sender].votedProposalId=_proposalId;
        proposals[_proposalId].voteCount++;
        emit Voted(msg.sender, _proposalId);
    }

    /**
    * @dev Owner ends session of votes
    */
    function endVoting() external onlyOwner{
        require(voteStatus==WorkflowStatus.VotingSessionStarted, "Status must be VotingSessionStarted");
        voteStatus=WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, voteStatus);
    }

    /**
    * @dev Owner starts session of counting votes
    */
    function startCountVotes() external onlyOwner{
        require(voteStatus==WorkflowStatus.VotingSessionEnded, "Status must be VotingSessionEnded");
        voteStatus=WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, voteStatus);
    }

    /**
    * @dev Owner calculate results of votes
    */
    function countVotes() external onlyOwner {
        require(voteStatus==WorkflowStatus.VotesTallied, "Status must be VotesTallied");
            uint maxvotes = 0;
            for (uint i=0; i<proposalId;i++) {
                if (proposals[i].voteCount > maxvotes){
                    delete (winners);
                    winners.push(proposals[i]);
                    maxvotes = proposals[i].voteCount;}
                else if(proposals[i].voteCount == maxvotes) {
                    winners.push(proposals[i]);
                }
            } 
    }

    /**
    * @dev Registered account can see vote of other registered who already voted
    */
    function getVote(address _address) external view onlyRegistered returns(uint) {
        require(guestlist[msg.sender].hasVoted, "Account didn't vote yet or not allowed to");
        return guestlist[_address].votedProposalId;
    }

    /**
    * @dev Everyone can display result of winner(s) of the vote 
    */
    function getWinner() external view returns (Proposal[] memory){
        require(winners.length>0, "Winner(s) not chosen yet");
        return winners;
    }

}
