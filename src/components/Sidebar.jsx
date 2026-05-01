import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Database, FileCode2, Settings, Shirt, Flag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Roster Maker 26', path: '/roster-maker', icon: <Users size={20} /> },
    { name: 'Team Maker', path: '/team-maker', icon: <Database size={20} /> },
    { name: 'Badge Creator', path: '/badge-creator', icon: <FileCode2 size={20} /> },
    { name: 'Minikit Creator', path: '/minikit-creator', icon: <Shirt size={20} /> },
    { name: 'Multi-Nation Generator', path: '/multi-nation', icon: <Flag size={20} /> },
  ];

  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 70, damping: 20 }}
      className="glass-panel" 
      style={{ 
        width: '280px', 
        height: '100vh', 
        position: 'fixed', 
        left: 0, 
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '2.5rem 1.5rem',
        borderRadius: '0 24px 24px 0',
        borderLeft: 'none',
        zIndex: 50
      }}
    >
      <div style={{ marginBottom: '4rem', display: 'flex', alignItems: 'center', gap: '15px', paddingLeft: '10px' }}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ width: '36px', height: '36px', background: 'var(--accent-color)', borderRadius: '10px', boxShadow: '0 0 20px var(--accent-glow)' }}
        />
        <h2 style={{ fontSize: '1.4rem', fontWeight: '600', letterSpacing: '1px' }}>FC-Maker by Achira</h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
        {menuItems.map((item) => (
          <NavLink key={item.name} to={item.path} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '1rem 1.2rem',
                  borderRadius: '12px',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  border: isActive ? '1px solid var(--glass-border)' : '1px solid transparent',
                  boxShadow: isActive ? '0 4px 20px rgba(0,0,0,0.2)' : 'none'
                }}
              >
                {React.cloneElement(item.icon, { color: isActive ? 'var(--accent-color)' : 'currentColor' })}
                <span style={{ fontSize: '0.95rem', fontWeight: isActive ? '600' : '500' }}>{item.name}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <motion.button 
          whileHover={{ scale: 1.02, x: 5, color: '#fff' }}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px', background: 'none', border: 'none', 
            color: 'var(--text-muted)', cursor: 'pointer', padding: '1rem 1.2rem', width: '100%', textAlign: 'left',
            borderRadius: '12px'
          }}
        >
          <Settings size={20} />
          <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>System Settings</span>
        </motion.button>
      </div>
    </motion.div>
  );
}