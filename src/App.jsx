import React, { useLayoutEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { UserProvider } from './context/UserContext';
import { VeterinariaProvider } from './context/VeterinariaContext';
import { TagProvider } from './context/TagContext';
import { PetProvider, usePets } from './hooks/usePets';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { TagsPage } from './pages/TagsPage';
import { TagManagementPage } from './pages/TagManagementPage';
import { UsersPage } from './pages/UsersPage';
import { VeterinariasPage } from './pages/VeterinariasPage';
import { PetDetailsPage } from './pages/PetDetailsPage';
import { LostAlertsPage } from './pages/LostAlertsPage';
import { RescueSimulatorPage } from './pages/RescueSimulatorPage';
import { AuthPage } from './pages/AuthPage';
import { PublicScanPage } from './pages/PublicScanPage';
import Home from './pages/Home';

function DashboardRoutes() {
  const [selectedPetForRescue, setSelectedPetForRescue] = useState(null);
  const navigate = useNavigate();
  const { pets } = usePets();
  const activePetForRescue = selectedPetForRescue || pets.find((pet) => pet.isLost) || pets[0] || null;

  const handlePreviewNfc = (pet) => {
    setSelectedPetForRescue(pet);
    navigate('/simulador');
  };

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardPage onPreviewNfc={handlePreviewNfc} />} />
        <Route path="dijes" element={<TagsPage onPreviewNfc={handlePreviewNfc} />} />
        <Route path="tags" element={<TagManagementPage />} />
        <Route path="usuarios" element={<UsersPage />} />
        <Route path="veterinarias" element={<VeterinariasPage />} />
        <Route path="mascotas/:id" element={<PetDetailsPage />} />
        <Route path="alertas" element={<LostAlertsPage onPreviewNfc={handlePreviewNfc} />} />
        <Route path="simulador" element={<RescueSimulatorPage selectedPet={activePetForRescue} onSelectPet={setSelectedPetForRescue} />} />
        <Route path="landing" element={<Home />} />
      </Route>
    </Routes>
  );
}

function WorkspaceProviders() {
  return (
    <VeterinariaProvider>
      <TagProvider>
        <PetProvider>
          <DashboardRoutes />
        </PetProvider>
      </TagProvider>
    </VeterinariaProvider>
  );
}

function AppContent() {
  return (
    <Routes>
      <Route path="/iniciar-sesion" element={<AuthPage />} />
      <Route path="/scan/:identificador" element={<PublicScanPage />} />
      <Route path="/*" element={<WorkspaceProviders />} />
    </Routes>
  );
}

export function App() {
  useLayoutEffect(() => {
    const theme = localStorage.getItem('nfc-pets-theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
