console.log("APPOINTMENTS PAGE LOADED");
import React from 'react'
import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'
import AppointmentPage from '../Components/AppointmentPage'

const Appointments = () => {
  return (
    <div>
      <Navbar />
      <AppointmentPage />
      <Footer />
    </div>
  )
}

export default Appointments