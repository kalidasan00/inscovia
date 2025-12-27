// backend/prisma/seed-data.js
export const centersData = [
  {
    name: "TechWave IT Training Institute",
    primaryCategory: "TECHNOLOGY",
    secondaryCategories: [],
    teachingMode: "HYBRID",

    // Location
    state: "Karnataka",
    district: "Bengaluru Urban",
    city: "Bangalore",
    location: "MG Road, Near City Center",

    rating: 4.7,
    courses: ["Python Programming", "Full Stack Development", "Data Science with Python", "Machine Learning"],

    // Images
    image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/2721/2721296.png",
    gallery: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop"
    ],

    description: "Industry-oriented IT training with hands-on projects and placement support. We provide comprehensive training programs designed to meet industry standards with experienced faculty and modern infrastructure.",

    // Contact Information
    website: "https://techwave.example.com",
    whatsapp: "9876543210",
    phone: "9876543210",
    email: "contact@techwave.com",

    // Social Media
    facebook: "https://facebook.com/techwave",
    instagram: "https://instagram.com/techwave",
    linkedin: "https://linkedin.com/company/techwave",
  },
  {
    name: "Excel Management Academy",
    primaryCategory: "MANAGEMENT",
    secondaryCategories: ["SKILL_DEVELOPMENT"],
    teachingMode: "OFFLINE",

    // Location
    state: "Maharashtra",
    district: "Mumbai",
    city: "Mumbai",
    location: "Andheri West, Link Road",

    rating: 4.5,
    courses: ["MBA Preparation", "Business Management", "Project Management", "Leadership Skills"],

    // Images
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/1907/1907808.png",
    gallery: [
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop"
    ],

    description: "Premier management training institute offering specialized courses in business management, leadership development, and MBA preparation with industry expert faculty.",

    // Contact Information
    website: "https://excelamc.example.com",
    whatsapp: "9876543211",
    phone: "9876543211",
    email: "info@excelamc.com",

    // Social Media
    facebook: "https://facebook.com/excelamc",
    instagram: "https://instagram.com/excelamc",
    linkedin: "https://linkedin.com/company/excelamc",
  },
  {
    name: "SkillBridge Academy",
    primaryCategory: "SKILL_DEVELOPMENT",
    secondaryCategories: ["TECHNOLOGY"],
    teachingMode: "ONLINE",

    // Location
    state: "Tamil Nadu",
    district: "Chennai",
    city: "Chennai",
    location: "Anna Salai, T Nagar",

    rating: 4.6,
    courses: ["Digital Marketing", "Graphic Design", "Communication Skills", "Content Writing"],

    // Images
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/2554/2554183.png",
    gallery: [
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop"
    ],

    description: "Creative and professional skills development for modern careers. Expert trainers with industry experience providing practical, hands-on training in various skill domains.",

    // Contact Information
    website: "https://skillbridge.example.com",
    whatsapp: "9876543212",
    phone: "9876543212",
    email: "contact@skillbridge.com",

    // Social Media
    facebook: "https://facebook.com/skillbridge",
    instagram: "https://instagram.com/skillbridge",
    linkedin: "https://linkedin.com/company/skillbridge",
  },
  {
    name: "NEET Success Academy",
    primaryCategory: "EXAM_COACHING",
    secondaryCategories: [],
    teachingMode: "OFFLINE",

    // Location
    state: "Delhi",
    district: "Central Delhi",
    city: "New Delhi",
    location: "Rajendra Place, Metro Station",

    rating: 4.8,
    courses: ["NEET Preparation", "JEE Mains", "JEE Advanced", "Foundation Course"],

    // Images
    image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/3135/3135692.png",
    gallery: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop"
    ],

    description: "Top-ranked coaching institute for NEET and JEE preparation with experienced faculty, comprehensive study materials, and proven track record of success.",

    // Contact Information
    website: "https://neetsuccessacademy.example.com",
    whatsapp: "9876543213",
    phone: "9876543213",
    email: "info@neetsuccessacademy.com",

    // Social Media
    facebook: "https://facebook.com/neetsuccessacademy",
    instagram: "https://instagram.com/neetsuccessacademy",
    linkedin: null,
  },
  {
    name: "CodeMaster Technologies",
    primaryCategory: "TECHNOLOGY",
    secondaryCategories: ["SKILL_DEVELOPMENT"],
    teachingMode: "HYBRID",

    // Location
    state: "Telangana",
    district: "Hyderabad",
    city: "Hyderabad",
    location: "HITEC City, Madhapur",

    rating: 4.9,
    courses: ["Java Development", "Spring Boot", "Cloud Computing", "AWS Certification"],

    // Images
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/1822/1822899.png",
    gallery: [
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=600&fit=crop"
    ],

    description: "Advanced corporate-style training focused on enterprise development. Real-time project experience with 100% placement assistance and industry partnerships.",

    // Contact Information
    website: "https://codemaster.example.com",
    whatsapp: "9876543214",
    phone: "9876543214",
    email: "admin@codemaster.com",

    // Social Media
    facebook: "https://facebook.com/codemaster",
    instagram: "https://instagram.com/codemaster",
    linkedin: "https://linkedin.com/company/codemaster",
  },
  {
    name: "DataLabs Academy",
    primaryCategory: "TECHNOLOGY",
    secondaryCategories: [],
    teachingMode: "ONLINE",

    // Location
    state: "Delhi",
    district: "South Delhi",
    city: "New Delhi",
    location: "Connaught Place, Central Delhi",

    rating: 4.7,
    courses: ["Machine Learning", "AI Fundamentals", "Big Data Analytics", "Data Engineering"],

    // Images
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/1087/1087840.png",
    gallery: [
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop"
    ],

    description: "Premium online institute offering advanced AI and ML programs. Research-oriented curriculum with industry partnerships and hands-on project work.",

    // Contact Information
    website: "https://datalabs.example.com",
    whatsapp: "9876543215",
    phone: "9876543215",
    email: "hello@datalabs.com",

    // Social Media
    facebook: "https://facebook.com/datalabs",
    instagram: "https://instagram.com/datalabs",
    linkedin: "https://linkedin.com/company/datalabs",
  },
  {
    name: "DesignHive Studio",
    primaryCategory: "SKILL_DEVELOPMENT",
    secondaryCategories: ["TECHNOLOGY"],
    teachingMode: "OFFLINE",

    // Location
    state: "Maharashtra",
    district: "Pune",
    city: "Pune",
    location: "Koregaon Park, Near ABC Mall",

    rating: 4.6,
    courses: ["UI/UX Design", "Adobe Creative Suite", "3D Design", "Illustration"],

    // Images
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/1829/1829580.png",
    gallery: [
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&h=600&fit=crop"
    ],

    description: "Design-focused bootcamps for creative professionals. Build stunning portfolios with real client projects and learn from industry design experts.",

    // Contact Information
    website: "https://designhive.example.com",
    whatsapp: "9876543216",
    phone: "9876543216",
    email: "studio@designhive.com",

    // Social Media
    facebook: "https://facebook.com/designhive",
    instagram: "https://instagram.com/designhive",
    linkedin: "https://linkedin.com/company/designhive",
  },
  {
    name: "UPSC Aspirants Hub",
    primaryCategory: "EXAM_COACHING",
    secondaryCategories: [],
    teachingMode: "HYBRID",

    // Location
    state: "Delhi",
    district: "Central Delhi",
    city: "New Delhi",
    location: "Mukherjee Nagar",

    rating: 4.8,
    courses: ["UPSC Civil Services", "State PSC", "Essay Writing", "Current Affairs"],

    // Images
    image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    gallery: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop"
    ],

    description: "Premier coaching institute for UPSC and state civil services preparation. Experienced faculty with proven results and comprehensive study materials.",

    // Contact Information
    website: "https://upscaspirants.example.com",
    whatsapp: "9876543217",
    phone: "9876543217",
    email: "contact@upscaspirants.com",

    // Social Media
    facebook: "https://facebook.com/upscaspirants",
    instagram: "https://instagram.com/upscaspirants",
    linkedin: null,
  },
  {
    name: "CloudSprint Academy",
    primaryCategory: "TECHNOLOGY",
    secondaryCategories: [],
    teachingMode: "ONLINE",

    // Location
    state: "Karnataka",
    district: "Bengaluru Urban",
    city: "Bangalore",
    location: "Whitefield, ITPL Main Road",

    rating: 4.7,
    courses: ["AWS Solutions Architect", "Azure Fundamentals", "DevOps Engineering", "Kubernetes"],

    // Images
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/1048/1048953.png",
    gallery: [
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
    ],

    description: "Fast-track your cloud career with hands-on labs and certification-focused training. Short, practical DevOps and Cloud courses with job assistance.",

    // Contact Information
    website: "https://cloudsprint.example.com",
    whatsapp: "9876543218",
    phone: "9876543218",
    email: "learn@cloudsprint.com",

    // Social Media
    facebook: "https://facebook.com/cloudsprint",
    instagram: "https://instagram.com/cloudsprint",
    linkedin: "https://linkedin.com/company/cloudsprint",
  },
  {
    name: "LeadershipPro Academy",
    primaryCategory: "MANAGEMENT",
    secondaryCategories: ["SKILL_DEVELOPMENT"],
    teachingMode: "HYBRID",

    // Location
    state: "Maharashtra",
    district: "Mumbai",
    city: "Mumbai",
    location: "Bandra Kurla Complex",

    rating: 4.5,
    courses: ["Executive Leadership", "Team Management", "Strategic Planning", "Corporate Training"],

    // Images
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/1995/1995467.png",
    gallery: [
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop"
    ],

    description: "Executive leadership and management training for professionals. Transform into effective leaders with our comprehensive management programs.",

    // Contact Information
    website: "https://leadershippro.example.com",
    whatsapp: "9876543219",
    phone: "9876543219",
    email: "info@leadershippro.com",

    // Social Media
    facebook: "https://facebook.com/leadershippro",
    instagram: "https://instagram.com/leadershippro",
    linkedin: "https://linkedin.com/company/leadershippro",
  },
  {
    name: "SpeakWell Communication Hub",
    primaryCategory: "SKILL_DEVELOPMENT",
    secondaryCategories: [],
    teachingMode: "OFFLINE",

    // Location
    state: "Kerala",
    district: "Ernakulam",
    city: "Kochi",
    location: "Marine Drive, Near High Court",

    rating: 4.4,
    courses: ["Spoken English", "Interview Skills", "Personality Development", "Public Speaking"],

    // Images
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/1995/1995574.png",
    gallery: [
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop"
    ],

    description: "Communication skills and interview training for freshers and professionals. Build confidence, speak fluently, and ace your interviews.",

    // Contact Information
    website: "https://speakwell.example.com",
    whatsapp: "9876543220",
    phone: "9876543220",
    email: "info@speakwell.com",

    // Social Media
    facebook: "https://facebook.com/speakwell",
    instagram: "https://instagram.com/speakwell",
    linkedin: null,
  },
  {
    name: "Banking Pro Academy",
    primaryCategory: "EXAM_COACHING",
    secondaryCategories: ["SKILL_DEVELOPMENT"],
    teachingMode: "OFFLINE",

    // Location
    state: "Uttar Pradesh",
    district: "Lucknow",
    city: "Lucknow",
    location: "Hazratganj, City Center",

    rating: 4.6,
    courses: ["IBPS PO", "SBI Clerk", "RRB", "Bank Exams"],

    // Images
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=400&fit=crop",
    logo: "https://cdn-icons-png.flaticon.com/512/3135/3135706.png",
    gallery: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop"
    ],

    description: "Specialized coaching for banking and SSC exams with experienced faculty and comprehensive study materials. High success rate in all banking exams.",

    // Contact Information
    website: "https://bankingpro.example.com",
    whatsapp: "9876543221",
    phone: "9876543221",
    email: "contact@bankingpro.com",

    // Social Media
    facebook: "https://facebook.com/bankingpro",
    instagram: "https://instagram.com/bankingpro",
    linkedin: "https://linkedin.com/company/bankingpro",
  }
];