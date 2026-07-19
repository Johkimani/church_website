import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield, FileText, Database, Eye, Lock, Cookie,
  UserCheck, Share2, Users, Clock, Mail, RefreshCw, ArrowLeft
} from "lucide-react";

const sections = [
  { id: "introduction",  title: "1. Introduction",             icon: FileText },
  { id: "data-collected", title: "2. Information We Collect",   icon: Database },
  { id: "how-we-use",    title: "3. How We Use Your Data",     icon: Eye },
  { id: "cookies",       title: "4. Cookies & Analytics",      icon: Cookie },
  { id: "sharing",       title: "5. Data Sharing & Disclosure", icon: Share2 },
  { id: "security",      title: "6. Security & Retention",     icon: Lock },
  { id: "rights",        title: "7. Your Rights",              icon: UserCheck },
  { id: "third-party",   title: "8. Third-Party Services",     icon: Users },
  { id: "children",      title: "9. Children's Privacy",       icon: Clock },
  { id: "changes",       title: "10. Changes to This Policy",  icon: RefreshCw },
  { id: "contact",       title: "11. Contact Us",              icon: Mail },
];

export default function Privacy() {
  const [activeSection, setActiveSection] = useState("introduction");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const SectionCard = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <section id={id} className="scroll-mt-28 bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow duration-300">
      {children}
    </section>
  );

  const SectionHeading = ({ icon: Icon, title, color }: { icon: any; title: string; color: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="text-xl sm:text-2xl font-black text-slate-900">{title}</h2>
    </div>
  );

  const BulletList = ({ items, borderColor }: { items: { title: string; desc: string }[]; borderColor: string }) => (
    <ul className={`space-y-3 pl-4 border-l-2 ${borderColor}`}>
      {items.map((item, i) => (
        <li key={i}>
          <strong className="text-slate-800">{item.title}:</strong>{" "}
          <span className="text-slate-600">{item.desc}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-24 px-6 sm:px-12 lg:px-24 relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-6">
            <Shield className="w-3.5 h-3.5" />
            Privacy Policy
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none mb-6">
            Privacy Policy
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            We are committed to protecting your privacy. This policy explains how the St. Thomas Aquinas
            Catholic Student Association collects, uses, and safeguards your personal information.
          </p>
          <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Last updated: July 2026
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 lg:sticky lg:top-28 h-fit space-y-1.5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-3">
              Table of Contents
            </h3>
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                      : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{sec.title}</span>
                </button>
              );
            })}
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-10">

            {/* 1. Introduction */}
            <SectionCard id="introduction">
              <SectionHeading icon={Shield} title="1. Introduction" color="bg-emerald-50 text-emerald-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  The St. Thomas Aquinas Catholic Student Association ("CSA," "we," "us," or "our") operates
                  the csa.sta-kirinyaga.org platform ("Platform"). This Privacy Policy is designed to inform
                  you about how we collect, use, disclose, and safeguard your personal information when you
                  visit or interact with the Platform or engage with us through parish activities.
                </p>
                <p>
                  We take your privacy seriously and are committed to handling your data in accordance with
                  the Data Protection Act of the Republic of Kenya (No. 24 of 2019) and other applicable
                  data protection laws. Please read this policy carefully to understand our practices
                  regarding your personal data. By using the Platform, you acknowledge the practices
                  described in this policy.
                </p>
                <p>
                  If you do not agree with any part of this Privacy Policy, you should discontinue use of
                  the Platform. This policy applies to all information collected through the Platform, our
                  communication channels, and in-person parish interactions that are subsequently recorded
                  in our systems.
                </p>
              </div>
            </SectionCard>

            {/* 2. Information We Collect */}
            <SectionCard id="data-collected">
              <SectionHeading icon={Database} title="2. Information We Collect" color="bg-blue-50 text-blue-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>We collect information in two ways: <strong>information you provide directly</strong> and
                <strong> information collected automatically</strong>.</p>

                <div className="mt-6">
                  <h4 className="font-black text-slate-800 mb-3 text-sm uppercase tracking-wider">A. Information You Provide</h4>
                  <BulletList items={[
                    { title: "Account Details", desc: "Full name, email address, phone number (M-Pesa-linked), parish registration number, and year of study when you create an account." },
                    { title: "Profile Data", desc: "Optional information such as profile picture, home parish, ministry interests, and emergency contact details." },
                    { title: "Transaction Records", desc: "Donation history, merchandise orders, rental bookings, and payment confirmations." },
                    { title: "Communications", desc: "Correspondence sent through our contact forms, support requests, schedule suggestions, and feedback submissions." },
                    { title: "Event Participation", desc: "RSVP status, attendance history, and preferences for CSA events and activities." },
                  ]} borderColor="border-blue-100" />
                </div>

                <div className="mt-6">
                  <h4 className="font-black text-slate-800 mb-3 text-sm uppercase tracking-wider">B. Information Collected Automatically</h4>
                  <BulletList items={[
                    { title: "Device Data", desc: "IP address, browser type and version, operating system, device type, and screen resolution." },
                    { title: "Usage Data", desc: "Pages visited, time spent on pages, navigation paths, click patterns, and feature interactions." },
                    { title: "Location", desc: "General geographic location inferred from IP address (not precise GPS coordinates)." },
                  ]} borderColor="border-blue-100" />
                </div>
              </div>
            </SectionCard>

            {/* 3. How We Use Your Data */}
            <SectionCard id="how-we-use">
              <SectionHeading icon={Eye} title="3. How We Use Your Data" color="bg-teal-50 text-teal-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>We use the information we collect for the following purposes:</p>
                <BulletList items={[
                  { title: "Service Delivery", desc: "To create and manage your account, process orders and donations, coordinate rentals, and operate all Platform features." },
                  { title: "Communication", desc: "To send transactional emails, event reminders, schedule updates, and respond to your inquiries." },
                  { title: "Community Building", desc: "To facilitate member-to-member connections, prayer group coordination, and ministry assignments." },
                  { title: "Improvement", desc: "To analyze usage trends, diagnose technical issues, enhance user experience, and develop new features." },
                  { title: "Legal Compliance", desc: "To comply with legal obligations under Kenyan law, including financial record-keeping for donations and transactions." },
                  { title: "Security", desc: "To detect, prevent, and respond to fraud, unauthorized access, or violations of our Terms." },
                ]} borderColor="border-teal-100" />
                <p className="mt-4">
                  We do <strong>not</strong> sell, rent, or trade your personal information to third parties
                  for marketing purposes.
                </p>
              </div>
            </SectionCard>

            {/* 4. Cookies & Analytics */}
            <SectionCard id="cookies">
              <SectionHeading icon={Cookie} title="4. Cookies & Analytics" color="bg-amber-50 text-amber-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  The Platform uses cookies and similar tracking technologies to enhance your experience,
                  analyze traffic, and remember preferences. A cookie is a small text file stored on your
                  device by your web browser.
                </p>
                <div className="mt-6">
                  <h4 className="font-black text-slate-800 mb-3 text-sm uppercase tracking-wider">Types of Cookies We Use</h4>
                  <BulletList items={[
                    { title: "Essential Cookies", desc: "Required for the Platform to function properly, including authentication and session management." },
                    { title: "Preference Cookies", desc: "Remember your settings, language preferences, and display options across visits." },
                    { title: "Analytics Cookies", desc: "Help us understand how members interact with the Platform so we can improve features and content." },
                    { title: "Third-Party Cookies", desc: "Limited use of embedded content (e.g., YouTube videos) — these services set their own cookies governed by their respective policies." },
                  ]} borderColor="border-amber-100" />
                </div>
                <p className="mt-4">
                  You can control or disable cookies through your browser settings. However, disabling
                  essential cookies may affect the functionality of certain Platform features.
                </p>
              </div>
            </SectionCard>

            {/* 5. Data Sharing & Disclosure */}
            <SectionCard id="sharing">
              <SectionHeading icon={Share2} title="5. Data Sharing & Disclosure" color="bg-purple-50 text-purple-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  We do not disclose your personal information except in the following limited circumstances:
                </p>
                <BulletList items={[
                  { title: "Parish Administration", desc: "Information shared with the parish priest, finance committee, and CSA executive committee for legitimate administrative purposes." },
                  { title: "Service Providers", desc: "Trusted third-party vendors who assist in operating the Platform (e.g., hosting, payment processing), under strict data processing agreements." },
                  { title: "Legal Obligations", desc: "When required by law, court order, or governmental regulation, or to protect the rights, property, or safety of the CSA or its members." },
                  { title: "Consent", desc: "With your explicit consent for specific purposes not covered above." },
                ]} borderColor="border-purple-100" />
                <p className="mt-4">
                  Cross-border data transfers, if any, will only occur to countries with adequate data
                  protection standards as recognized under Kenyan law.
                </p>
              </div>
            </SectionCard>

            {/* 6. Security & Retention */}
            <SectionCard id="security">
              <SectionHeading icon={Lock} title="6. Security & Data Retention" color="bg-slate-50 text-slate-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal
                  information against unauthorized access, alteration, disclosure, or destruction. These
                  include:
                </p>
                <BulletList items={[
                  { title: "Encryption", desc: "All data transmitted between your browser and our servers is encrypted using TLS (Transport Layer Security)." },
                  { title: "Access Control", desc: "Strict role-based access controls ensure that only authorized personnel can access sensitive data." },
                  { title: "Regular Audits", desc: "Periodic security reviews and vulnerability assessments are conducted to maintain system integrity." },
                  { title: "Backups", desc: "Data is backed up regularly to secure off-site locations with encryption at rest." },
                ]} borderColor="border-slate-100" />
                <p className="mt-4">
                  <strong>Retention Period:</strong> We retain your personal information for as long as your
                  account is active or as needed to provide services. Transaction records are retained for
                  a minimum of seven (7) years to comply with Kenyan financial regulations. Inactive accounts
                  are deleted after five (5) years of inactivity, unless otherwise required by law.
                </p>
              </div>
            </SectionCard>

            {/* 7. Your Rights */}
            <SectionCard id="rights">
              <SectionHeading icon={UserCheck} title="7. Your Rights" color="bg-indigo-50 text-indigo-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  Under the Kenyan Data Protection Act (2019) and applicable privacy laws, you have the
                  following rights regarding your personal information:
                </p>
                <BulletList items={[
                  { title: "Access", desc: "Request a copy of the personal data we hold about you." },
                  { title: "Rectification", desc: "Request correction of inaccurate or incomplete data in your account." },
                  { title: "Erasure", desc: "Request deletion of your personal data, subject to legal retention requirements." },
                  { title: "Restriction", desc: "Request limitation of processing in certain circumstances." },
                  { title: "Portability", desc: "Receive your data in a structured, commonly used format." },
                  { title: "Objection", desc: "Object to the processing of your data for direct communication or profiling." },
                  { title: "Withdrawal", desc: "Withdraw consent at any time where processing is based on consent." },
                ]} borderColor="border-indigo-100" />
                <p className="mt-4">
                  To exercise any of these rights, contact us using the information in Section 11. We will
                  respond to your request within thirty (30) days as required by law.
                </p>
              </div>
            </SectionCard>

            {/* 8. Third-Party Services */}
            <SectionCard id="third-party">
              <SectionHeading icon={Users} title="8. Third-Party Services" color="bg-cyan-50 text-cyan-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  The Platform may contain links to third-party websites or services that are not owned or
                  controlled by the CSA. These include:
                </p>
                <BulletList items={[
                  { title: "Payment Processors", desc: "M-Pesa and/or other integrated gateways handle transaction processing. Your payment details are governed by their respective privacy policies." },
                  { title: "Embedded Content", desc: "YouTube videos, Google Maps integrations, or social media feeds embedded within the Platform are subject to the privacy practices of those providers." },
                  { title: "External Links", desc: "References to diocesan websites, Catholic organizations, or partner resources are provided for convenience and carry their own privacy terms." },
                ]} borderColor="border-cyan-100" />
                <p className="mt-4">
                  We are not responsible for the privacy practices of any third-party services. We encourage
                  you to review the privacy policies of any external sites you visit through links from our
                  Platform.
                </p>
              </div>
            </SectionCard>

            {/* 9. Children's Privacy */}
            <SectionCard id="children">
              <SectionHeading icon={Users} title="9. Children's Privacy" color="bg-rose-50 text-rose-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  The Platform is not directed at children under the age of 13. We do not knowingly collect
                  personal information from children under 13.
                </p>
                <p>
                  Where a minor (under 18) is a member of the CSA — such as a Form 1 student — we require
                  that a parent or guardian provide consent for the creation of the account and the associated
                  data processing. Parents or legal guardians may review, update, or request deletion of
                  their child's personal data by contacting us directly.
                </p>
                <p>
                  If you believe a child under the age of 13 has provided personal data to us without parental
                  consent, please contact us immediately so we can investigate and take appropriate action.
                </p>
              </div>
            </SectionCard>

            {/* 10. Changes to This Policy */}
            <SectionCard id="changes">
              <SectionHeading icon={RefreshCw} title="10. Changes to This Privacy Policy" color="bg-orange-50 text-orange-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices,
                  legal requirements, or operational needs. When we make material changes, we will notify
                  you through:
                </p>
                <BulletList items={[
                  { title: "Platform Notice", desc: "A prominent banner or notification on the Platform dashboard." },
                  { title: "Email Notification", desc: "An email sent to the address associated with your account." },
                  { title: "Policy Page", desc: "The updated policy with a new \`Last updated\` date at the top of this page." },
                ]} borderColor="border-orange-100" />
                <p className="mt-4">
                  We encourage you to review this Privacy Policy periodically. Your continued use of the
                  Platform after changes take effect signifies your acceptance of the revised policy.
                </p>
              </div>
            </SectionCard>

            {/* 11. Contact Us */}
            <SectionCard id="contact">
              <SectionHeading icon={Mail} title="11. Contact Us" color="bg-emerald-50 text-emerald-600" />
              <p className="text-slate-600 mb-6 text-sm sm:text-base font-medium">
                If you have any questions, concerns, complaints, or requests regarding this Privacy Policy
                or our data practices, please reach out to us:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Mail, label: "Data Protection Officer", value: "dpo@sta-kirinyaga.org", color: "text-emerald-600" },
                  { icon: Mail, label: "CSA Secretariat", value: "csa@sta-kirinyaga.org", color: "text-emerald-600" },
                  { icon: Mail, label: "Physical Address", value: "St. Thomas Aquinas Catholic Church, Kutus-Kerugoya Rd, Kirinyaga", color: "text-emerald-600" },
                  { icon: Mail, label: "Phone", value: "+254 7XX XXX XXX", color: "text-emerald-600" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <item.icon className={`w-5 h-5 ${item.color} shrink-0`} />
                    <div>
                      <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider">{item.label}</div>
                      <div className="text-xs font-bold text-slate-800">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Navigate to Terms */}
            <div className="flex justify-center pt-4">
              <Link
                to="/terms"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-emerald-100 text-emerald-700 rounded-2xl font-black text-sm hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300 shadow-sm hover:shadow-md group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                View Terms &amp; Conditions
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
