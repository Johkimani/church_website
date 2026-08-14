import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Scale, FileText, Users, Shield, ShoppingBag, Landmark,
  HelpCircle, HeartHandshake, AlertTriangle, Gavel, RefreshCw, Mail, ArrowRight, ArrowLeft
} from "lucide-react";

const sections = [
  { id: "introduction",      title: "1. Introduction",               icon: FileText },
  { id: "eligibility",       title: "2. Eligibility & Accounts",     icon: Users },
  { id: "conduct",           title: "3. Member Conduct",             icon: Scale },
  { id: "merchandise",       title: "4. Merchandise & Rentals",      icon: ShoppingBag },
  { id: "donations",         title: "5. Donations & Support",        icon: Landmark },
  { id: "refunds",           title: "6. Refund & Cancellation",      icon: RefreshCw },
  { id: "prohibited",        title: "7. Prohibited Activities",      icon: AlertTriangle },
  { id: "ip",                title: "8. Intellectual Property",      icon: Shield },
  { id: "disclaimers",       title: "9. Disclaimers & Liability",    icon: HelpCircle },
  { id: "indemnification",   title: "10. Indemnification",           icon: Gavel },
  { id: "changes",           title: "11. Changes to Terms",          icon: HeartHandshake },
  { id: "contact",           title: "12. Contact Information",       icon: Mail },
];

export default function Terms() {
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

  const sectionProps = (id: string, icon: any, color: string) => ({
    id, icon, color
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-24 px-6 sm:px-12 lg:px-24 relative">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none mb-6">
            Terms &amp; Conditions
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            These terms govern your access to and use of the St. Thomas Aquinas Catholic Student Association
            platform, including all content, services, and community features provided therein.
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
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
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
              <SectionHeading icon={FileText} title="1. Introduction" color="bg-indigo-50 text-indigo-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  Welcome to the St. Thomas Aquinas Catholic Student Association (CSA) digital platform
                  ("Platform"). By accessing or using the Platform, including any web pages, mobile interfaces,
                  applications, products, or services offered through csakyu.com, you agree to be
                  bound by these Terms and Conditions ("Terms"). If you do not agree with any part of these
                  Terms, you must not access or use the Platform.
                </p>
                <p>
                  The Platform is operated and maintained by the St. Thomas Aquinas CSA executive committee
                  ("CSA," "we," "us," or "our"), a registered Catholic student association within the
                  Catholic Diocese of Kirinyaga, Kenya. These Terms constitute a legally binding agreement
                  between you (whether acting as an individual or on behalf of an entity) and the CSA.
                </p>
                <p>
                  Any new features, tools, or services added to the Platform shall be subject to these Terms.
                  The most current version of the Terms is always available at this page. We reserve the right
                  to update, change, or replace any part of these Terms by posting updates on the Platform.
                  Your continued use of the Platform after any changes constitutes acceptance of the revised Terms.
                </p>
              </div>
            </SectionCard>

            {/* 2. Eligibility & Accounts */}
            <SectionCard id="eligibility">
              <SectionHeading icon={Users} title="2. Eligibility & Account Registration" color="bg-blue-50 text-blue-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  The Platform is intended for use by current and past members of the St. Thomas Aquinas CSA,
                  parishioners, and authorized guests. By creating an account, you represent that:
                </p>
                <BulletList items={[
                  { title: "Accuracy", desc: "All registration information you provide is accurate, current, and complete." },
                  { title: "Age", desc: "You are at least 16 years of age. If you are under 16, a parent or guardian must supervise your use of the Platform." },
                  { title: "Capacity", desc: "You have the legal capacity to enter into binding agreements." },
                  { title: "Responsibility", desc: "You are solely responsible for maintaining the confidentiality of your login credentials and for all activities occurring under your account." },
                  { title: "Notification", desc: "You must notify us immediately of any unauthorized use of your account or security breach." },
                ]} borderColor="border-blue-100" />
                <p className="mt-4">
                  We reserve the right to refuse service, suspend, or terminate accounts if any information
                  provided proves to be false, inaccurate, or outdated, or if we determine that your conduct
                  violates these Terms.
                </p>
              </div>
            </SectionCard>

            {/* 3. Member Conduct */}
            <SectionCard id="conduct">
              <SectionHeading icon={Scale} title="3. Member Code of Conduct" color="bg-sky-50 text-sky-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  As a platform dedicated to fostering spiritual growth, Christian fellowship, and community
                  service, we expect all members to adhere to the following standards of conduct:
                </p>
                <BulletList items={[
                  { title: "Respect", desc: "Treat all members, officials, and guests with dignity, charity, and respect. Harassment, hate speech, or discriminatory language will not be tolerated." },
                  { title: "Authenticity", desc: "Provide truthful information in profile details, suggestions, and all communications. Impersonating another member or official is prohibited." },
                  { title: "Compliance", desc: "Use the Platform in compliance with all applicable laws, including copyright and data protection regulations." },
                  { title: "Integrity", desc: "Do not attempt to manipulate voting systems, suggestion rankings, or any community-driven features." },
                  { title: "Reporting", desc: "Report violations of these Terms to the CSA executive committee through the designated channels." },
                ]} borderColor="border-sky-100" />
              </div>
            </SectionCard>

            {/* 4. Merchandise & Rentals */}
            <SectionCard id="merchandise">
              <SectionHeading icon={ShoppingBag} title="4. Merchandise Purchases & Asset Rentals" color="bg-emerald-50 text-emerald-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  The Platform facilitates custom merchandise orders (e.g., CSA T-shirts, sacramentals) and
                  hire services for parish assets (chairs,and liturgical instruments). The following
                  conditions apply:
                </p>
                <BulletList items={[
                  { title: "Order Commitment", desc: "Placing an order constitutes a binding commitment to purchase or rent. All orders are subject to availability and payment verification." },
                  { title: "Pricing", desc: "Prices are displayed in Kenyan Shillings (KES) and are subject to change without prior notice. Confirmed orders are honored at the price quoted at the time of order." },
                  { title: "Payment", desc: "Payment is processed through M-Pesa or other integrated payment gateways. Transaction receipts are recorded and accessible from your account dashboard." },
                  { title: "Asset Responsibility", desc: "Members renting CSA assets must return them in the same condition. Damage, loss, or theft will result in repair or replacement costs billed to the responsible member." },
                  { title: "Pickup", desc: "Orders and rentals are available for pickup at the Holy Rosary Parish Kutus premises unless delivery arrangements have been explicitly agreed upon." },
                ]} borderColor="border-emerald-100" />
              </div>
            </SectionCard>

            {/* 5. Donations */}
            <SectionCard id="donations">
              <SectionHeading icon={Landmark} title="5. Donations & Financial Support" color="bg-amber-50 text-amber-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  Financial contributions made through the Platform support CSA projects, devotional materials,
                  outreach campaigns, and Jumuiya development initiatives:
                </p>
                <BulletList items={[
                  { title: "Voluntary Basis", desc: "All donations, tithes, and offerings made through the Platform are strictly voluntary and non-refundable." },
                  { title: "Transparency", desc: "Donation records are maintained securely and are viewable within your account dashboard. Summary reports are shared with the CSA finance committee." },
                  { title: "Receipts", desc: "E-receipts are generated for every transaction and can be downloaded for record-keeping purposes." },
                  { title: "Allocation", desc: "Unless specified otherwise, donations are allocated to the general CSA operational fund. Designated giving options are clearly labeled at the point of contribution." },
                ]} borderColor="border-amber-100" />
              </div>
            </SectionCard>

            {/* 6. Refund & Cancellation */}
            <SectionCard id="refunds">
              <SectionHeading icon={RefreshCw} title="6. Refund & Cancellation Policy" color="bg-rose-50 text-rose-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  Our refund and cancellation policies are designed to be fair while protecting the interests
                  of the CSA community:
                </p>
                <BulletList items={[
                  { title: "Merchandise Orders", desc: "Custom orders (e.g., T-shirts) may be cancelled within 24 hours of placement for a full refund. After 24 hours, or once production has begun, cancellations are at the discretion of the CSA." },
                  { title: "Rental Bookings", desc: "Rental cancellations made at least 48 hours before the event date are fully refundable. Late cancellations may incur an administrative fee of up to 50% of the rental cost." },
                  { title: "Donations", desc: "Donations are non-refundable once processed, except in cases of demonstrable technical error resulting in duplicate charges." },
                  { title: "Processing", desc: "Approved refunds will be processed within 14 business days and returned via the original payment method where possible." },
                ]} borderColor="border-rose-100" />
              </div>
            </SectionCard>

            {/* 7. Prohibited Activities */}
            <SectionCard id="prohibited">
              <SectionHeading icon={AlertTriangle} title="7. Prohibited Activities" color="bg-red-50 text-red-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  The following activities are strictly forbidden when using the Platform or its content:
                </p>
                <BulletList items={[
                  { title: "Unlawful Use", desc: "Engaging in or encouraging any activity that violates local, national, or international law." },
                  { title: "Harmful Conduct", desc: "Harassing, abusing, defaming, or discriminating against any individual or group, including on the basis of gender, ethnicity, religion, or disability." },
                  { title: "Security Breaches", desc: "Attempting to bypass authentication mechanisms, access unauthorized data, or interfere with server operations." },
                  { title: "Malicious Code", desc: "Uploading or transmitting viruses, malware, or any code designed to disrupt the functionality of the Platform." },
                  { title: "Data Scraping", desc: "Automated collection of member data, content, or any Platform material without explicit written permission." },
                  { title: "Impersonation", desc: "Misrepresenting your identity, affiliation with the CSA, or authority to act on behalf of another person or entity." },
                  { title: "Spam", desc: "Distributing unsolicited communications, advertisements, or promotional material through Platform channels." },
                ]} borderColor="border-red-100" />
                <p className="mt-4">
                  Violation of these prohibitions may result in immediate account suspension or termination,
                  and, where applicable, referral to appropriate authorities.
                </p>
              </div>
            </SectionCard>

            {/* 8. Intellectual Property */}
            <SectionCard id="ip">
              <SectionHeading icon={Shield} title="8. Intellectual Property Rights" color="bg-purple-50 text-purple-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  All content and materials available on the Platform, including but not limited to text,
                  graphics, logos, icons, images, audio clips, software, and the overall design and structure
                  ("CSA Content"), are owned by or licensed to the St. Thomas Aquinas CSA and are protected
                  by applicable intellectual property laws.
                </p>
                <p>
                  <strong className="text-slate-800">Fair Use:</strong> Limited use of CSA Content is permitted for:
                </p>
                <BulletList items={[
                  { title: "Personal Reference", desc: "Downloading or printing content for personal, non-commercial use." },
                  { title: "Educational Purposes", desc: "Using excerpts for teaching, research, or religious education within the parish." },
                  { title: "Attribution", desc: "Sharing links to Platform pages with proper attribution to St. Thomas Aquinas CSA." },
                ]} borderColor="border-purple-100" />
                <p className="mt-4">
                  Any use beyond the above, including reproduction, distribution, modification, or commercial
                  exploitation of CSA Content, requires prior written consent from the CSA executive committee.
                </p>
              </div>
            </SectionCard>

            {/* 9. Disclaimers & Liability */}
            <SectionCard id="disclaimers">
              <SectionHeading icon={HelpCircle} title="9. Disclaimers & Limitation of Liability" color="bg-slate-50 text-slate-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  The Platform and all content, services, and features are provided on an <strong>"as is"</strong> and
                  <strong>"as available"</strong> basis. The St. Thomas Aquinas CSA makes no representations or
                  warranties of any kind, express or implied, regarding:
                </p>
                <BulletList items={[
                  { title: "Availability", desc: "Uninterrupted, timely, secure, or error-free operation of the Platform." },
                  { title: "Accuracy", desc: "That liturgical schedules, event listings, or member directories are always complete or current. Official parish communications should be verified with the parish office." },
                  { title: "Reliability", desc: "That results obtained from using the Platform will meet your expectations or requirements." },
                ]} borderColor="border-slate-100" />
                <p className="mt-4">
                  To the fullest extent permitted by law, the CSA, its executive members, officials, volunteers,
                  and affiliates shall not be liable for any direct, indirect, incidental, special, consequential,
                  or punitive damages arising from your use of or inability to use the Platform.
                </p>
              </div>
            </SectionCard>

            {/* 10. Indemnification */}
            <SectionCard id="indemnification">
              <SectionHeading icon={Gavel} title="10. Indemnification" color="bg-orange-50 text-orange-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  You agree to defend, indemnify, and hold harmless the St. Thomas Aquinas CSA, its executive
                  committee members, officials, employees, volunteers, and affiliates from and against any
                  claims, liabilities, damages, losses, costs, or expenses (including reasonable legal fees)
                  arising out of or related to:
                </p>
                <BulletList items={[
                  { title: "Your Use", desc: "Your use of or access to the Platform in violation of these Terms." },
                  { title: "Your Content", desc: "Any content you submit, post, or transmit through the Platform." },
                  { title: "Your Conduct", desc: "Your violation of any third-party right, including privacy or intellectual property rights." },
                  { title: "Compliance", desc: "Your failure to comply with applicable laws or regulations." },
                ]} borderColor="border-orange-100" />
              </div>
            </SectionCard>

            {/* 11. Changes to Terms */}
            <SectionCard id="changes">
              <SectionHeading icon={HeartHandshake} title="11. Changes to These Terms" color="bg-teal-50 text-teal-600" />
              <div className="text-slate-600 space-y-4 text-sm sm:text-base leading-relaxed font-medium">
                <p>
                  We reserve the right to modify, update, or replace these Terms at any time. Material changes
                  will be communicated through the Platform, including via announcements on the dashboard or
                  email notification to registered members.
                </p>
                <p>
                  Your continued use of the Platform after any changes take effect constitutes your acceptance
                  of the revised Terms. If you do not agree with the changes, you must discontinue use of the
                  Platform and may request account deletion through the CSA secretariat.
                </p>
                <p className="text-xs text-slate-400 mt-4">
                  Governing Law: These Terms shall be governed by and construed in accordance with the laws
                  of the Republic of Kenya. Any disputes arising under these Terms shall be subject to the
                  exclusive jurisdiction of the courts of Kenya.
                </p>
              </div>
            </SectionCard>

            {/* 12. Contact */}
            <SectionCard id="contact">
              <SectionHeading icon={Mail} title="12. Contact Information" color="bg-indigo-50 text-indigo-600" />
              <p className="text-slate-600 mb-6 text-sm sm:text-base font-medium">
                If you have any questions, concerns, or requests regarding these Terms, please contact the
                CSA executive committee through any of the following channels:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Mail, label: "Email", value: "morrismaina077@gmail.com", color: "text-indigo-600" },
                  { icon: Mail, label: "Chairperson", value: "morrismaina077", color: "text-indigo-600" },
                  { icon: Mail, label: "Secretary", value: "secretary@kirinyaga.com", color: "text-indigo-600" },
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

            {/* Navigate to Privacy */}
            <div className="flex justify-center pt-4">
              <Link
                to="/privacy"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-indigo-100 text-indigo-700 rounded-2xl font-black text-sm hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-300 shadow-sm hover:shadow-md group"
              >
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                View Privacy Policy
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
