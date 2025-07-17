const Square = ({ piece, cssClasses, onClick, isCheck }) => {
  const style = {
    backgroundColor: isCheck ? 'rgba(255, 0, 0, 1)' : undefined,
  };

  return (
    <div className={`square ${cssClasses}`} style={style} onClick={onClick}>
      {piece && <img src={piece.image} alt="piece" />}
    </div>
  );
};


export default Square;
