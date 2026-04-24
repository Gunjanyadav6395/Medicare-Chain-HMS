import React from 'react'
import Navbar from '../Components/Navbar';
import Banner from '../Components/Banner';
import Certification from '../Components/Certification';
import HomeDoctors from '../Components/HomeDoctors';
import Testimonial from '../Components/Testimonial';
import Footer from '../Components/Footer';


const Home = () => {
  return (
    <div>
      <Navbar />
      <Banner/>
      <Certification/>
      <HomeDoctors/>
      <Testimonial/>
      <Footer/>
    </div>
  );
};

export default Home;
