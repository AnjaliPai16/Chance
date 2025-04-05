"use client";
import Launcher from "../Pages/launcher";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Contact from "../Pages/ContactUs";
import contractABI from "../contract_data/GetSet.json";
import contractAddress from "../contract_data/GetSet-address.json";
import Navbar from "../Pages/navbar";
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
export default function Page() {
  const [value, setValue] = useState(""); 
  const [retrievedValue, setRetrievedValue] = useState(null);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [userBalance, setUserBalance] = useState(null);
  const router = createBrowserRouter([


    {
      path: "/",
      element:<Launcher />      ,
    },
    {
      path: "/ContactUs",
      element: <Contact />,
    },
  ]);

  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      
      <RouterProvider router={router} />
    </div>
  );
}
