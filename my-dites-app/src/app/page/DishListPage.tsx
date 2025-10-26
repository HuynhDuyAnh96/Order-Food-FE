'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DishCard from '../components/DishCard';
import { Dish } from '../type/Dish';
import { CookingMethod } from '../type/CookingMethod';
import Link from 'next/link';

// API Response interfaces
interface ApiDishItem {
  id: string;
  name: string;
  description: string;
  price: number;
  cooking_method: string;
  featured?: boolean;
  rating: number;
  image_url: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    dishes: ApiDishItem[];
  };
}

const DishListPage: React.FC = () => {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Danh sách phương pháp chế biến
  const cookingMethods: CookingMethod[] = [
    { id: 'all', name: 'Tất cả', icon: '🍽️' },
    { id: 'stir-fried', name: 'Món Xào', icon: '🍳' },
    { id: 'grilled', name: 'Món Nướng', icon: '🔥' },
    { id: 'steamed', name: 'Món Hấp', icon: '♨️' },
  ];

  useEffect(() => {
    const fetchDishes = async () => {
      setLoading(true);
      setError(null);

      try {
        let fetchedDishes: Dish[] = [];

        if (selectedMethod === 'all') {
          // Fetch all dishes from the main endpoint
          const response = await fetch('http://localhost:8080/api/dishes');
          const data: ApiResponse = await response.json();
          
          if (data.success && data.data.dishes) {
            // Map API data to match Dish interface
            fetchedDishes = data.data.dishes.map((item: ApiDishItem) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              category: '',
              cookingMethod: item.cooking_method,
              is_popular: item.featured || false,
              rating: item.rating,
              image_url: item.image_url,
              created_at: '',
              updated_at: '',
            }));
            fetchedDishes.sort((a, b) => b.rating - a.rating);
          } else {
            setError('Không thể tải dữ liệu món ăn');
          }
        } else {
          // Filter dishes by cooking method from the main endpoint
          const response = await fetch('http://localhost:8080/api/dishes');
          const data: ApiResponse = await response.json();

          if (data.success && data.data.dishes) {
            // Filter by cooking method and map data
            const filteredDishes = data.data.dishes.filter((dish: ApiDishItem) => 
              dish.cooking_method === selectedMethod
            );
            
            fetchedDishes = filteredDishes.map((item: ApiDishItem) => ({
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              category: '',
              cookingMethod: item.cooking_method,
              is_popular: item.featured || false,
              rating: item.rating,
              image_url: item.image_url,
              created_at: '',
              updated_at: '',
            }));
          } else {
            setError(`Không thể tải dữ liệu cho ${selectedMethod}`);
          }
        }

        setDishes(fetchedDishes);
      } catch (err) {
        setError('Lỗi khi tải dữ liệu món ăn');
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, [selectedMethod]);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-white z-10 shadow-sm">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-gray-100">
          ←
        </button>
        <div className="text-lg font-semibold">Tất cả món ăn</div>
        <button className="p-2 rounded-full bg-gray-100 opacity-0" aria-hidden="true">
          •
        </button>
      </header>

      {/* Filter by cooking method */}
      <section className="px-4 py-3 bg-white mb-4">
        <div className="flex overflow-x-auto gap-2 py-2">
          {cookingMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full flex items-center gap-2 ${
                selectedMethod === method.id ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span className="text-lg">{method.icon}</span>
              <span>{method.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Dish list */}
      <main className="px-4">
        {loading && <div className="text-center py-10 text-gray-500">Đang tải...</div>}
        {error && <div className="text-center py-10 text-red-500">{error}</div>}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-4">
            {dishes.map((dish) => (
              <DishCard
                key={dish.id}
                id={dish.id} // Thêm id
                img={dish.image_url}
                title={dish.name}
                rating={dish.rating}
                price={dish.price}
                description={dish.description}
                cookingMethod={dish.cookingMethod}
                showDetails={true}
              />
            ))}
          </div>
        )}
        {!loading && !error && dishes.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            Không có món ăn nào trong danh mục này
          </div>
        )}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t rounded-t-xl shadow-top z-20 mx-2 mb-2">
          <div className="flex justify-around text-gray-600">
            {[
              { label: "Home", icon: "🏠" },
              { label: "Search", icon: "🔎" },
              { label: "Cart", icon: "🧺" },
              { label: "Profile", icon: "👤" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.label === "Cart" ? "/cart" : "/"}
                className="flex-1 py-2 text-center hover:text-gray-800"
              >
                <div className="text-xl">{item.icon}</div>
                <div className="text-xs">{item.label}</div>
              </Link>
            ))}
          </div>
      </nav>
    </div>
  );
};

export default DishListPage;