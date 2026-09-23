import { ChefHat, Heart, Users, Award, Leaf } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-terracotta-500 to-gold-500 flex items-center justify-center mb-4 shadow-lg">
          <ChefHat className="w-9 h-9 text-white" />
        </div>
        <h1 className="font-display text-4xl font-bold text-ink-800 mb-3">About MAHUSSI</h1>
        <p className="text-lg text-ink-500 max-w-2xl mx-auto">
          Bringing the authentic taste of Africa to your table — one pastry, one dish, one smile at a time.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="card p-6">
          <div className="w-12 h-12 rounded-xl bg-terracotta-50 flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-terracotta-500" />
          </div>
          <h3 className="font-display text-xl font-semibold text-ink-800 mb-2">Our Story</h3>
          <p className="text-sm text-ink-600 leading-relaxed">
            MAHUSSI was born from a passion for sharing the rich culinary heritage of Africa.
            From flaky pastries inspired by North African traditions to hearty West African stews,
            every dish tells a story of culture, family, and love.
          </p>
        </div>
        <div className="card p-6">
          <div className="w-12 h-12 rounded-xl bg-forest-50 flex items-center justify-center mb-4">
            <Leaf className="w-6 h-6 text-forest-500" />
          </div>
          <h3 className="font-display text-xl font-semibold text-ink-800 mb-2">Our Ingredients</h3>
          <p className="text-sm text-ink-600 leading-relaxed">
            We source the finest local ingredients — from aromatic spices to fresh produce —
            ensuring every bite is authentic, flavorful, and made with care. Our pastries are
            baked fresh daily.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        {[
          { icon: Users, value: '10K+', label: 'Happy Customers' },
          { icon: Award, value: '50+', label: 'Menu Items' },
          { icon: Heart, value: '4.8', label: 'Average Rating' },
        ].map((stat, i) => (
          <div key={i} className="card p-6 text-center">
            <stat.icon className="w-8 h-8 mx-auto text-terracotta-500 mb-2" />
            <p className="font-display text-3xl font-bold text-ink-800">{stat.value}</p>
            <p className="text-sm text-ink-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-forest-700 rounded-2xl p-8 text-center">
        <h2 className="font-display text-2xl font-bold text-cream-100 mb-3">Our Mission</h2>
        <p className="text-cream-200/80 max-w-2xl mx-auto">
          To make authentic African cuisine accessible to everyone, everywhere — while supporting
          local communities and preserving the culinary traditions that make our food special.
        </p>
      </div>
    </div>
  );
}
