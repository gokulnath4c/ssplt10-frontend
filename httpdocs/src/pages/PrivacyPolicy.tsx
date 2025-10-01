import React from 'react';
import Header from '@/components/Header';
import FooterSection from '@/components/FooterSection';

const PrivacyPolicy = () => {
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
              Privacy Policy
            </h2>
          </div>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-700 mb-4">1. Information We Collect</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We collect information you provide directly to us, such as when you register for the tournament, contact us, or use our services.
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li><strong>Personal Information:</strong> Name, email address, phone number, date of birth</li>
                <li><strong>Location Information:</strong> State, city, and PIN code for tournament organization</li>
                <li><strong>Player Information:</strong> Playing position, preferred trial times, team preferences</li>
                <li><strong>Payment Information:</strong> Processed securely through Razorpay (we don't store card details)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-700 mb-4">2. How We Use Your Information</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Process tournament registrations and manage player data</li>
                <li>Communicate important tournament updates and information</li>
                <li>Organize matches, schedules, and team formations</li>
                <li>Process payments and maintain financial records</li>
                <li>Ensure fair play and maintain tournament integrity</li>
                <li>Provide customer support and respond to inquiries</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-700 mb-4">3. Information Sharing</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li><strong>Service Providers:</strong> Payment processors, IT services, and tournament management tools</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Tournament Operations:</strong> Sharing necessary information with umpires, scorers, and officials</li>
                <li><strong>Media Partners:</strong> With your consent for promotional purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-700 mb-4">4. Data Security</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>SSL/TLS encryption for all data transmission</li>
                <li>Secure cloud storage with access controls</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal information on a need-to-know basis</li>
                <li>Secure payment processing through certified partners</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-700 mb-4">5. Data Retention</h2>
              <p className="text-slate-600 leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy.
                Tournament data may be retained for historical and statistical purposes. You may request deletion of your data by contacting us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-700 mb-4">6. Your Rights</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li><strong>Access:</strong> Request information about what data we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Request a copy of your data in a machine-readable format</li>
                <li><strong>Objection:</strong> Object to processing of your personal data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-700 mb-4">7. Cookies & Tracking</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Improve website functionality and user experience</li>
                <li>Provide targeted content and advertisements</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-4">
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-700 mb-4">8. Third-Party Services</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Our website may contain links to third-party websites or integrate with third-party services:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li><strong>Payment Processing:</strong> Razorpay for secure payment handling</li>
                <li><strong>Analytics:</strong> Google Analytics for website performance monitoring</li>
                <li><strong>Social Media:</strong> Links to official social media accounts</li>
                <li><strong>Sponsors:</strong> Links to tournament sponsors and partners</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-4">
                These third parties have their own privacy policies, and we encourage you to review them.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-700 mb-4">9. Children's Privacy</h2>
              <p className="text-slate-600 leading-relaxed">
                Our services are not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16.
                If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-700 mb-4">10. Changes to This Policy</h2>
              <p className="text-slate-600 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                Significant changes will be communicated via email or prominent notice on our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-700 mb-4">11. Contact Us</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-600"><strong>Phone:</strong> +91 88077 75960</p>
                <p className="text-slate-600"><strong>Email:</strong> info@ssplt10.co.in</p>
                <p className="text-slate-600"><strong>Address:</strong> Chennai, Tamil Nadu</p>
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

export default PrivacyPolicy;