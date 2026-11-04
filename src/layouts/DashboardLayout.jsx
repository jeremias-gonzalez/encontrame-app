import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from '../components/Navigation/Sidebar';
import { TopBar } from '../components/Navigation/TopBar';
import { PetModal } from '../components/Dashboard/PetModal';
import { NfcPairingModal } from '../components/Dashboard/NfcPairingModal';
import { UserModal } from '../components/Modals/UserModal';
import { VeterinariaModal } from '../components/Modals/VeterinariaModal';
import { useToast } from '../context/ToastContext';
import { usePets } from '../hooks/usePets';

export function DashboardLayout({ onSelectPetForRescue }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isVetModalOpen, setIsVetModalOpen] = useState(false);
  const [pairingPet, setPairingPet] = useState(null);

  const {
    pets,
    metrics,
    createPet,
    pairTag,
    resetToSeeds,
  } = usePets();

  const { showToast } = useToast();

  const handleSavePet = async (data) => {
    await createPet(data);
    showToast('Paciente Registrado', `${data.nombre || data.name} fue guardado/a exitosamente en el sistema.`, 'success');
  };

  const handleConfirmPair = async (petId, tagCode, filamentColor) => {
    await pairTag(petId, tagCode, filamentColor);
    showToast('Dije Vinculado con Éxito', `Dije ${tagCode} (${filamentColor}) asignado al collar.`, 'success');
    setPairingPet(null);
  };

  const handleResetDemoData = async () => {
    if (window.confirm('¿Restablecer los datos demo en LocalStorage?')) {
      await resetToSeeds();
      showToast('Datos Semilla Restaurados', 'El almacenamiento ha sido reiniciado a su estado inicial.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-background text-text flex relative">
      {/* 1. Sidebar Desktop (Fijo a la izquierda) */}
      <div className="hidden md:block">
        <Sidebar
          metrics={metrics}
          onOpenCreatePet={() => setIsCreateModalOpen(true)}
          onOpenPairTag={() => {
            const firstUnpaired = pets.find((p) => !p.nfcTag) || pets[0];
            if (firstUnpaired) setPairingPet(firstUnpaired);
          }}
          onOpenCreateUser={() => setIsUserModalOpen(true)}
          onOpenCreateVeterinaria={() => setIsVetModalOpen(true)}
          onResetDemo={handleResetDemoData}
        />
      </div>

      {/* 2. Drawer Móvil para pantallas táctiles */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 md:hidden"
            >
              <Sidebar
                metrics={metrics}
                onOpenCreatePet={() => {
                  setMobileMenuOpen(false);
                  setIsCreateModalOpen(true);
                }}
                onOpenPairTag={() => {
                  setMobileMenuOpen(false);
                  const firstUnpaired = pets.find((p) => !p.nfcTag) || pets[0];
                  if (firstUnpaired) setPairingPet(firstUnpaired);
                }}
                onOpenCreateUser={() => {
                  setMobileMenuOpen(false);
                  setIsUserModalOpen(true);
                }}
                onOpenCreateVeterinaria={() => {
                  setMobileMenuOpen(false);
                  setIsVetModalOpen(true);
                }}
                onResetDemo={() => {
                  setMobileMenuOpen(false);
                  handleResetDemoData();
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Área Principal a la Derecha del Sidebar */}
      <div className="flex-1 flex flex-col min-w-0">
  

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Modales globales de alta y vinculación */}
      <PetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSavePet}
      />

      <NfcPairingModal
        isOpen={!!pairingPet}
        onClose={() => setPairingPet(null)}
        pet={pairingPet}
        onConfirmPair={handleConfirmPair}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSuccess={() => {
          showToast('Usuario Creado', 'Nuevo usuario registrado exitosamente en FastAPI.', 'success');
        }}
      />

      <VeterinariaModal
        isOpen={isVetModalOpen}
        onClose={() => setIsVetModalOpen(false)}
        onSuccess={() => {
          showToast('Veterinaria Guardada', 'Clínica veterinaria registrada en FastAPI.', 'success');
        }}
      />
    </div>
  );
}

export default DashboardLayout;

