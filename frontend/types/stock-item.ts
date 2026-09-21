export const STOCK_CATEGORY_SUGGESTIONS = ['Sementes', 'Fertilizantes', 'Defensivos', 'Combustível', 'Peças'];

export type StockItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minimumQuantity: number;
  propertyId: number;
  createdAt: string;
  updatedAt: string;
};

export type StockItemInput = {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minimumQuantity: number;
  propertyId: number;
};
