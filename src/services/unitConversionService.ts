import { Product, InventoryEntry } from '../types/inventory';

export const convertQuantityToKg = (quantity: number, unit: string, kgFactor: number): number => {
  if (unit === 'kg') return quantity;
  return quantity * kgFactor;
};

export const convertQuantityFromKg = (kgQuantity: number, targetUnit: string, kgFactor: number): number => {
  if (targetUnit === 'kg') return kgQuantity;
  return kgQuantity / kgFactor;
};

export const convertInventoryEntry = (
  entry: InventoryEntry,
  oldProduct: Product,
  newProduct: Product
): InventoryEntry => {
  if (oldProduct.unit === newProduct.unit) {
    return entry;
  }

  // Konvertiere zu kg
  const quantityInKg = convertQuantityToKg(entry.quantity, oldProduct.unit, oldProduct.kgFactor);
  const demandInKg = convertQuantityToKg(entry.demand, oldProduct.unit, oldProduct.kgFactor);

  // Konvertiere von kg zur neuen Einheit
  const newQuantity = convertQuantityFromKg(quantityInKg, newProduct.unit, newProduct.kgFactor);
  const newDemand = convertQuantityFromKg(demandInKg, newProduct.unit, newProduct.kgFactor);

  return {
    ...entry,
    quantity: Number(newQuantity.toFixed(2)),
    demand: Number(newDemand.toFixed(2))
  };
};