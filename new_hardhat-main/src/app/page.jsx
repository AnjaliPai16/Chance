"use client";
import Launcher from "../Pages/launcher";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "../contract_data/GetSet.json";
import contractAddress from "../contract_data/GetSet-address.json";
import Contact from "../Pages/ContactUs";
export default function Page() {
  const [value, setValue] = useState(""); 
  const [retrievedValue, setRetrievedValue] = useState(null);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [userBalance, setUserBalance] = useState(null);

  // Initialize Provider, Signer, and Contract
  const initializeEthers = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected!");
      return;
    }
    
    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await _provider.getSigner();

      const _contract = new ethers.Contract(contractAddress.address, contractABI.abi, _signer);

      setProvider(_provider);
      setSigner(_signer);
      setContract(_contract);

      const accounts = await _provider.send("eth_requestAccounts", []);

      if (accounts.length > 0 && account === accounts[0]) {
        alert("Wallet Connected");
        return;
      }
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error initializing ethers:", error);
    }
  };

  // Set value in contract
  const setContractValue = async () => {
    if (!contract) return alert("Please connect wallet first!");
    try {
      const tx = await contract.set(BigInt(value)); // Convert string to BigInt
      await tx.wait(); // Wait for transaction confirmation
      alert("Value set successfully!");
    } catch (error) {
      console.error("Error setting value:", error);
    }
  };

  // Get value from contract
  const getContractValue = async () => {
    if (!contract) return alert("Please connect wallet first!");
    try {
      const result = await contract.get();
      setRetrievedValue(result.toString());
    } catch (error) {
      console.error("Error getting value:", error);
    }
  };

  // Deposit funds to the contract
  const depositFunds = async () => {
    if (!contract) return alert("Please connect wallet first!");
    try {
      const tx = await signer.sendTransaction({
        to: contractAddress.address,
        value: ethers.parseEther(depositAmount), // Convert to wei
      });
      await tx.wait();
      alert(`Deposited ${depositAmount} ETH successfully!`);
      setDepositAmount("");
    } catch (error) {
      console.error("Error depositing funds:", error);
    }
  };

  // Get user balance
  const getUserBalance = async () => {
    if (!contract) return alert("Please connect wallet first!");
    try {
      const balance = await contract.getBalance(account);
      setUserBalance(ethers.formatEther(balance)); // Convert from wei to ETH
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };



  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Launcher onConnectWallet={initializeEthers} />
      <Contact/>
    </div>
  );
}
