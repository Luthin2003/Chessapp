import { useState } from "react";
import Board from "./Board";
import Square from "../models/Square";
import Pawn from "../models/Pawn";
import { cloneDeep } from "lodash";
import Rook from "../models/Rook";
import Knight from "../models/Knight";
import Bishop from "../models/Bishop";
import Queen from "../models/Queen";
import King from "../models/King";

import History from "../models/History";
import Player from "../models/Player";
import ScoreBoard from "./ScoreBoard";
import Promotion from "./Promotion";

function initializeBoard() {
  let squares = Array(64).fill(null);

  // Black pieces
  squares[0] = new Square(0, 0, new Rook("black"));
  squares[1] = new Square(0, 1, new Knight("black"));
  squares[2] = new Square(0, 2, new Bishop("black"));
  squares[3] = new Square(0, 3, new Queen("black"));
  squares[4] = new Square(0, 4, new King("black"));
  squares[5] = new Square(0, 5, new Bishop("black"));
  squares[6] = new Square(0, 6, new Knight("black"));
  squares[7] = new Square(0, 7, new Rook("black"));

  // Black pawns
  for (let pos = 8; pos <= 15; pos++) {
    squares[pos] = new Square(1, Math.abs(8 - pos) , new Pawn("black"));
  }

  let index = 16;
  for (let row = 2; row < 6; row++) {
    for (let col = 0; col < 8; col++) {
      squares[index] = new Square(row, col);
      index += 1;
    }
  }

  // White pieces
  squares[56] = new Square(7, 0, new Rook("white"));
  squares[57] = new Square(7, 1, new Knight("white"));
  squares[58] = new Square(7, 2, new Bishop("white"));
  squares[59] = new Square(7, 3, new Queen("white"));
  squares[60] = new Square(7, 4, new King("white"));
  squares[61] = new Square(7, 5, new Bishop("white"));
  squares[62] = new Square(7, 6, new Knight("white"));
  squares[63] = new Square(7, 7, new Rook("white"));

  // White pawns
  for (let pos = 48; pos <= 55; pos++) {
    squares[pos] = new Square(6, Math.abs(48 - pos), new Pawn("white"));
  }

  return squares;
}

const setPlayers = () => {
  return {
    white: new Player("white"),
    black: new Player("black"),
  };
};

function Game() {
  const [squares, setSquares] = useState(() => initializeBoard());
  const [message, setMessage] = useState("Welcome! White's turn.");
  const [players] = useState(() => setPlayers());
  const [current, setCurrent] = useState(setPlayers().white);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [whiteGraveyard, setWhiteGraveyard] = useState([]);
  const [blackGraveyard, setBlackGraveyard] = useState([]);
  const [history, setHistory] = useState(new History());
  const [check, setCheck] = useState(false);
  const [checkmate, setCheckmate] = useState(false);
  const [promotionPending, setPromotionPending] = useState(null); // { square, current }

  const pieces = (squares, color) => {
    const result = [];

    for (let i = 0; i < squares.length; i++) {
      if (squares[i].piece && squares[i].piece.color === color) {
        result.push(squares[i]);
      }
    }

    return result;
  };

  const validateMove = (selectedSquare, destinationSquare) => {
    return (
      selectedSquare.possibleMoves(squares).includes(destinationSquare.index) &&
      !isCheck(previewMove(selectedSquare, destinationSquare), current)
    );
  };

  const previewMove = (
    selectedSquare,
    destinationSquare,
    initSquares = squares
  ) => {
    const cloned = cloneDeep(initSquares);
    cloned[destinationSquare.index].piece = selectedSquare.piece;
    cloned[selectedSquare.index].piece = null;
    return cloned;
  };

  const validateSelectedSquare = (square) => {
    return square.piece?.color === current.color;
  };

  const handleClick = (squareClicked) => {
    if (validateSelectedSquare(squareClicked)) {
      selectSquare(squareClicked);
    } else if (selectedSquare && validateMove(selectedSquare, squareClicked)) {
      // console.log("hai1");
      movePiece(selectedSquare, squareClicked);
    } else if (selectedSquare && canCastle(selectedSquare, squareClicked)) {
      // console.log("hai2");
      movePiece(selectedSquare, squareClicked, { castle: true });
    } else if (selectedSquare && canEnPassant(selectedSquare, squareClicked)) {
      // console.log("hai3");
      movePiece(selectedSquare, squareClicked, { enpassant: true });
    } else if (selectedSquare) {
      // console.log("hai4");
      setMessage("You cannot move there.");
    } else {
      setMessage(`Please select one of the ${current.color} pieces to move.`);
    }
  };

  const movePiece = (selectedSquare, destinationSquare, options = {}) => {
    const newSquares = [...squares];
    const newWhiteGraveyard = [...whiteGraveyard];
    const newBlackGraveyard = [...blackGraveyard];
    const newHistory = history;
    let capture = false;
    let promotion = false;

    // Capture logic
    if (destinationSquare.piece?.color === "white") {
      newWhiteGraveyard.push(destinationSquare.piece);
      capture = true;
    } else if (destinationSquare.piece?.color === "black") {
      newBlackGraveyard.push(destinationSquare.piece);
      capture = true;
    }

    // Castling logic
    if (options.castle) {
      const rookSquare = getCastlingRook(selectedSquare, destinationSquare);
      const targetIndex =
        selectedSquare.index > destinationSquare.index
          ? destinationSquare.index + 1
          : destinationSquare.index - 1;
      newSquares[targetIndex].piece = rookSquare.piece;
      rookSquare.piece = null;
    }

    // En passant logic
    if (options.enpassant) {
      const enPassantSquare = getEnPassantPawn(
        selectedSquare,
        destinationSquare
      );
      if (enPassantSquare.piece.color === "white") {
        newWhiteGraveyard.push(enPassantSquare.piece);
      } else {
        newBlackGraveyard.push(enPassantSquare.piece);
      }
      enPassantSquare.piece = null;
      capture = true;
    }

    // Move piece
    destinationSquare.piece = selectedSquare.piece;
    selectedSquare.piece = null;
    destinationSquare.piece.hasMoved = true;

    // Promotion
    // if (promotionCheck(destinationSquare)) {
    //   promotion = true;
    //   destinationSquare.piece = new Queen(current.color);
    // }

    if (promotionCheck(destinationSquare)) {
      setPromotionPending({
        square: destinationSquare,
        selectedSquare,
        options,
        current,
        capture,
        newSquares,
        newWhiteGraveyard,
        newBlackGraveyard,
        newHistory,
      });
      return; // Stop and wait for user to choose promotion
    }
    // // Switch turn
    // const nextPlayer =
    //   current.color === "white" ? players.black : players.white;
    // // console.log(newSquares, nextPlayer);
    // const checkStatus = isCheck(newSquares, nextPlayer);
    // // console.log(checkStatus);
    // const checkmateStatus = checkStatus && isCheckmate(newSquares, nextPlayer);
    // let msg = `${nextPlayer.color}'s turn. Please select a piece to move.`;
    // if (checkmateStatus) {
    //   msg = `Checkmate! Congrats to ${current.color}. You won!`;
    // }

    // // Log history
    // newHistory.logMove({
    //   current,
    //   piece: destinationSquare.piece,
    //   move_to: destinationSquare.index,
    //   move_from: selectedSquare.index,
    //   check: checkStatus,
    //   checkmate: checkmateStatus,
    //   capture,
    //   promotion,
    //   castle: options.castle,
    //   enpassant: options.enpassant,
    // });

    // // Set state
    // setSquares(newSquares);
    // setCurrent(nextPlayer);
    // setMessage(msg);
    // setSelectedSquare(null);
    // setWhiteGraveyard(newWhiteGraveyard);
    // setBlackGraveyard(newBlackGraveyard);
    // setHistory(newHistory);
    // setCheck(checkStatus);
    // setCheckmate(checkmateStatus);

    finalizeMove(
      destinationSquare.piece,
      destinationSquare.index,
      selectedSquare.index,
      {
        newSquares,
        newWhiteGraveyard,
        newBlackGraveyard,
        newHistory,
        current,
        capture,
        options,
        promotion: false,
      }
    );
  };

  const selectSquare = (square) => {
    setMessage(`Select where to move ${square.piece.name}`);
    setSelectedSquare(square);
  };

  const isCheck = (squares, player) => {
    const kingSquare = squares.find(
      (square) => square.piece?.name === `${player.color} king`
    );

    // console.log("kingsquare", kingSquare);
    // console.log("jk", squares);
    const enemySquares = pieces(
      squares,
      player.color === "white" ? "black" : "white"
    );

    for (const enemySquare of enemySquares) {
      if (enemySquare.possibleMoves(squares).includes(kingSquare.index)) {
        return true;
      }
    }

    return false;
  };

  const isCheckmate = (squares, player) => {
    const teammates = pieces(squares, player.color);
    // console.log("check", squares);
    // console.log("teammate", teammates);

    for (const teammate of teammates) {
      const possibleMoves = teammate.possibleMoves(squares);
      // console.log(teammate.index, " , ");
      // if (teammate.index === 48) {
      //   console.log("you brute");
      //   console.log(teammate.possibleMoves);
      //   console.log(squares);
      //   console.log(possibleMoves);
      // }
      for (const move of possibleMoves) {
        const previewed = previewMove(teammate, squares[move], squares);
        if (!isCheck(previewed, player)) {
          // console.log("previewd");
          // console.log("you lucky");
          // console.log(teammate.index, " , ");
          // console.log(move);
          // console.log(previewed, player);
          return false;
        }
      }
    }

    return true;
  };

  const promotionCheck = (square) => {
    if (square.piece.className !== "Pawn") return false;

    if (square.piece.color === "black") {
      return square.row === 7;
    } else {
      return square.row === 0;
    }
  };

  const canEnPassant = (selectedSquare, destinationSquare) => {
    const enemyPawnSquare = getEnPassantPawn(selectedSquare, destinationSquare);
    const lastMove = history.lastMove();

    if (selectedSquare.piece.className !== "Pawn") return false;
    if (!selectedSquare.piece.inFifthRank(selectedSquare.index)) return false;

    const diff = selectedSquare.piece.color === "black" ? [7, 9] : [-7, -9];
    if (!diff.includes(destinationSquare.index - selectedSquare.index))
      return false;

    if (enemyPawnSquare.piece?.color === selectedSquare.piece.color)
      return false;
    if (enemyPawnSquare.piece?.className !== "Pawn") return false;
    if (lastMove.move_to !== enemyPawnSquare.index) return false;
    if (Math.abs(lastMove.move_from - lastMove.move_to) !== 16) return false;

    return true;
  };

  const canCastle = (selectedSquare, destinationSquare) => {
    if (selectedSquare.piece.className !== "King") return false;
    if (selectedSquare.piece.hasMoved) return false;

    const allowed = selectedSquare.piece.color === "black" ? [2, 6] : [58, 62];
    if (!allowed.includes(destinationSquare.index)) return false;

    if (isCheck(squares, current)) return false;

    const rookSquare = getCastlingRook(selectedSquare, destinationSquare);
    if (!rookSquare.piece || rookSquare.piece.hasMoved) return false;

    const betweenKingAndRook = squaresBetweenLocations(
      selectedSquare,
      rookSquare
    );
    if (betweenKingAndRook.some((sq) => sq.piece)) return false;

    const betweenKingAndDest = squaresBetweenLocations(
      selectedSquare,
      destinationSquare
    );
    const enemySquares = pieces(
      squares,
      current.color === "white" ? "black" : "white"
    );

    for (const enemy of enemySquares) {
      const moves = enemy.possibleMoves(squares);
      if (betweenKingAndDest.some((sq) => moves.includes(sq.index)))
        return false;
      if (moves.includes(destinationSquare.index)) return false;
    }

    return true;
  };

  const getCastlingRook = (kingSquare, castlingSquare) => {
    if (castlingSquare.index > kingSquare.index) {
      return kingSquare.piece.color === "black" ? squares[7] : squares[63];
    } else {
      return kingSquare.piece.color === "black" ? squares[0] : squares[56];
    }
  };

  const getEnPassantPawn = (selectedSquare, destinationSquare) => {
    return selectedSquare.piece.color === "black"
      ? squares[destinationSquare.index - 8]
      : squares[destinationSquare.index + 8];
  };

  const squaresBetweenLocations = (square1, square2) => {
    const squaresBetween = [];

    if (square1.index > square2.index) {
      for (let i = square2.index + 1; i < square1.index; i++) {
        squaresBetween.push(squares[i]);
      }
    } else {
      for (let i = square1.index + 1; i < square2.index; i++) {
        squaresBetween.push(squares[i]);
      }
    }

    return squaresBetween;
  };

  const handlePromotionSelect = (promotedPieceType) => {
    if (!promotionPending) return;

    const {
      square,
      selectedSquare,
      options,
      current,
      newSquares,
      newWhiteGraveyard,
      newBlackGraveyard,
      newHistory,
      capture,
    } = promotionPending;

    let promotedPiece;
    switch (promotedPieceType) {
      case "queen":
        promotedPiece = new Queen(current.color);
        break;
      case "rook":
        promotedPiece = new Rook(current.color);
        break;
      case "bishop":
        promotedPiece = new Bishop(current.color);
        break;
      case "knight":
        promotedPiece = new Knight(current.color);
        break;
      default:
        return;
    }
    square.piece = promotedPiece;

    finalizeMove(promotedPiece, square.index, selectedSquare.index, {
      newSquares,
      newWhiteGraveyard,
      newBlackGraveyard,
      newHistory,
      current,
      capture,
      options,
      promotion: true,
    });

    setPromotionPending(null); // clear after applying
  };

  const finalizeMove = (
    piece,
    toIndex,
    fromIndex,
    {
      newSquares,
      newWhiteGraveyard,
      newBlackGraveyard,
      newHistory,
      current,
      capture,
      options,
      promotion,
    }
  ) => {
    const nextPlayer =
      current.color === "white" ? players.black : players.white;
    const checkStatus = isCheck(newSquares, nextPlayer);
    // console.log("check karoo");
    // console.log(checkStatus);
    const checkmateStatus = checkStatus && isCheckmate(newSquares, nextPlayer);

    let msg = `${nextPlayer.color}'s turn. Please select a piece to move.`;
    if (checkmateStatus) {
      msg = `Checkmate! Congrats to ${current.color}. You won!`;
    }

    newHistory.logMove({
      current,
      piece,
      move_to: toIndex,
      move_from: fromIndex,
      check: checkStatus,
      checkmate: checkmateStatus,
      capture,
      promotion,
      castle: options.castle,
      enpassant: options.enpassant,
    });

    setSquares(newSquares);
    setCurrent(nextPlayer);
    setMessage(msg);
    setSelectedSquare(null);
    setWhiteGraveyard(newWhiteGraveyard);
    setBlackGraveyard(newBlackGraveyard);
    setHistory(newHistory);
    setCheck(checkStatus);
    setCheckmate(checkmateStatus);
  };

  // const handlePromotionSelect = (pieceType) => {
  //   // if (!promotionPending) return;
  //   // const { square, selectedSquare, options, current } = promotionPending;
  //   console.log(pieceType)

  //   let promotedPiece;
  //   switch (pieceType) {
  //     case "queen":
  //       promotedPiece = new Queen(current.color);
  //       break;
  //     case "rook":
  //       promotedPiece = new Rook(current.color);
  //       break;
  //     case "bishop":
  //       promotedPiece = new Bishop(current.color);
  //       break;
  //     case "knight":
  //       promotedPiece = new Knight(current.color);
  //       break;
  //     default:
  //       return;
  //   }

  //   promotedPiece.hasMoved = true;
  //   setPromotionPending(null); // Clear modal
  //   // movePieceFinishAfterPromotion(square, selectedSquare, promotedPiece, options, current);
  // };

  return (
    <main className="container vw-100 vh-100">
      <ScoreBoard
        players={players}
        current={current}
        moves={history.moves}
        whiteGraveyard={whiteGraveyard}
        blackGraveyard={blackGraveyard}
      />
      <Board
        squares={squares}
        checkmate={checkmate}
        message={message}
        selectedSquare={selectedSquare}
        lastMove={history.lastMove()}
        onClick={handleClick}
        check={check}
        current={current}
      />

      {promotionPending && <Promotion onSelect={handlePromotionSelect} />}
    </main>
  );
}

export default Game;
