'use client';
import React, { useEffect, useState } from 'react';
import DishCard from './DishCard';

interface Dish {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  cooking_method: string;
  is_popular: boolean;
  rating: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface DishListProps {
  onFetchDishes?: (dishes: Dish[]) => void;
}

const DishList: React.FC<DishListProps> = ({ onFetchDishes }) => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/api/dishes/featured');
        const data = await response.json();
        console.log('API Response:', data); // Debug log

        // Check if data is an array (direct response) or has success property
        if (Array.isArray(data)) {
          // Direct array response
          const mapped: Dish[] = data.map((item: any, index: number) => ({
            id: String(index), // API chưa có id, tạm dùng index
            title: item.title,
            description: item.description,
            price: item.price,
            category: '',
            cooking_method: item.cooking_method,
            is_popular: false,
            rating: item.rating,
            image_url: item.img, // ánh xạ img -> image_url
            created_at: '',
            updated_at: '',
          }));

          console.log('Mapped dishes:', mapped);
          setDishes(mapped);
          if (onFetchDishes) onFetchDishes(mapped);
        } else if (data.success) {
          // Wrapped response with success property
          const mapped: Dish[] = data.data.map((item: any, index: number) => ({
            id: String(index),
            title: item.title,
            description: item.description,
            price: item.price,
            category: '',
            cooking_method: item.cooking_method,
            is_popular: false,
            rating: item.rating,
            image_url: item.img,
            created_at: '',
            updated_at: '',
          }));

          console.log('Mapped dishes:', mapped);
          setDishes(mapped);
          if (onFetchDishes) onFetchDishes(mapped);
        } else {
          setError('Failed to load dishes');
        }
      } catch (error) {
        setError('Error fetching dishes');
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, [onFetchDishes]);

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-800">Dishes</h2>
        <a href="/dishes" className="text-sm text-rose-500">View All</a>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dishes.map((d) => (
            <DishCard
              key={d.id}
              id={d.id}
              img={d.image_url}
              title={d.title || 'No name available'}
              rating={d.rating}
              price={d.price}
              description={d.description}
              cookingMethod={d.cooking_method}
              showDetails={true}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default DishList;
