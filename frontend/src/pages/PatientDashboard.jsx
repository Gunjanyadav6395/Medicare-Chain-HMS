import React from "react";
import { Link } from "react-router-dom";
import {
  User,
  CalendarDays,
  FileText,
  ArrowRight,
  ShieldCheck,
  HeartPulse,
  ClipboardList,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const dashboardCards = [
  {
    title: "My Profile",
    description: "View and manage your personal details and health information.",
    to: "/my-profile",
    icon: User,
    bg: "from-emerald-500 to-teal-500",
    lightBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-100",
  },
  {
    title: "My Appointments",
    description: "Track your booked appointments and manage upcoming visits.",
    to: "/my-appointments",
    icon: CalendarDays,
    bg: "from-blue-500 to-cyan-500",
    lightBg: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-100",
  },
  {
    title: "My Reports",
    description: "Access and organize your uploaded medical reports securely.",
    to: "/my-reports",
    icon: FileText,
    bg: "from-purple-500 to-pink-500",
    lightBg: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-100",
  },
];

const quickStats = [
  {
    title: "Secure Access",
    value: "100%",
    subtitle: "Protected patient data",
    icon: ShieldCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Health Tracking",
    value: "24/7",
    subtitle: "Always available records",
    icon: HeartPulse,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    title: "Digital History",
    value: "1 Place",
    subtitle: "Appointments + reports",
    icon: ClipboardList,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
];

const PatientDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-white to-blue-50 opacity-90" />
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 mb-4">
                <ShieldCheck className="h-4 w-4" />
                Patient Dashboard
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
                Welcome to your
                <span className="text-emerald-600"> MediCare </span>
                Dashboard
              </h2>

              <p className="mt-4 text-slate-600 text-base sm:text-lg leading-7">
                Manage your profile, appointments, and medical reports in one
                secure place. This dashboard helps you stay organized and keep
                your healthcare journey simple and accessible.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/my-appointments"
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-white font-semibold shadow-sm transition hover:bg-emerald-700"
                >
                  View Appointments
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/my-reports"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-slate-700 font-semibold transition hover:bg-slate-50"
                >
                  Open Reports
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {quickStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-900">
                      {stat.value}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {stat.subtitle}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg}`}
                  >
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {dashboardCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                to={card.to}
                className={`group relative overflow-hidden rounded-3xl border ${card.borderColor} bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.bg}`}
                />

                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.lightBg}`}
                  >
                    <Icon className={`h-7 w-7 ${card.iconColor}`} />
                  </div>

                  <div className="rounded-full bg-slate-100 p-2 transition group-hover:bg-slate-200">
                    <ArrowRight className="h-4 w-4 text-slate-600" />
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-slate-600 leading-7">
                    {card.description}
                  </p>
                </div>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  Open Section
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom Info Section */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                Why use this dashboard?
              </h3>
              <p className="mt-3 text-slate-600 leading-7">
                This patient dashboard is designed to keep all your important
                healthcare information in one place. You can quickly access your
                appointments, reports, and profile without searching through
                different pages.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Fast Access</p>
                <p className="mt-2 text-sm text-slate-600">
                  Reach your health records and appointments in a few clicks.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Better Tracking</p>
                <p className="mt-2 text-sm text-slate-600">
                  Stay updated with your appointments and uploaded reports.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Secure Records</p>
                <p className="mt-2 text-sm text-slate-600">
                  Your healthcare data stays organized and protected.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Easy Navigation</p>
                <p className="mt-2 text-sm text-slate-600">
                  Clean sections for profile, appointments, and reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PatientDashboard;