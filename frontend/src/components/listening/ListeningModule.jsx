import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { aiAPI } from '../../services/api';

const SECTIONS = [
  {
    id:'s1', title:'Section 1 — A Conversation About Accommodation', durationSec:180,
    questions:[
      { id:'q1', type:'mcq', text:'What is the main reason the caller is looking for new accommodation?', options:['Their current lease is expiring','They want a bigger place','Their current place is too expensive','They are relocating for work'], correct:2, hint:'Listen for the caller\'s specific reason around 0:30.' },
      { id:'q2', type:'fill_blank', text:'The monthly rent for the studio apartment is £', blanks:[''], correct:['850'], suffix:'per month.' },
      { id:'q3', type:'mcq', text:'What facility does the caller specifically ask about?', options:['Swimming pool','Car parking','Gym','Laundry room'], correct:1, hint:'The caller mentions needing to park near the building.' },
    ]
  },
  {
    id:'s2', title:'Section 2 — A Talk About Museum Tours', durationSec:245,
    questions:[
      { id:'q4', type:'mcq', text:'According to the speaker, what is the main purpose of the new guided tour system?', options:['To reduce the number of staff required','To allow visitors to explore at their own pace','To provide more detailed information about each exhibit','To attract younger visitors'], correct:2, hint:'The speaker explicitly mentions "comprehensive contextual information."' },
      { id:'q5', type:'fill_blank', text:'The audio guide system was developed in partnership with a local', blanks:[''], correct:['university'], suffix:'and covers over 150 exhibits.' },
    ]
  },
  {
    id:'s3', title:'Section 3 — Academic Discussion', durationSec:310,
    questions:[
      { id:'q6', type:'mcq', text:'Both students agree that the most challenging aspect of their research project is:', options:['Finding enough academic sources','Structuring the methodology section','Interpreting the statistical results','Collaborating with their supervisor'], correct:1, hint:'Both students say "methodology was the hardest part."' },
    ]
  },
];

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display:'flex', gap:4, background:'var(--bg3)', borderRadius:8, padding:4, width:'fit-content', marginBottom:20 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{ padding:'7px 18px', borderRadius:6, fontSize:13, fontWeight:active===t.id?500:400, cursor:'pointer', color:active===t.id?'var(--text)':'var(--text2)', background:active===t.id?'var(--card)':'none', border:'none', fontFamily:'var(--font)', boxShadow:active===t.id?'0 1px 6px rgba(0,0,0,.3)':'none', transition:'all .15s' }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Progress({ pct=0, color='var(--blue)', h=6 }) {
  return (
    <div style={{ background:'var(--bg3)', borderRadius:10, height:h, overflow:'hidden' }}>
      <motion.div initial={{ width:0 }} animate={{ width:`${Math.min(100,pct)}%` }} transition={{ duration:.5 }} style={{ height:'100%', background:color, borderRadius:10 }} />
    </div>
  );
}

export default function ListeningModule() {
  const [tab, setTab] = useState('practice');
  const [sectionIdx, setSectionIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});
  const [blankInputs, setBlankInputs] = useState({});
  const [aiExplanation, setAIExplanation] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playPct, setPlayPct] = useState(0);
  const [playTime, setPlayTime] = useState(0);
  const playRef = useRef(null);

  const section = SECTIONS[sectionIdx];
  const question = section.questions[qIdx];
  const totalQ = section.questions.length;
  const fmtTime = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  const togglePlay = () => {
    if (isPlaying) {
      clearInterval(playRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playRef.current = setInterval(() => {
        setPlayTime(t => {
          const next = Math.min(t + 2, section.durationSec);
          setPlayPct((next / section.durationSec) * 100);
          if (next >= section.durationSec) { clearInterval(playRef.current); setIsPlaying(false); return 0; }
          return next;
        });
      }, 200);
    }
  };
  useEffect(() => () => clearInterval(playRef.current), []);

  const changeSection = (idx) => { setSectionIdx(idx); setQIdx(0); setAnswers({}); setChecked({}); setAIExplanation(null); setIsPlaying(false); setPlayPct(0); setPlayTime(0); clearInterval(playRef.current); };

  const selectOption = (qId, idx) => { if (!checked[qId]) setAnswers(a => ({ ...a, [qId]: idx })); };

  const checkAnswer = (q) => {
    if (q.type === 'mcq') {
      const isCorrect = answers[q.id] === q.correct;
      setChecked(c => ({ ...c, [q.id]: isCorrect }));
      if (isCorrect) toast.success('✅ Correct!');
      else toast.error(`❌ Incorrect — ${q.hint}`);
    } else {
      const userAns = (blankInputs[q.id] || '').trim().toLowerCase();
      const isCorrect = q.correct.some(c => c.toLowerCase() === userAns);
      setChecked(c => ({ ...c, [q.id]: isCorrect }));
      if (isCorrect) toast.success('✅ Correct!');
      else toast.error(`❌ Answer: ${q.correct.join(' / ')}`);
    }
  };

  const getAIExplanation = async () => {
    setLoadingAI(true);
    setAIExplanation(null);
    try {
      const userAns = question.type === 'mcq' ? (question.options[answers[question.id]] || 'No answer') : (blankInputs[question.id] || 'No answer');
      const correctAns = question.type === 'mcq' ? question.options[question.correct] : question.correct.join(' / ');
      const { explanation } = await aiAPI.explainAnswer({ questionText: question.text, userAnswer: userAns, correctAnswer: correctAns, context: question.hint });
      setAIExplanation(explanation);
    } catch {
      setAIExplanation(question.hint || 'Focus on keywords and paraphrasing when listening. The answer usually comes in the order of the questions.');
    } finally { setLoadingAI(false); }
  };

  const waveBars = Array.from({ length:40 }, (_, i) => Math.floor(Math.random() * 22 + 6));
  const answeredCount = Object.keys(answers).length + Object.keys(blankInputs).filter(k => blankInputs[k]).length;

  return (
    <div>
      <TabBar tabs={[{id:'practice',label:'Practice'},{id:'mock',label:'Full Mock Test'},{id:'analysis',label:'AI Analysis'}]} active={tab} onChange={setTab} />

      {tab !== 'practice' ? (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:40, textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>{tab==='mock'?'📝':'🤖'}</div>
          <div style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>{tab==='mock'?'Full Listening Mock Test':'AI Listening Analysis'}</div>
          <div style={{ fontSize:13, color:'var(--text2)' }}>Coming soon — complete all 4 sections with official timing and automatic scoring.</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:20 }}>
          {/* Left */}
          <div>
            {/* Section tabs */}
            <div style={{ display:'flex', gap:6, marginBottom:14 }}>
              {SECTIONS.map((s,i) => (
                <button key={s.id} onClick={() => changeSection(i)} style={{ padding:'5px 14px', fontSize:12, borderRadius:20, border:'1px solid', cursor:'pointer', fontFamily:'var(--font)', background:sectionIdx===i?'rgba(45,212,191,.15)':'transparent', borderColor:sectionIdx===i?'var(--teal)':'var(--border)', color:sectionIdx===i?'var(--teal)':'var(--text3)' }}>
                  Section {i+1}
                </button>
              ))}
            </div>

            {/* Audio Player */}
            <div style={{ background:'var(--card2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:18, marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:500, marginBottom:10 }}>🎧 {section.title}</div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                <button onClick={togglePlay} style={{ width:38, height:38, borderRadius:'50%', background:'var(--blue)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <div onClick={e => { const r=e.currentTarget.getBoundingClientRect(); const p=(e.clientX-r.left)/r.width; setPlayPct(p*100); setPlayTime(Math.floor(p*section.durationSec)); }} style={{ flex:1, height:4, background:'var(--bg)', borderRadius:2, overflow:'hidden', cursor:'pointer' }}>
                  <div style={{ height:'100%', background:'var(--blue)', width:`${playPct}%`, borderRadius:2, transition:'width .1s' }}/>
                </div>
                <span style={{ fontSize:11.5, color:'var(--text3)', flexShrink:0 }}>{fmtTime(playTime)} / {fmtTime(section.durationSec)}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:2, height:36 }}>
                {waveBars.map((h,i) => (
                  <div key={i} style={{ width:3, height:`${h}px`, borderRadius:2, background:i/40<playPct/100?'var(--blue)':'var(--bg3)', transition:'height .1s', ...(isPlaying?{animation:`waveAnim ${.3+(i%5)*.1}s ease-in-out infinite`}:{}) }}/>
                ))}
              </div>
            </div>

            {/* Question */}
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20, marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 10px', borderRadius:10, fontSize:11.5, fontWeight:500, background:question.type==='mcq'?'rgba(79,142,247,.15)':'rgba(168,85,247,.15)', color:question.type==='mcq'?'var(--blue)':'var(--purple)' }}>
                  {question.type==='mcq'?'Multiple Choice':'Fill in the Blank'}
                </span>
                <span style={{ fontSize:12, color:'var(--text3)' }}>Q{qIdx+1} of {totalQ}</span>
              </div>
              <div style={{ fontSize:14, lineHeight:1.75, color:'var(--text)', marginBottom:16 }}>{question.text}</div>

              {question.type === 'mcq' && question.options.map((opt, i) => {
                const isSelected = answers[question.id] === i;
                const isAnswered = checked[question.id] !== undefined;
                const isCorrect = isAnswered && i === question.correct;
                const isWrong = isAnswered && isSelected && i !== question.correct;
                return (
                  <div key={i} onClick={() => selectOption(question.id, i)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:8, border:`1px solid ${isCorrect?'var(--green)':isWrong?'var(--red)':isSelected?'var(--blue)':'var(--border)'}`, background:isCorrect?'rgba(34,197,94,.08)':isWrong?'rgba(239,68,68,.08)':isSelected?'rgba(79,142,247,.08)':'var(--bg3)', cursor:isAnswered?'default':'pointer', marginBottom:8, color:isCorrect?'var(--green)':isWrong?'var(--red)':isSelected?'var(--blue)':'var(--text)', fontSize:13.5, transition:'all .15s' }}>
                    <div style={{ width:24, height:24, borderRadius:6, background:isCorrect?'var(--green)':isWrong?'var(--red)':isSelected?'var(--blue)':'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:(isSelected||isCorrect||isWrong)?'#fff':'var(--text3)', flexShrink:0 }}>
                      {isCorrect?'✓':isWrong?'✗':'ABCD'[i]}
                    </div>
                    {opt}
                  </div>
                );
              })}

              {question.type === 'fill_blank' && (
                <div style={{ fontSize:13.5, lineHeight:2, color:'var(--text)' }}>
                  {question.text}{' '}
                  <input value={blankInputs[question.id]||''} onChange={e => setBlankInputs(b=>({...b,[question.id]:e.target.value}))} placeholder="your answer" style={{ width:120, background:'var(--bg3)', border:'none', borderBottom:`2px solid ${checked[question.id]!==undefined?(checked[question.id]?'var(--green)':'var(--red)'):'var(--border2)'}`, color:'var(--text)', fontSize:13.5, padding:'2px 6px', outline:'none', fontFamily:'var(--font)' }}/>
                  {question.suffix && <span>{' '}{question.suffix}</span>}
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <button onClick={() => { setQIdx(Math.max(0,qIdx-1)); setAIExplanation(null); }} disabled={qIdx===0} style={{ padding:'7px 14px', background:'none', border:'1px solid var(--border)', borderRadius:8, color:'var(--text2)', fontSize:12.5, cursor:'pointer', fontFamily:'var(--font)', opacity:qIdx===0?.5:1 }}>← Prev</button>
              <button onClick={() => checkAnswer(question)} disabled={checked[question.id]!==undefined} style={{ padding:'7px 16px', background:'var(--blue)', border:'none', borderRadius:8, color:'#fff', fontSize:12.5, cursor:'pointer', fontFamily:'var(--font)', opacity:checked[question.id]!==undefined?.5:1 }}>Check Answer</button>
              <button onClick={() => { setQIdx(Math.min(totalQ-1,qIdx+1)); setAIExplanation(null); }} disabled={qIdx===totalQ-1} style={{ padding:'7px 14px', background:'none', border:'1px solid var(--border)', borderRadius:8, color:'var(--text2)', fontSize:12.5, cursor:'pointer', fontFamily:'var(--font)', opacity:qIdx===totalQ-1?.5:1 }}>Next →</button>
              <button onClick={getAIExplanation} disabled={loadingAI} style={{ marginLeft:'auto', padding:'7px 16px', background:'var(--grad)', border:'none', borderRadius:8, color:'#fff', fontSize:12.5, cursor:'pointer', fontFamily:'var(--font)', display:'flex', alignItems:'center', gap:6 }}>
                {loadingAI ? <><div style={{ width:13,height:13,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite' }}/> Asking AI…</> : '🤖 AI Explain'}
              </button>
            </div>
          </div>

          {/* Right */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Progress */}
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:18 }}>
              <div style={{ fontSize:13, fontWeight:500, marginBottom:8 }}>Test Progress</div>
              <Progress pct={(answeredCount/totalQ)*100} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text3)', marginTop:6 }}>
                <span>{fmtTime(Math.max(0,section.durationSec-playTime))} remaining</span>
                <span>{answeredCount} / {totalQ} answered</span>
              </div>
            </div>

            {/* Navigator */}
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:18 }}>
              <div style={{ fontSize:13, fontWeight:500, marginBottom:10 }}>Question Navigator</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6 }}>
                {section.questions.map((q,i) => {
                  const isAnswered = answers[q.id] !== undefined || blankInputs[q.id];
                  const isCurrent = i === qIdx;
                  return (
                    <div key={i} onClick={() => { setQIdx(i); setAIExplanation(null); }} style={{ aspectRatio:1, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, cursor:'pointer', background:isCurrent?'var(--blue)':isAnswered?'var(--green)':'var(--bg3)', color:(isCurrent||isAnswered)?'#fff':'var(--text3)', transition:'all .15s' }}>
                      {i+1}
                    </div>
                  );
                })}
              </div>
              <div style={{ display:'flex', gap:12, marginTop:10, fontSize:11, color:'var(--text3)' }}>
                {[['var(--green)','Answered'],['var(--blue)','Current'],['var(--bg3)','Unanswered']].map(([bg,label]) => (
                  <span key={label} style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ width:10,height:10,borderRadius:2,background:bg,display:'inline-block' }}/>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Explanation */}
            <AnimatePresence>
              {(aiExplanation || loadingAI) && (
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                  <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:18 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                      <div style={{ width:30,height:30,borderRadius:'50%',background:'var(--grad)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14 }}>🤖</div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600 }}>AI Tutor</div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>Answer Explanation</div>
                      </div>
                      <button onClick={() => setAIExplanation(null)} style={{ marginLeft:'auto', background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:16 }}>×</button>
                    </div>
                    {loadingAI
                      ? <div style={{ display:'flex', gap:4 }}>{[0,1,2].map(i=><div key={i} style={{ width:6,height:6,borderRadius:'50%',background:'var(--text3)',animation:`pulse 1.2s ${i*.2}s infinite` }}/>)}</div>
                      : <div style={{ fontSize:13, lineHeight:1.7, color:'var(--text2)' }}>{aiExplanation}</div>
                    }
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tips */}
            {!aiExplanation && !loadingAI && (
              <div style={{ background:'rgba(79,142,247,.05)', border:'1px solid rgba(79,142,247,.15)', borderRadius:'var(--radius)', padding:18 }}>
                <div style={{ fontSize:12.5, fontWeight:600, color:'var(--blue)', marginBottom:8 }}>💡 Listening Strategies</div>
                {['Read questions before the audio starts.','Answers follow the order of the recording.','Beware of distractors — speakers often correct themselves.','The answer uses paraphrased language, not exact words from the question.'].map((tip,i) => (
                  <div key={i} style={{ fontSize:12, color:'var(--text2)', marginBottom:6, paddingLeft:12, position:'relative' }}>
                    <span style={{ position:'absolute', left:0, color:'var(--blue)' }}>•</span>{tip}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
