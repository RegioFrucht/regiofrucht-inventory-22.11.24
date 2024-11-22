import { useState, useEffect } from 'react';
import { Product, DailyInventory } from '../types/inventory';
import * as firebaseService from '../services/firebaseService';
import { products as defaultProducts } from '../data/products';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const loadedProducts = await firebaseService.getProductsFromFirebase();
      if (loadedProducts.length > 0) {
        setProducts(loadedProducts);
      }
      setError(null);
    } catch (err) {
      console.error('Fehler beim Laden der Produkte:', err);
      setProducts(defaultProducts);
      setError('Verbindungsfehler: Arbeite mit lokalen Daten');
    } finally {
      setLoading(false);
    }
  };

  const saveProducts = async (updatedProducts: Product[]) => {
    try {
      setLoading(true);
      await firebaseService.saveProductsToFirebase(updatedProducts);
      setProducts(updatedProducts);
      setError(null);
    } catch (err) {
      console.error('Fehler beim Speichern der Produkte:', err);
      setError('Fehler beim Speichern');
      setProducts(updatedProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return { products, loading, error, saveProducts, loadProducts };
};

export const useInventory = (date: string) => {
  const [inventory, setInventory] = useState<DailyInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createInitialInventory = (date: string): DailyInventory => ({
    date,
    entries: defaultProducts.map(product => ({
      productId: product.id,
      quantity: 0,
      demand: 0,
      date: date
    }))
  });

  const loadInventory = async () => {
    try {
      setLoading(true);
      let loadedInventory = await firebaseService.getDailyInventory(date);
      
      if (!loadedInventory) {
        loadedInventory = createInitialInventory(date);
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
  }, [date]);

  return { inventory, loading, error, saveInventory, loadInventory };
};