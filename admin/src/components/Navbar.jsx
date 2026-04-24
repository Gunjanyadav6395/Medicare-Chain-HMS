import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react'
import { navbarStyles as ns } from '../assets/dummyStyles'
import logoImg from '../assets/logo.png'
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"

import {
  Home,
  UserPlus,
  Users,
  Calendar,
  Grid,
  PlusSquare,
  List,
  Menu,
  X
} from "lucide-react"

import { useAuth, useClerk, useUser } from '@clerk/react'

const Navbar = () => {

  const [open, setOpen] = useState(false)

  const navInnerRef = useRef(null)
  const indicatorRef = useRef(null)

  const location = useLocation()
  const navigate = useNavigate()

  // Clerk
  const clerk = useClerk?.()
  const { getToken, isLoaded: authLoaded } = useAuth()
  const { isSignedIn, isLoaded: userLoaded } = useUser()

  /* ---------------- SLIDING INDICATOR ---------------- */

  const moveIndicator = useCallback(() => {

    const container = navInnerRef.current
    const ind = indicatorRef.current

    if (!container || !ind) return

    const active = container.querySelector(".nav-item.active")

    if (!active) {
      ind.style.opacity = "0"
      return
    }

    const containerRect = container.getBoundingClientRect()
    const activeRect = active.getBoundingClientRect()

    const left = activeRect.left - containerRect.left + container.scrollLeft
    const width = activeRect.width

    ind.style.transform = `translateX(${left}px)`
    ind.style.width = `${width}px`
    ind.style.opacity = "1"

  }, [])

  useLayoutEffect(() => {

    moveIndicator()

    const t = setTimeout(() => {
      moveIndicator()
    }, 120)

    return () => clearTimeout(t)

  }, [location.pathname, moveIndicator])

  /* ---------------- SCROLL LISTENER ---------------- */

  useEffect(() => {

    const container = navInnerRef.current
    if (!container) return

    const onScroll = () => moveIndicator()

    container.addEventListener("scroll", onScroll, { passive: true })

    const ro = new ResizeObserver(() => moveIndicator())

    ro.observe(container)

    if (container.parentElement) ro.observe(container.parentElement)

    window.addEventListener("resize", moveIndicator)

    moveIndicator()

    return () => {

      container.removeEventListener("scroll", onScroll)
      ro.disconnect()
      window.removeEventListener("resize", moveIndicator)

    }

  }, [moveIndicator])

  /* ---------------- ESC KEY CLOSE ---------------- */

  useEffect(() => {

    const onKey = (e) => {
      if (e.key === "Escape" && open) setOpen(false)
    }

    window.addEventListener("keydown", onKey)

    return () => window.removeEventListener("keydown", onKey)

  }, [open])

  /* ---------------- STORE CLERK TOKEN ---------------- */

  useEffect(() => {

    let mounted = true

    const storeToken = async () => {

      if (!authLoaded || !userLoaded) return

      if (!isSignedIn) {
        localStorage.removeItem("clerk_token")
        return
      }

      try {

        if (getToken) {

          const token = await getToken()

          if (!mounted) return

          if (token) {
            localStorage.setItem("clerk_token", token)
          }

        }

      } catch (err) {
        console.warn("Could not retrieve Clerk token", err)
      }

    }

    storeToken()

    return () => { mounted = false }

  }, [isSignedIn, authLoaded, userLoaded, getToken])

  /* ---------------- LOGIN ---------------- */

  const handleOpenSignIn = () => {

    if (!clerk || !clerk.openSignIn) {
      console.warn("Clerk not available")
      return
    }

    clerk.openSignIn()
    navigate("/h")

  }

  /* ---------------- SIGNOUT ---------------- */

  const handleSignOut = async () => {

    if (!clerk || !clerk.signOut) {
      console.warn("Clerk not available")
      return
    }

    try {
      await clerk.signOut()
    } catch (err) {
      console.error("Sign out failed", err)
    }

    localStorage.removeItem("clerk_token")

    navigate("/")

  }

  return (

    <header className={ns.header}>

      <nav className={ns.navContainer}>

        <div className={ns.flexContainer}>

          {/* LOGO */}

          <div className={ns.logoContainer}>

            <img src={logoImg} alt="logo" className={ns.logoImage} />

            <Link to="/">

              <div className={ns.logoLink}>MediCare</div>

              <div>Healthcare Solutions</div>

            </Link>

          </div>


          {/* CENTER NAVIGATION */}

          <div className={ns.centerNavContainer}>

            <div className={ns.glowEffect}>

              <div className={ns.centerNavInner}>

                {/* Sliding Indicator */}
                <div ref={indicatorRef} className={ns.navIndicator}></div>

                <div
                  ref={navInnerRef}
                  tabIndex={0}
                  className={ns.centerNavScrollContainer}
                  style={{ WebkitOverflowScrolling: "touch" }}
                >

                  <CenterNavItem to="/h" label="Dashboard" icon={<Home size={16} />} />
                  <CenterNavItem to="/add" label="Add Doctor" icon={<UserPlus size={16} />} />
                  <CenterNavItem to="/list" label="List Doctors" icon={<Users size={16} />} />
                  <CenterNavItem to="/appointments" label="Appointments" icon={<Calendar size={16} />} />
                  <CenterNavItem to="/service-dashboard" label="Service Dashboard" icon={<Grid size={16} />} />
                  <CenterNavItem to="/add-service" label="Add Service" icon={<PlusSquare size={16} />} />
                  <CenterNavItem to="/list-service" label="List Services" icon={<List size={16} />} />
                  <CenterNavItem to="/service-appointments" label="Service Appointments" icon={<Calendar size={16} />} />

                </div>

              </div>

            </div>

          </div>


          {/* RIGHT SIDE */}

          <div className={ns.rightContainer}>

            {isSignedIn ? (

              <button
                onClick={handleSignOut}
                className={ns.signOutButton + " " + ns.cursorPointer}
              >
                Sign Out
              </button>

            ) : (

              <div className="hidden lg:flex items-center gap-2">

                <button
                  onClick={handleOpenSignIn}
                  className={ns.loginButton + " " + ns.cursorPointer}
                >
                  Login
                </button>

              </div>

            )}

            {/* MOBILE MENU BUTTON */}

            <button
              onClick={() => setOpen(v => !v)}
              className={ns.mobileMenuButton}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>

          </div>

        </div>


        {/* MOBILE NAVIGATION */}

        {open && (
          <div
            className={ns.mobileOverlay}
            onClick={() => setOpen(false)}
          />
        )}

        {open && (

          <div className={ns.mobileMenuContainer} id="mobile-menu">

            <div className={ns.mobileMenuInner}>

              <MobileItem to="/h" label="Dashboard" icon={<Home size={16} />} onClick={() => setOpen(false)} />
              <MobileItem to="/add" label="Add Doctor" icon={<UserPlus size={16} />} onClick={() => setOpen(false)} />
              <MobileItem to="/list" label="List Doctors" icon={<Users size={16} />} onClick={() => setOpen(false)} />
              <MobileItem to="/appointments" label="Appointments" icon={<Calendar size={16} />} onClick={() => setOpen(false)} />
              <MobileItem to="/service-dashboard" label="Service Dashboard" icon={<Grid size={16} />} onClick={() => setOpen(false)} />
              <MobileItem to="/add-service" label="Add Service" icon={<PlusSquare size={16} />} onClick={() => setOpen(false)} />
              <MobileItem to="/list-service" label="List Services" icon={<List size={16} />} onClick={() => setOpen(false)} />
              <MobileItem to="/service-appointments" label="Service Appointments" icon={<Calendar size={16} />} onClick={() => setOpen(false)} />

              <div className={ns.mobileAuthContainer}>

                {isSignedIn ? (

                  <button
                    onClick={() => {
                      handleSignOut()
                      setOpen(false)
                    }}
                    className={ns.mobileSignOutButton}
                  >
                    Sign Out
                  </button>

                ) : (

                  <button
                    onClick={() => {
                      handleOpenSignIn()
                      setOpen(false)
                    }}
                    className={ns.mobileLoginButton + " " + ns.cursorPointer}
                  >
                    Login
                  </button>

                )}

              </div>

            </div>

          </div>

        )}

      </nav>

    </header>

  )

}

export default Navbar


/* ---------- CENTER NAV ITEM ---------- */

function CenterNavItem({ to, icon, label }) {

  return (

    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `nav-item ${isActive ? "active" : ""} ${ns.centerNavItemBase} ${
          isActive ? ns.centerNavItemActive : ns.centerNavItemInactive
        }`
      }
    >

      <span>{icon}</span>

      <span className="font-medium">{label}</span>

    </NavLink>

  )

}


/* ---------- MOBILE NAV ITEM ---------- */

function MobileItem({ to, icon, label, onClick }) {

  return (

    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `${ns.mobileItemBase} ${
          isActive ? ns.mobileItemActive : ns.mobileItemInactive
        }`
      }
    >

      {icon}

      <span className="font-medium text-sm">{label}</span>

    </NavLink>

  )

}