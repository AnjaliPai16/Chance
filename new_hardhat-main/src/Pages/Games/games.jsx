import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./components/ui/card.jsx";
import { Input } from "./components/ui/input.jsx";
import { Button } from "./components/ui/button.jsx";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react"; // Icon library

const shows = [
  {
    title: "Mines",
    description:
      "Uncover tiles, avoid hidden mines. Each safe pick boosts your payout — hit a mine and you lose. Cash out anytime!",
    image: "/house_of_cards.jpg",
    category: "Available games",
  },
  {
    title: "Dice",
    description:
      "Pick a number, roll the dice. The closer your guess, the bigger the win. Simple, fast, and thrilling!",
    image: "/house_of_cards.jpg",
    category: "Available games",
  },
  {
    title: "Spin Wheel",
    description:
      "Spin the wheel, land on a multiplier. Bigger risks, bigger rewards. Pure luck, instant thrills!",
    image: "/house_of_cards.jpg",
    category: "Available games",
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
          Loading Casino 🎲...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* === Navbar === */}
      <header className="flex items-center justify-between px-6 py-4 bg-black/70 backdrop-blur-md z-50">
        <div className="text-2xl font-bold">Chance</div>

        <nav className="hidden md:flex md:items-center md:justify-end md:space-x-12">
          {["Bets", "Home", "Contact us"].map((text) => (
            <a
              key={text}
              href="#"
              className="text-base font-normal text-gray-400 transition-all duration-200 hover:text-white"
            >
              {text}
            </a>
          ))}
        </nav>

        <button onClick={() => setExpanded(!expanded)} className="md:hidden text-white">
          {expanded ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {expanded && (
        <nav className="md:hidden bg-black px-6 pb-4">
          <div className="flex flex-col pt-4 space-y-4">
            {["Bets", "Games", "Contact us"].map((text) => (
              <a
                key={text}
                href="#"
                className="text-base font-normal text-gray-400 transition-all duration-200 hover:text-white"
              >
                {text}
              </a>
            ))}
          </div>
        </nav>
      )}

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
                  <motion.div
                    key={i}
                    className="min-w-[200px] cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onMouseEnter={() => setHoveredGame(show)}
                    onClick={() => setSelectedGame(show)}
                  >
                    <Card className="bg-zinc-800">
                      <img
                        src={show.image}
                        alt={show.title}
                        className="w-full h-48 object-cover rounded-t-2xl"
                      />
                      <CardContent className="p-4">
                        <p className="text-lg font-semibold">{show.title}</p>
                        {show.description && (
                          <p className="text-sm text-gray-400 mt-2">{show.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* === Game Modal === */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-900 p-6 rounded-2xl max-w-md"
          >
            <h3 className="text-2xl font-bold">{selectedGame.title}</h3>
            <p className="mt-2 text-gray-300">{selectedGame.description}</p>
            <Button className="mt-6" onClick={() => setSelectedGame(null)}>
              Close
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
