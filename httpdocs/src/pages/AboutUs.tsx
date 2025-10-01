import MarqueeRibbon from "@/components/MarqueeRibbon";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import { useEffect, useRef } from "react";

const AboutUs = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll functionality
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollSpeed = 1; // pixels per frame
    let animationId: number;

    const autoScroll = () => {
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
        container.scrollLeft = 0; // Reset to beginning
      } else {
        container.scrollLeft += scrollSpeed;
      }
      animationId = requestAnimationFrame(autoScroll);
    };

    // Start auto-scroll after a delay
    const startAutoScroll = setTimeout(() => {
      animationId = requestAnimationFrame(autoScroll);
    }, 3000); // Start after 3 seconds

    return () => {
      clearTimeout(startAutoScroll);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Manual scroll function
  const scrollAdvisors = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 320; // Width of one card + gap
    const newScrollLeft = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };
  return (
    <div className="min-h-screen bg-white">
      <MarqueeRibbon />
      <Header />

      {/* Main Content Container */}
      <div className="relative w-full max-w-[2120px] mx-auto">
        {/* About Us Section */}
        <div className="flex justify-center items-center py-16 px-8">
          <div className="max-w-[1320px] w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#183EA8] mb-4">About Us</h1>
              <h2 className="text-4xl font-bold text-[#3F3F3F] mb-6">
                One Nation United - Together We Play, Together We Rise.
              </h2>
              <p className="text-lg text-[#3F3F3F] mb-4">
                A revolutionary T-10 tennis ball cricket tournament that aims to bring the passion of street cricket to professional stadiums.
              </p>
              <p className="text-lg text-[#3F3F3F]">
                A unique format and emphasis to provide a mega platform to untapped talent and foster future cricketing stars. Revolutionizing tennis ball cricket league using patented technology at the selections.
              </p>
            </div>

            {/* Vision and Mission with Image */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 items-center">
              {/* Vision and Mission - Left Side */}
              <div className="space-y-8">
                {/* Vision */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#3F3F3F] mb-4">Vision</h3>
                  <p className="text-[#3F3F3F] mb-2">
                    Elevate the potential of street cricket to form the next generation of game-changers.
                  </p>
                  <p className="text-[#3F3F3F]">
                    Officially standardize gully cricket and take it to next level.
                  </p>
                </div>

                {/* Mission */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#3F3F3F] mb-4">Mission</h3>
                  <p className="text-[#3F3F3F]">
                    Scouting street champs. Launching future stars.
                  </p>
                </div>
              </div>

              {/* Image Section - Right Side */}
              <div className="flex justify-center lg:justify-end">
                <img
                  src="/ourMoto.jpg"
                  alt="Our Vision and Mission"
                  className="w-full max-w-[500px] h-[350px] object-cover rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Core Committee Section */}
        <div className="bg-white py-16 px-8">
          <div className="max-w-[1320px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#3F3F3F] mb-4">Our Core Committee</h2>
              <p className="text-lg text-[#3F3F3F]">
                The core committee leads the planning and execution of the league at every level. Their dedication ensures smooth operations and impactful player experiences.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Nawabzada Mohammed Asif Ali */}
              <div className="bg-white shadow-lg rounded-lg p-6 border">
                <img
                  src="/Nawab.png"
                  alt="Nawabzada Mohammed Asif Ali"
                  className="w-48 h-48 rounded-lg object-cover mx-auto mb-4"
                />
                <h3 className="text-xl font-bold text-[#3F3F3F] text-center mb-2">Nawabzada Mohammed Asif Ali</h3>
                <p className="text-[#183EA8] font-bold text-center mb-1">CHAIRMAN</p>
                <p className="text-[#183EA8] text-sm text-center mb-4">Dewan to the Prince of Arcot</p>
                <p className="text-[#3F3F3F] text-sm text-center">
                  A philanthropist and a passionate cricketer. Nawabzada sees the league as a platform offering opportunities to cricket enthusiasts across South India and as an evolution of the T10 cricket format.
                </p>
              </div>

              {/* Mr. Ravi Mohan */}
              <div className="bg-white shadow-lg rounded-lg p-6 border">
                <img
                  src="/ravi mohan.png"
                  alt="Mr. Ravi Mohan"
                  className="w-48 h-48 rounded-lg object-cover mx-auto mb-4"
                />
                <h3 className="text-xl font-bold text-[#3F3F3F] text-center mb-2">Mr. Ravi Mohan</h3>
                <p className="text-[#183EA8] font-bold text-center mb-1">STAR PATRON</p>
                <p className="text-[#183EA8] text-sm text-center mb-4">Indian Actor / Passionate Cricketer</p>
                <p className="text-[#3F3F3F] text-sm text-center">
                  He strengthens the league's vision of merging sports, entertainment, and culture to create a one-of-a-kind cricketing experience.
                </p>
              </div>

              {/* Loganathan Thangapazham Anand */}
              <div className="bg-white shadow-lg rounded-lg p-6 border md:col-span-2 lg:col-span-1">
                <img
                  src="/Lt anand.png"
                  alt="Loganathan Thangapazham Anand"
                  className="w-48 h-48 rounded-lg object-cover mx-auto mb-4"
                />
                <h3 className="text-xl font-bold text-[#3F3F3F] text-center mb-2">Loganathan Thangapazham Anand</h3>
                <p className="text-[#183EA8] font-bold text-center mb-4">MANAGING DIRECTOR</p>
                <p className="text-[#3F3F3F] text-sm text-center">
                  A core part of the league's leadership, he brings decades of expertise in finance, governance, and strategy. His insight ensures stability, compliance, and sustained growth, making him vital to the league's long-term success.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Board of Advisors Section */}
        <div className="bg-gray-50 py-16 px-8">
          <div className="max-w-[1320px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#3F3F3F] mb-4">Our Board of Advisors</h2>
              <p className="text-lg text-[#3F3F3F]">
                Our Board of Advisors includes experienced professionals who guide the league with their knowledge. They help us grow and support young cricket talent across the country.
              </p>
            </div>

            {/* Horizontally Scrollable Advisors Container */}
            <div className="relative">
              <div
                ref={scrollContainerRef}
                className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                id="advisors-container"
              >
                {/* Dilip Narayanan */}
                <div className="bg-white shadow-lg rounded-lg p-6 border flex-shrink-0 w-80">
                  <img
                    src="/Dilip Narayanan.png"
                    alt="Dilip Narayanan"
                    className="w-48 h-48 rounded-lg object-cover mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-[#3F3F3F] text-center mb-2">Dilip Narayanan</h3>
                  <p className="text-[#183EA8] font-bold text-center text-sm mb-4">
                    Strategic Advisor
                  </p>
                  <p className="text-[#3F3F3F] text-sm text-center">
                    Senior corporate executive with extensive experience in strategic planning, business development, and organizational leadership across diverse industries.
                  </p>
                </div>

                {/* Mr. C.P.Rao */}
                <div className="bg-white shadow-lg rounded-lg p-6 border flex-shrink-0 w-80">
                  <img
                    src="/cp rao.png"
                    alt="Mr. C.P.Rao"
                    className="w-48 h-48 rounded-lg object-cover mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-[#3F3F3F] text-center mb-2">Mr. C.P.Rao</h3>
                  <p className="text-[#183EA8] font-bold text-center text-sm mb-4">
                    Former Principal Chief Commissioner, GST & Customs | Vice Chairman, Settlement Commission (Retd.)
                  </p>
                  <p className="text-[#3F3F3F] text-sm text-center">
                    Veteran IRS officer with leadership roles across key Government of India departments. Expert in public affairs, fiscal policy, and regulatory administration, with a strong track record in policy implementation, institutional reform, and strategic governance.
                  </p>
                </div>

                {/* Mr.Puhazhendi Kaliyappan */}
                <div className="bg-white shadow-lg rounded-lg p-6 border flex-shrink-0 w-80">
                  <img
                    src="/Pugazhendi.png"
                    alt="Mr.Puhazhendi Kaliyappan"
                    className="w-48 h-48 rounded-lg object-cover mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-[#3F3F3F] text-center mb-2">Mr.Puhazhendi Kaliyappan</h3>
                  <p className="text-[#3F3F3F] text-sm text-center">
                    Former Quality Leader, South Asia at GE Healthcare and SVP, Global Operations at Standard Chartered Bank. Brings extensive global experience in business process and program management.
                  </p>
                </div>

                {/* Adv Sheela */}
                <div className="bg-white shadow-lg rounded-lg p-6 border flex-shrink-0 w-80">
                  <img
                    src="/Adv Sheela.png"
                    alt="Adv Sheela"
                    className="w-48 h-48 rounded-lg object-cover mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-[#3F3F3F] text-center mb-2">Adv Sheela</h3>
                  <p className="text-[#183EA8] font-bold text-center text-sm mb-4">
                    Legal Advisor
                  </p>
                  <p className="text-[#3F3F3F] text-sm text-center">
                    Experienced legal professional providing strategic legal counsel and ensuring compliance across all league operations and activities.
                  </p>
                </div>
              </div>

              {/* Navigation Arrows */}
              <div className="flex justify-center mt-8 gap-4">
                <button
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-[#183EA8] hover:bg-gray-100 transition-colors"
                  onClick={() => scrollAdvisors('left')}
                >
                  ‹
                </button>
                <button
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-[#183EA8] hover:bg-gray-100 transition-colors"
                  onClick={() => scrollAdvisors('right')}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterSection />
    </div>
  );
};

export default AboutUs;