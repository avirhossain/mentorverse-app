
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

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-background dark:bg-gray-900 min-h-screen">
            <Header />
            <main className="max-w-4xl mx-auto p-4 sm:p-8">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white">Privacy Policy</h1>
                    <p className="mt-2 text-md text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </header>

                <div className="bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-xl shadow-xl border-t-4 border-primary">
                    <LegalSection title="1. Introduction">
                        <p>
                            Mentees ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. We adhere to principles outlined in international regulations like the GDPR and local laws like the Bangladesh Data Protection Act (where applicable).
                        </p>
                    </LegalSection>

                    <LegalSection title="2. Information We Collect">
                        <p>We may collect personal information that you provide to us directly, such as:</p>
                        <ul>
                            <li><strong>Account Information:</strong> Name, email address, password, phone number, and profile picture.</li>
                            <li><strong>Profile Information:</strong> For Mentees, this includes interests and mentorship goals. For Mentors, this includes biography, expertise, and professional experience.</li>
                            <li><strong>Transaction Information:</strong> Details related to balance top-ups, coupon redemptions, and session payments. We do not store full credit card details; they are processed by secure third-party payment gateways.</li>
                            <li><strong>Communications:</strong> Any correspondence between you and Mentees support.</li>
                        </ul>
                         <p>We also collect some information automatically:</p>
                        <ul>
                            <li><strong>Log and Usage Data:</strong> IP address, browser type, operating system, and pages visited.</li>
                        </ul>
                    </LegalSection>

                    <LegalSection title="3. How We Use Your Information">
                        <p>We use your information for various purposes, including to:</p>
                        <ul>
                            <li>Create and manage your account.</li>
                            <li>Provide, operate, and maintain our services.</li>
                            <li>Process your transactions and manage your account balance.</li>
                            <li>Facilitate communication between Mentees and Mentors.</li>
                            <li>Personalize your experience, such as recommending relevant mentors.</li>
                            <li>Communicate with you, including sending service-related announcements and promotional messages (with your consent).</li>
                            <li>Monitor and analyze usage to improve our platform.</li>
                            <li>Enforce our Terms and Conditions and prevent fraudulent activity.</li>
                        </ul>
                    </LegalSection>
                    
                    <LegalSection title="4. Sharing and Disclosure of Information">
                         <p>We do not sell your personal information. We may share your information in the following situations:</p>
                        <ul>
                            <li><strong>With Mentors/Mentees:</strong> To facilitate the mentoring relationship, we share relevant profile information between connected Mentors and Mentees.</li>
                            <li><strong>With Service Providers:</strong> We may share information with third-party vendors who perform services for us, such as payment processing and data hosting. These vendors are contractually obligated to protect your data.</li>
                             <li><strong>For Legal Reasons:</strong> We may disclose your information if required by law, subpoena, or other legal process, or if we have a good faith belief that disclosure is necessary to protect our rights, your safety, or the safety of others. This includes compliance with requests from law enforcement agencies in Bangladesh under the Digital Security Act or other relevant legislation.</li>
                             <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.</li>
                        </ul>
                    </LegalSection>

                    <LegalSection title="5. Data Security">
                        <p>
                            We implement administrative, technical, and physical security measures to help protect your personal information. We use Firebase, a secure platform by Google, for our backend infrastructure. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
                        </p>
                    </LegalSection>

                    <LegalSection title="6. Your Data Rights">
                        <p>
                           Depending on your location (e.g., GDPR for EU residents), you may have the following rights regarding your personal data:
                        </p>
                        <ul>
                            <li><strong>The right to access:</strong> You can request copies of your personal data.</li>
                            <li><strong>The right to rectification:</strong> You can request that we correct any information you believe is inaccurate or complete information you believe is incomplete. Most of this information can be updated directly in your account settings.</li>
                             <li><strong>The right to erasure:</strong> You can request that we erase your personal data, under certain conditions.</li>
                             <li><strong>The right to restrict processing:</strong> You can request that we restrict the processing of your personal data, under certain conditions.</li>
                             <li><strong>The right to data portability:</strong> You can request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
                        </ul>
                        <p>To exercise these rights, please contact us at our support email.</p>
                    </LegalSection>

                    <LegalSection title="7. Data Retention">
                        <p>
                            We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy, or to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.
                        </p>
                    </LegalSection>
                    
                    <LegalSection title="8. Children's Privacy">
                         <p>
                           Our service is not intended for use by children under the age of 13, or the relevant age of digital consent in your jurisdiction. We do not knowingly collect personally identifiable information from children. If you become aware that a child has provided us with personal data, please contact us.
                        </p>
                    </LegalSection>

                    <LegalSection title="9. Changes to This Privacy Policy">
                        <p>
                            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                        </p>
                    </LegalSection>
                    
                    <LegalSection title="10. Contact Us">
                        <p>
                            If you have any questions or concerns about this Privacy Policy, please contact us at: <a href="mailto:privacy@mentees.com" className="text-primary hover:underline">privacy@mentees.com</a>.
                        </p>
                    </LegalSection>
                </div>
            </main>
        </div>
    );
}
