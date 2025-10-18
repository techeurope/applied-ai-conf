import Link from 'next/link';
import { SESSIONS } from '@/data/sessions';

export default function FeaturedSessions() {
  return (
    <section id="schedule" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-center">Featured sessions</h2>
        <p className="text-center text-gray-400 mb-12">
          <Link href="#" className="hover:underline">Full schedule</Link>
        </p>
        
        <div className="space-y-8 max-w-4xl mx-auto">
          {SESSIONS.map((session, index) => (
            <div key={index} className="border border-gray-800 rounded-2xl p-8 hover:border-white transition-colors">
              <p className="text-sm text-gray-500 mb-3">{session.time}</p>
              <h3 className="text-2xl font-bold mb-4">{session.title}</h3>
              <p className="text-gray-400 mb-4">{session.description}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-semibold">
                  {session.speakerInitial}
                </div>
                <div>
                  <p className="font-medium">{session.speaker}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
