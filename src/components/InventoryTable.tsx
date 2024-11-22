import React, { useState, useEffect, useRef } from 'react';
import { InventoryEntry, Product } from '../types/inventory';
import { products as defaultProducts } from '../data/products';

interface InventoryTableProps {
  currentInventory: InventoryEntry[];
  previousInventory: InventoryEntry[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdateDemand: (productId: string, demand: number) => void;
  products?: Product[];
  isEditing?: boolean;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  currentInventory,
  previousInventory,
  onUpdateQuantity,
  onUpdateDemand,
  products = defaultProducts,
  isEditing = true
}) => {
  const [tempValues, setTempValues] = useState<Record<string, { quantity: number; demand: number }>>({});
  const inputRefs = useRef<Record<string, { quantity: HTMLInputElement | null; demand: HTMLInputElement | null }>>({});

  useEffect(() => {
    const initialTempValues: Record<string, { quantity: number; demand: number }> = {};
    currentInventory.forEach(entry => {
      initialTempValues[entry.productId] = {
        quantity: entry.quantity,
        demand: entry.demand
      };
    });
    setTempValues(initialTempValues);

    products.forEach(product => {
      if (!inputRefs.current[product.id]) {
        inputRefs.current[product.id] = {
          quantity: null,
          demand: null
        };
      }
    });
  }, [currentInventory, products]);

  const handleQuantityBlur = (productId: string) => {
    const value = tempValues[productId]?.quantity ?? 0;
    onUpdateQuantity(productId, value);
  };

  const handleDemandBlur = (productId: string) => {
    const value = tempValues[productId]?.demand ?? 0;
    onUpdateDemand(productId, value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, productId: string, type: 'quantity' | 'demand') => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const currentProduct = products.find(p => p.id === productId);
      const currentIndex = products.indexOf(currentProduct!);
      
      if (type === 'quantity') {
        inputRefs.current[productId]?.demand?.focus();
      } else {
        const nextProduct = products[currentIndex + 1];
        if (nextProduct) {
          inputRefs.current[nextProduct.id]?.quantity?.focus();
        }
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const getQuantity = (entries: InventoryEntry[], productId: string) => {
    return entries.find(entry => entry.productId === productId)?.quantity || 0;
  };

  const getDemand = (entries: InventoryEntry[], productId: string) => {
    return entries.find(entry => entry.productId === productId)?.demand || 0;
  };

  const calculateKgValue = (value: number, product: Product) => {
    return product.unit === 'kg' ? value : value * product.kgFactor;
  };

  const renderCategory = (category: 'fruits' | 'vegetables' | 'salads') => {
    const categoryProducts = products.filter(p => p.category === category);
    const categoryName = {
      fruits: 'Obst',
      vegetables: 'Gemüse',
      salads: 'Salate'
    }[category];

    return (
      <div key={category} className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{categoryName}</h3>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <div className="min-w-full">
            {/* Mobile View */}
            <div className="md:hidden">
              {categoryProducts.map((product) => {
                const currentQuantity = tempValues[product.id]?.quantity ?? getQuantity(currentInventory, product.id);
                const currentDemand = tempValues[product.id]?.demand ?? getDemand(currentInventory, product.id);
                const quantityInKg = calculateKgValue(currentQuantity, product);
                const demandInKg = calculateKgValue(currentDemand, product);
                const needed = Math.max(0, currentDemand - currentQuantity);

                return (
                  <div key={product.id} className="p-4 border-b border-gray-200">
                    <div className="font-medium text-gray-900 mb-2">{product.name}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Bestand</label>
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <input
                              ref={el => {
                                inputRefs.current[product.id] = {
                                  ...inputRefs.current[product.id],
                                  quantity: el
                                };
                              }}
                              type="number"
                              min="0"
                              step={product.unit === 'kg' ? '0.1' : '1'}
                              value={tempValues[product.id]?.quantity ?? ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                                setTempValues(prev => ({
                                  ...prev,
                                  [product.id]: { ...prev[product.id], quantity: value }
                                }));
                              }}
                              onFocus={handleFocus}
                              onBlur={() => handleQuantityBlur(product.id)}
                              onKeyDown={(e) => handleKeyDown(e, product.id, 'quantity')}
                              className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-500">{product.unit}</span>
                          </div>
                        ) : (
                          <span>{currentQuantity} {product.unit}</span>
                        )}
                        <div className="text-sm text-gray-500 mt-1">{quantityInKg.toFixed(2)} kg</div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Bedarf</label>
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <input
                              ref={el => {
                                inputRefs.current[product.id] = {
                                  ...inputRefs.current[product.id],
                                  demand: el
                                };
                              }}
                              type="number"
                              min="0"
                              step={product.unit === 'kg' ? '0.1' : '1'}
                              value={tempValues[product.id]?.demand ?? ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                                setTempValues(prev => ({
                                  ...prev,
                                  [product.id]: { ...prev[product.id], demand: value }
                                }));
                              }}
                              onFocus={handleFocus}
                              onBlur={() => handleDemandBlur(product.id)}
                              onKeyDown={(e) => handleKeyDown(e, product.id, 'demand')}
                              className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-500">{product.unit}</span>
                          </div>
                        ) : (
                          <span>{currentDemand} {product.unit}</span>
                        )}
                        <div className="text-sm text-gray-500 mt-1">{demandInKg.toFixed(2)} kg</div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`text-sm font-medium ${needed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Noch benötigt: {needed} {product.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View */}
            <table className="hidden md:table min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produkt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Einheit
                  </th>
                  {isEditing && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vortag
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktueller Bestand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bestand in kg
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bedarfsmenge
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bedarf in kg
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Noch benötigt
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryProducts.map((product) => {
                  const currentQuantity = tempValues[product.id]?.quantity ?? getQuantity(currentInventory, product.id);
                  const currentDemand = tempValues[product.id]?.demand ?? getDemand(currentInventory, product.id);
                  const quantityInKg = calculateKgValue(currentQuantity, product);
                  const demandInKg = calculateKgValue(currentDemand, product);
                  const needed = Math.max(0, currentDemand - currentQuantity);
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.unit}
                      </td>
                      {isEditing && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getQuantity(previousInventory, product.id)} {product.unit}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <input
                              ref={el => {
                                inputRefs.current[product.id] = {
                                  ...inputRefs.current[product.id],
                                  quantity: el
                                };
                              }}
                              type="number"
                              min="0"
                              step={product.unit === 'kg' ? '0.1' : '1'}
                              value={tempValues[product.id]?.quantity ?? ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                                setTempValues(prev => ({
                                  ...prev,
                                  [product.id]: { ...prev[product.id], quantity: value }
                                }));
                              }}
                              onFocus={handleFocus}
                              onBlur={() => handleQuantityBlur(product.id)}
                              onKeyDown={(e) => handleKeyDown(e, product.id, 'quantity')}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-500">{product.unit}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-900">{currentQuantity} {product.unit}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {quantityInKg.toFixed(2)} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <input
                              ref={el => {
                                inputRefs.current[product.id] = {
                                  ...inputRefs.current[product.id],
                                  demand: el
                                };
                              }}
                              type="number"
                              min="0"
                              step={product.unit === 'kg' ? '0.1' : '1'}
                              value={tempValues[product.id]?.demand ?? ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                                setTempValues(prev => ({
                                  ...prev,
                                  [product.id]: { ...prev[product.id], demand: value }
                                }));
                              }}
                              onFocus={handleFocus}
                              onBlur={() => handleDemandBlur(product.id)}
                              onKeyDown={(e) => handleKeyDown(e, product.id, 'demand')}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-500">{product.unit}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-900">{currentDemand} {product.unit}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {demandInKg.toFixed(2)} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${needed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {needed} {product.unit}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {(['fruits', 'vegetables', 'salads'] as const).map(category => renderCategory(category))}
    </div>
  );
};

export default InventoryTable;