import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from './context/authStore';
import Sidebar from './components/shared/Sidebar';
import Topbar from './components/shared/Topbar';
import AITutorChat from './components/shared/AITutorChat';
import Dashboard from './components/dashboard/Dashboard';
import ListeningModule from './components/listening/ListeningModule';
import ReadingModule from './components/reading/ReadingModule';
import WritingModule from './components/writing/WritingModule';
import SpeakingModule from './components/speaking/SpeakingModule';
import VocabularyBuilder from './components/vocabulary/VocabularyBuilder';
import StudyPlanPage from './components/studyplan/StudyPlanPage';
import MockTestPage from './components/mocktest/MockTestPage';
import LeaderboardPage from './components/leaderboard/LeaderboardPage';
import Analytics from './components/analytics/Analytics';
import AdminPanel from './components/admin/AdminPanel';
import ProfilePage from './components/profile/ProfilePage';
import { LoginForm } from './components/auth/AuthForms';

const fade = { initial:{opacity:0,y:6}, animate:{opacity:1,y:0}, exit:{opacity:0}, transition:{duration:0.18} };

function Spinner() {
  return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
    <div style={{ width:28, height:28, border:'2px solid rgba(255,255,255,.1)', borderTopColor:'var(--blue)', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
  </div>;
}

function Protected({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <Spinner />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppLayout({ children }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar />
      <div style={{ marginLeft:'var(--sidebar-width)', flex:1, display:'flex', flexDirection:'column' }}>
        <Topbar />
        <div style={{ padding:'24px', flex:1 }}>
          <AnimatePresence mode="wait">{children}</AnimatePresence>
        </div>
      </div>
      <AITutorChat />
    </div>
  );
}

function Page({ children }) {
  return <motion.div {...fade}>{children}</motion.div>;
}

function AuthGuard({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  const { hydrate, completeGoogleAuth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const refresh = searchParams.get('refresh');
    const auth = searchParams.get('auth');

    if (auth === 'success' && token) {
      completeGoogleAuth(token, refresh).then(() => {
        navigate('/dashboard', { replace: true });
      });
      return;
    }

    hydrate();
  }, [completeGoogleAuth, hydrate, navigate, searchParams]);

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/login" element={<AuthGuard><LoginForm /></AuthGuard>} />
      <Route path="/register" element={<Navigate to="/login" replace />} />
      {[
        ['/dashboard', <Dashboard />],
        ['/listening', <ListeningModule />],
        ['/reading', <ReadingModule />],
        ['/writing', <WritingModule />],
        ['/speaking', <SpeakingModule />],
        ['/vocabulary', <VocabularyBuilder />],
        ['/study-plan', <StudyPlanPage />],
        ['/mock-tests', <MockTestPage />],
        ['/leaderboard', <LeaderboardPage />],
        ['/analytics', <Analytics />],
        ['/admin', <AdminPanel />],
        ['/profile', <ProfilePage />],
      ].map(([path, el]) => (
        <Route key={path} path={path} element={
          <Protected><AppLayout><Page key={path}>{el}</Page></AppLayout></Protected>
        } />
      ))}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
