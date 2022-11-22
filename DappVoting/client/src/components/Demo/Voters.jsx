import { useCallback } from "react";
import { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import useEth from "../../contexts/EthContext/useEth";

function Voters({ setVisibleOwner, setVisibleVoter, visibleVoter}) {
  const { state: { contract, accounts, web3 } } = useEth();
  const [voters, setVoters] = useState([]);
  const [inputProposal, setInputProposal] = useState("");
  const [inputVote, setInputVote] = useState("");
  const [proposals, setProposals] = useState([]);
  const [oldEvents, setOldEvents] = useState({});


  const handleProposalChange = e => {
    setInputProposal(e.target.value);
  };

  const handleVoteChange = e => {
    if (/^\d+$|^$/.test(e.target.value)) {
      setInputVote(e.target.value);
    }
  };

  
  const getProposals = useCallback(async () => {
    const events = await contract.getPastEvents('ProposalRegistered', {
        fromBlock: 0,
        toBlock: 'latest'
    });

    const retrievedProposal = (event) => {
        const proposalId = event.returnValues.proposalId;
        return contract.methods.getOneProposal(proposalId).call({ from: accounts[0] })
            .then((proposal) => {
                return Object.assign({}, proposal, { proposalId: proposalId })
            });
    }

    const promises = events.map((event) => retrievedProposal(event));
    const proposals = await Promise.all(promises)

    const proposalObjects = proposals.map((proposal) => {
        return { proposalId: proposal.proposalId, description: proposal.description, voteCount: proposal.voteCount }
    });
    setProposals(proposalObjects);

}, [contract, accounts]);



  const addProposal = async e => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (inputProposal === "") {
      alert("Please enter a value to write.");
      return;
    }
    const newProposal = inputProposal;
    await contract.methods.addProposal(newProposal).send({ from: accounts[0] });
    //let proposals= listProposal;
    //proposals.push(newProposal);
    //setListProposal(proposals);
    setInputProposal("");
  };

  const addVote = async e => {
    if (e.target.tagName === "INPUT") {
      return;
    }
    if (inputVote === "") {
      alert("Please enter a proposal ID to write.");
      return;
    }
    const newVote = parseInt(inputVote);
    await contract.methods.setVote(newVote).send({ from: accounts[0] });
    setInputVote("");
  };


  const getVoters = useCallback(async () => {
    const events = await contract.getPastEvents('VoterRegistered', {
        fromBlock: 0,
        toBlock: 'latest'
    });

    const retrievedVoters= (event) => {
        const voterAddress = event.returnValues.voterAddress;
        return contract.methods.getVoter(voterAddress).call({ from: accounts[0] })
            .then((voter) => {
                return Object.assign({}, voter, { voterAddress: voterAddress })
            });
    }

    const promises = events.map((event) => retrievedVoters(event));
    const voters = await Promise.all(promises)

    const voterObjects = voters.map((voter) => {
        return { voterAddress: voter.voterAddress, hasVoted: voter.hasVoted, votedProposalId: voter.votedProposalId }
    });
    setVoters(voterObjects);

}, [contract, accounts]);


useEffect(() => {
  (async function () {
    if (contract != null) {
      const events = await contract.getPastEvents('VoterRegistered', {
        fromBlock: 0,
        toBlock: 'latest'
    });
    let votersRegistered=[];
    events.forEach(event => {
      votersRegistered.push(event.returnValues.voterAddress);
    });
      if(votersRegistered.includes(accounts[0])){
        getProposals();
        getVoters();
        setVisibleVoter(true);
        console.log(visibleVoter);
      }
      else{
        setVisibleVoter(false);
      }
      const owner = await contract.methods.owner().call({ from: accounts[0] });
      const isOwner = owner === accounts[0] ? true : false;
      if(isOwner){
        setVisibleOwner(true);
      }
      else{
        setVisibleOwner(false);
      }

  }
  })();
}, [contract, getProposals, getVoters, addProposal])

const tableVoters=voters.map(
  (element)=>{
      return( 
          
        <tr>
          <td>{element.voterAddress}</td>
          <td>{element.votedProposalId}</td>
        </tr>
          
      )
  }

)

const tableProposals=proposals.map(
  (element)=>{
      return( 
          
        <tr>
          <td>{element.proposalId}</td>
          <td>{element.description}</td>
          <td>{element.voteCount}</td>
        </tr>
          
      )
  }
)

  return (
    <div>
      {visibleVoter && 
    
    <div className="btns">
      
      <h3>Voters</h3>
       <div>        
          <table >
              <thead>
                <tr>    
                  <th>Address</th>
                  <th>Vote proposal</th>
                </tr>
              </thead>
              <tbody>
                {tableVoters}
              </tbody>
            </table>                  
        </div>

        <div onClick={addProposal} className="input-btn">
      addProposal(<input
          type="text"
          placeholder="string"
          value={inputProposal}
          onChange={handleProposalChange}
        />)
      </div>
      <h3>Proposals</h3>
        <div>        
          <table >
              <thead>
                <tr>    
                  <th>Id</th>
                  <th>Description</th>
                  <th>voteCount</th>
                </tr>
              </thead>
              <tbody>
                {tableProposals}
              </tbody>
            </table>                  
        </div>

        <div onClick={addVote} className="input-btn">
      Vote by ID(<input
          type="text"
          placeholder="string"
          value={inputVote}
          onChange={handleVoteChange}
        />)
      </div>  

      
    </div>
}
</div>
  );
}

export default Voters;
