// backend/scripts/seedPapers.js
// Run: node scripts/seedPapers.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const generateSlug = (examName, year, subject, shift) => {
  const base = `${examName}-${year}${subject ? '-' + subject : ''}${shift ? '-' + shift : ''}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
};

const exams = [
  {
    category: "Engineering",
    exams: [
      { name: "JEE Main", years: [2024, 2023, 2022, 2021, 2020], subjects: ["Physics", "Chemistry", "Maths"] },
      { name: "JEE Advanced", years: [2024, 2023, 2022, 2021, 2020], subjects: ["Physics", "Chemistry", "Maths"] },
      { name: "BITSAT", years: [2024, 2023, 2022, 2021], subjects: ["Physics", "Chemistry", "Maths", "English"] },
      { name: "VITEEE", years: [2024, 2023, 2022, 2021], subjects: ["Physics", "Chemistry", "Maths"] },
    ],
  },
  {
    category: "Medical",
    exams: [
      { name: "NEET UG", years: [2024, 2023, 2022, 2021, 2020], subjects: ["Physics", "Chemistry", "Biology"] },
      { name: "NEET PG", years: [2024, 2023, 2022, 2021], subjects: ["General Medicine"] },
      { name: "AIIMS", years: [2023, 2022, 2021, 2020], subjects: ["Physics", "Chemistry", "Biology"] },
      { name: "JIPMER", years: [2023, 2022, 2021], subjects: ["Physics", "Chemistry", "Biology"] },
    ],
  },
  {
    category: "Civil Services",
    exams: [
      { name: "UPSC CSE Prelims", years: [2024, 2023, 2022, 2021, 2020], subjects: ["GS Paper 1", "CSAT"] },
      { name: "UPSC CSE Mains", years: [2024, 2023, 2022, 2021], subjects: ["GS 1", "GS 2", "GS 3", "GS 4", "Essay"] },
      { name: "UPSC CDS", years: [2024, 2023, 2022, 2021], subjects: ["Maths", "English", "GK"] },
      { name: "State PSC", years: [2023, 2022, 2021, 2020], subjects: ["General Studies"] },
    ],
  },
  {
    category: "Banking",
    exams: [
      { name: "SBI PO", years: [2024, 2023, 2022, 2021, 2020], subjects: ["Reasoning", "Quant", "English", "GA"] },
      { name: "IBPS PO", years: [2024, 2023, 2022, 2021], subjects: ["Reasoning", "Quant", "English", "GA"] },
      { name: "RBI Grade B", years: [2024, 2023, 2022, 2021], subjects: ["GA", "English", "Quant", "Finance"] },
      { name: "NABARD", years: [2023, 2022, 2021], subjects: ["Reasoning", "Quant", "English"] },
    ],
  },
  {
    category: "SSC & Railway",
    exams: [
      { name: "SSC CGL", years: [2024, 2023, 2022, 2021, 2020], subjects: ["Reasoning", "Quant", "English", "GK"] },
      { name: "SSC CHSL", years: [2024, 2023, 2022, 2021], subjects: ["Reasoning", "Quant", "English", "GK"] },
      { name: "RRB NTPC", years: [2024, 2023, 2022, 2021], subjects: ["Maths", "Reasoning", "GK"] },
      { name: "RRB Group D", years: [2023, 2022, 2021, 2020], subjects: ["Maths", "Reasoning", "GK", "Science"] },
    ],
  },
  {
    category: "Defence",
    exams: [
      { name: "NDA", years: [2024, 2023, 2022, 2021, 2020], subjects: ["Maths", "GAT"] },
      { name: "CDS", years: [2024, 2023, 2022, 2021], subjects: ["English", "GK", "Maths"] },
      { name: "AFCAT", years: [2024, 2023, 2022, 2021], subjects: ["GK", "Verbal", "Numerical", "Reasoning"] },
      { name: "Agniveer", years: [2024, 2023, 2022], subjects: ["GK", "Maths", "Physics"] },
    ],
  },
  {
    category: "Law",
    exams: [
      { name: "CLAT", years: [2024, 2023, 2022, 2021, 2020], subjects: ["English", "GK", "Legal Reasoning", "Quant"] },
      { name: "AILET", years: [2024, 2023, 2022, 2021], subjects: ["English", "GK", "Reasoning", "Legal Aptitude"] },
      { name: "LSAT India", years: [2024, 2023, 2022], subjects: ["Analytical Reasoning", "Logical Reasoning", "Reading"] },
    ],
  },
  {
    category: "Management",
    exams: [
      { name: "CAT", years: [2024, 2023, 2022, 2021, 2020], subjects: ["VARC", "DILR", "Quant"] },
      { name: "XAT", years: [2024, 2023, 2022, 2021], subjects: ["VALR", "DM", "Quant"] },
      { name: "IIFT", years: [2024, 2023, 2022, 2021], subjects: ["English", "GK", "Quant", "DI", "LR"] },
      { name: "SNAP", years: [2024, 2023, 2022, 2021], subjects: ["English", "Quant", "Reasoning"] },
    ],
  },
];

async function seed() {
  console.log("🌱 Starting paper seed...");

  let total = 0;
  let skipped = 0;

  for (const cat of exams) {
    for (const exam of cat.exams) {
      for (const year of exam.years) {
        for (const subject of exam.subjects) {
          try {
            const slug = generateSlug(exam.name, year, subject, null);

            await prisma.previousYearPaper.create({
              data: {
                slug,
                examName: exam.name,
                examCategory: cat.category,
                subject,
                year,
                shift: null,
                language: "English",
                pdfUrl: "", // Empty - admin will update with real PDF later
                fileSize: null,
                isActive: false, // Hidden until real PDF is uploaded
              },
            });

            total++;
            console.log(`✅ ${exam.name} ${year} - ${subject}`);
          } catch (err) {
            skipped++;
            console.log(`⚠️  Skipped ${exam.name} ${year} - ${subject}: ${err.message}`);
          }
        }
      }
    }
  }

  console.log(`\n✅ Seeded ${total} papers`);
  console.log(`⚠️  Skipped ${skipped} (already exist)`);
  console.log(`\n📝 Note: All papers are set to isActive=false until real PDFs are uploaded.`);
  console.log(`   Go to admin dashboard → Papers → upload PDF for each entry.`);

  await prisma.$disconnect();
}

seed().catch(async (err) => {
  console.error("❌ Seed failed:", err);
  await prisma.$disconnect();
  process.exit(1);
});