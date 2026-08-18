import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { aiAPI } from '../../services/api';

const WORDS = [
  { _id:'1', word:'Ubiquitous', pos:'adjective', def:'Present or found everywhere; seemingly omnipresent.', ex:'Smartphones have become ubiquitous in modern society.', syn:['omnipresent','pervasive','universal'] },
  { _id:'2', word:'Enumerate', pos:'verb', def:'Mention (a number of things) one by one; list in order.', ex:'The report enumerates the key findings of the study.', syn:['list','itemise','catalogue'] },
  { _id:'3', word:'Mitigate', pos:'verb', def:'Make (something bad) less severe or serious.', ex:'Measures were taken to mitigate the effects of pollution.', syn:['alleviate','reduce','lessen'] },
  { _id:'4', word:'Proliferate', pos:'verb', def:'Increase rapidly in numbers; multiply and spread widely.', ex:'Mobile devices have proliferated enormously in recent years.', syn:['multiply','spread','mushroom'] },
  { _id:'5', word:'Alleviate', pos:'verb', def:'Make (suffering or a problem) less severe.', ex:'The medication helped to alleviate the patient\'s pain.', syn:['ease','relieve','reduce'] },
  { _id:'6', word:'Juxtapose', pos:'verb', def:'Place close together for contrasting effect.', ex:'The writer juxtaposed wealth and poverty in the same scene.', syn:['contrast','compare','place side by side'] },
];

const QUIZ = WORDS.map(w => ({
  word: w.word,
  correct: w.def,
  options: [w.def, ...WORDS.filter(x=>x._id!==w._id).slice(0,3).map(x=>x.def)].sort(()=>Math.random()-.5),
}));

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display:'flex', gap:4, background:'var(--bg3)', borderRadius:8, padding:4, width:'fit-content', marginBottom:20 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={()=>onChange(t.id)} style={{ padding:'7px 18px', borderRadius:6, fontSize:13, fontWeight:active===t.id?500:400, cursor:'pointer', color:active===t.id?'var(--text)':'var(--text2)', background:active===t.id?'var(--card)':'none', border:'none', fontFamily:'var(--font)', boxShadow:active===t.id?'0 1px 6px rgba(0,0,0,.3)':'none', transition:'all .15s' }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default function VocabularyBuilder() {
  const [tab, setTab] = useState('flashcards');
  const [flipped, setFlipped] = useState({});
  const [mastery, setMastery] = useState({});
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizChecked, setQuizChecked] = useState(false);
  const [aiTopic, setAITopic] = useState('');
  const [aiDiff, setAIDiff] = useState('advanced');
  const [aiWords, setAIWords] = useState([]);
  const [generating, setGenerating] = useState(false);

  const masteryColor = { easy:'var(--green)', ok:'var(--amber)', hard:'var(--red)' };

  const markMastery = (id, level) => {
    setMastery(p=>({...p,[id]:level}));
    toast.success(`Marked as ${level==='easy'?'😊 Easy':level==='ok'?'🤔 Ok':'😅 Hard'}`);
  };

  const checkQuiz = () => {
    setQuizChecked(true);
    const correct = QUIZ.slice(0,4).filter(q=>quizAnswers[q.word]===q.correct).length;
    toast.success(`Quiz result: ${correct}/4 correct!`);
  };

  const generateVocab = async () => {
    if (!aiTopic.trim()) { toast.error('Enter a topic first'); return; }
    setGenerating(true); setAIWords([]);
    try {
      const res = await aiAPI.generateVocab({ topic:aiTopic, difficulty:aiDiff, count:6 });
      const words = res.words || (Array.isArray(res) ? res : []);
      setAIWords(words);
      toast.success(`Generated ${words.length} vocabulary words!`);
    } catch {
      toast.error('AI generation failed — check your OpenAI API key in backend .env');
    } finally { setGenerating(false); }
  };

  return (
    <div>
      <TabBar tabs={[{id:'flashcards',label:'Flashcards'},{id:'daily',label:'Daily Words'},{id:'quiz',label:'Quiz Mode'},{id:'generator',label:'🤖 AI Generator'}]} active={tab} onChange={setTab} />

      {/* FLASHCARDS */}
      {tab==='flashcards' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <span style={{ fontSize:13, color:'var(--text2)' }}>{Object.values(mastery).filter(m=>m==='easy').length} / {WORDS.length} mastered</span>
            <button onClick={()=>{setFlipped({}); setMastery({});}} style={{ padding:'5px 14px', background:'none', border:'1px solid var(--border)', borderRadius:8, color:'var(--text2)', fontSize:12, cursor:'pointer', fontFamily:'var(--font)' }}>Reset</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {WORDS.map(w => {
              const isFlipped = flipped[w._id];
              const level = mastery[w._id];
              return (
                <motion.div key={w._id} whileHover={{ y:-3 }} style={{ background:'var(--card)', border:`1px solid ${level?masteryColor[level]+'66':'var(--border)'}`, borderRadius:'var(--radius)', padding:20, cursor:'pointer', textAlign:'center', minHeight:220, display:'flex', flexDirection:'column', justifyContent:'space-between', transition:'border-color .2s' }} onClick={()=>setFlipped(p=>({...p,[w._id]:!p[w._id]}))}>
                  <AnimatePresence mode="wait">
                    {!isFlipped ? (
                      <motion.div key="front" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                        <div style={{ fontSize:22, fontWeight:800, marginBottom:6 }}>{w.word}</div>
                        <div style={{ fontSize:11, color:'var(--teal)', fontWeight:500, marginBottom:10, textTransform:'uppercase', letterSpacing:'.05em' }}>{w.pos}</div>
                        <div style={{ fontSize:12, color:'var(--text3)' }}>Click to see definition</div>
                      </motion.div>
                    ) : (
                      <motion.div key="back" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                        <div style={{ fontSize:13, color:'var(--text)', lineHeight:1.6, marginBottom:8 }}>{w.def}</div>
                        <div style={{ fontSize:12, color:'var(--text3)', fontStyle:'italic', marginBottom:8 }}>"{w.ex}"</div>
                        <div style={{ fontSize:11.5, color:'var(--text3)' }}>≈ {w.syn?.join(', ')}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div style={{ display:'flex', gap:4, marginTop:12 }} onClick={e=>e.stopPropagation()}>
                    {[['hard','😅','Hard'],['ok','🤔','Ok'],['easy','😊','Easy']].map(([lvl,icon,label])=>(
                      <button key={lvl} onClick={()=>markMastery(w._id,lvl)} style={{ flex:1, padding:'5px 0', fontSize:11, border:'none', borderRadius:6, cursor:'pointer', fontFamily:'var(--font)', background:level===lvl?(lvl==='easy'?'rgba(34,197,94,.2)':lvl==='ok'?'rgba(245,158,11,.2)':'rgba(239,68,68,.2)'):'var(--bg3)', color:level===lvl?masteryColor[lvl]:'var(--text3)', fontWeight:level===lvl?600:400 }}>
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAILY WORDS */}
      {tab==='daily' && (
        <div>
          <div style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>📅 Today's 5 IELTS Words</div>
          <div style={{ fontSize:13, color:'var(--text2)', marginBottom:16 }}>Study these words and use them in your writing and speaking practice.</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {WORDS.slice(0,5).map((w,i)=>(
              <div key={w._id} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20, display:'flex', gap:14 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:16, fontWeight:700, marginBottom:3 }}>{w.word}</div>
                  <div style={{ fontSize:11, color:'var(--teal)', marginBottom:6, textTransform:'uppercase', letterSpacing:'.05em' }}>{w.pos}</div>
                  <div style={{ fontSize:13, color:'var(--text2)', marginBottom:6 }}>{w.def}</div>
                  <div style={{ fontSize:12, color:'var(--text3)', fontStyle:'italic' }}>"{w.ex}"</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUIZ MODE */}
      {tab==='quiz' && (
        <div>
          <div style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>📝 Vocabulary Quiz</div>
          <div style={{ fontSize:13, color:'var(--text2)', marginBottom:16 }}>Match each word to its correct definition.</div>
          {QUIZ.slice(0,4).map((q,qi) => {
            const answered = quizAnswers[q.word];
            return (
              <div key={q.word} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20, marginBottom:14 }}>
                <div style={{ fontSize:18, fontWeight:700, marginBottom:12 }}>{q.word}</div>
                {q.options.map((opt,oi)=>{
                  const isSelected = answered===opt;
                  const isCorrect = quizChecked && opt===q.correct;
                  const isWrong = quizChecked && isSelected && opt!==q.correct;
                  return (
                    <div key={oi} onClick={()=>!quizChecked&&setQuizAnswers(p=>({...p,[q.word]:opt}))} style={{ padding:'10px 14px', borderRadius:'var(--radius-sm)', marginBottom:6, border:`1px solid ${isCorrect?'var(--green)':isWrong?'var(--red)':isSelected?'var(--blue)':'var(--border)'}`, background:isCorrect?'rgba(34,197,94,.08)':isWrong?'rgba(239,68,68,.08)':isSelected?'rgba(79,142,247,.08)':'var(--bg3)', cursor:quizChecked?'default':'pointer', fontSize:13, color:'var(--text)', transition:'all .15s' }}>
                      {opt}
                    </div>
                  );
                })}
              </div>
            );
          })}
          <button onClick={checkQuiz} disabled={quizChecked||Object.keys(quizAnswers).length<4} style={{ padding:'9px 24px', background:'var(--grad)', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'var(--font)', opacity:(quizChecked||Object.keys(quizAnswers).length<4)?.5:1 }}>
            {quizChecked?'✅ Submitted':'Submit Quiz →'}
          </button>
        </div>
      )}

      {/* AI GENERATOR */}
      {tab==='generator' && (
        <div>
          <div style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>🤖 AI Vocabulary Generator</div>
          <div style={{ fontSize:13, color:'var(--text2)', marginBottom:16 }}>Generate IELTS-relevant vocabulary for any topic using AI.</div>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20, marginBottom:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto auto', gap:12, alignItems:'flex-end' }}>
              <div>
                <label style={{ display:'block', fontSize:12.5, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>Topic</label>
                <input value={aiTopic} onChange={e=>setAITopic(e.target.value)} onKeyDown={e=>e.key==='Enter'&&generateVocab()} placeholder="e.g. climate change, AI, healthcare…" style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'9px 14px', color:'var(--text)', fontSize:13.5, fontFamily:'var(--font)', outline:'none' }}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:12.5, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>Difficulty</label>
                <select value={aiDiff} onChange={e=>setAIDiff(e.target.value)} style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'9px 14px', color:'var(--text)', fontSize:13.5, fontFamily:'var(--font)', outline:'none' }}>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="band7+">Band 7+</option>
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:12.5, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>Quick Topics</label>
                <div style={{ display:'flex', gap:4 }}>
                  {['Environment','Health','Technology','Education'].map(t=>(
                    <button key={t} onClick={()=>setAITopic(t)} style={{ padding:'5px 8px', fontSize:11, border:'1px solid var(--border)', borderRadius:20, cursor:'pointer', background:'transparent', color:'var(--text3)', fontFamily:'var(--font)' }}>{t}</button>
                  ))}
                </div>
              </div>
              <button onClick={generateVocab} disabled={generating} style={{ padding:'9px 20px', background:'var(--grad)', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontSize:13, cursor:'pointer', fontFamily:'var(--font)', alignSelf:'flex-end', display:'flex', alignItems:'center', gap:6, opacity:generating?.7:1 }}>
                {generating?(<><div style={{ width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite' }}/>Generating…</>):'Generate →'}
              </button>
            </div>
          </div>

          {generating && (
            <div style={{ textAlign:'center', padding:40 }}>
              <div style={{ width:36,height:36,border:'3px solid rgba(79,142,247,.2)',borderTopColor:'var(--blue)',borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 12px' }}/>
              <div style={{ color:'var(--text2)' }}>AI is generating vocabulary for "{aiTopic}"…</div>
            </div>
          )}

          {aiWords.length > 0 && (
            <div>
              <div style={{ fontSize:15, fontWeight:600, marginBottom:14 }}>Generated Words — {aiTopic}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
                {aiWords.map((w,i)=>(
                  <motion.div key={i} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.07 }}>
                    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20 }}>
                      <div style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>{w.word}</div>
                      <div style={{ fontSize:11, color:'var(--teal)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.05em' }}>{w.partOfSpeech}</div>
                      <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.5, marginBottom:8 }}>{w.definition}</div>
                      <div style={{ fontSize:12, color:'var(--text3)', fontStyle:'italic', marginBottom:8 }}>"{w.example}"</div>
                      {w.usageNotes && <div style={{ fontSize:11.5, color:'var(--purple)', background:'rgba(168,85,247,.08)', padding:'6px 8px', borderRadius:6 }}>📌 {w.usageNotes}</div>}
                      {w.synonyms?.length > 0 && <div style={{ fontSize:11.5, color:'var(--text3)', marginTop:8 }}>≈ {w.synonyms.join(', ')}</div>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
