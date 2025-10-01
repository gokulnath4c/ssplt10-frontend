import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trophy } from "lucide-react";
import PlayerRegistrationForm from "./PlayerRegistrationForm";
import { useIsMobile } from "@/hooks/use-mobile";

const FloatingRegistrationButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cricket-yellow text-cricket-blue hover:bg-yellow-400 shadow-glow animate-pulse-glow z-50"
          size="icon"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto m-2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cricket-blue text-lg sm:text-xl">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            Player Registration
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <PlayerRegistrationForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FloatingRegistrationButton;