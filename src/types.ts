export type CardType = 'suspect' | 'weapon' | 'room';

export interface ClueCard {
  id: string;
  name: string;
  type: CardType;
  description: string;
  iconName: string; // Used to select Lucide icons dynamically
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export interface Suspect {
  id: string;
  name: string;
  quote: string;
  role: string;
  desc: string;
  avatarColor: string;
  iconName: string;
}

export interface CaseFile {
  suspect: ClueCard;
  weapon: ClueCard;
  room: ClueCard;
}

export interface Player {
  id: string;
  name: string;
  isHuman: boolean;
  avatarColor: string;
  cards: ClueCard[];
  currentRoomId: string; // Where they are on the board
  notes: Record<string, 'check' | 'cross' | 'question' | null>; // Deduction sheet notes
  isEliminated: boolean;
  hasSuggestedThisTurn: boolean;
  characterId: string; // links to Suspect.id
}

export interface Room {
  id: string;
  name: string;
  description: string;
  color: string;
  iconName: string;
  adjacentRoomIds: string[]; // for movement network
}

export interface GameLogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'movement' | 'suggestion' | 'disproven' | 'secret_reveal' | 'elimination' | 'victory' | 'system';
}

export interface SuggestionState {
  suggesterId: string;
  suspectCard: ClueCard;
  weaponCard: ClueCard;
  roomCard: ClueCard;
  disproverId?: string; // who has disproven it
  revealedCard?: ClueCard; // card shown to suggester
  step: 'waiting_disprove' | 'disproven' | 'not_disproven';
}
