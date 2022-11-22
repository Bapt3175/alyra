import { useRef, useEffect, useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function Contract({  session, winner }) {
  const spanEle = useRef(null);
  //const [EventValue, setEventValue] = useState("");
  //const [oldEvents, setOldEvents] = useState();
 
  const { state: { contract, accounts } } = useEth();

  


  return (
    <code>
          <div className="addr">
        Your Address:
        <br />
        {accounts && accounts[0] && <pre>{accounts[0]}</pre>}
    </div>

    <div>
  Session : 
<span className="secondary-color" ref={spanEle}>
  <strong>{session}</strong>
</span>
</div>
<h3>
  Winner : 
  </h3>
  <div>
<span className="secondary-color" ref={spanEle}>
  <strong>{winner}</strong>
</span>
</div>
  </code>
  );
}

export default Contract;
