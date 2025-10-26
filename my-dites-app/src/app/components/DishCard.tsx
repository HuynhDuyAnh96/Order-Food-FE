


import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

interface DishCardProps {
  id: string;
  img: string;
  title: string;
  rating?: number;
  price?: number;
  description?: string;
  cookingMethod?: string;
  showDetails?: boolean;
}

const DishCard: React.FC<DishCardProps> = ({
  id,
  img,
  title,
  rating,
  price,
  description,
  cookingMethod,
  showDetails = false
}) => {
  const { addToCart } = useCart();
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleAddToCart = () => {
    if (id && price) {
      addToCart({
        id,
        name: title,
        price,
        img,
        quantity: 1,
      });
      
      // Show success notification
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden relative">
      {/* Success notification */}
      {showSuccess && (
        <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm z-10 animate-pulse">
          ✓ Đã thêm vào giỏ hàng!
        </div>
      )}
      
      <div className="relative h-40">
        <img 
          src={img} 
          alt={title} 
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center' }}
        />
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-800">{title}</h3>
        
        {showDetails && (
          <>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
            {cookingMethod && (
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mt-2">
                {cookingMethod === 'stir-fry' && 'Món xào'}
                {cookingMethod === 'grilled' && 'Món nướng'}
                {cookingMethod === 'steamed' && 'Món hấp'}
                {cookingMethod === 'fried' && 'Món chiên'}
                {cookingMethod === 'soup' && 'Món soup'}
              </span>
            )}
          </>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center">
            {rating && (
              <>
                <span className="text-amber-500">★</span>
                <span className="text-sm text-gray-600 ml-1">{rating}</span>
              </>
            )}
          </div>
          <div className='flex items-center gap-2'>
            {price && (
              <span className="font-semibold text-rose-600">
                {price.toLocaleString('vi-VN')}₫
              </span>
            )}
            <button onClick={handleAddToCart} className="ml-2 px-3 py-1 bg-rose-600 text-white rounded hover:bg-rose-700">
              Them
            </button>
          </div>
        
        </div>
      </div>
    </div>
  );
};

export default DishCard;