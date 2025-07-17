import PlayerCard from "./PlayerCard";

const ScoreBoard = ({
  players,
  current,
  moves,
  whiteGraveyard,
  blackGraveyard,
}) => {
  const displayMoveList = (moves) => {
    const moveList = [];
    for (let i = 0; i < moves.length; i++) {
      const whiteMove = moves[i];
      let blackMove = null;

      if (i !== moves.length - 1) {
        i += 1;
        blackMove = moves[i];
      }

      moveList.push(
        <li key={i}>
          <div className="move-description">
            <span>{whiteMove.notation}</span>
            <span>{blackMove?.notation}</span>
          </div>
        </li>
      );
    }
    return moveList;
  };

  return (
    <section className="scoreboard h-100 d-flex flex-column justify-content-between">
      <PlayerCard
        player={players["black"]}
        current={current}
        graveyard={whiteGraveyard}
      />
      <div className="h-100 p-2">
        <div className="move-history bg-white h-100 scrollable">
          <ol className="d-inline-block">{displayMoveList(moves)}</ol>
        </div>
      </div>
      <PlayerCard
        player={players["white"]}
        current={current}
        graveyard={blackGraveyard}
      />
    </section>
  );
};

export default ScoreBoard;
