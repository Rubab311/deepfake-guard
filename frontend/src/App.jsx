import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CyberLaws from "./pages/CyberLaws";
import Help from "./pages/Help";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"           element={<Home />}       />
          <Route path="/analyze"    element={<Analyze />}    />
          <Route path="/about"      element={<About />}      />
          <Route path="/faq"        element={<FAQ />}        />
          <Route path="/cyber-laws" element={<CyberLaws />}  />
          <Route path="/help"       element={<Help />}       />
          <Route path="/login"      element={<Login />}      />
          <Route path="/signup"     element={<Signup />}     />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
