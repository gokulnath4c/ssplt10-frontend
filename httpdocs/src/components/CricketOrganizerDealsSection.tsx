import React from 'react';
import { Trophy, Package, Smartphone, ShoppingBag, Truck, Download, Play, Star, Zap, Target } from 'lucide-react';
import { Button } from "@/components/ui/button";
import './CricketOrganizerDealsSection.css';

const CricketOrganizerDealsSection = () => {
  return (
    <section className="py-12 bg-gradient-to-br from-orange-50 via-white to-yellow-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full animate-bounce"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-green-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-lime-300 rounded-full animate-ping"></div>
        <div className="absolute bottom-10 right-1/3 w-24 h-24 bg-yellow-400 rounded-full animate-bounce delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-green-500 px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-2xl animate-pulse hover:scale-105 transition-all duration-300 relative overflow-hidden limited-time-special">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/30 to-green-200/30 animate-pulse rounded-full"></div>
            <Zap className="w-4 h-4 animate-spin relative z-10 zap-icon" />
            <span className="relative z-10 font-extrabold special-text">🔈🔈 LIMITED TIME SPECIAL</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-yellow-600 via-green-600 to-lime-600 bg-clip-text text-transparent">
              Buy Official SSPL Match Ball – SiXiT Tennis Ball
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Elevate your game with premium quality tennis balls trusted by professionals!
          </p>
        </div>

        {/* Stats Cards and Main Card Layout */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Stats Cards - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-lg border border-yellow-200 hover:scale-105 transition-transform duration-300 hover:shadow-lg group">
                <div className="bg-yellow-500 rounded-full p-2 w-fit mx-auto mb-2 group-hover:animate-bounce">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-yellow-800 text-sm mb-1 text-center">✅ 150 FREE Balls</h4>
                <p className="text-yellow-600 text-xs text-center">🎁 Premium SiXiT</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200 hover:scale-105 transition-transform duration-300 hover:shadow-lg group">
                <div className="bg-green-500 rounded-full p-2 w-fit mx-auto mb-2 group-hover:animate-bounce">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-green-800 text-sm mb-1 text-center">✅ FREE Stickers</h4>
                <p className="text-green-600 text-xs text-center">✨ Via App</p>
              </div>

              <div className="bg-gradient-to-br from-lime-50 to-lime-100 p-3 rounded-lg border border-lime-200 hover:scale-105 transition-transform duration-300 hover:shadow-lg group">
                <div className="bg-lime-500 rounded-full p-2 w-fit mx-auto mb-2 group-hover:animate-bounce">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-lime-800 text-sm mb-1 text-center">✅ Complete Deal</h4>
                <p className="text-lime-600 text-xs text-center">🚀 All in ONE</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200 hover:scale-105 transition-transform duration-300 hover:shadow-lg group">
                <div className="bg-blue-500 rounded-full p-2 w-fit mx-auto mb-2 group-hover:animate-bounce">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-blue-800 text-sm mb-1 text-center">✅ Free Delivery</h4>
                <p className="text-blue-600 text-xs text-center">📦 Doorstep</p>
              </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-xl p-5 border-2 border-gradient-to-r from-yellow-200 to-green-200 relative overflow-hidden hover:shadow-2xl transition-shadow duration-500">
              {/* Floating Tennis Balls */}
              <div className="absolute top-3 right-3 w-6 h-6 bg-yellow-400 rounded-full animate-bounce opacity-70"></div>
              <div className="absolute bottom-3 left-3 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-70"></div>
              <div className="absolute top-1/2 left-6 w-3 h-3 bg-lime-400 rounded-full animate-pulse opacity-70"></div>

              <div className="text-center mb-4">
                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent mb-2">
                  🏆 Special Combo – Limited Time Only!
                </h3>
              </div>

              {/* CTA Section */}
              <div className="text-center bg-gradient-to-r from-yellow-500 via-green-500 to-lime-500 text-white p-4 rounded-lg">
                <h4 className="text-lg font-bold mb-2">How to Grab the Deal:</h4>
                <Button
                  size="lg"
                  className="bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-lime-50 px-3 sm:px-4 py-2 text-sm sm:text-base font-bold rounded-lg shadow-2xl transform hover:scale-110 transition-all duration-300 mb-2 animate-pulse relative overflow-hidden group download-button w-full sm:w-auto"
                  onClick={() => window.open('https://sportsal.com/download', '_blank')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-200/20 to-lime-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Download className="w-4 h-4 mr-1 sm:mr-2 relative z-10 animate-bounce download-icon flex-shrink-0" />
                  <span className="relative z-10 font-extrabold download-text text-center sm:text-left">📲 Download Sportsal App</span>
                </Button>
                <p className="text-yellow-100 text-sm">👉 sportsal.com/download</p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Sportsal */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-200">
            <h3 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-600 to-green-600 bg-clip-text text-transparent">
              Why Choose Sportsal?
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="bg-yellow-500 rounded-full p-3 w-fit mx-auto mb-3 group-hover:animate-spin">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-800 mb-1">🏏 Trusted by Top Brands</h4>
                <p className="text-gray-600 text-sm">SS, SiXiT, SG, SF, MRF & More</p>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="bg-green-500 rounded-full p-3 w-fit mx-auto mb-3 group-hover:animate-bounce">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-800 mb-1">💯 Best Discounts</h4>
                <p className="text-gray-600 text-sm">Authentic Gear at unbeatable prices</p>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="bg-lime-500 rounded-full p-3 w-fit mx-auto mb-3 group-hover:animate-pulse">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-800 mb-1">🚀 Fast Delivery</h4>
                <p className="text-gray-600 text-sm">Quick and reliable shipping</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stay Updated */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📢 Stay Updated with Deals & Combos:</h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://www.instagram.com/sixitsports"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300 hover:animate-pulse"
            >
              <Star className="w-5 h-5 animate-spin" />
              Follow SiXiT 👉 @sixitsports
            </a>
            <a
              href="https://www.instagram.com/sportsal4u"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300 hover:animate-pulse"
            >
              <Star className="w-5 h-5 animate-spin" />
              Follow Sportsal 👉 @sportsal4u
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CricketOrganizerDealsSection;