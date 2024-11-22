import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Trash2, RefreshCw, XCircle } from 'lucide-react';
import { DailyInventory } from '../types/inventory';
import { getInventoryHistory, restoreFromTrash, deleteDailyInventory } from '../services/firebaseService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import InventoryTable from '../components/InventoryTable';

const TrashPage: React.FC = () => {
  const [deletedInventories, setDeletedInventories] = useState<DailyInventory[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDeletedInventories = async () => {
    try {
      setLoading(true);
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      const history = await getInventoryHistory(startDate, endDate, true);
      setDeletedInventories(history.filter(inv => inv.deleted));
      setError(null);
    } catch (err) {
      console.error('Fehler beim Laden der gelöschten Einträge:', err);
      setError('Fehler beim Laden der gelöschten Einträge');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeletedInventories();
  }, []);

  const handleRestore = async (date: string) => {
    try {
      await restoreFromTrash(date);
      await loadDeletedInventories();
      setSelectedDate(null);
    } catch (error) {
      console.error('Fehler beim Wiederherstellen:', error);
      alert('Fehler beim Wiederherstellen des Eintrags');
    }
  };

  const handleDelete = async (date: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Eintrag endgültig löschen möchten? Dies kann nicht rückgängig gemacht werden!')) {
      try {
        await deleteDailyInventory(date);
        await loadDeletedInventories();
        setSelectedDate(null);
      } catch (error) {
        console.error('Fehler beim endgültigen Löschen:', error);
        alert('Fehler beim Löschen des Eintrags');
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Trash2 className="h-5 w-5 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-800">Papierkorb</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Hier finden Sie kürzlich gelöschte Einträge. Diese können wiederhergestellt oder endgültig gelöscht werden.
        </p>

        {deletedInventories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Der Papierkorb ist leer
          </div>
        ) : (
          <div className="space-y-4">
            {deletedInventories.map((inventory) => (
              <div key={inventory.date} className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 rounded-t-lg border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">
                      {format(new Date(inventory.date), 'EEEE, d. MMMM yyyy', { locale: de })}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Gelöscht am: {format(new Date(inventory.deletedAt || ''), 'd. MMMM yyyy, HH:mm', { locale: de })} Uhr
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRestore(inventory.date)}
                      className="p-2 text-green-600 hover:text-green-800 flex items-center"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Wiederherstellen
                    </button>
                    <button
                      onClick={() => handleDelete(inventory.date)}
                      className="p-2 text-red-600 hover:text-red-800 flex items-center"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Endgültig löschen
                    </button>
                  </div>
                </div>
                {selectedDate === inventory.date && (
                  <div className="p-4">
                    <InventoryTable
                      currentInventory={inventory.entries}
                      previousInventory={[]}
                      onUpdateQuantity={() => {}}
                      onUpdateDemand={() => {}}
                      isEditing={false}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashPage;