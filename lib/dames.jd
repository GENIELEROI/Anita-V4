// lib/dames.js - Jeu de dames optimisé pour Anita-V4
const { cmd } = require('./commands');

// État global pour stocker les parties
let gameState = {};

// Initialisation du plateau
function initBoard() {
  const board = Array(8).fill().map(() => Array(8).fill(' '));
  
  // Placer les pions noirs (en haut)
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 8; x++) {
      if ((x + y) % 2 === 1) {
        board[y][x] = 'b'; // pion noir
      }
    }
  }
  
  // Placer les pions blancs (en bas)
  for (let y = 5; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if ((x + y) % 2 === 1) {
        board[y][x] = 'w'; // pion blanc
      }
    }
  }
  
  return {
    board,
    turn: 'w', // blancs commencent
    captures: { w: 0, b: 0 },
    moveCount: 0,
    lastMove: null,
    lastActivity: Date.now()
  };
}

// Rendu du plateau avec coordonnées
function renderBoard(game) {
  let result = "```\n";
  result += "  A B C D E F G H\n";
  
  for (let y = 0; y < 8; y++) {
    result += `${y + 1} `;
    for (let x = 0; x < 8; x++) {
      const piece = game.board[y][x];
      result += getSymbol(piece, x, y) + " ";
    }
    result += `${y + 1}\n`;
  }
  
  result += "  A B C D E F G H\n";
  result += "```";
  return result;
}

// Symboles pour les pièces
function getSymbol(piece, x, y) {
  if (piece === ' ') {
    return (x + y) % 2 === 0 ? '⬛' : '⬜';
  }
  
  switch (piece) {
    case 'w': return '⚪'; // pion blanc
    case 'b': return '⚫'; // pion noir
    case 'W': return '👑'; // dame blanche
    case 'B': return '♛'; // dame noire
    default: return '❓';
  }
}

// Conversion coordonnées en indices
function coordToIndex(coord) {
  if (!coord || coord.length !== 2) return [null, null];
  
  const x = coord.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, etc.
  const y = parseInt(coord[1]) - 1; // 1=0, 2=1, etc.
  
  if (x < 0 || x > 7 || y < 0 || y > 7) return [null, null];
  return [x, y];
}

// Vérification si le mouvement est valide
function isValidMove(game, x1, y1, x2, y2) {
  const { board, turn } = game;
  const piece = board[y1][x1];
  const dest = board[y2][x2];
  
  // Vérifications de base
  if (!piece || dest !== ' ') return false;
  if (piece.toLowerCase() !== turn) return false;
  if ((x2 + y2) % 2 === 0) return false; // cases noires seulement
  
  const dx = x2 - x1;
  const dy = y2 - y1;
  const isDame = piece.toUpperCase() === piece;
  
  // Mouvement simple (1 case diagonale)
  if (Math.abs(dx) === 1 && Math.abs(dy) === 1) {
    if (isDame) return true; // Dame peut aller partout
    return turn === 'w' ? dy === -1 : dy === 1; // Pion direction fixe
  }
  
  // Capture (2 cases diagonales)
  if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {
    const midX = x1 + dx / 2;
    const midY = y1 + dy / 2;
    const capturedPiece = board[midY][midX];
    
    if (!capturedPiece || capturedPiece === ' ') return false;
    if (capturedPiece.toLowerCase() === turn) return false; // Pas ses propres pions
    
    if (isDame) return true; // Dame peut capturer partout
    return turn === 'w' ? dy === -2 : dy === 2; // Pion direction fixe
  }
  
  return false;
}

// Effectuer le mouvement
function movePiece(game, x1, y1, x2, y2) {
  const { board } = game;
  const piece = board[y1][x1];
  const dx = x2 - x1;
  const dy = y2 - y1;
  
  // Déplacer la pièce
  board[y2][x2] = piece;
  board[y1][x1] = ' ';
  
  // Gérer la capture
  if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {
    const midX = x1 + dx / 2;
    const midY = y1 + dy / 2;
    board[midY][midX] = ' ';
    game.captures[game.turn]++;
  }
  
  // Promotion des pions
  if (piece === 'w' && y2 === 0) {
    board[y2][x2] = 'W'; // Dame blanche
  } else if (piece === 'b' && y2 === 7) {
    board[y2][x2] = 'B'; // Dame noire
  }
  
  game.moveCount++;
  game.lastMove = { from: [x1, y1], to: [x2, y2], piece };
  game.lastActivity = Date.now();
}

// Compter les pièces restantes
function countPieces(board) {
  const count = { w: 0, b: 0, W: 0, B: 0 };
  
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece !== ' ') count[piece]++;
    }
  }
  
  return count;
}

// Vérifier s'il y a un gagnant
function checkWinner(game) {
  const count = countPieces(game.board);
  const whitePieces = count.w + count.W;
  const blackPieces = count.b + count.B;
  
  if (whitePieces === 0) return 'b';
  if (blackPieces === 0) return 'w';
  
  return null;
}

// Vérifier si un joueur a des mouvements possibles
function hasValidMoves(game, player) {
  const { board } = game;
  
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece !== ' ' && piece.toLowerCase() === player) {
        // Vérifier tous les mouvements possibles pour cette pièce
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            if (dx === 0 || dy === 0 || Math.abs(dx) !== Math.abs(dy)) continue;
            
            const newX = x + dx;
            const newY = y + dy;
            
            if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
              if (isValidMove(game, x, y, newX, newY)) {
                return true;
              }
            }
          }
        }
      }
    }
  }
  
  return false;
}

// Commande principale
cmd({
  pattern: "dames",
  alias: ["d", "dame", "checkers"],
  desc: "Jeu de dames 8x8 - Capturez tous les pions adverses !",
  category: "jeux",
  react: "♟️",
  filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
  
  const chatId = from;
  
  // Initialiser le jeu s'il n'existe pas
  if (!gameState[chatId]) {
    gameState[chatId] = null;
  }
  
  const subCommand = args[0]?.toLowerCase();
  
  try {
    switch (subCommand) {
      case 'start':
      case 'nouveau':
        gameState[chatId] = initBoard();
        return reply(`♟️ *Nouvelle partie de dames !*\n\n${renderBoard(gameState[chatId])}\n\n⚪ *Tour des blancs*\n\n📝 *Utilise:* \`!d A3 B4\` pour jouer\n💡 *Objectif:* Capturer tous les pions adverses\n\n🎯 *Aide:* \`!d aide\``);
        
      case 'plateau':
      case 'board':
        if (!gameState[chatId]) {
          return reply("❌ Aucune partie en cours.\nUtilise `!d start` pour commencer.");
        }
        
        const game = gameState[chatId];
        const count = countPieces(game.board);
        const currentPlayer = game.turn === 'w' ? '⚪ Blancs' : '⚫ Noirs';
        
        return reply(`♟️ *Plateau actuel*\n\n${renderBoard(game)}\n\n🎯 *Tour:* ${currentPlayer}\n📊 *Pièces:* ⚪${count.w + count.W} vs ⚫${count.b + count.B}\n🏆 *Captures:* ⚪${game.captures.w} vs ⚫${game.captures.b}\n📈 *Coups:* ${game.moveCount}`);
        
      case 'aide':
      case 'help':
        return reply(`♟️ *Aide - Jeu de Dames*\n\n🎯 *Objectif:* Capturer tous les pions adverses\n\n📝 *Commandes:*\n• \`!d A3 B4\` - Déplacer un pion\n• \`!d plateau\` - Voir le plateau\n• \`!d start\` - Nouvelle partie\n• \`!d quit\` - Quitter\n• \`!d stats\` - Statistiques\n\n🎲 *Règles:*\n• Déplacement diagonal sur cases noires\n• Capture obligatoire par saut\n• Promotion en dame au bout\n• ⚪ Blancs commencent\n\n👑 *Symboles:*\n• ⚪ Pion blanc • ⚫ Pion noir\n• 👑 Dame blanche • ♛ Dame noire\n• ⬛ Case noire • ⬜ Case blanche`);
        
      case 'stats':
      case 'statistiques':
        if (!gameState[chatId]) {
          return reply("❌ Aucune partie en cours.\nUtilise `!d start` pour commencer.");
        }
        
        const gameStats = gameState[chatId];
        const pieceCount = countPieces(gameStats.board);
        const totalPieces = pieceCount.w + pieceCount.b + pieceCount.W + pieceCount.B;
        const currentTurn = gameStats.turn === 'w' ? '⚪ Blancs' : '⚫ Noirs';
        
        return reply(`📊 *Statistiques de la partie*\n\n🎯 *Tour actuel:* ${currentTurn}\n📈 *Nombre de coups:* ${gameStats.moveCount}\n🏆 *Captures:* ⚪${gameStats.captures.w} vs ⚫${gameStats.captures.b}\n\n👑 *Pièces restantes:*\n• ⚪ Pions blancs: ${pieceCount.w}\n• 👑 Dames blanches: ${pieceCount.W}\n• ⚫ Pions noirs: ${pieceCount.b}\n• ♛ Dames noires: ${pieceCount.B}\n\n📊 *Total:* ${totalPieces} pièces sur l'échiquier`);
        
      case 'quit':
      case 'quitter':
        if (!gameState[chatId]) {
          return reply("❌ Aucune partie en cours.");
        }
        delete gameState[chatId];
        return reply("🏁 *Partie de dames terminée !*\n\nMerci d'avoir joué ! ♟️");
        
      default:
        // Tentative de mouvement
        if (args.length === 2) {
          if (!gameState[chatId]) {
            return reply("❌ Aucune partie en cours.\nUtilise `!d start` pour commencer.");
          }
          
          const game = gameState[chatId];
          const [src, dst] = args;
          const [x1, y1] = coordToIndex(src);
          const [x2, y2] = coordToIndex(dst);
          
          // Vérifier la validité des coordonnées
          if (x1 === null || x2 === null) {
            return reply(`❌ *Coordonnées invalides !*\n\n📝 Utilise le format: \`!d A3 B4\`\n💡 Colonnes: A-H, Lignes: 1-8`);
          }
          
          // Vérifier si le mouvement est valide
          if (!isValidMove(game, x1, y1, x2, y2)) {
            const piece = game.board[y1][x1];
            const currentPlayer = game.turn === 'w' ? '⚪ Blancs' : '⚫ Noirs';
            
            if (!piece || piece === ' ') {
              return reply(`❌ *Aucune pièce en ${src} !*\n\n🎯 *Tour:* ${currentPlayer}\n\n${renderBoard(game)}`);
            }
            
            if (piece.toLowerCase() !== game.turn) {
              return reply(`❌ *Ce n'est pas votre pièce !*\n\n🎯 *Tour:* ${currentPlayer}\n\n${renderBoard(game)}`);
            }
            
            return reply(`❌ *Mouvement invalide !*\n\n📝 ${src} → ${dst} n'est pas autorisé\n🎯 *Tour:* ${currentPlayer}\n\n${renderBoard(game)}`);
          }
          
          // Effectuer le mouvement
          movePiece(game, x1, y1, x2, y2);
          
          // Vérifier s'il y a un gagnant
          const winner = checkWinner(game);
          if (winner) {
            const winnerName = winner === 'w' ? '⚪ Blancs' : '⚫ Noirs';
            const finalCount = countPieces(game.board);
            
            const response = `🏆 *${winnerName} remportent la partie !*\n\n${renderBoard(game)}\n\n📊 *Score final:*\n⚪ Blancs: ${finalCount.w + finalCount.W} pièces\n⚫ Noirs: ${finalCount.b + finalCount.B} pièces\n🏆 Captures: ⚪${game.captures.w} vs ⚫${game.captures.b}\n📈 Coups joués: ${game.moveCount}\n\n🎉 Félicitations ! 🎉`;
            
            delete gameState[chatId];
            return reply(response);
          }
          
          // Changer de joueur
          game.turn = game.turn === 'w' ? 'b' : 'w';
          const nextPlayer = game.turn === 'w' ? '⚪ Blancs' : '⚫ Noirs';
          
          // Vérifier si le joueur suivant a des mouvements possibles
          if (!hasValidMoves(game, game.turn)) {
            const currentPlayerName = game.turn === 'b' ? '⚪ Blancs' : '⚫ Noirs';
            const response = `🏆 *${currentPlayerName} remportent la partie !*\n\n${renderBoard(game)}\n\n🚫 *${nextPlayer} n'ont plus de mouvements possibles*\n\n📊 *Score final:*\n⚪ Blancs: ${countPieces(game.board).w + countPieces(game.board).W} pièces\n⚫ Noirs: ${countPieces(game.board).b + countPieces(game.board).B} pièces\n🏆 Captures: ⚪${game.captures.w} vs ⚫${game.captures.b}\n\n🎉 Victoire par blocage ! 🎉`;
            
            delete gameState[chatId];
            return reply(response);
          }
          
          // Afficher le plateau mis à jour
          const count = countPieces(game.board);
          const moveInfo = Math.abs(x2 - x1) === 2 ? ' 🎯 *Capture !*' : '';
          const response = `♟️ *Mouvement: ${src} → ${dst}*${moveInfo}\n\n${renderBoard(game)}\n\n🎯 *Tour:* ${nextPlayer}\n📊 *Pièces:* ⚪${count.w + count.W} vs ⚫${count.b + count.B}\n🏆 *Captures:* ⚪${game.captures.w} vs ⚫${game.captures.b}`;
          
          return reply(response);
        } else {
          // Commande non reconnue
          return reply(`❓ *Commande non reconnue*\n\n📝 *Utilise:*\n• \`!d aide\` - Voir l'aide\n• \`!d plateau\` - Voir le plateau\n• \`!d A3 B4\` - Déplacer un pion\n• \`!d start\` - Nouvelle partie\n• \`!d stats\` - Statistiques`);
        }
    }
  } catch (error) {
    console.error('Erreur dans le jeu de dames:', error);
    return reply('❌ Une erreur est survenue. Veuillez réessayer ou recommencer une nouvelle partie avec `!d start`.');
  }
});

// Nettoyage périodique des parties inactives (30 minutes)
setInterval(() => {
  const now = Date.now();
  const inactiveTimeout = 30 * 60 * 1000; // 30 minutes
  
  for (const [chatId, game] of Object.entries(gameState)) {
    if (game && game.lastActivity && now - game.lastActivity > inactiveTimeout) {
      delete gameState[chatId];
      console.log(`Partie de dames supprimée pour inactivité: ${chatId}`);
    }
  }
}, 5 * 60 * 1000); // Vérification toutes les 5 minutes

module.exports = { gameState };
