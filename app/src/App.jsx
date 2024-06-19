import React, { useState, useEffect } from 'react';
import ContextProvider from './Context/ContextProvider'
import './App.css'
import Navbar from './Components/Navbar'
import MintToken from './Components/mintToken'

function App() {

  return (
    <ContextProvider>
        <div className="App">
                <h1>Solana Token Management</h1>
                <Navbar />
                <MintToken/>
                {/* <TransferSPLToken/> */}
            </div>
    </ContextProvider>
  )
}

export default App
