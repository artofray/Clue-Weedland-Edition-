import { ClueCard, Suspect, Room, CaseFile, Player } from './types';

export const SUSPECTS: Suspect[] = [
  {
    id: 'dj_johnny',
    name: 'DJ Johnny Potseed',
    role: 'Modern Strain Advocate / DJ',
    quote: "Yo! We got the rhythm, we got the organic intelligence. Who blew the vibe by locking down my premium stock?",
    desc: "Reincarnated from his pirate ancestor, he spins beats in Weedland, protecting the natural frequencies.",
    avatarColor: 'bg-emerald-500',
    iconName: 'Volume2'
  },
  {
    id: 'pirate_johnny',
    name: 'Captain Johnny Potseed',
    role: '4th Century Pirate Lord',
    quote: "Avast! Me seeds are sacred, and me heart belongs to Gracie. Any corporate mining rat who touches me gold-dust strains shall meet the cutlass!",
    desc: "The original cannabis-planting privateer, sailing the mystic dimensional seas of old Weedville.",
    avatarColor: 'bg-amber-600',
    iconName: 'Compass'
  },
  {
    id: 'gracie_omalley',
    name: "Queen Gracie O'Malley",
    role: '4th Century Irish Pirate Queen',
    quote: "May the winds blow ye to Davey Jones! My love Johnny and I buried the mother-strain seeds deep. Somebody looted it!",
    desc: "A legendary captain holding ancient wisdom of the seeds. Fierce, proud, and completely heart-centered.",
    avatarColor: 'bg-indigo-600',
    iconName: 'Anchor'
  },
  {
    id: 'dixie_delight',
    name: "Dixie Delight",
    role: 'Modern DJ & Sexy Librarian',
    quote: "Don't let these reading glasses fool you, hun. Keep it quiet in the archive, but once the beat starts, we are loud!",
    desc: "Gracie's descendant, DJ Johnny's soulmate, and a master archivist of Weedville's botanical secrets.",
    avatarColor: 'bg-pink-500',
    iconName: 'Book'
  },
  {
    id: 'madame_weaver',
    name: 'Madame Weaver',
    role: 'Corporate Mining Boss',
    quote: "This land is sitting on a mountain of lithium. Your 'organic intelligence' is a speed-bump to my drills. Where is my sample?",
    desc: "The cold, profit-driven mining company director—portrayed with ice-cold metallic stare (inspired by Sigourney Weaver).",
    avatarColor: 'bg-slate-700',
    iconName: 'Pickaxe'
  },
  {
    id: 'gene_cowbell',
    name: 'Gene "Cowbell" Frenkle',
    role: 'Percussionist Overlord',
    quote: "I got a fever! And the only prescription is... wait! Someone silenced my clanger. Who stole the cowbell?!",
    desc: "He wears a tight roll-neck sweater and clangs a cowbell with unparalleled artistic passion. Needs more cowbell!",
    avatarColor: 'bg-amber-400',
    iconName: 'Bell'
  },
  {
    id: 'foreman_negan',
    name: 'Foreman Negan',
    role: 'Pre-Zombie Evil Foreman',
    quote: "Little pig, little pig, let me in! I rule the mine workforce with an iron grip. Someone customized my bat, and they are gonna pay the tax.",
    desc: "In his pre-zombie life, he's the evil boss foreman of Madame Weaver's lithium mines. Wearing a leather jacket, demanding 50%.",
    avatarColor: 'bg-red-700',
    iconName: 'Hammer'
  }
];

export const CARDS: ClueCard[] = [
  // Suspects
  {
    id: 'dj_johnny',
    name: 'DJ Johnny Potseed',
    type: 'suspect',
    description: 'The reincarnated DJ throwing organic beats and seeds.',
    iconName: 'Volume2',
    bgColor: 'bg-emerald-900/60',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-200'
  },
  {
    id: 'pirate_johnny',
    name: 'Captain Johnny Potseed',
    type: 'suspect',
    description: 'Legends specify his pirate ship was stuffed with organic seeds.',
    iconName: 'Compass',
    bgColor: 'bg-amber-900/60',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-200'
  },
  {
    id: 'gracie_omalley',
    name: "Gracie O'Malley",
    type: 'suspect',
    description: 'The Irish Pirate Queen, protector of ancient botanicals.',
    iconName: 'Anchor',
    bgColor: 'bg-indigo-900/60',
    borderColor: 'border-indigo-500',
    textColor: 'text-indigo-200'
  },
  {
    id: 'dixie_delight',
    name: 'Dixie Delight',
    type: 'suspect',
    description: 'DJ Johnny\'s dual-persona partner and sexy librarian.',
    iconName: 'Book',
    bgColor: 'bg-pink-900/60',
    borderColor: 'border-pink-500',
    textColor: 'text-pink-200'
  },
  {
    id: 'madame_weaver',
    name: 'Madame Weaver',
    type: 'suspect',
    description: "Cold mining executive willing to drill through anything.",
    iconName: 'Pickaxe',
    bgColor: 'bg-slate-900/60',
    borderColor: 'border-slate-500',
    textColor: 'text-slate-200'
  },
  {
    id: 'gene_cowbell',
    name: 'Gene Frenkle (Cowbell)',
    type: 'suspect',
    description: 'Legitimate percussion legend; really needs more cowbell.',
    iconName: 'Bell',
    bgColor: 'bg-yellow-900/60',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-200'
  },
  {
    id: 'foreman_negan',
    name: 'Foreman Negan',
    type: 'suspect',
    description: 'The leather-jacketed pre-zombie mine foreman with heavy authority.',
    iconName: 'Hammer',
    bgColor: 'bg-red-900/60',
    borderColor: 'border-red-500',
    textColor: 'text-red-200'
  },

  // Weapons
  {
    id: 'lille_bat',
    name: 'Lucille (Barbed-Wire Bat)',
    type: 'weapon',
    description: 'Foreman Negan\'s ironized hickory bat wrapped in barbed wire.',
    iconName: 'Wrench',
    bgColor: 'bg-red-900/40',
    borderColor: 'border-red-400',
    textColor: 'text-red-100'
  },
  {
    id: 'heavy_cowbell',
    name: 'The Heavy Golden Cowbell',
    type: 'weapon',
    description: "Heavy iron casting used on the classic track. Hard to overlook.",
    iconName: 'Bell',
    bgColor: 'bg-amber-900/40',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-100'
  },
  {
    id: 'potency_gummy',
    name: 'Gummy of Ultimate Sleep',
    type: 'weapon',
    description: 'A single 4200mg THC gummy that renders anyone unconscious in 15 minutes.',
    iconName: 'Sparkles',
    bgColor: 'bg-emerald-950/60',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-100'
  },
  {
    id: 'pirate_cutlass',
    name: "Pirate Cutlass",
    type: 'weapon',
    description: "Gracie's high-carbon steel sword handed down through generations.",
    iconName: 'Sword',
    bgColor: 'bg-indigo-900/40',
    borderColor: 'border-indigo-400',
    textColor: 'text-indigo-100'
  },
  {
    id: 'mining_drill',
    name: 'Lithium Laser Drill',
    type: 'weapon',
    description: 'Industrial tech used to blast rock, but highly dangerous in the wrong hands.',
    iconName: 'Zap',
    bgColor: 'bg-slate-900/40',
    borderColor: 'border-slate-400',
    textColor: 'text-slate-100'
  },
  {
    id: 'ultra_vape',
    name: 'Ultra-Potency Concentrate Vape',
    type: 'weapon',
    description: 'A custom vaporizer that outputs concentrates. Instantly puts people in a trance.',
    iconName: 'Cloud',
    bgColor: 'bg-cyan-900/40',
    borderColor: 'border-cyan-400',
    textColor: 'text-cyan-100'
  },

  // Rooms
  {
    id: 'hydro_grow',
    name: 'Hydroponic Grow Room',
    type: 'room',
    description: 'Lush tropical workspace with UV lighting and high-grade organic strains.',
    iconName: 'Leaf',
    bgColor: 'bg-emerald-950/80',
    borderColor: 'border-emerald-600',
    textColor: 'text-emerald-200'
  },
  {
    id: 'dj_booth',
    name: 'Sonic Garden DJ Booth',
    type: 'room',
    description: 'Where DJ Johnny and Dixie blast records to charge up plant growth frequencies.',
    iconName: 'Music',
    bgColor: 'bg-pink-950/80',
    borderColor: 'border-pink-600',
    textColor: 'text-pink-200'
  },
  {
    id: 'mine_shaft',
    name: 'Lithium Mine Shaft',
    type: 'room',
    description: 'Madame Weaver\'s cold industrial mining complex underneath the soil.',
    iconName: 'Pickaxe',
    bgColor: 'bg-slate-950/80',
    borderColor: 'border-slate-600',
    textColor: 'text-slate-200'
  },
  {
    id: 'galleon_bar',
    name: "Pirate's Galleon Bar",
    type: 'room',
    description: "A replica pirate pub stocked with vintage rum and pirate relics.",
    iconName: 'Anchor',
    bgColor: 'bg-indigo-950/80',
    borderColor: 'border-indigo-600',
    textColor: 'text-indigo-200'
  },
  {
    id: 'tracking_booth',
    name: 'Record Tracking Booth',
    type: 'room',
    description: 'The acoustic wooden chamber where Gene Frenkle tracks his historic cowbell rhythms.',
    iconName: 'Mic',
    bgColor: 'bg-yellow-950/80',
    borderColor: 'border-yellow-600',
    textColor: 'text-yellow-200'
  },
  {
    id: 'agartha_portal',
    name: 'Agartha Mystic Gateway',
    type: 'room',
    description: 'A glowing, ancient subterranean portal connecting Weedland to Shambala.',
    iconName: 'Sparkles',
    bgColor: 'bg-purple-950/80',
    borderColor: 'border-purple-600',
    textColor: 'text-purple-200'
  },
  {
    id: 'dispensary_vault',
    name: 'Dispensary Cash Vault',
    type: 'room',
    description: 'Highly secure vault containing stacks of Greenback currencies and physical IP strain certificates.',
    iconName: 'Lock',
    bgColor: 'bg-amber-950/80',
    borderColor: 'border-amber-600',
    textColor: 'text-amber-200'
  },
  {
    id: 'bunkhouse',
    name: 'Pre-Zombie Foremen Bunkhouse',
    type: 'room',
    description: 'Negan\'s quarters, featuring black workboots, blueprint papers, and heavy iron lockers.',
    iconName: 'Home',
    bgColor: 'bg-red-950/80',
    borderColor: 'border-red-600',
    textColor: 'text-red-200'
  },
  {
    id: 'oi_lab',
    name: 'Organic Intelligence Lab',
    type: 'room',
    description: 'Where natural botany meets cutting-edge sensory interfaces and AI nodes.',
    iconName: 'Cpu',
    bgColor: 'bg-cyan-950/80',
    borderColor: 'border-cyan-600',
    textColor: 'text-cyan-200'
  }
];

export const ROOMS: Room[] = [
  {
    id: 'hydro_grow',
    name: 'Hydroponic Grow Room',
    description: 'Strains of ultimate genetics growing under ambient violet grow lamps.',
    color: '#066B3C',
    iconName: 'Leaf',
    adjacentRoomIds: ['dj_booth', 'mine_shaft', 'oi_lab']
  },
  {
    id: 'dj_booth',
    name: 'Sonic Garden DJ Booth',
    description: 'High-energy audio deck pumping frequencies directly to the plants.',
    color: '#9C27B0',
    iconName: 'Volume2',
    adjacentRoomIds: ['hydro_grow', 'galleon_bar', 'tracking_booth']
  },
  {
    id: 'mine_shaft',
    name: 'Lithium Mine Shaft',
    description: 'Warden Weaver\'s corporate digs scraping underneath historical roots.',
    color: '#607D8B',
    iconName: 'Pickaxe',
    adjacentRoomIds: ['hydro_grow', 'bunkhouse', 'dispensary_vault']
  },
  {
    id: 'galleon_bar',
    name: "Pirate's Galleon Bar",
    description: 'A cozy nautical pub adorned with ropes, sails, and pirate grog.',
    color: '#3F51B5',
    iconName: 'Anchor',
    adjacentRoomIds: ['dj_booth', 'agartha_portal']
  },
  {
    id: 'tracking_booth',
    name: 'Record Tracking Booth',
    description: 'Double insulated studio room dedicated to percussion recording.',
    color: '#FF9800',
    iconName: 'Mic',
    adjacentRoomIds: ['dj_booth', 'oi_lab', 'bunkhouse']
  },
  {
    id: 'agartha_portal',
    name: 'Agartha Mystic Gateway',
    description: 'Subterranean nexus of crystals leading to inner earth Shambala.',
    color: '#673AB7',
    iconName: 'Sparkles',
    adjacentRoomIds: ['galleon_bar', 'dispensary_vault', 'oi_lab']
  },
  {
    id: 'dispensary_vault',
    name: 'Dispensary Cash Vault',
    description: 'Steel reinforced chamber with Greenback certificates and safe locks.',
    color: '#FFC107',
    iconName: 'Lock',
    adjacentRoomIds: ['mine_shaft', 'agartha_portal']
  },
  {
    id: 'bunkhouse',
    name: 'Pre-Zombie Bunkhouse',
    description: 'Where Foreman Negan lays down rules and polishes bats.',
    color: '#D32F2F',
    iconName: 'Hammer',
    adjacentRoomIds: ['mine_shaft', 'tracking_booth']
  },
  {
    id: 'oi_lab',
    name: 'Organic Intelligence Lab',
    description: 'High tech bio-hacking screens bridging computer memory with vine systems.',
    color: '#00BCD4',
    iconName: 'Cpu',
    adjacentRoomIds: ['hydro_grow', 'tracking_booth', 'agartha_portal']
  }
];

// Seed generator to shuffle cards
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function initializeNewGame(humanName: string, selectCharacterId: string, botCount: number = 5): {
  caseFile: CaseFile;
  players: Player[];
  allCards: ClueCard[];
} {
  // 1. Separate cards by type
  const suspectCards = CARDS.filter(c => c.type === 'suspect');
  const weaponCards = CARDS.filter(c => c.type === 'weapon');
  const roomCards = CARDS.filter(c => c.type === 'room');

  // 2. Select one of each at random for the target solution (Envelope)
  const winningSuspect = suspectCards[Math.floor(Math.random() * suspectCards.length)];
  const winningWeapon = weaponCards[Math.floor(Math.random() * weaponCards.length)];
  const winningRoom = roomCards[Math.floor(Math.random() * roomCards.length)];

  const caseFile: CaseFile = {
    suspect: winningSuspect,
    weapon: winningWeapon,
    room: winningRoom
  };

  // 3. Pool the remaining cards to distribute to players
  const pool = [
    ...suspectCards.filter(c => c.id !== winningSuspect.id),
    ...weaponCards.filter(c => c.id !== winningWeapon.id),
    ...roomCards.filter(c => c.id !== winningRoom.id)
  ];

  const shuffledPool = shuffleArray(pool);

  // 4. Select which suspects will participate in the game
  // Ensure chosen player character is included
  const chosenSuspect = SUSPECTS.find(s => s.id === selectCharacterId) || SUSPECTS[0];
  const otherSuspects = SUSPECTS.filter(s => s.id !== chosenSuspect.id);
  const shuffledOthers = shuffleArray(otherSuspects);

  // We want to fill up to botCount bots (max 6 bots, total 7 players)
  const actualBotCount = Math.min(botCount, otherSuspects.length);
  const selectedBots = shuffledOthers.slice(0, actualBotCount);

  // Build full list of players: Human + Bots
  const playerSuspectsDef: Array<{ id: string; name: string; isHuman: boolean; avatarColor: string }> = [
    { id: chosenSuspect.id, name: `${humanName} (${chosenSuspect.name})`, isHuman: true, avatarColor: chosenSuspect.avatarColor }
  ];

  selectedBots.forEach(bot => {
    playerSuspectsDef.push({
      id: bot.id,
      name: `AI ${bot.name}`,
      isHuman: false,
      avatarColor: bot.avatarColor
    });
  });

  // Assign players
  const players: Player[] = playerSuspectsDef.map((p, pIndex) => {
    // Distribute cards as evenly as possible
    const playerCards: ClueCard[] = [];
    return {
      id: `player_${pIndex}`,
      name: p.name,
      isHuman: p.isHuman,
      avatarColor: p.avatarColor,
      characterId: p.id,
      cards: playerCards,
      currentRoomId: ROOMS[Math.floor(Math.random() * ROOMS.length)].id, // random start room
      notes: {},
      isEliminated: false,
      hasSuggestedThisTurn: false
    };
  });

  // Distribute shuffled items in the remaining cards list
  let cardIdx = 0;
  while (cardIdx < shuffledPool.length) {
    const playerToGet = players[cardIdx % players.length];
    playerToGet.cards.push(shuffledPool[cardIdx]);
    cardIdx++;
  }

  // Auto-fill deduction notes: each player knows their own cards!
  players.forEach(p => {
    // Fill their own cards with "cross" (cross off because they know they have them, meaning it cannot be in the envelope!)
    CARDS.forEach(card => {
      p.notes[card.id] = null; // start blank
    });
    p.cards.forEach(card => {
      p.notes[card.id] = 'cross'; // crossed off (not in envelope)
    });
  });

  return {
    caseFile,
    players,
    allCards: CARDS
  };
}

export function lookupIcon(name: string) {
  // Returns appropriate Lucide icons or defaults gracefully
  return name;
}
