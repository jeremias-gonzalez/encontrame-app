import { INITIAL_PET_SEEDS } from './seedData.js';

const STORAGE_KEY = 'encontrame_pets_v1';
const SIMULATED_LATENCY_MS = 250;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class LocalStoragePetRepository {
  getStorageData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.saveStorageData(INITIAL_PET_SEEDS);
        return INITIAL_PET_SEEDS;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveStorageData(INITIAL_PET_SEEDS);
        return INITIAL_PET_SEEDS;
      }
      return parsed;
    } catch (err) {
      console.warn('Error leyendo LocalStorage para encontrame, restableciendo semillas:', err);
      this.saveStorageData(INITIAL_PET_SEEDS);
      return INITIAL_PET_SEEDS;
    }
  }

  saveStorageData(pets) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
    } catch (err) {
      console.error('Error guardando en LocalStorage:', err);
      throw new Error('No se pudo guardar la información en LocalStorage (almacenamiento lleno o deshabilitado).');
    }
  }

  async getAll() {
    await sleep(SIMULATED_LATENCY_MS);
    return this.getStorageData();
  }

  async getById(id) {
    await sleep(SIMULATED_LATENCY_MS);
    const pets = this.getStorageData();
    const pet = pets.find((p) => p.id === id);
    return pet ? { ...pet } : null;
  }

  async getByTagCode(tagCode) {
    await sleep(SIMULATED_LATENCY_MS);
    const pets = this.getStorageData();
    const normalized = tagCode.trim().toUpperCase();
    const pet = pets.find((p) => p.nfcTag && p.nfcTag.tagCode.toUpperCase() === normalized);
    return pet ? { ...pet } : null;
  }

  async create(data) {
    await sleep(SIMULATED_LATENCY_MS);
    const pets = this.getStorageData();

    if (data.nfcTag?.tagCode) {
      const existing = pets.find(
        (p) => p.nfcTag?.tagCode.toUpperCase() === data.nfcTag?.tagCode.toUpperCase()
      );
      if (existing) {
        throw new Error(`El código de dije NFC "${data.nfcTag.tagCode}" ya está vinculado a otra mascota (${existing.name || existing.nombre}).`);
      }
    }

    const now = new Date().toISOString();
    const newPet = {
      ...data,
      id: `pet-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now,
    };

    const updatedList = [newPet, ...pets];
    this.saveStorageData(updatedList);
    return newPet;
  }

  async update(id, data) {
    await sleep(SIMULATED_LATENCY_MS);
    const pets = this.getStorageData();
    const index = pets.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Mascota con ID ${id} no encontrada.`);
    }

    if (data.nfcTag?.tagCode) {
      const conflict = pets.find(
        (p) => p.id !== id && p.nfcTag?.tagCode.toUpperCase() === data.nfcTag?.tagCode.toUpperCase()
      );
      if (conflict) {
        throw new Error(`El código NFC "${data.nfcTag.tagCode}" ya está asignado a ${conflict.name || conflict.nombre}.`);
      }
    }

    const current = pets[index];
    const updated = {
      ...current,
      ...data,
      guardian: {
        ...current.guardian,
        ...(data.guardian || {}),
      },
      nfcTag: data.nfcTag !== undefined ? data.nfcTag : current.nfcTag,
      updatedAt: new Date().toISOString(),
    };

    pets[index] = updated;
    this.saveStorageData(pets);
    return updated;
  }

  async delete(id) {
    await sleep(SIMULATED_LATENCY_MS);
    const pets = this.getStorageData();
    const filtered = pets.filter((p) => p.id !== id);
    if (filtered.length === pets.length) {
      return false;
    }
    this.saveStorageData(filtered);
    return true;
  }

  async toggleLostStatus(id, isLost) {
    await sleep(SIMULATED_LATENCY_MS);
    const pets = this.getStorageData();
    const index = pets.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Mascota con ID ${id} no encontrada.`);
    }

    const pet = pets[index];
    pet.isLost = isLost;
    pet.lostSince = isLost ? new Date().toISOString() : undefined;
    pet.updatedAt = new Date().toISOString();

    if (pet.nfcTag) {
      pet.nfcTag.status = isLost ? 'lost_alert' : 'active';
    }

    pets[index] = pet;
    this.saveStorageData(pets);
    return pet;
  }

  async pairNfcTag(petId, tagCode, filamentColor = 'Azul Cobalto') {
    await sleep(SIMULATED_LATENCY_MS);
    const pets = this.getStorageData();
    const normalizedTag = tagCode.trim().toUpperCase();

    const conflict = pets.find(
      (p) => p.id !== petId && p.nfcTag?.tagCode.toUpperCase() === normalizedTag
    );
    if (conflict) {
      throw new Error(`El dije NFC "${tagCode}" ya está vinculado a la mascota ${conflict.name || conflict.nombre}.`);
    }

    const index = pets.findIndex((p) => p.id === petId);
    if (index === -1) {
      throw new Error(`Mascota no encontrada.`);
    }

    const pet = pets[index];
    const newTag = {
      tagCode: normalizedTag,
      status: pet.isLost ? 'lost_alert' : 'active',
      pairedAt: new Date().toISOString(),
      lastScannedAt: undefined,
      scanCount: 0,
      filamentColor,
    };

    pet.nfcTag = newTag;
    pet.updatedAt = new Date().toISOString();

    pets[index] = pet;
    this.saveStorageData(pets);
    return pet;
  }

  async unpairNfcTag(petId) {
    await sleep(SIMULATED_LATENCY_MS);
    const pets = this.getStorageData();
    const index = pets.findIndex((p) => p.id === petId);
    if (index === -1) {
      throw new Error(`Mascota no encontrada.`);
    }

    pets[index].nfcTag = undefined;
    pets[index].updatedAt = new Date().toISOString();

    this.saveStorageData(pets);
    return pets[index];
  }

  async recordScan(tagCode) {
    await sleep(SIMULATED_LATENCY_MS);
    const pets = this.getStorageData();
    const normalized = tagCode.trim().toUpperCase();
    const index = pets.findIndex((p) => p.nfcTag?.tagCode.toUpperCase() === normalized);
    if (index === -1) {
      return null;
    }

    const pet = pets[index];
    if (pet.nfcTag) {
      pet.nfcTag.scanCount = (pet.nfcTag.scanCount || 0) + 1;
      pet.nfcTag.lastScannedAt = new Date().toISOString();
      pet.updatedAt = new Date().toISOString();
      this.saveStorageData(pets);
    }
    return pet;
  }

  async getMetrics() {
    await sleep(SIMULATED_LATENCY_MS);
    const pets = this.getStorageData();
    const totalPets = pets.length;
    const activeNfcTags = pets.filter((p) => !!p.nfcTag).length;
    const lostPetsCount = pets.filter((p) => p.isLost).length;
    const unpairedCount = totalPets - activeNfcTags;
    const totalScans = pets.reduce((acc, curr) => acc + (curr.nfcTag?.scanCount || 0), 0);

    return {
      totalPets,
      activeNfcTags,
      lostPetsCount,
      unpairedCount,
      totalScans,
    };
  }

  resetDemoData() {
    this.saveStorageData(INITIAL_PET_SEEDS);
    return INITIAL_PET_SEEDS;
  }
}

export const petRepository = new LocalStoragePetRepository();

