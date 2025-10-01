import React from 'react';
import Header from '@/components/Header';
import FooterSection from '@/components/FooterSection';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo and Title Section */}
          <div className="text-center mb-8">
            <img
              src="/ssplt10-logo.png"
              alt="Southern Street Premier League T10 Logo"
              className="w-16 h-16 mx-auto mb-4"
            />
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              Southern Street Premier League 2025
            </h1>
            <h2 className="text-2xl font-semibold text-slate-700">
              Terms & Conditions
            </h2>
          </div>

          <div className="prose prose-slate max-w-none">
            {/* Key Points Section */}
            <section className="mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Key Tournament Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Age Eligibility:</strong> Participants must be 12 years or older (As on date of registration)</span>
                    </p>
                    <p className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Registration Fee:</strong> ₹699 + GST for early bird (first 10 days), ₹699 + GST thereafter, non-refundable</span>
                    </p>
                    <p className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Payment Modes:</strong> Accepted via GPay, UPI, cards, or net banking</span>
                    </p>
                    <p className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Trial Venue:</strong> Player will be allotted nearest trial location via email and advanced levels in metro cities</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Trial Format:</strong> Players will be given 12 balls to bat or 12 balls to bowl. Allrounder can choose 6 balls each</span>
                    </p>
                    <p className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Selection Process:</strong> Traditional methods + AI techniques. Selectors decision is final</span>
                    </p>
                    <p className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Final Selection:</strong> Top 500 players announced after Level 3, final 300 selected for league</span>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Detailed Guidelines */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-700 mb-4">Tournament Guidelines</h3>
              <div className="space-y-3 text-slate-600">
                <p><strong>• Travel & Stay:</strong> All travel, food, and accommodation are at the player's own expense</p>
                <p><strong>• Substance Use:</strong> Alcohol or drug use leads to immediate disqualification</p>
                <p><strong>• Communication:</strong> Selection details will be shared via email and WhatsApp</p>
                <p><strong>• Punctuality:</strong> Players must arrive at least 25 minutes before their scheduled slot</p>
                <p><strong>• ID Proof:</strong> A government-issued ID with DOB (like Aadhaar) is mandatory</p>
                <p><strong>• Decisions:</strong> All selection results are final and player has to abide by it</p>
                <p><strong>• Multiple Entries:</strong> Players may register at multiple locations by paying ₹699 + GST each time</p>
                <p><strong>• Equipment:</strong> Balls are provided and must be returned after use. Players to bring their own kits. Fiber Bats not allowed</p>
                <p><strong>• Dress Code:</strong> Players must wear proper sports attire</p>
                <p><strong>• Agreement:</strong> Top 300 selected players may sign a separate Contract with the Company</p>
                <p><strong>• Liability:</strong> Organizers are not responsible for personal loss/injury; basic first aid will be available</p>
                <p><strong>• Schedule Changes:</strong> Dates and venues may change with prior notice</p>
                <p><strong>• Organizer Rights:</strong> SSPL reserves the rights to alter any events due to technical or natural reasons</p>
                <p><strong>• False Info:</strong> Providing incorrect information leads to disqualification</p>
                <p><strong>• Support:</strong> Contact helpline for queries</p>
                <p><strong>• Jurisdiction:</strong> Legal disputes will be handled in Chennai courts only</p>
                <p><strong>• Foreign Players:</strong> Must pay $60 registration and should not use SSPL's player registration for VISA processing</p>
                <p><strong>• Player ID:</strong> Unique ID will be assigned during the trials</p>
                <p><strong>• Slot Confirmation:</strong> Venue details for the trial will be shared 5 days prior to the scheduled date</p>
                <p><strong>• Below 12 years:</strong> Will be considered as guest participants</p>
              </div>
            </section>

            {/* Website Purpose Section */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-700 mb-4">Website Purpose</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                The Website is mainly for players who want to enroll themselves and participate in the SSPL League. Any interested player can enroll with the SSPL by filling the form available at the link /register and providing with all the requested details in the said form.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                Each interested player is required to submit the said enrollment form by paying an enrollment fee of Rs. 699/- + applicable GST. Under no circumstances will the said fee be refundable and/or transferable for any reason whatsoever.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Each interested player is required to provide all the details as requested in the enrollment form. The League Owner shall have the right and discretion to reject any incomplete forms without requiring to provide any reason or refund of fee whatsoever.
              </p>
            </section>

            {/* Registration Process */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-700 mb-4">Player Registration Process</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Once all the details are filled in and the enrollment form is submitted to the Website, a player profile is generated by the Website for SSPL selection committee to shortlist the players.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                Once the SSPL selection committee selects the players, the shortlisted players will be notified by the League Owner with all other relevant details pertaining to the SSPL. The shortlisted players will also be required to travel to mentioned cities for city trials and all travel, lodging, boarding and related costs shall be borne by such shortlisted players.
              </p>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-700 mb-2">The player registration and selection details are as under:</h4>
                <ol className="list-decimal list-inside text-slate-600 space-y-1">
                  <li>Registration closing date: as per Website Notification</li>
                  <li>SSPL selection committee to shortlist players and invite shortlisted players for city trials</li>
                  <li>Physical trials shall be conducted in the specified cities on specified days or as per Fixtures and Conditions</li>
                  <li>Shortlisted players shall be called for trials as notified through Email or Mobile</li>
                  <li>An auction shall be conducted of shortlisted players from a pool of 500 players</li>
                  <li>The League Owner reserves its right to cancel or amend the tournament at any stage</li>
                </ol>
              </div>
            </section>

            {/* Legal Terms Section */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold text-slate-700 mb-4">Legal Terms & Conditions</h3>

              <div className="space-y-6 text-slate-600">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Acceptance of Terms</h4>
                  <p className="leading-relaxed">
                    These Terms is in the form of an electronic and legally binding contract that establishes the terms and conditions you have accepted before using the Website or any part thereof. These include our Privacy Policy and Other Policies as mentioned in these Terms as well as other specific policies and terms and conditions disclosed to you, in case you avail any subscription or any additional features, products or services we offer on or through the Website, whether free or otherwise, including but not limited to terms governing features, billing, subscriptions, free trials, promotions and discounts. By using the Website, you hereby unconditionally consent and accept to these Terms, Privacy Policy and Other Policies. To withdraw such consent, you must immediately cease using the Website and terminate your account with us.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Eligibility</h4>
                  <p className="leading-relaxed">
                    The minimum age to use the Website is 12 (twelve) years. By using the Website and in order to be competent to contract under applicable law, you represent and warrant that you are at least 12 (twelve) years of age or not a minor in any other jurisdiction from where you access the Website.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Account Security</h4>
                  <p className="leading-relaxed">
                    You shall be solely responsible and liable for maintaining the utmost privacy and confidentiality of your Website log-in (username and password) details as well as for any and all activities that occur under your log-in. You agree to immediately notify us of any disclosure or unauthorized use of your log-in or any other breach of security at customercare@ssplt10.co.in and ensure that you log-out from your account at the end of each session.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Content & Usage Rights</h4>
                  <p className="leading-relaxed">
                    By posting information or content to any profile pages or public area of the Website, or making it accessible to us by linking your account to any social network accounts, you grant us unconditionally and in perpetuity, and represent and warrant that you have the right to grant to us, an irrevocable, perpetual, non-exclusive, transferable, sub-licensable, fully-paid/royalty-free, worldwide license to use, reproduce, publicly perform, publicly display and distribute such information and content.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Prohibited Activities</h4>
                  <p className="leading-relaxed mb-2">
                    You shall not publish to us or to any other Website user any offensive, inaccurate, incomplete, inappropriate, abusive, obscene, profane, threatening, intimidating, harassing, racially offensive, or illegal material or content that infringes or violates any person's rights.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Contact Information</h4>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-slate-600"><strong>Grievance Officer:</strong> Mr. Prushotaman Sethu</p>
                    <p className="text-slate-600"><strong>Email:</strong> customercare@ssplt10.co.in</p>
                    <p className="text-slate-600"><strong>Phone:</strong> +91 88077 75960</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-8 p-4 bg-slate-100 rounded-lg">
              <p className="text-sm text-slate-500 text-center">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default TermsAndConditions;