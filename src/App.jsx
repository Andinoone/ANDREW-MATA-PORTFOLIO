import './App.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/* ── Typing effect ── */
function useTypingEffect(words, speed = 100, pause = 1800) {
  const [display, setDisplay] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    const delay = deleting ? speed / 2 : speed;
    const timer = setTimeout(() => {
      if (!deleting) {
        setDisplay(current.slice(0, charIdx + 1));
        if (charIdx + 1 === current.length) setTimeout(() => setDeleting(true), pause);
        else setCharIdx(c => c + 1);
      } else {
        setDisplay(current.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) { setDeleting(false); setWordIdx(w => (w + 1) % words.length); setCharIdx(0); }
        else setCharIdx(c => c - 1);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [charIdx, deleting, wordIdx, words, speed, pause]);

  return display;
}

/* ── InView hook ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ── Animated counter ── */
function Counter({ target, suffix = '', duration = 1800 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView(0.5);

  useEffect(() => {
    if (!inView) return;
    if (target === '∞') { setCount('∞'); return; }
    const num = parseFloat(target);
    const step = num / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= num) { setCount(num % 1 === 0 ? num : num.toFixed(1)); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Floating particles canvas ── */
function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const DOTS = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      DOTS.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,130,246,${d.alpha})`;
        ctx.fill();
      });

      // draw connecting lines
      for (let i = 0; i < DOTS.length; i++) {
        for (let j = i + 1; j < DOTS.length; j++) {
          const dx = DOTS[i].x - DOTS[j].x;
          const dy = DOTS[i].y - DOTS[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(DOTS[i].x, DOTS[i].y);
            ctx.lineTo(DOTS[j].x, DOTS[j].y);
            ctx.strokeStyle = `rgba(99,130,246,${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
  }, []);

  return <canvas ref={canvasRef} className="particles-canvas" aria-hidden="true" />;
}

/* ── Section wrapper ── */
function Section({ id, className, children }) {
  const [ref, inView] = useInView();
  return (
    <section id={id} ref={ref} className={`section ${className ?? ''} ${inView ? 'visible' : ''}`}>
      {children}
    </section>
  );
}

/* ── Skill badge ── */
function Skill({ label, icon }) {
  return (
    <span className="skill-badge">
      {icon && <span className="skill-icon">{icon}</span>}
      {label}
    </span>
  );
}

/* ── Image modal (rendered via portal so it's never clipped) ── */
function ImageModal({ src, onClose }) {
  // close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close image">✕</button>
        <img src={src} alt="Full preview" />
      </div>
    </div>,
    document.body
  );
}

/* ── Project card ── */
function ProjectCard({ title, href, description, features, tech, images, delay = 0 }) {
  const [modalSrc, setModalSrc] = useState(null);
  const [ref, inView] = useInView(0.1);

  return (
    <>
      <div
        ref={ref}
        className={`project-card ${inView ? 'card-visible' : ''}`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div className="card-header">
          <span className="card-dot red" /><span className="card-dot yellow" /><span className="card-dot green" />
        </div>
        <h3 className="card-title">
          {href ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {title} <span className="ext-icon">↗</span>
            </a>
          ) : title}
        </h3>
        <p className="card-desc">{description}</p>
        {features && (
          <p className="card-features"><span className="label">Features:</span> {features}</p>
        )}
        {tech && (
          <div className="card-tech">
            {tech.map(t => <span key={t} className="tech-tag">{t}</span>)}
          </div>
        )}
        {images && images.length > 0 && (
          <div className="card-images">
            {images.map((src, i) => (
              <button
                key={i}
                className="card-img-btn"
                onClick={() => setModalSrc(src)}
                aria-label={`View screenshot ${i + 1}`}
              >
                <img src={src} alt={`Screenshot ${i + 1}`} />
                <span className="img-zoom-icon">🔍</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Portal modal — lives outside the card, never clipped */}
      {modalSrc && <ImageModal src={modalSrc} onClose={() => setModalSrc(null)} />}
    </>
  );
}

/* ── Marquee ticker ── */
const TICKER_ITEMS = [
  '⚛️ React', '▲ Next.js', '🟢 Node.js', '🐈 NestJS', '🔺 Angular', '🗄️ MySQL', '💨 Tailwind CSS',
  '⚡ JavaScript', '🔌 Arduino', '📡 ESP32', '🌿 Git', '🚂 Express.js',
  '🌐 HTML5', '🎨 CSS3', '🔗 REST APIs', '💻 VS Code',
];

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker-wrap" aria-hidden="true">
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i} className="ticker-item">{item}</span>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════ */
export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const typed = useTypingEffect([
    'Full-Stack Developer',
    'UI/UX Enthusiast',
    'Arduino Tinkerer',
  ]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      document.querySelectorAll('section[id]').forEach(sec => {
        const top = sec.getBoundingClientRect().top;
        if (top <= 120 && top > -sec.offsetHeight + 120) setActiveSection(sec.id);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = ['hero', 'about', 'skills', 'projects', 'contact'];
  const navLabels = { hero: 'Home', about: 'About', skills: 'Skills', projects: 'Projects', contact: 'Contact' };

  const handleNavClick = useCallback((id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="app">
      <Particles />

      {/* ── NAVBAR ── */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <span className="nav-logo" onClick={() => handleNavClick('hero')}>
          <span className="logo-bracket">&lt;</span>Andrew<span className="logo-bracket">/&gt;</span>
        </span>
        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(id => (
            <li key={id}>
              <button
                className={`nav-btn ${activeSection === id ? 'active' : ''}`}
                onClick={() => handleNavClick(id)}
              >
                {navLabels[id]}
              </button>
            </li>
          ))}
        </ul>
        <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu" aria-expanded={menuOpen}>
          <span className={`bar ${menuOpen ? 'open' : ''}`} />
          <span className={`bar ${menuOpen ? 'open' : ''}`} />
          <span className={`bar ${menuOpen ? 'open' : ''}`} />
        </button>
      </nav>

      {/* ── HERO ── */}
      <Section id="hero" className="hero">
        <div className="hero-bg-glow" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="badge-star">★</span> BSIT Cum Laude Graduate
            </div>
            <p className="hero-greeting">👋 Hello, I'm</p>
            <h1 className="hero-name">Andrew Mata</h1>
            <h2 className="hero-role">
              <span className="typed">{typed}</span>
              <span className="cursor">|</span>
            </h2>
            <p className="hero-bio">
              A Bachelor of Science in Information Technology graduate, honored with Cum Laude distinction.
              Passionate about building modern, user-friendly web experiences and turning ideas into real products.
            </p>
            <div className="hero-cta">
              <button className="btn-primary" onClick={() => handleNavClick('projects')}>
                View Projects
              </button>
              <button className="btn-outline" onClick={() => handleNavClick('contact')}>
                Contact Me
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-ring">
              <img src="/abitch.jpg" alt="Andrew Mata" />
            </div>
            <div className="image-badge">
              <span>🎓</span> 
            </div>
          </div>
        </div>
        <div className="scroll-hint" onClick={() => handleNavClick('about')}>
          <span />
        </div>
      </Section>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── ABOUT ── */}
      <Section id="about" className="about">
        <div className="section-label">01 — About</div>
        <h2 className="section-title">Who I Am</h2>
        <div className="about-grid">
          <div className="about-text">
            <p>
              I'm a <strong>BSIT Cum Laude graduate</strong> who loves creating modern websites
              with smooth and friendly UI/UX. I enjoy exploring APIs, building full-stack applications,
              and experimenting with new technologies.
            </p>
            <p>
              I'm always excited to grow, take on challenges, and turn ideas into real projects —
              whether that's a full-stack web app or a hardware project with Arduino.
            </p>
            <div className="achievement-card">
              <span className="achievement-icon">🏅</span>
              <div>
                <strong>Cum Laude</strong>
                <span>Bachelor of Science in Information Technology</span>
              </div>
            </div>
          </div>
          <div className="about-stats">
            <div className="stat-card">
              <span className="stat-num"><Counter target="3" suffix="+" /></span>
              <span className="stat-label">Projects Built</span>
            </div>
            <div className="stat-card">
              <span className="stat-num"><Counter target="4" suffix=" yrs" /></span>
              <span className="stat-label">of Study</span>
            </div>
            <div className="stat-card">
              <span className="stat-num"><Counter target="∞" /></span>
              <span className="stat-label">Curiosity</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── SKILLS ── */}
      <Section id="skills" className="skills">
        <div className="section-label">02 — Skills</div>
        <h2 className="section-title">Tech Stack</h2>
        <div className="skills-groups">
          <div className="skill-group">
            <h4>Frontend</h4>
            <div className="skill-list">
              <Skill label="HTML5" icon="🌐" />
              <Skill label="CSS3" icon="🎨" />
              <Skill label="JavaScript" icon="⚡" />
              <Skill label="React" icon="⚛️" />
              <Skill label="Next.js" icon="▲" />
              <Skill label="Angular" icon="🔺" />
              <Skill label="Tailwind CSS" icon="💨" />
            </div>
          </div>
          <div className="skill-group">
            <h4>Backend</h4>
            <div className="skill-list">
              <Skill label="Node.js" icon="🟢" />
              <Skill label="Express.js" icon="🚂" />
              <Skill label="NestJS" icon="🐈" />
              <Skill label="MySQL" icon="🗄️" />
              <Skill label="REST APIs" icon="🔗" />
            </div>
          </div>
          <div className="skill-group">
            <h4>Hardware & Tools</h4>
            <div className="skill-list">
              <Skill label="Arduino" icon="🔌" />
              <Skill label="ESP32" icon="📡" />
              <Skill label="Git" icon="🌿" />
              <Skill label="VS Code" icon="💻" />
            </div>
          </div>
        </div>
      </Section>

      {/* ── PROJECTS ── */}
      <Section id="projects" className="projects">
        <div className="section-label">03 — Projects</div>
        <h2 className="section-title">What I've Built</h2>
        <div className="project-grid">
          <ProjectCard
            delay={0}
            title="Online Hotel Booking System"
            href="https://hotelbookingfront.onrender.com"
            description="A full-stack hotel booking platform where users can search for hotels, view available rooms, and complete reservations online."
            features="Room booking, Admin dashboard, real-time availability"
            tech={['HTML', 'CSS', 'JavaScript', 'Angular', 'Node.js', 'Express', 'MySQL', 'Tailwind CSS']}
            images={['/hotel1.jpg', '/hotel2.jpg', '/hotel3.jpg', '/hotel4.jpg']}
          />
          <ProjectCard
            delay={120}
            title="Online Dormitory Management System"
            href="https://bcflats.onrender.com"
            description="A comprehensive dormitory management platform with multi-role dashboards for tenants, admins, accounting, and superadmins."
            features="Admin, Tenant, Accounting & Superadmin dashboards"
            tech={['React', 'Node.js', 'Express', 'MySQL', 'Tailwind CSS']}
          />
          <ProjectCard
            delay={240}
            title="Arduino & ESP32 Projects"
            description="Hardware projects using Arduino Uno and ESP32 microcontrollers with various sensors — temperature, humidity, water level, and more."
            tech={['Arduino', 'ESP32', 'C++', 'Sensors']}
          />
        </div>
      </Section>

      {/* ── CONTACT ── */}
      <Section id="contact" className="contact">
        <div className="section-label">04 — Contact</div>
        <h2 className="section-title">Get In Touch</h2>
        <p className="contact-sub">
          Have a project in mind or just want to say hi? My inbox is always open.
        </p>
        <div className="contact-cards">
          <a href="mailto:mataandrewczar@gmail.com" className="contact-card">
            <span className="contact-icon">✉️</span>
            <div>
              <span className="contact-card-label">Email</span>
              <span className="contact-card-value">mataandrewczar@gmail.com</span>
            </div>
          </a>
          <a href="https://github.com/Andinoone" target="_blank" rel="noopener noreferrer" className="contact-card">
            <span className="contact-icon">🐙</span>
            <div>
              <span className="contact-card-label">GitHub</span>
              <span className="contact-card-value">github.com/Andinoone</span>
            </div>
          </a>
        </div>
        <a href="mailto:mataandrewczar@gmail.com" className="btn-primary contact-btn">
          Say Hello 👋
        </a>
      </Section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <span>Designed & Built by <strong>Andrew Mata</strong> · BSIT Cum Laude</span>
        <span className="footer-year">© {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
