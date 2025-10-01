import { Mail, Phone, MessageCircle } from "lucide-react";

const MarqueeRibbon = () => {
  const contactInfo = [
    { 
      icon: Mail, 
      text: "Email: customercare@sspl.co.in", 
      type: "email" 
    },
    { 
      icon: Phone, 
      text: "Phone: +91 88077 75960", 
      type: "phone" 
    },
    { 
      icon: MessageCircle, 
      text: "WhatsApp: +91 88077 73632 (Support: 10:30 AM - 08:00 PM)", 
      type: "whatsapp" 
    }
  ];

  return (
    <div className="bg-[#C1E303] text-black py-1.5 px-4 overflow-hidden relative">
      <div className="flex animate-marquee whitespace-nowrap">
        {/* First set of contact info */}
        <div className="flex items-center space-x-8 mr-8">
          {contactInfo.map((info, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs font-medium">
              <info.icon className="w-3 h-3" />
              <span style={{ fontSize: '11px' }}>{info.text}</span>
            </div>
          ))}
        </div>

        {/* Duplicate set for seamless scrolling */}
        <div className="flex items-center space-x-8 mr-8">
          {contactInfo.map((info, index) => (
            <div key={`duplicate-${index}`} className="flex items-center space-x-2 text-xs font-medium">
              <info.icon className="w-3 h-3" />
              <span style={{ fontSize: '11px' }}>{info.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarqueeRibbon;