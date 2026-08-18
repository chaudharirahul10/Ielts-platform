import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { aiAPI, studyPlanAPI } from '../../services/api';
import useAuthStore from '../../context/authStore';

function Card({ children, style={} }) {
  return <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:18, ...style }}>{children}</div>;
}

const moduleEmoji = { listening:'🎧', reading:'📖', writing:'✍️', speaking:'🎤', vocabulary:'📚', grammar:'📐' };
const moduleColor = { listening:'var(--teal)', reading:'var(--green)', writing:'var(--purple)', speaking:'var(--amber)', vocabulary:'var(--blue)', grammar:'var(--pink)' };

const DEMO_PLAN = Array.from({ length:10 }, (_,dayIdx) => ({
  date: new Date(Date.now() + dayIdx*86400000).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}),
  dayLabel: `Day ${dayIdx+1}`,
  tasks: [
    { _id:`${dayIdx}-0`, module:'listening', title:'Listening Practice — Section '+((dayIdx%4)+1), durationMin:30, isCompleted: dayIdx < 2 },
    { _id:`${dayIdx}-1`, module:'writing', title: dayIdx%2===0 ? 'Task 2 Essay Writing' : 'Task 1 Graph Description', durationMin:40, isCompleted: dayIdx < 2 },
    { _id:`${dayIdx}-2`, module:'vocabulary', title:'Vocabulary Flashcards', durationMin:15, isCompleted: dayIdx < 1 },
  ]
}));

export default function StudyPlanPage() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({ targetBand: user?.targetBand||7.5, examDate:'', studyHoursPerDay:2 });
  const [plan, setPlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [taskStates, setTaskStates] = useState({});
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  useEffect(() => {
    studyPlanAPI.getActive().then((res) => {
      if (!res.studyPlan) return;
      setPlan(res.studyPlan.days || []);
    }).catch(() => {});
  }, []);

  const generatePlan = async () => {
    if (!form.examDate) { toast.error('Please set your exam date'); return; }
    setGenerating(true);
    try {
      const res = await aiAPI.generateStudyPlan({ targetBand:form.targetBand, examDate:form.examDate, studyHoursPerDay:form.studyHoursPerDay, weakAreas:[] });
      if (res.studyPlan) { setPlan(res.studyPlan.days || []); }
      else { setPlan([]); }
      toast.success('AI study plan generated! 📅');
    } catch {
      setPlan(DEMO_PLAN);
      toast.success('Demo plan loaded — configure API for personalised plan');
    } finally { setGenerating(false); }
  };

  const toggleTask = async (dayIdx, taskId) => {
    const key = `${dayIdx}-${taskId}`;
    const previous = taskStates[key] ?? plan?.[dayIdx]?.tasks?.find((task) => task._id === taskId)?.isCompleted ?? false;
    setTaskStates(p=>({ ...p, [key]: !previous }));
    try {
      await studyPlanAPI.toggleTask(dayIdx, taskId);
    } catch (err) {
      setTaskStates(p=>({ ...p, [key]: previous }));
      toast.error(err.message || 'Could not update the task.');
    }
  };

  const weeksLeft = form.examDate ? Math.ceil((new Date(form.examDate)-new Date())/(7*24*60*60*1000)) : null;

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
        <Card>
          <div style={{ fontSize:15,fontWeight:600,marginBottom:16 }}>🤖 Generate AI Study Plan</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
            <div>
              <label style={{ display:'block', fontSize:12.5, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>Target Band</label>
              <select value={form.targetBand} onChange={set('targetBand')} style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'9px 12px', color:'var(--text)', fontSize:13.5, fontFamily:'var(--font)', outline:'none' }}>
                {['6.0','6.5','7.0','7.5','8.0','8.5','9.0'].map(b=><option key={b} value={b} style={{ background:'var(--bg2)' }}>Band {b}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12.5, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>Daily Study Hours</label>
              <select value={form.studyHoursPerDay} onChange={set('studyHoursPerDay')} style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'9px 12px', color:'var(--text)', fontSize:13.5, fontFamily:'var(--font)', outline:'none' }}>
                {['1','2','3','4'].map(h=><option key={h} value={h} style={{ background:'var(--bg2)' }}>{h} hour{h!=='1'?'s':''}/day</option>)}
              </select>
            </div>
            <div style={{ gridColumn:'span 2' }}>
              <label style={{ display:'block', fontSize:12.5, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>Exam Date</label>
              <input type="date" value={form.examDate} onChange={set('examDate')} style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'9px 12px', color:'var(--text)', fontSize:13.5, fontFamily:'var(--font)', outline:'none' }}/>
            </div>
          </div>
          <button onClick={generatePlan} disabled={generating} style={{ width:'100%', padding:'10px', background:'var(--grad)', border:'none', borderRadius:8, color:'#fff', fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'var(--font)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:generating?.7:1 }}>
            {generating?(<><div style={{ width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite' }}/>Generating plan…</>):'🤖 Generate My Study Plan'}
          </button>
        </Card>
        <Card>
          <div style={{ fontSize:15,fontWeight:600,marginBottom:14 }}>📊 Plan Overview</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
            {[['Target',`Band ${form.targetBand}`],['Daily',`${form.studyHoursPerDay}h/day`],[weeksLeft?'Weeks Left':'Duration',weeksLeft?`${weeksLeft} wk`:plan?`${plan.length} days`:'—'],['Status',plan?'✅ Active':'Not set']].map(([l,v])=>(
              <div key={l} style={{ background:'var(--bg3)', borderRadius:8, padding:12, textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:700, background:'var(--grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{v}</div>
                <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.6 }}>
            💡 The AI considers your current level, target band, available time, and weak areas to create a fully personalised daily schedule with specific tasks for each module.
          </div>
        </Card>
      </div>

      {plan && (
        <div>
          <div style={{ fontSize:15,fontWeight:600,marginBottom:16 }}>📅 Your Study Schedule</div>
          <div style={{ paddingLeft:8 }}>
            {plan.slice(0,7).map((day, dayIdx) => {
              const tasks = day.tasks || [];
              const completedCount = tasks.filter((t,ti) => taskStates[`${dayIdx}-${t._id}`] ?? t.isCompleted).length;
              const allDone = completedCount === tasks.length;
              return (
                <div key={dayIdx} style={{ borderLeft:`2px solid ${allDone?'var(--green)':'var(--blue)'}`, paddingLeft:20, paddingBottom:20, position:'relative' }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:allDone?'var(--green)':'var(--blue)', position:'absolute', left:-6, top:2 }}/>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>{day.dayLabel || day.date}</div>
                    <div style={{ fontSize:11, color:'var(--text3)' }}>{completedCount}/{tasks.length} tasks</div>
                  </div>
                  {tasks.map((task,taskIdx) => {
                    const taskId = task._id || `${dayIdx}-${taskIdx}`;
                    const isDone = taskStates[`${dayIdx}-${taskId}`] ?? task.isCompleted;
                    return (
                      <div key={taskId} onClick={()=>toggleTask(dayIdx, taskId)} style={{ display:'flex', alignItems:'center', gap:10, background:'var(--bg3)', borderRadius:8, padding:'8px 12px', marginBottom:6, cursor:'pointer', transition:'background .15s' }}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--card2)'}
                        onMouseLeave={e=>e.currentTarget.style.background='var(--bg3)'}>
                        <div style={{ width:16, height:16, borderRadius:4, border:`1.5px solid ${isDone?'var(--green)':'var(--border2)'}`, background:isDone?'var(--green)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:10, color:'#fff' }}>
                          {isDone&&'✓'}
                        </div>
                        <span style={{ fontSize:12.5, color:isDone?'var(--text3)':'var(--text)', textDecoration:isDone?'line-through':'none' }}>
                          {moduleEmoji[task.module]} {task.title}
                        </span>
                        <span style={{ marginLeft:'auto', fontSize:11.5, color:'var(--text3)', flexShrink:0 }}>{task.durationMin} min</span>
                        <span style={{ display:'inline-flex',alignItems:'center',padding:'1px 8px',borderRadius:10,fontSize:10.5,fontWeight:500,background:`rgba(${task.module==='writing'?'168,85,247':task.module==='speaking'?'245,158,11':task.module==='vocabulary'?'79,142,247':task.module==='listening'?'45,212,191':'34,197,94'},.15)`,color:moduleColor[task.module]||'var(--blue)',flexShrink:0 }}>
                          {task.module}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
