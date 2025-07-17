const PlayerCard = ({ player, graveyard, current }) => {
  const displayGraveyard = () =>
    graveyard.map((piece, i) => (
      <img
        key={`${piece.name}-${i}`}
        src={piece.image}
        alt={piece.name}
        height="20px"
        width="20px"
      />
    ));

  return (
    <div className="player-card bg-white d-flex flex-column justify-content-between p-1 m-2">
      <div className="d-flex justify-content-between">
        <h2 className="m-0 capitalize">{player.color}</h2>
        <span
          className={`bg-grey p-1 white badge ${
            current === player ? "bg-blue" : "bg-grey"
          }`}
        >
          Your turn
        </span>
      </div>

      <div className="graveyard d-flex">{displayGraveyard()}</div>
    </div>
  );
};

export default PlayerCard;
