import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState([]);

  useEffect(() => {
    const sections = document.querySelectorAll('section');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            setVisibleSections((prev) => [...new Set([...prev, entry.target.id])]);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="app-container">

      <nav className="navbar">
        <h1 className="logo">MyPortfolio</h1>
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <ul className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <li><a href="#hero" className={activeSection === 'hero' ? 'active' : ''}>Home</a></li>
          <li><a href="#about" className={activeSection === 'about' ? 'active' : ''}>About</a></li>
          <li><a href="#projects" className={activeSection === 'projects' ? 'active' : ''}>Projects</a></li>
          <li><a href="#contact" className={activeSection === 'contact' ? 'active' : ''}>Contact</a></li>
        </ul>
      </nav>

    <section id="hero" className={`hero ${visibleSections.includes('hero') ? 'fade-in-up' : 'hidden'}`}>
  <div className="hero-left">
    <h2>Hello, I'm <span>Andrew</span></h2>
    <p>An aspiring web developer</p>
  </div>

  <div className="hero-right">
    <img src="/abitch.jpg" alt="Andrew" />
  </div>
  </section>

      <section id="about" className={`about ${visibleSections.includes('about') ? 'fade-in-up' : 'hidden'}`}>
        <h2>About Me</h2>
        <p>
          I’m a 4th-year IT student who loves creating modern websites with smooth and friendly UI/UX.
          I enjoy exploring free APIs, learning backend stuff, and trying out new technologies.
          I’m always excited to grow, take on challenges, and turn ideas into real projects.
        </p>
      </section>

      <section id="projects" className={`projects ${visibleSections.includes('projects') ? 'fade-in-up' : 'hidden'}`}>

  <h2>Projects</h2>
   <div className="project-grid">
    <div className="project-card">
            <h3> <a href="https://hotelbookingui.onrender.com" target="_blank">Online Hotel Booking System</a></h3>
            <p className="description">A website for booking hotels online. It allows users to search for hotels, view available rooms, and book a room.</p>
            <p className="features">Features: Room booking and an Admin dashboard, etc.</p>
            <p className="tech-title">Technologies used:</p>
            <p className='tech'>  HTML, CSS, JavaScript, Angular, Node.js, Express, MySQL, and Tailwind CSS.</p>
           <div className="slider">
        <div className="image-grid">
    {["/hotel1.jpg", "/hotel2.jpg", "/hotel3.jpg", "/hotel4.jpg"].map(
      (img, i) => (
        <img
        key={i}
        src={img}
        alt={`Hotel ${i + 1}`}
        onClick={() => {
          const dialog = document.getElementById("img-modal");
          dialog.querySelector("img").src = img;
          dialog.showModal();
           }}
          />
          )
          )}
          </div>
          <dialog id="img-modal" className="img-dialog">
            <img src="" alt="Full preview" />
          </dialog>
           </div>
          </div>
          <div className="project-card">
            <h3><a href="https://bcflats.onrender.com" target="blank">Online Dormitory Management System</a></h3>
            <p className="description">A website for managing dormitories. Users can search, view, and book rooms.</p>
            <p className="features">Features: Admin dashboard, tenant dashboard, accounting dashboard, superadmin dashboard, etc.</p>
            <p className="tech-title">Technologies used: </p>
            <p className='tech'> React, Node.js, Express, MySQL, Tailwind CSS.</p>
          </div>
          <div className="project-card">
            <h3>Arduino Projects</h3>
            <p className="description">Using Arduino Uno and ESP32 for sensors like temperature, humidity, water level, and more.</p>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className={`contact ${visibleSections.includes('contact') ? 'fade-in-up' : 'hidden'}`}
      >
        <h2>Contact Me</h2>
    {/*shit not working*/ }
        <p>Email me at: <a href="mailto:mataandrewczar@gmail.com">mataandrewczar@gmail.com</a></p>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} Andrew Mata — All Rights Reserved
      </footer>
    </div>
  );
}

export default App;
