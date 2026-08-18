import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { writingAPI } from '../../services/api';

const PROMPTS = {
  task2: [
    { id:'t2-1', topic:'Health', text:'Some people believe that the best way to improve public health is through increasing sports facilities. Others believe this would have little effect and other measures are required. Discuss both views and give your own opinion.' },
    { id:'t2-2', topic:'Technology', text:'Technology is making communication easier in today\'s world, but at the expense of personal contact. To what extent do you agree or disagree?' },
    { id:'t2-3', topic:'Education', text:'Some people think that all university students should study whatever they like. Others believe that they should only be allowed to study subjects that will be useful in the future. Discuss both views and give your opinion.' },
  ],
  task1: [
    { id:'t1-1', topic:'Charts', text:'The bar chart below shows the percentage of people aged 65 and over in three countries between 1940 and 2040. Summarise the information and make comparisons where relevant. Write at least 150 words.' },
    { id:'t1-2', topic:'Process', text:'The diagram below shows how solar panels are used to provide electricity for domestic use. Summarise the information by selecting and reporting the main features. Write at least 150 words.' },
  ],
};

const CRITERIA = [
  { key:'taskAchievement', label:'Task Achievement', color:'var(--green)' },
  { key:'coherenceCohesion', label:'Coherence & Cohesion', color:'var(--blue)' },
  { key:'lexicalResource', label:'Lexical Resource', color:'var(--amber)' },
  { key:'grammaticalRange', label:'Grammatical Range', color:'var(--purple)' },
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

function Progress({ pct=0, color='var(--blue)' }) {
  return (
    <div style={{ background:'var(--bg3)', borderRadius:10, height:6, overflow:'hidden', flex:1 }}>
      <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:.6, ease:'easeOut' }} style={{ height:'100%', background:color, borderRadius:10 }} />
    </div>
  );
}

export default function WritingModule() {
  const [tab, setTab] = useState('task2');
  const [prompt, setPrompt] = useState(PROMPTS.task2[0]);
  const [essay, setEssay] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showImproved, setShowImproved] = useState(false);
  const textareaRef = useRef(null);

  const prompts = PROMPTS[tab];
  const wordCount = essay.trim().split(/\s+/).filter(Boolean).length;
  const minWords = tab === 'task2' ? 250 : 150;
  const wColor = wordCount < minWords ? 'var(--amber)' : wordCount > (tab==='task2'?380:230) ? 'var(--red)' : 'var(--green)';

  const handleTab = (t) => { setTab(t); setPrompt(PROMPTS[t][0]); setEvaluation(null); setEssay(''); setShowImproved(false); };

  const handleEvaluate = async () => {
    if (wordCount < 50) { toast.error('Write at least 50 words first'); return; }
    setIsEvaluating(true); setEvaluation(null);
    try {
      const { submission } = await writingAPI.submit({ taskType: tab, questionText: prompt.text, content: essay, timeSpentSec: 0 });
      setEvaluation(submission);
      toast.success('AI evaluation complete! 🎉');
    } catch (err) {
      toast.error(err.message || 'AI evaluation failed — check your API key');
    } finally { setIsEvaluating(false); }
  };

  const insertTemplate = () => {
    const t = tab === 'task2'
      ? `Introduction:\n[Paraphrase the question and state your position clearly]\n\nBody Paragraph 1:\n[First viewpoint + evidence + example]\n\nBody Paragraph 2:\n[Opposing viewpoint or your supporting argument]\n\nConclusion:\n[Summarise and restate your position]`
      : `Overview:\n[Identify 2–3 main trends or features]\n\nBody Paragraph 1:\n[Describe main feature with specific data/figures]\n\nBody Paragraph 2:\n[Compare or contrast with another feature]\n\nConclusion (optional):\n[Overall trend or most striking comparison]`;
    setEssay(t);
    textareaRef.current?.focus();
  };

  return (
    <div>
      <TabBar tabs={[{id:'task2',label:'Task 2 — Essay'},{id:'task1',label:'Task 1 — Academic'},{id:'history',label:'My Submissions'}]} active={tab} onChange={handleTab} />

      {tab === 'history' ? (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:40, textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>📄</div>
          <div style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>Submission History</div>
          <div style={{ fontSize:13, color:'var(--text2)' }}>Your submitted essays appear here after evaluation.</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:20 }}>
          {/* Left: Prompt + Editor */}
          <div>
            {/* Prompt */}
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:18, marginBottom:14 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 10px', borderRadius:10, fontSize:11.5, fontWeight:500, background:'rgba(168,85,247,.15)', color:'var(--purple)' }}>{tab==='task2'?'Writing Task 2':'Writing Task 1'}</span>
                  <span style={{ fontSize:12, color:'var(--text3)' }}>40 min · {minWords}+ words</span>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  {prompts.map(p => (
                    <button key={p.id} onClick={() => { setPrompt(p); setEvaluation(null); setEssay(''); }} style={{ padding:'3px 8px', fontSize:11, borderRadius:6, border:'1px solid', cursor:'pointer', fontFamily:'var(--font)', background: prompt.id===p.id?'rgba(79,142,247,.15)':'transparent', borderColor: prompt.id===p.id?'var(--blue)':'var(--border)', color: prompt.id===p.id?'var(--blue)':'var(--text3)' }}>{p.topic}</button>
                  ))}
                </div>
              </div>
              <div style={{ background:'var(--bg3)', borderLeft:'3px solid var(--blue)', padding:14, borderRadius:'0 var(--radius-sm) var(--radius-sm) 0', fontSize:13.5, lineHeight:1.7, color:'var(--text)' }}>
                {prompt.text}
              </div>
            </div>

            {/* Toolbar */}
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm) var(--radius-sm) 0 0', borderBottom:'none', flexWrap:'wrap' }}>
              {['B','I','U'].map(f => (
                <button key={f} style={{ background:'none', border:'none', color:'var(--text2)', cursor:'pointer', padding:'3px 7px', borderRadius:4, fontSize:13, fontFamily:'var(--font)', fontWeight:f==='B'?700:'normal', fontStyle:f==='I'?'italic':'normal', textDecoration:f==='U'?'underline':'none' }}>{f}</button>
              ))}
              <div style={{ width:1, height:16, background:'var(--border)', margin:'0 4px' }} />
              <button onClick={insertTemplate} style={{ background:'none', border:'none', color:'var(--text2)', cursor:'pointer', padding:'3px 8px', fontSize:12.5, fontFamily:'var(--font)' }}>📋 Template</button>
              <button onClick={async()=>{ if(!essay.trim()){toast.error('Write something first');return;} try{const r=await writingAPI.quickCheck({text:essay});toast.success(`Grammar check: ${r.errorCount} issue(s) found`);}catch{toast.error('Grammar check failed');}}} style={{ background:'none', border:'none', color:'var(--text2)', cursor:'pointer', padding:'3px 8px', fontSize:12.5, fontFamily:'var(--font)' }}>✓ Grammar</button>
              <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:12, color:wColor, fontWeight:600 }}>{wordCount} words {wordCount<minWords?`(need ${minWords-wordCount} more)`:'✓'}</span>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              value={essay}
              onChange={e => setEssay(e.target.value)}
              placeholder={`Begin your ${tab==='task2'?'essay':'report'} here…\n\nTip: Use the Template button above to get a structured starting point.`}
              style={{ width:'100%', minHeight:300, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'0 0 var(--radius-sm) var(--radius-sm)', padding:16, color:'var(--text)', fontSize:14, lineHeight:1.85, resize:'vertical', fontFamily:'var(--font)', outline:'none' }}
              onFocus={e=>e.target.style.borderColor='var(--blue)'}
              onBlur={e=>e.target.style.borderColor='var(--border)'}
            />

            <div style={{ display:'flex', gap:8, marginTop:10, alignItems:'center' }}>
              <button onClick={()=>setEssay('')} style={{ padding:'7px 14px', background:'none', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', color:'var(--text2)', fontSize:12.5, cursor:'pointer', fontFamily:'var(--font)' }}>Clear</button>
              <button style={{ padding:'7px 14px', background:'none', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', color:'var(--text2)', fontSize:12.5, cursor:'pointer', fontFamily:'var(--font)' }}>Save Draft</button>
              <button onClick={handleEvaluate} disabled={isEvaluating} style={{ marginLeft:'auto', padding:'8px 20px', background:'var(--grad)', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'var(--font)', opacity:isEvaluating?.7:1, display:'flex', alignItems:'center', gap:6 }}>
                {isEvaluating ? (<><div style={{ width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite' }}/> Evaluating…</>) : '🤖 Get AI Score →'}
              </button>
            </div>
          </div>

          {/* Right: Evaluation Panel */}
          <div>
            {!evaluation && !isEvaluating && (
              <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:40, textAlign:'center' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🤖</div>
                <div style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>AI Writing Examiner</div>
                <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.7, marginBottom:20 }}>Write your essay and click "Get AI Score" to receive a band score, criteria breakdown, personalised feedback, and an improved version.</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, textAlign:'left' }}>
                  {['Band Score Prediction','4-Criteria Scoring','Improved Version','Vocabulary Upgrades'].map(f=>(
                    <div key={f} style={{ fontSize:12.5, color:'var(--text2)', display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ color:'var(--green)' }}>✓</span>{f}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isEvaluating && (
              <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:40, textAlign:'center' }}>
                <div style={{ width:36,height:36,border:'3px solid rgba(79,142,247,.2)',borderTopColor:'var(--blue)',borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 16px' }} />
                <div style={{ fontSize:14, color:'var(--text2)' }}>AI examiner is reading your essay…</div>
                <div style={{ fontSize:12, color:'var(--text3)', marginTop:6 }}>This may take 15–30 seconds</div>
              </div>
            )}

            <AnimatePresence>
              {evaluation && (
                <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
                  {/* Score header */}
                  <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20, marginBottom:14 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                      <div style={{ width:32,height:32,borderRadius:'50%',background:'var(--grad)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14 }}>🤖</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:600 }}>AI Writing Examiner</div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>Official IELTS Band Predictor</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:32, fontWeight:800, color:'var(--blue)' }}>{evaluation.bandScore}</div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>Estimated Band</div>
                      </div>
                    </div>
                    {CRITERIA.map(c => {
                      const val = evaluation.criteria?.[c.key];
                      if (!val) return null;
                      return (
                        <div key={c.key} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderTop:'1px solid var(--border)' }}>
                          <span style={{ fontSize:12.5, width:160, color:'var(--text2)', flexShrink:0 }}>{c.label}</span>
                          <Progress pct={(val.band/9)*100} color={c.color} />
                          <span style={{ fontSize:14, fontWeight:700, color:c.color, width:30, textAlign:'right' }}>{val.band}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Feedback */}
                  <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20, marginBottom:14 }}>
                    {evaluation.strengths?.length > 0 && (
                      <div style={{ marginBottom:14 }}>
                        <div style={{ fontSize:12.5, fontWeight:600, color:'var(--green)', marginBottom:8 }}>✅ Strengths</div>
                        {evaluation.strengths.map((s,i) => <div key={i} style={{ fontSize:12.5, color:'var(--text2)', paddingLeft:12, marginBottom:4 }}>• {s}</div>)}
                      </div>
                    )}
                    {evaluation.improvements?.length > 0 && (
                      <div style={{ marginBottom:14 }}>
                        <div style={{ fontSize:12.5, fontWeight:600, color:'var(--amber)', marginBottom:8 }}>⚠️ Areas to Improve</div>
                        {evaluation.improvements.map((s,i) => <div key={i} style={{ fontSize:12.5, color:'var(--text2)', paddingLeft:12, marginBottom:4 }}>• {s}</div>)}
                      </div>
                    )}
                    {evaluation.vocabularySuggestions?.length > 0 && (
                      <div>
                        <div style={{ fontSize:12.5, fontWeight:600, color:'var(--purple)', marginBottom:8 }}>💡 Vocabulary Upgrades</div>
                        {evaluation.vocabularySuggestions.map((v,i) => (
                          <div key={i} style={{ background:'var(--bg3)', borderRadius:'var(--radius-sm)', padding:'8px 10px', marginBottom:6, fontSize:12 }}>
                            <span style={{ color:'var(--red)', textDecoration:'line-through' }}>{v.original}</span>
                            {' → '}
                            <span style={{ color:'var(--green)', fontWeight:600 }}>{v.suggestion}</span>
                            {v.example && <div style={{ color:'var(--text3)', marginTop:3, fontStyle:'italic' }}>e.g. "{v.example}"</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Improved version toggle */}
                  {evaluation.improvedVersion && (
                    <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20 }}>
                      <button onClick={() => setShowImproved(!showImproved)} style={{ width:'100%', textAlign:'center', background:'none', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'8px 16px', color:'var(--text2)', fontSize:13, cursor:'pointer', fontFamily:'var(--font)' }}>
                        {showImproved ? '▲ Hide' : '✨ Show'} AI Improved Version
                      </button>
                      <AnimatePresence>
                        {showImproved && (
                          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} style={{ overflow:'hidden' }}>
                            <div style={{ background:'var(--bg3)', borderRadius:'var(--radius-sm)', padding:14, marginTop:10, fontSize:13, lineHeight:1.8, color:'var(--text2)' }}>
                              {evaluation.improvedVersion}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
