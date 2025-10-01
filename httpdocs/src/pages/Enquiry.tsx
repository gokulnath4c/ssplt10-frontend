import { useState } from "react";
import MarqueeRibbon from "@/components/MarqueeRibbon";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MessageCircle } from "lucide-react";

const Enquiry = () => {
  const [activeTab, setActiveTab] = useState<'sponsor' | 'franchise'>('sponsor');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { ...formData, type: activeTab });
    // Handle form submission here
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <MarqueeRibbon />
      <Header />

      {/* Top Contact Banner */}
      <div className="bg-[#D6E300] py-2">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-[#3F3F3F] text-xs font-bold opacity-90">
              Email: customercare@ssplt10.co.in | Phone: +91 88077 75960 | WhatsApp: +91 88077 73632 (WhatsApp Support available from 10:00 AM - 08:00 PM)
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative w-full max-w-[1920px] mx-auto">
        {/* Background */}
        <div className="w-full h-[378px] bg-[#E8F0FE] absolute bottom-0"></div>
        
        <div className="container mx-auto px-4 max-w-[1320px] py-16 relative">
          {/* Enquiry Section */}
          <div className="text-center mb-12">
            <h1 className="text-[34px] font-bold text-[#3F3F3F] leading-[55px] mb-8">Enquiry</h1>
            
            {/* Tab Buttons */}
            <div className="flex justify-center gap-5 mb-12">
              <button
                onClick={() => setActiveTab('sponsor')}
                className={`px-5 py-3 rounded-[5px] font-bold text-[14px] leading-[24px] tracking-[1px] transition-all duration-300 relative overflow-hidden ${
                  activeTab === 'sponsor'
                    ? 'bg-[#F6F6F6] text-[#D6E300]'
                    : 'bg-[#F6F6F6] text-[#3F3F3F] border border-[#CECECE] hover:bg-white'
                }`}
                style={activeTab === 'sponsor' ? {
                  background: 'linear-gradient(to right, #183EA8 0%, #183EA8 50%, #183EA8 100%)',
                } : {}}
              >
                <span className="relative z-10">Sponsor</span>
                {activeTab === 'sponsor' && (
                  <>
                    <div className="absolute left-0 top-0 w-1/2 h-full bg-[#183EA8] rounded-l-[5px]"></div>
                    <div className="absolute right-0 top-0 w-1/2 h-full bg-[#183EA8] rounded-r-[5px]"></div>
                  </>
                )}
              </button>
              <button
                onClick={() => setActiveTab('franchise')}
                className={`px-5 py-3 rounded-[5px] font-bold text-[14px] leading-[24px] tracking-[1px] transition-all duration-300 ${
                  activeTab === 'franchise'
                    ? 'bg-[#183EA8] text-[#D6E300] shadow-lg'
                    : 'bg-[#F6F6F6] text-[#3F3F3F] border border-[#CECECE] hover:bg-white'
                }`}
              >
                Franchise
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Form Section */}
            <div className="bg-[#F6F6F6] rounded-xl shadow-[0_6px_30px_0_rgba(0,0,0,0.08)] p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Name and Phone Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-[#3F3F3F] font-bold text-[15px] leading-[24px] block mb-4">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="px-8 py-4 bg-[#E8F0FE] border border-[#EBEBEB] rounded-[5px] text-[#212529] placeholder:text-[#929292] text-[15px] focus:ring-2 focus:ring-[#183EA8] focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-[#3F3F3F] font-bold text-[16px] leading-[24px] block mb-4">
                      Phone
                    </Label>
                    <div className="flex">
                      <div className="bg-[#E8F0FE] border border-[#DEE2E6] rounded-l-[6px] px-3 py-4 flex items-center border-r-0">
                        <span className="text-[#212529] text-[16px] leading-[24px]">+91</span>
                      </div>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="px-8 py-4 bg-[#E8F0FE] border border-[#EBEBEB] rounded-r-[5px] text-[#212529] placeholder:text-[#929292] text-[15px] border-l-0 focus:ring-2 focus:ring-[#183EA8] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <Label htmlFor="email" className="text-[#3F3F3F] font-bold text-[16px] leading-[24px] block mb-4">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="px-8 py-4 bg-[#E8F0FE] border border-[#EBEBEB] rounded-[5px] text-[#212529] placeholder:text-[#929292] text-[15px] focus:ring-2 focus:ring-[#183EA8] focus:border-transparent"
                    required
                  />
                </div>

                {/* Message Field */}
                <div>
                  <Label htmlFor="message" className="text-[#3F3F3F] font-bold text-[15px] leading-[24px] block mb-4">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder={`Why are you interested in this ${activeTab}ship?`}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="px-8 py-3 bg-[#E8F0FE] border border-[#EBEBEB] rounded-[5px] text-[#212529] placeholder:text-[#929292] text-[15px] leading-[24px] min-h-[150px] resize-none focus:ring-2 focus:ring-[#183EA8] focus:border-transparent"
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="text-center pt-6">
                  <Button
                    type="submit"
                    className="bg-[#F6F6F6] hover:bg-[#F6F6F6]/90 text-[#D6E300] font-bold text-[14px] leading-[24px] tracking-[1px] px-5 py-3 rounded-[5px] transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(to right, #183EA8 0%, #183EA8 50%, #183EA8 100%)',
                    }}
                  >
                    <span className="relative z-10">Submit</span>
                    <div className="absolute left-0 top-0 w-1/2 h-full bg-[#183EA8] rounded-l-[5px]"></div>
                    <div className="absolute right-0 top-0 w-1/2 h-full bg-[#183EA8] rounded-r-[5px]"></div>
                  </Button>
                </div>
              </form>
            </div>

            {/* Form Visual */}
            <div className="flex justify-center items-center">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/a9ee1e4f4a86f06d27b8ce169a5d9cadd5733f94?width=1272"
                alt="Enquiry Visual"
                className="max-w-full h-auto max-h-[424px] flex-1 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Cards Section */}
      <div className="bg-[#F6F6F6] py-16">
        <div className="container mx-auto px-4 max-w-[1320px]">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Call Now Card */}
            <div className="bg-[#F6F6F6] rounded-xl shadow-[0_6px_30px_0_rgba(0,0,0,0.08)] p-6 text-center border border-transparent hover:shadow-lg transition-all duration-300">
              <div className="flex justify-center mb-6">
                <div className="w-[50px] h-[50px] bg-[#183EA8] rounded-[5px] border border-[#EBEBEB] flex items-center justify-center">
                  <span className="text-[#D6E300] text-[30px] font-normal leading-[30px] tracking-[1px]">E</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-[#3F3F3F] font-bold text-[15px] leading-[24px] tracking-[1px]">Call Now</h3>
                <p className="text-[#3F3F3F] text-[14px] leading-[22px] tracking-[1px]">+91 8807775960</p>
              </div>
            </div>

            {/* Email Address Card */}
            <div className="bg-[#F6F6F6] rounded-xl shadow-[0_6px_30px_0_rgba(0,0,0,0.08)] p-6 text-center border border-transparent hover:shadow-lg transition-all duration-300">
              <div className="flex justify-center mb-6">
                <div className="w-[50px] h-[50px] bg-[#183EA8] rounded-[5px] border border-[#EBEBEB] flex items-center justify-center">
                  <span className="text-[#D6E300] text-[30px] font-normal leading-[30px] tracking-[1px]">P</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-[#3F3F3F] font-bold text-[15px] leading-[24px] tracking-[1px]">Email Address</h3>
                <p className="text-[#3F3F3F] text-[14px] leading-[22px] tracking-[1px]">customercare@ssplt10.co.in</p>
              </div>
            </div>

            {/* WhatsApp Card */}
            <div className="bg-[#F6F6F6] rounded-xl shadow-[0_6px_30px_0_rgba(0,0,0,0.08)] p-6 text-center border border-transparent hover:shadow-lg transition-all duration-300">
              <div className="flex justify-center mb-6">
                <div className="w-[50px] h-[50px] bg-[#183EA8] rounded-[5px] border border-[#EBEBEB] flex items-center justify-center">
                  <svg className="w-[27px] h-[27px]" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.2158 2.10425C7.7658 2.10425 2.53645 7.29271 2.53645 13.6936C2.53645 15.8831 3.14886 17.9308 4.21241 19.6779L2.10449 25.8955L8.57083 23.8413C10.2441 24.7592 12.1685 25.2829 14.2158 25.2829C20.6667 25.2829 25.8957 20.0937 25.8957 13.6936C25.8957 7.29271 20.6667 2.10425 14.2158 2.10425ZM20.0236 18.0948C19.7488 18.776 18.5061 19.3977 17.9578 19.4263C17.4101 19.4553 17.3945 19.8508 14.4082 18.5536C11.4224 17.256 9.62598 14.101 9.48435 13.8978C9.34261 13.6954 8.32771 12.249 8.38246 10.7935C8.43758 9.33774 9.23464 8.65093 9.51913 8.36528C9.8033 8.0792 10.1291 8.02795 10.328 8.02471C10.5632 8.02089 10.7155 8.0177 10.8895 8.02413C11.0634 8.03071 11.3246 7.98775 11.5507 8.58912C11.7767 9.19043 12.3177 10.6684 12.3869 10.819C12.456 10.9697 12.4988 11.1443 12.3923 11.3379C12.2854 11.5318 12.2307 11.653 12.0757 11.8202C11.9199 11.9874 11.7479 12.1942 11.6088 12.322C11.4538 12.4635 11.2918 12.6179 11.4548 12.9205C11.6178 13.2228 12.1799 14.2139 13.0363 15.0307C14.1369 16.0806 15.086 16.4289 15.3781 16.5875C15.671 16.7471 15.8457 16.7293 16.0274 16.5382C16.2081 16.3471 16.8048 15.702 17.0149 15.414C17.2249 15.1252 17.4218 15.1818 17.6916 15.2903C17.9613 15.3993 19.3993 16.1696 19.6922 16.3286C19.9848 16.4873 20.1804 16.5691 20.2504 16.695C20.3203 16.8214 20.2982 17.4136 20.0236 18.0948Z" fill="#D6E300"/>
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-[#3F3F3F] font-bold text-[14px] leading-[24px] tracking-[1px]">WhatsApp</h3>
                <p className="text-[#3F3F3F] text-[14px] leading-[22px] tracking-[1px]">+91 88077 73632</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterSection />
    </div>
  );
};

export default Enquiry;