// backend/prisma/seed-data.js
export const centersData = [
  {
    name: "TechWave IT Training Institute",
    primaryCategory: "TECHNOLOGY",
    secondaryCategories: [],
    teachingMode: "HYBRID",

    state: "Karnataka",
    district: "Bengaluru Urban",
    city: "Bangalore",
    location: "MG Road, Near City Center",

    rating: 4.7,
    courses: [
      "TECHNOLOGY: Python Programming",
      "TECHNOLOGY: Full Stack Development",
      "TECHNOLOGY: Data Science with Python",
      "TECHNOLOGY: Machine Learning"
    ],

    // ✨ NEW: Course details with fees and duration
    courseDetails: [
      {
        name: "Python Programming",
        category: "TECHNOLOGY",
        fees: 15000,
        duration: "3 months"
      },
      {
        name: "Full Stack Development",
        category: "TECHNOLOGY",
        fees: 35000,
        duration: "6 months"
      },
      {
        name: "Data Science with Python",
        category: "TECHNOLOGY",
        fees: 45000,
        duration: "5 months"
      },
      {
        name: "Machine Learning",
        category: "TECHNOLOGY",
        fees: 40000,
        duration: "4 months"
      }
    ],

    image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/2721/2721296.png",
    gallery: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop"
    ],

    description: "Industry-oriented IT training with hands-on projects and placement support. We provide comprehensive training programs designed to meet industry standards with experienced faculty and modern infrastructure.",

    website: "https://techwave.example.com",
    whatsapp: "9876543210",
    phone: "9876543210",
    email: "contact@techwave.com",

    facebook: "https://facebook.com/techwave",
    instagram: "https://instagram.com/techwave",
    linkedin: "https://linkedin.com/company/techwave",
  },
  {
    name: "Excel Management Academy",
    primaryCategory: "MANAGEMENT",
    secondaryCategories: ["SKILL_DEVELOPMENT"],
    teachingMode: "OFFLINE",

    state: "Maharashtra",
    district: "Mumbai",
    city: "Mumbai",
    location: "Andheri West, Link Road",

    rating: 4.5,
    courses: [
      "MANAGEMENT: MBA Preparation",
      "MANAGEMENT: Business Management",
      "MANAGEMENT: Project Management",
      "SKILL_DEVELOPMENT: Leadership Skills",
      "SKILL_DEVELOPMENT: Team Building"
    ],

    courseDetails: [
      {
        name: "MBA Preparation",
        category: "MANAGEMENT",
        fees: 50000,
        duration: "1 year"
      },
      {
        name: "Business Management",
        category: "MANAGEMENT",
        fees: 30000,
        duration: "6 months"
      },
      {
        name: "Project Management",
        category: "MANAGEMENT",
        fees: 25000,
        duration: "3 months"
      },
      {
        name: "Leadership Skills",
        category: "SKILL_DEVELOPMENT",
        fees: 15000,
        duration: "2 months"
      },
      {
        name: "Team Building",
        category: "SKILL_DEVELOPMENT",
        fees: 12000,
        duration: "1 month"
      }
    ],

    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/1907/1907808.png",
    gallery: [
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop"
    ],

    description: "Premier management training institute offering specialized courses in business management, leadership development, and MBA preparation with industry expert faculty.",

    website: "https://excelamc.example.com",
    whatsapp: "9876543211",
    phone: "9876543211",
    email: "info@excelamc.com",

    facebook: "https://facebook.com/excelamc",
    instagram: "https://instagram.com/excelamc",
    linkedin: "https://linkedin.com/company/excelamc",
  },
  {
    name: "SkillBridge Academy",
    primaryCategory: "SKILL_DEVELOPMENT",
    secondaryCategories: ["TECHNOLOGY"],
    teachingMode: "ONLINE",

    state: "Tamil Nadu",
    district: "Chennai",
    city: "Chennai",
    location: "Anna Salai, T Nagar",

    rating: 4.6,
    courses: [
      "SKILL_DEVELOPMENT: Digital Marketing",
      "SKILL_DEVELOPMENT: Graphic Design",
      "SKILL_DEVELOPMENT: Communication Skills",
      "TECHNOLOGY: Web Development Basics",
      "TECHNOLOGY: WordPress"
    ],

    courseDetails: [
      {
        name: "Digital Marketing",
        category: "SKILL_DEVELOPMENT",
        fees: 20000,
        duration: "3 months"
      },
      {
        name: "Graphic Design",
        category: "SKILL_DEVELOPMENT",
        fees: 25000,
        duration: "4 months"
      },
      {
        name: "Communication Skills",
        category: "SKILL_DEVELOPMENT",
        fees: 8000,
        duration: "2 months"
      },
      {
        name: "Web Development Basics",
        category: "TECHNOLOGY",
        fees: 18000,
        duration: "3 months"
      },
      {
        name: "WordPress",
        category: "TECHNOLOGY",
        fees: 12000,
        duration: "1 month"
      }
    ],

    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/2554/2554183.png",
    gallery: [
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop"
    ],

    description: "Creative and professional skills development for modern careers. Expert trainers with industry experience providing practical, hands-on training in various skill domains.",

    website: "https://skillbridge.example.com",
    whatsapp: "9876543212",
    phone: "9876543212",
    email: "contact@skillbridge.com",

    facebook: "https://facebook.com/skillbridge",
    instagram: "https://instagram.com/skillbridge",
    linkedin: "https://linkedin.com/company/skillbridge",
  },
  {
    name: "NEET Success Academy",
    primaryCategory: "EXAM_COACHING",
    secondaryCategories: [],
    teachingMode: "OFFLINE",

    state: "Delhi",
    district: "Central Delhi",
    city: "New Delhi",
    location: "Rajendra Place, Metro Station",

    rating: 4.8,
    courses: [
      "EXAM_COACHING: NEET Preparation",
      "EXAM_COACHING: JEE Mains",
      "EXAM_COACHING: JEE Advanced",
      "EXAM_COACHING: Foundation Course"
    ],

    courseDetails: [
      {
        name: "NEET Preparation",
        category: "EXAM_COACHING",
        fees: 80000,
        duration: "2 years"
      },
      {
        name: "JEE Mains",
        category: "EXAM_COACHING",
        fees: 75000,
        duration: "2 years"
      },
      {
        name: "JEE Advanced",
        category: "EXAM_COACHING",
        fees: 90000,
        duration: "2 years"
      },
      {
        name: "Foundation Course",
        category: "EXAM_COACHING",
        fees: 40000,
        duration: "1 year"
      }
    ],

    image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/3135/3135692.png",
    gallery: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop"
    ],

    description: "Top-ranked coaching institute for NEET and JEE preparation with experienced faculty, comprehensive study materials, and proven track record of success.",

    website: "https://neetsuccessacademy.example.com",
    whatsapp: "9876543213",
    phone: "9876543213",
    email: "info@neetsuccessacademy.com",

    facebook: "https://facebook.com/neetsuccessacademy",
    instagram: "https://instagram.com/neetsuccessacademy",
    linkedin: null,
  },
  {
    name: "CodeMaster Technologies",
    primaryCategory: "TECHNOLOGY",
    secondaryCategories: ["SKILL_DEVELOPMENT"],
    teachingMode: "HYBRID",

    state: "Telangana",
    district: "Hyderabad",
    city: "Hyderabad",
    location: "HITEC City, Madhapur",

    rating: 4.9,
    courses: [
      "TECHNOLOGY: Java Development",
      "TECHNOLOGY: Spring Boot",
      "TECHNOLOGY: Cloud Computing",
      "TECHNOLOGY: AWS Certification",
      "SKILL_DEVELOPMENT: Problem Solving",
      "SKILL_DEVELOPMENT: Interview Preparation"
    ],

    courseDetails: [
      {
        name: "Java Development",
        category: "TECHNOLOGY",
        fees: 30000,
        duration: "4 months"
      },
      {
        name: "Spring Boot",
        category: "TECHNOLOGY",
        fees: 25000,
        duration: "3 months"
      },
      {
        name: "Cloud Computing",
        category: "TECHNOLOGY",
        fees: 35000,
        duration: "5 months"
      },
      {
        name: "AWS Certification",
        category: "TECHNOLOGY",
        fees: 28000,
        duration: "3 months"
      },
      {
        name: "Problem Solving",
        category: "SKILL_DEVELOPMENT",
        fees: 10000,
        duration: "2 months"
      },
      {
        name: "Interview Preparation",
        category: "SKILL_DEVELOPMENT",
        fees: 8000,
        duration: "1 month"
      }
    ],

    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/1822/1822899.png",
    gallery: [
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop"
    ],

    description: "Advanced corporate-style training focused on enterprise development. Real-time project experience with 100% placement assistance and industry partnerships.",

    website: "https://codemaster.example.com",
    whatsapp: "9876543214",
    phone: "9876543214",
    email: "admin@codemaster.com",

    facebook: "https://facebook.com/codemaster",
    instagram: "https://instagram.com/codemaster",
    linkedin: "https://linkedin.com/company/codemaster",
  },
  {
    name: "DataLabs Academy",
    primaryCategory: "TECHNOLOGY",
    secondaryCategories: [],
    teachingMode: "ONLINE",

    state: "Delhi",
    district: "South Delhi",
    city: "New Delhi",
    location: "Connaught Place, Central Delhi",

    rating: 4.7,
    courses: [
      "TECHNOLOGY: Machine Learning",
      "TECHNOLOGY: AI Fundamentals",
      "TECHNOLOGY: Big Data Analytics",
      "TECHNOLOGY: Data Engineering"
    ],

    courseDetails: [
      {
        name: "Machine Learning",
        category: "TECHNOLOGY",
        fees: 50000,
        duration: "6 months"
      },
      {
        name: "AI Fundamentals",
        category: "TECHNOLOGY",
        fees: 35000,
        duration: "4 months"
      },
      {
        name: "Big Data Analytics",
        category: "TECHNOLOGY",
        fees: 45000,
        duration: "5 months"
      },
      {
        name: "Data Engineering",
        category: "TECHNOLOGY",
        fees: 40000,
        duration: "5 months"
      }
    ],

    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/1087/1087840.png",
    gallery: [
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop"
    ],

    description: "Premium online institute offering advanced AI and ML programs. Research-oriented curriculum with industry partnerships and hands-on project work.",

    website: "https://datalabs.example.com",
    whatsapp: "9876543215",
    phone: "9876543215",
    email: "hello@datalabs.com",

    facebook: "https://facebook.com/datalabs",
    instagram: "https://instagram.com/datalabs",
    linkedin: "https://linkedin.com/company/datalabs",
  },
  {
    name: "DesignHive Studio",
    primaryCategory: "SKILL_DEVELOPMENT",
    secondaryCategories: ["TECHNOLOGY"],
    teachingMode: "OFFLINE",

    state: "Maharashtra",
    district: "Pune",
    city: "Pune",
    location: "Koregaon Park, Near ABC Mall",

    rating: 4.6,
    courses: [
      "SKILL_DEVELOPMENT: UI/UX Design",
      "SKILL_DEVELOPMENT: Adobe Creative Suite",
      "TECHNOLOGY: Figma",
      "TECHNOLOGY: Web Design Basics"
    ],

    courseDetails: [
      {
        name: "UI/UX Design",
        category: "SKILL_DEVELOPMENT",
        fees: 35000,
        duration: "4 months"
      },
      {
        name: "Adobe Creative Suite",
        category: "SKILL_DEVELOPMENT",
        fees: 28000,
        duration: "3 months"
      },
      {
        name: "Figma",
        category: "TECHNOLOGY",
        fees: 15000,
        duration: "2 months"
      },
      {
        name: "Web Design Basics",
        category: "TECHNOLOGY",
        fees: 20000,
        duration: "3 months"
      }
    ],

    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/1829/1829580.png",
    gallery: [
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&h=600&fit=crop"
    ],

    description: "Design-focused bootcamps for creative professionals. Build stunning portfolios with real client projects and learn from industry design experts.",

    website: "https://designhive.example.com",
    whatsapp: "9876543216",
    phone: "9876543216",
    email: "studio@designhive.com",

    facebook: "https://facebook.com/designhive",
    instagram: "https://instagram.com/designhive",
    linkedin: "https://linkedin.com/company/designhive",
  },
  {
    name: "UPSC Aspirants Hub",
    primaryCategory: "EXAM_COACHING",
    secondaryCategories: [],
    teachingMode: "HYBRID",

    state: "Delhi",
    district: "Central Delhi",
    city: "New Delhi",
    location: "Mukherjee Nagar",

    rating: 4.8,
    courses: [
      "EXAM_COACHING: UPSC Civil Services",
      "EXAM_COACHING: State PSC",
      "EXAM_COACHING: Essay Writing",
      "EXAM_COACHING: Current Affairs"
    ],

    courseDetails: [
      {
        name: "UPSC Civil Services",
        category: "EXAM_COACHING",
        fees: 120000,
        duration: "1.5 years"
      },
      {
        name: "State PSC",
        category: "EXAM_COACHING",
        fees: 80000,
        duration: "1 year"
      },
      {
        name: "Essay Writing",
        category: "EXAM_COACHING",
        fees: 15000,
        duration: "3 months"
      },
      {
        name: "Current Affairs",
        category: "EXAM_COACHING",
        fees: 10000,
        duration: "6 months"
      }
    ],

    image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    gallery: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop"
    ],

    description: "Premier coaching institute for UPSC and state civil services preparation. Experienced faculty with proven results and comprehensive study materials.",

    website: "https://upscaspirants.example.com",
    whatsapp: "9876543217",
    phone: "9876543217",
    email: "contact@upscaspirants.com",

    facebook: "https://facebook.com/upscaspirants",
    instagram: "https://instagram.com/upscaspirants",
    linkedin: null,
  },
  {
    name: "CloudSprint Academy",
    primaryCategory: "TECHNOLOGY",
    secondaryCategories: [],
    teachingMode: "ONLINE",

    state: "Karnataka",
    district: "Bengaluru Urban",
    city: "Bangalore",
    location: "Whitefield, ITPL Main Road",

    rating: 4.7,
    courses: [
      "TECHNOLOGY: AWS Solutions Architect",
      "TECHNOLOGY: Azure Fundamentals",
      "TECHNOLOGY: DevOps Engineering",
      "TECHNOLOGY: Kubernetes"
    ],

    courseDetails: [
      {
        name: "AWS Solutions Architect",
        category: "TECHNOLOGY",
        fees: 32000,
        duration: "4 months"
      },
      {
        name: "Azure Fundamentals",
        category: "TECHNOLOGY",
        fees: 28000,
        duration: "3 months"
      },
      {
        name: "DevOps Engineering",
        category: "TECHNOLOGY",
        fees: 38000,
        duration: "5 months"
      },
      {
        name: "Kubernetes",
        category: "TECHNOLOGY",
        fees: 25000,
        duration: "2 months"
      }
    ],

    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/1048/1048953.png",
    gallery: [
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
    ],

    description: "Fast-track your cloud career with hands-on labs and certification-focused training. Short, practical DevOps and Cloud courses with job assistance.",

    website: "https://cloudsprint.example.com",
    whatsapp: "9876543218",
    phone: "9876543218",
    email: "learn@cloudsprint.com",

    facebook: "https://facebook.com/cloudsprint",
    instagram: "https://instagram.com/cloudsprint",
    linkedin: "https://linkedin.com/company/cloudsprint",
  },
  {
    name: "LeadershipPro Academy",
    primaryCategory: "MANAGEMENT",
    secondaryCategories: ["SKILL_DEVELOPMENT"],
    teachingMode: "HYBRID",

    state: "Maharashtra",
    district: "Mumbai",
    city: "Mumbai",
    location: "Bandra Kurla Complex",

    rating: 4.5,
    courses: [
      "MANAGEMENT: Executive Leadership",
      "MANAGEMENT: Team Management",
      "MANAGEMENT: Strategic Planning",
      "SKILL_DEVELOPMENT: Corporate Training",
      "SKILL_DEVELOPMENT: Communication"
    ],

    courseDetails: [
      {
        name: "Executive Leadership",
        category: "MANAGEMENT",
        fees: 60000,
        duration: "6 months"
      },
      {
        name: "Team Management",
        category: "MANAGEMENT",
        fees: 35000,
        duration: "3 months"
      },
      {
        name: "Strategic Planning",
        category: "MANAGEMENT",
        fees: 40000,
        duration: "4 months"
      },
      {
        name: "Corporate Training",
        category: "SKILL_DEVELOPMENT",
        fees: 25000,
        duration: "2 months"
      },
      {
        name: "Communication",
        category: "SKILL_DEVELOPMENT",
        fees: 18000,
        duration: "2 months"
      }
    ],

    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/1995/1995467.png",
    gallery: [
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop"
    ],

    description: "Executive leadership and management training for professionals. Transform into effective leaders with our comprehensive management programs.",

    website: "https://leadershippro.example.com",
    whatsapp: "9876543219",
    phone: "9876543219",
    email: "info@leadershippro.com",

    facebook: "https://facebook.com/leadershippro",
    instagram: "https://instagram.com/leadershippro",
    linkedin: "https://linkedin.com/company/leadershippro",
  },
  {
    name: "SpeakWell Communication Hub",
    primaryCategory: "SKILL_DEVELOPMENT",
    secondaryCategories: [],
    teachingMode: "OFFLINE",

    state: "Kerala",
    district: "Ernakulam",
    city: "Kochi",
    location: "Marine Drive, Near High Court",

    rating: 4.4,
    courses: [
      "SKILL_DEVELOPMENT: Spoken English",
      "SKILL_DEVELOPMENT: Interview Skills",
      "SKILL_DEVELOPMENT: Personality Development",
      "SKILL_DEVELOPMENT: Public Speaking"
    ],

    courseDetails: [
      {
        name: "Spoken English",
        category: "SKILL_DEVELOPMENT",
        fees: 12000,
        duration: "3 months"
      },
      {
        name: "Interview Skills",
        category: "SKILL_DEVELOPMENT",
        fees: 8000,
        duration: "1 month"
      },
      {
        name: "Personality Development",
        category: "SKILL_DEVELOPMENT",
        fees: 15000,
        duration: "2 months"
      },
      {
        name: "Public Speaking",
        category: "SKILL_DEVELOPMENT",
        fees: 10000,
        duration: "2 months"
      }
    ],

    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/1995/1995574.png",
    gallery: [
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop"
    ],

    description: "Communication skills and interview training for freshers and professionals. Build confidence, speak fluently, and ace your interviews.",

    website: "https://speakwell.example.com",
    whatsapp: "9876543220",
    phone: "9876543220",
    email: "info@speakwell.com",

    facebook: "https://facebook.com/speakwell",
    instagram: "https://instagram.com/speakwell",
    linkedin: null,
  },
  {
    name: "Banking Pro Academy",
    primaryCategory: "EXAM_COACHING",
    secondaryCategories: ["SKILL_DEVELOPMENT"],
    teachingMode: "OFFLINE",

    state: "Uttar Pradesh",
    district: "Lucknow",
    city: "Lucknow",
    location: "Hazratganj, City Center",

    rating: 4.6,
    courses: [
      "EXAM_COACHING: IBPS PO",
      "EXAM_COACHING: SBI Clerk",
      "EXAM_COACHING: RRB",
      "SKILL_DEVELOPMENT: Quantitative Aptitude",
      "SKILL_DEVELOPMENT: Reasoning"
    ],

    courseDetails: [
      {
        name: "IBPS PO",
        category: "EXAM_COACHING",
        fees: 35000,
        duration: "1 year"
      },
      {
        name: "SBI Clerk",
        category: "EXAM_COACHING",
        fees: 28000,
        duration: "9 months"
      },
      {
        name: "RRB",
        category: "EXAM_COACHING",
        fees: 25000,
        duration: "8 months"
      },
      {
        name: "Quantitative Aptitude",
        category: "SKILL_DEVELOPMENT",
        fees: 8000,
        duration: "3 months"
      },
      {
        name: "Reasoning",
        category: "SKILL_DEVELOPMENT",
        fees: 8000,
        duration: "3 months"
      }
    ],

    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/3135/3135706.png",
    gallery: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop"
    ],

    description: "Specialized coaching for banking and SSC exams with experienced faculty and comprehensive study materials. High success rate in all banking exams.",

    website: "https://bankingpro.example.com",
    whatsapp: "9876543221",
    phone: "9876543221",
    email: "contact@bankingpro.com",

    facebook: "https://facebook.com/bankingpro",
    instagram: "https://instagram.com/bankingpro",
    linkedin: "https://linkedin.com/company/bankingpro",
  }
];