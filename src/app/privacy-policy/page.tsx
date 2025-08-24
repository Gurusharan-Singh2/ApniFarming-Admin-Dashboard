// app/terms-and-conditions/page.tsx (Next.js 13+ with App Router)

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "1. Introduction",
    content:
      'Welcome to Apni Farming! By using our web application ("App") or services ("Services"), you agree to be bound by these Terms and Conditions ("Terms"). Please read them carefully.',
  },
  {
    title: "3. Account Registration",
    content:
      "Creating an account may be required to place orders. You are responsible for all activities under your account. Notify us immediately if you suspect unauthorized use.",
  },
  {
    title: "4. Product Information and Availability",
    content:
      "We strive to provide accurate product descriptions and prices. Products like fresh milk and vegetables are subject to availability and seasonal changes. Prices and availability may change without notice.",
  },
  {
    title: "5. Ordering and Payment",
    content:
      "Orders can be placed through the App. We accept cash on delivery with cash and UPI methods. Payment must be completed before processing. Delivery fees and taxes may apply.",
  },
  {
    title: "6. Cancellation, Refunds, and Returns",
    content:
      "Due to perishable nature of products, cancellations and returns are limited. Refunds apply only for damaged or incorrect items after verification.",
  },
  {
    title: "7. Delivery",
    content:
      "Delivery times are estimates. Delivery areas may be limited. Risk transfers to you after delivery.",
  },
  {
    title: "8. User Conduct",
    content: "You agree not to misuse the app or engage in fraudulent activities.",
  },
  {
    title: "9. Intellectual Property",
    content:
      "All app content is owned by Apni Farming and cannot be copied or distributed without permission.",
  },
  {
    title: "10. Privacy",
    content: "Your use is governed by our Privacy Policy.",
  },
  {
    title: "11. Disclaimers and Limitation of Liability",
    content:
      'The App is provided "as is". We are not liable for indirect damages. Fresh products may vary naturally.',
  },
  {
    title: "12. Termination",
    content:
      "We may suspend or terminate your access if you violate these Terms.",
  },
  {
    title: "13. Changes to Terms",
    content:
      "We may update these Terms and notify you. Continued use means acceptance.",
  },
  {
    title: "14. Governing Law and Dispute Resolution",
    content:
      "These Terms are governed by the laws of your jurisdiction. Disputes will be resolved in local courts.",
  },
  {
    title: "15. Contact Us",
    content:
      "For questions, contact us at apnifarmingt20@gmail.com or call +91-6306371889.",
  },
];

export default function TermsAndConditionsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white shadow-sm sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6 text-gray-900" />
        </button>
        <h1 className="ml-4 text-xl font-semibold text-gray-900">
          Terms & Conditions
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {sections.map(({ title, content }, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-2">{title}</h2>
            <p className="text-base leading-7 text-gray-700">{content}</p>
            {index !== sections.length - 1 && (
              <hr className="border-gray-300 mt-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
