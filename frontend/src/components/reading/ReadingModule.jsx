import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { aiAPI } from '../../services/api';

const PASSAGE = {
  title: 'The Science of Sleep: Why We Need More Than We Think',
  wordCount: 620,
  difficulty: 'Intermediate',
  body: [
    { key:'A', text:'Sleep is one of the most fundamental biological processes, yet it remains one of the least understood aspects of human physiology. Despite spending approximately one-third of their lives asleep, most people have a poor understanding of what actually happens during this time, and why disruption of sleep patterns can have such profound consequences for physical and mental health.' },
    { key:'B', text:'Recent research has dramatically changed our understanding of the purpose of sleep. For decades, scientists believed that sleep was primarily a period of rest — a time for the body and mind to recover from the exertions of the day. While this restorative function is certainly important, we now know that sleep serves a much more complex range of purposes, many of which are critical for survival.' },
    { key:'C', text:'One of the most significant discoveries in recent sleep research concerns the role of the glymphatic system. This network of channels, which is unique to the brain, becomes highly active during deep sleep stages and functions as a waste-disposal system, flushing out toxic proteins that accumulate in the brain during waking hours. Among these proteins is beta-amyloid, whose abnormal accumulation is associated with Alzheimer\'s disease.' },
    { key:'D', text:'The relationship between sleep and memory consolidation has also received considerable attention. Research using brain imaging technology has demonstrated that the hippocampus — a region of the brain crucial for the formation of new memories — is particularly active during REM sleep. During this phase, the brain appears to replay and reorganise the events of the day, transferring information from short-term to long-term memory stores.' },
    { key:'E', text:'Sleep deprivation, even in relatively mild forms, has been shown to have significant effects on cognitive performance, emotional regulation, and immune function. A study conducted at the University of Pennsylvania found that subjects who slept for only six hours per night for two weeks showed cognitive deficits equivalent to those seen in individuals who had been awake for 24 hours straight — yet the sleep-deprived subjects typically reported feeling only slightly sleepy.' },
  ],
};

const TFNG_QS = [
  { id:'t1', text:'Sleep was traditionally understood primarily as a restorative process.', answer:'TRUE', para:'B' },
  { id:'t2', text:'The glymphatic system is found throughout the entire human body.', answer:'FALSE', para:'C' },
  { id:'t3', text:'Beta-amyloid is the only protein linked to Alzheimer\'s disease.', answer:'NOT GIVEN', para:'C' },
  { id:'t4', text:'REM sleep plays a role in consolidating new memories.', answer:'TRUE', para:'D' },
  { id:'t5', text:'People can accurately judge when they are cognitively impaired by sleep deprivation.', answer:'FALSE', para:'E' },
];

const SUMMARY_CORRECT = { s1:'glymphatic', s2:'rem', s3:'hippocampus' };

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

export default function ReadingModule() {
  const [tab, setTab] = useState('academic');
  const [tfngAnswers, setTFNG] = useState({});
  const [tfngResult, setTFNGResult] = useState({});
  const [summaryAnswers, setSummary] = useState({ s1:'', s2:'', s3:'' });
  const [summaryChecked, setSummaryChecked] = useState(false);
  const [highlightPara, setHighlightPara] = useState(null);
  const [aiExplanation, setAIExplanation] = useState(null);
  const [selectedQ, setSelectedQ] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const answerTFNG = (qId, val) => {
    const q = TFNG_QS.find(q => q.id === qId);
    const isCorrect = val === q.answer;
    setTFNG(p => ({ ...p, [qId]: val }));
    setTFNGResult(p => ({ ...p, [qId]: isCorrect }));
    setHighlightPara(q.para);
    if (isCorrect) toast.success('✅ Correct!');
    else toast.error(`❌ The answer is ${q.answer} — check paragraph ${q.para}`);
  };

  const getExplanation = async (q) => {
    setSelectedQ(q.id);
    setLoadingAI(true);
    setAIExplanation(null);
    try {
      const paraText = PASSAGE.body.find(p => p.key === q.para)?.text || '';
      const { explanation } = await aiAPI.explainAnswer({
        questionText: q.text,
        userAnswer: tfngAnswers[q.id] || 'Not answered',
        correctAnswer: q.answer,
        context: paraText.slice(0, 300),
      });
      setAIExplanation(explanation);
    } catch {
      setAIExplanation(`The correct answer is ${q.answer}. The key evidence is in Paragraph ${q.para}. Re-read that paragraph and look for a statement that directly supports, contradicts, or does not mention this claim.`);
    } finally { setLoadingAI(false); }
  };

  const checkSummary = () => {
    setSummaryChecked(true);
    const correct = Object.entries(SUMMARY_CORRECT).filter(([k,v]) => summaryAnswers[k]?.toLowerCase().trim() === v).length;
    toast.success(`Summary: ${correct}/3 correct — Answers: glymphatic, REM, hippocampus`);
  };

  const answeredCount = Object.keys(tfngAnswers).length;
  const correctCount = Object.values(tfngResult).filter(Boolean).length;

  return (
    <div>
      <TabBar tabs={[{id:'academic',label:'Academic'},{id:'general',label:'General Training'},{id:'analysis',label:'AI Analysis'}]} active={tab} onChange={setTab} />

      {tab !== 'academic' ? (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:40, textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>{tab==='general'?'📰':'🤖'}</div>
          <div style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>{tab==='general'?'General Training Reading':'AI Reading Analysis'}</div>
          <div style={{ fontSize:13, color:'var(--text2)' }}>General Training passages (advertisements, notices, workplace materials) will appear here. AI Analysis shows your accuracy breakdown by question type.</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:20 }}>
          {/* Left: Passage */}
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>Passage 1 — {PASSAGE.title}</div>
                <div style={{ display:'flex', gap:8 }}>
                  {['Academic','620 words',PASSAGE.difficulty].map((label, i) => (
                    <span key={label} style={{ display:'inline-flex', alignItems:'center', padding:'2px 10px', borderRadius:10, fontSize:11.5, fontWeight:500, background:i===0?'rgba(79,142,247,.15)':i===2?'rgba(245,158,11,.15)':'rgba(90,106,133,.2)', color:i===0?'var(--blue)':i===2?'var(--amber)':'var(--text3)' }}>{label}</span>
                  ))}
                </div>
              </div>
              {answeredCount > 0 && (
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:18, fontWeight:700, color:'var(--blue)' }}>{correctCount}/{answeredCount}</div>
                  <div style={{ fontSize:11, color:'var(--text3)' }}>correct</div>
                </div>
              )}
            </div>

            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:24, height:500, overflowY:'auto', fontSize:14, lineHeight:1.85 }}>
              <h3 style={{ fontSize:16, fontWeight:700, marginBottom:16, color:'var(--text)' }}>{PASSAGE.title}</h3>
              {PASSAGE.body.map(para => (
                <div key={para.key} onClick={() => setHighlightPara(highlightPara===para.key?null:para.key)} style={{ marginBottom:14, padding:highlightPara===para.key?'8px 12px':'0', background:highlightPara===para.key?'rgba(79,142,247,.08)':'transparent', borderLeft:highlightPara===para.key?'3px solid var(--blue)':'3px solid transparent', borderRadius:highlightPara===para.key?'0 var(--radius-sm) var(--radius-sm) 0':0, transition:'all .3s', cursor:'pointer' }}>
                  <span style={{ fontWeight:700, color:'var(--blue)', marginRight:8 }}>{para.key}</span>
                  <span style={{ color:'var(--text)' }}>{para.text}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize:11.5, color:'var(--text3)', marginTop:6 }}>💡 Click any paragraph to highlight it while answering questions</div>
          </div>

          {/* Right: Questions */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* T/F/NG */}
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ fontSize:14, fontWeight:600 }}>True / False / Not Given</div>
                <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 10px', borderRadius:10, fontSize:11.5, fontWeight:500, background:'rgba(79,142,247,.15)', color:'var(--blue)' }}>{answeredCount}/{TFNG_QS.length}</span>
              </div>
              {TFNG_QS.map(q => {
                const answered = tfngAnswers[q.id];
                const isCorrect = tfngResult[q.id];
                return (
                  <div key={q.id} style={{ marginBottom:14 }}>
                    <div style={{ fontSize:13, marginBottom:7, color:'var(--text)', cursor:answered?'pointer':'default', paddingRight:4, lineHeight:1.5 }} onClick={() => answered && getExplanation(q)}>
                      {q.text}
                      {answered && (
                        <span style={{ marginLeft:8, fontSize:11, color:isCorrect?'var(--green)':'var(--red)', fontWeight:600 }}>
                          {isCorrect ? '✓' : `✗ (${q.answer})`}
                        </span>
                      )}
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      {['TRUE','FALSE','NOT GIVEN'].map(opt => (
                        <button key={opt} onClick={() => !answered && answerTFNG(q.id, opt)} disabled={!!answered} style={{ flex:1, padding:'6px 2px', fontSize:10.5, fontWeight:500, borderRadius:6, border:'1px solid', cursor:answered?'default':'pointer', fontFamily:'var(--font)', transition:'all .15s', background:answered===opt?(isCorrect?'rgba(34,197,94,.15)':'rgba(239,68,68,.15)'):answered&&opt===q.answer?'rgba(34,197,94,.1)':'transparent', borderColor:answered===opt?(isCorrect?'var(--green)':'var(--red)'):answered&&opt===q.answer?'var(--green)':'var(--border)', color:answered===opt?(isCorrect?'var(--green)':'var(--red)'):answered&&opt===q.answer?'var(--green)':'var(--text3)' }}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Completion */}
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20 }}>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:12 }}>Summary Completion</div>
              <div style={{ fontSize:13, lineHeight:2.1, color:'var(--text)' }}>
                Sleep serves multiple purposes including the activation of the{' '}
                <input value={summaryAnswers.s1} onChange={e=>setSummary(p=>({...p,s1:e.target.value}))} placeholder="brain system" style={{ width:120, background:'var(--bg3)', border:'none', borderBottom:`2px solid ${summaryChecked?(summaryAnswers.s1.toLowerCase()===SUMMARY_CORRECT.s1?'var(--green)':'var(--red)'):'var(--border2)'}`, color:'var(--text)', fontSize:13, padding:'2px 6px', outline:'none', fontFamily:'var(--font)' }} />{' '}
                system, which removes toxic proteins. The{' '}
                <input value={summaryAnswers.s3} onChange={e=>setSummary(p=>({...p,s3:e.target.value}))} placeholder="brain region" style={{ width:120, background:'var(--bg3)', border:'none', borderBottom:`2px solid ${summaryChecked?(summaryAnswers.s3.toLowerCase()===SUMMARY_CORRECT.s3?'var(--green)':'var(--red)'):'var(--border2)'}`, color:'var(--text)', fontSize:13, padding:'2px 6px', outline:'none', fontFamily:'var(--font)' }} />{' '}
                is particularly active during{' '}
                <input value={summaryAnswers.s2} onChange={e=>setSummary(p=>({...p,s2:e.target.value}))} placeholder="sleep type" style={{ width:70, background:'var(--bg3)', border:'none', borderBottom:`2px solid ${summaryChecked?(summaryAnswers.s2.toLowerCase()===SUMMARY_CORRECT.s2?'var(--green)':'var(--red)'):'var(--border2)'}`, color:'var(--text)', fontSize:13, padding:'2px 6px', outline:'none', fontFamily:'var(--font)' }} />{' '}
                sleep, helping transfer memories to long-term storage.
              </div>
              <button onClick={checkSummary} disabled={summaryChecked} style={{ marginTop:14, padding:'7px 18px', background:'var(--blue)', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontSize:13, cursor:summaryChecked?'default':'pointer', fontFamily:'var(--font)', opacity:summaryChecked?.7:1 }}>
                {summaryChecked ? '✅ Checked' : 'Check Answers'}
              </button>
            </div>

            {/* AI Explanation */}
            <AnimatePresence>
              {(aiExplanation || loadingAI) && (
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
                  <div style={{ background:'var(--card2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:18 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                      <div style={{ width:28,height:28,borderRadius:'50%',background:'var(--grad)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13 }}>🤖</div>
                      <div style={{ fontSize:13, fontWeight:600 }}>AI Explanation</div>
                      <button onClick={() => setAIExplanation(null)} style={{ marginLeft:'auto', background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:16 }}>×</button>
                    </div>
                    {loadingAI
                      ? <div style={{ display:'flex', gap:4 }}>{[0,1,2].map(i=><div key={i} style={{ width:6,height:6,borderRadius:'50%',background:'var(--text3)',animation:`pulse 1.2s ${i*.2}s infinite` }}/>)}</div>
                      : <div style={{ fontSize:12.5, lineHeight:1.7, color:'var(--text2)' }}>{aiExplanation}</div>
                    }
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
