import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import PlayerRegistrationForm from "@/components/PlayerRegistrationForm";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Register = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Track page view for analytics (if GA is configured)
    if ((window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: 'Player Registration',
        page_location: window.location.href,
        custom_map: { dimension1: 'registration_page' }
      });
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Player Registration - SSPL T10 Cricket Tournament</title>
        <meta name="description" content="Register now for the Southern Street Premier League T10 Cricket Tournament. Join the most exciting T10 tennis ball cricket league with prizes up to 3 crores." />
        <meta name="keywords" content="SSPL T10, cricket registration, tennis ball cricket, tournament registration, SSPL registration" />
        <meta property="og:title" content="Player Registration - SSPL T10 Cricket Tournament" />
        <meta property="og:description" content="Register now for the Southern Street Premier League T10 Cricket Tournament. Join the most exciting T10 tennis ball cricket league." />
        <meta property="og:url" content="https://ssplt10.co.in/register" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Player Registration - SSPL T10 Cricket Tournament" />
        <meta name="twitter:description" content="Register now for the Southern Street Premier League T10 Cricket Tournament." />
        <link rel="canonical" href="https://ssplt10.co.in/register" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 relative">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="absolute left-0 top-0 hover:bg-gray-100 p-2"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>

              <img
                src="/ssplt10-logo.png"
                alt="SSPL T10 Logo"
                className="w-16 h-16 mx-auto mb-4"
              />
              <h1 className="text-3xl sm:text-4xl font-bold text-cricket-blue mb-2">
                Player Registration
              </h1>
              <p className="text-lg text-muted-foreground">
                Join the Southern Street Premier League T10 Cricket Tournament
              </p>
            </div>

            <PlayerRegistrationForm />
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;