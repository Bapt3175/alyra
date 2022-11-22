import { useState, useEffect } from "react";
import useEth from "../../contexts/EthContext/useEth";
import { Sessions } from "./const";

function Admin({ setSession, setWinner, visibleOwner }) {
  const { state: { contract, accounts, web3 } } = useEth();
  const [inputAddress, setInputAddress] = useState("");

  const handleAddressChange = e => {
    setInputAddress(e.target.value);
  };

  useEffect(() => {
    (async function () {
 
       let oldEvents= await contract.getPastEvents('WorkflowStatusChange', {
          fromBlock: 0,
          toBlock: 'latest'
        });
        let oldies=[];
        oldEvents.forEach(event => {
            oldies.push(event.returnValues.newStatus);
        });
        if (oldies.length > 0){
        setSession(Sessions[oldies[oldies.length - 1]]);
        }
        const winner = await contract.methods.winningProposalID().call();
        setWinner(winner);
    })();
  }, [contract])


  const handleSessionChange = async e => {
    const session = await contract.methods.workflowStatus().call();
    if (session == 0){
      await contract.methods.startProposalsRegistering().send({ from: accounts[0] });
      setSession("ProposalsRegistrationStarted");
      return;
    }
    else if (session == 1){
      await contract.methods.endProposalsRegistering().send({ from: accounts[0] });
      setSession("ProposalsRegistrationEnded");
      return;
    }
    else if (session == 2){
      await contract.methods.startVotingSession().send({ from: accounts[0] });
      setSession("VotingSessionStarted");
      return;
    }
    else if (session == 3){
      await contract.methods.endVotingSession().send({ from: accounts[0] });
      setSession("VotingSessionEnded");
      return;
    }
    else if (session == 4){
      await contract.methods.tallyVotes().send({ from: accounts[0] });
      setSession("VotesTallied");
      return;
    }
  };

  const addVoter = async e => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (!web3.utils.isAddress(inputAddress)) {
      alert("invalid address");
      return;
    }
    const voter = inputAddress;
    await contract.methods.addVoter(voter).send({ from: accounts[0] });
    setInputAddress("");
  };


  const tallyVote = async e => {
    await contract.methods.tallyVotes().send({ from: accounts[0] });
  };

  return (
    <div className="btns">
      {visibleOwner &&
      <div onClick={addVoter} className="input-btn">
      addVoter(<input
          type="text"
          placeholder="string"
          value={inputAddress}
          onChange={handleAddressChange}
        />)
      </div>}
      {visibleOwner &&
      <div className="Session">
        <button onClick={tallyVote}>TallyVote</button>
      </div>}

      {visibleOwner &&
      <div className="Winner">
        <button onClick={handleSessionChange}>Change Session</button>
      </div>}

    </div>
  );
}

export default Admin;
