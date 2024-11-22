import React, { useState } from 'react';
import Header from './components/Header';
import InventoryPage from './pages/InventoryPage';
import ArchivePage from './pages/ArchivePage';
import ProductManagementPage from './pages/ProductManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TrashPage from './pages/TrashPage';
import Navigation from './components/Navigation';

function App() {
  const [currentPage, setCurrentPage] = useState<'inventory' | 'archive' | 'products' | 'analytics' | 'trash'>('inventory');

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {currentPage === 'inventory' && <InventoryPage />}
        {currentPage === 'archive' && <ArchivePage />}
        {currentPage === 'products' && <ProductManagementPage />}
        {currentPage === 'analytics' && <AnalyticsPage />}
        {currentPage === 'trash' && <TrashPage />}
      </main>
    </div>
  );
}

export default App;