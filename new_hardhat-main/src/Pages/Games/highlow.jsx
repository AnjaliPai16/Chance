import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import "./highlow.css";
import { ethers } from "ethers";

// Import your contract ABI and address
// Replace these with your actual contract files
import contractABI from "../../contract_data/Mines.json";
import contractAddress from "../../contract_data/Mines-address.json";

const cardValues = [
  { code: "2", value: 2 },
  { code: "3", value: 3 },
  { code: "4", value: 4 },
  { code: "5", value: 5 },
  { code: "6", value: 6 },
  { code: "7", value: 7 },
  { code: "8", value: 8 },
  { code: "9", value: 9 },
  { code: "0", value: 10 },
  { code: "J", value: 11 },
  { code: "Q", value: 12 },
  { code: "K", value: 13 },
  { code: "A", value: 14 },
];

const suits = ["H", "D", "C", "S"];

const drawCard = () => {
  const value = cardValues[Math.floor(Math.random() * cardValues.length)];
  const suit = suits[Math.floor(Math.random() * suits.length)];
  const code = value.code + suit;
  const imageUrl = `https://deckofcardsapi.com/static/img/${code}.png`;
  return {
    value: value.value,
    code,
    imageUrl,
  };
};

function App() {
  const [firstCard, setFirstCard] = useState(null);
  const [secondCard, setSecondCard] = useState(null);
  const [result, setResult] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timer, setTimer] = useState(10);
  const [canGuess, setCanGuess] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const timerRef = useRef(null);

  // Web3 and MetaMask states
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);

  // Initialize ethers and connect to MetaMask
  const initializeEthers = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected! Please install MetaMask to use this app.");
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
      setAccount(accounts[0]);
      setWalletConnected(true);

      // Get user's balance
      const balance = await _provider.getBalance(accounts[0]);
      setUserBalance(ethers.formatEther(balance));
      
      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });

    } catch (error) {
      console.error("Error initializing ethers:", error);
    }
  };

  // Connect wallet function for the button
  const connectWallet = async () => {
    await initializeEthers();
  };

  // Send bet to contract
  const placeBet = async () => {
    if (!window.ethereum || !contract || !account) {
      alert("Please connect your wallet to place a bet.");
      return false;
    }
  
    try {
      const tx = await contract.bet({
        value: ethers.parseEther(betAmount.toString()),
        gasLimit: 200000n, // using BigInt syntax as required in ethers v6
      });
  
      await tx.wait(); // wait for transaction to be mined
      console.log("Bet placed successfully!");
      
      // Update user balance after bet
      if (provider && account) {
        const balance = await provider.getBalance(account);
        setUserBalance(ethers.formatEther(balance));
      }
      
      return true;
    } catch (err) {
      console.error("Bet failed:", err);
      alert("Bet transaction failed. Please try again.");
      return false;
    }
  };

  // Cashout function to withdraw winnings
  const cashOutFromContract = async (amount) => {
    if (!window.ethereum || !contract || !account) {
      alert("MetaMask not connected properly.");
      return false;
    }
    
    try {
      const amountWei = ethers.parseEther(amount.toString());
      const tx = await contract.cashOut(amountWei);
      await tx.wait();
      console.log("Cashout successful!");
      
      // Update user balance after cashout
      if (provider && account) {
        const balance = await provider.getBalance(account);
        setUserBalance(ethers.formatEther(balance));
      }
      
      return true;
    } catch (err) {
      console.error("Cashout failed:", err);
      alert("Cashout transaction failed. Please try again.");
      return false;
    }
  };

  // Start the game
  const startGame = async () => {
    if (betAmount <= 0) {
      alert("Please enter a valid bet amount");
      return;
    }
    
    if (firstCard !== null && secondCard === null) {
      // Game already started, just continue
    } else {
      // Place bet first
      try {
        const success = await placeBet();
        if (!success) return;
        
        setFirstCard(drawCard());
        setSecondCard(null);
        setResult("");
        setCanGuess(true);
        setTimer(10);
        
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setTimer((prev) => prev - 1);
        }, 1000);
      } catch (err) {
        console.error("Failed to start game:", err);
      }
    }
  };

  // Effect to handle timer reaching zero
  useEffect(() => {
    if (timer === 0 && canGuess) {
      setResult("Time's up! You lose!");
      setScore(0);
      setStreak(0);
      setMultiplier(1.0);
      setFirstCard(null);
      setSecondCard(null);
      setCanGuess(false);
      clearInterval(timerRef.current);
    }
  }, [timer, canGuess]);

  // Make a guess (higher or lower)
  const makeGuess = (guess) => {
    if (!firstCard || !canGuess) return;
    const newCard = drawCard();
    setSecondCard(newCard);
    setCanGuess(false);
    clearInterval(timerRef.current);

    if (newCard.value === firstCard.value) {
      setResult("Draw! House wins!");
      setStreak(0);
      setScore(0);
      setMultiplier(1.0);
    } else if (
      (guess === "higher" && newCard.value > firstCard.value) ||
      (guess === "lower" && newCard.value < firstCard.value)
    ) {
      const newStreak = streak + 1;
      const newMultiplier = +(1.0 + newStreak * 0.1).toFixed(1);
      setResult("You win!");
      setScore(betAmount * newMultiplier);
      setStreak(newStreak);
      setMultiplier(newMultiplier);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      setResult("You lose!");
      setStreak(0);
      setScore(0);
      setMultiplier(1.0);
    }
  };

  // Cash out winnings
  const cashOut = async () => {
    if (streak === 0) return;
    
    const winAmount = (betAmount * multiplier).toFixed(2);
    try {
      const success = await cashOutFromContract(winAmount);
      if (success) {
        setResult(`Cashed out: ETH ${winAmount}`);
        setScore(0);
        setStreak(0);
        setMultiplier(1.0);
        setFirstCard(null);
        setSecondCard(null);
        setCanGuess(false);
        clearInterval(timerRef.current);
      }
    } catch (err) {
      console.error("Failed to cash out:", err);
    }
  };

  // Initialize wallet connection on component mount
  useEffect(() => {
    if (window.ethereum) {
      initializeEthers();
    }
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] min-h-screen overflow-hidden text-white">
      {showConfetti && <Confetti />}

      <header className="pt-6 px-8 flex justify-between items-center">
        <button 
          onClick={() => window.location.href = "/games/games"} 
          className="text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Games
        </button>
        <div className="text-center flex-1">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">High Low Card Game</h1>
          <p className="text-gray-400 mt-2">Guess if the next card will be higher or lower!</p>
        </div>
        <div className="w-32"></div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-[#1a2234] rounded-2xl shadow-lg border border-[#2a3449] p-6 transition-all duration-300 hover:shadow-xl">
            
            {/* Wallet Connection */}
            
            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 mb-5">Bets</p>

            <div className="mb-6">
              <input
                className="w-full px-4 py-3 rounded-lg bg-[#131922] border border-[#2a3449] focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-200"
                type="number"
                placeholder="Bet amount in ETH"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={canGuess || !walletConnected}
              />
            </div>

            <div className="space-y-4">
              <button 
                onClick={startGame} 
                className={`w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${(!walletConnected || canGuess) && "opacity-50 cursor-not-allowed"}`}
                disabled={!walletConnected || canGuess}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Draw First Card
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => makeGuess("higher")} 
                  disabled={!canGuess || !walletConnected} 
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${(!canGuess || !walletConnected) && "opacity-50 cursor-not-allowed"}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Higher
                </button>
                
                <button 
                  onClick={() => makeGuess("lower")} 
                  disabled={!canGuess || !walletConnected} 
                  className={`bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${(!canGuess || !walletConnected) && "opacity-50 cursor-not-allowed"}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Lower
                </button>
              </div>
              
              <button 
                onClick={cashOut} 
                disabled={streak === 0 || !walletConnected} 
                className={`w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${(streak === 0 || !walletConnected) && "opacity-50 cursor-not-allowed"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                Cash Out
              </button>
            </div>

            <div className="mt-8 bg-[#131922] rounded-xl p-4 border border-[#2a3449]">
              <h3 className="text-lg font-medium text-gray-300 mb-3">Game Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1a2234] p-3 rounded-lg">
                  <p className="text-sm text-gray-400">Streak</p>
                  <p className="text-2xl font-bold text-white">{streak}</p>
                </div>
                <div className="bg-[#1a2234] p-3 rounded-lg">
                  <p className="text-sm text-gray-400">Multiplier</p>
                  <p className="text-2xl font-bold text-green-400">x{multiplier}</p>
                </div>
                <div className="bg-[#1a2234] p-3 rounded-lg">
                  <p className="text-sm text-gray-400">Potential Win</p>
                  <p className="text-2xl font-bold text-yellow-400">{score.toFixed(2)} ETH</p>
                </div>
                <div className="bg-[#1a2234] p-3 rounded-lg">
                  <p className="text-sm text-gray-400">Timer</p>
                  <p className={`text-2xl font-bold ${timer <= 3 ? "text-red-500" : "text-blue-400"}`}>{timer}s</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-[#1a2234] rounded-2xl shadow-lg border border-[#2a3449] p-6 transition-all duration-300 hover:shadow-xl">
            <div className="flex flex-col items-center justify-center">
              <div className="flex flex-wrap justify-center items-center gap-8 my-8">
                <div className={`relative transition-all duration-500 ${firstCard ? "transform -rotate-6" : ""}`}>
                  <img
                    className="w-56 h-auto rounded-lg shadow-xl transition-transform duration-300 hover:scale-105"
                    src={firstCard ? firstCard.imageUrl : "https://deckofcardsapi.com/static/img/back.png"}
                    alt="First Card"
                  />
                  <div className="absolute -top-4 -left-4 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    First Card
                  </div>
                </div>
                
                <div className="text-4xl font-bold text-gray-500">VS</div>
                
                <div className={`relative transition-all duration-500 ${secondCard ? "transform rotate-6" : ""}`}>
                  <img
                    className="w-56 h-auto rounded-lg shadow-xl transition-transform duration-300 hover:scale-105"
                    src={secondCard ? secondCard.imageUrl : "https://deckofcardsapi.com/static/img/back.png"}
                    alt="Second Card"
                  />
                  <div className="absolute -top-4 -left-4 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    Second Card
                  </div>
                </div>
              </div>
              
              {result && (
                <div className={`mt-6 px-6 py-4 rounded-xl text-center text-2xl font-bold animate-pulse ${
                  result.includes("win") ? "bg-green-600/20 text-green-400" : 
                  result.includes("lose") || result.includes("House wins") ? "bg-red-600/20 text-red-400" : 
                  "bg-yellow-600/20 text-yellow-400"
                }`}>
                  {result}
                </div>
              )}
              
              {canGuess && (
                <div className="mt-8 text-center">
                  <div className="text-lg font-medium text-gray-300 mb-2">What's your guess?</div>
                  <div className="text-sm text-gray-400">Will the next card be higher or lower?</div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-[#1a2234] rounded-2xl shadow-lg border border-[#2a3449] p-6">
              <h3 className="text-lg font-medium text-gray-300 mb-3">How To Play</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-400">
                <li>Connect your MetaMask wallet</li>
                <li>Enter your bet amount in ETH</li>
                <li>Click "Draw First Card" to start the game</li>
                <li>Guess if the next card will be higher or lower</li>
                <li>Win to increase your streak and multiplier</li>
                <li>Cash out anytime to collect your winnings to your wallet</li>
              </ol>
              <div className="mt-4 text-sm text-gray-500">
                Remember: Aces are high, and you have 10 seconds to make your guess!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;