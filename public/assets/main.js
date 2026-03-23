const servicesList = document.getElementById('services-list');
const portfolioList = document.getElementById('portfolio-list');
const portfolioMeta = document.getElementById('portfolio-meta');
const portfolioFilters = document.getElementById('portfolio-filters');
const voicesList = document.getElementById('voices-list');
const testimonialList = document.getElementById('testimonial-list');
const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');

const API_BASE = 'https://personal-portfolio-api.onrender.com';

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

const defaultServices = [
  { name: 'Custom Web Application Development', description: 'Business web platforms built with modern frontend and backend architecture.' },
  { name: 'Backend API Engineering', description: 'Secure and scalable APIs with authentication, validation, and integration support.' },
  { name: 'Database Design and Optimization', description: 'Data modeling, indexing, query optimization, and migration strategies.' },
  { name: 'Software Architecture Consulting', description: 'Technical planning and architecture decisions for maintainable systems.' },
  { name: 'Enterprise Dashboard Development', description: 'Operational dashboards with analytics, reporting, and role-based access.' },
  { name: 'Cloud Deployment and CI/CD', description: 'Deployment pipelines, release automation, and environment management.' },
  { name: 'Legacy System Modernization', description: 'Refactoring and migration of old systems to current secure stacks.' },
  { name: 'Performance Engineering', description: 'Frontend and backend speed improvements with measurable performance gains.' },
  { name: 'Security Hardening', description: 'Secure coding patterns, vulnerability reduction, and access control improvements.' },
  { name: 'Microservice and Integration Work', description: 'Service decomposition, messaging workflows, and cross-platform integrations.' },
  { name: 'Automation and Workflow Tools', description: 'Custom internal tools to reduce manual operations and errors.' },
  { name: 'Maintenance and Technical Support', description: 'Ongoing monitoring, bug fixes, updates, and quality improvements.' }
];

const defaultPortfolio = [
  {
    title: 'Operations Management Platform',
    category: 'Enterprise Systems',
    summary: 'End-to-end operations platform with approval workflows, role permissions, and reporting.',
    image_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
    project_url: '#'
  },
  {
    title: 'Clinic Appointment and Billing System',
    category: 'Health Tech',
    summary: 'Appointment scheduling, patient history management, invoicing, and SMS reminders.',
    image_url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    project_url: '#'
  },
  {
    title: 'School Results and Fees Portal',
    category: 'Education',
    summary: 'Secure student portal for results, payments, attendance, and parent updates.',
    image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    project_url: '#'
  },
  {
    title: 'Logistics Tracking Dashboard',
    category: 'Logistics',
    summary: 'Live dispatch monitoring, delivery status updates, and KPI analytics for operations teams.',
    image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    project_url: '#'
  },
  {
    title: 'Restaurant Ordering and POS Suite',
    category: 'Hospitality',
    summary: 'Ordering, table management, kitchen queues, and integrated payment processing.',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
    project_url: '#'
  },
  {
    title: 'Recruitment and Applicant Workflow System',
    category: 'HR Tech',
    summary: 'Candidate pipeline tracking, interview scheduling, and document management.',
    image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    project_url: '#'
  }
];

const defaultTestimonials = [
  { client_name: 'Jane Mwangi', company: 'Kirinyaga Ventures', quote: 'Josphat delivered a clean and stable platform that improved our internal workflow immediately.', rating: 5 },
  { client_name: 'David Kariuki', company: 'TechBridge KE', quote: 'Strong engineering thinking, excellent communication, and very dependable delivery.', rating: 5 },
  { client_name: 'Mercy Wanjiku', company: 'MediCore', quote: 'The project moved from idea to launch smoothly, with clear milestones and quality output.', rating: 5 },
  { client_name: 'Samuel Njoroge', company: 'RouteLine Logistics', quote: 'We now have full visibility into logistics operations thanks to the system he built.', rating: 5 },
  { client_name: 'Beatrice Muthoni', company: 'EduCore Systems', quote: 'Our school portal became faster and easier to manage after the redesign and backend cleanup.', rating: 5 },
  { client_name: 'Peter Ochieng', company: 'Nexa Retail', quote: 'He translated our business process into a practical software workflow that the team adopted quickly.', rating: 5 }
];

let allPortfolio = [];
let currentCategory = 'All';

function safe(value, fallback = '') {
  return value == null ? fallback : String(value);
}

function buildStars(rating) {
  return '*****'.slice(0, Number(rating || 5));
}

function normalizePhone(phone) {
  return safe(phone).replace(/[^\d+]/g, '');
}

function normalizeWhatsapp(phone) {
  return normalizePhone(phone).replace(/^\+/, '');
}

function renderServices(services) {
  if (!services.length) {
    servicesList.innerHTML = '<article class="item"><h3>No Active Services</h3><p>Admin has not published services yet.</p></article>';
    return;
  }

  servicesList.innerHTML = services
    .map((service) => `
      <article class="item">
        <h3>${safe(service.name)}</h3>
        <p>${safe(service.description)}</p>
      </article>
    `)
    .join('');
}

function renderVoices(testimonials) {
  const topVoices = testimonials.slice(0, 3);
  if (!topVoices.length) {
    voicesList.innerHTML = '<article class="item voice-item"><h3>No Client Voices Yet</h3><p>Admin has not published client voices yet.</p></article>';
    return;
  }

  voicesList.innerHTML = topVoices
    .map((item) => `
      <article class="item voice-item">
        <h3>${safe(item.client_name)}</h3>
        <p>${safe(item.quote)}</p>
        <p class="rating">${buildStars(item.rating)} | ${safe(item.company)}</p>
      </article>
    `)
    .join('');
}

function renderTestimonials(testimonials) {
  if (!testimonials.length) {
    testimonialList.innerHTML = '<article class="item"><h3>No Testimonials</h3><p>Admin has not published testimonials yet.</p></article>';
    return;
  }

  testimonialList.innerHTML = testimonials
    .map((item) => `
      <blockquote class="item">
        <p>"${safe(item.quote)}"</p>
        <footer>
          <strong>${safe(item.client_name)}</strong>
          <p>${safe(item.company)}</p>
          <p class="rating">${buildStars(item.rating)}</p>
        </footer>
      </blockquote>
    `)
    .join('');
}

function renderPortfolioFilters(items) {
  const categories = ['All', ...new Set(items.map((item) => safe(item.category, 'General')))].filter(Boolean);
  portfolioFilters.innerHTML = categories
    .map(
      (category) => `<button class="chip ${category === currentCategory ? 'active' : ''}" data-category="${category}">${category}</button>`
    )
    .join('');

  portfolioFilters.querySelectorAll('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      currentCategory = button.getAttribute('data-category') || 'All';
      renderPortfolioItems();
      renderPortfolioFilters(allPortfolio);
    });
  });
}

function renderPortfolioItems() {
  const visibleItems =
    currentCategory === 'All'
      ? allPortfolio
      : allPortfolio.filter((item) => safe(item.category, 'General') === currentCategory);

  portfolioMeta.textContent = `${visibleItems.length} project(s) shown out of ${allPortfolio.length} total`;

  if (!visibleItems.length) {
    portfolioList.innerHTML = '<article class="item"><h3>No Portfolio Items</h3><p>There are no active items in this category right now.</p></article>';
    return;
  }

  portfolioList.innerHTML = visibleItems
    .map(
      (item) => `
      <article class="item">
        <img src="${safe(item.image_url)}" alt="${safe(item.title)}" />
        <h3>${safe(item.title)}</h3>
        <p><strong>${safe(item.category, 'General')}</strong></p>
        <p>${safe(item.summary)}</p>
        <a href="${safe(item.project_url, '#')}" target="_blank" rel="noreferrer">Open project</a>
      </article>
    `
    )
    .join('');
}

function applySettings(settings) {
  const email = safe(settings.contact_email, 'omondijosephat24@gmail.com');
  const phoneRaw = safe(settings.contact_phone, '+254797670230');
  const whatsappRaw = safe(settings.contact_whatsapp, phoneRaw);
  const office = safe(settings.office_location, 'Kutus, Kirinyaga County, Kenya');
  const tagline = safe(
    settings.footer_tagline,
    'Professional software engineering services with practical delivery, transparent communication, and long-term support.'
  );

  const phoneHref = `tel:${normalizePhone(phoneRaw)}`;
  const whatsappHref = `https://wa.me/${normalizeWhatsapp(whatsappRaw)}`;

  const emailNodes = ['contact-email-link', 'footer-email-link'];
  const phoneNodes = ['contact-phone-link', 'footer-phone-link'];
  const whatsappNodes = ['contact-whatsapp-link', 'footer-whatsapp-link'];

  emailNodes.forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.textContent = email;
    node.href = `mailto:${email}`;
  });

  phoneNodes.forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.textContent = phoneRaw;
    node.href = phoneHref;
  });

  whatsappNodes.forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.href = whatsappHref;
  });

  const officeNode = document.getElementById('office-location');
  if (officeNode) officeNode.textContent = office;

  const footerLocation = document.getElementById('footer-location');
  if (footerLocation) footerLocation.textContent = office;

  const footerTagline = document.getElementById('footer-tagline');
  if (footerTagline) footerTagline.textContent = tagline;
}

async function loadContent() {
  let services = [];
  let portfolio = [];
  let testimonials = [];
  let settings = {};

  try {
    const response = await fetch(apiUrl('/api/site/content'));
    const data = await response.json();

    if (response.ok) {
      services = Array.isArray(data.services) ? data.services : [];
      portfolio = Array.isArray(data.portfolio) ? data.portfolio : [];
      testimonials = Array.isArray(data.testimonials) ? data.testimonials : [];
      settings = typeof data.settings === 'object' && data.settings ? data.settings : {};

      const sections = Array.isArray(data.sections) ? data.sections : [];
      const home = sections.find((item) => item.slug === 'home');
      const about = sections.find((item) => item.slug === 'about');

      if (home) {
        document.getElementById('home-title').textContent = safe(home.title, 'Josphat Omondi');
        document.getElementById('home-body').textContent = safe(home.body);
        const cta = document.getElementById('home-cta');
        cta.textContent = safe(home.cta_text, 'Start Your Project');
        cta.href = safe(home.cta_link, '#contact');
      }

      if (about) {
        document.getElementById('about-body').textContent = safe(about.body);
      }
    } else {
      throw new Error(safe(data.error, 'Failed to load site content'));
    }
  } catch (error) {
    services = defaultServices;
    portfolio = defaultPortfolio;
    testimonials = defaultTestimonials;
    settings = {};
    contactStatus.textContent = safe(error.message, 'Using fallback content while database connection is unavailable.');
  }

  applySettings(settings);
  renderServices(services);
  allPortfolio = [...portfolio];
  renderPortfolioFilters(allPortfolio);
  renderPortfolioItems();
  renderVoices(testimonials);
  renderTestimonials(testimonials);
}

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  contactStatus.className = 'status';
  contactStatus.textContent = 'Sending message...';

  const payload = Object.fromEntries(new FormData(contactForm).entries());

  try {
    const response = await fetch(apiUrl('/api/site/contact'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(safe(data.error, 'Unable to send message.'));
    }

    contactStatus.className = 'status success';
    contactStatus.textContent = 'Message sent successfully. Thank you.';
    contactForm.reset();
  } catch (error) {
    contactStatus.className = 'status error';
    contactStatus.textContent = safe(error.message, 'Unable to send message.');
  }
});

loadContent();
