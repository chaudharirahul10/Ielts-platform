import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { aiAPI } from '../../services/api';
import useAuthStore from '../../context/authStore';

const SUGGESTIONS = ['How do I improve my Writing score?','Tips for Listening Section 4?','What vocabulary should I study?','How to extend Speaking answers?'];

export default function AITutorChat() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role:'assistant', content:"Hi! I'm your AI IELTS tutor. Ask me anything about preparation, grammar, vocabulary, or test strategies! 🎓" }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const send = async (text) => {
    if (!user) {
      navigate('/login?redirect=/dashboard');
      return;
    }

    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg = { role:'user', content: msg };
    setMessages(p => [...p, userMsg]);
    setLoading(true);
    try {
      const { reply } = await aiAPI.chat([...messages, userMsg].map(m => ({ role:m.role, content:m.content })), []);
      setMessages(p => [...p, { role:'assistant', content: reply }]);
    } catch {
      setMessages(p => [...p, { role:'assistant', content:'Sorry, I had trouble connecting. Please try again.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:150 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity:0, scale:0.9, y:10 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.9, y:10 }}
            style={{ position:'absolute', bottom:64, right:0, width:320, background:'var(--card)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', boxShadow:'var(--shadow)' }}>
            <div style={{ padding:'14px 16px', background:'var(--grad)', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🤖</div>
              <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>AI Tutor</div><div style={{ fontSize:10, color:'rgba(255,255,255,.7)' }}>Always here to help</div></div>
              <button onClick={() => setIsOpen(false)} style={{ background:'none', border:'none', color:'#fff', cursor:'pointer', fontSize:18 }}>×</button>
            </div>
            <div style={{ height:260, overflowY:'auto', padding:12 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ marginBottom:10, textAlign: m.role==='user'?'right':'left' }}>
                  <div style={{ display:'inline-block', maxWidth:'85%', padding:'8px 12px', borderRadius: m.role==='user'?'12px 4px 12px 12px':'4px 12px 12px 12px', fontSize:12.5, lineHeight:1.5, background: m.role==='user'?'var(--blue)':'var(--bg3)', color: m.role==='user'?'#fff':'var(--text)' }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && <div style={{ display:'flex', gap:4, padding:'8px 12px' }}>{[0,1,2].map(i=><div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'var(--text3)', animation:`pulse 1.2s ${i*.2}s infinite` }}/>)}</div>}
              {messages.length===1 && (
                <div style={{ marginTop:8 }}>
                  {SUGGESTIONS.map(s=>(
                    <button key={s} onClick={() => send(s)} style={{ display:'block', width:'100%', textAlign:'left', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:6, padding:'6px 10px', fontSize:11.5, color:'var(--text2)', cursor:'pointer', marginBottom:4, fontFamily:'var(--font)' }}>{s}</button>
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div style={{ display:'flex', borderTop:'1px solid var(--border)', padding:10 }}>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask about IELTS…" disabled={loading} style={{ flex:1, background:'none', border:'none', outline:'none', color:'var(--text)', fontSize:13, fontFamily:'var(--font)' }} />
              <button onClick={()=>send()} disabled={loading||!input.trim()} style={{ background:'var(--blue)', border:'none', color:'#fff', borderRadius:6, padding:'4px 10px', cursor:'pointer', fontSize:13, opacity:(!input.trim()||loading)?.5:1 }}>↗</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button whileHover={{ scale:1.08 }} whileTap={{ scale:0.95 }} onClick={() => {
        if (!user) {
          navigate('/login?redirect=/dashboard');
          return;
        }
        setIsOpen(!isOpen);
      }}
        style={{ width:52, height:52, borderRadius:'50%', background:'var(--grad)', border:'none', cursor:'pointer', fontSize:24, boxShadow:'0 4px 20px rgba(79,142,247,.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {isOpen?'×':'🤖'}
      </motion.button>
    </div>
  );
}
