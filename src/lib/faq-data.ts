/**
 * Knowledge base for the on-site FAQ chatbot.
 *
 * This is intentionally plain data (no external AI API): each entry has a
 * canonical question, a set of keywords/phrases used to match visitor
 * input, and a written answer sourced from the real site content (About,
 * Programs, Events, Volunteer and Contact pages). Anything that doesn't
 * match well enough falls back to a "chat with us on WhatsApp" prompt —
 * see chatbot.ts.
 */
export interface FaqEntry {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  /** Optional link shown as a button under the answer. */
  link?: { label: string; href: string };
}

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: 'who-are-you',
    question: 'Who is Evergreen Lifecare Support Foundation?',
    keywords: ['who are you', 'what is evergreen', 'about evergreen', 'what do you do', 'who is elsf', 'organisation', 'organization', 'ngo', 'about the foundation', 'what is elsf', 'tell me about', 'who runs this'],
    answer:
      "Evergreen Lifecare Support Foundation (ELSF) is a registered non-profit, non-political humanitarian and development organization based in Birnin Kebbi, Kebbi State, Nigeria. We work to improve the health, wellbeing, and socio-economic resilience of vulnerable individuals and communities across Nigeria — supporting women, children, youth, persons with disabilities, widows, the elderly, and other underserved populations.",
    link: { label: 'Read more About Us', href: '/about.html' },
  },
  {
    id: 'mission-vision',
    question: "What is Evergreen's mission and vision?",
    keywords: ['mission', 'vision', 'purpose', 'goal', 'what do you stand for', 'why does evergreen exist'],
    answer:
      "Our vision is a world where every individual and community thrives in health, dignity, peace, resilience, and prosperity. Our mission is to empower vulnerable populations and strengthen communities through integrated health, humanitarian, education, social protection, peacebuilding, and economic empowerment interventions that create sustainable, inclusive development outcomes.",
    link: { label: 'Read more About Us', href: '/about.html' },
  },
  {
    id: 'core-values',
    question: 'What are Evergreen’s core values?',
    keywords: ['core values', 'values', 'principles', 'what guides you', 'ethics'],
    answer:
      "Five principles guide everything we do: Integrity & Accountability, Compassion & Human Dignity, Equity, Inclusion & Social Justice, Excellence & Innovation, and Collaboration & Sustainability. We stay transparent and accountable to the communities, partners, and donors we work with.",
    link: { label: 'Read more About Us', href: '/about.html' },
  },
  {
    id: 'org-structure',
    question: 'How is Evergreen organised / who runs it?',
    keywords: ['organizational structure', 'organisational structure', 'board of trustees', 'executive director', 'leadership', 'management team', 'staff structure', 'governance', 'who leads evergreen'],
    answer:
      "We're structured from governance down to the community: a Board of Trustees provides strategic oversight, an Executive Director and Deputy Executive Director lead day-to-day operations, and technical departments cover Health & Nutrition, Humanitarian Response, Women/Youth & Livelihoods, Social Inclusion, Research & MERL, Partnerships & Communications, and Finance & Operations. State Coordinators, LGA Coordinators, and Community Volunteers deliver the work on the ground.",
    link: { label: 'Read more About Us', href: '/about.html' },
  },
  {
    id: 'founded-history',
    question: 'When was Evergreen founded? How new is the organisation?',
    keywords: ['founded', 'established', 'when did you start', 'how old is evergreen', 'est 2026', 'history of evergreen', 'when was evergreen created'],
    answer:
      'Evergreen Lifecare Support Foundation was established in 2026 and is headquartered in Birnin Kebbi, Kebbi State, Nigeria. We’re a young, fast-growing organisation focused on practical, community-first programs rather than a long backstory.',
  },
  {
    id: 'programs-overview',
    question: 'What programs does Evergreen run?',
    keywords: ['programs', 'programmes', 'what do you offer', 'services', 'pillars', 'focus areas', 'what can i join', 'what does evergreen do'],
    answer:
      "We run six integrated program pillars: Health & Nutrition (RMNCAH+N), Humanitarian Response & Resilience, Women & Youth Empowerment, Education, Skills & Livelihoods, Social Inclusion & Community Development, and Peacebuilding, Advocacy & Research. Day to day, that shows up as free tech bootcamps, community healthcare clinics, education support, entrepreneurship training, and women's empowerment workshops — all free and open to qualifying Nigerian youth and community members.",
    link: { label: 'See all Programs', href: '/programs.html' },
  },
  {
    id: 'education-program',
    question: 'What does the education program cover?',
    keywords: ['education program', 'education support', 'scholarship', 'after school', 'stem club', 'tutoring', 'school supplies', 'learning resources', 'mentorship for students'],
    answer:
      'Our Education Support & Learning program provides scholarships, school supplies, after-school STEM clubs, and tutoring/mentorship for children and youth — delivered in partnership with local schools.',
    link: { label: 'See Programs', href: '/programs.html' },
  },
  {
    id: 'tech-bootcamp',
    question: 'What is the tech / digital skills bootcamp?',
    keywords: ['tech bootcamp', 'digital skills', 'web development', 'coding', 'kydeei', 'data science', 'data and ai', 'ui/ux', 'design program', 'cybersecurity', 'digital marketing training', 'prompt engineering', 'ai copywriting', 'seo training', 'ethical hacking'],
    answer:
      "Our flagship tech program is KYDEEI Cohort 1 — a free 10-day bootcamp teaching Web Development, Data Science, Graphics & UI/UX Design, Social Media & Digital Marketing, Cybersecurity & Ethical Hacking, Prompt Engineering, SEO, and AI Copywriting. It's open to Nigerian youth aged 16–35, runs 9:00 AM–5:00 PM daily in Birnin Kebbi, and graduates leave with a portfolio and a certificate.",
    link: { label: 'View Events & Register', href: '/events.html' },
  },
  {
    id: 'healthcare-program',
    question: 'What healthcare services does Evergreen provide?',
    keywords: ['healthcare', 'health care', 'clinic', 'medical outreach', 'free clinic', 'maternal health', 'child health', 'health screening', 'mobile clinic', 'rmncah'],
    answer:
      "Our Community Healthcare & Clinics program runs mobile clinics, maternal & child health screenings, and health education in underserved communities to reduce barriers to basic healthcare — with a particular focus on Reproductive, Maternal, Newborn, Child and Adolescent Health and Nutrition (RMNCAH+N), immunization, and disease prevention.",
    link: { label: 'See Programs', href: '/programs.html' },
  },
  {
    id: 'entrepreneurship-program',
    question: 'Do you support small businesses / entrepreneurs?',
    keywords: ['entrepreneurship', 'small business', 'business training', 'micro grant', 'business plan', 'start a business', 'grow my business', 'business mentorship'],
    answer:
      'Our Entrepreneurship & Small Business program offers training, mentorship, and basic finance education for micro-entrepreneurs — covering business planning, market access, and micro-grants & mentorship to help participants start or scale local businesses.',
    link: { label: 'See Programs', href: '/programs.html' },
  },
  {
    id: 'women-empowerment-program',
    question: 'What programs do you have for women?',
    keywords: ['women empowerment', 'women program', 'tailoring', 'crafts training', 'gender program', 'support for women', 'widows', 'livelihood training for women'],
    answer:
      'Our Community & Women Empowerment program offers livelihood training and skills workshops (tailoring, crafts), plus gender-focused programs to help women and other vulnerable groups build sustainable incomes and community leadership.',
    link: { label: 'See Programs', href: '/programs.html' },
  },
  {
    id: 'register-event',
    question: 'How do I apply or register for an event or bootcamp?',
    keywords: ['register', 'apply', 'sign up', 'join bootcamp', 'how to apply', 'registration', 'apply now'],
    answer:
      'Fill out our application form directly on the site — it takes about 3 minutes. Applications are free and open to Nigerian youth aged 16–35.',
    link: { label: 'Apply Now', href: '/apply.html' },
  },
  {
    id: 'apply-process',
    question: 'What happens after I submit an application?',
    keywords: ['after i apply', 'when will i hear back', 'application process', 'how long does it take to hear back', 'application review'],
    answer:
      "Once you submit the application form, you'll get a unique status code — save it. Our team reviews applications and updates your stage (Applied, Under Review, Assessment, Shortlisted, Enrolled) as things progress, which you can check anytime using that code.",
    link: { label: 'Apply Now', href: '/apply.html' },
  },
  {
    id: 'check-status',
    question: 'How do I check my application status?',
    keywords: ['check my status', 'application status', 'my status code', 'check status code', 'am i shortlisted', 'assessment score', 'have i been selected', 'track my application'],
    answer:
      'Use the status code you received after applying — enter it on our Check Your Status page to see your current stage, assessment score if available, and any notes from our team. No account needed.',
    link: { label: 'Check Your Status', href: '/status.html' },
  },
  {
    id: 'upcoming-events',
    question: 'What events are coming up?',
    keywords: ['events', 'upcoming events', 'next event', 'when is the next event', 'calendar', 'schedule'],
    answer:
      'Our next featured event is KYDEEI Cohort 1, starting September 21, 2026 in Birnin Kebbi. We also run smaller community events regularly — healthcare outreach days, education supply distributions, entrepreneurship workshops, and more. Check the Events page for the full, up-to-date list and countdown.',
    link: { label: 'View Events', href: '/events.html' },
  },
  {
    id: 'kydeei-details',
    question: 'When and where is KYDEEI Cohort 1?',
    keywords: ['kydeei date', 'when is kydeei', 'kydeei cohort', 'bootcamp date', 'bootcamp location', 'bootcamp start date', 'how long is the bootcamp', 'bootcamp hours', 'bootcamp time'],
    answer:
      "KYDEEI Cohort 1 starts September 21, 2026 and runs for 10 days in Birnin Kebbi, Kebbi State, from 9:00 AM to 5:00 PM daily. It's completely free, open to Nigerian youth aged 16–35, and graduates leave with a portfolio and certificate.",
    link: { label: 'View Events & Register', href: '/events.html' },
  },
  {
    id: 'donate',
    question: 'How can I donate?',
    keywords: ['donate', 'donation', 'give money', 'contribute', 'sponsor', 'support financially', 'fund', 'how to give', 'bank transfer', 'account number'],
    answer:
      "You can donate directly through the Donate section on our homepage. Choose a preset amount (₦5,000 / ₦10,000 / ₦25,000 / ₦50,000) or enter a custom amount, add your name and email, then hit Donate Now — we'll show you our Jaiz Bank account details to send the transfer to. Every naira goes directly to our programs.",
    link: { label: 'Go to Donate section', href: '/index.html#donate' },
  },
  {
    id: 'donation-amounts',
    question: 'How much should I donate? What are the donation amounts?',
    keywords: ['donation amount', 'how much can i donate', 'minimum donation', 'suggested donation', 'donate custom amount'],
    answer:
      'There’s no minimum — you can give any amount. On the Donate section you’ll see quick options of ₦5,000, ₦10,000, ₦25,000, and ₦50,000, or you can type in a custom amount.',
    link: { label: 'Go to Donate section', href: '/index.html#donate' },
  },
  {
    id: 'donation-transparency',
    question: 'How do I know my donation is used properly?',
    keywords: ['transparency', 'where does my money go', 'how is my donation used', 'accountability', 'trust', 'is this legit', 'scam'],
    answer:
      "We track and report every naira with full accountability. Every donor also gets a private Donor Portal dashboard showing exactly which programs, activities, and communities their contribution supported, updated by our team as funds are deployed.",
    link: { label: 'Donor Portal', href: '/index.html#donor-portal' },
  },
  {
    id: 'donor-portal-login',
    question: 'How do I log into the Donor Portal?',
    keywords: ['donor portal', 'donor login', 'donor dashboard', 'see my donation', 'track my donation', 'my contributions'],
    answer:
      "Scroll to the Donor Portal section on our homepage and log in with the email you used when donating to see an itemised breakdown of exactly which programs and events your contribution funded.",
    link: { label: 'Donor Portal', href: '/index.html#donor-portal' },
  },
  {
    id: 'volunteer',
    question: 'How can I volunteer?',
    keywords: ['volunteer', 'volunteering', 'give my time', 'help out', 'get involved'],
    answer:
      "We'd love to have you. We need Tech Trainers/Facilitators, Health Workers, Content Creators/Photographers, Education Mentors/Tutors, Outreach & Mobilisation help, and Admin/M&E/Research support. Roles range from a few days to a full cohort, and some are fully remote. All volunteers receive a certificate of service.",
    link: { label: 'Apply to Volunteer', href: '/volunteer.html' },
  },
  {
    id: 'volunteer-roles',
    question: 'What volunteer roles are available?',
    keywords: ['volunteer roles', 'open roles', 'volunteer positions', 'tech trainer', 'health worker volunteer', 'content creator volunteer', 'education mentor', 'outreach volunteer'],
    answer:
      "Open roles include: Tech Trainer/Facilitator (10 days per cohort), Health Worker/Medical Professional (1–3 flexible days), Content Creator/Photographer (remote or on-site), Education Mentor/Tutor (flexible schedule), Outreach & Mobilisation (events-based), and Admin, M&E & Research (remote friendly).",
    link: { label: 'See Open Roles', href: '/volunteer.html' },
  },
  {
    id: 'volunteer-process',
    question: 'How does the volunteer application process work?',
    keywords: ['volunteer process', 'how does volunteering work', 'volunteer steps', 'how do i become a volunteer', 'volunteer onboarding'],
    answer:
      "Four simple steps: 1) Fill the volunteer application (under 3 minutes), 2) Our team reviews and matches you to a role based on your skills and schedule, 3) You get an orientation and program brief, 4) You show up and serve — a certificate of service is issued once your commitment is complete. We're usually in touch within 48 hours.",
    link: { label: 'Apply to Volunteer', href: '/volunteer.html' },
  },
  {
    id: 'volunteer-certificate',
    question: 'Do volunteers get a certificate?',
    keywords: ['volunteer certificate', 'certificate of service', 'proof of volunteering', 'volunteer letter'],
    answer:
      'Yes — every volunteer receives an official Evergreen Lifecare certificate of service recognising their contribution and hours served, once their commitment is complete.',
    link: { label: 'Apply to Volunteer', href: '/volunteer.html' },
  },
  {
    id: 'volunteer-remote',
    question: 'Can I volunteer remotely?',
    keywords: ['remote volunteer', 'volunteer online', 'volunteer from home', 'volunteer abroad', 'volunteer outside nigeria', 'diaspora volunteer'],
    answer:
      'Yes — we have remote roles in content creation, research, monitoring & evaluation, and online mentorship. On the Volunteer page, just select "Remote / Online" as your availability when you apply. This is a great fit if you’re in the Nigerian diaspora and want to help from abroad.',
    link: { label: 'Volunteer page', href: '/volunteer.html' },
  },
  {
    id: 'partner',
    question: 'Can my organisation partner with Evergreen?',
    keywords: ['partner', 'partnership', 'sponsor us', 'corporate sponsor', 'collaborate', 'work with you', 'grant funding', 'government partnership'],
    answer:
      'Absolutely — we welcome corporate sponsors, NGO partners, government agencies, and community organisations. Use the contact form on our Contact page to start the conversation, or reach us directly on WhatsApp.',
    link: { label: 'Contact Us', href: '/contact.html' },
  },
  {
    id: 'location',
    question: 'Where are you located? Do you operate outside Kebbi State?',
    keywords: ['location', 'where are you', 'address', 'based', 'kebbi', 'other states', 'expand', 'national', 'do you work in my state', 'lagos', 'abuja'],
    answer:
      "We're based at NO. 10, Fadila Estate Road, Birnin Kebbi, Kebbi State, Nigeria. We're currently based in Kebbi State, but our vision is national — we're actively planning expansion to other states in 2026.",
  },
  {
    id: 'contact-info',
    question: 'How do I contact Evergreen?',
    keywords: ['contact', 'phone number', 'email', 'reach you', 'call you', 'get in touch', 'customer service'],
    answer:
      'Email us at info@evergreenlifecare.org, or call +234 912 979 7010 (alt. lines: +234 703 059 9812, +234 806 550 0334, +234 903 400 8181). You can also message us on WhatsApp any time.',
    link: { label: 'Chat on WhatsApp', href: 'whatsapp' },
  },
  {
    id: 'response-time',
    question: 'How quickly do you respond?',
    keywords: ['response time', 'how long to reply', 'how fast do you respond', 'when will you reply'],
    answer:
      'We typically respond within 24–48 hours on business days. For a faster answer, WhatsApp is usually quickest.',
    link: { label: 'Chat on WhatsApp', href: 'whatsapp' },
  },
  {
    id: 'social-media',
    question: 'Where can I follow you on social media?',
    keywords: ['social media', 'facebook', 'instagram', 'linkedin', 'follow you', 'social handle'],
    answer:
      'You can find us on Facebook, Instagram (@evergreen_lifecare), and LinkedIn (Evergreen Lifecare Foundation) — links are in the footer of every page.',
  },
  {
    id: 'blog',
    question: 'What can I read on the blog?',
    keywords: ['blog', 'articles', 'stories', 'news', 'read more about your work'],
    answer:
      'Our blog covers stories from the field — recent posts include "Why Digital Skills Are the New Literacy for Nigerian Youth," "How Our Healthcare Outreach Reached Thousands of Nigerians," "The Women of Kebbi State Who Are Rewriting Their Own Stories," and more.',
    link: { label: 'Read the Blog', href: '/blog.html' },
  },
  {
    id: 'age-eligibility',
    question: 'What is the age requirement for programs?',
    keywords: ['age', 'how old', 'eligibility', 'age limit', 'age range', 'am i eligible', 'too old', 'too young'],
    answer:
      'Our youth programs, including the tech bootcamp, are open to Nigerian youth aged 16–35. Some community programs (healthcare outreach, education support) serve all ages.',
  },
  {
    id: 'cost',
    question: 'Are your programs free?',
    keywords: ['free', 'cost', 'price', 'how much does it cost', 'fee', 'payment required', 'do i need to pay'],
    answer:
      "Yes, all Evergreen programs are 100% free for qualifying participants — including the tech bootcamp, healthcare outreach, and education support. We're funded by donors and partners so beneficiaries never pay.",
  },
  {
    id: 'eligibility-location',
    question: 'Do I need to live in Kebbi State to join a program?',
    keywords: ['do i need to live in kebbi', 'non resident', 'travel for bootcamp', 'outside kebbi apply', 'can i join if im not from kebbi'],
    answer:
      "Our in-person programs (like the KYDEEI tech bootcamp and healthcare outreach) currently run in Birnin Kebbi, so you'd need to attend in person there. If you're outside Kebbi State, keep an eye on our Events page and social media for programs as we expand nationally, or consider a remote volunteer role instead.",
    link: { label: 'View Events', href: '/events.html' },
  },
  {
    id: 'jobs-careers',
    question: 'Are there paid jobs or career openings at Evergreen?',
    keywords: ['jobs', 'careers', 'employment', 'hiring', 'vacancy', 'job openings', 'work for evergreen', 'paid position'],
    answer:
      "We don't currently list paid job openings on the site — most of our roles are volunteer-based with a certificate of service. If you're interested in a staff or consulting role, reach out through our Contact page and our team can let you know about any current openings.",
    link: { label: 'Contact Us', href: '/contact.html' },
  },
  {
    id: 'media-press',
    question: 'I’m a journalist / I want to feature Evergreen in the media.',
    keywords: ['press', 'media inquiry', 'journalist', 'interview request', 'press release', 'media coverage'],
    answer:
      'We’re glad to work with media and press. Please reach out via the Contact page or email info@evergreenlifecare.org with your request, and our Partnerships & Communications team will follow up.',
    link: { label: 'Contact Us', href: '/contact.html' },
  },
  {
    id: 'in-kind-donations',
    question: 'Can I donate items instead of money?',
    keywords: ['in kind donation', 'donate items', 'donate supplies', 'donate clothes', 'donate books', 'material donation', 'donate equipment'],
    answer:
      "Yes, we do accept in-kind donations (like school supplies, medical supplies, or equipment) for some programs. Since the exact needs change program to program, please reach out via the Contact page or WhatsApp first so our team can confirm what's needed and arrange logistics.",
    link: { label: 'Contact Us', href: '/contact.html' },
  },
  {
    id: 'greeting',
    question: 'Hello',
    keywords: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'evergreen ai', 'are you a bot'],
    answer:
      "Hi there! I'm the Evergreen Lifecare assistant. Ask me about our programs, upcoming events, volunteering, donating, or how to reach us.",
  },
  {
    id: 'thanks',
    question: 'Thank you',
    keywords: ['thanks', 'thank you', 'appreciate it', 'thx', 'nice one', 'ok great'],
    answer: "You're very welcome! Let us know if there's anything else you'd like to know about Evergreen Lifecare.",
  },
];
