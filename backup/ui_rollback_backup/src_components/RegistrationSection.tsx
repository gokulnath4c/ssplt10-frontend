import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const RegistrationSection = () => {
  return (
    <section id="registration" className="py-6 sm:py-8 lg:py-10 bg-gradient-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 lg:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cricket-blue mb-2">
            Join the <span className="text-cricket-yellow">SSPL T10</span> Revolution
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Register now to be part of the most exciting T10 cricket tournament.
            Experience professional cricket like never before.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Tournament Highlights */}
          <Card className="bg-gradient-primary text-white border-0 shadow-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-center justify-center text-lg">
                <Trophy className="w-4 h-4" />
                Tournament Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex justify-between items-center">
                  <span>Final's Venue:</span>
                  <span className="font-semibold">Sharjah</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Franchisees:</span>
                  <span className="font-semibold">12 Teams</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>States Covered:</span>
                  <span className="font-semibold">6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Format:</span>
                  <span className="font-semibold">T10 Cricket</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RegistrationSection;