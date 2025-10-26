'use client';
import React from 'react';
import Link from 'next/link';
import DishList from './DishList';
import CategoryPill from './CategoryPill';
import Banner from './Banner';

const CategoriesImage: { [key: string]: string } = {
  "Món Xào": "/img/h3.jpg",
  "Món Hấp": "/img/h5.jpg",
  "Món Nướng": "/img/h4.jpg",
};

const BannerImage: { [key: string]: string } = {
  Banner: "/img/baner.jpg",
};

const samplePopular: string[] = [
  "/img/h2.jpg",
  "/img/h4.jpg",
  "/img/h10.jpg",
];

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full h-40">
        <Banner img={BannerImage.Banner} alt="banner" />
      </div>
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between sticky top-0 bg-white z-10 shadow-sm">
        <button className="p-2 rounded-full bg-gray-100" aria-label="menu">
          <span className="block w-4 h-0.5 bg-gray-700 mb-0.5" />
          <span className="block w-4 h-0.5 bg-gray-700 mb-0.5" />
          <span className="block w-4 h-0.5 bg-gray-700" />
        </button>
        <div className="text-black font-semibold">Dishes</div>
        <button className="p-2 rounded-full bg-gray-100" aria-label="notifications">🔔</button>
      </header>

      {/* Main content */}
      <main className="px-4 pb-10">
        {/* Dishes section */}
        <DishList />

        {/* Food Categories */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Food Categories</h2>
          <div className="flex items-center gap-4 overflow-x-auto py-2">
            {[
              { label: "Món Xào", count: 15 },
              { label: "Món Hấp", count: 6 },
              { label: "Món Nướng", count: 12 },
            ].map((c) => (
              <CategoryPill key={c.label} label={c.label} count={c.count} img={CategoriesImage[c.label]} />
            ))}
          </div>
        </section>

        {/* Popular items */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-gray-800">Popular Food Item</h2>
            <Link href="#" className="text-sm text-rose-500">View All</Link>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {samplePopular.map((src, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-white shadow">
                <img src={src} alt={`popular-${i}`} className="w-full h-28 object-cover" />
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t rounded-t-xl shadow-top z-20 mx-2 mb-2">
        <div className="flex justify-around text-gray-600">
          {[
            { label: "Home", icon: "🏠" },
            { label: "Search", icon: "🔎" },
            { label: "Cart", icon: "🧺" },
            { label: "Profile", icon: "👤" },
            { label: "Order", icon: "📦" }
          ].map((item) => (
            <Link key={item.label} href={item.label === "Cart" ? "/cart" : item.label === "Order" ? "/order" : "#"} className="flex-1 py-2 text-center hover:text-gray-800">
              <div className="text-xl">{item.icon}</div>
              <div className="text-xs">{item.label}</div>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;