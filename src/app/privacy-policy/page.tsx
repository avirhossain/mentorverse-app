
import { MenteeHeader } from '@/components/mentee/MenteeHeader';
import { MenteeFooter } from '@/components/mentee/MenteeFooter';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MenteeHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl px-4 py-12">
           <div className="mb-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-6">Privacy Policy</h1>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>
              MenTees ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">1. Information We Collect</h2>
            <p>
              We may collect information about you in a variety of ways. The information we may collect on the site includes:
            </p>
            <ul>
              <li>
                <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and phone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the site.
              </li>
              <li>
                <strong>Financial Data:</strong> We store information related to your account balance and transactions within our platform, such as top-ups and session booking fees. We do not store payment card details. All payments are processed through secure third-party payment gateways.
              </li>
              <li>
                <strong>Derivative Data:</strong> Information our servers automatically collect when you access the site, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the site.
              </li>
              <li>
                <strong>Data from Social Networks:</strong> User information from social networking sites, such as Google, including your name, your social network username, location, gender, birth date, email address, profile picture, and public data for contacts, if you connect your account to such social networks.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-8">2. Use of Your Information</h2>
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the site to:
            </p>
            <ul>
              <li>Create and manage your account.</li>
              <li>Process your transactions and session bookings.</li>
              <li>Email you regarding your account or order.</li>
              <li>Fulfill and manage purchases, orders, payments, and other transactions related to the site.</li>
              <li>Enable user-to-user communications (e.g., between mentee and mentor).</li>
              <li>Monitor and analyze usage and trends to improve your experience with the site.</li>
              <li>Notify you of updates to the site.</li>
              <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
              <li>Respond to product and customer service requests.</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-8">3. Disclosure of Your Information</h2>
            <p>
              We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
            </p>
            <ul>
              <li>
                <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law.
              </li>
              <li>
                <strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, and customer service.
              </li>
              <li>
                <strong>With Mentors:</strong> When you book a session, your name and other relevant details will be shared with the mentor to facilitate the session.
              </li>
              <li>
                <strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-8">4. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">5. Policy for Children</h2>
            <p>
              We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">6. Controls for Do-Not-Track Features</h2>
            <p>
              Most web browsers and some mobile operating systems include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. We do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">7. Your Rights Regarding Your Information</h2>
            <p>
              You have the right to review or change the information in your account or terminate your account at any time. To do so, please log into your account settings and update your account, or contact us using the contact information provided. Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">8. Changes to This Privacy Policy</h2>
            <p>
              We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last updated" date of this Privacy Policy.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">9. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at: support@mentees.com.
            </p>
          </div>
        </div>
      </main>
      <MenteeFooter />
    </div>
  );
}
