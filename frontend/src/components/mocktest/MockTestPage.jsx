import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const TESTS = [
  { id:1, name:'Academic Mock Test 1', modules:'Listening + Reading + Writing + Speaking', time:'2h 45min', difficulty:'Intermediate', status:'completed', score:6.5, subScores:{listening:6.0,reading:7.0,writing:6.0,speaking:7.0} },
  { id:2, name:'Academic Mock Test 2', modules:'Listening + Reading + Writing + Speaking', time:'2h 45min', difficulty:'Upper-Intermediate', status:'available' },
  { id:3, name:'Academic Mock Test 3', modules:'Listening + Reading + Writing', time:'2h 20min', difficulty:'Advanced', status:'available' },
  { id:4, name:'General Training Test 1', modules:'Listening + Reading (GT) + Writing', time:'2h 40min', difficulty:'Intermediate', status:'completed', score:7.0, subScores:{listening:7.0,reading:7.5,writing:6.5} },
  { id:5, name:'Speaking Mock 1', modules:'Part 1 + Part 2 + Part 3', time:'15 min', difficulty:'All Levels', status:'available' },
  { id:6, name:'Mini Mock — Listening', modules:'Section 1–4 Full Test', time:'30 min', difficulty:'Intermediate', status:'available' },
];

export default function MockTestPage() {
  const [activeResult, setActiveResult] = useState(null);

  const handleAction = (test) => {
    if (test.status === 'completed') { setActiveResult(test); }
    else { toast.success(`Starting: ${test.name} — in a full implementation this launches the timed test engine.`); }
  };

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:22, fontWeight:700 }}>📝 IELTS Mock Tests</div>
        <div style={{ fontSize:13, color:'var(--text2)', marginTop:4 }}>Full-length practice tests with AI scoring and detailed feedback</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
        {TESTS.map((t,i) => (
          <motion.div key={t.id} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.06 }}>
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20, cursor:'pointer', transition:'all .2s', display:'flex', flexDirection:'column', gap:10 }}
              onMouseEnter={e=>e.currentTarget.style.borderColor='var(--blue)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 10px', borderRadius:10, fontSize:11.5, fontWeight:500, background:t.status==='completed'?'rgba(34,197,94,.15)':'rgba(79,142,247,.15)', color:t.status==='completed'?'var(--green)':'var(--blue)' }}>
                  {t.status==='completed'?'✅ Completed':'📋 Available'}
                </span>
                {t.score && <div style={{ fontSize:26, fontWeight:800, color:'var(--blue)' }}>{t.score}</div>}
              </div>
              <div style={{ fontSize:15, fontWeight:600 }}>{t.name}</div>
              <div style={{ fontSize:12.5, color:'var(--text2)' }}>📚 {t.modules}</div>
              <div style={{ fontSize:12.5, color:'var(--text3)' }}>⏱️ {t.time} &nbsp;·&nbsp; 🎯 {t.difficulty}</div>
              <button onClick={() => handleAction(t)} style={{ padding:'8px', background:t.status==='completed'?'var(--bg3)':'var(--blue)', border:`1px solid ${t.status==='completed'?'var(--border)':'var(--blue)'}`, borderRadius:8, color:t.status==='completed'?'var(--text2)':'#fff', fontSize:12.5, cursor:'pointer', fontFamily:'var(--font)', fontWeight:500 }}>
                {t.status==='completed'?'📊 View Results':'▶ Start Test'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {activeResult && (
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:24 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <div style={{ fontSize:16, fontWeight:600 }}>📊 Results — {activeResult.name}</div>
              <button onClick={()=>setActiveResult(null)} style={{ padding:'5px 14px', background:'none', border:'1px solid var(--border)', borderRadius:8, color:'var(--text2)', fontSize:12.5, cursor:'pointer', fontFamily:'var(--font)' }}>← Back</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:20 }}>
              {[['Overall',activeResult.score,'--blue'],['Listening',activeResult.subScores?.listening||'—','--teal'],['Reading',activeResult.subScores?.reading||'—','--green'],['Writing',activeResult.subScores?.writing||'—','--purple'],['Speaking',activeResult.subScores?.speaking||'—','--amber']].map(([m,s,c])=>(
                <div key={m} style={{ textAlign:'center', background:'var(--bg3)', borderRadius:8, padding:16 }}>
                  <div style={{ fontSize:28, fontWeight:800, color:`var(${c})` }}>{s}</div>
                  <div style={{ fontSize:12, color:'var(--text2)', marginTop:4 }}>{m}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>toast.success('AI feedback report is being generated…')} style={{ padding:'8px 18px', background:'var(--grad)', border:'none', borderRadius:8, color:'#fff', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'var(--font)' }}>🤖 View AI Feedback</button>
              <button onClick={()=>toast.success('Certificate generating as PDF…')} style={{ padding:'8px 18px', background:'none', border:'1px solid var(--border)', borderRadius:8, color:'var(--text2)', fontSize:13, cursor:'pointer', fontFamily:'var(--font)' }}>⬇ Download Certificate</button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
