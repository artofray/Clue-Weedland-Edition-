import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Leaf,
  Volume2,
  Compass,
  Anchor,
  Book,
  Pickaxe,
  Bell,
  Hammer,
  HelpCircle,
  Sparkles,
  Lock,
  Cpu,
  Home,
  Mic,
  Dices,
  Play,
  RotateCcw,
  Check,
  X,
  BookOpen,
  Info,
  ChevronRight,
  User,
  Award,
  Zap,
  Minus,
  Skull,
  TrendingUp,
  Award as RibbonIcon,
  VolumeX,
  Volume2 as VolumeOnIcon
} from 'lucide-react';
import { SUSPECTS, CARDS, ROOMS, initializeNewGame, shuffleArray } from './gameData';
import { ClueCard, Player, Room, CaseFile, GameLogEntry, SuggestionState, CardType } from './types';

// Browser Web Audio synthesizer helper for clean sound feedback
function speakSoundSynth(type: string) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    if (type === 'cowbell') {
      // Need more cowbell! Metallic high dual pitch clang
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.frequency.setValueAtTime(580, ctx.currentTime);
      osc2.frequency.setValueAtTime(840, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } else if (type === 'vape') {
      // Hissing white noise
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(8000, ctx.currentTime + 0.4);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } else if (type === 'victory') {
      // Cheerful fan-fare
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + duration - 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      playTone(523.25, 0, 0.12); // C5
      playTone(659.25, 0.12, 0.12); // E5
      playTone(783.99, 0.24, 0.12); // G5
      playTone(1046.50, 0.36, 0.35); // C6
    } else if (type === 'fail') {
      // Sad buzz descending
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(55, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'dice') {
      // Rapid rolling dice sound clicks
      for (let i = 0; i < 5; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(120 + i * 40, ctx.currentTime + i * 0.05);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.05);
        osc.stop(ctx.currentTime + i * 0.05 + 0.04);
      }
    } else if (type === 'step') {
      // Small soft thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      // General click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {
    console.debug('Web Audio not started or supported yet:', e);
  }
}

export default function App() {
  // Game Configuration States
  const [gameState, setGameState] = useState<'welcome' | 'setup' | 'playing' | 'gameover'>('welcome');
  const [muted, setMuted] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>('Potseed Fan');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('dj_johnny');
  const [opponentCount, setOpponentCount] = useState<number>(5); // Default with 5 bots for a full 6 player game
  const [greenbacks, setGreenbacks] = useState<number>(350); // Player earnings metric

  // Core Simulation States
  const [caseFile, setCaseFile] = useState<CaseFile | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [allCards, setAllCards] = useState<ClueCard[]>(CARDS);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [hasRolledThisTurn, setHasRolledThisTurn] = useState<boolean>(false);
  const [travelPointsLeft, setTravelPointsLeft] = useState<number>(0);
  const [historyLogs, setHistoryLogs] = useState<GameLogEntry[]>([]);
  const [autoPlayBots, setAutoPlayBots] = useState<boolean>(false);
  
  // Game Modals/Actions State
  const [showAccuseModal, setShowAccuseModal] = useState<boolean>(false);
  const [showSuggestModal, setShowSuggestModal] = useState<boolean>(false);
  const [suggestionState, setSuggestionState] = useState<SuggestionState | null>(null);
  const [targetAccusation, setTargetAccusation] = useState({ suspectId: '', weaponId: '', roomId: '' });
  const [targetSuggestion, setTargetSuggestion] = useState({ suspectId: '', weaponId: '' });
  const [selectedCardTypeFilter, setSelectedCardTypeFilter] = useState<'all' | 'suspect' | 'weapon' | 'room'>('all');

  // Endgame results state
  const [winnerMessage, setWinnerMessage] = useState<string>('');
  const [isVictory, setIsVictory] = useState<boolean>(false);

  // Audio trigger wrapper
  const triggerSound = (type: string) => {
    if (!muted) {
      speakSoundSynth(type);
    }
  };

  // Generate logs helper
  const addLog = (message: string, type: GameLogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setHistoryLogs(prev => [
      { id: Date.now().toString() + Math.random(), timestamp, message, type },
      ...prev
    ]);
  };

  // Auto scroll logs or manage state effects
  useEffect(() => {
    if (gameState === 'playing' && autoPlayBots) {
      const activePlayer = players[activePlayerIndex];
      if (activePlayer && !activePlayer.isHuman && !activePlayer.isEliminated) {
        // Trigger automated bot turn
        const timer = setTimeout(() => {
          handleBotTurn(activePlayerIndex);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [activePlayerIndex, players, autoPlayBots, gameState]);

  // Find corresponding suspect details
  const getSuspectInfoForId = (id: string) => {
    return SUSPECTS.find(s => s.id === id) || SUSPECTS[0];
  };

  // Find corresponding card metadata
  const getCardForId = (id: string) => {
    return CARDS.find(c => c.id === id);
  };

  // Initialize Game Session
  const startGame = () => {
    addLog(`Setting up Weedville Clue Board with ${opponentCount} rival operators...`, 'system');
    triggerSound('turn');
    
    const { caseFile: solution, players: initPlayers } = initializeNewGame(
      playerName,
      selectedCharacterId,
      opponentCount
    );

    setCaseFile(solution);
    setPlayers(initPlayers);
    setActivePlayerIndex(0);
    setDiceResult(null);
    setHasRolledThisTurn(false);
    setTravelPointsLeft(0);
    setSuggestionState(null);
    setGameState('playing');

    // Add starting logs
    addLog(`🌿 Mystery Initiated: Johnny's Ultimate Seed Flask Stash is missing!`, 'system');
    addLog(`The items are stashed in a secret Room, stolen by a Suspect, using a Tool/Weapon.`, 'info');
    
    const human = initPlayers.find(p => p.isHuman);
    if (human) {
      const cardNames = human.cards.map(c => `[${c.name}]`).join(', ');
      addLog(`Your hand contains: ${cardNames}. These are crossed off your checklist!`, 'secret_reveal');
    }
  };

  // Trigger Dice Roll
  const rollDice = () => {
    if (hasRolledThisTurn) return;
    triggerSound('dice');
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceResult(roll);
    setTravelPointsLeft(roll);
    setHasRolledThisTurn(true);
    
    const activePlayer = players[activePlayerIndex];
    addLog(`${activePlayer.name} rolled a ${roll}! They can travel adjacent rooms.`, 'movement');
  };

  // Move Active Player to a Room
  const movePlayerToRoom = (roomId: string) => {
    const activePlayer = players[activePlayerIndex];
    if (!activePlayer.isHuman) return; // Only control human player moves via clicking
    if (!hasRolledThisTurn) {
      alert("Please roll the dice first to see how far you can travel!");
      return;
    }

    const currentRoom = ROOMS.find(r => r.id === activePlayer.currentRoomId);
    const targetRoom = ROOMS.find(r => r.id === roomId);

    // Validate adjacency or travel budget
    if (!currentRoom || !targetRoom) return;

    const isAdjacent = currentRoom.adjacentRoomIds.includes(roomId);
    
    // Check secret tunnels (Hydro Grow <-> Dispensary Vault; Mine Shaft <-> Agartha Portal; Bunkhouse <-> Galleon Bar)
    let hasSecretTunnel = false;
    if ((currentRoom.id === 'hydro_grow' && roomId === 'dispensary_vault') || (currentRoom.id === 'dispensary_vault' && roomId === 'hydro_grow')) hasSecretTunnel = true;
    if ((currentRoom.id === 'mine_shaft' && roomId === 'agartha_portal') || (currentRoom.id === 'agartha_portal' && roomId === 'mine_shaft')) hasSecretTunnel = true;
    if ((currentRoom.id === 'bunkhouse' && roomId === 'galleon_bar') || (currentRoom.id === 'galleon_bar' && roomId === 'bunkhouse')) hasSecretTunnel = true;

    if (!isAdjacent && !hasSecretTunnel) {
      alert(`You can only travel to adjacent rooms! ${currentRoom.name} is not connected directly to ${targetRoom.name}.`);
      return;
    }

    // Execute Move
    triggerSound('step');
    const updatedPlayers = [...players];
    updatedPlayers[activePlayerIndex].currentRoomId = roomId;
    updatedPlayers[activePlayerIndex].hasSuggestedThisTurn = false; // reset suggest block
    setPlayers(updatedPlayers);
    setTravelPointsLeft(0); // movement consumed
    addLog(`${activePlayer.name} entered the [${targetRoom.name}].`, 'movement');
  };

  // Utilize Secret Passage
  const useSecretPassage = (targetRoomId: string) => {
    const activePlayer = players[activePlayerIndex];
    if (!activePlayer.isHuman) return;
    triggerSound('vape');
    const updatedPlayers = [...players];
    updatedPlayers[activePlayerIndex].currentRoomId = targetRoomId;
    updatedPlayers[activePlayerIndex].hasSuggestedThisTurn = false;
    setPlayers(updatedPlayers);
    setTravelPointsLeft(0);
    setHasRolledThisTurn(true); // skips rolling
    const targetRoom = ROOMS.find(r => r.id === targetRoomId);
    addLog(`${activePlayer.name} slipped through the secret passage direct to [${targetRoom?.name || targetRoomId}].`, 'movement');
  };

  // Open Suggestion Form helper
  const openSuggestDialog = () => {
    const activePlayer = players[activePlayerIndex];
    if (activePlayer.hasSuggestedThisTurn) {
      alert("You have already made a suggestion this turn!");
      return;
    }
    // Pre-fill target suggestion defaults
    const suspectCards = CARDS.filter(c => c.type === 'suspect');
    const weaponCards = CARDS.filter(c => c.type === 'weapon');
    setTargetSuggestion({
      suspectId: suspectCards[0].id,
      weaponId: weaponCards[0].id
    });
    setShowSuggestModal(true);
  };

  // Human submits a Suggestion
  const submitSuggestion = () => {
    const activePlayer = players[activePlayerIndex];
    const roomCard = CARDS.find(c => c.id === activePlayer.currentRoomId && c.type === 'room');
    const suspectCard = CARDS.find(c => c.id === targetSuggestion.suspectId && c.type === 'suspect');
    const weaponCard = CARDS.find(c => c.id === targetSuggestion.weaponId && c.type === 'weapon');

    if (!roomCard || !suspectCard || !weaponCard) return;

    setShowSuggestModal(false);
    executeSuggestion(activePlayer, suspectCard, weaponCard, roomCard);
  };

  // Universal Suggestion Executor
  const executeSuggestion = (
    suggester: Player,
    suspectCard: ClueCard,
    weaponCard: ClueCard,
    roomCard: ClueCard
  ) => {
    addLog(`📣 ${suggester.name} suggests: It was [${suspectCard.name}] in the [${roomCard.name}] using [${weaponCard.name}]!`, 'suggestion');
    triggerSound('bell');

    // Teleport suggested suspect to the room where suggestion is made
    const updatedPlayers = [...players];
    const suggestedPlayer = updatedPlayers.find(p => p.characterId === suspectCard.id);
    if (suggestedPlayer) {
      suggestedPlayer.currentRoomId = roomCard.id;
      addLog(`Teleported ${suggestedPlayer.name} to the [${roomCard.name}] for questioning!`, 'movement');
    }

    // Evaluate in clockwise direction who can disprove
    let indexToCheck = (players.findIndex(p => p.id === suggester.id) + 1) % players.length;
    let disproved = false;
    let disproverPlayer: Player | null = null;
    let matchingCardsInDisproverHand: ClueCard[] = [];

    // Loop through other players to verify hands
    for (let i = 1; i < players.length; i++) {
      const suspectingPlayer = players[indexToCheck];
      if (!suspectingPlayer.isEliminated) {
        const matches = suspectingPlayer.cards.filter(
          c => c.id === suspectCard.id || c.id === weaponCard.id || c.id === roomCard.id
        );
        if (matches.length > 0) {
          disproved = true;
          disproverPlayer = suspectingPlayer;
          matchingCardsInDisproverHand = matches;
          break; // Stop here, first player clockwise must disprove
        }
      }
      indexToCheck = (indexToCheck + 1) % players.length;
    }

    // Store state for visual reveal step
    if (disproved && disproverPlayer) {
      // Pick one matching card to show
      // If human, they can click; if AI, they select one
      const revealed = matchingCardsInDisproverHand[0]; // Simple first match

      const newSuggState: SuggestionState = {
        suggesterId: suggester.id,
        suspectCard,
        weaponCard,
        roomCard,
        disproverId: disproverPlayer.id,
        revealedCard: revealed,
        step: 'disproven'
      };

      setSuggestionState(newSuggState);
      addLog(`🔍 Disproven by ${disproverPlayer.name}!`, 'disproven');

      if (suggester.isHuman) {
        // Show directly to the human
        addLog(`Secret intelligence: ${disproverPlayer.name} showed you the card [${revealed.name}]!`, 'secret_reveal');
        triggerSound('vape');
        
        // Auto mark human checklist for convenience, but still let them edit notes
        setPlayers(prev => prev.map(p => {
          if (p.isHuman) {
            const updatedNotes = { ...p.notes };
            updatedNotes[revealed.id] = 'cross'; // crossed off
            return { ...p, notes: updatedNotes };
          }
          return p;
        }));
      } else {
        // AI disproved to AI - logged only
        if (disproverPlayer.isHuman) {
          addLog(`You disproved ${suggester.name}'s suggestion by showing your [${revealed.name}] card.`, 'secret_reveal');
        }
      }
    } else {
      // Complete mystery remained untouched
      setSuggestionState({
        suggesterId: suggester.id,
        suspectCard,
        weaponCard,
        roomCard,
        step: 'not_disproven'
      });
      addLog(`⚠️ No one could disprove the suggestion! These 3 items might are extremely suspicious...`, 'secret_reveal');
      triggerSound('cowbell');
    }

    // Flag suggestion made
    const finalizePlayers = [...players];
    const modSuggester = finalizePlayers.find(p => p.id === suggester.id);
    if (modSuggester) {
      modSuggester.hasSuggestedThisTurn = true;
    }
    setPlayers(finalizePlayers);
  };

  // Bot Turn Automation AI Strategy logic
  const handleBotTurn = (botIdx: number) => {
    const activePlayer = players[botIdx];
    if (activePlayer.isEliminated || activePlayer.isHuman) return;

    // 1. Roll dice if not rolled
    let currentRoll = 2;
    if (!hasRolledThisTurn) {
      currentRoll = Math.floor(Math.random() * 6) + 1;
      setDiceResult(currentRoll);
      setHasRolledThisTurn(true);
    }

    // 2. Select movement room
    // AI chooses roommate adjacent on random or based on missing notes
    const currentRoom = ROOMS.find(r => r.id === activePlayer.currentRoomId);
    if (currentRoom) {
      let targetRoomId = currentRoom.adjacentRoomIds[Math.floor(Math.random() * currentRoom.adjacentRoomIds.length)];
      
      // Smart: check secret passage loops
      if (currentRoom.id === 'hydro_grow' && Math.random() > 0.4) targetRoomId = 'dispensary_vault';
      if (currentRoom.id === 'mine_shaft' && Math.random() > 0.4) targetRoomId = 'agartha_portal';
      if (currentRoom.id === 'bunkhouse' && Math.random() > 0.4) targetRoomId = 'galleon_bar';

      // Move player
      const updatedPlayers = [...players];
      updatedPlayers[botIdx].currentRoomId = targetRoomId;
      updatedPlayers[botIdx].hasSuggestedThisTurn = false;
      setPlayers(updatedPlayers);
      addLog(`${activePlayer.name} moved into [${ROOMS.find(r => r.id === targetRoomId)?.name || targetRoomId}].`, 'movement');

      // 3. Automated Suggestion inside their room
      const roomCard = CARDS.find(c => c.id === targetRoomId && c.type === 'room');
      
      // Select suspect/weapon cards that bot does NOT hold to search efficiently
      const nonHeldSuspects = CARDS.filter(c => c.type === 'suspect' && !activePlayer.cards.find(pc => pc.id === c.id));
      const nonHeldWeapons = CARDS.filter(c => c.type === 'weapon' && !activePlayer.cards.find(pc => pc.id === c.id));

      const suspectCard = nonHeldSuspects[Math.floor(Math.random() * nonHeldSuspects.length)] || CARDS.find(c => c.type === 'suspect');
      const weaponCard = nonHeldWeapons[Math.floor(Math.random() * nonHeldWeapons.length)] || CARDS.find(c => c.type === 'weapon');

      if (roomCard && suspectCard && weaponCard) {
        setTimeout(() => {
          executeSuggestion(activePlayer, suspectCard, weaponCard, roomCard);
        }, 1100);
      }
    }
  };

  // Next Turn step mechanism
  const nextTurn = () => {
    triggerSound('step');
    setDiceResult(null);
    setHasRolledThisTurn(false);
    setTravelPointsLeft(0);
    setSuggestionState(null);

    // Skip to next non-eliminated player index
    let nextIdx = (activePlayerIndex + 1) % players.length;
    let checks = 0;
    while (players[nextIdx].isEliminated && checks < players.length) {
      nextIdx = (nextIdx + 1) % players.length;
      checks++;
    }

    if (checks >= players.length) {
      // All eliminated!
      setWinnerMessage("All operators have been eliminated in failed accusations! Nobody managed to salvage Johnny's legendary seeds flask.");
      setIsVictory(false);
      setGameState('gameover');
      triggerSound('fail');
      return;
    }

    // If bot and AutoPlay off, user clicks next turn manually
    setActivePlayerIndex(nextIdx);
    const nextPlayer = players[nextIdx];
    addLog(`It is now ${nextPlayer.name}'s turn.`, 'system');

    // Pay minor greenbacks reward for staying active
    if (nextPlayer.isHuman) {
      setGreenbacks(prev => prev + 15);
    }
  };

  // Open Accuse Dialog
  const openAccuseDialog = () => {
    const suspectCards = CARDS.filter(c => c.type === 'suspect');
    const weaponCards = CARDS.filter(c => c.type === 'weapon');
    const roomCards = CARDS.filter(c => c.type === 'room');
    setTargetAccusation({
      suspectId: suspectCards[0].id,
      weaponId: weaponCards[0].id,
      roomId: roomCards[0].id
    });
    setShowAccuseModal(true);
  };

  // Submit Final Accusation (Winner take all showdown!)
  const submitAccusation = (suspectId: string, weaponId: string, roomId: string) => {
    setShowAccuseModal(false);
    const activePlayer = players[activePlayerIndex];

    const actualSuspect = caseFile?.suspect;
    const actualWeapon = caseFile?.weapon;
    const actualRoom = caseFile?.room;

    const chosenSuspect = CARDS.find(c => c.id === suspectId);
    const chosenWeapon = CARDS.find(c => c.id === weaponId);
    const chosenRoom = CARDS.find(c => c.id === roomId);

    addLog(`🚨 ACCUSATION SHOWDOWN by ${activePlayer.name}: [${chosenSuspect?.name}] in the [${chosenRoom?.name}] with the [${chosenWeapon?.name}]!`, 'victory');

    if (!chosenSuspect || !chosenWeapon || !chosenRoom) return;

    const isMatch = 
      suspectId === actualSuspect?.id && 
      weaponId === actualWeapon?.id && 
      roomId === actualRoom?.id;

    if (isMatch) {
      // Victory!
      setWinnerMessage(`${activePlayer.name} solved the mystery correctly! Stash saved. Perfect organic intelligence!`);
      setIsVictory(true);
      setGameState('gameover');
      triggerSound('victory');
      // Reward bonus greenbacks!
      if (activePlayer.isHuman) {
        setGreenbacks(prev => prev + 250);
      }
    } else {
      // Wrong estimation! Player eliminated
      addLog(`❌ False alarm! ${activePlayer.name}'s charges were flat out disproven at the tribunal. They are eliminated from the search!`, 'elimination');
      triggerSound('fail');

      const updatedPlayers = [...players];
      updatedPlayers[activePlayerIndex].isEliminated = true;
      setPlayers(updatedPlayers);

      // Reveal correct cards to private human log if the human guessed wrong
      if (activePlayer.isHuman) {
        addLog(`You have been eliminated. You can continue watching AI play. Correct Case File: [${actualSuspect?.name}] using [${actualWeapon?.name}] in the [${actualRoom?.name}].`, 'secret_reveal');
        // Subtract greenbacks
        setGreenbacks(prev => Math.max(0, prev - 100));
      }

      // Check if any other non-bot player remains
      const nonEliminatedCount = updatedPlayers.filter(p => !p.isEliminated).length;
      if (nonEliminatedCount === 0) {
        setWinnerMessage("All operators have been eliminated in failed accusations! Nobody managed to salvage Johnny's legendary seeds flask.");
        setIsVictory(false);
        setGameState('gameover');
      } else {
        // Go to next turn immediately
        nextTurn();
      }
    }
  };

  // Notepad interactive cell toggler
  const toggleNotepadNote = (cardId: string) => {
    const updatedPlayers = players.map(p => {
      if (p.isHuman) {
        const currentNote = p.notes[cardId];
        let nextNote: 'check' | 'cross' | 'question' | null = null;
        if (currentNote === null) nextNote = 'cross'; // Cross standard first step (not inside envelope)
        else if (currentNote === 'cross') nextNote = 'check'; // Check stands for suspicion (solution candidate!)
        else if (currentNote === 'check') nextNote = 'question'; // Question doubtful
        else nextNote = null;

        const updatedNotes = { ...p.notes, [cardId]: nextNote };
        return { ...p, notes: updatedNotes };
      }
      return p;
    });
    setPlayers(updatedPlayers);
    triggerSound('step');
  };

  // Helper text for note states
  const renderNoteIndicator = (state: 'check' | 'cross' | 'question' | null) => {
    switch (state) {
      case 'cross':
        return <X className="w-5 h-5 text-red-400 font-bold" />;
      case 'check':
        return <Check className="w-5 h-5 text-emerald-400 font-bold" />;
      case 'question':
        return <span className="text-yellow-400 font-extrabold text-base">?</span>;
      default:
        return <Minus className="w-4 h-4 text-slate-600" />;
    }
  };

  // Render small custom avatars
  // Render small custom avatars
  const renderSuspectIcon = (id: string, sizeClass = "w-10 h-10") => {
    const info = getSuspectInfoForId(id);
    const bg = info.avatarColor;
    return (
      <div className={`${sizeClass} ${bg} rounded-sm flex items-center justify-center text-white border border-white/10 shadow-sm`}>
        {info.iconName === 'Volume2' && <Volume2 className="w-5 h-5" />}
        {info.iconName === 'Compass' && <Compass className="w-5 h-5" />}
        {info.iconName === 'Anchor' && <Anchor className="w-5 h-5" />}
        {info.iconName === 'Book' && <Book className="w-5 h-5" />}
        {info.iconName === 'Pickaxe' && <Pickaxe className="w-5 h-5" />}
        {info.iconName === 'Bell' && <Bell className="w-5 h-5" />}
        {info.iconName === 'Hammer' && <Hammer className="w-5 h-5" />}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white antialiased">
      {/* Immersive Top Bar Header */}
      <header className="bg-gradient-to-r from-emerald-950 to-neutral-950 border-b border-emerald-500/30 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] text-black shrink-0 font-serif font-black text-2xl">
            ?
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black tracking-tighter text-emerald-400 uppercase">HIGH STAKES: THE WEEDLAND MYSTERY</h1>
            <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold font-mono">A Multiplayer Clue Deduction Game</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-mono">Current investigator</p>
            <p className="text-sm font-bold text-emerald-300">
              {gameState === 'playing' ? players[activePlayerIndex]?.name : 'Setup Phase'}
            </p>
          </div>
          <div className="hidden md:block w-px h-10 bg-white/10" />
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-neutral-900/90 text-xs px-3 py-1.5 rounded-sm border border-emerald-900/40">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono font-bold text-emerald-300">{greenbacks} GBK</span>
            </div>

            <button
              onClick={() => {
                setMuted(!muted);
                triggerSound('bell');
              }}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 rounded-sm text-stone-400 hover:text-stone-200 transition border border-white/10"
              title={muted ? "Unmute" : "Mute Sound Samples"}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <VolumeOnIcon className="w-4 h-4" />}
            </button>

            {gameState === 'playing' && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to surrender and restart the Clue mystery?")) {
                    setGameState('setup');
                    triggerSound('fail');
                  }
                }}
                className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900/50 text-red-300 font-mono text-xs font-semibold rounded-sm border border-red-500/20 transition"
              >
                Surrender
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Containers */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6 justify-center">

        {/* VIEW 1: WELCOME INTRO SCREEN */}
        {gameState === 'welcome' && (
          <div className="w-full max-w-3xl mx-auto bg-neutral-900 border border-emerald-500/20 rounded-sm p-6 sm:p-10 shadow-[0_0_50px_rgba(16,185,129,0.04)] relative my-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="text-center mb-8 border-b border-white/5 pb-6">
              <span className="text-[10px] text-emerald-500 font-mono font-black tracking-widest uppercase bg-emerald-500/10 px-3 py-1 rounded-sm border border-emerald-500/20">
                Lobby Active: 1st Wave Seedlings
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-emerald-400 mt-4 mb-3">
                The Legend of <span className="text-white font-normal italic">Johnny Potseed Clue</span>
              </h2>
              <p className="text-stone-400 text-sm max-w-xl mx-auto leading-relaxed">
                Johnny's ultimate biological seed strain flask is gone! Join forces with 4th-Century Pirate Gracie O'Malley or DJ Dixie Delight, and defend Weedland against corporate giants, mining drilling machines, and foreman rivals.
              </p>
            </div>

            {/* Character Spotlight Grid */}
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-emerald-600 mb-4 text-center">LEGENDARY OPERATORS & RIVALS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {SUSPECTS.map(suspect => (
                <div key={suspect.id} className="bg-black/40 p-4 rounded-sm border border-white/5 flex flex-col items-center text-center">
                  {renderSuspectIcon(suspect.id, "w-11 h-11 mb-2.5")}
                  <span className="text-xs font-bold text-white font-serif tracking-wider line-clamp-1">{suspect.name}</span>
                  <span className="text-[9px] text-emerald-600 font-mono uppercase tracking-tight line-clamp-1 mt-0.5">{suspect.role}</span>
                  <p className="text-[10px] text-stone-500 line-clamp-2 mt-2 px-1 italic">"{suspect.quote}"</p>
                </div>
              ))}
            </div>

            <div className="bg-black/60 p-4 rounded-sm border border-white/5 mb-8 text-center text-xs text-stone-400">
              <span className="font-bold text-emerald-400 font-mono">🔊 HIGH-FIDELITY SYNTH SOUND ENGINE:</span> Heavy cowbells, premium vapes, and dynamic turn bells are synthesized using raw browser-native Web Audio! Ensure your system audio is active.
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  triggerSound('bell');
                  setGameState('setup');
                }}
                className="group flex items-center justify-center gap-3 px-8 py-4 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 font-serif font-bold uppercase tracking-widest text-sm rounded-sm transition-all duration-200 shadow-md hover:shadow-emerald-500/10"
              >
                Assemble Search Party
                <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: GAME SETUP SCREEN */}
        {gameState === 'setup' && (
          <div className="w-full max-w-4xl mx-auto bg-neutral-900 border border-emerald-500/20 rounded-sm p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.03)] relative">
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-emerald-400 mb-6 flex items-center gap-3 uppercase">
              <BookOpen className="w-7 h-7 text-emerald-500" /> Confirm Operator Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Left Column: Player Customizer */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold font-mono text-stone-400 uppercase tracking-widest mb-2 font-black">
                    Operator Code Name
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={18}
                    className="w-full bg-black/60 border border-white/10 focus:border-emerald-500 rounded-sm px-4 py-3 text-white font-medium transition placeholder-stone-700 outline-none text-sm font-sans"
                    placeholder="Enter your nickname..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold font-mono text-stone-400 uppercase tracking-widest mb-2 font-black">
                    Hostility Matrix Opponents
                  </label>
                  <div className="bg-black/40 p-4 rounded-sm border border-white/5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-stone-400">Total Playable Rivals:</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{opponentCount} AI RIVALS (+ You)</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={6}
                      value={opponentCount}
                      onChange={(e) => {
                        setOpponentCount(Number(e.target.value));
                        triggerSound('bell');
                      }}
                      className="w-full accent-emerald-500"
                    />
                    <p className="text-[10px] text-stone-500 mt-2 leading-relaxed">
                      Adjusting count controls how many AI players join the Clue table. Higher values increase difficulty!
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-950/20 rounded-sm border border-emerald-800/20">
                  <h4 className="text-xs font-bold text-emerald-300 font-mono mb-1 uppercase tracking-wider">Pass-Through Clues:</h4>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    DJ Johnny Potseed and Dixie Delight are descendants of historical Pirate captain Johnny Potseed & Irish legend Gracie O'Malley. Keep their shared bonds in mind when questioning suspect alignments.
                  </p>
                </div>
              </div>

              {/* Right Column: Character Selection */}
              <div>
                <label className="block text-[10px] font-bold font-mono text-stone-400 uppercase tracking-widest mb-3 font-black">
                  Select your playable high stake avatar
                </label>
                <div className="grid grid-cols-1 gap-2.5 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
                  {SUSPECTS.map(sus => {
                    const isSelected = selectedCharacterId === sus.id;
                    return (
                      <button
                        key={sus.id}
                        onClick={() => {
                          setSelectedCharacterId(sus.id);
                          triggerSound('turn');
                        }}
                        className={`flex items-start gap-3.5 p-3 rounded-sm border text-left transition w-full ${
                          isSelected
                            ? 'bg-emerald-950/20 border-emerald-500'
                            : 'bg-black/40 border-white/5 hover:border-emerald-500/20'
                        }`}
                      >
                        {renderSuspectIcon(sus.id, "w-10 h-10 shrink-0")}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white font-serif">{sus.name}</span>
                            {isSelected && (
                              <span className="text-[9px] font-mono bg-emerald-500 text-black px-1.5 py-0.5 rounded-sm font-black">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-stone-400 block font-mono uppercase tracking-widest mt-0.5">{sus.role}</span>
                          <p className="text-[10px] text-stone-500 line-clamp-1 mt-1 italic">"{sus.quote}"</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center flex-wrap gap-4 border-t border-white/5 pt-6">
              <button
                onClick={() => {
                  setGameState('welcome');
                  triggerSound('fail');
                }}
                className="px-5 py-2.5 font-serif text-xs bg-neutral-950 hover:bg-neutral-900 border border-white/10 text-stone-400 rounded-sm uppercase tracking-wider font-bold"
              >
                Cancel Setup
              </button>

              <button
                onClick={startGame}
                className="flex items-center gap-2 px-8 py-3 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 font-serif font-black text-xs uppercase tracking-widest rounded-sm cursor-pointer"
              >
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" /> START HIGH STAKES DEPLOYMENT
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: MAIN CLUE GAME TABLE */}
        {gameState === 'playing' && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 my-2">
            
            {/* LEFT CONTAINER (4 Cols): INTERACTIVE BOARD MAP */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              
              {/* CURRENT PLAYER IDENTIFIED BAR */}
              <div className="bg-neutral-900 p-4 rounded-sm border border-emerald-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                <h3 className="text-[9px] font-mono text-stone-400 uppercase tracking-widest mb-1 font-black">Active Turn Investigator</h3>
                
                <div className="flex items-center gap-3 mt-2">
                  {renderSuspectIcon(players[activePlayerIndex]?.characterId, "w-10 h-10 shrink-0")}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-serif font-black text-white block uppercase tracking-wide">
                      {players[activePlayerIndex]?.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-mono px-2 py-0.5 bg-black/50 text-stone-300 rounded-sm border border-white/5 uppercase">
                        {players[activePlayerIndex]?.isHuman ? '👨‍✈️ HUMAN (YOU)' : '🤖 AI RIVAL'}
                      </span>
                      {players[activePlayerIndex]?.isEliminated && (
                        <span className="text-[9px] font-mono px-2 py-0.5 bg-red-950/50 text-red-400 rounded-sm border border-red-900/30 uppercase">
                          ELIMINATED
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {players[activePlayerIndex]?.isHuman && (
                  <div className="mt-4 p-3 bg-emerald-950/20 border border-emerald-800/20 rounded-sm text-[11px] text-stone-300 leading-relaxed">
                    <span className="font-bold text-emerald-400">Johnny's Secret Advice:</span> Roll your movement dice, click on any enabled room with highlighted paths, then broadcast suggestions to unravel target details.
                  </div>
                )}
              </div>
                      {/* DYNAMIC CONNECTIVITY GRID BOARD GRAPH */}
              <div className="bg-neutral-900 p-4 rounded-sm border border-emerald-500/10 flex-grow">
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                  <h3 className="text-xs font-bold font-serif uppercase text-emerald-400 tracking-wider">
                    WEEDVILLE BOARD MAP GRID
                  </h3>
                  <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest">Connected Paths</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {ROOMS.map(room => {
                    const occupants = players.filter(p => !p.isEliminated && p.currentRoomId === room.id);
                    const activePlayerInRoom = players[activePlayerIndex]?.currentRoomId === room.id;
                    const isAdjacentToActive = ROOMS.find(r => r.id === players[activePlayerIndex]?.currentRoomId)
                      ?.adjacentRoomIds.includes(room.id);
                    
                    // Secret portals highlight
                    const isSecretPassageTarget = 
                      (players[activePlayerIndex]?.currentRoomId === 'hydro_grow' && room.id === 'dispensary_vault') ||
                      (players[activePlayerIndex]?.currentRoomId === 'dispensary_vault' && room.id === 'hydro_grow') ||
                      (players[activePlayerIndex]?.currentRoomId === 'mine_shaft' && room.id === 'agartha_portal') ||
                      (players[activePlayerIndex]?.currentRoomId === 'agartha_portal' && room.id === 'mine_shaft') ||
                      (players[activePlayerIndex]?.currentRoomId === 'bunkhouse' && room.id === 'galleon_bar') ||
                      (players[activePlayerIndex]?.currentRoomId === 'galleon_bar' && room.id === 'bunkhouse');

                    const canMoveTo = hasRolledThisTurn && (isAdjacentToActive || isSecretPassageTarget) && players[activePlayerIndex]?.isHuman;

                    return (
                      <div
                        key={room.id}
                        className={`p-3 rounded-sm border transition-all relative ${
                          activePlayerInRoom 
                            ? 'bg-emerald-950/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                            : canMoveTo 
                            ? 'bg-emerald-900/10 border-emerald-500 hover:bg-emerald-900/20 cursor-pointer animate-pulse' 
                            : 'bg-black/35 border-emerald-950/40 hover:border-emerald-500/20'
                        }`}
                        onClick={() => {
                          if (canMoveTo) {
                            movePlayerToRoom(room.id);
                          }
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-2.5 h-2.5 rounded-full shrink-0" 
                              style={{ backgroundColor: room.color }}
                            />
                            <span className="text-sm font-serif font-black text-white tracking-wide">{room.name}</span>
                          </div>

                          {/* Secret shortpath triggers */}
                          {isSecretPassageTarget && players[activePlayerIndex]?.isHuman && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                useSecretPassage(room.id);
                              }}
                              className="text-[9px] font-mono uppercase bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-sm border border-emerald-500/30 hover:bg-emerald-900 transition-colors cursor-pointer"
                            >
                              🌀 Gate Portal
                            </button>
                          )}
                        </div>

                        <p className="text-[10px] text-stone-400 mt-1 line-clamp-1">{room.description}</p>

                        {/* OCCUPANTS AVATARS */}
                        {occupants.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-white/5">
                            <span className="text-[8px] font-mono text-stone-500 uppercase mr-1">Present:</span>
                            {occupants.map(occ => (
                              <div
                                key={occ.id}
                                className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded-sm border border-white/5"
                                title={occ.name}
                              >
                                {renderSuspectIcon(occ.characterId, "w-4 h-4 shrink-0")}
                                <span className="text-[9px] font-medium text-stone-300 font-mono text-ellipsis w-14 overflow-hidden whitespace-nowrap">
                                  {occ.name.replace(/AI\s/, '')}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {activePlayerInRoom && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold text-emerald-400 tracking-wider font-mono">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                            Turn Here
                          </div>
                        )}
                        {!activePlayerInRoom && canMoveTo && (
                          <div className="absolute top-2 right-2 text-[9px] text-emerald-400 font-mono font-bold">
                            Click to travel
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* MIDDLE CONTAINER (5 Cols): GAME STEPS, CONSOLE, DIALOG DIALOGS */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Turn Main Controllers Panel */}
              <div className="bg-neutral-900 p-5 rounded-sm border border-emerald-500/10">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                  <span className="text-[10px] font-bold font-mono text-stone-400 uppercase tracking-widest">Turn Actions Dashboard</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-stone-400 uppercase font-bold">Auto Pass Bots:</span>
                    <input
                      type="checkbox"
                      checked={autoPlayBots}
                      onChange={(e) => setAutoPlayBots(e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-500"
                    />
                  </div>
                </div>

                {/* If Human Player Turn */}
                {players[activePlayerIndex]?.isHuman ? (
                  <div className="space-y-4">
                    
                    {/* DICE ROLLING CONTAINER */}
                    <div className="bg-black/40 p-4 rounded-sm border border-white/5 text-center">
                      {!hasRolledThisTurn ? (
                        <div className="space-y-3">
                          <p className="text-xs text-stone-400 leading-relaxed">Roll the movement dice to locate available travel speed coordinates.</p>
                          <button
                            onClick={rollDice}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-950/45 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 font-serif font-bold uppercase tracking-widest rounded-sm transition cursor-pointer text-xs"
                          >
                            <Dices className="w-4 h-4 text-emerald-400" /> ROLL MOVEMENT DICE
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-black border border-emerald-500/30 rounded-sm flex items-center justify-center text-emerald-400 font-serif font-black text-xl shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                              {diceResult}
                            </div>
                            <div className="text-left">
                              <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block font-bold">ROLLED MATRIX</span>
                              <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Click adjacent map block</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={nextTurn}
                            className="px-3 py-1.5 bg-neutral-950 border border-white/10 text-stone-400 font-mono text-[9px] uppercase tracking-widest rounded-sm hover:border-emerald-500/20"
                          >
                            Skip / Pass
                          </button>
                        </div>
                      )}
                    </div>

                    {/* SUGGESTION / ACCUSATION ACTION STEPS */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={openSuggestDialog}
                        disabled={players[activePlayerIndex]?.hasSuggestedThisTurn}
                        className={`p-3 rounded-sm border font-serif font-black text-[11px] uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition ${
                          players[activePlayerIndex]?.hasSuggestedThisTurn
                            ? 'bg-neutral-950 text-stone-600 border-white/5 cursor-not-allowed'
                            : 'bg-emerald-950/20 text-emerald-400 border-emerald-800/20 hover:bg-emerald-900/10'
                        }`}
                      >
                        <Volume2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>Suggestion</span>
                        <span className="text-[8px] text-stone-500 font-mono tracking-tight lowercase block font-normal">Active room only</span>
                      </button>

                      <button
                        onClick={openAccuseDialog}
                        className="p-3 bg-red-950/20 text-red-400 hover:bg-red-900/10 border border-red-900/25 rounded-sm font-serif font-black text-[11px] uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition"
                      >
                        <Skull className="w-4 h-4 shrink-0 text-red-500" />
                        <span>Accuse Tribunal</span>
                        <span className="text-[8px] text-red-600 font-mono block tracking-tight font-normal lowercase">Endgame win/lose</span>
                      </button>
                    </div>

                    {/* Reveal feedback block */}
                    {suggestionState && (
                      <div className="p-4 bg-black/60 rounded-sm border border-emerald-500/10 relative">
                        <div className="flex items-center gap-2 mb-2 text-[9px] font-black text-amber-400 uppercase tracking-widest font-mono">
                          <Info className="w-3.5 h-3.5 text-amber-400" /> SUGGESTION ANALYSIS DISCLOSURE
                        </div>
                        <p className="text-[11px] text-stone-400">
                          Your investigation disproving assessment has concluded:
                        </p>
                        {suggestionState.step === 'disproven' ? (
                          <div className="mt-2 text-xs text-stone-100 bg-emerald-950/10 p-2.5 rounded-sm border border-emerald-900/20">
                            🔑 Disproved by <span className="font-bold text-emerald-300">{players.find(p => p.id === suggestionState.disproverId)?.name}</span>. They secretly showed you: <span className="font-mono font-bold underline text-emerald-300 bg-emerald-900/30 px-1 py-0.5 rounded-sm">[{suggestionState.revealedCard?.name}]</span>
                          </div>
                        ) : (
                          <div className="mt-2 text-xs text-red-400 bg-red-950/10 p-2.5 rounded-sm border border-red-900/20">
                            ⚠️ COMPLETE ABSOLUTE SILENCE. No operator was capable of disproving this suggested reality!
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step transition selector */}
                    <button
                      onClick={nextTurn}
                      className="w-full py-3 bg-neutral-950 hover:bg-neutral-900 border border-white/10 text-stone-300 font-mono uppercase tracking-widest font-bold rounded-sm flex items-center justify-center gap-2 transition text-xs"
                    >
                      End My Turn <ChevronRight className="w-4 h-4 text-emerald-500" />
                    </button>

                  </div>
                ) : (
                  // If AI Turn
                  <div className="space-y-4 text-center py-6 bg-black/40 rounded-sm border border-white/5">
                    <div className="animate-spin duration-1000 w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-xs font-mono text-stone-300 uppercase tracking-wider">
                      RIVAL <span className="font-bold text-emerald-400">{players[activePlayerIndex]?.name}</span> CALCULATING ACTIONS...
                    </p>
                    <p className="text-[10px] text-stone-500 max-w-xs mx-auto leading-relaxed uppercase tracking-normal">
                      Rivals roll movement logs, approach rooms physically, and request disclosure to narrow suspects.
                    </p>

                    {suggestionState && (
                      <div className="mx-4 p-3 bg-black rounded-sm text-left border border-white/5 text-xs">
                        <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest block mb-1.5 font-bold">BOARD ACCURACY LOG</span>
                        <p className="text-stone-300 leading-relaxed text-[11px]">
                          <span className="text-emerald-400 font-semibold">{players.find(p => p.id === suggestionState.suggesterId)?.name}</span> suggests 
                          <span className="text-white font-serif font-bold"> {suggestionState.suspectCard.name}</span> with 
                          <span className="text-white font-mono text-[10px]"> {suggestionState.weaponCard.name}</span> inside 
                          <span className="text-white font-serif font-bold italic"> {suggestionState.roomCard.name}</span>.
                        </p>
                        {suggestionState.step === 'disproven' ? (
                          <p className="text-emerald-500 mt-1.5 font-mono text-[10px] uppercase font-bold tracking-wider">
                            ✓ Disproved safely by {players.find(p => p.id === suggestionState.disproverId)?.name}.
                          </p>
                        ) : (
                          <p className="text-amber-500 mt-1.5 font-mono text-[10px] uppercase font-bold tracking-wider animate-pulse">
                            ✗ Silent: No one can disprove!
                          </p>
                        )}
                      </div>
                    )}

                    {!autoPlayBots && (
                      <button
                        onClick={nextTurn}
                        className="mt-4 px-6 py-2.5 bg-neutral-950 border border-white/10 hover:border-emerald-500/20 text-stone-300 font-mono text-[10px] uppercase font-bold rounded-sm tracking-widest transition"
                      >
                        Step to next Turn
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* GAME PLAY LOG CONSOLE (Scroll logs) */}
              <div className="bg-neutral-900 p-4 rounded-sm border border-emerald-500/10 flex-grow flex flex-col max-h-80 min-h-[220px]">
                <div className="flex justify-between items-center mb-2 pb-1 border-b border-white/5 shrink-0">
                  <h4 className="text-xs font-bold font-serif uppercase text-emerald-400 tracking-wider">WEEDVILLE WIRE DETECTOR LOGS</h4>
                  <button
                    onClick={() => {
                      setHistoryLogs([]);
                      addLog("Logs cleared.", "system");
                    }}
                    className="text-[9px] text-stone-500 font-mono hover:text-emerald-400 uppercase tracking-widest font-bold"
                  >
                    Clear Logs
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-[11px] font-mono scrollbar-thin">
                  {historyLogs.map(log => {
                    let logColor = 'text-stone-400';
                    if (log.type === 'movement') logColor = 'text-blue-300';
                    if (log.type === 'suggestion') logColor = 'text-amber-300';
                    if (log.type === 'disproven') logColor = 'text-purple-300';
                    if (log.type === 'secret_reveal') logColor = 'text-emerald-400 bg-emerald-950/20 px-2.5 py-1 rounded-sm block border border-emerald-800/20 font-bold';
                    if (log.type === 'victory') logColor = 'text-emerald-400 bg-emerald-500/10 font-black px-2.5 py-1 rounded-sm border border-emerald-500/20 block';
                    if (log.type === 'elimination') logColor = 'text-red-400 bg-red-950/20 px-2.5 py-1 rounded-sm block border border-red-900/20';
                    if (log.type === 'system') logColor = 'text-teal-400 font-bold';

                    return (
                      <div key={log.id} className={`py-1 ${logColor} leading-relaxed flex items-start gap-1`}>
                        <span className="text-[9px] text-stone-600 shrink-0 font-bold font-mono">[{log.timestamp}]</span>
                        <span className="flex-1">{log.message}</span>
                      </div>
                    );
                  })}
                  {historyLogs.length === 0 && (
                     <p className="text-[10px] text-stone-600 italic text-center pt-8 font-serif">No logger logs captured yet...</p>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT CONTAINER (3 Cols): PLAYER CLUES & DEDUCTION LIST NOTEPAD */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              
              {/* YOUR HAND CARDS BLOCK */}
              <div className="bg-neutral-900 p-4 rounded-sm border border-emerald-500/10">
                <h3 className="text-xs font-bold font-mono uppercase text-stone-400 tracking-widest mb-2.5 pb-2 border-b border-white/5">
                  Your Seedling Hand ({players.find(p => p.isHuman)?.cards.length || 0} CARDS)
                </h3>
                <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
                  {players.find(p => p.isHuman)?.cards.map(card => (
                    <div
                      key={card.id}
                      className="px-3 py-2 rounded-sm text-xs flex items-center justify-between border bg-black/40 border-white/5"
                    >
                      <div className="flex items-center gap-2">
                        {card.type === 'suspect' ? <User className="w-3.5 h-3.5 text-stone-400" /> : card.type === 'weapon' ? <Hammer className="w-3.5 h-3.5 text-stone-400" /> : <Home className="w-3.5 h-3.5 text-stone-400" />}
                        <span className="font-bold text-white tracking-wider text-[11px] truncate max-w-[150px]">{card.name}</span>
                      </div>
                      <span className="text-[8px] font-mono px-1.5 py-0.5 bg-emerald-950/20 text-emerald-400 rounded-sm uppercase font-black tracking-widest border border-emerald-900/10 shrink-0">
                        {card.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* INTERACTIVE DEDUCTION SHEET NOTEPAD */}
              <div className="bg-neutral-900 p-4 rounded-sm border border-emerald-500/10 flex-grow flex flex-col">
                <div className="mb-3 shrink-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold font-mono uppercase text-stone-400 tracking-widest">
                      Operator Checklist
                    </h3>
                    <span className="text-[8px] font-mono bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded-sm font-black border border-emerald-900/10 uppercase tracking-widest">AUTO-SAVED</span>
                  </div>
                  <p className="text-[10px] text-stone-500 leading-normal">
                    Cycle cells to filter state: <X className="inline w-3 h-3 text-red-400" /> (Pass) → <Check className="inline w-3 h-3 text-emerald-400" /> (Guilty) → <span className="text-amber-400 font-bold font-mono font-black text-xs">?</span> (Maybe) → Default.
                  </p>

                  {/* Category Filter Tabs */}
                  <div className="flex gap-1 mt-3 bg-black/60 p-1 rounded-sm border border-white/5">
                    {(['all', 'suspect', 'weapon', 'room'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => {
                          setSelectedCardTypeFilter(tab);
                          triggerSound('step');
                        }}
                        className={`flex-1 text-[9px] py-1 font-mono uppercase font-black rounded-sm tracking-wider text-center transition cursor-pointer ${
                          selectedCardTypeFilter === tab
                            ? 'bg-emerald-950/20 text-emerald-300 border border-emerald-500/20'
                            : 'text-stone-500 hover:text-stone-300'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notepad Card Grid */}
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[300px] scrollbar-thin">
                  {allCards
                    .filter(card => selectedCardTypeFilter === 'all' || card.type === selectedCardTypeFilter)
                    .map(card => {
                      const noteState = players.find(p => p.isHuman)?.notes[card.id] ?? null;
                      const hasInHand = players.find(p => p.isHuman)?.cards.some(c => c.id === card.id);

                      return (
                        <div
                          key={card.id}
                          className={`p-2 rounded-sm flex items-center justify-between border cursor-pointer transition select-none ${
                            hasInHand 
                              ? 'bg-emerald-950/20 border-emerald-800/20 hover:border-emerald-700/30' 
                              : 'bg-black/35 border-white/5 hover:border-emerald-500/20'
                          }`}
                          onClick={() => toggleNotepadNote(card.id)}
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[12px] font-bold text-stone-200 truncate font-serif tracking-wider">{card.name}</span>
                              {hasInHand && (
                                <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-800/20 px-1 rounded-sm font-black">
                                  MINE
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-stone-500 uppercase font-mono tracking-widest block">
                              {card.type}
                            </span>
                          </div>

                          <div className="w-7 h-7 rounded-sm bg-black border border-white/5 hover:bg-stone-900 flex items-center justify-center transition shrink-0 shadow-inner">
                            {renderNoteIndicator(noteState)}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 4: GAME OVER / TRIUMPH REPORT SCREEN */}
        {gameState === 'gameover' && (
          <div className="w-full max-w-2xl mx-auto bg-neutral-900 border border-emerald-500/20 rounded-sm p-8 shadow-[0_0_50px_rgba(16,185,129,0.03)] text-center relative overflow-hidden my-8">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="mb-6">
              {isVictory ? (
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20 mx-auto shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Award className="w-8 h-8" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center border border-red-500/25 mx-auto shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  <Skull className="w-8 h-8" />
                </div>
              )}
            </div>

            <h2 className="text-3xl font-serif font-black text-white mb-2">
              {isVictory ? '🌿 Weedland Stash Secured!' : '⚠️ Secret Case Closed'}
            </h2>
            <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-6 font-bold">Endgame Case Conclusion Report</p>

            <div className="bg-black/40 p-5 rounded-sm border border-white/5 mb-8 max-w-xl mx-auto">
              <p className="text-stone-300 text-sm leading-relaxed mb-4">
                {winnerMessage}
              </p>

              {/* Reveal actual envelope solution details */}
              <h4 className="text-[10px] font-black font-mono uppercase text-emerald-500 mb-3 tracking-widest text-left border-b border-white/5 pb-2">
                📂 OPENED CONFIDENTIAL ENVELOPE CONTENTS:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-3 bg-neutral-900/50 border border-white/5 rounded-sm flex flex-col justify-between shrink-0">
                  <span className="text-[8px] font-mono text-indigo-400 uppercase font-black tracking-wider">Suspect Thief</span>
                  <span className="text-sm font-serif font-bold text-white mt-1 block tracking-tight">{caseFile?.suspect.name}</span>
                  <span className="text-[10px] text-stone-500 line-clamp-1 mt-1 font-sans">{caseFile?.suspect.description}</span>
                </div>

                <div className="p-3 bg-neutral-900/50 border border-white/5 rounded-sm flex flex-col justify-between shrink-0">
                  <span className="text-[8px] font-mono text-amber-500 uppercase font-black tracking-wider">Stolen Weapon</span>
                  <span className="text-sm font-serif font-bold text-white mt-1 block tracking-tight">{caseFile?.weapon.name}</span>
                  <span className="text-[10px] text-stone-500 line-clamp-1 mt-1 font-sans">{caseFile?.weapon.description}</span>
                </div>

                <div className="p-3 bg-neutral-900/50 border border-white/5 rounded-sm flex flex-col justify-between shrink-0">
                  <span className="text-[8px] font-mono text-emerald-400 uppercase font-black tracking-wider">Stash Location</span>
                  <span className="text-sm font-serif font-bold text-white mt-1 block tracking-tight">{caseFile?.room.name}</span>
                  <span className="text-[10px] text-stone-500 line-clamp-1 mt-1 font-sans">{caseFile?.room.description}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 mb-8 italic">
              "Every seed we rescue is a stepping stone toward Agartha and Shambala..." - Ancient Johnny Potseed Wisdom
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => {
                  triggerSound('bell');
                  setGameState('setup');
                }}
                className="px-6 py-3 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 font-serif font-black text-xs uppercase tracking-widest rounded-sm cursor-pointer"
              >
                Start New Investigation
              </button>

              <button
                onClick={() => {
                  triggerSound('vape');
                  setGameState('welcome');
                }}
                className="px-6 py-3 bg-neutral-950 border border-white/10 hover:border-emerald-500/20 text-stone-400 font-mono text-xs font-bold uppercase tracking-widest rounded-sm transition"
              >
                Back to Welcome lobby
              </button>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER METRICS INFO */}
      <footer className="border-t border-slate-900 py-4 px-6 bg-slate-950 text-center text-[11px] text-slate-500 font-mono shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Weedville/Petlandia Clue Edition. Fully Local Browser Pass & Play Session.</span>
          <span>© 1st Wave Seedlings Vault - Agartha Road Project</span>
        </div>
      </footer>

      {/* MODAL WINDOW 1: MAKE SUGGESTION (HUMAN FORM) */}
      {showSuggestModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-emerald-400" /> Make Suggestion
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono leading-relaxed">
              Based on the rules, you can only make suggestions for the Room you are currently located in:
              <span className="text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded ml-1 font-sans text-xs">
                {ROOMS.find(r => r.id === players[activePlayerIndex]?.currentRoomId)?.name}
              </span>
            </p>

            <div className="space-y-4">
              {/* Pick Suspect */}
              <div>
                <label className="block text-[11px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                  Select Suspect
                </label>
                <select
                  value={targetSuggestion.suspectId}
                  onChange={(e) => {
                    setTargetSuggestion(prev => ({ ...prev, suspectId: e.target.value }));
                    triggerSound('step');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-2.5 text-xs focus:border-emerald-500 outline-none"
                >
                  {CARDS.filter(c => c.type === 'suspect').map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              {/* Pick Weapon / Tool */}
              <div>
                <label className="block text-[11px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                  Select Weapon / Tool
                </label>
                <select
                  value={targetSuggestion.weaponId}
                  onChange={(e) => {
                    setTargetSuggestion(prev => ({ ...prev, weaponId: e.target.value }));
                    if (e.target.value === 'heavy_cowbell') {
                      triggerSound('cowbell');
                    } else if (e.target.value === 'ultra_vape') {
                      triggerSound('vape');
                    } else {
                      triggerSound('step');
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-2.5 text-xs focus:border-emerald-500 outline-none"
                >
                  {CARDS.filter(c => c.type === 'weapon').map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[10px] text-slate-500 font-mono">
                💡 <span className="text-slate-300 font-bold">Clue Rule:</span> Making a suggestion forces other players clockwise to prove you wrong if they hold any of these 3 cards in their hand!
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowSuggestModal(false);
                    triggerSound('fail');
                  }}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono rounded-lg transition"
                >
                  Cancel Suggestion
                </button>
                <button
                  onClick={submitSuggestion}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition"
                >
                  Broadcast Suggestion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL WINDOW 2: TRIBUNAL ACCUSATION CONFIRM (Winner take all!) */}
      {showAccuseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-red-400 mb-1 flex items-center gap-2">
              <Skull className="w-5 h-5" /> Assemble Tribunal Accusation
            </h3>
            <p className="text-xs text-red-500/80 font-mono mb-4 font-bold uppercase tracking-wider">
              ☢ Warning: High stakes. Win or lose the game right here!
            </p>

            <div className="space-y-4">
              {/* Select Accused Suspect */}
              <div>
                <label className="block text-[11px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1">
                  Accuse Suspect Thief
                </label>
                <select
                  value={targetAccusation.suspectId}
                  onChange={(e) => {
                    setTargetAccusation(prev => ({ ...prev, suspectId: e.target.value }));
                    triggerSound('step');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-2.5 text-xs focus:border-red-500 outline-none"
                >
                  {CARDS.filter(c => c.type === 'suspect').map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              {/* Select Weapon */}
              <div>
                <label className="block text-[11px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1">
                  Accuse Weapon / Tool
                </label>
                <select
                  value={targetAccusation.weaponId}
                  onChange={(e) => {
                    setTargetAccusation(prev => ({ ...prev, weaponId: e.target.value }));
                    triggerSound('step');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-2.5 text-xs focus:border-red-500 outline-none"
                >
                  {CARDS.filter(c => c.type === 'weapon').map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              {/* Select Room */}
              <div>
                <label className="block text-[11px] font-bold font-mono text-slate-400 uppercase tracking-widest mb-1">
                  Accuse Stash Room
                </label>
                <select
                  value={targetAccusation.roomId}
                  onChange={(e) => {
                    setTargetAccusation(prev => ({ ...prev, roomId: e.target.value }));
                    triggerSound('step');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl p-2.5 text-xs focus:border-red-500 outline-none"
                >
                  {ROOMS.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-red-950/20 rounded-xl border border-red-900/40 text-[10px] text-red-300 font-mono leading-relaxed">
                ⚖ If correct, you win immediately! If incorrect, you are permanently ELIMINATED and must spectate the remaining AI. Check your notebook twice before submitting!
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setShowAccuseModal(false);
                    triggerSound('fail');
                  }}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono rounded-lg transition"
                >
                  Retreat Showdown
                </button>
                <button
                  onClick={() => submitAccusation(targetAccusation.suspectId, targetAccusation.weaponId, targetAccusation.roomId)}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-lg transition"
                >
                  DECLARE TRIBUNAL VERDICT!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
