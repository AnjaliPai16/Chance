import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./components/ui/card.jsx";
import { Input } from "./components/ui/input.jsx";
import { Button } from "./components/ui/button.jsx";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react"; // Icon library
import "./App.css"


import Navbar from "../navbar.jsx";

const shows = [
  {
    title: "Mines",
    description:
      "Uncover tiles, avoid hidden mines. Each safe pick boosts your payout — hit a mine and you lose. Cash out anytime!",
    image: "/mines_img.jpg",
    category: "Available games",
    path:"./Mines"
  },
  {
    title: "High Low",
    description:
      "Pick a number, roll the dice. The closer your guess, the bigger the win. Simple, fast, and thrilling!",
    image: "/highlow.png",
    category: "Available games",
    path:"./highlow"
  },
  {
    title: "Spin Wheel",
    description:
      "Spin the wheel, land on a multiplier. Bigger risks, bigger rewards. Pure luck, instant thrills!",
    image: "/Wheel.png",
    category: "Available games",
    path:"./SpinWheel"
  },
  {
    title: "Black Jack",
    description:
      "Spin the wheel, land on a multiplier. Bigger risks, bigger rewards. Pure luck, instant thrills!",
    image: "/house_of_cards.jpg",
    category: "Available games",
    path:"./SpinWheel"
  },
];

const groupedShows = shows.reduce((acc, show) => {
  acc[show.category] = acc[show.category] || [];
  acc[show.category].push(show);
  return acc;
}, {});

export default function NetflixUIClone() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [hoveredGame, setHoveredGame] = useState(shows[0]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold">
          Loading games 🎲...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-10">
      {/* === Navbar === */}
      <header className="py-4 bg-black sm:py-6 min-w-full">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="shrink-0">
            <a href="#" className="flex">
              <img
                className="w-12 max-w-10 mx-auto md:max-w-md"
                src="https://landingfoliocom.imgix.net/store/collection/dusk/images/hero/1/3d-illustration.png"
                alt=""
              />
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500 m-2 mx-5 text-2xl font-bold">
                Chance
              </p>
            </a>
          </div>

          <div className="flex md:hidden">
            <button
              type="button"
              className="text-white"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
            >
              {!expanded ? (
                <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          <nav className="hidden md:flex md:items-center md:justify-end md:space-x-12">
  <a
    href="/launcher"
    className="text-base font-normal text-gray-400 transition-all duration-200 hover:text-white"
  >
    Home
  </a>
  <a
    href="/ContactUs"
    className="text-base font-normal text-gray-400 transition-all duration-200 hover:text-white"
  >
    Bets
  </a>
  <a
    href="./games"
    className="text-base font-normal text-gray-400 transition-all duration-200 hover:text-white"
  >
    Games
  </a>
  <a
    href="/ContactUs"
    className="text-base font-normal text-gray-400 transition-all duration-200 hover:text-white"
  >
    Contact us
  </a>
</nav>

        </div>

        {expanded && (
          <nav className="hidden md:flex md:items-center md:justify-end md:space-x-12">
          <a
            href="/launcher"
            className="text-base font-normal text-gray-400 transition-all duration-200 hover:text-white"
          >
            Home
          </a>
          <a
            href="/ContactUs"
            className="text-base font-normal text-gray-400 transition-all duration-200 hover:text-white"
          >
            Bets
          </a>
          <a
            href="./games"
            className="text-base font-normal text-gray-400 transition-all duration-200 hover:text-white"
          >
            Games
          </a>
          <a
            href="/ContactUs"
            className="text-base font-normal text-gray-400 transition-all duration-200 hover:text-white"
          >
            Contact us
          </a>
        </nav>
        
        )}
      </div>
    </header>
      {/* === Hero Section === */}
      <div
        className="relative h-[60vh] w-full bg-cover bg-center transition-all duration-500"
        style={{ backgroundImage: `url(${hoveredGame?.image || "/default.jpg"})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black p-6 flex flex-col justify-end">
          <motion.h1 className="text-4xl md:text-5xl font-bold mb-2" key={hoveredGame?.title}>
            {hoveredGame?.title}
          </motion.h1>
          <motion.p className="text-md md:text-lg text-gray-300 max-w-2xl" key={hoveredGame?.description}>
            {hoveredGame?.description}
          </motion.p>
        </div>
      </div>

      {/* === Search Bar === */}
      <div className="p-4">
        <Input
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-800 text-white"
        />
      </div>

      {/* === Game Carousel === */}
      <div className="mt-auto p-4">
        {Object.entries(groupedShows).map(([category, shows], idx) => (
          <div key={idx} className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">{category}</h2>
            <div className="flex space-x-4 overflow-x-auto pb-2 relative after:absolute after:right-0 after:top-0 after:bottom-0 after:w-10 after:bg-gradient-to-l after:from-black">
              {shows
                .filter((show) => show.title.toLowerCase().includes(search.toLowerCase()))
                .map((show, i) => (
                  <a href={show.path}>
                    <motion.div
                    key={i}
                    className="min-w-[200px] cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onMouseEnter={() => setHoveredGame(show)}
                    onClick={() => {setSelectedGame(show); console.log(show);
                      
                    }}
                    
                  >
                    <Card className="bg-zinc-800">
                      <img
                        src={show.image}
                        alt={show.title}
                        className="w-full h-48 object-cover rounded-t-2xl"
                      />
                      <CardContent className="p-4">
                      
                        {show.description && (
                          <p className="text-sm text-gray-400 mt-2">{show.description}</p>
                        )}
                      </CardContent>
                    </Card>
                    
                  </motion.div>
                  </a>
                  
                ))}
            </div>
          </div>
        ))}
      </div>

      
      
    </div>
  );
}
