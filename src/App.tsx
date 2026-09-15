import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { isAuth0Configured, auth0Config } from './lib/auth0';
import { PlayerProvider } from './features/player/PlayerContext';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import LibraryPage from './pages/LibraryPage';
import LikedSongsPage from './pages/LikedSongsPage';
import HistoryPage from './pages/HistoryPage';
import Top50Page from './pages/Top50Page';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import SettingsPage from './pages/SettingsPage';

const AppContent: React.FC = () => {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="liked" element={<LikedSongsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="top50" element={<Top50Page />} />
            <Route path="playlist/:id" element={<PlaylistDetailPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </PlayerProvider>
    </BrowserRouter>
  );
};

export const App: React.FC = () => {
  if (isAuth0Configured) {
    return (
      <Auth0Provider
        domain={auth0Config.domain}
        clientId={auth0Config.clientId}
        authorizationParams={auth0Config.authorizationParams}
      >
        <AppContent />
      </Auth0Provider>
    );
  }

  return <AppContent />;
};

export default App;
