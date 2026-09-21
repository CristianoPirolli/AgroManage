export const ACTIVITY_CATEGORY_SUGGESTIONS = [
  'Plantio',
  'Pulverização',
  'Adubação',
  'Irrigação',
  'Colheita',
  'Manutenção',
];

export type Activity = {
  id: number;
  title: string;
  description: string | null;
  date: string;
  cost: number | null;
  category: string;
  propertyId: number;
  cropId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ActivityInput = {
  title: string;
  description?: string;
  date: string;
  cost?: number;
  category: string;
  propertyId: number;
  cropId?: number;
};
