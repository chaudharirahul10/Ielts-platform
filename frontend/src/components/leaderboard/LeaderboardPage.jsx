import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

const LEADERS = [
  {rank:1,name:'Priya Mehta',flag:'🇮🇳',score:8.0,change:'+0.5',study:'32h',isMe:false},
  {rank:2,name:'Zhang Wei',flag:'🇨🇳',score:7.5,change:'+0.3',study:'28h',isMe:false},
  {rank:3,name:'Maria Santos',flag:'🇵🇭',score:7.5,change:'+0.5',study:'26h',isMe:false},
  {rank:4,name:'Arjun Sharma',flag:'🇮🇳',score:6.5,change:'+0.5',study:'22h',isMe:true},
  {rank:5,name:'Ahmed Hassan',flag:'🇪🇬',score:6.5,change:'+0.3',study:'20h',isMe:false},
  {rank:6,name:'Yuki Tanaka',flag:'🇯🇵',score:6.0,change:'0.0',study:'18h',isMe:false},
  {rank:7,name:'Fatima Al-Zahra',flag:'🇸🇦',score:6.0,change:'+0.5',study:'16h',isMe:false},
  {rank:8,name:'Carlos Reyes',flag:'🇲🇽',score:5.5,change:'+0.3',study:'14h',isMe:false},
];
const MEDALS = {1:'🥇',2:'🥈',3:'🥉'};

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display:'flex', gap:4, background:'var(--bg3)', borderRadius:8, padding:4, width:'fit-content', marginBottom:20 }}>
      {tabs.map(t => (
        <button key={t} onClick={()=>onChange(t)} style={{ padding:'7px 18px', borderRadius:6, fontSize:13, fontWeight:active===t?500:400, cursor:'pointer', color:active===t?'var(--text)':'var(--text2)', background:active===t?'var(--card)':'none', border:'none', fontFamily:'var(--font)', boxShadow:active===t?'0 1px 6px rgba(0,0,0,.3)':'none', transition:'all .15s' }}>
          {t}
        </button>
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState('Weekly');

  return (
    <div>
      <TabBar tabs={['Weekly','Monthly','All Time']} active={period} onChange={setPeriod} />
      <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:20 }}>
        {/* Rankings */}
        <div>
          <div style={{ fontSize:15, fontWeight:600, marginBottom:14 }}>🏆 Top Students — {period}</div>
          {LEADERS.map((l,i) => (
            <motion.div key={l.rank} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*.05 }}>
              <div style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', borderRadius:8, background:l.isMe?'rgba(79,142,247,.08)':'var(--bg3)', border:`1px solid ${l.isMe?'var(--blue)':'transparent'}`, marginBottom:8, cursor:'pointer', transition:'all .15s' }}
                onMouseEnter={e=>{if(!l.isMe)e.currentTarget.style.background='var(--card2)';}}
                onMouseLeave={e=>{if(!l.isMe)e.currentTarget.style.background='var(--bg3)';}}>
                <div style={{ fontSize:14, fontWeight:700, width:24, textAlign:'center', color:l.rank<=3?['var(--amber)','var(--text2)','#cd7f32'][l.rank-1]:'var(--text3)', flexShrink:0 }}>
                  {MEDALS[l.rank]||l.rank}
                </div>
                <div style={{ width:32,height:32,borderRadius:'50%',background:'var(--grad)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff',flexShrink:0 }}>
                  {l.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13.5, fontWeight:500 }}>{l.flag} {l.name}{l.isMe&&<span style={{ fontSize:11, color:'var(--blue)', marginLeft:6 }}>(You)</span>}</div>
                  <div style={{ fontSize:11.5, color:'var(--text3)' }}>Study time: {l.study}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:16, fontWeight:700, color:'var(--blue)' }}>{l.score}</div>
                  <div style={{ fontSize:11, color:'var(--green)' }}>{l.change} this week</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats + Certificates */}
        <div>
          <div style={{ fontSize:15, fontWeight:600, marginBottom:14 }}>📈 Your Stats</div>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:28, textAlign:'center', marginBottom:14 }}>
            <div style={{ fontSize:56, fontWeight:900, background:'var(--grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              #{LEADERS.find(l=>l.isMe)?.rank||4}
            </div>
            <div style={{ color:'var(--text2)', fontSize:14 }}>Your global rank</div>
            <div style={{ color:'var(--green)', fontSize:13, marginTop:6 }}>↑ +2 from last week</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:16 }}>
              {[['Band Score',user?.scores?.overall||'—'],['Streak',`${user?.streak||0} days`],['Tests Done',user?.testsCompleted||0],['Study Time',`${Math.floor((user?.totalStudyTimeMin||0)/60)}h`]].map(([l,v])=>(
                <div key={l} style={{ background:'var(--bg3)', borderRadius:8, padding:10 }}>
                  <div style={{ fontSize:16, fontWeight:700, color:'var(--blue)' }}>{v}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Certificates */}
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:18 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>🎖️ Certificates Earned</div>
            {[{name:'Reading Achiever',date:'Dec 10, 2023',score:'7.0'},{name:'Writing Intermediate',date:'Nov 28, 2023',score:'6.5'}].map((c,i)=>(
              <div key={i} style={{ background:'var(--bg3)', borderRadius:8, padding:14, marginBottom:10, textAlign:'center', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', inset:6, border:'1px solid var(--border2)', borderRadius:6, pointerEvents:'none' }}/>
                <div style={{ fontSize:10, letterSpacing:'3px', textTransform:'uppercase', color:'var(--text3)', marginBottom:6 }}>Certificate of Achievement</div>
                <div style={{ fontSize:15, fontWeight:700, background:'var(--grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{user?.name||'Student'}</div>
                <div style={{ fontSize:12, color:'var(--text2)', margin:'4px 0' }}>{c.name} · {c.date}</div>
                <div style={{ fontSize:28, fontWeight:800, background:'var(--grad2)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{c.score}</div>
                <button onClick={()=>toast.success(`Downloading ${c.name} certificate PDF…`)} style={{ marginTop:8, padding:'5px 16px', background:'none', border:'1px solid var(--border)', borderRadius:6, color:'var(--text2)', fontSize:12, cursor:'pointer', fontFamily:'var(--font)' }}>
                  ⬇ Download PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
