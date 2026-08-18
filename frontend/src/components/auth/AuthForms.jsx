import React from 'react';
import { motion } from 'framer-motion';

const GOOGLE_AUTH_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google`;

function AuthCard({ children }) {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, padding:36, width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:52, height:52, background:'var(--grad)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, margin:'0 auto 12px' }}>IELTS</div>
          <div style={{ fontSize:22, fontWeight:800, background:'var(--grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>IELTSPro</div>
          <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>AI-Powered IELTS Preparation</div>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export function LoginForm() {
  const startGoogleAuth = () => window.location.assign(GOOGLE_AUTH_URL);

  return (
    <AuthCard>
      <h2 style={{ fontSize:20, fontWeight:700, textAlign:'center', marginBottom:4 }}>Continue with Google</h2>
      <p style={{ fontSize:13, color:'var(--text2)', textAlign:'center', marginBottom:24 }}>Use your Google account to sign in or create an IELTSPro account.</p>
      <button onClick={startGoogleAuth} style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:11, display:'flex', alignItems:'center', justifyContent:'center', gap:10, cursor:'pointer', fontSize:14, color:'var(--text)', fontFamily:'var(--font)' }}>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
        Continue with Google
      </button>
    </AuthCard>
  );
}
