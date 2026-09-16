import React from 'react';
import { Link } from 'react-router-dom';
import { COMPANY_DETAILS, SUPPORT_EMAIL } from '../data/companyInfo';

function InformationPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#F5F8F8] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-[#00A8AD] mb-3">PrimeXPress Cleaning INC</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#063F4D] mb-8">{title}</h1>
        <div className="space-y-8 text-sm sm:text-base text-slate-600 leading-relaxed">{children}</div>
        <nav aria-label="Company and support pages" className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#063F4D]">
          <Link className="hover:underline" to="/privacy">Privacy</Link>
          <Link className="hover:underline" to="/terms">Terms</Link>
          <Link className="hover:underline" to="/support">Support</Link>
          <Link className="hover:underline" to="/company-info">Company Info</Link>
        </nav>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3"><h2 className="text-lg font-bold text-[#063F4D]">{title}</h2>{children}</section>;
}

function SupportEmail() {
  return <a className="text-[#007E83] font-semibold underline break-all" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>;
}

export function PrivacyPage() {
  return <InformationPage title="Privacy Policy">
    <p>Effective September 17, 2026. This notice explains how PrimeXPress Cleaning INC handles information through this website and how to contact us about your privacy.</p>
    <Section title="Information you provide">
      <p>When you create an account, request a cleaning, contact us or post a review, you may provide your name, email address, phone number, service address, property details, preferred appointment and messages. Reviews you choose to submit may be displayed publicly with your display name, rating and review text. Please do not include private contact details in a review.</p>
    </Section>
    <Section title="How information is used">
      <p>Account details help us verify your email and manage access to your bookings. Booking and contact details help us respond to requests, arrange cleaning services, provide updates and handle support. Technical records may be used to operate the website, investigate errors and prevent misuse.</p>
    </Section>
    <Section title="Service providers and storage">
      <p>We use Supabase for account authentication and booking data, and Vercel to host the website. Email providers process messages needed for account verification and support. These providers may process information outside Manitoba or Canada, where different laws may apply. External images and fonts may send technical request information, such as your IP address, to their providers.</p>
      <p>The website uses browser storage to keep you signed in and maintain temporary guest-booking access. Clearing this storage may sign you out or remove access to a guest booking. Passwords are handled by the authentication service; please never send your password or verification code to support.</p>
    </Section>
    <Section title="Protection and retention">
      <p>Access controls restrict private booking records to authorized users and administrators. No online service can guarantee absolute security. Information should be retained only as needed for services, support, security and applicable legal obligations. Contact us about a particular record or a deletion request; some records may need to be retained where the law requires it.</p>
    </Section>
    <Section title="Your choices and privacy requests">
      <p>You can ask about information held about you, request access or correction, request deletion, or raise a privacy concern by emailing <SupportEmail />. We may need to verify your identity before acting. You can choose not to provide optional information; certain details are necessary to create an account or arrange a service.</p>
      <p>For information about privacy rights in Canada, visit the <a className="text-[#007E83] underline" href="https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/">Office of the Privacy Commissioner of Canada</a>.</p>
    </Section>
    <Section title="Updates"><p>Changes to this notice will be published here with an updated effective date. Contact support if you have questions about a change.</p></Section>
  </InformationPage>;
}

export function TermsPage() {
  return <InformationPage title="Terms of Use">
    <p>Effective September 17, 2026. These terms describe use of the PrimeXPress Cleaning INC website and its account and booking features.</p>
    <Section title="Accounts and verification"><p>Provide accurate account information and keep your password private. New email accounts must verify their email address after sign-up. Once that address is verified, normal sign-in requires only your email and password. A change of email address may require verification of the new address.</p></Section>
    <Section title="Booking requests and services"><p>Submitting a booking or estimate request does not by itself confirm availability or the final scope of work. Review the booking status and confirm service details, pricing and arrangements with our team. Estimates depend on the information supplied and the work agreed. Any additional service-specific terms should be provided when the service is arranged.</p></Section>
    <Section title="Changes, cancellations and concerns"><p>For scheduling changes, cancellation requests or concerns about a service, use the available booking controls or contact <SupportEmail />. Contact us promptly so we can review your request. These website terms do not set a cancellation fee or replace any separately agreed service terms.</p></Section>
    <Section title="Acceptable use"><p>Use the website lawfully. Do not impersonate another person, submit misleading bookings or reviews, attempt to access someone else's information, or interfere with the website. Reviews should reflect your experience and must not contain another person's private information.</p></Section>
    <Section title="Website information and availability"><p>Website information may be updated and features may occasionally be unavailable. Contact the company to clarify service descriptions or booking details. Nothing in these terms limits any rights or remedies that cannot lawfully be excluded under applicable consumer law.</p></Section>
    <Section title="Privacy and contact"><p>Our <Link className="text-[#007E83] underline" to="/privacy">Privacy Policy</Link> explains website information handling. The company is based in Winnipeg, Manitoba, Canada. Questions about these terms can be sent to <SupportEmail />. Company details are available on our <Link className="text-[#007E83] underline" to="/company-info">Company Info page</Link>.</p></Section>
  </InformationPage>;
}

export function SupportPage() {
  return <InformationPage title="Support">
    <Section title="Contact our team"><p>For account help, bookings, privacy requests or service questions, email <SupportEmail />. Include a booking reference if you have one, but never send passwords or verification codes.</p></Section>
    <Section title="Verify once when you sign up"><p>After creating your account, open the confirmation email and follow its verification link. Check your spam or junk folder if it is missing. Complete this step once for your email address.</p></Section>
    <Section title="Sign in again with email and password"><p>After your email is verified, simply enter your email and password on the <Link className="text-[#007E83] underline" to="/signin">Sign In page</Link>. You do not need to verify your email again at each normal sign-in. Changing your email address or recovering access may require a separate verification step.</p></Section>
    <Section title="Need help getting started?"><p>If the confirmation email does not arrive or you cannot access your account, contact the support address above. New customers can use the <Link className="text-[#007E83] underline" to="/signup">Sign Up page</Link>.</p></Section>
  </InformationPage>;
}

export function CompanyInfoPage() {
  return <InformationPage title="Company Info">
    <dl className="divide-y divide-slate-200">
      {COMPANY_DETAILS.map(([label, value]) => <div key={label} className="py-4 first:pt-0 grid sm:grid-cols-2 gap-2"><dt className="font-semibold text-[#063F4D]">{label}</dt><dd>{value}</dd></div>)}
      <div className="py-4 grid sm:grid-cols-2 gap-2"><dt className="font-semibold text-[#063F4D]">Support email</dt><dd><SupportEmail /></dd></div>
    </dl>
  </InformationPage>;
}
