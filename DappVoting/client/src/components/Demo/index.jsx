import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";
import Title from "./Title";
import Cta from "./Cta";
import Contract from "./Contract";
import Admin from "./Admin";
import Voters from "./Voters";
import Desc from "./Desc";
import NoticeNoArtifact from "./NoticeNoArtifact";
import NoticeWrongNetwork from "./NoticeWrongNetwork";

function Demo() {
  const { state } = useEth();
  const [winner, setWinner] = useState("");
  const [session, setSession] = useState("RegisteringVoters");
  const [visibleOwner, setVisibleOwner] = useState(true); 
  const [visibleVoter, setVisibleVoter] = useState(true); 

  const demo =
    <>
      <div className="contract-container">
        <Contract session={session} winner={winner}/>
        <Voters  setVisibleOwner={setVisibleOwner} setVisibleVoter={setVisibleVoter} visibleVoter={visibleVoter} />
        <Admin   setSession={setSession} setWinner={setWinner} visibleOwner={visibleOwner}/>
      </div>
    </>;

  return (
    <div className="demo">
      {
        !state.artifact ? <NoticeNoArtifact /> :
          !state.contract ? <NoticeWrongNetwork /> :
            demo
      }
    </div>
  );
}

export default Demo;
