// backend/scripts/seedConsultancies.js
// Run: node scripts/seedConsultancies.js

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const consultancies = [
  {
    slug: "leverage-edu-new-delhi",
    name: "Leverage Edu",
    city: "New Delhi",
    state: "Delhi",
    district: "New Delhi",
    location: "A-10, Janakpuri, New Delhi - 110058",
    phone: "+91-9560012611",
    email: "study@leverageedu.com",
    website: "https://leverageedu.com",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&q=80",
    rating: 4.5,
    description: "Leverage Edu is India's largest AI-driven study abroad platform helping students with end-to-end guidance from university selection to visa approval.",
    countries: ["USA", "UK", "Canada", "Australia", "Germany", "Ireland", "New Zealand", "Singapore"],
    services: ["University Shortlisting", "SOP & LOR Writing", "Visa Assistance", "Scholarship Guidance", "IELTS / TOEFL Coaching", "Education Loan Assistance", "Pre-Departure Briefing", "Accommodation Help"],
    topUniversities: ["Harvard University", "University of Toronto", "University of Melbourne", "TU Munich"],
    successRate: "92%",
    avgScholarship: "₹8 Lakhs",
    studentsPlaced: 50000,
  },
  {
    slug: "idp-education-india-mumbai",
    name: "IDP Education India",
    city: "Mumbai",
    state: "Maharashtra",
    district: "Mumbai",
    location: "Level 5, Raheja Centre, Nariman Point, Mumbai - 400021",
    phone: "+91-22-66378000",
    email: "india@idp.com",
    website: "https://www.idp.com/india",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&q=80",
    rating: 4.6,
    description: "IDP Education is a global leader in international student placement with over 50 years of experience, also operating as an official IELTS test centre across India.",
    countries: ["Australia", "UK", "USA", "Canada", "New Zealand", "Ireland"],
    services: ["IELTS Registration & Coaching", "University Admissions", "Course & University Selection", "Visa Application Support", "Scholarship Assistance", "Education Loan Guidance", "Career Counselling"],
    topUniversities: ["University of Sydney", "University of Melbourne", "University of Toronto", "Oxford University"],
    successRate: "95%",
    avgScholarship: "₹6 Lakhs",
    studentsPlaced: 100000,
  },
  {
    slug: "edwise-international-pune",
    name: "Edwise International",
    city: "Pune",
    state: "Maharashtra",
    district: "Pune",
    location: "FC Road, Deccan Gymkhana, Pune - 411004",
    phone: "+91-20-66431000",
    email: "info@edwiseinternational.com",
    website: "https://www.edwiseinternational.com",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
    logo: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=100&q=80",
    rating: 4.3,
    description: "One of India's oldest and most trusted study abroad consultancies with 30+ years of experience placing students in top universities worldwide.",
    countries: ["UK", "USA", "Canada", "Australia", "New Zealand", "Ireland", "Germany", "France"],
    services: ["Free Counselling", "University Admissions", "SOP Writing Assistance", "Visa Filing", "Forex & Travel Insurance", "Education Loan", "Pre-Departure Sessions", "Alumni Network Access"],
    topUniversities: ["University of Manchester", "Monash University", "York University", "Dublin City University"],
    successRate: "90%",
    avgScholarship: "₹5 Lakhs",
    studentsPlaced: 75000,
  },
  {
    slug: "kc-overseas-education-nagpur",
    name: "KC Overseas Education",
    city: "Nagpur",
    state: "Maharashtra",
    district: "Nagpur",
    location: "Plot No. 9, Dharampeth, Nagpur - 440010",
    phone: "+91-712-6643333",
    email: "info@kcoverseas.com",
    website: "https://www.kcoverseas.com",
    image: "https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?w=800&q=80",
    logo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=100&q=80",
    rating: 4.2,
    description: "KC Overseas Education is a leading study abroad consultancy with 25+ years of experience helping students from Tier 2 and Tier 3 cities achieve their global education dreams.",
    countries: ["USA", "UK", "Canada", "Australia", "Germany", "New Zealand", "Malaysia"],
    services: ["Free Profile Evaluation", "Course & University Selection", "Application Processing", "Visa Counselling", "IELTS / PTE Coaching", "Education Loan", "Scholarship Guidance", "Post-Landing Support"],
    topUniversities: ["University of Waterloo", "RMIT University", "University of Hertfordshire"],
    successRate: "88%",
    avgScholarship: "₹4 Lakhs",
    studentsPlaced: 40000,
  },
  {
    slug: "abroad-ninja-bangalore",
    name: "Abroad Ninja",
    city: "Bangalore",
    state: "Karnataka",
    district: "Bangalore Urban",
    location: "Koramangala 5th Block, Bangalore - 560095",
    phone: "+91-8069409999",
    email: "hello@abroadninja.in",
    website: "https://www.abroadninja.in",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&q=80",
    rating: 4.4,
    description: "Abroad Ninja is a Bangalore-based tech-first study abroad startup focusing on MS and MBA aspirants with personalized mentorship from alumni of top global universities.",
    countries: ["USA", "UK", "Canada", "Germany", "Ireland", "Australia"],
    services: ["Profile Building", "University Shortlisting", "SOP & Essay Writing", "Interview Preparation", "Visa Guidance", "Scholarship Hunting", "GRE / GMAT Coaching", "Education Loan"],
    topUniversities: ["Georgia Tech", "University of Texas", "University of Edinburgh", "TU Berlin"],
    successRate: "91%",
    avgScholarship: "₹7 Lakhs",
    studentsPlaced: 15000,
  },
];

async function seed() {
  console.log("🌱 Seeding study abroad consultancies...");
  let created = 0;
  let skipped = 0;

  for (const c of consultancies) {
    try {
      // Check if already exists
      const existing = await prisma.center.findUnique({ where: { slug: c.slug } });
      if (existing) {
        console.log(`⚠️  Skipped (exists): ${c.name}`);
        skipped++;
        continue;
      }

      // Create a dummy institute user for ownership
      const dummyEmail = `admin-${c.slug}@inscovia-seed.com`;
      const hashedPassword = await bcrypt.hash("seed123456", 10);

      let instituteUser = await prisma.instituteUser.findUnique({ where: { email: dummyEmail } });

      if (!instituteUser) {
        instituteUser = await prisma.instituteUser.create({
          data: {
            email: dummyEmail,
            password: hashedPassword,
            instituteName: c.name,
            phone: c.phone || "+910000000000",
            primaryCategory: "STUDY_ABROAD",
            secondaryCategories: [],
            teachingMode: "ONLINE",
            state: c.state,
            district: c.district,
            city: c.city,
            location: c.location,
            isVerified: true,
            isActive: true,
          }
        });
      }

      await prisma.center.create({
        data: {
          slug: c.slug,
          name: c.name,
          primaryCategory: "STUDY_ABROAD",
          secondaryCategories: [],
          teachingMode: "ONLINE",
          state: c.state,
          district: c.district,
          city: c.city,
          location: c.location,
          description: c.description,
          phone: c.phone,
          email: c.email,
          website: c.website,
          image: c.image,
          logo: c.logo,
          rating: c.rating,
          courses: [],
          courseDetails: [],
          gallery: [],
          countries: c.countries,
          services: c.services,
          topUniversities: c.topUniversities,
          successRate: c.successRate,
          avgScholarship: c.avgScholarship,
          studentsPlaced: c.studentsPlaced,
          userId: instituteUser.id,
        }
      });

      console.log(`✅ Created: ${c.name}`);
      created++;
    } catch (err) {
      console.error(`❌ Failed: ${c.name} — ${err.message}`);
    }
  }

  console.log(`\n✅ Created: ${created}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  await prisma.$disconnect();
}

seed().catch(async (err) => {
  console.error("❌ Seed failed:", err);
  await prisma.$disconnect();
  process.exit(1);
});