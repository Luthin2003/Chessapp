import Square from "./Square";

const Board = ({
  squares,
  lastMove,
  selectedSquare,
  onClick,
  checkmate,
  message,
  check,
  current,
}) => {
  const kingIndexInCheck = check
    ? squares.findIndex(
        (sq) =>
          sq.piece &&
          sq.piece.constructor.name === "King" &&
          sq.piece.color === current.color // king in check is the opponent's
      )
    : -1;

  const renderSquare = (square) => {
    let cssClasses = square.bgColor;

    if (
      lastMove?.move_from === square.index ||
      lastMove?.move_to === square.index
    ) {
      cssClasses = "bg-orange";
    } else if (selectedSquare?.piece === square.piece) {
      cssClasses += " border-blue";
    }

    if (checkmate) {
      return (
        <Square
          key={square.index}
          piece={square.piece}
          cssClasses={cssClasses}
        />
      );
    } else {
      return (
        <Square
          key={square.index}
          piece={square.piece}
          cssClasses={cssClasses}
          onClick={() => onClick(square)}
          isCheck={square.index === kingIndexInCheck}
        />
      );
    }
  };

  let displayedBoard = [];
  let index = 0;

  for (let x = 0; x < 8; x++) {
    let boardRow = [];
    for (let y = 0; y < 8; y++) {
      boardRow.push(renderSquare(squares[index]));
      index += 1;
    }
    displayedBoard.push(
      <div className="row" key={x}>
        {boardRow}
      </div>
    );
  }

  return (
    <div className="board my-2">
      {displayedBoard}
      <p>{message}</p>
      {checkmate && <a href="/">Play again?</a>}
    </div>
  );
};

export default Board;
