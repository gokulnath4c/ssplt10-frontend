import { Trophy, MapPin, Users, Globe } from "lucide-react";
import { useScrollAnimation, scrollAnimationPresets } from "@/hooks/useScrollAnimation";
import { useFloatingAnimation } from "@/utils/animationUtils";

interface StatisticsCardsProps {
  className?: string;
}

const StatisticsCards = ({ className = "" }: StatisticsCardsProps) => {
  const containerRef = useScrollAnimation({
    ...scrollAnimationPresets.fadeInUp,
    delay: 200
  });

  const stats = [
    {
      icon: Trophy,
      label: "Prize Money",
      value: "upto 3 Crores",
      color: "text-yellow-400",
      bgColor: "from-yellow-400/20 to-orange-400/20",
      hoverColor: "hover:text-yellow-300"
    },
    {
      icon: Users,
      label: "Player Prize",
      value: "upto 3 Lakhs",
      color: "text-yellow-400",
      bgColor: "from-purple-400/20 to-pink-400/20",
      hoverColor: "hover:text-purple-300"
    },
    {
      icon: MapPin,
      label: "Final At",
      value: "Sharjah",
      color: "text-yellow-400",
      bgColor: "from-blue-400/20 to-cyan-400/20",
      hoverColor: "hover:text-blue-300"
    },
    {
      icon: Globe,
      label: "States",
      value: "6",
      color: "text-yellow-400",
      bgColor: "from-green-400/20 to-teal-400/20",
      hoverColor: "hover:text-green-300"
    },
    {
      icon: Users,
      label: "Teams",
      value: "12",
      color: "text-yellow-400",
      bgColor: "from-red-400/20 to-pink-400/20",
      hoverColor: "hover:text-red-300"
    }
  ];

  return (
    <div
      ref={containerRef.ref as any}
      className={`relative bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 hover:shadow-float transition-all duration-500 group ${className}`}
    >
      {/* Premium floating elements */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-2 left-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
        <div className="absolute top-4 right-4 w-0.5 h-0.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
        <div className="absolute bottom-2 left-4 w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
        <div className="absolute bottom-4 right-2 w-0.5 h-0.5 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '600ms' }}></div>
      </div>

      <div className="relative z-10 grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
        {stats.map((stat, index) => {
          const position = useFloatingAnimation();
          return (
            <div
              key={index}
              className="group/stat relative space-y-1 p-3 rounded-lg hover:bg-gradient-to-br hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Card background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} rounded-lg opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300`}></div>

              {/* Floating animation */}
              <div
                className="relative flex items-center justify-center"
                style={{
                  transform: `translate(${position.x * 0.1}px, ${position.y * 0.1}px)`,
                  transition: 'transform 0.1s linear'
                }}
              >
                <stat.icon className={`w-5 h-5 ${stat.color} group-hover/stat:scale-110 transition-transform duration-300`} />
              </div>

              <div className={`text-xs text-yellow-300 font-semibold ${stat.hoverColor} transition-colors duration-300`}>
                {stat.label}
              </div>
              <div className={`text-lg font-bold ${stat.color} group-hover/stat:scale-105 transition-transform duration-300`}>
                {stat.value}
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/stat:translate-x-full transition-transform duration-1000 ease-out pointer-events-none rounded-lg"></div>
            </div>
          );
        })}
      </div>

      {/* Premium glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-purple-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm"></div>
    </div>
  );
};

export default StatisticsCards;