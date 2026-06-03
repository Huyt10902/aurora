import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import MainLayout from "./layout/MainLayout";
import ChatPage from "./pages/chat/ChatPage";
import AlbumPage from "./pages/album/AlbumPage";
import ArtistPage from "./pages/artist/ArtistPage";
import SongDetailPage from "./pages/song/SongDetailPage";
import SubscriptionPage from "./pages/subscription/SubscriptionPage";
import AdminPage from "./pages/admin/AdminPage";
import LoginPage from "./pages/login/LoginPage";
import RegisterPage from "./pages/register/RegisterPage";
import LibraryPage from "./pages/library/LibraryPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";

import { Toaster } from "react-hot-toast";
import NotFoundPage from "./pages/404/NotFoundPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminPage />
            </ProtectedAdminRoute>
          }
        />

        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/albums/:albumId"
            element={
              <ProtectedRoute>
                <AlbumPage />
              </ProtectedRoute>
            }
          />
          <Route path="/artists/:artistId" element={<ArtistPage />} />
          <Route path="/songs/:songId" element={<SongDetailPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
