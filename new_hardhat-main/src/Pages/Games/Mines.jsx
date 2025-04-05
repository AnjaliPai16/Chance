"use client";
import React, { useState, useEffect } from "react";
import "./mines.css";
import "./globals.css";
import Navbar from "../navbar";
import MineSelection from "./components/ui/selection";
import { cn } from "./components/utils/cn";
import { Spotlight } from "./components/ui/Spotlight";
const factorial = (n) => {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
};

const combinations = (n, k) => {
  if (k > n) return 0;
  return factorial(n) / (factorial(k) * factorial(n - k));
};

const getMultiplier = (safePicks, totalTiles = 25, bombs = 10, houseEdge = 0.01) => {
  if(safePicks==0){
    return 0;
  }
  const totalComb = combinations(totalTiles, safePicks);
  const safeComb = combinations(totalTiles - bombs, safePicks);
  const rawMultiplier = totalComb / safeComb;
  return (rawMultiplier * (1 - houseEdge)).toFixed(2);
};

const MineGamblingGame = () => {
  const [clickedBoxes, setClickedBoxes] = useState(Array(25).fill(false));
  const [isGameOver, setIsGameOver] = useState(false);
  const [bombs, setBombs] = useState([]);
  const [selectedMines, setSelectedMines] = useState({
    id: 10,
    name: "10 Mines",
  });
  const getDiamondCount = () => {
    if (isGameOver) return 0;
    return clickedBoxes.filter((clicked, index) => clicked && !bombs.includes(index)).length;
  };
  
  const sendtocontract = ()=>{

  };
  const placeBombs = () => {
    const bombIndices = [];
    while (bombIndices.length < selectedMines.id) {
      const index = Math.floor(Math.random() * 25);
      if (!bombIndices.includes(index)) {
        bombIndices.push(index);
      }
    }
    setBombs(bombIndices);
  };

  useEffect(() => {
    placeBombs();
  }, [selectedMines]);

 
  const handleClick = (index) => {
    if (isGameOver || clickedBoxes[index] || bets == "Bet" ) return;
    const newClickedBoxes = [...clickedBoxes];
    newClickedBoxes[index] = true;
    setClickedBoxes(newClickedBoxes);

    if (bombs.includes(index)) {
      setIsGameOver(true);
    }
  };

  const resetGame = () => {
    setbets("Bet")
    setClickedBoxes(Array(25).fill(false));
    setIsGameOver(false);
    placeBombs();
  };
  const [betAmount,setBetAmount] = useState(0);
  const multi = getMultiplier(getDiamondCount(), 25, selectedMines.id);
  
  const payout = (betAmount * multi).toFixed(2);
  const [bets,setbets] = useState("Bet")
  return (
    <div className="page relative antialiased bg-grid-white ">
      
      <div className="relative z-10 ">
      <div>
        
        <h1 className="text-5xl text-white text-center font-extrabold pt-2 pb-10">
          Mines
        </h1></div>
        
        <p className="text-sm text-white text-center  ">dont refresh</p>

        <div className="flex flex-row-reverse items-baseline justify-around ">
          
          <div className="grid bg-gray-800 ">
            {clickedBoxes.map((clicked, index) => (
              <div
                key={index}
                className={`box ${clicked ? "clicked" : ""}`}
                onClick={() => handleClick(index)}
              >
                {clicked && bombs.includes(index) && (
                  <img
                    src="https://static.vecteezy.com/system/resources/thumbnails/009/350/665/small_2x/explosive-bomb-black-png.png"
                    alt="bomb"
                  />
                )}
                {clicked && !bombs.includes(index) && (
                  <img
                    src="https://freepngimg.com/thumb/diamond/30147-1-diamond-vector-clip-art-thumb.png"
                    alt="diamond"
                  />
                )}
              </div>
            ))}

            <div>
              <button
                className="group/button rounded-lg bg-[#222222] text-black mt-6"
                onClick={resetGame}
              >
                <span className="block -translate-x-1 -translate-y-1 rounded-lg border-2 border-[#222222] bg-green-400 px-4 py-1 text-sm font-medium tracking-tight transition-all group-hover/button:-translate-y-2 group-active/button:translate-x-0 group-active/button:translate-y-0">
                  Reset Game
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <MineSelection
              selectedMines={selectedMines}
              setSelectedMines={setSelectedMines}
            />
            <br />
            <input placeholder="Bet" id="BetAmt"type="number" onChange={(e) => setBetAmount(e.target.value)}/>
            <div>
              <button
                className="group/button rounded-lg bg-[#222222] text-black mt-6"
                onClick={() =>
                {
                  if(bets=="Bet" && !isGameOver){
                    setbets("Cash Out");
                  }else if(bets=="Cash Out" && isGameOver) {
                    setbets("Bet");
                  }
                  if(bets=="Cash Out" && !isGameOver){
                    alert(payout);
                    setbets("Bet")
                  }
                }
                  
                }
              >
                <span className="block -translate-x-1 -translate-y-1 rounded-lg border-2 border-[#222222] bg-green-400 px-4 py-1 text-2xl font-medium tracking-tight transition-all group-hover/button:-translate-y-2 group-active/button:translate-x-0 group-active/button:translate-y-0">
                  {bets}
                </span>
              </button>
            </div>
            {isGameOver && (
              <p className="pixelify-sans text-6xl text-red-600 mt-4">
                Game Over!
              </p>
            ) }
          </div>
        </div>
      </div>
    </div>
  );
};

export default MineGamblingGame;
