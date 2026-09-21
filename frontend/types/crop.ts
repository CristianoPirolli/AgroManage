export type CropStatus = 'PLANNED' | 'PLANTED' | 'GROWING' | 'HARVESTED';

export const CROP_STATUS_LABELS: Record<CropStatus, string> = {
  PLANNED: 'Planejada',
  PLANTED: 'Plantada',
  GROWING: 'Em crescimento',
  HARVESTED: 'Colhida',
};

export type Crop = {
  id: number;
  name: string;
  plantedArea: number;
  plantingDate: string;
  expectedHarvestDate: string | null;
  status: CropStatus;
  propertyId: number;
  createdAt: string;
  updatedAt: string;
};

export type CropInput = {
  name: string;
  plantedArea: number;
  plantingDate: string;
  expectedHarvestDate?: string;
  status?: CropStatus;
  propertyId: number;
};
