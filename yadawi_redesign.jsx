import React, { useState } from 'react';
import { MapPin, Search, Sparkles, Users, Palette, BookOpen, ChevronRight, Menu, X, Star, Clock, Award, Flame, Zap, Calendar } from 'lucide-react';

export default function YadawiHomepage() {
  const [selectedBranch, setSelectedBranch] = useState('ksa');
  const [searchActive, setSearchActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const workshops = {
    ksa: [
      {
        id: 1,
        title: 'Glass Fusing Kiln Access',
        date: 'Wednesday, April 1, 2026',
        location: 'Riyadh',
        category: 'Glasswork',
        spots: '4 spots left',
        priceMin: 875,
        priceMax: 1650,
        duration: '4-6 hours',
        level: 'All Levels',
        recommended: true,
        icon: Flame,
      },
      {
        id: 2,
        title: 'Beadmaking Taster',
        date: 'Thursday, April 2, 2026',
        location: 'Riyadh',
        category: 'Jewelry',
        spots: '8 spots left',
        priceMin: 375,
        priceMax: 375,
        duration: '3 hours',
        level: 'Beginner',
        recommended: true,
        icon: Sparkles,
      },
      {
        id: 3,
        title: 'Fusing Basics in Glass',
        date: 'Friday, April 3, 2026',
        location: 'Riyadh',
        category: 'Glasswork',
        spots: '12 spots left',
        priceMin: 5000,
        priceMax: 5000,
        duration: '5 days',
        level: 'Beginner',
        recommended: false,
        icon: Zap,
      },
      {
        id: 4,
        title: 'Torch Time Memberships',
        date: 'Ongoing',
        location: 'Riyadh',
        category: 'Membership',
        spots: 'Open',
        priceMin: 675,
        priceMax: 1300,
        duration: 'Monthly',
        level: 'All Levels',
        recommended: false,
        icon: Award,
      },
    ],
    kuwait: [
      {
        id: 5,
        title: 'Beads of Flowers',
        date: 'Tuesday, April 1, 2026',
        location: 'Kuwait City',
        category: 'Jewelry',
        spots: '6 spots left',
        priceMin: 550,
        priceMax: 550,
        duration: '3 hours',
        level: 'Intermediate',
        recommended: true,
        icon: Palette,
      },
      {
        id: 6,
        title: 'Tubular Beads Workshop',
        date: 'Wednesday, April 2, 2026',
        location: 'Kuwait City',
        category: 'Jewelry',
        spots: '10 spots left',
        priceMin: 550,
        priceMax: 550,
        duration: '3 hours',
        level: 'Beginner',
        recommended: true,
        icon: Sparkles,
      },
      {
        id: 7,
        title: 'Gravity Beads Technique',
        date: 'Thursday, April 3, 2026',
        location: 'Kuwait City',
        category: 'Jewelry',
        spots: '3 spots left',
        priceMin: 550,
        priceMax: 550,
        duration: '3 hours',
        level: 'Intermediate',
        recommended: false,
        icon: Flame,
      },
    ],
  };

  const benefits = [
    {
      icon: Users,
      title: 'Expert Artisans',
      desc: 'Learn from skilled professionals',
    },
    {
      icon: Palette,
      title: 'Creative Community',
      desc: 'Connect with makers & creators',
    },
    {
      icon: BookOpen,
      title: 'Quality Materials',
      desc: 'Premium tested tools & supplies',
    },
  ];

  const mainNav = [
    { label: 'Workshops', icon: BookOpen },
    { label: 'Shop', icon: Palette },
    { label: 'Membership', icon: Award },
    { label: 'Account', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50" style={{ backgroundColor: '#faf8f3' }}>
      {/* Header with branch selector */}
      <header className="sticky top-0 z-50 bg-white border-b border-amber-200 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-600 to-orange-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>
                Yadawi
              </h1>
            </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-amber-100 rounded-lg transition text-amber-900"
            >
              {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>

          {/* Branch Selector - Enhanced */}
          <div className="flex gap-2">
            {[
              { id: 'ksa', label: '🇸🇦 Saudi Arabia', short: 'KSA' },
              { id: 'kuwait', label: '🇰🇼 Kuwait', short: 'KWT' },
            ].map((branch) => (
              <button
                key={branch.id}
                onClick={() => setSelectedBranch(branch.id)}
                className={`flex-1 py-3 px-3 rounded-xl font-bold text-base transition-all duration-300 ${
                  selectedBranch === branch.id
                    ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg scale-105'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                {branch.short}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="border-t border-amber-200 bg-white">
            <div className="max-w-md mx-auto px-4 py-3 space-y-2">
              {mainNav.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.label}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-amber-100 transition font-bold text-lg text-amber-900 flex items-center gap-3"
                  >
                    <IconComponent className="w-6 h-6" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* Search Bar */}
      <div className="max-w-md mx-auto px-4 pt-6 pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-4 w-6 h-6 text-amber-600" />
          <input
            type="text"
            placeholder="Search workshops or products..."
            className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
            onFocus={() => setSearchActive(true)}
            onBlur={() => setSearchActive(false)}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-md mx-auto px-4 pb-6">
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: BookOpen, label: 'Workshops' },
            { icon: Palette, label: 'Shop' },
            { icon: Award, label: 'Member' },
            { icon: Users, label: 'Account' },
          ].map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.label}
                className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl hover:bg-white transition-all hover:shadow-md hover:bg-amber-100"
              >
                <IconComponent className="w-8 h-8 text-amber-600" />
                <span className="text-sm font-bold text-amber-900 text-center">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming Workshops Section */}
      <div className="max-w-md mx-auto px-4 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>
            Upcoming Events
          </h2>
          <a href="#" className="text-amber-700 hover:text-amber-900 font-bold text-base flex items-center gap-1">
            View All <ChevronRight className="w-5 h-5" />
          </a>
        </div>

        <div className="space-y-5">
          {workshops[selectedBranch].map((workshop, idx) => {
            const IconComponent = workshop.icon;
            const priceDisplay = workshop.priceMin === workshop.priceMax 
              ? `${workshop.priceMin} SAR` 
              : `${workshop.priceMin} - ${workshop.priceMax} SAR`;
            
            return (
              <div
                key={workshop.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-amber-100 relative"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Recommended Badge */}
                {workshop.recommended && (
                  <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-amber-600 to-orange-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-bold text-sm">Recommended</span>
                  </div>
                )}

                {/* Workshop Card Image Placeholder */}
                <div className="h-40 bg-gradient-to-br from-amber-300 via-orange-300 to-orange-400 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-30 flex items-center justify-center">
                    <IconComponent className="w-24 h-24 text-orange-600" />
                  </div>
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-base font-bold text-amber-900">
                    {workshop.category}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <h3 className="font-bold text-xl text-amber-900 mb-3">{workshop.title}</h3>

                  <div className="space-y-3 mb-5 text-base text-amber-800">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-amber-600" />
                      <span className="font-semibold">{workshop.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-amber-600" />
                      <span className="font-semibold">{workshop.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <span className="font-semibold">{workshop.duration}</span>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-5 bg-amber-50 p-4 rounded-xl border border-amber-200">
                    <div>
                      <p className="text-sm font-semibold text-amber-700 mb-1">LEVEL</p>
                      <p className="text-lg font-bold text-amber-900">{workshop.level}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-700 mb-1">SPOTS LEFT</p>
                      <p className="text-lg font-bold text-amber-900">{workshop.spots}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-semibold text-amber-700 mb-1">PRICE</p>
                      <p className="text-2xl font-bold text-amber-600">{priceDisplay}</p>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold py-4 rounded-xl hover:shadow-xl transition-all duration-200 active:scale-95 text-lg">
                    View Details & Enroll →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Why Choose Yadawi */}
      <div className="max-w-md mx-auto px-4 pb-8">
        <h2 className="text-3xl font-bold text-amber-900 mb-6" style={{ fontFamily: 'Georgia, serif' }}>
          Why Yadawi?
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {benefits.map((benefit) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="bg-white p-6 rounded-2xl border-2 border-amber-100 hover:border-amber-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <IconComponent className="w-10 h-10 text-amber-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg text-amber-900 mb-1">{benefit.title}</h3>
                    <p className="text-base text-amber-800">{benefit.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="max-w-md mx-auto px-4 pb-8">
        <div className="bg-gradient-to-br from-amber-600 to-orange-500 rounded-2xl p-7 text-white shadow-lg">
          <h3 className="font-bold text-2xl mb-2">Stay Updated</h3>
          <p className="text-amber-100 text-base mb-5">Get notified about new workshops and events</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-3 text-base rounded-lg bg-white/20 placeholder-amber-200 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 font-semibold"
            />
            <button className="px-5 py-3 bg-white text-amber-600 font-bold rounded-lg hover:bg-amber-50 transition text-base">
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-100 mt-12 py-10">
        <div className="max-w-md mx-auto px-4 text-center">
          <p className="font-bold text-white text-2xl mb-2">Yadawi</p>
          <p className="text-base mb-4">Creative workshops & products for makers</p>
          <div className="flex justify-center gap-6 mb-5">
            <a href="#" className="hover:text-white transition font-semibold">Instagram</a>
            <a href="#" className="hover:text-white transition font-semibold">Twitter</a>
            <a href="#" className="hover:text-white transition font-semibold">Contact</a>
          </div>
          <p className="text-sm text-amber-300">© 2026 Yadawi. Craft Something Beautiful.</p>
        </div>
      </footer>
    </div>
  );
}
