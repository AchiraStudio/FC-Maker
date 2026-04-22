import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Database, FileCode2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const navigate = useNavigate();

  const tools = [
    { title: 'Roster Maker 26', description: 'FC 26 automated player generation engine.', icon: <Users size={36} color="var(--accent-color)" />, path: '/roster-maker', active: true },
    { title: 'Team Maker', description: 'Automated Transfermarkt data extraction to Excel.', icon: <Database size={36} color="var(--accent-color)" />, path: '/team-maker', active: true },
    { title: 'Log Viewer', description: 'Module offline. Pending development.', icon: <FileCode2 size={36} color="var(--text-muted)" />, path: '#', active: false },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '300', marginBottom: '0.5rem', letterSpacing: '-1px' }}>Hub Overview</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>Select a FC-Maker tool to begin your workflow.</p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}
      >
        {tools.map((tool, idx) => (
          <motion.div 
            key={idx} 
            variants={item}
            whileHover={tool.active ? { scale: 1.03, y: -5, boxShadow: '0 15px 30px rgba(0, 255, 204, 0.1)' } : {}}
            whileTap={tool.active ? { scale: 0.98 } : {}}
            className="glass-panel" 
            style={{ 
              cursor: tool.active ? 'pointer' : 'default', 
              opacity: tool.active ? 1 : 0.5,
              padding: '2rem',
              border: tool.active ? '1px solid rgba(0, 255, 204, 0.2)' : '1px solid var(--glass-border)'
            }}
            onClick={() => tool.active && navigate(tool.path)}
          >
            <div style={{ marginBottom: '1.5rem' }}>{tool.icon}</div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '500' }}>{tool.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>{tool.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}