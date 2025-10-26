// components/CategoryPill.tsx
import React from 'react'



interface CategoryPillProps {
  label: string
  count: number
  img?: string
}


const CategoryPill: React.FC<CategoryPillProps> = ({ label, count, img }) => {
  return (
    <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm w-40 min-w-max">
      <div className="flex items-center space-x-2">
        {img ? (
          <img 
            src={img} 
            alt={label} 
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <span className="w-6 h-6 bg-gray-200 rounded-full inline-block" aria-label="icon" />
        )}
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span className="text-xs text-gray-500">{count} items</span>
    </div>
  )
}

export default CategoryPill