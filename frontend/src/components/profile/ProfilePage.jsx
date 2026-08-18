import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userAPI } from '../../services/api';
import useAuthStore from '../../context/authStore';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    country: user?.country || '',
    targetBand: user?.targetBand || 7.0,
    examType: user?.examType || 'academic',
    examDate: user?.examDate ? new Date(user.examDate).toISOString().split('T')[0] : '',
    currentLevel: user?.currentLevel || 5.5,
    currentBand: user?.currentBand || 5.5,
    studyGoal: user?.studyGoal || '',
    accountSettings: user?.accountSettings || { emailNotifications: true, darkMode: true, reminders: true },
  });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const inp = (props) => (
    <input style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'9px 14px', color:'var(--text)', fontSize:14, fontFamily:'var(--font)', outline:'none' }}
      onFocus={e=>e.target.style.borderColor='var(--blue)'}
      onBlur={e=>e.target.style.borderColor='var(--border)'}
      {...props} />
  );
  const sel = (opts, props) => (
    <select style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'9px 14px', color:'var(--text)', fontSize:14, fontFamily:'var(--font)', outline:'none' }} {...props}>
      {opts.map(([v,l])=><option key={v} value={v} style={{ background:'var(--bg2)' }}>{l}</option>)}
    </select>
  );
  const label = (text) => <label style={{ display:'block', fontSize:12.5, fontWeight:500, color:'var(--text2)', marginBottom:6 }}>{text}</label>;
  const field = (text, children) => <div style={{ marginBottom:14 }}>{label(text)}{children}</div>;

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { user: updated } = await userAPI.updateProfile(form);
      updateUser(updated);
      toast.success('Profile updated! ✅');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div style={{ maxWidth:720 }}>
      {/* Header card */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:24, marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:24 }}>
          <div style={{ width:72,height:72,borderRadius:'50%',background:'var(--grad)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:800,color:'#fff',flexShrink:0 }}>
            {user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()||'U'}
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:700 }}>{user?.name}</div>
            <div style={{ fontSize:13, color:'var(--text2)', marginTop:3 }}>{user?.email}</div>
            <div style={{ display:'flex', gap:8, marginTop:6 }}>
              <span style={{ display:'inline-flex',alignItems:'center',padding:'2px 10px',borderRadius:10,fontSize:11.5,fontWeight:500,background:'rgba(79,142,247,.15)',color:'var(--blue)' }}>{user?.examType==='academic'?'Academic':'General Training'}</span>
              <span style={{ display:'inline-flex',alignItems:'center',padding:'2px 10px',borderRadius:10,fontSize:11.5,fontWeight:500,background:user?.isPremium?'rgba(245,158,11,.15)':'rgba(90,106,133,.2)',color:user?.isPremium?'var(--amber)':'var(--text3)' }}>{user?.isPremium?'⭐ Premium':'Free Plan'}</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize:14,fontWeight:600,marginBottom:14 }}>Personal Information</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
          {field('Full Name', inp({ value:form.name, onChange:set('name'), placeholder:'Your full name' }))}
          {field('Country', inp({ value:form.country, onChange:set('country'), placeholder:'Your country' }))}
        </div>

        <div style={{ height:1, background:'var(--border)', margin:'16px 0' }}/>
        <div style={{ fontSize:14,fontWeight:600,marginBottom:14 }}>IELTS Goals</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12, marginBottom:16 }}>
          {field('Exam Type', sel([['academic','Academic'],['general','General Training']], { value:form.examType, onChange:set('examType') }))}
          {field('Current Level', sel([['4.5','4.5'],['5.0','5.0'],['5.5','5.5'],['6.0','6.0'],['6.5','6.5'],['7.0','7.0']].map(([v])=>[v,`Band ${v}`]), { value:form.currentLevel, onChange:set('currentLevel') }))}
          {field('Target Band', sel([['6.0','6.0'],['6.5','6.5'],['7.0','7.0'],['7.5','7.5'],['8.0','8.0'],['8.5','8.5'],['9.0','9.0']].map(([v])=>[v,`Band ${v}`]), { value:form.targetBand, onChange:set('targetBand') }))}
          {field('Exam Date', <input type="date" value={form.examDate} onChange={set('examDate')} style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'9px 14px', color:'var(--text)', fontSize:14, fontFamily:'var(--font)', outline:'none' }}/>) }
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
          {field('Current Band', sel([['4.5','4.5'],['5.0','5.0'],['5.5','5.5'],['6.0','6.0'],['6.5','6.5'],['7.0','7.0'],['7.5','7.5'],['8.0','8.0']], { value:form.currentBand, onChange:set('currentBand') }))}
          {field('Study Goal', inp({ value:form.studyGoal, onChange:set('studyGoal'), placeholder:'My goal for this month' }))}
        </div>
        <div style={{ display:'flex', gap:12, marginBottom:12 }}>
          <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:12.5, color:'var(--text2)' }}>
            <input type="checkbox" checked={Boolean(form.accountSettings?.emailNotifications)} onChange={(e)=>setForm(f=>({...f, accountSettings:{...f.accountSettings, emailNotifications:e.target.checked}}))} />
            Email reminders
          </label>
          <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:12.5, color:'var(--text2)' }}>
            <input type="checkbox" checked={Boolean(form.accountSettings?.reminders)} onChange={(e)=>setForm(f=>({...f, accountSettings:{...f.accountSettings, reminders:e.target.checked}}))} />
            Study reminders
          </label>
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <button onClick={saveProfile} disabled={saving} style={{ padding:'9px 22px', background:'var(--grad)', border:'none', borderRadius:8, color:'#fff', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'var(--font)', opacity:saving?.7:1, display:'flex', alignItems:'center', gap:6 }}>
            {saving?(<><div style={{ width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite' }}/>Saving…</>):'Save Changes'}
          </button>
          <button onClick={handleLogout} style={{ padding:'9px 22px', background:'rgba(239,68,68,.15)', border:'1px solid rgba(239,68,68,.3)', borderRadius:8, color:'var(--red)', fontSize:13, cursor:'pointer', fontFamily:'var(--font)' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Score summary */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20 }}>
        <div style={{ fontSize:14,fontWeight:600,marginBottom:14 }}>📊 Current Scores</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
          {[['Overall','overall','var(--blue)'],['Listening','listening','var(--teal)'],['Reading','reading','var(--green)'],['Writing','writing','var(--purple)'],['Speaking','speaking','var(--amber)']].map(([label,key,color])=>(
            <div key={key} style={{ textAlign:'center', background:'var(--bg3)', borderRadius:8, padding:14 }}>
              <div style={{ fontSize:24, fontWeight:800, color }}>{user?.scores?.[key]||'—'}</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:4 }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ height:1, background:'var(--border)', margin:'16px 0' }}/>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {[['🔥 Streak',`${user?.streak||0} days`,'var(--amber)'],['⏱️ Study Time',`${Math.floor((user?.totalStudyTimeMin||0)/60)}h`,'var(--teal)'],['📝 Tests Done',user?.testsCompleted||0,'var(--blue)']].map(([l,v,c])=>(
            <div key={l} style={{ background:'var(--bg3)', borderRadius:8, padding:12, textAlign:'center' }}>
              <div style={{ fontSize:18, fontWeight:700, color:c }}>{v}</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
