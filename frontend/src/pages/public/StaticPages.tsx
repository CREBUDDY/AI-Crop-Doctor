import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";

function StaticPageLayout({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <Button variant="ghost" asChild className="mb-8">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">{title}</h1>
        <div className="prose prose-emerald max-w-none bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <StaticPageLayout title="About Us">
      <p className="text-lg text-gray-600">
        AI Crop Doctor is a premium AgriTech platform dedicated to helping farmers detect crop diseases early, identify pests accurately, and receive verified, localized treatment recommendations using the power of Artificial Intelligence.
      </p>
    </StaticPageLayout>
  );
}

export function ContactPage() {
  return (
    <StaticPageLayout title="Contact Us">
      <p className="text-lg text-gray-600 mb-4">Have questions? We are here to help.</p>
      <div className="space-y-4">
        <p><strong>Email:</strong> support@aicropdoctor.com</p>
        <p><strong>Phone:</strong> +1 (800) 123-4567</p>
      </div>
    </StaticPageLayout>
  );
}

export function FAQPage() {
  return (
    <StaticPageLayout title="Frequently Asked Questions">
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-lg">How accurate is the AI detection?</h3>
          <p className="text-gray-600">Our models are trained on millions of agricultural images and achieve 95%+ accuracy across over 50 supported crops.</p>
        </div>
        <div>
          <h3 className="font-bold text-lg">Are the treatment recommendations verified?</h3>
          <p className="text-gray-600">Yes, all treatments are cross-referenced with verified agricultural databases and ICAR guidelines.</p>
        </div>
      </div>
    </StaticPageLayout>
  );
}

export function PrivacyPolicyPage() {
  return (
    <StaticPageLayout title="Privacy Policy">
      <p className="text-gray-600 mb-4">Last updated: July 2026</p>
      <p className="text-gray-600">
        We respect your privacy and are committed to protecting your personal data. We securely store your farm data and crop images in the cloud and never share them with unauthorized third parties without your explicit consent.
      </p>
    </StaticPageLayout>
  );
}

export function TermsPage() {
  return (
    <StaticPageLayout title="Terms & Conditions">
      <p className="text-gray-600 mb-4">Last updated: July 2026</p>
      <p className="text-gray-600">
        By using the AI Crop Doctor platform, you agree to follow our guidelines. The platform provides AI-driven insights which should be used alongside professional agricultural advice.
      </p>
    </StaticPageLayout>
  );
}

export function SupportPage() {
  return (
    <StaticPageLayout title="Support Center">
      <p className="text-lg text-gray-600 mb-4">How can we assist you today?</p>
      <p className="text-gray-600">
        If you are experiencing technical difficulties, please visit our FAQ page or email us at support@aicropdoctor.com. Our experts are available 24/7.
      </p>
    </StaticPageLayout>
  );
}
