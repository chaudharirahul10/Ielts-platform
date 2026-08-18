import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { speakingAPI } from '../../services/api';
import { useRecording } from '../../hooks';

const TABS = [{id:'part1',label:'Part 1'},{id:'part2',label:'Part 2 — Cue Card'},{id:'part3',label:'Part 3'},{id:'interview',label:'Full AI Interview'}];

const PART1_QS = [
  'Tell me about your hometown. What do you like about it?',
  'Do you prefer studying in the morning or in the evening? Why?',
  'How do you usually spend your weekends?',
  'What kind of music do you enjoy listening to?',
  'Is it important to learn a foreign language? Why?',
];

const PART2_CUES = [
  { topic:'A person who influenced you', card:'Describe a person who has had a great influence on your life.\n\nYou should say:\n• who this person is\n• how you know them\n• how they influenced you\n\nAnd explain why their influence has been important to you.' },
  { topic:'A place you want to visit', card:'Describe a place you would like to visit in the future.\n\nYou should say:\n• where it is\n• what you know about it\n• why you want to visit\n\nAnd explain what you would do there.' },
];

const PART3_QS = [
  'Do you think it is important for governments to invest in arts and culture? Why?',
  'How has technology changed the way people communicate in your country?',
  'What do you think are the biggest environmental challenges facing the world today?',
];

const CRITERIA = [
  { key:'fluencyCoherence', label:'Fluency & Coherence', color:'var(--blue)' },
  { key:'lexicalResource', label:'Lexical Resource', color:'var(--teal)' },
  { key:'grammaticalRange', label:'Grammatical Range', color:'var(--purple)' },
  { key:'pronunciation', label:'Pronunciation', color:'var(--amber)' },
];

function Progress({ pct=0, color='var(--blue)' }) {
  return (
    <div style={{ background:'var(--bg3)', borderRadius:10, height:5, overflow:'hidden', flex:1 }}>
      <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:.6, ease:'easeOut' }} style={{ height:'100%', background:color, borderRadius:10 }} />
    </div>
  );
}

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

export default function SpeakingModule() {
  const [tab, setTab] = useState('part1');
  const [qIdx, setQIdx] = useState(0);
  const [cueIdx, setCueIdx] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isRecording, audioBlob, durationSec, waveformData, error, startRecording, stopRecording, resetRecording } = useRecording();

  const fmtTime = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  const currentQ = tab==='part1' ? PART1_QS[qIdx] : tab==='part3' ? PART3_QS[qIdx] : PART2_CUES[cueIdx].card;

  const handleTabChange = (t) => { setTab(t); resetRecording(); setFeedback(null); setQIdx(0); };
  const playQuestion = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Voice playback is not supported by this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQ);
    utterance.lang = 'en-GB';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const submitRecording = async () => {
    if (!audioBlob) { toast.error('No recording to submit'); return; }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('part', tab==='part1'?'1':tab==='part2'?'2':'3');
      formData.append('questionText', tab==='part2' ? PART2_CUES[cueIdx].card : currentQ);
      formData.append('durationSec', durationSec);
      const { submission } = await speakingAPI.submitAudio(formData);
      setFeedback(submission);
      toast.success('AI analysis complete! 🎙️');
    } catch (err) {
      // Demo feedback if API fails
      setFeedback({
        bandScore: 6.5,
        criteria: { fluencyCoherence:{band:7,feedback:'Good flow with minor hesitations. Try to avoid filler words like "um" and "uh".'}, lexicalResource:{band:6.5,feedback:'Decent vocabulary range. Incorporate more idiomatic expressions and topic-specific vocabulary.'}, grammaticalRange:{band:6,feedback:'Mix of simple and complex structures. Practice conditional and passive structures more.'}, pronunciation:{band:6.5,feedback:'Generally clear. Work on consonant clusters and sentence stress for higher bands.'} },
        strengths:['Clear topic sentences','Good use of examples','Appropriate response length'],
        improvements:['Extend answers with "for instance..." or "to elaborate..."','Use more advanced connectors (nevertheless, moreover)','Reduce repetition of the same phrases'],
        betterPhrases:[{said:'It is good',better:'It is particularly beneficial'},{said:'I think',better:'In my view / From my perspective'}],
      });
      toast.success('Demo feedback loaded (configure API for live evaluation)');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div>
      <TabBar tabs={TABS} active={tab} onChange={handleTabChange} />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Left: Question + Recording */}
        <div>
          {/* AI Examiner */}
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20, marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:36,height:36,borderRadius:'50%',background:'var(--grad)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}>🤖</div>
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>AI Examiner — Dr. Sarah</div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:7,height:7,background:'var(--green)',borderRadius:'50%',animation:'pulse 2s infinite' }}/>
                  <span style={{ fontSize:11, color:'var(--text3)' }}>Speaking Part {tab==='part1'?1:tab==='part2'?2:3}</span>
                </div>
              </div>
            </div>

            {tab === 'part2' ? (
              <div>
                <div style={{ marginBottom:10 }}>
                  {PART2_CUES.map((c,i) => (
                    <button key={i} onClick={() => { setCueIdx(i); resetRecording(); setFeedback(null); }} style={{ marginRight:6, marginBottom:4, padding:'3px 10px', fontSize:11.5, border:'1px solid', borderRadius:20, cursor:'pointer', fontFamily:'var(--font)', background:cueIdx===i?'rgba(79,142,247,.15)':'transparent', borderColor:cueIdx===i?'var(--blue)':'var(--border)', color:cueIdx===i?'var(--blue)':'var(--text3)' }}>
                      {c.topic}
                    </button>
                  ))}
                </div>
                <div style={{ background:'var(--bg3)', borderRadius:'var(--radius-sm)', padding:16, fontSize:13.5, lineHeight:1.85, whiteSpace:'pre-line', color:'var(--text)' }}>
                  {PART2_CUES[cueIdx].card}
                </div>
                <div style={{ fontSize:12, color:'var(--amber)', marginTop:10 }}>⏱️ You have 1 minute to prepare, then speak for 1–2 minutes.</div>
              </div>
            ) : (
              <div>
                <div style={{ background:'var(--bg3)', borderRadius:'var(--radius-sm)', padding:14, fontSize:14, lineHeight:1.7, fontStyle:'italic', color:'var(--text)', marginBottom:10 }}>
                  "{currentQ}"
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {(tab==='part1'?PART1_QS:PART3_QS).map((q,i) => (
                    <button key={i} onClick={() => { setQIdx(i); resetRecording(); setFeedback(null); }} style={{ padding:'3px 8px', fontSize:10.5, border:'1px solid', borderRadius:20, cursor:'pointer', fontFamily:'var(--font)', background:qIdx===i?'rgba(79,142,247,.15)':'transparent', borderColor:qIdx===i?'var(--blue)':'var(--border)', color:qIdx===i?'var(--blue)':'var(--text3)' }}>
                      Q{i+1}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={playQuestion} style={{ marginTop:12, padding:'7px 12px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', color:'var(--text2)', fontSize:12, cursor:'pointer', fontFamily:'var(--font)' }}>
              Listen to question
            </button>
          </div>

          {/* Recording Interface */}
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20 }}>
            <div style={{ textAlign:'center', padding:'16px 0' }}>
              {error && (
                <div style={{ fontSize:12.5, color:'var(--red)', marginBottom:12, background:'rgba(239,68,68,.1)', padding:'8px 12px', borderRadius:6 }}>
                  {error}
                </div>
              )}

              <div style={{ fontSize:13, color:'var(--text2)', marginBottom:16 }}>
                {isRecording ? '🔴 Recording — speak clearly and naturally'
                  : audioBlob ? '✅ Recording saved — submit for AI analysis'
                  : 'Press the button to start recording your answer'}
              </div>

              {/* Waveform */}
              {isRecording && (
                <div style={{ display:'flex', alignItems:'center', gap:3, justifyContent:'center', height:48, marginBottom:16 }}>
                  {waveformData.map((h,i) => (
                    <div key={i} style={{ width:4, height:`${h}px`, borderRadius:2, background:'var(--red)', transition:'height .08s' }} />
                  ))}
                </div>
              )}

              {/* Record button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!!audioBlob}
                style={{ width:80, height:80, borderRadius:'50%', background:isRecording?'var(--red)':'var(--card2)', border:`2px solid ${isRecording?'var(--red)':'var(--border2)'}`, cursor:audioBlob?'default':'pointer', fontSize:30, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', animation:isRecording?'recordPulse 1.5s infinite':'none', opacity:audioBlob?.5:1, transition:'all .2s' }}
              >
                {isRecording ? '⏹' : '🎤'}
              </button>

              <div style={{ fontSize:13, color:'var(--text3)', marginBottom:16 }}>{fmtTime(durationSec)}</div>

              <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
                {audioBlob && (
                  <button onClick={() => { resetRecording(); setFeedback(null); }} style={{ padding:'7px 16px', background:'none', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', color:'var(--text2)', fontSize:13, cursor:'pointer', fontFamily:'var(--font)' }}>
                    🔄 Re-record
                  </button>
                )}
                {!isRecording && !audioBlob && tab==='part1' && (
                  <button onClick={() => { setQIdx((qIdx+1)%PART1_QS.length); setFeedback(null); }} style={{ padding:'7px 16px', background:'none', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', color:'var(--text2)', fontSize:13, cursor:'pointer', fontFamily:'var(--font)' }}>
                    Skip →
                  </button>
                )}
                {audioBlob && (
                  <button onClick={submitRecording} disabled={isSubmitting} style={{ padding:'8px 20px', background:'var(--grad)', border:'none', borderRadius:'var(--radius-sm)', color:'#fff', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'var(--font)', display:'flex', alignItems:'center', gap:6, opacity:isSubmitting?.7:1 }}>
                    {isSubmitting ? (<><div style={{ width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite' }}/> Analyzing…</>) : '📊 Get AI Feedback'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Feedback */}
        <div>
          {!feedback && !isSubmitting && (
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:40, textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🎙️</div>
              <div style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>AI Speaking Evaluator</div>
              <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6, marginBottom:20 }}>
                Record your answer and receive a detailed band score across fluency, vocabulary, grammar, and pronunciation — just like a real IELTS examiner.
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, textAlign:'left' }}>
                {['Band Score (1–9)','4-Criteria Analysis','Better Phrase Suggestions','Pronunciation Tips'].map(f=>(
                  <div key={f} style={{ fontSize:12.5, color:'var(--text2)', display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ color:'var(--green)' }}>✓</span>{f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isSubmitting && (
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:48, textAlign:'center' }}>
              <div style={{ width:36,height:36,border:'3px solid rgba(79,142,247,.2)',borderTopColor:'var(--blue)',borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 16px' }}/>
              <div style={{ fontSize:14, color:'var(--text2)' }}>AI is analyzing your speech…</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginTop:6 }}>Transcribing and evaluating pronunciation, fluency, grammar, and vocabulary</div>
            </div>
          )}

          <AnimatePresence>
            {feedback && (
              <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>
                {/* Band score card */}
                <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20, marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                    <div style={{ width:32,height:32,borderRadius:'50%',background:'var(--grad)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14 }}>🤖</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:600 }}>AI Speaking Feedback</div>
                      <div style={{ fontSize:11, color:'var(--text3)' }}>Detailed evaluation report</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:32, fontWeight:800, color:'var(--blue)' }}>{feedback.bandScore}</div>
                      <div style={{ fontSize:11, color:'var(--text3)' }}>Band Score</div>
                    </div>
                  </div>
                  {CRITERIA.map(c => {
                    const val = feedback.criteria?.[c.key];
                    if (!val) return null;
                    return (
                      <div key={c.key} style={{ marginBottom:10 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                          <span style={{ color:'var(--text2)' }}>{c.label}</span>
                          <span style={{ fontWeight:700, color:c.color }}>{val.band}</span>
                        </div>
                        <Progress pct={(val.band/9)*100} color={c.color} />
                        <div style={{ fontSize:11.5, color:'var(--text3)', marginTop:3 }}>{val.feedback}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Strengths + improvements */}
                <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20, marginBottom:14 }}>
                  {feedback.strengths?.length > 0 && (
                    <div style={{ marginBottom:12 }}>
                      <div style={{ fontSize:12.5, fontWeight:600, color:'var(--green)', marginBottom:6 }}>✅ Strengths</div>
                      {feedback.strengths.map((s,i) => <div key={i} style={{ fontSize:12.5, color:'var(--text2)', marginBottom:4 }}>• {s}</div>)}
                    </div>
                  )}
                  <div style={{ height:1, background:'var(--border)', margin:'12px 0' }}/>
                  {feedback.improvements?.length > 0 && (
                    <div>
                      <div style={{ fontSize:12.5, fontWeight:600, color:'var(--amber)', marginBottom:6 }}>💡 Improvements</div>
                      {feedback.improvements.map((s,i) => <div key={i} style={{ fontSize:12.5, color:'var(--text2)', marginBottom:4 }}>• {s}</div>)}
                    </div>
                  )}
                </div>

                {/* Better phrases */}
                {feedback.betterPhrases?.length > 0 && (
                  <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20 }}>
                    <div style={{ fontSize:12.5, fontWeight:600, color:'var(--purple)', marginBottom:10 }}>🔄 Better Phrases</div>
                    {feedback.betterPhrases.map((p,i) => (
                      <div key={i} style={{ background:'var(--bg3)', borderRadius:'var(--radius-sm)', padding:'8px 10px', marginBottom:6, fontSize:12 }}>
                        <span style={{ color:'var(--red)', textDecoration:'line-through' }}>{p.said}</span>
                        {' → '}
                        <span style={{ color:'var(--green)', fontWeight:600 }}>{p.better}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
