import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import "antd/dist/antd.css";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import "./App.css";
import { Row, Col, Button, Menu, Alert } from "antd";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useExchangePrice, useGasPrice, useUserProvider, useEventListener, useContractLoader } from "./hooks";
import { Header, Account } from "./components";
import { Transactor } from "./helpers";
//import Hints from "./Hints";
import { TimeLogger, ActivityHistory, ApproveActivity, Members } from "./views";
import { INFURA_ID, NETWORK, NETWORKS } from "./constants";

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS["ropsten"]; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;

const mainnetProvider = new JsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID);

const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new JsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

function App(props) {
  const [injectedProvider, setInjectedProvider] = useState();
  const [flagForRefetchingData, updateFlagForRefetchingData] = useState(false);
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);
  if (DEBUG) console.log("👩‍💼 selected address:", address);

  // You can warn the user if you would like them to be on a specific network
  let localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  if (DEBUG) console.log("🏠 localChainId", localChainId);
  let selectedChainId = userProvider && userProvider._network && userProvider._network.chainId;
  if (DEBUG) console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
  const price = useExchangePrice(targetNetwork, mainnetProvider, 10000);

  // The transactor wraps transactions and provides notificiations
  const gasPrice = useGasPrice(targetNetwork, "fast");
  const tx = Transactor(userProvider, gasPrice);

  // //📟 Listen for broadcast events
  // const readContracts = useContractLoader(localProvider);
  // const LogActivityEvents = useEventListener(readContracts, "TimeKeeper", "LogActivity", localProvider, 1);
  // console.log("Log Activity events:", LogActivityEvents);
  // //📟 Listen for broadcast events
  // const ApproveActivityEvents = useEventListener(readContracts, "TimeKeeper", "ApproveActivity", localProvider, 1);
  // console.log("ApproveActivity events:", ApproveActivityEvents);
  // //📟 Listen for broadcast events
  // const UpdateApproverEvents = useEventListener(readContracts, "TimeKeeper", "UpdateApprover", localProvider, 1);
  // console.log("UpdateApprover events:", UpdateApproverEvents);

  // let networkDisplay = "";
  // if (localChainId && selectedChainId && localChainId != selectedChainId && NETWORK(selectedChainId)) {
  //   networkDisplay = (
  //     <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
  //       <Alert
  //         message={"⚠️ Wrong Network"}
  //         description={
  //           <div>
  //             You have <b>{NETWORK(selectedChainId).name}</b> selected and you need to be on{" "}
  //             <b>{NETWORK(localChainId).name}</b>.
  //           </div>
  //         }
  //         type="error"
  //         closable={false}
  //       />
  //     </div>
  //   );
  // } else {
  //   networkDisplay = (
  //     <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
  //       {targetNetwork.name}
  //     </div>
  //   );
  // }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      {/* {networkDisplay} */}
      <BrowserRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link
              onClick={() => {
                setRoute("/");
              }}
              to="/"
            >
              Log Activity
            </Link>
          </Menu.Item>
          <Menu.Item key="/history">
            <Link
              onClick={() => {
                setRoute("/history");
              }}
              to="/history"
            >
              Logged Activities
            </Link>
          </Menu.Item>
          <Menu.Item key="/approve">
            <Link
              onClick={() => {
                setRoute("/approve");
              }}
              to="/approve"
            >
              Approve
            </Link>
          </Menu.Item>
          <Menu.Item key="/members">
            <Link
              onClick={() => {
                setRoute("/members");
              }}
              to="/members"
            >
              Members
            </Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
            <TimeLogger
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              updateFlagForRefetchingData={() => updateFlagForRefetchingData(!flagForRefetchingData)}
              flagForRefetchingData={flagForRefetchingData}
            />
            {/* <Contract
              name="TimeKeeper"
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            /> */}
          </Route>
          {/* <Route path="/log">
            <Hints
              address={address}
              yourLocalBalance={yourLocalBalance}
              mainnetProvider={mainnetProvider}
              price={price}
            />
          </Route> */}
          <Route path="/history">
            <ActivityHistory
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              flagForRefetchingData={flagForRefetchingData}
            />
          </Route>
          <Route path="/approve">
            <ApproveActivity
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
              updateFlagForRefetchingData={() => updateFlagForRefetchingData(!flagForRefetchingData)}
              flagForRefetchingData={flagForRefetchingData}
            />
            {/* <ExampleUI
              address={address}
              userProvider={userProvider}
              mainnetProvider={mainnetProvider}
              localProvider={localProvider}
              yourLocalBalance={yourLocalBalance}
              price={price}
              tx={tx}
              writeContracts={writeContracts}
              readContracts={readContracts}
              purpose={purpose}
              setPurposeEvents={setPurposeEvents}
            /> */}
          </Route>
          <Route path="/members">
            <Members
              signer={userProvider.getSigner()}
              provider={localProvider}
              address={address}
              blockExplorer={blockExplorer}
            />
          </Route>

          {/* <Route path="/mainnetdai">
            <Contract
              name="DAI"
              customContract={mainnetDAIContract}
              signer={userProvider.getSigner()}
              provider={mainnetProvider}
              address={address}
              blockExplorer={"https://etherscan.io/"}
            />
          </Route> */}
          {/* <Route path="/subgraph">
            <Subgraph
              subgraphUri={props.subgraphUri} 
               tx={tx}
               writeContracts={writeContracts}
               mainnetProvider={mainnetProvider}
            /> 
          </Route>
          */}
        </Switch>
      </BrowserRouter>

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userProvider={userProvider}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
      </div>
    </div>
  );
}

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

window.ethereum &&
  window.ethereum.on("chainChanged", chainId => {
    setTimeout(() => {
      window.location.reload();
    }, 1);
  });

export default App;
