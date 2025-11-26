import { Navigation, Footer } from "@/components";
import { Team } from "@/sections";

export const metadata = {
  title: "Team | Applied AI Conf",
  description: "Meet the team behind Applied AI Conf by {Tech: Europe}",
};

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-black text-white w-full selection:bg-white/20">
      <Navigation />
      <main>
        <Team />
      </main>
      <Footer />
    </div>
  );
}
