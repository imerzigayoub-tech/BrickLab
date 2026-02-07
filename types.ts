
export type BrickType =
  | '1x1' | '1x2' | '1x3' | '1x4' | '1x6' | '1x8' | '2x2' | '2x3' | '2x4' | '2x6' | '4x4' | '6x6' | '8x8'
  | '1x1P' | '1x2P' | '1x3P' | '1x4P' | '1x6P' | '2x2P' | '2x3P' | '2x4P' | '4x4P' | '4x6P' | '6x6P' | '8x8P'
  | '1x1T' | '1x2T' | '1x4T' | '2x2T' | '2x4T' | '4x4T' // Tiles
  | '1x1R' | '2x2R' | '4x4R' | '1x1H' | '2x2C' // Rounds/Curves
  | '1x1CN' | '2x2CN' // Cones
  | '1x1S' | '1x2S' | '2x2S' | '1x2S_Low' // Slopes
  | '1x1CS' | '1x2CS' | '2x2CS' // Curved Slopes
  | '1x1IS' | '1x2IS' | '2x2IS' // Inverted Slopes
  | '2x2W_L' | '2x2W_R' | '3x3W_L' | '3x3W_R' | '4x4W_L' | '4x4W_R' // Wedges (Triangular)
  | '1x2B' | '1x2B_Inv' // Brackets (SNOT)
  | '1x2G' | '1x1_Ingot' // Detail
  | '1x2A' | '1x4A' | '1x6A' // Arches
  | '1x1FL' | '1x1LF' // Botanical
  | 'MF_Head' | 'MF_Torso' | 'MF_Legs';

export type SymmetryAxis = 'none' | 'X' | 'Z';
export type WorldTheme = 'studio' | 'meadow' | 'desert' | 'ocean' | 'mars';

export interface BrickInstance {
  id: string;
  type: BrickType;
  color: string;
  position: [number, number, number];
  rotation: number;
  groupId?: string;
  roughness?: number;
  metalness?: number;
}

export interface GhostPart {
  type: BrickType;
  color: string;
  offset: [number, number, number];
  rotation: number;
  id?: string;
  roughness?: number;
  metalness?: number;
}


export interface AppState {
  bricks: BrickInstance[];
  selectedIds: string[];
  selectedColor: string;
  selectedType: BrickType;
  rotation: number;
  symmetryAxis: SymmetryAxis;
  worldTheme: WorldTheme;
  addBrick: (brick: Omit<BrickInstance, 'id'>) => void;
  removeBricks: (ids: string[]) => void;
  setSelectedColor: (color: string) => void;
  setSelectedType: (type: BrickType) => void;
  setRotation: (rot: number) => void;
  setSelectedIds: (ids: string[]) => void;
  setWorldTheme: (theme: WorldTheme) => void;
  groupSelectedBricks: () => void;
  ungroupSelectedBricks: () => void;
  duplicateSelectedBricks: () => void;
  clearAll: () => void;
}
