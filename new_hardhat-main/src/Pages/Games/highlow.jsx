/* App.jsx */
import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import "./highlow.css";

const cardValues = [
  { code: "2", value: 2 },
  { code: "3", value: 3 },
  { code: "4", value: 4 },
  { code: "5", value: 5 },
  { code: "6", value: 6 },
  { code: "7", value: 7 },
  { code: "8", value: 8 },
  { code: "9", value: 9 },
  { code: "10", value: 10 },
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

  const startGame = () => {
    setFirstCard(drawCard());
    setSecondCard(null);
    setResult("");
    setCanGuess(true);
    setTimer(10);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
  };

  useEffect(() => {
    if (timer === 0 && canGuess) {
      setResult("Time's up! You lose!");
      setStreak(0);
      setMultiplier(1.0);
      setCanGuess(false);
      clearInterval(timerRef.current);
    }
  }, [timer, canGuess]);

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

  const cashOut = () => {
    setResult(`Cashed out: eth${(betAmount * multiplier).toFixed(2)}`);
    setScore(0);
    setStreak(0);
    setMultiplier(1.0);
    setFirstCard(null);
    setSecondCard(null);
    setCanGuess(false);
    clearInterval(timerRef.current);
  };

  return (
    <div className="main-wrapper">
      {showConfetti && <Confetti />}

      <div className="left-section">
        <div className="game-container">
          <input
            className="bet-input"
            type="text"
            placeholder="Enter your bet"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            disabled={canGuess}
          />

          <div className="buttons">
            <button onClick={startGame}>Draw First Card</button>
            <button onClick={() => makeGuess("higher")} disabled={!canGuess}>Guess Higher</button>
            <button onClick={() => makeGuess("lower")} disabled={!canGuess}>Guess Lower</button>
            <button onClick={cashOut} className="cashout-button" disabled={streak === 0}>Cash Out</button>
          </div>

          <div className="scoreboard">
            <p>Streak: {streak}</p>
            <p>Multiplier: x{multiplier}</p>
            <p>Score: Eth {score.toFixed(2)}</p>
            <p>Timer: {timer}s</p>
          </div>
        </div>
      </div>

      <div className="right-section">
        <div className="card-display">
          <img
            className="card"
            src={firstCard ? firstCard.imageUrl : "https://deckofcardsapi.com/static/img/back.png"}
            alt="First Card"
          />
          <img
            className="card"
            src={secondCard ? secondCard.imageUrl : "https://deckofcardsapi.com/static/img/back.png"}
            alt="Second Card"
          />
        </div>
        <div id="result">{result}</div>
      </div>
    </div>
  );
}

export default App;
