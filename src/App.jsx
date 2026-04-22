import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RosterMaker from './pages/RosterMaker';
import TeamMaker from './pages/TeamMaker';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/roster-maker" element={<RosterMaker />} />
          <Route path="/team-maker" element={<TeamMaker />} />
        </Routes>
      </Layout>
    </Router>
  );
}