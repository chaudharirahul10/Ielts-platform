import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import useAuthStore from '../../context/authStore';
import { motion } from 'framer-motion';

Chart.register(...registerables);

function useChart(ref, config) {
  useEffect(() => {
    if (!ref.current) return;
    const c = new Chart(ref.current, config);
    return () => c.destroy();
  }, []);
}

function Card({ children, style={} }) {
  return <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:18, ...style }}>{children}</div>;
}

function Progress({ pct=0, color='var(--blue)' }) {
  return <div style={{ background:'var(--bg3)', borderRadius:10, height:5, overflow:'hidden' }}>
    <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:.6 }} style={{ height:'100%', background:color, borderRadius:10 }}/>
  </div>;
}

export default function Analytics() {
  const { user } = useAuthStore();
  const trendRef = useRef(null);
  const studyRef = useRef(null);
  const accuracyRef = useRef(null);
  const rankRef = useRef(null);

  useChart(trendRef, {
    type:'line',
    data:{ labels:['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12'],
      datasets:[
        {label:'Overall Band',data:[5,5,5.5,5.5,6,6,6,6.5,6.5,6.5,6.5,6.5],borderColor:'#4f8ef7',backgroundColor:'rgba(79,142,247,.08)',tension:.4,fill:true,pointRadius:3,borderWidth:2},
        {label:`Target (${user?.targetBand||7.5})`,data:Array(12).fill(user?.targetBand||7.5),borderColor:'#22c55e',borderDash:[6,4],borderWidth:1.5,pointRadius:0,fill:false},
      ]
    },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:true, position:'bottom', labels:{color:'#8a9ab5',boxWidth:10,padding:12,font:{size:11}} } }, scales:{ x:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#8a9ab5',font:{size:10}}}, y:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#8a9ab5',font:{size:10}},min:4,max:9} } },
  });

  useChart(studyRef, {
    type:'doughnut',
    data:{ labels:['Reading 18h','Writing 14h','Listening 10h','Speaking 5h'],
      datasets:[{data:[18,14,10,5],backgroundColor:['#22c55e','#a855f7','#2dd4bf','#f59e0b'],borderWidth:0,hoverOffset:4}]
    },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:true,position:'right',labels:{color:'#8a9ab5',boxWidth:10,font:{size:10},padding:8}} }, cutout:'62%' },
  });

  useChart(accuracyRef, {
    type:'bar',
    data:{ labels:['MCQ','T/F/NG','Summary','Matching','Fill Blanks','Cue Card'],
      datasets:[{label:'Accuracy %',data:[78,65,72,52,80,74],backgroundColor:['#4f8ef7','#ef4444','#22c55e','#ef4444','#22c55e','#f59e0b'],borderRadius:4}]
    },
    options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#8a9ab5',font:{size:10}},min:0,max:100}, y:{grid:{display:false},ticks:{color:'#8a9ab5',font:{size:10}}} } },
  });

  useChart(rankRef, {
    type:'bar',
    data:{ labels:['W1','W2','W3','W4','W5','W6'],
      datasets:[{label:'Rank',data:[12,9,7,6,6,4],backgroundColor:'rgba(79,142,247,.5)',borderColor:'#4f8ef7',borderWidth:1.5,borderRadius:4}]
    },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#8a9ab5',font:{size:10}}}, y:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#8a9ab5',font:{size:10}},reverse:true,min:1,max:15} } },
  });

  const stats = [
    {icon:'📈',label:'Tests Completed',value:user?.testsCompleted||0,color:'var(--blue)'},
    {icon:'⏱️',label:'Study Hours',value:`${Math.floor((user?.totalStudyTimeMin||0)/60)}h`,color:'var(--teal)'},
    {icon:'❓',label:'Questions Answered',value:(user?.totalQuestionsAnswered||0).toLocaleString(),color:'var(--purple)'},
    {icon:'🎯',label:'Overall Band',value:user?.scores?.overall||'—',color:'var(--green)'},
  ];

  const weakAreas = [
    {name:'Writing Task 2 — Opinion',pct:45,tip:'Needs clearer thesis structure',color:'var(--red)'},
    {name:'Reading — Matching Headings',pct:52,tip:'Practice paragraph topic sentences',color:'var(--red)'},
    {name:'Speaking — Pronunciation',pct:58,tip:'Focus on /th/ and /v/ sounds',color:'var(--amber)'},
    {name:'Listening — Section 4',pct:62,tip:'Improve note-taking speed',color:'var(--amber)'},
    {name:'Writing Vocabulary Range',pct:65,tip:'Learn 10 advanced words daily',color:'var(--green)'},
  ];

  return (
    <div>
      {/* KPI cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {stats.map((s,i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.07 }}>
            <Card>
              <div style={{ fontSize:22, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:'var(--text2)', marginTop:4 }}>{s.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:16, marginBottom:16 }}>
        <Card><div style={{ fontSize:15,fontWeight:600,marginBottom:14 }}>Band Score Trend (12 weeks)</div><div style={{ height:200 }}><canvas ref={trendRef}/></div></Card>
        <Card><div style={{ fontSize:15,fontWeight:600,marginBottom:14 }}>Study Time by Module</div><div style={{ height:200 }}><canvas ref={studyRef}/></div></Card>
      </div>

      {/* Charts row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <Card><div style={{ fontSize:15,fontWeight:600,marginBottom:14 }}>Question Type Accuracy</div><div style={{ height:220 }}><canvas ref={accuracyRef}/></div></Card>
        <Card><div style={{ fontSize:15,fontWeight:600,marginBottom:14 }}>Leaderboard Rank Trend</div><div style={{ height:220 }}><canvas ref={rankRef}/></div></Card>
      </div>

      {/* Weak areas */}
      <Card>
        <div style={{ fontSize:15,fontWeight:600,marginBottom:4 }}>🎯 Personalised Weak Areas</div>
        <div style={{ fontSize:13,color:'var(--text2)',marginBottom:16 }}>AI-identified areas where you lose the most marks</div>
        {weakAreas.map(w => (
          <div key={w.name} style={{ marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:4 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:500 }}>{w.name}</div>
                <div style={{ fontSize:11.5, color:'var(--text3)' }}>{w.tip}</div>
              </div>
              <span style={{ display:'inline-flex',alignItems:'center',padding:'2px 10px',borderRadius:10,fontSize:11.5,fontWeight:500,background:w.pct<55?'rgba(239,68,68,.15)':w.pct<65?'rgba(245,158,11,.15)':'rgba(34,197,94,.15)',color:w.color }}>{w.pct}%</span>
            </div>
            <Progress pct={w.pct} color={w.color}/>
          </div>
        ))}
      </Card>
    </div>
  );
}
