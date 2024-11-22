import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import InventoryTable from '../components/InventoryTable';
import { InventoryEntry, DailyInventory } from '../types/inventory';
import { useInventory, useProducts } from '../hooks/useFirestore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { saveDailyInventory } from '../services/firebaseService';

const InventoryPage: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const { inventory, loading: inventoryLoading, error: inventoryError, saveInventory, loadInventory } = useInventory(selectedDate);
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const [isSaving, setIsSaving] = useState(false);
  const scrollPositionRef = useRef(0);
  const shouldPreserveScrollRef = useRef(true);

  // Wenn sich die Produktliste ändert, aktualisiere das Inventar
  useEffect(() => {
    if (inventory && products.length > 0) {
      const currentProductIds = new Set(products.map(p => p.id));
      const updatedEntries = inventory.entries.filter(entry => currentProductIds.has(entry.productId));
      
      products.forEach(product => {
        if (!inventory.entries.some(entry => entry.productId === product.id)) {
          updatedEntries.push({
            productId: product.id,
            quantity: 0,
            demand: 0,
            date: selectedDate
          });
        }
      });

      if (updatedEntries.length !== inventory.entries.length) {
        const updatedInventory: DailyInventory = {
          ...inventory,
          entries: updatedEntries
        };
        saveInventory(updatedInventory);
      }
    }
  }, [products, inventory]);

  // Scroll-Position wiederherstellen nach dem Laden
  useEffect(() => {
    if (!inventoryLoading && !productsLoading && shouldPreserveScrollRef.current) {
      window.scrollTo(0, scrollPositionRef.current);
    }
  }, [inventoryLoading, productsLoading]);

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    shouldPreserveScrollRef.current = true;
    scrollPositionRef.current = window.scrollY;
    if (inventory) {
      const updatedEntries = inventory.entries.map(entry =>
        entry.productId === productId ? { ...entry, quantity } : entry
      );
      const updatedInventory: DailyInventory = {
        ...inventory,
        entries: updatedEntries
      };
      saveInventory(updatedInventory);
    }
  };

  const handleUpdateDemand = (productId: string, demand: number) => {
    shouldPreserveScrollRef.current = true;
    scrollPositionRef.current = window.scrollY;
    if (inventory) {
      const updatedEntries = inventory.entries.map(entry =>
        entry.productId === productId ? { ...entry, demand } : entry
      );
      const updatedInventory: DailyInventory = {
        ...inventory,
        entries: updatedEntries
      };
      saveInventory(updatedInventory);
    }
  };

  const handleSave = async () => {
    if (!inventory) return;

    setIsSaving(true);
    shouldPreserveScrollRef.current = false;
    
    try {
      await saveDailyInventory({
        date: selectedDate,
        entries: inventory.entries
      });
      
      await loadInventory();
      window.scrollTo(0, 0);
      
      alert('Bestand wurde erfolgreich gespeichert!');
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern des Bestands!');
    } finally {
      setIsSaving(false);
    }
  };

  if (inventoryLoading || productsLoading) return <LoadingSpinner />;
  if (inventoryError || productsError) return <ErrorMessage message={inventoryError || productsError || 'Ein Fehler ist aufgetreten'} />;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Aktuelle Bestandsaufnahme</h2>
        <p className="text-sm text-gray-600">Bitte geben Sie die aktuellen Bestände und Bedarfsmengen ein</p>
      </div>

      <div className="mb-6">
        <label htmlFor="inventory-date" className="block text-sm font-medium text-gray-700 mb-2">
          Datum der Bestandsaufnahme
        </label>
        <input
          type="date"
          id="inventory-date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        />
        <p className="mt-2 text-sm text-gray-500">
          Aktuelles Datum: {format(new Date(selectedDate), 'EEEE, d. MMMM yyyy', { locale: de })}
        </p>
      </div>
      
      <InventoryTable
        currentInventory={inventory?.entries || []}
        previousInventory={[]}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateDemand={handleUpdateDemand}
        products={products}
      />
      
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg transition-colors ${
            isSaving 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
        >
          {isSaving ? 'Wird gespeichert...' : 'Bestand speichern'}
        </button>
      </div>
    </div>
  );
};

export default InventoryPage;