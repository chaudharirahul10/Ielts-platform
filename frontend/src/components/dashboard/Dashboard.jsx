import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chart, registerables } from 'chart.js';
import { analyticsAPI } from '../../services/api';
import useAuthStore from '../../context/authStore';

Chart.register(...registerables);

const MODULES = [
  { id:'listening', icon:'🎧', label:'Listening', color:'var(--teal)', path:'/listening', desc:'Section 3 — Academic Discussion' },
  { id:'reading', icon:'📖', label:'Reading', color:'var(--green)', path:'/reading', desc:'True/False/Not Given' },
  { id:'writing', icon:'✍️', label:'Writing', color:'var(--purple)', path:'/writing', desc:'Task 2 — Opinion Essays' },
  { id:'speaking', icon:'🎤', label:'Speaking', color:'var(--amber)', path:'/speaking', desc:'Part 2 — Cue Card Practice' },
];

function Card({ children, style={}, hover, onClick }) {
  return (
    <div onClick={onClick} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:18, transition:'all .2s', cursor:onClick?'pointer':undefined, ...style }}
      onMouseEnter={hover ? e => e.currentTarget.style.borderColor='var(--blue)' : undefined}
      onMouseLeave={hover ? e => e.currentTarget.style.borderColor='var(--border)' : undefined}>
      {children}
    </div>
  );
}

function Progress({ pct=0, color='var(--blue)', h=6 }) {
  return <div style={{ background:'var(--bg3)', borderRadius:10, height:h, overflow:'hidden' }}>
    <motion.div initial={{ width:0 }} animate={{ width:`${pct}%`}} transition={{ duration:.6, ease:'easeOut' }} style={{ height:'100%', background:color, borderRadius:10 }}/>
  </div>;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const scores = user?.scores || {};

  useEffect(() => {
    if (!chartRef.current) return;
    chartInstance.current?.destroy();
    chartInstance.current = new Chart(chartRef.current, {
      type:'line',
      data:{ labels:['W1','W2','W3','W4','W5','W6','W7','W8'], datasets:[
        {label:'Listening',data:[5,5.5,5.5,6,6,6.5,6.5,6.5],borderColor:'#2dd4bf',tension:.4,pointRadius:3,borderWidth:2,fill:false},
        {label:'Reading',data:[5.5,6,6,6.5,7,7,7,7],borderColor:'#22c55e',tension:.4,pointRadius:3,borderWidth:2,fill:false},
        {label:'Writing',data:[5,5,5.5,5.5,5.5,6,6,6],borderColor:'#a855f7',tension:.4,pointRadius:3,borderWidth:2,fill:false},
        {label:'Speaking',data:[5.5,5.5,6,6,6.5,6.5,6.5,6.5],borderColor:'#f59e0b',tension:.4,pointRadius:3,borderWidth:2,fill:false},
      ]},
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:true, position:'bottom', labels:{ color:'#8a9ab5', boxWidth:10, padding:14, font:{size:11} } } }, scales:{ x:{ grid:{color:'rgba(255,255,255,.05)'}, ticks:{color:'#8a9ab5',font:{size:10}} }, y:{ grid:{color:'rgba(255,255,255,.05)'}, ticks:{color:'#8a9ab5',font:{size:10}}, min:4, max:9 } } },
    });
    return () => chartInstance.current?.destroy();
  }, []);

  const metrics = [
    {icon:'🎯',label:'Overall Band',val:scores.overall||'—',color:'var(--blue)',change:'+0.5 this month',up:true},
    {icon:'📖',label:'Reading',val:scores.reading||'—',color:'var(--green)',change:'+1.0 this week',up:true},
    {icon:'✍️',label:'Writing',val:scores.writing||'—',color:'var(--purple)',change:'Needs improvement',up:false},
    {icon:'🎤',label:'Speaking',val:scores.speaking||'—',color:'var(--amber)',change:'+0.5 improving',up:true},
  ];

  const weakAreas = [
    {name:'Writing Task 2',pct:45,color:'var(--red)'},
    {name:'Matching Headings',pct:52,color:'var(--red)'},
    {name:'Pronunciation',pct:58,color:'var(--amber)'},
    {name:'Listening Sec 4',pct:62,color:'var(--amber)'},
  ];

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700 }}>Good morning, {user?.name?.split(' ')[0]||'Student'} 👋</h1>
        <p style={{ fontSize:13, color:'var(--text2)', marginTop:4 }}>Target Band {user?.targetBand||7.0} · {user?.examDate?`Exam: ${new Date(user.examDate).toLocaleDateString()}`:'Set your exam date'}</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {metrics.map((m,i) => (
          <motion.div key={m.label} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*.07 }}>
            <Card><div style={{ fontSize:22,marginBottom:8 }}>{m.icon}</div><div style={{ fontSize:28,fontWeight:800,color:m.color,lineHeight:1 }}>{m.val}</div><div style={{ fontSize:12,color:'var(--text2)',marginTop:4 }}>{m.label}</div><div style={{ fontSize:11,marginTop:6,color:m.up?'var(--green)':'var(--red)' }}>{m.up?'↑':'↓'} {m.change}</div></Card>
          </motion.div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:16 }}>
        <Card><div style={{ fontSize:15,fontWeight:600,marginBottom:14 }}>Score Progress (Last 8 Weeks)</div><div style={{ height:200 }}><canvas ref={chartRef}/></div></Card>
        <Card>
          <div style={{ fontSize:15,fontWeight:600,marginBottom:14 }}>Band Breakdown</div>
          {MODULES.map(m => (
            <div key={m.id} style={{ marginBottom:12 }}>
              <div style={{ display:'flex',justifyContent:'space-between',fontSize:12.5,marginBottom:4 }}>
                <span style={{ color:'var(--text2)' }}>{m.icon} {m.label}</span>
                <span style={{ fontWeight:700,color:m.color }}>{scores[m.id]||'—'}</span>
              </div>
              <Progress pct={((scores[m.id]||0)/9)*100} color={m.color}/>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:20 }}>
        <Card style={{ textAlign:'center' }}>
          <div style={{ fontSize:32,marginBottom:6 }}>🔥</div>
          <div style={{ fontSize:38,fontWeight:800,background:'var(--grad)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>{user?.streak||0}</div>
          <div style={{ fontSize:12,color:'var(--text2)' }}>Day Streak</div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginTop:14 }}>
            {Array.from({length:21},(_,i)=><div key={i} style={{ aspectRatio:1,borderRadius:3,background:i<(user?.streak||0)?'var(--green)':i===(user?.streak||0)?'var(--blue)':'var(--bg3)' }}/>)}
          </div>
        </Card>
        <Card style={{ textAlign:'center' }}>
          <div style={{ fontSize:28,marginBottom:4 }}>⏱️</div>
          <div style={{ fontSize:30,fontWeight:800,background:'var(--grad2)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>{Math.floor((user?.totalStudyTimeMin||0)/60)}h</div>
          <div style={{ fontSize:12,color:'var(--text2)',marginBottom:12 }}>Total Study Time</div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
            {[['Tests Done',user?.testsCompleted||0],['Questions',user?.totalQuestionsAnswered||0]].map(([l,v])=>(
              <div key={l} style={{ background:'var(--bg3)',borderRadius:'var(--radius-sm)',padding:10,textAlign:'center' }}>
                <div style={{ fontSize:18,fontWeight:700 }}>{v}</div>
                <div style={{ fontSize:11,color:'var(--text3)' }}>{l}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ fontSize:14,fontWeight:600,marginBottom:12 }}>🎯 Weak Areas</div>
          {weakAreas.map(w=>(
            <div key={w.name} style={{ marginBottom:10 }}>
              <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:3 }}>
                <span style={{ color:'var(--text2)' }}>{w.name}</span>
                <span style={{ color:w.color,fontWeight:600 }}>{w.pct}%</span>
              </div>
              <Progress pct={w.pct} color={w.color} h={5}/>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ fontSize:16,fontWeight:600,marginBottom:14 }}>Continue Learning</div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14 }}>
        {MODULES.map((m,i)=>(
          <motion.div key={m.id} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:.3+i*.08 }}>
            <Card hover onClick={()=>navigate(m.path)} style={{ cursor:'pointer' }}>
              <div style={{ fontSize:28,marginBottom:10 }}>{m.icon}</div>
              <div style={{ fontSize:14,fontWeight:600,marginBottom:4 }}>{m.label}</div>
              <div style={{ fontSize:12,color:'var(--text2)',marginBottom:12 }}>{m.desc}</div>
              <span style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'2px 10px',borderRadius:10,fontSize:11.5,fontWeight:500,background:'rgba(79,142,247,.15)',color:'var(--blue)' }}>Continue</span>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
