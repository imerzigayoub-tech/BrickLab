
import { BrickType, WorldTheme } from './types';

export const BRICK_UNIT = 1.0; 
export const BRICK_HEIGHT = 1.2; 
export const PLATE_HEIGHT = 0.4; 
export const STUD_HEIGHT = 0.2;
export const STUD_RADIUS = 0.3125; 
export const SMALL_GAP = 0.01; 

export type BrickShape = 'box' | 'cylinder' | 'cone' | 'slope' | 'curved_slope' | 'inv_slope' | 'wedge_l' | 'wedge_r' | 'arch' | 'tile' | 'flower' | 'leaf' | 'minifig' | 'grille' | 'bracket' | 'ingot';

export const BRICK_METADATA: Record<BrickType, { w: number; d: number; h: number; label: string; shape?: BrickShape }> = {
  '1x1': { w: 1, d: 1, h: BRICK_HEIGHT, label: '1x1 Brick' },
  '1x2': { w: 1, d: 2, h: BRICK_HEIGHT, label: '1x2 Brick' },
  '1x3': { w: 1, d: 3, h: BRICK_HEIGHT, label: '1x3 Brick' },
  '1x4': { w: 1, d: 4, h: BRICK_HEIGHT, label: '1x4 Brick' },
  '1x6': { w: 1, d: 6, h: BRICK_HEIGHT, label: '1x6 Brick' },
  '1x8': { w: 1, d: 8, h: BRICK_HEIGHT, label: '1x8 Brick' },
  '2x2': { w: 2, d: 2, h: BRICK_HEIGHT, label: '2x2 Brick' },
  '2x3': { w: 2, d: 3, h: BRICK_HEIGHT, label: '2x3 Brick' },
  '2x4': { w: 2, d: 4, h: BRICK_HEIGHT, label: '2x4 Brick' },
  '2x6': { w: 2, d: 6, h: BRICK_HEIGHT, label: '2x6 Brick' },
  '4x4': { w: 4, d: 4, h: BRICK_HEIGHT, label: '4x4 Brick' },
  '6x6': { w: 6, d: 6, h: BRICK_HEIGHT, label: '6x6 Brick' },
  '8x8': { w: 8, d: 8, h: BRICK_HEIGHT, label: '8x8 Brick' },
  '1x1P': { w: 1, d: 1, h: PLATE_HEIGHT, label: '1x1 Plate' },
  '1x2P': { w: 1, d: 2, h: PLATE_HEIGHT, label: '1x2 Plate' },
  '1x3P': { w: 1, d: 3, h: PLATE_HEIGHT, label: '1x3 Plate' },
  '1x4P': { w: 1, d: 4, h: PLATE_HEIGHT, label: '1x4 Plate' },
  '1x6P': { w: 1, d: 6, h: PLATE_HEIGHT, label: '1x6 Plate' },
  '2x2P': { w: 2, d: 2, h: PLATE_HEIGHT, label: '2x2 Plate' },
  '2x3P': { w: 2, d: 3, h: PLATE_HEIGHT, label: '2x3 Plate' },
  '2x4P': { w: 2, d: 4, h: PLATE_HEIGHT, label: '2x4 Plate' },
  '4x4P': { w: 4, d: 4, h: PLATE_HEIGHT, label: '4x4 Plate' },
  '4x6P': { w: 4, d: 6, h: PLATE_HEIGHT, label: '4x6 Plate' },
  '6x6P': { w: 6, d: 6, h: PLATE_HEIGHT, label: '6x6 Plate' },
  '8x8P': { w: 8, d: 8, h: PLATE_HEIGHT, label: '8x8 Plate' },
  '1x1T': { w: 1, d: 1, h: PLATE_HEIGHT, label: '1x1 Tile', shape: 'tile' },
  '1x2T': { w: 1, d: 2, h: PLATE_HEIGHT, label: '1x2 Tile', shape: 'tile' },
  '1x4T': { w: 1, d: 4, h: PLATE_HEIGHT, label: '1x4 Tile', shape: 'tile' },
  '2x2T': { w: 2, d: 2, h: PLATE_HEIGHT, label: '2x2 Tile', shape: 'tile' },
  '2x4T': { w: 2, d: 4, h: PLATE_HEIGHT, label: '2x4 Tile', shape: 'tile' },
  '4x4T': { w: 4, d: 4, h: PLATE_HEIGHT, label: '4x4 Tile', shape: 'tile' },
  '1x1_Ingot': { w: 1, d: 1, h: PLATE_HEIGHT, label: 'Ingot', shape: 'ingot' },
  '1x2G': { w: 1, d: 2, h: PLATE_HEIGHT, label: 'Grille', shape: 'grille' },
  '1x1S': { w: 1, d: 1, h: BRICK_HEIGHT, label: '1x1 Slope 30', shape: 'slope' },
  '1x2S': { w: 1, d: 2, h: BRICK_HEIGHT, label: '1x2 Slope 45', shape: 'slope' },
  '2x2S': { w: 2, d: 2, h: BRICK_HEIGHT, label: '2x2 Slope 45', shape: 'slope' },
  '1x2S_Low': { w: 1, d: 2, h: PLATE_HEIGHT, label: '1x2 Slope Low', shape: 'slope' },
  '1x1CS': { w: 1, d: 1, h: PLATE_HEIGHT, label: '1x1 Curved Slope', shape: 'curved_slope' },
  '1x2CS': { w: 1, d: 2, h: PLATE_HEIGHT, label: '1x2 Curved Slope', shape: 'curved_slope' },
  '2x2CS': { w: 2, d: 2, h: PLATE_HEIGHT, label: '2x2 Curved Slope', shape: 'curved_slope' },
  '1x1IS': { w: 1, d: 1, h: BRICK_HEIGHT, label: '1x1 Inv. Slope', shape: 'inv_slope' },
  '1x2IS': { w: 1, d: 2, h: BRICK_HEIGHT, label: '1x2 Inv. Slope', shape: 'inv_slope' },
  '2x2IS': { w: 2, d: 2, h: BRICK_HEIGHT, label: '2x2 Inv. Slope', shape: 'inv_slope' },
  '2x2W_L': { w: 2, d: 2, h: PLATE_HEIGHT, label: '2x2 Wedge L', shape: 'wedge_l' },
  '2x2W_R': { w: 2, d: 2, h: PLATE_HEIGHT, label: '2x2 Wedge R', shape: 'wedge_r' },
  '3x3W_L': { w: 3, d: 3, h: PLATE_HEIGHT, label: '3x3 Wedge L', shape: 'wedge_l' },
  '3x3W_R': { w: 3, d: 3, h: PLATE_HEIGHT, label: '3x3 Wedge R', shape: 'wedge_r' },
  '4x4W_L': { w: 4, d: 4, h: PLATE_HEIGHT, label: '4x4 Wedge L', shape: 'wedge_l' },
  '4x4W_R': { w: 4, d: 4, h: PLATE_HEIGHT, label: '4x4 Wedge R', shape: 'wedge_r' },
  '1x2B': { w: 1, d: 2, h: PLATE_HEIGHT, label: '1x2 Bracket', shape: 'bracket' },
  '1x2B_Inv': { w: 1, d: 2, h: PLATE_HEIGHT, label: '1x2 Inv. Bracket', shape: 'bracket' },
  '1x2A': { w: 1, d: 2, h: BRICK_HEIGHT, label: '1x2 Arch', shape: 'arch' },
  '1x4A': { w: 1, d: 4, h: BRICK_HEIGHT, label: '1x4 Arch', shape: 'arch' },
  '1x6A': { w: 1, d: 6, h: BRICK_HEIGHT, label: '1x6 Arch', shape: 'arch' },
  '1x1R': { w: 1, d: 1, h: PLATE_HEIGHT, label: '1x1 Round Plate', shape: 'cylinder' },
  '2x2R': { w: 2, d: 2, h: BRICK_HEIGHT, label: '2x2 Round Brick', shape: 'cylinder' },
  '4x4R': { w: 4, d: 4, h: BRICK_HEIGHT, label: '4x4 Round Brick', shape: 'cylinder' },
  '2x2C': { w: 2, d: 2, h: BRICK_HEIGHT, label: 'Macaroni Curve', shape: 'cylinder' },
  '1x1H': { w: 1, d: 1, h: BRICK_HEIGHT, label: 'Plate w/ Hole', shape: 'cylinder' },
  '1x1CN': { w: 1, d: 1, h: BRICK_HEIGHT, label: '1x1 Cone', shape: 'cone' },
  '2x2CN': { w: 2, d: 2, h: BRICK_HEIGHT, label: '2x2 Cone', shape: 'cone' },
  '1x1FL': { w: 1, d: 1, h: PLATE_HEIGHT, label: 'Flower', shape: 'flower' },
  '1x1LF': { w: 1, d: 1, h: PLATE_HEIGHT, label: 'Leaf', shape: 'leaf' },
  'MF_Legs': { w: 1, d: 1, h: 0.8, label: 'Minifig Legs', shape: 'minifig' },
  'MF_Torso': { w: 1, d: 1, h: 1.0, label: 'Minifig Torso', shape: 'minifig' },
  'MF_Head': { w: 1, d: 1, h: 0.8, label: 'Minifig Head', shape: 'cylinder' },
};

export const LEGO_COLORS = [
  { name: 'Bright Red', hex: '#C91A09' },
  { name: 'Bright Blue', hex: '#0055BF' },
  { name: 'Earth Blue', hex: '#19325A' },
  { name: 'Bright Yellow', hex: '#F2CD37' },
  { name: 'Dark Green', hex: '#237841' },
  { name: 'Sand Green', hex: '#A0BCAC' },
  { name: 'Black', hex: '#1B2A34' },
  { name: 'White', hex: '#F2F3F2' },
  { name: 'Dark Red', hex: '#720E0F' },
  { name: 'Dark Orange', hex: '#A95500' },
  { name: 'Medium Azure', hex: '#36AEBF' },
  { name: 'Lime', hex: '#BBE90B' },
  { name: 'Reddish Brown', hex: '#583927' },
  { name: 'Flat Silver', hex: '#898788', metalness: 0.8, roughness: 0.2 },
  { name: 'Metallic Gold', hex: '#B8860B', metalness: 1.0, roughness: 0.1 },
  { name: 'Trans-Blue', hex: '#4488ff99', transparent: true },
  { name: 'Trans-Neon Green', hex: '#B2EC5DCC', transparent: true },
  { name: 'Trans-Purple', hex: '#6B3FA099', transparent: true },
];

export const WORLD_THEMES: Record<WorldTheme, { groundColor: string; sunPosition: [number, number, number]; fogColor: string; label: string; icon: string }> = {
  studio: { groundColor: '#94a3b8', sunPosition: [5, 10, 8], fogColor: '#f8fafc', label: 'Studio', icon: 'fa-clapperboard' },
  meadow: { groundColor: '#237841', sunPosition: [10, 10, 10], fogColor: '#e0f2fe', label: 'Meadow', icon: 'fa-leaf' },
  desert: { groundColor: '#fde68a', sunPosition: [2, 10, 2], fogColor: '#fef3c7', label: 'Desert', icon: 'fa-sun' },
  ocean: { groundColor: '#0c4a6e', sunPosition: [0, 5, 10], fogColor: '#075985', label: 'Ocean', icon: 'fa-water' },
  mars: { groundColor: '#92400e', sunPosition: [5, 2, 5], fogColor: '#7c2d12', label: 'Mars', icon: 'fa-rocket' },
};

export const BRICK_TYPES = Object.keys(BRICK_METADATA) as BrickType[];

export interface PrefabPart {
  type: BrickType;
  color: string;
  offset: [number, number, number];
  rotation: number;
}

export interface Prefab {
  id: string;
  label: string;
  parts: PrefabPart[];
  icon: string;
}

export const PREFABS: Prefab[] = [
  {
    id: 'grand-oak',
    label: 'Grand Oak Tree',
    icon: 'fa-tree',
    parts: [
      { type: '2x2R', color: '#583927', offset: [0, 0, 0], rotation: 0 },
      { type: '2x2R', color: '#583927', offset: [0, BRICK_HEIGHT, 0], rotation: 0 },
      { type: '1x1CN', color: '#583927', offset: [0, BRICK_HEIGHT * 2, 0], rotation: 0 },
      { type: '4x4P', color: '#237841', offset: [0, BRICK_HEIGHT * 2 + PLATE_HEIGHT, 0], rotation: 0.5 },
      { type: '6x6P', color: '#237841', offset: [0, BRICK_HEIGHT * 2.5, 0], rotation: 0 },
      { type: '4x4P', color: '#A0BCAC', offset: [0, BRICK_HEIGHT * 3, 0], rotation: -0.5 },
      { type: '2x2P', color: '#237841', offset: [0, BRICK_HEIGHT * 3.5, 0], rotation: 0 },
    ]
  },
  {
    id: 'weeping-willow',
    label: 'Weeping Willow',
    icon: 'fa-spa',
    parts: [
      { type: '2x2R', color: '#583927', offset: [0, 0, 0], rotation: 0 },
      { type: '2x2R', color: '#583927', offset: [0, BRICK_HEIGHT, 0], rotation: 0 },
      { type: '2x2R', color: '#583927', offset: [0, BRICK_HEIGHT * 2, 0], rotation: 0 },
      { type: '4x4R', color: '#237841', offset: [0, BRICK_HEIGHT * 3, 0], rotation: 0 },
      { type: '1x1LF', color: '#A0BCAC', offset: [2, BRICK_HEIGHT * 2.5, 0], rotation: Math.PI / 2 },
      { type: '1x1LF', color: '#A0BCAC', offset: [-2, BRICK_HEIGHT * 2.5, 0], rotation: -Math.PI / 2 },
      { type: '1x1LF', color: '#A0BCAC', offset: [0, BRICK_HEIGHT * 2.5, 2], rotation: 0 },
      { type: '1x1LF', color: '#A0BCAC', offset: [0, BRICK_HEIGHT * 2.5, -2], rotation: Math.PI },
    ]
  },
  {
    id: 'cypress-spire',
    label: 'Cypress Spire',
    icon: 'fa-seedling',
    parts: [
      { type: '1x1R', color: '#583927', offset: [0, 0, 0], rotation: 0 },
      { type: '1x1CN', color: '#237841', offset: [0, PLATE_HEIGHT, 0], rotation: 0 },
      { type: '2x2CN', color: '#237841', offset: [0, PLATE_HEIGHT + BRICK_HEIGHT, 0], rotation: 0 },
      { type: '1x1CN', color: '#A0BCAC', offset: [0, PLATE_HEIGHT + BRICK_HEIGHT * 2, 0], rotation: 0 },
    ]
  },
  {
    id: 'cyber-ramen',
    label: 'Neon Ramen Stand',
    icon: 'fa-bowl-food',
    parts: [
      { type: '4x6P', color: '#1B2A34', offset: [0, 0, 0], rotation: 0 },
      { type: '1x4', color: '#720E0F', offset: [2.5, BRICK_HEIGHT / 2, 0], rotation: Math.PI / 2 },
      { type: '1x4', color: '#720E0F', offset: [-2.5, BRICK_HEIGHT / 2, 0], rotation: Math.PI / 2 },
      { type: '4x6P', color: '#F2F3F2', offset: [0, BRICK_HEIGHT, 0], rotation: 0 },
      { type: '1x2G', color: '#B2EC5DCC', offset: [0, BRICK_HEIGHT + PLATE_HEIGHT, 2.5], rotation: 0 },
      { type: '1x1_Ingot', color: '#B8860B', offset: [2.2, BRICK_HEIGHT, 2.2], rotation: 0 },
      { type: '1x1R', color: '#C91A09', offset: [-2, BRICK_HEIGHT + PLATE_HEIGHT, -2.5], rotation: 0 },
    ]
  },
  {
    id: 'modernist-villa',
    label: 'Modernist Villa',
    icon: 'fa-house-chimney-window',
    parts: [
      { type: '8x8P', color: '#F2F3F2', offset: [0, 0, 0], rotation: 0 },
      { type: '1x6', color: '#1B2A34', offset: [3.5, PLATE_HEIGHT + BRICK_HEIGHT / 2, 0], rotation: Math.PI / 2 },
      { type: '1x6', color: '#1B2A34', offset: [-3.5, PLATE_HEIGHT + BRICK_HEIGHT / 2, 0], rotation: Math.PI / 2 },
      { type: '2x4T', color: '#4488ff99', offset: [0, PLATE_HEIGHT + BRICK_HEIGHT / 2, 3], rotation: 0 },
      { type: '8x8P', color: '#F2F3F2', offset: [0, PLATE_HEIGHT + BRICK_HEIGHT, 0], rotation: 0 },
      { type: '1x2G', color: '#583927', offset: [3.5, PLATE_HEIGHT + BRICK_HEIGHT + PLATE_HEIGHT / 2, 2], rotation: 0 },
    ]
  },
  {
    id: 'gothic-spire',
    label: 'Cathedral Spire',
    icon: 'fa-church',
    parts: [
      { type: '4x4P', color: '#898788', offset: [0, 0, 0], rotation: 0 },
      { type: '1x4A', color: '#F2F3F2', offset: [0, PLATE_HEIGHT, 0], rotation: 0 },
      { type: '1x4A', color: '#F2F3F2', offset: [0, PLATE_HEIGHT, 0], rotation: Math.PI / 2 },
      { type: '2x2', color: '#898788', offset: [0, PLATE_HEIGHT + BRICK_HEIGHT, 0], rotation: 0 },
      { type: '2x2CN', color: '#1B2A34', offset: [0, PLATE_HEIGHT + BRICK_HEIGHT * 2, 0], rotation: 0 },
      { type: '1x1_Ingot', color: '#B8860B', offset: [0, PLATE_HEIGHT + BRICK_HEIGHT * 3, 0], rotation: 0.78 },
    ]
  },
  {
    id: 'orion-capsule',
    label: 'Orion Spacecraft',
    icon: 'fa-shuttle-space',
    parts: [
      { type: '4x4', color: '#F2F3F2', offset: [0, 0, 0], rotation: 0 },
      { type: '2x2W_L', color: '#0055BF', offset: [2.5, 0, 0], rotation: 0 },
      { type: '2x2W_R', color: '#0055BF', offset: [-2.5, 0, 0], rotation: Math.PI },
      { type: '2x2CN', color: '#B8860B', offset: [0, 0, -3], rotation: -Math.PI / 2 },
      { type: '1x2S', color: '#4488ff99', offset: [0, BRICK_HEIGHT, 1], rotation: 0 },
    ]
  },
  {
    id: 'grand-piano',
    label: 'Grand Piano',
    icon: 'fa-music',
    parts: [
      { type: '4x4P', color: '#1B2A34', offset: [0, BRICK_HEIGHT, 0], rotation: 0 },
      { type: '1x1R', color: '#1B2A34', offset: [1.8, 0, 1.8], rotation: 0 },
      { type: '1x1R', color: '#1B2A34', offset: [-1.8, 0, 1.8], rotation: 0 },
      { type: '1x1R', color: '#1B2A34', offset: [0, 0, -1.8], rotation: 0 },
      { type: '1x4T', color: '#F2F3F2', offset: [0, BRICK_HEIGHT + PLATE_HEIGHT, 2], rotation: 0 },
      { type: '2x2S', color: '#1B2A34', offset: [0, BRICK_HEIGHT + PLATE_HEIGHT * 2, 0], rotation: Math.PI },
    ]
  },
  {
    id: 'fusion-core-x',
    label: 'Fusion Reactor',
    icon: 'fa-radiation',
    parts: [
      { type: '4x4R', color: '#1B2A34', offset: [0, 0, 0], rotation: 0 },
      { type: '2x2R', color: '#898788', offset: [0, BRICK_HEIGHT, 0], rotation: 0 },
      { type: '1x2G', color: '#B2EC5DCC', offset: [1.5, BRICK_HEIGHT, 0], rotation: Math.PI / 2 },
      { type: '1x2G', color: '#B2EC5DCC', offset: [-1.5, BRICK_HEIGHT, 0], rotation: Math.PI / 2 },
      { type: '2x2CN', color: '#4488ff99', offset: [0, BRICK_HEIGHT * 2, 0], rotation: 0 },
    ]
  },
  {
    id: 'solar-hab',
    label: 'Solar Habitat',
    icon: 'fa-charging-station',
    parts: [
      { type: '4x4R', color: '#F2F3F2', offset: [0, 0, 0], rotation: 0 },
      { type: '4x4R', color: '#4488ff99', offset: [0, BRICK_HEIGHT, 0], rotation: 0 },
      { type: '2x4T', color: '#1B2A34', offset: [3, BRICK_HEIGHT + BRICK_HEIGHT, 0], rotation: 0.5 },
      { type: '2x4T', color: '#1B2A34', offset: [-3, BRICK_HEIGHT + BRICK_HEIGHT, 0], rotation: -0.5 },
    ]
  },
  {
    id: 'brutalist-monolith',
    label: 'The Monolith',
    icon: 'fa-monument',
    parts: [
      { type: '8x8P', color: '#898788', offset: [0, 0, 0], rotation: 0 },
      { type: '4x4', color: '#1B2A34', offset: [0, PLATE_HEIGHT, 0], rotation: 0 },
      { type: '2x2IS', color: '#1B2A34', offset: [0, PLATE_HEIGHT + BRICK_HEIGHT, 0], rotation: 0 },
      { type: '1x1_Ingot', color: '#B8860B', offset: [0, PLATE_HEIGHT + BRICK_HEIGHT * 2, 0], rotation: 0 },
    ]
  },
  {
    id: 'warp-gate-prime',
    label: 'Warp Gate',
    icon: 'fa-ring',
    parts: [
      { type: '6x6P', color: '#1B2A34', offset: [0, 0, 0], rotation: 0 },
      { type: '2x2C', color: '#898788', offset: [2, PLATE_HEIGHT, 2], rotation: 0 },
      { type: '2x2C', color: '#898788', offset: [-2, PLATE_HEIGHT, 2], rotation: Math.PI / 2 },
      { type: '2x2C', color: '#898788', offset: [-2, PLATE_HEIGHT, -2], rotation: Math.PI },
      { type: '2x2C', color: '#898788', offset: [2, PLATE_HEIGHT, -2], rotation: -Math.PI / 2 },
      { type: '2x2CN', color: '#6B3FA099', offset: [0, PLATE_HEIGHT, 0], rotation: 0 },
    ]
  },
  {
    id: 'pocket-castle',
    label: 'Pocket Fortress',
    icon: 'fa-chess-rook',
    parts: [
      { type: '6x6P', color: '#A0BCAC', offset: [0, 0, 0], rotation: 0 },
      { type: '2x2', color: '#898788', offset: [2, PLATE_HEIGHT, 2], rotation: 0 },
      { type: '2x2', color: '#898788', offset: [-2, PLATE_HEIGHT, 2], rotation: 0 },
      { type: '2x2', color: '#898788', offset: [2, PLATE_HEIGHT, -2], rotation: 0 },
      { type: '2x2', color: '#898788', offset: [-2, PLATE_HEIGHT, -2], rotation: 0 },
      { type: '1x4A', color: '#898788', offset: [0, PLATE_HEIGHT, 2], rotation: 0 },
      { type: '2x2CN', color: '#720E0F', offset: [2, PLATE_HEIGHT + BRICK_HEIGHT, 2], rotation: 0 },
    ]
  },
  {
    id: 'cyber-terminal',
    label: 'Data Port',
    icon: 'fa-terminal',
    parts: [
      { type: '2x2', color: '#1B2A34', offset: [0, 0, 0], rotation: 0 },
      { type: '1x2S', color: '#36AEBF', offset: [0, BRICK_HEIGHT, 0], rotation: 0 },
      { type: '1x2G', color: '#B2EC5DCC', offset: [0, BRICK_HEIGHT + BRICK_HEIGHT, 0], rotation: 0 },
      { type: '1x1_Ingot', color: '#898788', offset: [1, BRICK_HEIGHT, 1], rotation: 0 },
    ]
  },
  {
    id: 'botanical-statue',
    label: 'Garden Spire',
    icon: 'fa-leaf',
    parts: [
      { type: '2x2', color: '#F2F3F2', offset: [0, 0, 0], rotation: 0 },
      { type: '1x1CN', color: '#F2F3F2', offset: [0, BRICK_HEIGHT, 0], rotation: 0 },
      { type: '1x1FL', color: '#C91A09', offset: [0, BRICK_HEIGHT + PLATE_HEIGHT, 0], rotation: 0 },
      { type: '1x1LF', color: '#BBE90B', offset: [0.5, BRICK_HEIGHT, 0.5], rotation: 0.8 },
    ]
  },
  {
    id: 'steampunk-valve',
    label: 'Pressure Valve',
    icon: 'fa-gauge',
    parts: [
      { type: '2x2R', color: '#B8860B', offset: [0, 0, 0], rotation: 0 },
      { type: '1x1CN', color: '#1B2A34', offset: [0, BRICK_HEIGHT, 0], rotation: 0 },
      { type: '1x2G', color: '#898788', offset: [1, BRICK_HEIGHT, 0], rotation: 0.78 },
      { type: '1x1R', color: '#C91A09', offset: [0, BRICK_HEIGHT + BRICK_HEIGHT, 0], rotation: 0 },
    ]
  },
  {
    id: 'mayan-pyramid',
    label: 'Step Pyramid',
    icon: 'fa-monument',
    parts: [
      { type: '8x8P', color: '#A0BCAC', offset: [0, 0, 0], rotation: 0 },
      { type: '6x6P', color: '#A0BCAC', offset: [0, PLATE_HEIGHT, 0], rotation: 0 },
      { type: '4x4P', color: '#A0BCAC', offset: [0, PLATE_HEIGHT * 2, 0], rotation: 0 },
      { type: '2x2', color: '#F2F3F2', offset: [0, PLATE_HEIGHT * 3, 0], rotation: 0 },
      { type: '1x1FL', color: '#237841', offset: [3, 0, 3], rotation: 0 },
    ]
  },
  {
    id: 'micro-observatory',
    label: 'Observatory',
    icon: 'fa-binoculars',
    parts: [
      { type: '4x4R', color: '#F2F3F2', offset: [0, 0, 0], rotation: 0 },
      { type: '2x2CN', color: '#898788', offset: [1, BRICK_HEIGHT, 1], rotation: 0.5 },
      { type: '1x1CN', color: '#4488ff99', offset: [1.5, BRICK_HEIGHT + 0.8, 1.5], rotation: 0.5 },
    ]
  },
  {
    id: 'industrial-crane',
    label: 'Micro Crane',
    icon: 'fa-truck-pickup',
    parts: [
      { type: '4x4P', color: '#1B2A34', offset: [0, 0, 0], rotation: 0 },
      { type: '1x1R', color: '#F2CD37', offset: [0, PLATE_HEIGHT, 0], rotation: 0 },
      { type: '1x6P', color: '#F2CD37', offset: [2.5, PLATE_HEIGHT + PLATE_HEIGHT, 0], rotation: 0 },
      { type: '1x1CN', color: '#1B2A34', offset: [5.5, PLATE_HEIGHT, 0], rotation: 0 },
    ]
  },
  {
    id: 'micro-mech',
    label: 'Micro Mech',
    icon: 'fa-robot',
    parts: [
      { type: '2x2', color: '#898788', offset: [0, BRICK_HEIGHT, 0], rotation: 0 },
      { type: '1x1R', color: '#1B2A34', offset: [1, 0, 0], rotation: 0 },
      { type: '1x1R', color: '#1B2A34', offset: [-1, 0, 0], rotation: 0 },
      { type: '1x2G', color: '#FE8A18', offset: [0, BRICK_HEIGHT * 1.5, 1], rotation: 0 },
      { type: '1x1CN', color: '#36AEBF', offset: [0, BRICK_HEIGHT * 2, 0], rotation: 0 },
    ]
  }
];
