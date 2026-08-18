import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../../context/authStore';

Chart.register(...registerables);

const MOCK_USERS = [
  { id:1,name:'Priya Mehta',email:'priya@example.com',country:'🇮🇳',band:7.5,status:'premium',joined:'2023-11-01' },
  { id:2,name:'Zhang Wei',email:'zhang@example.com',country:'🇨🇳',band:6.5,status:'active',joined:'2023-11-15' },
  { id:3,name:'Maria Santos',email:'maria@example.com',country:'🇵🇭',band:7.0,status:'premium',joined:'2023-12-01' },
  { id:4,name:'Ahmed Hassan',email:'ahmed@example.com',country:'🇪🇬',band:6.0,status:'active',joined:'2023-12-10' },
  { id:5,name:'Yuki Tanaka',email:'yuki@example.com',country:'🇯🇵',band:7.5,status:'premium',joined:'2023-12-15' },
];
const MOCK_QS = [
  { id:1,module:'listening',text:'According to the speaker, what is the main purpose…',type:'MCQ',difficulty:'intermediate' },
  { id:2,module:'reading',text:'The passage states that sleep deprivation causes…',type:'T/F/NG',difficulty:'advanced' },
  { id:3,module:'writing',text:'Discuss both views on public health improvements…',type:'Task 2',difficulty:'intermediate' },
  { id:4,module:'speaking',text:'Describe a place you would like to visit.',type:'Cue Card',difficulty:'intermediate' },
];
const MOD_COLORS = { listening:'teal',reading:'green',writing:'purple',speaking:'amber' };

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

function Badge({ children, color='blue' }) {
  const colors = { blue:'rgba(79,142,247,.15)/var(--blue)', green:'rgba(34,197,94,.15)/var(--green)', amber:'rgba(245,158,11,.15)/var(--amber)', red:'rgba(239,68,68,.15)/var(--red)', purple:'rgba(168,85,247,.15)/var(--purple)', teal:'rgba(45,212,191,.15)/var(--teal)' };
  const [bg,fg] = (colors[color]||colors.blue).split('/');
  return <span style={{ display:'inline-flex',alignItems:'center',padding:'2px 10px',borderRadius:10,fontSize:11.5,fontWeight:500,background:bg,color:fg }}>{children}</span>;
}

export default function AdminPanel() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('Overview');
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');
  const chartRef = useRef(null);
  const chartInst = useRef(null);

  useEffect(() => {
    if (tab !== 'Overview' || !chartRef.current) return;
    chartInst.current?.destroy();
    chartInst.current = new Chart(chartRef.current, {
      type:'bar',
      data:{ labels:['Jul','Aug','Sep','Oct','Nov','Dec'], datasets:[
        {label:'Active Users',data:[8200,9100,10400,11200,12100,12847],backgroundColor:'rgba(79,142,247,.5)',borderColor:'#4f8ef7',borderWidth:1.5,borderRadius:4},
        {label:'Tests Taken',data:[1200,1400,1800,2100,2400,2800],backgroundColor:'rgba(34,197,94,.4)',borderColor:'#22c55e',borderWidth:1.5,borderRadius:4},
      ]},
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:true,position:'bottom',labels:{color:'#8a9ab5',boxWidth:10,padding:10,font:{size:11}}} }, scales:{ x:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#8a9ab5',font:{size:10}}}, y:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#8a9ab5',font:{size:10}}} } },
    });
    return () => chartInst.current?.destroy();
  }, [tab]);

  if (user?.role !== 'admin') {
    return (
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:60, textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
        <div style={{ fontSize:18, fontWeight:600 }}>Admin Access Only</div>
        <div style={{ color:'var(--text2)', marginTop:8 }}>Login as admin@ieltspro.com to access this panel.</div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const STATS = [
    {icon:'👥',label:'Total Users',value:'12,847',bg:'rgba(79,142,247,.2)'},
    {icon:'⭐',label:'Premium Users',value:'3,241',bg:'rgba(245,158,11,.2)'},
    {icon:'❓',label:'Questions',value:'5,621',bg:'rgba(168,85,247,.2)'},
    {icon:'📝',label:'Tests Today',value:'342',bg:'rgba(34,197,94,.2)'},
  ];

  return (
    <div>
      <TabBar tabs={['Overview','Users','Questions','Analytics']} active={tab} onChange={setTab} />

      {/* OVERVIEW */}
      {tab==='Overview' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
            {STATS.map((s,i) => (
              <motion.div key={s.label} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.07 }}>
                <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'16px 20px', display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ width:44,height:44,borderRadius:10,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize:22, fontWeight:700 }}>{s.value}</div>
                    <div style={{ fontSize:12, color:'var(--text2)' }}>{s.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:18 }}>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>Platform Growth (6 months)</div>
              <div style={{ height:220 }}><canvas ref={chartRef}/></div>
            </div>
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:18 }}>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>Recent Activity</div>
              {[
                {icon:'👤',action:'New registration',detail:'rahul.sharma@gmail.com',time:'2 min ago'},
                {icon:'📝',action:'Mock test submitted',detail:'Academic Test 2 — Band 7.0',time:'5 min ago'},
                {icon:'✍️',action:'Writing evaluated',detail:'Task 2 Opinion Essay — 6.5',time:'12 min ago'},
                {icon:'⭐',action:'Premium upgraded',detail:'maria.santos@example.com',time:'18 min ago'},
                {icon:'🎤',action:'Speaking submitted',detail:'Part 2 Cue Card — 7.0',time:'25 min ago'},
              ].map((a,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:i<4?'1px solid var(--border)':'none' }}>
                  <div style={{ width:30,height:30,borderRadius:8,background:'var(--bg3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0 }}>{a.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12.5, fontWeight:500 }}>{a.action}</div>
                    <div style={{ fontSize:11.5, color:'var(--text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.detail}</div>
                  </div>
                  <div style={{ fontSize:11, color:'var(--text3)', flexShrink:0 }}>{a.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* USERS */}
      {tab==='Users' && (
        <div>
          <div style={{ display:'flex', gap:12, marginBottom:16, alignItems:'center' }}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users by name or email…" style={{ width:280, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 14px', color:'var(--text)', fontSize:13.5, fontFamily:'var(--font)', outline:'none' }}/>
            <button onClick={()=>toast.success('Add user form (connect to POST /api/admin/users)')} style={{ padding:'8px 16px', background:'var(--blue)', border:'none', borderRadius:8, color:'#fff', fontSize:13, cursor:'pointer', fontFamily:'var(--font)' }}>+ Add User</button>
          </div>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'hidden' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr>
                    {['User','Country','Band','Status','Joined','Actions'].map(h=>(
                      <th key={h} style={{ background:'var(--bg3)', padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--text3)', letterSpacing:'.05em', textTransform:'uppercase', borderBottom:'1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u=>(
                    <tr key={u.id} onMouseEnter={e=>Array.from(e.currentTarget.cells).forEach(c=>c.style.background='rgba(255,255,255,.02)')} onMouseLeave={e=>Array.from(e.currentTarget.cells).forEach(c=>c.style.background='')}>
                      <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)', color:'var(--text2)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:28,height:28,borderRadius:'50%',background:'var(--grad)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:600,color:'#fff',flexShrink:0 }}>
                            {u.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div>
                            <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{u.name}</div>
                            <div style={{ fontSize:11, color:'var(--text3)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)', color:'var(--text2)' }}>{u.country}</td>
                      <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)' }}><span style={{ fontWeight:700, color:'var(--blue)' }}>{u.band}</span></td>
                      <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)' }}><Badge color={u.status==='premium'?'amber':'green'}>{u.status}</Badge></td>
                      <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)', color:'var(--text3)', fontSize:12 }}>{u.joined}</td>
                      <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={()=>toast.success(`Editing ${u.name}`)} style={{ padding:'4px 10px', background:'none', border:'1px solid var(--border)', borderRadius:6, color:'var(--text2)', fontSize:11.5, cursor:'pointer', fontFamily:'var(--font)' }}>Edit</button>
                          <button onClick={()=>{setUsers(p=>p.filter(x=>x.id!==u.id));toast.success('User removed');}} style={{ padding:'4px 10px', background:'rgba(239,68,68,.15)', border:'1px solid rgba(239,68,68,.3)', borderRadius:6, color:'var(--red)', fontSize:11.5, cursor:'pointer', fontFamily:'var(--font)' }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* QUESTIONS */}
      {tab==='Questions' && (
        <div>
          <div style={{ display:'flex', gap:10, marginBottom:16 }}>
            <button onClick={()=>toast.success('Question form — connect to POST /api/admin/questions')} style={{ padding:'8px 16px', background:'var(--blue)', border:'none', borderRadius:8, color:'#fff', fontSize:13, cursor:'pointer', fontFamily:'var(--font)' }}>+ Add Question</button>
            <button onClick={()=>toast.success('CSV bulk import — connect to file upload endpoint')} style={{ padding:'8px 16px', background:'none', border:'1px solid var(--border)', borderRadius:8, color:'var(--text2)', fontSize:13, cursor:'pointer', fontFamily:'var(--font)' }}>📤 Import CSV</button>
          </div>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'hidden' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr>
                    {['Question','Module','Type','Difficulty','Actions'].map(h=>(
                      <th key={h} style={{ background:'var(--bg3)', padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--text3)', letterSpacing:'.05em', textTransform:'uppercase', borderBottom:'1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_QS.map(q=>(
                    <tr key={q.id} onMouseEnter={e=>Array.from(e.currentTarget.cells).forEach(c=>c.style.background='rgba(255,255,255,.02)')} onMouseLeave={e=>Array.from(e.currentTarget.cells).forEach(c=>c.style.background='')}>
                      <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)', color:'var(--text2)', maxWidth:260, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{q.text}</td>
                      <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)' }}><Badge color={MOD_COLORS[q.module]}>{q.module}</Badge></td>
                      <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)', color:'var(--text2)', fontSize:12 }}>{q.type}</td>
                      <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)' }}><Badge color={q.difficulty==='advanced'?'red':'blue'}>{q.difficulty}</Badge></td>
                      <td style={{ padding:'11px 14px', borderBottom:'1px solid var(--border)' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={()=>toast.success('Edit question — connect to PUT /api/admin/questions/:id')} style={{ padding:'4px 10px', background:'none', border:'1px solid var(--border)', borderRadius:6, color:'var(--text2)', fontSize:11.5, cursor:'pointer', fontFamily:'var(--font)' }}>Edit</button>
                          <button onClick={()=>toast.success('Question soft-deleted')} style={{ padding:'4px 10px', background:'rgba(239,68,68,.15)', border:'1px solid rgba(239,68,68,.3)', borderRadius:6, color:'var(--red)', fontSize:11.5, cursor:'pointer', fontFamily:'var(--font)' }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS */}
      {tab==='Analytics' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {[
            {title:'Module Completion Rates',labels:['Listening','Reading','Writing','Speaking'],data:[85,72,68,61],colors:['#2dd4bf','#22c55e','#a855f7','#f59e0b']},
            {title:'Avg Band Score by Country',labels:['India','China','Philippines','Egypt','Japan'],data:[7.2,6.8,6.5,6.3,6.0],colors:Array(5).fill('#4f8ef7')},
          ].map(({ title, labels, data, colors }) => {
            const ref = useRef(null);
            useEffect(() => {
              if (!ref.current) return;
              const c = new Chart(ref.current, { type:'bar', data:{ labels, datasets:[{data,backgroundColor:colors,borderRadius:4}] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#8a9ab5',font:{size:10}}}, y:{grid:{color:'rgba(255,255,255,.05)'},ticks:{color:'#8a9ab5',font:{size:10}}} } } });
              return () => c.destroy();
            }, []);
            return (
              <div key={title} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:18 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:14 }}>{title}</div>
                <div style={{ height:200 }}><canvas ref={ref}/></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
