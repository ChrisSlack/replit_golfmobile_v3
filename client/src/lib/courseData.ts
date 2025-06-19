import { Course } from './types';

export const courses: Course[] = [
  {
    id: 'nau',
    name: 'NAU Morgado Course',
    par: 73,
    description: 'Traditional Portuguese golf course with rolling hills and strategic bunkers.',
    website: 'https://www.naumorgado.com/',
    holes: [
      { hole: 1, par: 4, yardage: 342, handicap: 10 },
      { hole: 2, par: 4, yardage: 373, handicap: 15 },
      { hole: 3, par: 5, yardage: 535, handicap: 1 },
      { hole: 4, par: 4, yardage: 385, handicap: 7 },
      { hole: 5, par: 3, yardage: 156, handicap: 17 },
      { hole: 6, par: 4, yardage: 412, handicap: 3 },
      { hole: 7, par: 5, yardage: 492, handicap: 11 },
      { hole: 8, par: 4, yardage: 380, handicap: 9 },
      { hole: 9, par: 4, yardage: 335, handicap: 13 },
      { hole: 10, par: 4, yardage: 365, handicap: 6 },
      { hole: 11, par: 3, yardage: 175, handicap: 16 },
      { hole: 12, par: 4, yardage: 302, handicap: 18 },
      { hole: 13, par: 5, yardage: 510, handicap: 2 },
      { hole: 14, par: 4, yardage: 390, handicap: 8 },
      { hole: 15, par: 3, yardage: 145, handicap: 14 },
      { hole: 16, par: 4, yardage: 375, handicap: 4 },
      { hole: 17, par: 4, yardage: 410, handicap: 12 },
      { hole: 18, par: 5, yardage: 525, handicap: 5 }
    ]
  },
  {
    id: 'amendoeira',
    name: 'Amendoeira Golf Resort (Faldo Course)',
    par: 72,
    description: 'The Faldo Course at Amendoeira Golf Resort is a par-72 championship design by Sir Nick Faldo, requiring strategic play and careful positioning. This course won Portugal\'s Best Golf Course title in 2016 from World Golf Awards.',
    website: 'https://www.amendoeiraresort.com/golf/',
    holes: [
      { hole: 1, par: 4, yardage: 415, handicap: 7 },
      { hole: 2, par: 3, yardage: 174, handicap: 17 },
      { hole: 3, par: 4, yardage: 342, handicap: 13 },
      { hole: 4, par: 5, yardage: 486, handicap: 3 },
      { hole: 5, par: 4, yardage: 375, handicap: 9 },
      { hole: 6, par: 3, yardage: 165, handicap: 15 },
      { hole: 7, par: 4, yardage: 385, handicap: 5 },
      { hole: 8, par: 4, yardage: 396, handicap: 1 },
      { hole: 9, par: 5, yardage: 512, handicap: 11 },
      { hole: 10, par: 4, yardage: 368, handicap: 8 },
      { hole: 11, par: 3, yardage: 152, handicap: 18 },
      { hole: 12, par: 4, yardage: 355, handicap: 12 },
      { hole: 13, par: 5, yardage: 495, handicap: 2 },
      { hole: 14, par: 4, yardage: 385, handicap: 6 },
      { hole: 15, par: 4, yardage: 365, handicap: 14 },
      { hole: 16, par: 3, yardage: 135, handicap: 16 },
      { hole: 17, par: 4, yardage: 410, handicap: 4 },
      { hole: 18, par: 5, yardage: 528, handicap: 10 }
    ]
  },
  {
    id: 'quinta',
    name: 'Quinta do Lago South Course',
    par: 71,
    description: 'Premium championship course with stunning lake views and signature holes.',
    signatureHole: '15th Hole (Par 3) - 200m shot over a lake',
    website: 'https://www.quintadolago.com/golf/',
    holes: [
      { hole: 1, par: 4, yardage: 390, handicap: 11 },
      { hole: 2, par: 5, yardage: 500, handicap: 15 },
      { hole: 3, par: 4, yardage: 385, handicap: 7 },
      { hole: 4, par: 3, yardage: 175, handicap: 17 },
      { hole: 5, par: 5, yardage: 505, handicap: 1 },
      { hole: 6, par: 4, yardage: 410, handicap: 3 },
      { hole: 7, par: 3, yardage: 165, handicap: 13 },
      { hole: 8, par: 4, yardage: 395, handicap: 5 },
      { hole: 9, par: 4, yardage: 380, handicap: 9 },
      { hole: 10, par: 4, yardage: 365, handicap: 12 },
      { hole: 11, par: 3, yardage: 185, handicap: 16 },
      { hole: 12, par: 4, yardage: 375, handicap: 8 },
      { hole: 13, par: 5, yardage: 485, handicap: 2 },
      { hole: 14, par: 4, yardage: 390, handicap: 6 },
      { hole: 15, par: 3, yardage: 200, handicap: 14 },
      { hole: 16, par: 4, yardage: 372, handicap: 18 },
      { hole: 17, par: 4, yardage: 385, handicap: 4 },
      { hole: 18, par: 4, yardage: 405, handicap: 10 }
    ]
  }
];

export const scheduleData = [
  {
    date: '2025-07-01',
    day: 'Tuesday, July 1, 2025',
    description: 'Travel from Faro Airport to Vila Gale Cerro Alagoa',
    travelTime: '45 minutes',
    isSpecial: false
  },
  {
    date: '2025-07-02',
    day: 'Wednesday, July 2, 2025',
    course: 'NAU Morgado Course',
    departure: '08:30',
    travelTime: '35 mins',
    teeTime: '10:12',
    pickupTime: '17:00',
    duration: '6.8 hours',
    description: 'First round at NAU Morgado Course',
    isSpecial: false
  },
  {
    date: '2025-07-03',
    day: 'Thursday, July 3, 2025',
    course: 'Amendoeira Golf Resort',
    departure: '08:30',
    travelTime: '25 mins',
    teeTime: '10:10',
    pickupTime: '17:00',
    duration: '6.83 hours',
    description: 'Second round at Amendoeira Golf Resort',
    isSpecial: false
  },
  {
    date: '2025-07-04',
    day: 'Friday, July 4, 2025',
    description: 'Free Day Activities - Vote for your preferred activities!',
    isSpecial: true
  },
  {
    date: '2025-07-05',
    day: 'Saturday, July 5, 2025',
    course: 'Quinta do Lago South Course',
    departure: '08:30',
    travelTime: '38 mins',
    teeTime: '10:24',
    pickupTime: '17:00',
    duration: '6.6 hours',
    description: 'Final Championship Round at Quinta do Lago South Course',
    isSpecial: false
  },
  {
    date: '2025-07-06',
    day: 'Sunday, July 6, 2025',
    description: 'Travel from Vila Gale Cerro Alagoa to Faro Airport',
    travelTime: '45 minutes',
    isSpecial: false
  }
];

export const standardFines = [
  {
    type: '3-putt',
    name: '3 Putt',
    amount: 1,
    description: 'Taking three putts on any green'
  },
  {
    type: 'woody',
    name: 'Woody',
    amount: 1,
    description: 'Hitting any tree during play'
  },
  {
    type: 'wetty',
    name: 'Wetty',
    amount: 1,
    description: 'Ball landing in water hazard'
  },
  {
    type: 'sandy',
    name: 'Sandy',
    amount: 1,
    description: 'Ball landing in bunker'
  },
  {
    type: 'lost-ball',
    name: 'Lost Ball',
    amount: 2,
    description: 'Losing a ball during play'
  },
  {
    type: 'air-shot',
    name: 'Air Shot',
    amount: 2,
    description: 'Completely missing the ball'
  },
  {
    type: 'ladies-tee',
    name: 'Not Clearing Ladies Tee',
    amount: 5,
    description: 'Drive failing to pass ladies tee box'
  },
  {
    type: 'custom',
    name: 'Custom Fine',
    amount: 0,
    description: 'Add a custom fine with your own amount'
  }
];

export const activityOptions = [
  // Beach Options
  {
    id: 'beach-pescadores',
    name: 'Praia dos Pescadores',
    description: 'Traditional fishing beach with great restaurants',
    category: 'Beach Options'
  },
  {
    id: 'beach-oura',
    name: 'Praia da Oura',
    description: 'Lively beach with water sports and bars',
    category: 'Beach Options'
  },
  {
    id: 'beach-alemaes',
    name: 'Praia dos Alemães',
    description: 'Quiet beach perfect for relaxation',
    category: 'Beach Options'
  },
  // Water Activities
  {
    id: 'water-dolphins',
    name: 'Dolphin Watching Tours',
    description: '3-hour boat trip to spot dolphins in their natural habitat',
    category: 'Water Activities'
  },
  {
    id: 'water-caves',
    name: 'Sea Cave Exploration',
    description: 'Kayak or boat tour through stunning coastal caves',
    category: 'Water Activities'
  },
  {
    id: 'water-jetski',
    name: 'Jet Skiing',
    description: 'High-speed thrills along the Algarve coastline',
    category: 'Water Activities'
  },
  // Cultural Experiences
  {
    id: 'culture-castle',
    name: 'Silves Castle',
    description: 'Historic Moorish castle with panoramic views',
    category: 'Cultural Experiences'
  },
  {
    id: 'culture-oldtown',
    name: 'Old Town Albufeira',
    description: 'Charming cobbled streets, shops, and traditional cuisine',
    category: 'Cultural Experiences'
  },
  {
    id: 'culture-winery',
    name: 'Local Winery Tours',
    description: 'Wine tasting and vineyard tours in the region',
    category: 'Cultural Experiences'
  },
  // Adventure Activities
  {
    id: 'adventure-jeep',
    name: 'Jeep Safari',
    description: 'Off-road adventure through Portuguese countryside',
    category: 'Adventure Activities'
  },
  {
    id: 'adventure-gokart',
    name: 'Go-kart Racing',
    description: 'High-speed racing competition among the group',
    category: 'Adventure Activities'
  },
  {
    id: 'adventure-zoomarine',
    name: 'Zoomarine Theme Park',
    description: 'Marine life shows, water rides, and entertainment',
    category: 'Adventure Activities'
  }
];
