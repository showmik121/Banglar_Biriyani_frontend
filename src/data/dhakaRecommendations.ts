export type RecommendationItem = {
  id: string
  name: string
  zone: string
  details: string
  tag?: string
  /** Original English text, so customers on a Latin keyboard can still find the area. */
  latin: string
}

export const DHAKA_RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: "rec_diu_1",
    name: "ড্যাফোডিল স্মার্ট সিটি (ক্যাম্পাস ও হোস্টেল)",
    zone: "ড্যাফোডিল স্মার্ট সিটি (ডিআইইউ)",
    details: "ডিআইইউ ক্যাম্পাস, ছাত্র হোস্টেল ও হল, বিরুলিয়া, সাভার",
    tag: "১৫-২০ মিনিট • ফ্রি ডেলিভারি",
    latin:
      "Daffodil Smart City (Campus & Hostels), Daffodil Smart City (DIU), DIU Campus, Student Hostels & Halls, Birulia, Savar",
  },
  {
    id: "rec_diu_2",
    name: "খাগান শিক্ষার্থী মেস এলাকা",
    zone: "খাগান (সাভার)",
    details: "খাগান মেইন রোড, ড্যাফোডিল মেস ও হোস্টেল, সাভার",
    tag: "১৫-২০ মিনিট • ফ্রি ডেলিভারি",
    latin:
      "Khagan Student Mess Area, Khagan (Savar), Khagan Main Road, Daffodil Messes & Hostels, Savar",
  },
  {
    id: "rec_diu_3",
    name: "বিরুলিয়া বাজার ও আশেপাশে",
    zone: "বিরুলিয়া (সাভার)",
    details: "বিরুলিয়া বাজার, ব্রিজ রোড ও আশেপাশের এলাকা, সাভার",
    tag: "২০-২৫ মিনিট • ফ্রি ডেলিভারি",
    latin:
      "Birulia Bazar & Around, Birulia (Savar), Birulia Bazar, Bridge Road & surrounding area, Savar",
  },
  {
    id: "rec_diu_4",
    name: "আশুলিয়া ও বাইপাইল",
    zone: "আশুলিয়া",
    details: "জিরাবো, বাইপাইল, ফ্যান্টাসি কিংডম এলাকা, আশুলিয়া, সাভার",
    tag: "৩০-৪০ মিনিট • ফ্রি ডেলিভারি",
    latin: "Ashulia & Baipail, Ashulia, Zirabo, Baipail, Fantasy Kingdom Area, Ashulia, Savar",
  },
  {
    id: "rec_diu_5",
    name: "সাভার সিটি সেন্টার ও বাজার",
    zone: "সাভার",
    details: "নবীনগর, সাভার বাজার, সিটি সেন্টার, সাভার",
    tag: "৩৫-৪৫ মিনিট • ফ্রি ডেলিভারি",
    latin: "Savar City Centre & Bazar, Savar, Nabinagar, Savar Bazar, City Centre, Savar",
  },
  {
    id: "rec_1",
    name: "বনানী রোড ১১",
    zone: "বনানী",
    details: "রোড ১১, ব্লক ডি, বনানী, ঢাকা",
    tag: "জনপ্রিয় বিরিয়ানি এলাকা",
    latin: "Banani Road 11, Banani, Road 11, Block D, Banani, Dhaka",
  },
  {
    id: "rec_2",
    name: "বনানী কামাল আতাতুর্ক এভিনিউ",
    zone: "বনানী",
    details: "কামাল আতাতুর্ক এভিনিউ, বনানী, ঢাকা",
    tag: "৩০ মিনিটে দ্রুত ডেলিভারি",
    latin: "Banani Kamal Ataturk Ave, Banani, Kamal Ataturk Avenue, Banani, Dhaka",
  },
  {
    id: "rec_3",
    name: "গুলশান ২ সার্কেল ও এভিনিউ",
    zone: "গুলশান ২",
    details: "গুলশান ২ সার্কেল, গুলশান এভিনিউ, ঢাকা",
    tag: "কূটনৈতিক এলাকা",
    latin: "Gulshan 2 Circle & Avenue, Gulshan 2, Gulshan 2 Circle, Gulshan Avenue, Dhaka",
  },
  {
    id: "rec_4",
    name: "গুলশান ১ সাউথ এভিনিউ",
    zone: "গুলশান ১",
    details: "সাউথ এভিনিউ, গুলশান ১, ঢাকা",
    tag: "৩০ মিনিটে দ্রুত ডেলিভারি",
    latin: "Gulshan 1 South Avenue, Gulshan 1, South Avenue, Gulshan 1, Dhaka",
  },
  {
    id: "rec_5",
    name: "ধানমন্ডি সাতমসজিদ রোড",
    zone: "ধানমন্ডি",
    details: "সাতমসজিদ রোড, ধানমন্ডি ৯/এ, ঢাকা",
    tag: "খাবারপ্রেমীদের প্রিয়",
    latin: "Dhanmondi Satmasjid Road, Dhanmondi, Satmasjid Road, Dhanmondi 9/A, Dhaka",
  },
  {
    id: "rec_6",
    name: "ধানমন্ডি ২৭ (রাপা প্লাজা এলাকা)",
    zone: "ধানমন্ডি",
    details: "রোড ২৭, ধানমন্ডি, ঢাকা",
    tag: "বিরিয়ানির প্রিয় এলাকা",
    latin: "Dhanmondi 27 (Rapa Plaza Area), Dhanmondi, Road 27, Dhanmondi, Dhaka",
  },
  {
    id: "rec_7",
    name: "ধানমন্ডি লেক ও রোড ৩২",
    zone: "ধানমন্ডি",
    details: "রোড ৩২, ধানমন্ডি, ঢাকা",
    tag: "জনপ্রিয় এলাকা",
    latin: "Dhanmondi Lake & Road 32, Dhanmondi, Road 32, Dhanmondi, Dhaka",
  },
  {
    id: "rec_8",
    name: "উত্তরা সেক্টর ৩ (জসীমউদ্দীন)",
    zone: "উত্তরা",
    details: "সেক্টর ৩, জসীমউদ্দীন এভিনিউ, উত্তরা, ঢাকা",
    tag: "মধ্য উত্তরা",
    latin: "Uttara Sector 3 (Jasimuddin), Uttara, Sector 3, Jasimuddin Avenue, Uttara, Dhaka",
  },
  {
    id: "rec_9",
    name: "উত্তরা সেক্টর ১১ ও ১৩",
    zone: "উত্তরা",
    details: "গরিবে নেওয়াজ এভিনিউ, সেক্টর ১১/১৩, উত্তরা, ঢাকা",
    tag: "ফুড স্ট্রিট",
    latin: "Uttara Sector 11 & 13, Uttara, Garib-e-Newaz Avenue, Sector 11/13, Uttara, Dhaka",
  },
  {
    id: "rec_10",
    name: "বসুন্ধরা আ/এ ব্লক সি ও ডি",
    zone: "বসুন্ধরা আ/এ",
    details: "ব্লক সি ও ডি, বসুন্ধরা আ/এ, ঢাকা",
    tag: "বিশ্ববিদ্যালয় এলাকা",
    latin: "Bashundhara R/A Block C & D, Bashundhara R/A, Block C & D, Bashundhara R/A, Dhaka",
  },
  {
    id: "rec_11",
    name: "বসুন্ধরা আ/এ মেইন গেট / কুড়িল",
    zone: "বসুন্ধরা আ/এ",
    details: "কুড়িল বিশ্বরোড / মেইন গেট, বসুন্ধরা আ/এ, ঢাকা",
    tag: "এক্সপ্রেস ডেলিভারি",
    latin:
      "Bashundhara R/A Main Gate / Kuril, Bashundhara R/A, Kuril Bishwa Road / Main Gate, Bashundhara R/A, Dhaka",
  },
  {
    id: "rec_12",
    name: "মিরপুর ১০ গোলচত্বর ও মেট্রো",
    zone: "মিরপুর",
    details: "মিরপুর ১০ গোলচত্বর ও এমআরটি স্টেশন, ঢাকা",
    tag: "মেট্রো এলাকা",
    latin: "Mirpur 10 Circle & Metro, Mirpur, Mirpur 10 Roundabout & MRT Station, Dhaka",
  },
  {
    id: "rec_13",
    name: "মিরপুর ২ ও স্টেডিয়াম",
    zone: "মিরপুর",
    details: "মিরপুর ২, জাতীয় ক্রিকেট স্টেডিয়াম এলাকা, ঢাকা",
    tag: "জনপ্রিয় এলাকা",
    latin: "Mirpur 2 & Stadium, Mirpur, Mirpur 2, National Cricket Stadium Area, Dhaka",
  },
  {
    id: "rec_14",
    name: "মিরপুর ১১ ও ১২ (ব্লক বি/সি)",
    zone: "মিরপুর",
    details: "ব্লক বি ও সি, মিরপুর ১১, ঢাকা",
    tag: "আবাসিক এলাকা",
    latin: "Mirpur 11 & 12 (Block B/C), Mirpur, Block B & C, Mirpur 11, Dhaka",
  },
  {
    id: "rec_15",
    name: "মিরপুর ডিওএইচএস",
    zone: "মিরপুর",
    details: "মিরপুর ডিওএইচএস আবাসিক এলাকা, ঢাকা",
    tag: "ডিওএইচএস এলাকা",
    latin: "Mirpur DOHS, Mirpur, Mirpur DOHS Residential Area, Dhaka",
  },
  {
    id: "rec_16",
    name: "মহাখালী ডিওএইচএস",
    zone: "মহাখালী",
    details: "মহাখালী ডিওএইচএস, ঢাকা",
    tag: "এক্সপ্রেস ডেলিভারি",
    latin: "Mohakhali DOHS, Mohakhali, Mohakhali DOHS, Dhaka",
  },
  {
    id: "rec_17",
    name: "মহাখালী ওয়্যারলেস গেট",
    zone: "মহাখালী",
    details: "ওয়্যারলেস গেট ও টিবি গেট, মহাখালী, ঢাকা",
    tag: "কেন্দ্রীয় এলাকা",
    latin: "Mohakhali Wireless Gate, Mohakhali, Wireless Gate & TB Gate, Mohakhali, Dhaka",
  },
  {
    id: "rec_18",
    name: "মোহাম্মদপুর রিং রোড",
    zone: "মোহাম্মদপুর",
    details: "রিং রোড, মোহাম্মদপুর, ঢাকা",
    tag: "ফুড স্ট্রিট",
    latin: "Mohammadpur Ring Road, Mohammadpur, Ring Road, Mohammadpur, Dhaka",
  },
  {
    id: "rec_19",
    name: "মোহাম্মদপুর টাউন হল",
    zone: "মোহাম্মদপুর",
    details: "টাউন হল ও আসাদ গেট, মোহাম্মদপুর, ঢাকা",
    tag: "কেন্দ্রীয় এলাকা",
    latin: "Mohammadpur Town Hall, Mohammadpur, Town Hall & Asad Gate, Mohammadpur, Dhaka",
  },
  {
    id: "rec_20",
    name: "লালমাটিয়া ব্লক এ-ই",
    zone: "লালমাটিয়া",
    details: "লালমাটিয়া আবাসিক এলাকা, ঢাকা",
    tag: "আবাসিক",
    latin: "Lalmatia Block A-E, Lalmatia, Lalmatia Residential Area, Dhaka",
  },
  {
    id: "rec_21",
    name: "পুরান ঢাকা (নাজিরা বাজার)",
    zone: "পুরান ঢাকা",
    details: "নাজিরা বাজার, পুরান ঢাকা (বিরিয়ানির রাজধানী), ঢাকা",
    tag: "ঐতিহ্যবাহী বিরিয়ানি",
    latin:
      "Old Dhaka (Nazira Bazar), Old Dhaka, Nazira Bazar, Puran Dhaka (Biriyani Capital), Dhaka",
  },
  {
    id: "rec_22",
    name: "পুরান ঢাকা (লালবাগ কেল্লা)",
    zone: "পুরান ঢাকা",
    details: "লালবাগ কেল্লা রোড, পুরান ঢাকা, ঢাকা",
    tag: "ঐতিহ্য",
    latin: "Old Dhaka (Lalbagh Fort), Old Dhaka, Lalbagh Fort Road, Old Dhaka, Dhaka",
  },
  {
    id: "rec_23",
    name: "বাড্ডা ও মেরুল বাড্ডা",
    zone: "বাড্ডা",
    details: "ডিআইটি রোড, বাড্ডা, ঢাকা",
    tag: "পূর্ব এলাকা",
    latin: "Badda & Merul Badda, Badda, DIT Road, Badda, Dhaka",
  },
  {
    id: "rec_24",
    name: "বারিধারা কূটনৈতিক এলাকা",
    zone: "বারিধারা",
    details: "পার্ক রোড, বারিধারা কূটনৈতিক এলাকা, ঢাকা",
    tag: "কূটনৈতিক এলাকা",
    latin: "Baridhara Diplomatic Zone, Baridhara, Park Road, Baridhara Diplomatic Zone, Dhaka",
  },
  {
    id: "rec_25",
    name: "মতিঝিল বাণিজ্যিক এলাকা",
    zone: "মতিঝিল",
    details: "দিলকুশা ও শাপলা চত্বর, মতিঝিল, ঢাকা",
    tag: "বাণিজ্যিক এলাকা",
    latin: "Motijheel Commercial Area, Motijheel, Dilkusha & Shapla Chattar, Motijheel, Dhaka",
  },
  {
    id: "rec_26",
    name: "খিলগাঁও তালতলা",
    zone: "খিলগাঁও",
    details: "তালতলা ও শহীদ বাকি রোড, খিলগাঁও, ঢাকা",
    tag: "রেস্টুরেন্ট এলাকা",
    latin: "Khilgaon Taltola, Khilgaon, Taltola & Shahid Baki Road, Khilgaon, Dhaka",
  },
  {
    id: "rec_27",
    name: "বেইলি রোড ও শান্তিনগর",
    zone: "শান্তিনগর",
    details: "বেইলি রোড (নাটক সরণি), শান্তিনগর, ঢাকা",
    tag: "খাবার ও সংস্কৃতি",
    latin:
      "Bailey Road & Shantinagar, Shantinagar, Bailey Road (Natok Shoroni), Shantinagar, Dhaka",
  },
]

export function searchRecommendations(query: string): RecommendationItem[] {
  const clean = query.trim().toLowerCase()
  if (!clean) return DHAKA_RECOMMENDATIONS.slice(0, 8)

  return DHAKA_RECOMMENDATIONS.filter(
    (item) =>
      item.name.toLowerCase().includes(clean) ||
      item.zone.toLowerCase().includes(clean) ||
      item.details.toLowerCase().includes(clean) ||
      item.tag?.toLowerCase().includes(clean) ||
      item.latin.toLowerCase().includes(clean),
  )
}
