export interface Milestone {
  year: string;
  title: string;
  description: string;
  image: string;
  color: string;
  align: 'left' | 'right';
  stats?: { value: string; label: string };
}

export const journeyData: Milestone[] = [
  {
    year: "1972",
    title: "MCM Trust Founded",
    description: "Justice Mehr Chand Mahajan (3rd Chief Justice of India) Trust was founded to carry forward his legacy of service, starting with charity and welfare initiatives.",
    image: "../assets/journey_1972_founded.png",
    color: "from-amber-500 to-orange-600",
    align: "left",
    stats: { value: "1972", label: "Year Founded" }
  },
  {
    year: "1980s-90s",
    title: "Widows Financial Relief",
    description: "Launched dedicated stipend programs to support poor widows, ensuring dignity and financial relief in rural communities.",
    image: "../assets/journey_widows_aid.png",
    color: "from-red-500 to-pink-600",
    align: "right",
    stats: { value: "100s", label: "Widows Assisted" }
  },
  {
    year: "1990s",
    title: "Medical Camps for the Needy",
    description: "Organized free medical diagnostic and treatment camps across remote regions, bringing critical healthcare directly to poor families.",
    image: "../assets/beauty_bg_1779177289587.png",
    color: "from-blue-500 to-cyan-600",
    align: "left",
    stats: { value: "10+", label: "Rural Camps" }
  },
  {
    year: "2000s",
    title: "Marriage Assistance & Welfare",
    description: "Established financial aid systems to support weddings of girls belonging to poor families, lessening the burden on impoverished households.",
    image: "../assets/stitching_bg_1779177273552.png",
    color: "from-teal-500 to-emerald-600",
    align: "right",
    stats: { value: "50+", label: "Weddings Supported" }
  },
  {
    year: "2007",
    title: "First Computer Centre",
    description: "Stepping into the digital age: established the first basic IT training lab in Dharamshala to teach computer fundamentals to rural youth.",
    image: "../assets/it_bg_1779177308984.png",
    color: "from-indigo-500 to-purple-600",
    align: "left",
    stats: { value: "1st", label: "IT Training Lab" }
  },
  {
    year: "2010s",
    title: "Cow Donation Program",
    description: "Introduced the sustainable livelihood initiative, donating cows to impoverished rural families to provide nutrition and regular income.",
    image: "../assets/tally_bg_1779177332494.png",
    color: "from-yellow-500 to-amber-600",
    align: "right",
    stats: { value: "98+", label: "Cows Donated" }
  },
  {
    year: "2018",
    title: "Partnership with CII",
    description: "Formed a landmark partnership with the Confederation of Indian Industry (CII) to upgrade the training centre to national skill development standards.",
    image: "../assets/logo_original.png",
    color: "from-blue-600 to-indigo-800",
    align: "left",
    stats: { value: "CII", label: "Strategic Alliance" }
  },
  {
    year: "2019",
    title: "HP Government Support",
    description: "The Himachal Pradesh Government provided the old building infrastructure in Khaniara, Dharamshala, establishing a permanent campus.",
    image: "../assets/electrician_bg_1779177350356.png",
    color: "from-orange-500 to-red-600",
    align: "right",
    stats: { value: "Khaniara", label: "Permanent Campus" }
  },
  {
    year: "2020",
    title: "Campus Renovation",
    description: "Major renovation of the skill centre building completed with state-of-the-art labs, classrooms, and workshop spaces supported by H.P. Government.",
    image: "../assets/jcb_convocation.png",
    color: "from-pink-500 to-rose-600",
    align: "left",
    stats: { value: "100%", label: "Lab Upgrade" }
  },
  {
    year: "2021",
    title: "Institute Inauguration",
    description: "The modern CII-MCM Multi-Skill Training Institute was officially inaugurated, offering advanced vocational trades to empower hundreds of students annually.",
    image: "../assets/jcb_bg_1779177368364.png",
    color: "from-green-500 to-emerald-600",
    align: "right",
    stats: { value: "2021", label: "Official Opening" }
  }
];
