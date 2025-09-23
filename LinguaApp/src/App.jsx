import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {

  return (
    <>
      <div>
        {/*This is where the top bar should go*/}
        <TopBar />
      </div>
    
      <div className="content">
        <h1 className ="logo">Lingua Pals</h1>
        <div className="dashboard-cards">
          <Card title='Card 1' /> {/* Card 1 will be past video history */}
  
          <Card title='Card 2' /> {/* Card 2 will have the match me button */}
    
          <Card title='Card 3' /> {/* Card 3 will have stats / tbd */}
        </div>
      </div>
      
    </>
  )
}

import CompanyLogo from "/src/images/temporary_logo.jpeg"
import ProfileImg from "/src/images/profile.png"
const TopBar = ({ user_auth }) => {
  return (
    <div className="top-bar">
      <img src={CompanyLogo} className="top-bar-img" />
      <p>Whats good</p> 
      <img src={ProfileImg} alt='Profile' className="top-bar-img" />
   
    </div>
  )
}

const Card = ({ title }) => {

  return (
    <div className="card">
      <h2>{title}</h2>
    </div>
  )
}

export default App
