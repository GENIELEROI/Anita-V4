// lib/carreaux.js - Jeu des carreaux pour Anita-V4
const { cmd } = require('./commands');

// État global pour stocker les parties avec gestion mémoire améliorée
let gameState = new Map();

// Configuration du jeu
const GAME_CONFIG = {
  GRID_SIZE: 5,
  WIN_SCORE: 5,
  INACTIVE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  CLEANUP_INTERVAL: 5 * 60 * 1000   // 5 minutes
};

// Initialisation du jeu
function initGame() {
  return {
    size: GAME_CONFIG.GRID_SIZE,
    grid: Array(GAME_CONFIG.GRID_SIZE).fill().map(() => Array(GAME_CONFIG.GRID_SIZE).fill(null)),
    score: { R: 0, B: 0 },
    turn: 'R',
    lastMove: null,
    moveCount: 0,
    lastActivity: Date.now(),
    startTime: Date.now()
  };
}

// Validation des coups avec vérifications renforcées
function isValidMove(game, x, y) {
  if (typeof x !== 'number' || typeof y !== 'number') return false;
  if (x < 0 || x >= game.size || y < 0 || y >= game.size) return false;
  if (game.grid[y][x] !== null) return false;
  return true;
}

// Placement du pion avec mise à jour de l'activité
function placePiece(game, x, y) {
  game.grid[y][x] = game.turn;
  game.lastMove = { x, y, player: game.turn };
  game.moveCount++;
  game.lastActivity = Date.now();
}

// Détection des carrés 2x2 avec algorithme optimisé
function checkSquares(game, x, y) {
  const player = game.turn;
  let squaresFound = 0;
  
  // Vérifier tous les carrés 2x2 possibles autour de la position
  const checkPositions = [
    [x-1, y-1], [x, y-1], [x-1, y], [x, y]
  ];
  
  for (let [topX, topY] of checkPositions) {
    // Vérifier les limites
    if (topX >= 0 && topY >= 0 && topX + 1 < game.size && topY + 1 < game.size) {
      // Vérifier si les 4 coins du carré appartiennent au joueur
      const corners = [
        [topX, topY], [topX + 1, topY], 
        [topX, topY + 1], [topX + 1, topY + 1]
      ];
      
      if (corners.every(([cx, cy]) => game.grid[cy][cx] === player)) {
        squaresFound++;
      }
    }
  }
  
  return squaresFound;
}

// Rendu du plateau avec style amélioré
function renderBoard(game) {
  let board = "```\n";
  
  // En-tête avec numéros de colonnes
  board += "   ";
  for (let i = 0; i < game.size; i++) {
    board += ` ${i}`;
  }
  board += "\n";
  
  // Ligne de séparation
  board += "  ┌";
  for (let i = 0; i < game.size; i++) {
    board += "──";
  }
  board += "┐\n";
  
  // Lignes du plateau
  for (let y = 0; y < game.size; y++) {
    board += `${y} │`;
    for (let x = 0; x < game.size; x++) {
      const cell = game.grid[y][x];
      if (cell === 'R') board += "🔴";
      else if (cell === 'B') board += "🔵";
      else board += "⚪";
      board += " ";
    }
    board += "│\n";
  }
  
  // Ligne de fermeture
  board += "  └";
  for (let i = 0; i < game.size; i++) {
    board += "──";
  }
  board += "┘\n";
  
  board += "```";
  return board;
}

// Obtenir les statistiques détaillées du jeu
function getGameStats(game) {
  const totalMoves = game.moveCount;
  const emptySpaces = game.size * game.size - totalMoves;
  const gameTime = Math.floor((Date.now() - game.startTime) / 1000);
  
  return {
    totalMoves,
    emptySpaces,
    currentPlayer: game.turn === 'R' ? '🔴' : '🔵',
    gameTime: formatTime(gameTime),
    scoreR: game.score.R,
    scoreB: game.score.B
  };
}

// Formatage du temps
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

// Analyse de la grille pour suggestions
function getHints(game) {
  const hints = [];
  const player = game.turn;
  
  for (let y = 0; y < game.size; y++) {
    for (let x = 0; x < game.size; x++) {
      if (game.grid[y][x] === null) {
        // Simuler le placement
        game.grid[y][x] = player;
        const squares = checkSquares(game, x, y);
        game.grid[y][x] = null; // Annuler la simulation
        
        if (squares > 0) {
          hints.push({ x, y, squares });
        }
      }
    }
  }
  
  return hints.sort((a, b) => b.squares - a.squares).slice(0, 3);
}

// Commande principale avec gestion d'erreurs améliorée
cmd({
  pattern: "carreaux",
  alias: ["c", "carré", "squares"],
  desc: "Jeu des carreaux - Formez des carrés 2x2 pour gagner !",
  category: "jeux",
  react: "🎮",
  filename: __filename
}, async (conn, mek, m, { from, args, reply, prefix }) => {
  
  try {
    const chatId = from;
    
    // Initialiser le jeu s'il n'existe pas
    if (!gameState.has(chatId)) {
      gameState.set(chatId, initGame());
    }
    
    const game = gameState.get(chatId);
    
    // Gestion des sous-commandes
    const subCommand = args[0]?.toLowerCase();
    
    switch (subCommand) {
      case 'start':
      case 'nouveau':
      case 'new':
        gameState.set(chatId, initGame());
        return reply(`🎮 *Nouvelle partie de carreaux !*\n\n${renderBoard(gameState.get(chatId))}\n\n🔴 *Tour du joueur Rouge*\n\n📝 *Utilise:* \`${prefix}c x y\` pour jouer\n💡 *Objectif:* Former des carrés 2x2 (${GAME_CONFIG.WIN_SCORE} points pour gagner)`);
        
      case 'plateau':
      case 'board':
      case 'show':
        const stats = getGameStats(game);
        return reply(`🎮 *Plateau actuel*\n\n${renderBoard(game)}\n\n📊 *Score:* 🔴 ${stats.scoreR} - 🔵 ${stats.scoreB}\n🎯 *Tour:* ${stats.currentPlayer}\n📈 *Coups joués:* ${stats.totalMoves}\n⚪ *Cases libres:* ${stats.emptySpaces}\n⏱️ *Temps:* ${stats.gameTime}`);
        
      case 'score':
      case 'stats':
        const gameStats = getGameStats(game);
        return reply(`📊 *Statistiques de la partie*\n\n🏆 *Score:*\n🔴 Rouge: ${game.score.R}\n🔵 Bleu: ${game.score.B}\n\n🎯 *Tour:* ${gameStats.currentPlayer}\n📈 *Coups joués:* ${gameStats.totalMoves}\n⏱️ *Temps de jeu:* ${gameStats.gameTime}\n🎲 *Objectif:* ${GAME_CONFIG.WIN_SCORE} carrés pour gagner`);
        
      case 'aide':
      case 'help':
        return reply(`🎮 *Aide - Jeu des Carreaux*\n\n🎯 *Objectif:* Former des carrés 2x2 avec vos pions\n\n📝 *Commandes:*\n• \`${prefix}c x y\` - Placer un pion\n• \`${prefix}c plateau\` - Voir le plateau\n• \`${prefix}c score\` - Voir les stats\n• \`${prefix}c hint\` - Obtenir des indices\n• \`${prefix}c start\` - Nouvelle partie\n• \`${prefix}c quit\` - Quitter\n\n🎲 *Règles:*\n• Grille ${GAME_CONFIG.GRID_SIZE}x${GAME_CONFIG.GRID_SIZE}, 2 joueurs alternent\n• +1 point par carré 2x2 formé\n• Premier à ${GAME_CONFIG.WIN_SCORE} points gagne\n• Coordonnées: x=colonne (0-${GAME_CONFIG.GRID_SIZE-1}), y=ligne (0-${GAME_CONFIG.GRID_SIZE-1})`);
        
      case 'hint':
      case 'indice':
        const hints = getHints(game);
        if (hints.length === 0) {
          return reply(`🤔 *Aucun coup gagnant immédiat*\n\n${renderBoard(game)}\n\n💭 Cherchez des positions qui complètent des carrés !`);
        }
        
        let hintText = `💡 *Indices pour ${game.turn === 'R' ? '🔴' : '🔵'}:*\n\n`;
        hints.forEach((hint, i) => {
          hintText += `${i+1}. Position (${hint.x},${hint.y}) - ${hint.squares} carré${hint.squares > 1 ? 's' : ''}\n`;
        });
        
        return reply(hintText + `\n${renderBoard(game)}`);
        
      case 'quit':
      case 'quitter':
      case 'stop':
        const finalStats = getGameStats(game);
        gameState.delete(chatId);
        return reply(`🏁 *Partie terminée !*\n\n📊 *Statistiques finales:*\n🔴 Rouge: ${finalStats.scoreR} - 🔵 Bleu: ${finalStats.scoreB}\n⏱️ Temps total: ${finalStats.gameTime}\n📈 Coups joués: ${finalStats.totalMoves}\n\nMerci d'avoir joué ! 🎮`);
        
      default:
        // Tentative de placement de pion
        if (args.length >= 2 && !isNaN(args[0]) && !isNaN(args[1])) {
          const x = parseInt(args[0]);
          const y = parseInt(args[1]);
          
          // Vérifier la validité du coup
          if (!isValidMove(game, x, y)) {
            return reply(`⛔ *Coup invalide !*\n\n❌ Position (${x},${y}) non valide ou déjà occupée\n💡 Utilisez des coordonnées entre 0 et ${game.size-1}\n\n${renderBoard(game)}`);
          }
          
          // Placer le pion
          placePiece(game, x, y);
          
          // Vérifier si des carrés sont formés
          const squaresFormed = checkSquares(game, x, y);
          if (squaresFormed > 0) {
            game.score[game.turn] += squaresFormed;
          }
          
          // Préparer la réponse
          let response = "";
          if (squaresFormed > 0) {
            response += `🎉 *${squaresFormed} carré${squaresFormed > 1 ? 's' : ''} formé${squaresFormed > 1 ? 's' : ''} !* +${squaresFormed} point${squaresFormed > 1 ? 's' : ''} pour ${game.turn === 'R' ? '🔴' : '🔵'}\n\n`;
          }
          
          // Vérifier les conditions de victoire
          if (game.score.R >= GAME_CONFIG.WIN_SCORE || game.score.B >= GAME_CONFIG.WIN_SCORE) {
            const winner = game.score.R >= GAME_CONFIG.WIN_SCORE ? '🔴 Rouge' : '🔵 Bleu';
            const finalStats = getGameStats(game);
            response += `🏆 *${winner} remporte la partie !*\n\n${renderBoard(game)}\n\n📊 *Score final:* 🔴 ${game.score.R} - 🔵 ${game.score.B}\n⏱️ *Temps total:* ${finalStats.gameTime}\n📈 *Coups joués:* ${finalStats.totalMoves}\n\n🎉 Félicitations ! 🎉`;
            gameState.delete(chatId);
            return reply(response);
          }
          
          // Vérifier si la grille est pleine (match nul)
          if (game.moveCount >= game.size * game.size) {
            const finalStats = getGameStats(game);
            response += `🤝 *Match nul !*\n\n${renderBoard(game)}\n\n📊 *Score final:* 🔴 ${game.score.R} - 🔵 ${game.score.B}\n⏱️ *Temps total:* ${finalStats.gameTime}\n\n🎲 Bonne partie !`;
            gameState.delete(chatId);
            return reply(response);
          }
          
          // Changer de joueur
          game.turn = game.turn === 'R' ? 'B' : 'R';
          
          // Afficher le plateau mis à jour
          response += `${renderBoard(game)}\n\n📊 *Score:* 🔴 ${game.score.R} - 🔵 ${game.score.B}\n🎯 *Tour:* ${game.turn === 'R' ? '🔴' : '🔵'}\n\n💡 *Astuce:* Utilisez \`${prefix}c hint\` pour des indices`;
          
          return reply(response);
        } else {
          // Commande non reconnue - afficher l'aide
          return reply(`❓ *Commande non reconnue*\n\n📝 *Commandes disponibles:*\n• \`${prefix}c aide\` - Voir l'aide complète\n• \`${prefix}c plateau\` - Voir le plateau\n• \`${prefix}c x y\` - Placer un pion\n• \`${prefix}c hint\` - Obtenir des indices\n• \`${prefix}c start\` - Nouvelle partie\n\n💡 *Exemple:* \`${prefix}c 2 3\` pour placer un pion en colonne 2, ligne 3`);
        }
    }
    
  } catch (error) {
    console.error('Erreur dans le jeu des carreaux:', error);
    return reply(`❌ *Erreur inattendue*\n\nUne erreur s'est produite. Utilisez \`${prefix}c start\` pour recommencer.`);
  }
});

// Nettoyage périodique des parties inactives avec gestion mémoire
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [chatId, game] of gameState.entries()) {
    if (now - game.lastActivity > GAME_CONFIG.INACTIVE_TIMEOUT) {
      gameState.delete(chatId);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Nettoyage carreaux: ${cleaned} partie(s) inactive(s) supprimée(s)`);
  }
}, GAME_CONFIG.CLEANUP_INTERVAL);

// Nettoyage à la fermeture du processus
process.on('exit', () => {
  clearInterval(cleanupInterval);
  gameState.clear();
});

// Export pour les tests et réutilisation
module.exports = {
  initGame,
  isValidMove,
  checkSquares,
  renderBoard,
  getGameStats,
  gameState,
  GAME_CONFIG
};
