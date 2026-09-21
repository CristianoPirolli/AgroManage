export type Property = {
  id: number;
  name: string;
  location: string | null;
  city: string;
  state: string;
  totalArea: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type PropertyInput = {
  name: string;
  location?: string;
  city: string;
  state: string;
  totalArea: number;
};
