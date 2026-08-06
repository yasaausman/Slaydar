export type Garment = {
  garment_id: string;
  owner_id: string;
  category: string;
  color: string;
  material: string;
  brand: string | null;
  style_tags: string[];
  wear_count: number;
  last_worn_date: string | null;
  cost_per_wear: number | null;
  condition_score: number;
  status: "active" | "flagged-overworn" | "flagged-unworn" | "listed-for-resale";
};

export const mockGarments: Garment[] = [
  {
    garment_id: "g-001",
    owner_id: "u-demo",
    category: "t-shirt",
    color: "black",
    material: "cotton",
    brand: "Uniqlo",
    style_tags: ["casual"],
    wear_count: 14,
    last_worn_date: "2026-08-03",
    cost_per_wear: 0.71,
    condition_score: 79,
    status: "active",
  },
  {
    garment_id: "g-002",
    owner_id: "u-demo",
    category: "jacket",
    color: "olive",
    material: "canvas",
    brand: "Carhartt",
    style_tags: ["streetwear", "casual"],
    wear_count: 2,
    last_worn_date: "2026-06-14",
    cost_per_wear: 45.0,
    condition_score: 95,
    status: "flagged-unworn",
  },
  {
    garment_id: "g-003",
    owner_id: "u-demo",
    category: "dress-shirt",
    color: "white",
    material: "cotton",
    brand: "Brooks Brothers",
    style_tags: ["formal"],
    wear_count: 5,
    last_worn_date: "2026-08-04",
    cost_per_wear: 12.0,
    condition_score: 88,
    status: "active",
  },
  {
    garment_id: "g-004",
    owner_id: "u-demo",
    category: "t-shirt",
    color: "black",
    material: "cotton",
    brand: "H&M",
    style_tags: ["casual"],
    wear_count: 22,
    last_worn_date: "2026-08-05",
    cost_per_wear: 0.45,
    condition_score: 52,
    status: "flagged-overworn",
  },
  {
    garment_id: "g-005",
    owner_id: "u-demo",
    category: "sneakers",
    color: "white",
    material: "leather",
    brand: "Adidas",
    style_tags: ["casual", "streetwear"],
    wear_count: 30,
    last_worn_date: "2026-08-05",
    cost_per_wear: 2.33,
    condition_score: 61,
    status: "active",
  },
];
