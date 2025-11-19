import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Imprint - Applied AI Conf by {Tech: Europe}",
  description: "Legal imprint and contact information",
};

export default function ImprintPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navigation />
      
      <main className="flex-1 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h1 className="text-4xl font-bold font-mono text-white mb-12">Imprint</h1>
          
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-4">Information according to § 5 TMG</h2>
            
            <h3 className="text-xl font-mono font-bold text-white mt-8 mb-2">BLW Tech Berlin Ventures UG (haftungsbeschränkt)</h3>
            
            <h4 className="font-mono font-semibold text-gray-300 mt-6 mb-2">Address:</h4>
            <p className="text-gray-400 mb-4">
              Donaustrasse 44, c/o The Delta Campus<br />
              12043 Berlin<br />
              Germany
            </p>
            
            <h4 className="font-mono font-semibold text-gray-300 mt-6 mb-2">Contact</h4>
            <p className="text-gray-400 mb-4">
              Email: <a href="mailto:info@techeurope.io" className="text-white hover:text-gray-300 transition-colors">info@techeurope.io</a><br />
              Phone: <a href="tel:+49 177 450 2020" className="text-white hover:text-gray-300 transition-colors">+49 177 450 2020</a><br />
              Website: <a href="https://techeurope.io" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 transition-colors">techeurope.io</a>
            </p>
            
            <h4 className="font-mono font-semibold text-gray-300 mt-6 mb-2">Responsible for content according to § 55 Abs. 2 RStV</h4>
            <p className="text-gray-400 mb-4">
              Bela Wiertz<br />
              Donaustrasse 44<br />
              12043 Berlin<br />
              Germany
            </p>
            
            <h3 className="text-xl font-mono font-bold text-white mt-10 mb-4">Commercial Register</h3>
            <p className="text-gray-400 mb-8">
              Register Court: Amtsgericht Berlin-Charlottenburg | HRB 268927 B
            </p>
            
            <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">Disclaimer</h2>
            
            <h3 className="text-xl font-mono font-bold text-white mt-8 mb-4">Liability for Contents</h3>
            <p className="text-gray-400 mb-4">
              As service providers, we are liable for own contents of these websites according to Sec. 7, paragraph 1 German Telemedia Act (TMG). However, according to Sec. 8 to 10 German Telemedia Act (TMG), service providers are not under obligation to permanently monitor submitted or stored information or to search for evidences that indicate illegal activities. Legal obligations to remove information or to block the use of information remain unchallenged. In this case, liability is only possible at the time of knowledge about a specific violation of law. Illegal contents will be removed immediately at the time we get knowledge of them.
            </p>
            
            <h3 className="text-xl font-mono font-bold text-white mt-8 mb-4">Liability for Links</h3>
            <p className="text-gray-400 mb-4">
              Our offer includes links to external third party websites. We have no influence on the contents of those websites, therefore we cannot guarantee for those contents. Providers or administrators of linked websites are always responsible for their own contents. The linked websites had been checked for possible violations of law at the time of the establishment of the link. Illegal contents were not detected at the time of the linking. However, a permanent monitoring of the contents of linked websites cannot be imposed without reasonable indications that there has been a violation of law. Illegal links will be removed immediately at the time we get knowledge of them.
            </p>
            
            <h3 className="text-xl font-mono font-bold text-white mt-8 mb-4">Copyright</h3>
            <p className="text-gray-400 mb-4">
              Contents and compilations published on these websites by the providers are subject to German copyright laws. Reproduction, editing, distribution as well as the use of any kind outside the scope of the copyright law require a written permission of the author or originator. Downloads and copies of these websites are permitted for private use only. The commercial use of our contents without permission of the original author is prohibited.
            </p>
            
            <h3 className="text-xl font-mono font-bold text-white mt-8 mb-4">Data Protection</h3>
            <p className="text-gray-400 mb-12">
              Information about the collection of personal data and your rights can be found in our <a href="/privacy" className="text-white hover:text-gray-300 transition-colors">Privacy Policy</a>.
            </p>
            
            <p className="text-sm text-gray-500 mt-12">Last updated: November 19, 2025</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

