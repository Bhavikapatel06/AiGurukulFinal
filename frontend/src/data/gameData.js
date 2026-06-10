/**
 * gameData.js
 * Contains level details and shop items for the gamified version.
 */

export const GAME_USERS = [
  { id: 'ramayana', name: 'Ramayana', title: 'The Journey of Rama', icon: '🏹' },
  { id: 'mahabharata', name: 'Mahabharata', title: 'The Great Epic of India', icon: '🦚' },
  { id: 'ayurveda', name: 'Ayurveda', title: 'Ancient science of life', icon: '🌿' },
  { id: 'temples', name: 'Divine Temples', title: 'Architectural Wonders', icon: '🕉️' },
];

export const LEVELS = {
  ramayana: [
    {
      id: 1,
      name: 'Lord Rama',
      image: 'src/assets/game/rama_real.png',
      cartoon: 'src/assets/game/rama_3d.png',
      answer: 'rama',
      hints: [
        'He is the seventh avatar of Lord Vishnu.',
        'He is known as Maryada Purushottam.',
        'He defeated the ten-headed demon king Ravana.',
        'His story is told in the epic Ramayana.',
        'He was the eldest son of King Dasharatha.',
        'His weapon of choice is the bow and arrow.'
      ]
    },
    {
      id: 2,
      name: 'Goddess Sita',
      image: 'src/assets/game/sita_real.png', // I will need to handle this or use unsplash
      cartoon: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=600&h=600&auto=format&fit=crop',
      answer: 'sita',
      hints: [
        'She is the avatar of Goddess Lakshmi.',
        'She was found by King Janaka while plowing the earth.',
        'She is the embodiment of sacrifice and devotion.',
        'She proved her purity through the Agni Pariksha.',
        'She gave birth to Luv and Kush.'
      ]
    },
    {
      id: 3,
      name: 'Lord Hanuman',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&h=600&auto=format&fit=crop',
      cartoon: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&h=600&auto=format&fit=crop',
      answer: 'hanuman',
      hints: [
        'He is the son of Anjana and Kesari.',
        'He is the greatest devotee of Lord Rama.',
        'He carried the Dronagiri mountain to save Lakshmana.',
        'He crossed the ocean to find Sita in Lanka.',
        'He is the son of the wind god, Vayudev.'
      ]
    },
    {
      id: 4,
      name: 'Lakshmana',
      image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=600&h=600&auto=format&fit=crop',
      cartoon: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=600&h=600&auto=format&fit=crop',
      answer: 'lakshman',
      hints: [
        'He is the devoted younger brother of Lord Rama.',
        'He accompanied Rama and Sita during their exile.',
        'He is an avatar of the thousand-headed serpent, Sheshanaga.',
        'He mortally wounded Indrajit, the son of Ravana.',
        'He drew a protective line for Sita known as the Lakshmana Rekha.'
      ]
    },
    {
      id: 5,
      name: 'Ravana',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&h=600&auto=format&fit=crop',
      cartoon: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&h=600&auto=format&fit=crop',
      answer: 'ravana',
      hints: [
        'He was the ten-headed demon king of Lanka.',
        'He was a great scholar and a master of the Veena.',
        'He was an ardent devotee of Lord Shiva.',
        'He abducted Goddess Sita and took her to Lanka.',
        'He authored the Shiva Tandava Stotram.'
      ]
    }
  ],
  mahabharata: [
    {
      id: 1,
      name: 'Lord Krishna',
      image: 'src/assets/game/krishna_real.png',
      cartoon: 'src/assets/game/krishna_3d.png',
      answer: 'krishna',
      hints: [
        'He delivered the Bhagavad Gita to Arjuna.',
        'He is the eighth avatar of Lord Vishnu.',
        'He is the protector of cows (Gopala).',
        'He lifted the Govardhan mountain on his finger.',
        'He was the charioteer of Arjuna.'
      ]
    },
    {
      id: 2,
      name: 'Arjuna',
      image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=600&h=600&auto=format&fit=crop',
      cartoon: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=600&h=600&auto=format&fit=crop',
      answer: 'arjuna',
      hints: [
        'He is the greatest archer among the Pandavas.',
        'His bow is named Gandiva.',
        'He was the favorite student of Dronacharya.',
        'He won Draupadi in the swayamvar.',
        'He is the son of Indra, the king of gods.'
      ]
    }
  ],
  ayurveda: [
    {
      id: 1,
      name: 'Sushruta',
      image: 'https://images.unsplash.com/photo-1624494052342-990520bc973c?q=80&w=600&h=600&auto=format&fit=crop',
      cartoon: 'https://images.unsplash.com/photo-1624494052342-990520bc973c?q=80&w=600&h=600&auto=format&fit=crop',
      answer: 'sushruta',
      hints: [
        'He is known as the "Father of Surgery".',
        'He authored the Sushruta Samhita.',
        'He performed complex surgeries in ancient India.',
        'He pioneered plastic surgery, specifically rhinoplasty.',
        'He identified over 1100 diseases and 700 medicinal plants.'
      ]
    }
  ],
  temples: [
    {
      id: 1,
      name: 'Kedarnath Temple',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=600&h=600&auto=format&fit=crop',
      cartoon: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=600&h=600&auto=format&fit=crop',
      answer: 'kedarnath',
      hints: [
        'It is one of the Char Dham pilgrimage sites.',
        'It is dedicated to Lord Shiva.',
        'It is located in the Garhwal Himalayan range.',
        'It is one of the 12 Jyotirlingas.',
        'It was built by the Pandavas and revived by Adi Shankara.'
      ]
    }
  ]
};

export const SHOP_ITEMS = [
  { id: 'gold-crown', name: 'Golden Crown', category: 'Jewelry', price: 100, forUser: ['ramayana', 'mahabharata'], icon: '👑' },
  { id: 'peacock-feather', name: 'Peacock Feather', category: 'Accessory', price: 50, forUser: ['mahabharata'], icon: '🦚' },
  { id: 'royal-bow', name: 'Kodikanda Bow', category: 'Weapon', price: 150, forUser: ['ramayana'], icon: '🏹' },
  { id: 'floral-garland', name: 'Sacred Mala', category: 'Decoration', price: 60, forUser: ['ramayana', 'mahabharata', 'temples'], icon: '🌸' },
  { id: 'temple-bell', name: 'Divine Bell', category: 'Decoration', price: 80, forUser: ['temples'], icon: '🔔' },
  { id: 'herbal-pot', name: 'Ayurvedic Pot', category: 'Utility', price: 70, forUser: ['ayurveda'], icon: '🏺' },
  { id: 'gold-plating', name: 'Gold Leafing', category: 'Decoration', price: 200, forUser: ['temples'], icon: '✨' },
];
