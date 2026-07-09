import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Models from './components/Models';
import Usage from './components/Usage';
import Footer from './components/Footer';
import './App.css';
function App() {
  return (
    <div className="app-landing">
      <Navbar />
      <Hero />
      <Features />
      <Models />
      <Usage />
      <Footer />
    </div>
  );
}
export default App;
