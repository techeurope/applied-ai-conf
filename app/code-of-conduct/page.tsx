import SubpageLayout from "@/components/SubpageLayout";

export const metadata = {
  title: "Code of Conduct - Applied AI Conf by {Tech: Europe}",
  description: "Code of Conduct for Applied AI Conf",
};

export default function CodeOfConductPage() {
  return (
    <SubpageLayout>
      <h1 className="text-4xl font-bold font-mono text-white mb-12">Code of Conduct</h1>
          
          <div className="prose prose-invert max-w-none text-gray-400">
            <p className="mb-8">
              Our community is dedicated to providing a harassment-free experience for everyone, regardless of gender, gender identity and expression, sexual orientation, disability, physical appearance, body size, race, age, religion, or lack thereof. We do not tolerate harassment of participants in any form. Sexual language and imagery are not appropriate for any community venue, including discussions and events. Participants violating these rules may be sanctioned or expelled from the community at the discretion of the organizers.
            </p>
            
            <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">Anti-Harassment</h2>
            <p className="mb-4">Harassment includes, but is not limited to:</p>
            <ul className="list-disc list-inside mb-8 space-y-2">
              <li>Verbal comments that reinforce social structures of domination related to gender, gender identity and expression, sexual orientation, disability, physical appearance, body size, race, age, religion.</li>
              <li>Sexual images in public spaces.</li>
              <li>Deliberate intimidation, stalking, or following.</li>
              <li>Harassing photography or recording.</li>
              <li>Sustained disruption of talks or other events.</li>
              <li>Inappropriate physical contact.</li>
              <li>Invasion of personal space.</li>
              <li>Unwelcome sexual attention.</li>
              <li>Advocating for, or encouraging, any of the above behavior.</li>
            </ul>
            
            <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">Enforcement</h2>
            <p className="mb-8">
              Participants asked to stop any harassing behavior are expected to comply immediately. If a participant engages in harassing behavior, organizers retain the right to take any actions to maintain a welcoming environment for all participants. This includes warning the offender or expulsion from the community.
            </p>
            
            <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">Reporting</h2>
            <p className="mb-8">
              If someone makes you or anyone else feel unsafe or unwelcome, please report it as soon as possible. You can make a report either personally or anonymously.
            </p>
            
            <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">Inclusive Language</h2>
            <p className="mb-4">Any speech that reinforces harmful stereotypes is unwelcome. Examples include, but are not limited to:</p>
            <ul className="list-disc list-inside mb-8 space-y-2">
              <li>Making undue assumptions and/or sweeping generalizations about a group of people.</li>
              <li>Any language that deems disability a defect.</li>
              <li>Any unwelcome comments on one&apos;s physical appearance.</li>
            </ul>
            
            <p className="text-sm text-gray-500 mt-12">
              This Code of Conduct is adapted from the{" "}
              <a 
                href="https://2019.jsconf.eu/code-of-conduct/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors"
              >
                JSConf EU Code of Conduct
              </a>.
            </p>
          </div>
    </SubpageLayout>
  );
}

