import { Trophy, MapPin, Users, Globe } from "lucide-react";

interface StatisticsCardsProps {
  className?: string;
}

const StatisticsCards = ({ className = "" }: StatisticsCardsProps) => {
  const stats = [
    {
      icon: Trophy,
      label: "Prize Money",
      value: "upto 3 Crores",
      color: "text-yellow-400"
    },
    {
      icon: Users,
      label: "Player Prize",
      value: "upto 3 Lakhs",
      color: "text-yellow-400"
    },
    {
      icon: MapPin,
      label: "Final At",
      value: "Sharjah",
      color: "text-yellow-400"
    },
    {
      icon: Globe,
      label: "States",
      value: "6",
      color: "text-yellow-400"
    },
    {
      icon: Users,
      label: "Teams",
      value: "12",
      color: "text-yellow-400"
    }
  ];

  return (
    <div className={`bg-white/10 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-6 border border-white/20 ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 text-center">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-1 sm:space-y-2 p-2 sm:p-3 min-h-[80px] sm:min-h-[100px] flex flex-col justify-center">
            <div className="flex items-center justify-center">
              <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${stat.color}`} />
            </div>
            <div className="text-xs sm:text-sm text-yellow-300 font-semibold leading-tight">{stat.label}</div>
            <div className="text-sm sm:text-base md:text-lg font-bold text-yellow-400 leading-tight">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticsCards;