import { useState, useCallback, useEffect } from 'react'

import Web3 from 'web3'

import StorageABI from './contracts/storage-contract.json'

import './App.css';

function App() {
  const [isConnectedWeb3, setIsConnectedWeb3] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [balance, setBalance] = useState(0)
  const [web3] = useState(new Web3(Web3.givenProvider || "ws://localhost:8545"))
  const [weiToSend, setWeiToSend] = useState(0)
  const [addressToSend, setAddressToSend] = useState("")
  const [number, setNumber] = useState(0);
  const [numberInput, setNumberInput] = useState(0);

  const [txHash, setTxHash] = useState(0)
  const [txStatus, setTxStatus] = useState("waiting for input")


  const connectToWeb3 = useCallback(
    async () => {
      if(window.ethereum) {
        try {
          await window.ethereum.request({method: 'eth_requestAccounts'})

          setIsConnectedWeb3(true)
        } catch (err) {
          console.error(err)
        }
      } else {
        alert("Install Metamask")
      }
    }
  )

  useEffect(() => {
    const getAccounts = async () => setAccounts(await web3.eth.getAccounts())
    const getBalance = async () => setBalance(await web3.eth.getBalance(accounts[0]))

    if (accounts.length == 0) getAccounts()
    if (accounts.length > 0) getBalance()
  }, [isConnectedWeb3, accounts])

  const sendEth = useCallback(
    async () => {
      await web3.eth.sendTransaction({ from: accounts[0], to: addressToSend, value: weiToSend })
    },
    [accounts, addressToSend, weiToSend]
  )

  useEffect(() => {
    const getNumber = async () => {
      const storageContract = new web3.eth.Contract(StorageABI, '0xEEbCbE87BaB901B40e83ebB9F3483f3a3A7fd15b');
      
      setNumber(await storageContract.methods.retrieve().call({from: accounts[0]}));
    }
    
    getNumber()

  }, [accounts])

  const sendNewNumber = useCallback(
    async () => {
      const storageContract = new web3.eth.Contract(StorageABI, '0xEEbCbE87BaB901B40e83ebB9F3483f3a3A7fd15b');

      setTxStatus("Processing");
      await storageContract.methods.store(numberInput).send( { from: accounts[0]})
      .once('transactionHash', function(hash){
        setTxHash(hash)
      })
      .once('confirmation', function() {
        setTxStatus("Transaction confirmed");
      })
    }, [accounts, numberInput]
  );



  return (
    <div className="App">
      <header className="App-header">
        <h1>
          Web3 Labo
        </h1>
        <h2>Connect Web3</h2>
        <div style={{display: "flex", justifyContent:"center"}}>

        {
          isConnectedWeb3
            ? <p>Connected</p>
            : <button  onClick={connectToWeb3}>Connect to web3</button>
        }
        </div>

        <div style={{display: "flex", justifyContent:"space-around"}}>
          <div> 
            <h2>Balance</h2>
            <p>{accounts[0]}</p>
            <p>{balance}wei</p>
            <h2>Send ETH</h2>
            <input type="number" onChange={e => setWeiToSend(e.target.value)} placeholder="Eth in wei" />
            <input type="text" onChange={e => setAddressToSend(e.target.value)} placeholder="address" />
            <button onClick={sendEth}>Send Eth</button>
          </div>

          <div>
            <h2>Actual number</h2>
            <p>{number}</p>
            <h2>Set Number</h2>
            <p> {txStatus} </p>
            <input type="number" onChange={e => setNumberInput(e.target.value)} placeholder="set number" />
            <button onClick={sendNewNumber}>Set number</button>
            <p>{txHash}</p>
          </div>
        </div>
        
      </header>
    </div>
  );
}

export default App;
