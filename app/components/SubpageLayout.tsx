import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface SubpageLayoutProps {
  children: React.ReactNode;
}

export default function SubpageLayout({ children }: SubpageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navigation />
      
      <main className="flex-1 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}




