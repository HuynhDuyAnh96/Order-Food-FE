// type/Dish.ts
export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  cookingMethod: string;
  is_popular: boolean;
  rating: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}