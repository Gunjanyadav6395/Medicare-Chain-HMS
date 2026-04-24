import React from "react";
import { footerStyles } from "../assets/dummyStyles";
import logo from "../assets/logo.png";

import {
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Stethoscope,
  Activity,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Doctors", href: "/doctors" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" },
    { name: "Appointments", href: "/appointments" },
  ];

  const services = [
    { name: "Blood Pressure Check", href: "/services" },
    { name: "Blood Sugar Test", href: "/services" },
    { name: "Full Blood Count", href: "/services" },
    { name: "X-Ray Scan", href: "/services" },
  ];

  const socialLinks = [
    {
      Icon: Facebook,
      color: footerStyles.facebookColor,
      name: "Facebook",
      href: "https://www.facebook.com/people/Hexagon-Digital-Services/61567156598660/",
    },
    {
      Icon: Twitter,
      color: footerStyles.twitterColor,
      name: "Twitter",
      href: "https://www.linkedin.com/company/hexagondigtial-services/",
    },
    {
      Icon: Instagram,
      color: footerStyles.instagramColor,
      name: "Instagram",
      href: "http://instagram.com/hexagondigitalservices",
    },
    {
      Icon: Linkedin,
      color: footerStyles.linkedinColor,
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/hexagondigtial-services/",
    },
    {
      Icon: Youtube,
      color: footerStyles.youtubeColor,
      name: "YouTube",
      href: "https://youtube.com/@hexagondigitalservices",
    },
  ];

  return (
    <footer className={footerStyles.footerContainer}>
      
      {/* Floating Icons */}
      <div className={footerStyles.floatingIcon1}>
        <Stethoscope className={footerStyles.StethoscopeIcon} />
      </div>

      <div
        className={footerStyles.floatingIcon2}
        style={{ animationDelay: "3s" }}
      >
        <Activity className={footerStyles.activityIcon} />
      </div>

      {/* Main Section */}
      <div className={footerStyles.mainContent}>
        <div className={footerStyles.gridContainer}>
          
          {/* Company */}
          <div className={footerStyles.companySection}>
            <div className={footerStyles.logoContainer}>
              <div className={footerStyles.logoImageContainer}>
                <img
                  src={logo}
                  alt="logo"
                  className={footerStyles.logoImage}
                />
              </div>
            </div>

            <h2 className={footerStyles.companyName}>MediCare</h2>
            <p className={footerStyles.companyTagline}>
              HealthCare Solutions
            </p>

            <p className={footerStyles.companyDescription}>
              Your trusted partner in healthcare innovation. We are committed
              to providing exceptional medical care with cutting-edge
              technology and compassionate service.
            </p>

            {/* Contact */}
            <div className={footerStyles.contactContainer}>
              <div className={footerStyles.contactItem}>
                <Phone className={footerStyles.contactIcon} />
                <span>+91 7484394343</span>
              </div>

              <div className={footerStyles.contactItem}>
                <Mail className={footerStyles.contactIcon} />
                <span>hexagonsservices@gmail.com</span>
              </div>

              <div className={footerStyles.contactItem}>
                <MapPin className={footerStyles.contactIcon} />
                <span>Delhi, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className={footerStyles.linksSection}>
            <h3 className={footerStyles.sectionTitle}>Quick Links</h3>
            <ul className={footerStyles.linksList}>
              {quickLinks.map((link, index) => (
                <li key={link.name} className={footerStyles.linkItem}>
                  <a
                    href={link.href}
                    className={footerStyles.quickLink}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <ArrowRight className={footerStyles.quickLinkIcon} />
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className={footerStyles.linksSection}>
            <h3 className={footerStyles.sectionTitle}>Our Services</h3>
            <ul className={footerStyles.linksList}>
              {services.map((service) => (
                <li key={service.name}>
                  <a
                    href={service.href}
                    className={footerStyles.serviceLink}
                  >
                    <span>{service.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className={footerStyles.newsletterSection}>
            <h3 className={footerStyles.newsletterTitle}>
              Stay Connected
            </h3>

            <p className={footerStyles.newsletterDescription}>
              Subscribe for health tips, updates, and wellness insights.
            </p>

            <input
              type="email"
              placeholder="Enter your email"
              className={footerStyles.emailInput}
            />

            <button className={footerStyles.desktopSubscribeButton}>
              <Send className={footerStyles.desktopButtonIcon} />
              Subscribe
            </button>

            {/* Social */}
            <div className={footerStyles.socialContainer}>
              {socialLinks.map(({ Icon, color, name, href }, index) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerStyles.socialLink}
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <Icon
                    className={`${footerStyles.socialIcon} ${color}`}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className={footerStyles.bottomSection}>
        <span>
          © {currentYear} MediCare HealthCare
        </span>

        <a
          href="https://www.hexagondigitalservices.com/"
          target="_blank"
          className={footerStyles.designerLink}
        >
          Designed by Hexagon Digital Services
        </a>
      </div>

      <style>{footerStyles.animationStyles}</style>
    </footer>
  );
};

export default Footer;