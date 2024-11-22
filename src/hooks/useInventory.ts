import { useState, useEffect } from 'react';
import { Product, DailyInventory, InventoryEntry } from '../types/inventory';
import * as firebaseService from '../services/firebaseService';
import { convertInventoryEntry } from '../services/unitConversionService';
import { products as defaultProducts } from '../data/products';

export const useInventory = (date: string, currentProducts: Product[] = defaultProducts) => {
  const [inventory, setInventory] = useState<DailyInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createInitialInventory = (date: string): DailyInventory => ({
    date,
    entries: currentProducts.map(product => ({
      productId: product.id,
      quantity: 0,
      demand: 0,
      date: date
    }))
  });

  const convertInventoryUnits = (inventory: DailyInventory, products: Product[]): DailyInventory => {
    const convertedEntries = inventory.entries.map(entry => {
      const currentProduct = products.find(p => p.id === entry.productId);
      if (!currentProduct) return entry;

      // Finde das ursprüngliche Produkt aus den Standardprodukten
      const originalProduct = defaultProducts.find(p => p.id === entry.productId);
      if (!originalProduct) return entry;

      return convertInventoryEntry(entry, originalProduct, currentProduct);
    });

    return {
      ...inventory,
      entries: convertedEntries
    };
  };

  const loadInventory = async () => {
    try {
      setLoading(true);
      let loadedInventory = await firebaseService.getDailyInventory(date);
      
      if (!loadedInventory) {
        loadedInventory = createInitialInventory(date);
      } else {
        // Konvertiere die Einheiten basierend auf den aktuellen Produkteinstellungen
        loadedInventory = convertInventoryUnits(loadedInventory, currentProducts);
      }
      
      setInventory(loadedInventory);
      setError(null);
    } catch (err) {
      console.error('Fehler beim Laden des Inventars:', err);
      setInventory(createInitialInventory(date));
      setError('Verbindungsfehler: Arbeite mit lokalen Daten');
    } finally {
      setLoading(false);
    }
  };

  const saveInventory = async (updatedInventory: DailyInventory) => {
    try {
      setLoading(true);
      await firebaseService.saveDailyInventory(updatedInventory);
      setInventory(updatedInventory);
      setError(null);
    } catch (err) {
      console.error('Fehler beim Speichern des Inventars:', err);
      setInventory(updatedInventory);
      setError('Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [date, currentProducts]);

  return { inventory, loading, error, saveInventory, loadInventory };
};