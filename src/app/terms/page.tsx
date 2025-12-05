
import React from 'react';
import { Header } from '@/components/common/Header';

const LegalSection = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3 border-b-2 border-primary/20 pb-2">{title}</h2>
        <div className="prose prose-lg dark:prose-invert max-w-full text-gray-700 dark:text-gray-300 space-y-4">
            {children}
        </div>
    </div>
);

export default function TermsAndConditionsPage() {
    return (
        <div className="bg-background dark:bg-gray-900 min-h-screen">
            <Header />
            <main className="max-w-4xl mx-auto p-4 sm:p-8">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white">Terms and Conditions</h1>
                    <p className="mt-2 text-md text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </header>

                <div className="bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-xl shadow-xl border-t-4 border-primary">
                    <LegalSection title="1. Introduction">
                        <p>
                            Welcome to Mentees. These Terms and Conditions govern your use of our website and services. By accessing or using our platform, you agree to be bound by these terms and our Privacy Policy. If you do not agree, you may not use our services.
                        </p>
                        <p>
                            The platform is operated by Mentees ("we", "us", or "our"). We connect individuals seeking mentorship ("Mentees") with experienced professionals ("Mentors").
                        </p>
                    </LegalSection>

                    <LegalSection title="2. User Accounts">
                        <p>
                            To access most features, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.
                        </p>
                        <p>
                            You are responsible for safeguarding your password and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
                        </p>
                         <p>
                            We reserve the right to suspend or terminate accounts that are inactive for an extended period, violate our code of conduct, or are suspected of fraudulent activity, in accordance with applicable laws including the Digital Security Act of Bangladesh.
                        </p>
                    </LegalSection>
                    
                    <LegalSection title="3. Services and Payments">
                        <p>
                            <strong>Session Booking:</strong> Mentees can book sessions with Mentors based on their availability. Sessions can be free or paid, as determined by the Mentor and Mentees.
                        </p>
                        <p>
                            <strong>Payments and Balance:</strong> Paid services require sufficient balance in your account. You can add balance through approved payment methods, such as bKash, or by redeeming valid coupons. All transactions are final except as required by law.
                        </p>
                        <p>
                            <strong>bKash Payments:</strong> Payments made via bKash are subject to manual verification. We aim to verify transactions within 3 business hours. We are not responsible for delays caused by the payment processor or for errors in the transaction details you provide.
                        </p>
                        <p>
                            <strong>Coupons:</strong> Coupons are subject to expiration dates and can only be used once. They have no cash value and cannot be exchanged for cash.
                        </p>
                    </LegalSection>

                    <LegalSection title="4. Code of Conduct">
                        <p>
                            All users (Mentees and Mentors) must conduct themselves professionally and respectfully. Harassment, discrimination, hate speech, or any form of abusive behavior is strictly prohibited.
                        </p>
                        <p>
                            You may not use the platform for any illegal purpose, to solicit personal information, or to share content that is defamatory, obscene, or infringing on intellectual property rights. This is in accordance with international standards and Bangladeshi laws, including the Penal Code, 1860 and the Pornography Control Act, 2012.
                        </p>
                    </LegalSection>
                    
                    <LegalSection title="5. Intellectual Property">
                        <p>
                            The Mentees platform, including its logo, design, text, graphics, and other files, are the proprietary property of Mentees. You may not use, copy, or distribute any of the content without our prior written permission.
                        </p>
                        <p>
                           Content shared by Mentors and Mentees during sessions remains the intellectual property of the respective individuals, unless otherwise agreed upon. Recording sessions is prohibited without the express consent of all participants.
                        </p>
                    </LegalSection>

                    <LegalSection title="6. Disclaimers and Limitation of Liability">
                        <p>
                            Mentees is a platform provider. We are not a party to the mentoring relationship and do not guarantee the quality, accuracy, or outcome of any mentorship session. Mentors are independent contractors, not employees of Mentees.
                        </p>
                        <p>
                            To the fullest extent permitted by law, Mentees shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                        </p>
                    </LegalSection>

                    <LegalSection title="7. Termination">
                        <p>
                            We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including, without limitation, a breach of the Terms.
                        </p>
                        <p>
                            You may terminate your account at any time by contacting our support team.
                        </p>
                    </LegalSection>

                    <LegalSection title="8. Governing Law">
                        <p>
                            These Terms shall be governed and construed in accordance with the laws of Bangladesh, without regard to its conflict of law provisions. You agree to submit to the exclusive jurisdiction of the courts located in Dhaka, Bangladesh to resolve any legal matter arising from the Terms.
                        </p>
                        <p>
                            For international users, we strive to comply with applicable local laws, but you are responsible for your own compliance with your local jurisdiction's laws.
                        </p>
                    </LegalSection>

                    <LegalSection title="9. Contact Us">
                        <p>
                            If you have any questions about these Terms, please contact us at <a href="mailto:support@mentees.com" className="text-primary hover:underline">support@mentees.com</a>.
                        </p>
                    </LegalSection>
                </div>
            </main>
        </div>
    );
}
