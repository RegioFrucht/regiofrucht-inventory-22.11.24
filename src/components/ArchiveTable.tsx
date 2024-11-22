import React from 'react';
import { InventoryEntry } from '../types/inventory';
import { products } from '../data/products';

interface ArchiveTableProps {
  inventory: InventoryEntry[];
}

const ArchiveTable: React.FC<ArchiveTableProps> = ({ inventory }) => {
  const getQuantity = (productId: string) => {
    return inventory.find(entry => entry.productId === productId)?.quantity || 0;
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produkt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Einheit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bestand
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getQuantity(product.id)} {product.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default ArchiveTable;