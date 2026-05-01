import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RosterMaker from './pages/RosterMaker';
import TeamMaker from './pages/TeamMaker';
import BadgeCreator from './pages/BadgeCreator';
import MinikitCreator from './pages/MinikitCreator';
import MultiNationGenerator from './pages/MultiNationGenerator.jsx';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/roster-maker" element={<RosterMaker />} />
          <Route path="/team-maker" element={<TeamMaker />} />
          <Route path="/badge-creator" element={<BadgeCreator />} />
          <Route path="/minikit-creator" element={<MinikitCreator />} />
          <Route path="/multi-nation" element={<MultiNationGenerator />} />
        </Routes>
      </Layout>
    </Router>
  );
}