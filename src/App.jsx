import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { UserProvider } from './context/UserContext';
import { VeterinariaProvider } from './context/VeterinariaContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TagsPage } from './pages/TagsPage';
import { LostAlertsPage } from './pages/LostAlertsPage';
import { RescueSimulatorPage } from './pages/RescueSimulatorPage';
import Home from './pages/Home';
import { api } from './api/config';
import { normalizePet } from './hooks/usePets';
import { petRepository } from './repositories/LocalStoragePetRepository';

function AppContent() {
  const [selectedPetForRescue, setSelectedPetForRescue] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadInitialPet() {
      try {
        const res = await api.get('/mascotas/?page=1&size=20');
        const items = Array.isArray(res) ? res : (res?.items || []);
        if (items.length > 0 && !selectedPetForRescue) {
          const list = items.map(normalizePet);
          const lost = list.find((p) => p.isLost);
          setSelectedPetForRescue(lost || list[0]);
          return;
        }
      } catch {
        // Fallback a localStorage si FastAPI no responde aún
      }

      petRepository.getAll().then((pets) => {
        if (pets.length > 0 && !selectedPetForRescue) {
          const lost = pets.find((p) => p.isLost);
          setSelectedPetForRescue(lost || pets[0]);
        }
      });
    }

    loadInitialPet();
  }, [selectedPetForRescue]);

  const handlePreviewNfc = (pet) => {
    setSelectedPetForRescue(pet);
    navigate('/simulador');
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<DashboardLayout onSelectPetForRescue={handlePreviewNfc} />}
      >
        <Route index element={<DashboardPage onPreviewNfc={handlePreviewNfc} />} />
        <Route path="dijes" element={<TagsPage onPreviewNfc={handlePreviewNfc} />} />
        <Route path="alertas" element={<LostAlertsPage onPreviewNfc={handlePreviewNfc} />} />
        <Route
          path="simulador"
          element={
            <RescueSimulatorPage
              selectedPet={selectedPetForRescue}
              onSelectPet={setSelectedPetForRescue}
            />
          }
        />
        <Route path="landing" element={<Home />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <UserProvider>
          <VeterinariaProvider>
            <AppContent />
          </VeterinariaProvider>
        </UserProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;

