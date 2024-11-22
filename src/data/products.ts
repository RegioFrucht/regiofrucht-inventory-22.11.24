import { Product } from '../types/inventory';

const defaultProducts: Product[] = [
  // Fruits
  { id: 'ananas', name: 'Ananas', category: 'fruits', unit: 'Stück', order: 1, kgFactor: 1.8 },
  { id: 'aepfel', name: 'Äpfel', category: 'fruits', unit: 'kg', order: 2, kgFactor: 1 },
  { id: 'aepfel-schaelware', name: 'Äpfel Schälware', category: 'fruits', unit: 'kg', order: 3, kgFactor: 1 },
  { id: 'kiwi', name: 'Kiwi', category: 'fruits', unit: 'kg', order: 4, kgFactor: 1 },
  { id: 'mango', name: 'Mango', category: 'fruits', unit: 'Stück', order: 5, kgFactor: 0.3 },
  { id: 'melone-can-char', name: 'Melone Can/Char', category: 'fruits', unit: 'Stück', order: 6, kgFactor: 2.5 },
  { id: 'melone-galia', name: 'Melone Galia', category: 'fruits', unit: 'Stück', order: 7, kgFactor: 1.8 },
  { id: 'melone-honig', name: 'Melone Honig', category: 'fruits', unit: 'Stück', order: 8, kgFactor: 2 },
  { id: 'orangen', name: 'Orangen', category: 'fruits', unit: 'kg', order: 9, kgFactor: 1 },
  { id: 'trauben-rot', name: 'Trauben rot', category: 'fruits', unit: 'kg', order: 10, kgFactor: 1 },
  { id: 'wassermelonen', name: 'Wassermelonen', category: 'fruits', unit: 'Stück', order: 11, kgFactor: 8 },
  
  // Vegetables
  { id: 'aubergine', name: 'Aubergine', category: 'vegetables', unit: 'kg', order: 12, kgFactor: 1 },
  { id: 'blumenkohl', name: 'Blumenkohl', category: 'vegetables', unit: 'Stück', order: 13, kgFactor: 1.2 },
  { id: 'brokkoli', name: 'Brokkoli', category: 'vegetables', unit: 'Stück', order: 14, kgFactor: 0.5 },
  { id: 'champignon', name: 'Champignon Br./Weiß', category: 'vegetables', unit: 'kg', order: 15, kgFactor: 1 },
  { id: 'fenchel', name: 'Fenchel', category: 'vegetables', unit: 'Stück', order: 16, kgFactor: 0.3 },
  { id: 'gurken', name: 'Gurken', category: 'vegetables', unit: 'Stück', order: 17, kgFactor: 0.4 },
  { id: 'karotten', name: 'Karotten', category: 'vegetables', unit: 'kg', order: 18, kgFactor: 1 },
  { id: 'kohlrabi', name: 'Kohlrabi', category: 'vegetables', unit: 'Stück', order: 19, kgFactor: 0.4 },
  { id: 'kuerbis', name: 'Kürbis', category: 'vegetables', unit: 'kg', order: 20, kgFactor: 1 },
  { id: 'lauch', name: 'Lauch', category: 'vegetables', unit: 'kg', order: 21, kgFactor: 1 },
  { id: 'paprika', name: 'Paprika R/Ge/Grü', category: 'vegetables', unit: 'kg', order: 22, kgFactor: 1 },
  { id: 'radieschen', name: 'Radieschen', category: 'vegetables', unit: 'Bund', order: 23, kgFactor: 0.1 },
  { id: 'rote-bete', name: 'Rote Bete', category: 'vegetables', unit: 'kg', order: 24, kgFactor: 1 },
  { id: 'rettich-weiss', name: 'Rettich weiß', category: 'vegetables', unit: 'Stück', order: 25, kgFactor: 0.4 },
  { id: 'rotkohl', name: 'Rotkohl', category: 'vegetables', unit: 'Stück', order: 26, kgFactor: 1.5 },
  { id: 'sellerie', name: 'Sellerie', category: 'vegetables', unit: 'Stück', order: 27, kgFactor: 0.8 },
  { id: 'tomaten', name: 'Tomaten', category: 'vegetables', unit: 'kg', order: 28, kgFactor: 1 },
  { id: 'weisskohl', name: 'Weißkohl', category: 'vegetables', unit: 'Stück', order: 29, kgFactor: 2 },
  { id: 'wirsing', name: 'Wirsing', category: 'vegetables', unit: 'Stück', order: 30, kgFactor: 1.2 },
  { id: 'zucchini', name: 'Zucchini', category: 'vegetables', unit: 'kg', order: 31, kgFactor: 1 },
  { id: 'zwiebeln', name: 'Zwiebeln weiß / Rot', category: 'vegetables', unit: 'kg', order: 32, kgFactor: 1 },
  
  // Salads
  { id: 'chinakohl', name: 'Chinakohl', category: 'salads', unit: 'Stück', order: 33, kgFactor: 1.2 },
  { id: 'eisberg', name: 'Eisberg', category: 'salads', unit: 'Stück', order: 34, kgFactor: 0.8 },
  { id: 'endivien', name: 'Endivien', category: 'salads', unit: 'Stück', order: 35, kgFactor: 0.5 },
  { id: 'frisee', name: 'Frisee', category: 'salads', unit: 'Stück', order: 36, kgFactor: 0.4 },
  { id: 'lollo-bionda', name: 'Lollo Bionda', category: 'salads', unit: 'Stück', order: 37, kgFactor: 0.3 },
  { id: 'lollo-rosso', name: 'Lollo Rosso', category: 'salads', unit: 'Stück', order: 38, kgFactor: 0.3 },
  { id: 'rhadiccio', name: 'Rhadiccio', category: 'salads', unit: 'Stück', order: 39, kgFactor: 0.4 },
  { id: 'petersilie', name: 'Petersilie', category: 'salads', unit: 'Bund', order: 40, kgFactor: 0.03 },
  { id: 'schnittlauch', name: 'Schnittlauch', category: 'salads', unit: 'Bund', order: 41, kgFactor: 0.02 },
  { id: 'ruccula', name: 'Ruccula', category: 'salads', unit: 'kg', order: 42, kgFactor: 1 }
];

// Lade gespeicherte Produkte oder verwende Standardprodukte
const loadProducts = (): Product[] => {
  const savedProducts = localStorage.getItem('products');
  if (savedProducts) {
    return JSON.parse(savedProducts);
  }
  return defaultProducts;
};

// Speichere Produkte im localStorage
export const saveProducts = (products: Product[]) => {
  localStorage.setItem('products', JSON.stringify(products));
};

export const products = loadProducts();