import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';
import Dashboard from './pages/Dashboard';
import Detection from './pages/Detection';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import './components/Layout/AppShell.css';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0, 0, 0.2, 1] } },
  exit:    { opacity: 0,         transition: { duration: 0.15 } },
};

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="app-shell__main">
          <TopBar onMenuClick={() => setMobileOpen(true)} />
          <main className="app-shell__content">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={
                  <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Dashboard />
                  </motion.div>
                } />
                <Route path="/detection" element={
                  <motion.div key="detection" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Detection />
                  </motion.div>
                } />
                <Route path="/transactions" element={
                  <motion.div key="transactions" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Transactions />
                  </motion.div>
                } />
                <Route path="/analytics" element={
                  <motion.div key="analytics" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Analytics />
                  </motion.div>
                } />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
