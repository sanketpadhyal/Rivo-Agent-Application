import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Models from './components/Models';
import Usage from './components/Usage';
import Footer from './components/Footer';
import BlogPage from './components/BlogPage';
import './App.css';

function App() {
  if (window.location.pathname === '/blog') {
    return <BlogPage />;
  }

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
