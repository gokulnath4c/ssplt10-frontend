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
    <div className={`bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-center">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-xs text-yellow-300 font-semibold">{stat.label}</div>
            <div className="text-lg font-bold text-yellow-400">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticsCards;