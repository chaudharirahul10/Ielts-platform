import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../context/authStore';

const NAV = [
  { section:'Overview', items:[{to:'/dashboard',icon:'⊞',label:'Dashboard'},{to:'/analytics',icon:'📈',label:'Analytics'}] },
  { section:'IELTS Modules', items:[{to:'/listening',icon:'🎧',label:'Listening'},{to:'/reading',icon:'📖',label:'Reading'},{to:'/writing',icon:'✍️',label:'Writing'},{to:'/speaking',icon:'🎤',label:'Speaking'}] },
  { section:'Study Tools', items:[{to:'/vocabulary',icon:'📚',label:'Vocabulary'},{to:'/study-plan',icon:'📅',label:'Study Plan'},{to:'/mock-tests',icon:'📝',label:'Mock Tests'},{to:'/leaderboard',icon:'🏆',label:'Leaderboard'}] },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const allNav = [...NAV, ...(user?.role==='admin' ? [{section:'Admin',items:[{to:'/admin',icon:'🛡️',label:'Admin Panel'}]}] : [])];

  return (
    <aside style={{ width:'var(--sidebar-width)', minHeight:'100vh', background:'var(--bg2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', position:'fixed', left:0, top:0, bottom:0, zIndex:100 }}>
      <div style={{ padding:'18px 18px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{ width:36, height:36, background:'var(--grad)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🎓</div>
        <div>
          <div style={{ fontSize:16, fontWeight:800, background:'var(--grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>IELTSPro</div>
          <div style={{ fontSize:10, color:'var(--text3)', marginTop:-2 }}>AI Preparation</div>
        </div>
      </div>
      <nav style={{ padding:'10px', flex:1, overflowY:'auto' }}>
        {allNav.map(group => (
          <div key={group.section}>
            <div style={{ fontSize:10, fontWeight:600, color:'var(--text3)', letterSpacing:'.1em', textTransform:'uppercase', padding:'12px 10px 6px' }}>{group.section}</div>
            {group.items.map(item => (
              <NavLink key={item.to} to={item.to} style={({ isActive }) => ({ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:'var(--radius-sm)', marginBottom:2, fontSize:13.5, fontWeight: isActive?500:400, color: isActive?'var(--blue)':'var(--text2)', background: isActive?'rgba(79,142,247,.1)':'transparent', textDecoration:'none' })}>
                <span style={{ width:18, textAlign:'center', fontSize:15 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div style={{ padding:10, borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:10, borderRadius:'var(--radius-sm)', cursor:'pointer' }} onClick={() => navigate('/profile')}>
          <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:600, color:'#fff', flexShrink:0 }}>
            {user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()||'U'}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name||'Student'}</div>
            <div style={{ fontSize:11, color:'var(--text3)' }}>Band {user?.targetBand||7.0}</div>
          </div>
          <button onClick={e=>{e.stopPropagation();logout();navigate('/login');}} title="Logout" style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:16 }}>↩</button>
        </div>
      </div>
    </aside>
  );
}
