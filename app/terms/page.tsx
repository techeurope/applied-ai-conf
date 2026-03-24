import SubpageLayout from "@/components/SubpageLayout";

export const metadata = {
  title: "Terms of Service - Applied AI Conf by {Tech: Europe}",
  description:
    "Terms of service, refund policy, and event conditions for Applied AI Conf",
};

export default function TermsPage() {
  return (
    <SubpageLayout>
      <h1 className="text-4xl font-bold font-mono text-white mb-12">
        Terms of Service
      </h1>

      <div className="prose prose-invert max-w-none text-gray-400">
        <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">
          1. Scope
        </h2>
        <p className="mb-8">
          These Terms of Service apply to the purchase of tickets and attendance
          at Applied AI Conf, organized by BLW Tech Berlin Ventures UG
          (haftungsbeschränkt). By purchasing a ticket or attending the event,
          you agree to these terms.
        </p>

        <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">
          2. Ticket Purchase
        </h2>
        <p className="mb-4">
          Tickets for Applied AI Conf are sold through our ticketing partner{" "}
          <a
            href="https://lu.ma"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-300 transition-colors"
          >
            Luma
          </a>
          . All ticket prices are listed in EUR and include applicable VAT.
        </p>
        <p className="mb-8">
          A ticket purchase is binding upon completion of the checkout process.
          You will receive a confirmation email with your ticket details.
        </p>

        <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">
          3. Refund &amp; Cancellation Policy
        </h2>
        <p className="mb-4">
          <strong className="text-white">Paid tickets:</strong> Refunds are
          available up to 30 days before the event date. After this deadline, no
          refunds will be issued.
        </p>
        <p className="mb-4">
          <strong className="text-white">Virtual tickets:</strong> Virtual
          tickets are free and can be cancelled at any time.
        </p>
        <p className="mb-8">
          To request a refund, please contact us at{" "}
          <a
            href="mailto:info@techeurope.io"
            className="text-white hover:text-gray-300 transition-colors"
          >
            info@techeurope.io
          </a>{" "}
          with your ticket confirmation details.
        </p>

        <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">
          4. Event Changes
        </h2>
        <p className="mb-4">
          The organizer reserves the right to modify the event programme,
          including changes to speakers, session times, and venues, without prior
          notice.
        </p>
        <p className="mb-8">
          If the organizer cancels the event entirely, all ticket holders will
          receive a full refund of the ticket price.
        </p>

        <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">
          5. Liability
        </h2>
        <p className="mb-4">
          Attendance at Applied AI Conf is at the attendee&apos;s own risk. The
          organizer&apos;s liability is limited to the ticket price paid.
        </p>
        <p className="mb-8">
          The organizer is not liable for any indirect, incidental, or
          consequential damages arising from attendance at the event.
        </p>

        <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">
          6. Code of Conduct
        </h2>
        <p className="mb-8">
          All attendees are expected to comply with our{" "}
          <a
            href="/code-of-conduct"
            className="text-white hover:text-gray-300 transition-colors"
          >
            Code of Conduct
          </a>
          . Violations may result in removal from the event without refund.
        </p>

        <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">
          7. Data Protection
        </h2>
        <p className="mb-8">
          Information about how we collect and process your personal data can be
          found in our{" "}
          <a
            href="/privacy"
            className="text-white hover:text-gray-300 transition-colors"
          >
            Privacy Policy
          </a>
          .
        </p>

        <h2 className="text-2xl font-mono font-bold text-white mt-12 mb-6">
          8. Contact
        </h2>
        <p className="mb-4">
          <strong className="text-white">
            BLW Tech Berlin Ventures UG (haftungsbeschränkt)
          </strong>
          <br />
          Donaustrasse 44, c/o The Delta Campus
          <br />
          12043 Berlin
          <br />
          Germany
        </p>
        <p className="mb-12">
          Email:{" "}
          <a
            href="mailto:info@techeurope.io"
            className="text-white hover:text-gray-300 transition-colors"
          >
            info@techeurope.io
          </a>
          <br />
          Phone:{" "}
          <a
            href="tel:+49 177 450 2020"
            className="text-white hover:text-gray-300 transition-colors"
          >
            +49 177 450 2020
          </a>
        </p>

        <p className="text-sm text-gray-500 mt-12">
          Last updated: March 24, 2026
        </p>
      </div>
    </SubpageLayout>
  );
}
