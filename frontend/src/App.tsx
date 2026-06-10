import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AccountPage } from './pages/AccountPage';
import { ChatPage } from './pages/ChatPage';
import { FightingPage } from './pages/FightingPage';
import { LoginPage } from './pages/LoginPage';
import { RoulettePage } from './pages/RoulettePage';
import { SignupPage } from './pages/SignupPage';
import { StartPage } from './pages/StartPage';
import { VideoSlotsPage } from './pages/VideoSlotsPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<AppLayout />}>
        <Route index element={<StartPage />} />
        <Route path="/home" element={<StartPage />} />
        <Route path="/fighting" element={<FightingPage />} />
        <Route path="/roulette" element={<RoulettePage />} />
        <Route path="/video-slots" element={<VideoSlotsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
