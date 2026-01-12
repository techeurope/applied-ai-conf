import SubpageLayout from "@/components/SubpageLayout";

export const metadata = {
  title: "Privacy Policy - Applied AI Conf by {Tech: Europe}",
  description: "Privacy policy and data protection information",
};

export default function PrivacyPage() {
  return (
    <SubpageLayout>
      <h1 className="text-4xl font-bold font-mono text-white mb-12">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none text-gray-400">
            <p className="mb-8">
              This Privacy Policy explains how we collect, use, and protect your personal data when you visit our website and use our services. We are committed to protecting your privacy and ensuring compliance with the General Data Protection Regulation (GDPR) and other applicable data protection laws.
            </p>
            
            <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">1. Data Controller</h2>
            <p className="mb-4">
              The data controller responsible for the processing of personal data on this website is:
            </p>
            <p className="mb-4">
              <strong className="text-white">BLW Tech Berlin Ventures UG (haftungsbeschränkt)</strong><br />
              Donaustrasse 44, c/o The Delta Campus<br />
              12043 Berlin<br />
              Germany
            </p>
            <p className="mb-8">
              <strong className="text-white">Contact:</strong><br />
              Email: <a href="mailto:info@techeurope.io" className="text-white hover:text-gray-300 transition-colors">info@techeurope.io</a><br />
              Phone: <a href="tel:+49 177 450 2020" className="text-white hover:text-gray-300 transition-colors">+49 177 450 2020</a>
            </p>
            
            <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">2. Data We Collect</h2>
            
            <h3 className="text-xl font-mono font-bold text-white mt-8 mb-4">2.1 Automatically Collected Data</h3>
            <p className="mb-4">When you visit our website, we automatically collect certain information, including:</p>
            <ul className="list-disc list-inside mb-8 space-y-2">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Date and time of access</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referrer URL (the website from which you accessed our site)</li>
            </ul>
            
            <h3 className="text-xl font-mono font-bold text-white mt-8 mb-4">2.2 Data You Provide</h3>
            <p className="mb-4">We collect data that you voluntarily provide to us, including:</p>
            <ul className="list-disc list-inside mb-8 space-y-2">
              <li>Email address (when subscribing to our newsletter)</li>
              <li>Name and contact information (when contacting us or registering for events)</li>
              <li>Any other information you choose to provide in forms or communications</li>
            </ul>
            
            <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">3. Purpose and Legal Basis for Processing</h2>
            <p className="mb-6">We process your personal data for the following purposes and on the following legal bases:</p>
            <ul className="list-disc list-inside mb-8 space-y-3">
              <li><strong className="text-white">Website operation and security:</strong> To ensure the proper functioning of our website and to protect against security threats (legal basis: legitimate interest, Art. 6(1)(f) GDPR)</li>
              <li><strong className="text-white">Newsletter:</strong> To send you newsletters and updates about our events and services (legal basis: consent, Art. 6(1)(a) GDPR)</li>
              <li><strong className="text-white">Event registration:</strong> To process your registration for hackathons and other events (legal basis: contract performance, Art. 6(1)(b) GDPR)</li>
              <li><strong className="text-white">Communication:</strong> To respond to your inquiries and provide customer support (legal basis: legitimate interest, Art. 6(1)(f) GDPR)</li>
              <li><strong className="text-white">Analytics:</strong> To analyze website usage and improve our services (legal basis: consent, Art. 6(1)(a) GDPR, where required)</li>
            </ul>
            
            <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">4. Cookies and Similar Technologies</h2>
            <p className="mb-6">We use only technically necessary cookies and similar technologies to operate this website and provide its basic functions. These may be required to:</p>
            <ul className="list-disc list-inside mb-8 space-y-2">
              <li>enable basic website functionality</li>
              <li>remember your settings (for example, language or cookie preferences)</li>
              <li>ensure the security and stability of the website</li>
            </ul>
            <p className="mb-8">
              We do not use cookies for analytics, marketing, or cross-site tracking purposes.
            </p>
            <p className="mb-8">
              You can control or delete cookies through your browser settings. If you disable all cookies, some parts of the website may not function properly.
            </p>
            
            <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">5. Third-Party Services</h2>
            <p className="mb-6">We may use third-party services that process your data on our behalf, including:</p>
            <ul className="list-disc list-inside mb-8 space-y-2">
              <li><strong className="text-white">Analytics services:</strong> To analyze website usage (e.g., Google Analytics, Vercel Analytics)</li>
              <li><strong className="text-white">Email services:</strong> To send newsletters and communications</li>
              <li><strong className="text-white">Hosting providers:</strong> To host and operate our website</li>
              <li><strong className="text-white">Form services:</strong> To process form submissions</li>
            </ul>
            <p className="mb-8">
              These service providers are contractually bound to process your data only in accordance with our instructions and applicable data protection laws.
            </p>
            
            <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">6. Data Retention</h2>
            <p className="mb-6">We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, or as required by law. Specifically:</p>
            <ul className="list-disc list-inside mb-8 space-y-2">
              <li><strong className="text-white">Newsletter data:</strong> Until you unsubscribe</li>
              <li><strong className="text-white">Event registration data:</strong> Until the event is completed and any follow-up communications are finished</li>
              <li><strong className="text-white">Website analytics data:</strong> Typically up to 26 months</li>
              <li><strong className="text-white">Contact inquiries:</strong> Until the inquiry is resolved and any follow-up is completed</li>
            </ul>
            
            <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">7. Your Rights</h2>
            <p className="mb-6">Under the GDPR, you have the following rights regarding your personal data:</p>
            <ul className="list-disc list-inside mb-8 space-y-3">
              <li><strong className="text-white">Right of access (Art. 15 GDPR):</strong> You can request information about the personal data we hold about you.</li>
              <li><strong className="text-white">Right to rectification (Art. 16 GDPR):</strong> You can request correction of inaccurate or incomplete data.</li>
              <li><strong className="text-white">Right to erasure (Art. 17 GDPR):</strong> You can request deletion of your personal data under certain circumstances.</li>
              <li><strong className="text-white">Right to restriction of processing (Art. 18 GDPR):</strong> You can request that we limit the processing of your data.</li>
              <li><strong className="text-white">Right to data portability (Art. 20 GDPR):</strong> You can request to receive your data in a structured, commonly used format.</li>
              <li><strong className="text-white">Right to object (Art. 21 GDPR):</strong> You can object to the processing of your data for certain purposes.</li>
              <li><strong className="text-white">Right to withdraw consent:</strong> If processing is based on consent, you can withdraw it at any time.</li>
              <li><strong className="text-white">Right to lodge a complaint:</strong> You have the right to file a complaint with a supervisory authority if you believe your rights have been violated.</li>
            </ul>
            <p className="mb-8">
              To exercise these rights, please contact us at <a href="mailto:info@techeurope.io" className="text-white hover:text-gray-300 transition-colors">info@techeurope.io</a>.
            </p>
            
            <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">8. Data Security</h2>
            <p className="mb-6">We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
            <ul className="list-disc list-inside mb-8 space-y-2">
              <li>Encryption of data in transit (SSL/TLS)</li>
              <li>Secure hosting infrastructure</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
              <li>Regular backups</li>
            </ul>
            
            <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">9. International Data Transfers</h2>
            <p className="mb-6">Some of our service providers may be located outside the European Economic Area (EEA). When we transfer your data to such providers, we ensure appropriate safeguards are in place, such as:</p>
            <ul className="list-disc list-inside mb-8 space-y-2">
              <li>Standard Contractual Clauses approved by the European Commission</li>
              <li>Adequacy decisions by the European Commission</li>
              <li>Other legally recognized transfer mechanisms</li>
            </ul>
            
            <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">10. Children&apos;s Privacy</h2>
            <p className="mb-8">
              Our services are not directed to individuals under the age of 16. We do not knowingly collect personal data from children. If you believe we have collected data from a child, please contact us immediately, and we will take steps to delete such information.
            </p>
            
            <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">11. Changes to This Privacy Policy</h2>
            <p className="mb-8">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on this page and updating the &quot;Last updated&quot; date.
            </p>
            
            <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">12. Contact Us</h2>
            <p className="mb-4">If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:</p>
            <p className="mb-4">
              <strong className="text-white">BLW Tech Berlin Ventures UG (haftungsbeschränkt)</strong><br />
              Donaustrasse 44, c/o The Delta Campus<br />
              12043 Berlin, Germany<br />
              Email: <a href="mailto:info@techeurope.io" className="text-white hover:text-gray-300 transition-colors">info@techeurope.io</a><br />
              Phone: <a href="tel:+49 177 450 2020" className="text-white hover:text-gray-300 transition-colors">+49 177 450 2020</a>
            </p>
            
            <p className="mb-12">
              You can also find more information in our <a href="/imprint" className="text-white hover:text-gray-300 transition-colors">Imprint</a>.
            </p>
            
            <p className="text-sm text-gray-500 mt-12">Last updated: November 19, 2025</p>
          </div>
    </SubpageLayout>
  );
}

