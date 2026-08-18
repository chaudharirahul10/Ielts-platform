import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../context/authStore';

const TITLES = {'/dashboard':'Dashboard','/listening':'Listening Module','/reading':'Reading Module','/writing':'Writing Module','/speaking':'Speaking Module','/vocabulary':'Vocabulary Builder','/study-plan':'AI Study Plan','/mock-tests':'Mock Tests','/leaderboard':'Leaderboard','/analytics':'Analytics','/admin':'Admin Panel','/profile':'Profile'};

export default function Topbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  return (
    <div style={{ height:'var(--topbar-height)', background:'var(--bg2)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', padding:'0 24px', gap:14, position:'sticky', top:0, zIndex:50 }}>
      <div style={{ fontSize:15, fontWeight:600, flex:1 }}>{TITLES[pathname]||'IELTSPro'}</div>
      <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', display:'flex', alignItems:'center', gap:8, padding:'6px 12px', width:210 }}>
        <span style={{ color:'var(--text3)', fontSize:13 }}>🔍</span>
        <input placeholder="Search…" style={{ background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, width:'100%', fontFamily:'var(--font)' }} />
      </div>
      <button onClick={() => navigate('/mock-tests')} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'6px 14px', color:'var(--text2)', fontSize:13, cursor:'pointer', fontFamily:'var(--font)' }}>
        ▶ Mock Test
      </button>
      <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(79,142,247,.12)', border:'1px solid rgba(79,142,247,.25)', borderRadius:20, padding:'4px 12px' }}>
        <span style={{ fontSize:11, color:'var(--text2)' }}>Band</span>
        <span style={{ fontSize:14, fontWeight:700, color:'var(--blue)' }}>{user?.scores?.overall||'—'}</span>
      </div>
    </div>
  );
}
