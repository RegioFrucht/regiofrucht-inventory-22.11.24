import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { useProducts } from '../hooks/useFirestore';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { getInventoryHistory } from '../services/firebaseService';
import { DailyInventory, Product } from '../types/inventory';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { BarChart as BarChartIcon, TrendingUp, PieChart as PieChartIcon, Calendar } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'custom'>('week');
  const [startDate, setStartDate] = useState(format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [inventoryHistory, setInventoryHistory] = useState<DailyInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { products, loading: productsLoading } = useProducts();

  useEffect(() => {
    const loadInventoryHistory = async () => {
      try {
        setLoading(true);
        let start = startDate;
        let end = endDate;

        if (timeRange === 'week') {
          end = format(new Date(), 'yyyy-MM-dd');
          start = format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        } else if (timeRange === 'month') {
          end = format(new Date(), 'yyyy-MM-dd');
          start = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        }
        
        const history = await getInventoryHistory(start, end);
        if (history.length === 0) {
          setError('Keine Daten für den ausgewählten Zeitraum verfügbar');
          return;
        }
        setInventoryHistory(history);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Historiedaten:', err);
        setError('Fehler beim Laden der Historiedaten');
      } finally {
        setLoading(false);
      }
    };

    if (!productsLoading) {
      loadInventoryHistory();
    }
  }, [timeRange, startDate, endDate, productsLoading]);

  const handleTimeRangeChange = (newRange: 'week' | 'month' | 'custom') => {
    setTimeRange(newRange);
  };

  const calculateTotalKg = (entries: DailyInventory['entries'], productId: string): number => {
    const entry = entries.find(e => e.productId === productId);
    if (!entry) return 0;

    const product = products.find(p => p.id === productId);
    if (!product) return 0;

    return product.unit === 'kg' ? entry.quantity : entry.quantity * product.kgFactor;
  };

  const prepareInventoryTrendData = () => {
    if (!inventoryHistory.length) return [];
    
    return inventoryHistory
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(day => ({
        date: format(parseISO(day.date), 'd. MMM', { locale: de }),
        bestand: day.entries.reduce((total, entry) => {
          return total + calculateTotalKg(day.entries, entry.productId);
        }, 0)
      }));
  };

  const prepareTopProductsData = () => {
    if (!inventoryHistory.length || !products.length) return [];

    const latestInventory = inventoryHistory[0];
    return products
      .map(product => ({
        name: product.name,
        menge: calculateTotalKg(latestInventory.entries, product.id)
      }))
      .sort((a, b) => b.menge - a.menge)
      .slice(0, 5);
  };

  const prepareCategoryData = () => {
    if (!inventoryHistory.length || !products.length) return [];

    const latestInventory = inventoryHistory[0];
    const categoryTotals = {
      fruits: 0,
      vegetables: 0,
      salads: 0
    };

    products.forEach(product => {
      const kgAmount = calculateTotalKg(latestInventory.entries, product.id);
      categoryTotals[product.category] += kgAmount;
    });

    return [
      { name: 'Obst', value: categoryTotals.fruits },
      { name: 'Gemüse', value: categoryTotals.vegetables },
      { name: 'Salate', value: categoryTotals.salads }
    ].filter(item => item.value > 0);
  };

  if (loading || productsLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!inventoryHistory.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-600 text-center">Keine Daten verfügbar für den ausgewählten Zeitraum.</p>
      </div>
    );
  }

  const inventoryTrendData = prepareInventoryTrendData();
  const topProductsData = prepareTopProductsData();
  const categoryData = prepareCategoryData();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800">Auswertungen</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTimeRangeChange('week')}
              className={`px-4 py-2 rounded-lg ${
                timeRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Woche
            </button>
            <button
              onClick={() => handleTimeRangeChange('month')}
              className={`px-4 py-2 rounded-lg ${
                timeRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Monat
            </button>
            <button
              onClick={() => handleTimeRangeChange('custom')}
              className={`px-4 py-2 rounded-lg ${
                timeRange === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Benutzerdefiniert
            </button>
          </div>
        </div>

        {timeRange === 'custom' && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Startdatum
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Enddatum
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Zeitraum: {format(parseISO(startDate), 'd. MMMM yyyy', { locale: de })} bis {format(parseISO(endDate), 'd. MMMM yyyy', { locale: de })}
            </p>
          </div>
        )}

        {inventoryTrendData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Bestandsentwicklung (kg)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={inventoryTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="bestand"
                      name="Gesamtbestand (kg)"
                      stroke="#0088FE"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {topProductsData.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Produkte (kg)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProductsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="menge" name="Menge (kg)" fill="#00C49F">
                        {topProductsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {categoryData.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Kategorieverteilung</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, value }) => `${name}: ${value.toFixed(1)} kg`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;