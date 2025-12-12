
import { MenteeHeader } from '@/components/mentee/MenteeHeader';
import { MenteeFooter } from '@/components/mentee/MenteeFooter';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsAndConditionsPage() {
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
          <h1 className="text-4xl font-bold tracking-tight mb-6">Terms & Conditions</h1>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">1. Introduction</h2>
            <p>
              Welcome to MenTees ("we," "us," or "our"). These Terms and Conditions govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms. If you do not agree with any part of these terms, you must not use our services.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">2. Account Registration and Use</h2>
            <p>
              To access most features, you must register for an account. You agree to provide accurate, current, and complete information during the registration process. You are responsible for safeguarding your password and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">3. Mentee and Mentor Conduct</h2>
            <p>
              All users are expected to conduct themselves in a professional and respectful manner. Harassment, abuse, or any form of discriminatory behavior will not be tolerated and may result in immediate account termination.
              Mentors provide guidance and advice based on their experience. Mentees understand that this advice is subjective and that they are ultimately responsible for their own career and life decisions.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">4. Session Booking, Fees, and Payments</h2>
            <p>
              Mentees can book sessions with mentors based on availability. Session fees are determined by the mentor and/or the platform and must be paid in advance through your account balance. All payments are processed in Bangladeshi Taka (BDT). You are responsible for maintaining a sufficient balance to book paid sessions.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">5. Cancellations and Refunds</h2>
            <p>
              Our cancellation and refund policy will be detailed in a separate document. Generally, refunds for cancellations are subject to the timing of the cancellation notice. No-shows are typically not eligible for a refund. Top-ups to your account balance are final and non-refundable.
            </p>
            
            <h2 className="text-2xl font-semibold text-foreground mt-8">6. Content and Intellectual Property</h2>
            <p>
              All content provided on the platform, including text, graphics, logos, and session materials, is the property of MenTees or its content suppliers and protected by intellectual property laws. You may not reproduce, distribute, or create derivative works from any content without explicit permission.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">7. Disclaimers and Limitation of Liability</h2>
            <p>
              Our platform is provided "as is" without any warranties. We do not guarantee that the advice from mentors will lead to any specific outcome. We are not liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability to you for any claim arising out of these terms or your use of the services will not exceed the amount you have paid to us in the 12 months preceding the claim.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">8. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless MenTees and its employees, mentors, and agents from and against any claims, liabilities, damages, and expenses, including reasonable attorneys' fees, arising out of your use of the platform or your violation of these Terms and Conditions.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">9. Termination</h2>
            <p>
              We may suspend or terminate your account and access to our services at our sole discretion, without notice, for conduct that we believe violates these Terms and Conditions or is harmful to other users of the platform, us, or third parties, or for any other reason.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">10. Governing Law</h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of Bangladesh, without regard to its conflict of law principles.
            </p>
            
            <h2 className="text-2xl font-semibold text-foreground mt-8">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will provide notice of any significant changes. Your continued use of the platform after such changes constitutes your acceptance of the new terms.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">12. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at support@mentees.com.
            </p>
          </div>
        </div>
      </main>
      <MenteeFooter />
    </div>
  );
}
