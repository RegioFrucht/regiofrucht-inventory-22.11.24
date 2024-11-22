import { collection, doc, getDocs, setDoc, query, where, orderBy, Timestamp, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Product, DailyInventory } from '../types/inventory';

export const saveProductsToFirebase = async (products: Product[]) => {
  try {
    const batch = products.map(async (product) => {
      await setDoc(doc(db, 'products', product.id), {
        ...product,
        updatedAt: Timestamp.now()
      });
    });
    await Promise.all(batch);
    return true;
  } catch (error) {
    console.error('Fehler beim Speichern der Produkte:', error);
    throw error;
  }
};

export const getProductsFromFirebase = async (): Promise<Product[]> => {
  try {
    const productsSnapshot = await getDocs(collection(db, 'products'));
    return productsSnapshot.docs
      .map(doc => doc.data() as Product)
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Fehler beim Laden der Produkte:', error);
    throw error;
  }
};

export const saveDailyInventory = async (inventory: DailyInventory) => {
  try {
    const cleanedEntries = inventory.entries.map(entry => ({
      productId: entry.productId,
      quantity: Number(entry.quantity) || 0,
      demand: Number(entry.demand) || 0,
      date: inventory.date
    }));
    
    const docRef = doc(db, 'inventory', inventory.date);
    await setDoc(docRef, {
      date: inventory.date,
      entries: cleanedEntries,
      updatedAt: Timestamp.now(),
      deleted: false
    });
    
    return true;
  } catch (error) {
    console.error('Fehler beim Speichern des Inventars:', error);
    throw error;
  }
};

export const getDailyInventory = async (date: string): Promise<DailyInventory | null> => {
  try {
    const docRef = doc(db, 'inventory', date);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return docSnap.data() as DailyInventory;
  } catch (error) {
    console.error('Fehler beim Laden des Inventars:', error);
    throw error;
  }
};

export const getInventoryHistory = async (startDate: string, endDate: string, includeDeleted: boolean = false): Promise<DailyInventory[]> => {
  try {
    const q = query(
      collection(db, 'inventory'),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const inventories = snapshot.docs.map(doc => ({
      ...doc.data(),
      date: doc.id
    })) as DailyInventory[];
    
    return includeDeleted 
      ? inventories 
      : inventories.filter(inv => !inv.deleted);
  } catch (error) {
    console.error('Fehler beim Laden der Inventarhistorie:', error);
    throw error;
  }
};

export const deleteDailyInventory = async (date: string, moveToTrash: boolean = false) => {
  try {
    const docRef = doc(db, 'inventory', date);
    if (moveToTrash) {
      await updateDoc(docRef, {
        deleted: true,
        deletedAt: new Date().toISOString()
      });
    } else {
      await deleteDoc(docRef);
    }
    return true;
  } catch (error) {
    console.error('Fehler beim Löschen des Inventars:', error);
    throw error;
  }
};

export const restoreFromTrash = async (date: string) => {
  try {
    const docRef = doc(db, 'inventory', date);
    await updateDoc(docRef, {
      deleted: false,
      deletedAt: null
    });
    return true;
  } catch (error) {
    console.error('Fehler beim Wiederherstellen des Inventars:', error);
    throw error;
  }
};