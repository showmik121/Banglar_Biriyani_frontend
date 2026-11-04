export type RecommendationItem = {
  id: string
  name: string
  zone: string
  details: string
  tag?: string
}

export const DHAKA_RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: "rec_1",
    name: "DIU Main Gate",
    zone: "Daffodil Smart City",
    details: "Main Gate, Daffodil Smart City, Birulia, Savar, Dhaka-1216",
    tag: "Campus Delivery",
  },
  {
    id: "rec_2",
    name: "DIU Academic Buildings",
    zone: "Daffodil Smart City",
    details: "Academic Area, Daffodil Smart City, Birulia, Savar",
    tag: "Campus Delivery",
  },
  {
    id: "rec_3",
    name: "DIU Hostels",
    zone: "Daffodil Smart City",
    details: "Student Hostels, Daffodil Smart City, Birulia, Savar",
    tag: "Hostel Delivery",
  },
  {
    id: "rec_4",
    name: "Khagan Bazar",
    zone: "Khagan",
    details: "Khagan Bazar, Birulia, Savar",
    tag: "Near DIU",
  },
  {
    id: "rec_5",
    name: "Khagan Mess Area",
    zone: "Khagan",
    details: "Student Mess Area, Khagan, Birulia, Savar",
    tag: "Student Area",
  },
  {
    id: "rec_6",
    name: "Birulia Bazar",
    zone: "Birulia",
    details: "Birulia Bazar, Savar",
    tag: "Near DIU",
  },
  {
    id: "rec_7",
    name: "Ashulia Bazar",
    zone: "Ashulia",
    details: "Ashulia Bazar, Ashulia, Savar",
    tag: "Fast Delivery",
  },
  {
    id: "rec_8",
    name: "Zirabo Bus Stand",
    zone: "Zirabo",
    details: "Zirabo, Ashulia, Savar",
    tag: "Ashulia Zone",
  },
  {
    id: "rec_9",
    name: "Baipail Intersection",
    zone: "Baipail",
    details: "Baipail, Ashulia, Savar",
    tag: "Ashulia Zone",
  },
  {
    id: "rec_10",
    name: "Nabinagar",
    zone: "Nabinagar",
    details: "Nabinagar, Savar",
    tag: "Savar Zone",
  },
  {
    id: "rec_11",
    name: "Savar Bazar Bus Stand",
    zone: "Savar",
    details: "Savar Bazar, Savar",
    tag: "Savar Zone",
  },
  {
    id: "rec_12",
    name: "Gazirchat",
    zone: "Gazirchat",
    details: "Gazirchat, Ashulia, Savar",
    tag: "Ashulia Zone",
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
      item.tag?.toLowerCase().includes(clean),
  )
}
