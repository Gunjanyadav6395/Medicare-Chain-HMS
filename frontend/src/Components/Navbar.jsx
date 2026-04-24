import React, { useEffect, useRef, useState } from "react";
import { navbarStyles } from "../assets/dummyStyles";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SignedIn, SignedOut, useClerk, UserButton } from "@clerk/clerk-react";
import { Key, Menu, X } from "lucide-react";
import logo from "../assets/logo.png";

const STORAGE_KEY = "doctorToken_v1";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY));
    } catch {
      return false;
    }
  });

  const location = useLocation();
  const navRef = useRef(null);
  const clerk = useClerk();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setIsDoctorLoggedIn(Boolean(e.newValue));
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Doctors", href: "/doctors" },
    { label: "Services", href: "/services" },
    { label: "Book Appointment", href: "/appointments" },
    { label: "Contact", href: "/contact" },
  ];

  const handleDashboardNavigate = () => {
    setIsOpen(false);

    if (isDoctorLoggedIn) {
      navigate("/doctor/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLoginNavigate = () => {
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <header
      className={`${navbarStyles.header} ${
        showNavbar ? "translate-y-0" : "-translate-y-full"
      } transition-transform duration-300`}
    >
      <nav ref={navRef} className={navbarStyles.navContainer}>
        <div className={navbarStyles.flexContainer}>
          <Link
            to="/"
            className={`${navbarStyles.logoContainer} flex items-center gap-3`}
          >
            <img src={logo} alt="logo" className={navbarStyles.logoImage} />
            <div className="flex flex-col leading-tight w-40">
              <h1 className="text-green-600 text-lg font-semibold tracking-wide">
                MediCare
              </h1>
              <p className="text-xs text-gray-500 whitespace-nowrap">
                Healthcare Solutions
              </p>
            </div>
          </Link>

          <div className={navbarStyles.centerNavContainer}>
            <div className={navbarStyles.glowEffect}>
              <div className={navbarStyles.centerNavInner}>
                <div
                  className={`${navbarStyles.centerNavScrollContainer} flex items-center gap-8 bg-white/70 backdrop-blur-md px-6 py-2 rounded-full shadow-md border`}
                >
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={`relative px-4 py-1 rounded-full transition-all duration-200 ${
                          isActive
                            ? "bg-green-100 text-green-600 font-medium shadow-sm"
                            : "text-gray-600 hover:text-green-600"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className={navbarStyles.rightContainer}>
            <SignedOut>
              <button
                onClick={handleLoginNavigate}
                className={navbarStyles.loginButton}
              >
                <Key className="w-4 h-4" />
                Login
              </button>
            </SignedOut>

            <SignedIn>
              <button
                onClick={handleDashboardNavigate}
                className="mr-3 text-sm text-gray-600 hover:text-green-600"
              >
                Dashboard
              </button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={navbarStyles.mobileMenuButton}
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className={navbarStyles.mobileMenuContainer}>
            <div className={navbarStyles.mobileMenuInner}>
              {navItems.map((item, idx) => {
                const isActive = location.pathname === item.href;

                return (
                  <Link
                    key={idx}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`${navbarStyles.mobileItemBase} ${
                      isActive
                        ? navbarStyles.mobileItemActive
                        : navbarStyles.mobileItemInactive
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <SignedOut>
                <div className={navbarStyles.mobileAuthContainer}>
                  <button
                    onClick={handleLoginNavigate}
                    className={navbarStyles.mobileLoginButton}
                  >
                    Login
                  </button>
                </div>
              </SignedOut>

              <SignedIn>
                <div className="mt-4 flex flex-col gap-3">
                  <button
                    onClick={handleDashboardNavigate}
                    className={navbarStyles.mobileLoginButton}
                  >
                    Dashboard
                  </button>
                </div>
              </SignedIn>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;