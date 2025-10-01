import MarqueeRibbon from "@/components/MarqueeRibbon";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import { Users, Calendar, Trophy, Star, MapPin, Building, Rocket } from "lucide-react";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-white">
      <MarqueeRibbon />
      <Header />

      {/* Main Content Container */}
      <div className="relative w-full max-w-[2120px] mx-auto">
        {/* SSPL Format Section */}
        <div className="flex justify-center items-center py-16 px-8 bg-[#F6F6F6]">
          <div className="max-w-[1320px] w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#183EA8] mb-4">SSPL Format</h1>
              <h2 className="text-4xl font-bold text-[#3F3F3F] mb-6">
                SSPL breaks barriers by offering unprecedented access to undiscovered talent from all corners of South India.
              </h2>
            </div>

            {/* Image and Tiles Side by Side */}
            <div className="grid lg:grid-cols-2 gap-12 mt-12 items-start">
              {/* Image Section - Left Side */}
              <div className="flex justify-center lg:justify-start">
                <div className="bg-gradient-to-br from-[#1a365d] to-[#2d3748] p-6 rounded-2xl shadow-2xl max-w-[500px]">
                  <img
                    src="/dynamic format.png"
                    alt="SSPL Dynamic Format"
                    className="w-full h-[350px] object-cover rounded-lg shadow-lg"
                  />
                </div>
              </div>

              {/* Cards Grid - Right Side, 2x2 Layout */}
              <div className="grid grid-cols-2 gap-6 h-fit max-w-2xl mx-auto">
                {/* Teams Card */}
                <div className="bg-white shadow-lg rounded-lg p-6 border">
                  <div className="flex items-center justify-center w-16 h-16 bg-[#D6E300] rounded-full mb-4 mx-auto">
                    <Users className="w-10 h-10 text-[#183EA8]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#3F3F3F] text-center mb-2">Teams</h3>
                  <p className="text-[#3F3F3F] text-center text-sm">
                    SSPL-T10 Season 1 will feature 12 teams, each consisting of 25 players.
                  </p>
                </div>

                {/* Age Requirement Card */}
                <div className="bg-white shadow-lg rounded-lg p-6 border">
                  <div className="flex items-center justify-center w-16 h-16 bg-[#D6E300] rounded-full mb-4 mx-auto">
                    <Calendar className="w-10 h-10 text-[#183EA8]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#3F3F3F] text-center mb-2">Age Requirement</h3>
                  <p className="text-[#3F3F3F] text-center text-sm">
                    Boys 12+ can register for trial.
                  </p>
                </div>

                {/* Matches Card */}
                <div className="bg-white shadow-lg rounded-lg p-6 border">
                  <div className="flex items-center justify-center w-16 h-16 bg-[#D6E300] rounded-full mb-4 mx-auto">
                    <Trophy className="w-10 h-10 text-[#183EA8]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#3F3F3F] text-center mb-2">Matches</h3>
                  <p className="text-[#3F3F3F] text-center text-sm">
                    35+ matches to be played. Top 4 teams would qualify for playoffs.
                  </p>
                </div>

                {/* Player Opportunity Card */}
                <div className="bg-white shadow-lg rounded-lg p-6 border">
                  <div className="flex items-center justify-center w-16 h-16 bg-[#D6E300] rounded-full mb-4 mx-auto">
                    <Star className="w-10 h-10 text-[#183EA8]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#3F3F3F] text-center mb-2">Player Opportunity</h3>
                  <p className="text-[#3F3F3F] text-center text-sm">
                    Each player to play a minimum of 1 match in a league.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* League Highlights Section */}
        <div className="py-16 px-8">
          <div className="max-w-[1320px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#3F3F3F]">League Highlights</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* FINALS AT SHARJAH */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-[#D6E300] rounded-full flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-[#183EA8]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#3F3F3F] mb-2">FINALS AT SHARJAH</h3>
                <p className="text-[#3F3F3F] text-sm">
                  First ever tennis ball cricket league in South India to be played in the Stadium.
                </p>
              </div>

              {/* CELEBRITY PATRON */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-[#D6E300] rounded-full flex items-center justify-center">
                    <Star className="w-12 h-12 text-[#183EA8]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#3F3F3F] mb-2">CELEBRITY PATRON</h3>
                <p className="text-[#3F3F3F] text-sm">
                  Ravi Mohan serves as the celebrity face and patron of the league.
                </p>
              </div>

              {/* 1 UNION TERRITORY */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-[#D6E300] rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#183EA8]" fill="currentColor" viewBox="0 0 30 30">
                      <path d="M13.8903 29.049C5.71726 17.2006 4.2002 15.9846 4.2002 11.6301C4.2002 5.66538 9.0355 0.830078 15.0002 0.830078C20.9649 0.830078 25.8002 5.66538 25.8002 11.6301C25.8002 15.9846 24.2831 17.2006 16.1101 29.049C15.5738 29.8238 14.4266 29.8237 13.8903 29.049ZM15.0002 16.1301C17.4855 16.1301 19.5002 14.1154 19.5002 11.6301C19.5002 9.14478 17.4855 7.13008 15.0002 7.13008C12.5149 7.13008 10.5002 9.14478 10.5002 11.6301C10.5002 14.1154 12.5149 16.1301 15.0002 16.1301Z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#3F3F3F] mb-2">1 UNION TERRITORY</h3>
                <p className="text-[#3F3F3F] text-sm">
                  A rigorous selection process involving registrations, trials, and auctions.
                </p>
              </div>

              {/* 6 STATES */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-[#D6E300] rounded-full flex items-center justify-center">
                    <Building className="w-12 h-12 text-[#183EA8]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#3F3F3F] mb-2">6 STATES</h3>
                <p className="text-[#3F3F3F] text-sm">
                  A rigorous selection process involving registrations, trials, and auctions.
                </p>
              </div>

              {/* 12 Franchisees */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-[#D6E300] rounded-full flex items-center justify-center">
                    <Users className="w-12 h-12 text-[#183EA8]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#3F3F3F] mb-2">12 Franchisees</h3>
                <p className="text-[#3F3F3F] text-sm">
                  Representing different states, they will compete in the inaugural season. Who will take the crown?
                </p>
              </div>

              {/* 300 PLAYERS */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-[#D6E300] rounded-full flex items-center justify-center">
                    <Users className="w-12 h-12 text-[#183EA8]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#3F3F3F] mb-2">300 PLAYERS</h3>
                <p className="text-[#3F3F3F] text-sm">
                  The tournament boasts an impressive lineup of cricketing talent, promising thrilling matches and intense competition.
                </p>
              </div>

              {/* 4 WEEKS */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-[#D6E300] rounded-full flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-[#183EA8]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#3F3F3F] mb-2">4 WEEKS</h3>
                <p className="text-[#3F3F3F] text-sm">
                  Of nonstop tennis ball cricket action delivering high quality entertainment.
                </p>
              </div>

              {/* SPECTACULAR LAUNCH */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-[#D6E300] rounded-full flex items-center justify-center">
                    <Rocket className="w-12 h-12 text-[#183EA8]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#3F3F3F] mb-2">SPECTACULAR LAUNCH</h3>
                <p className="text-[#3F3F3F] text-sm">
                  League will be officially unveiled with media, creating anticipation and excitement leading up to the tournament.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <FooterSection />
    </div>
  );
};

export default HowItWorks;