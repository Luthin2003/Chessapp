import React from "react";

const PromotionModal = ({ onSelect }) => {
  const containerStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  };

  const modalStyle = {
    background: "#fff",
    padding: "1.5rem 2rem",
    borderRadius: "8px",
    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
    textAlign: "center",
    maxWidth: "400px",
  };

  const optionsStyle = {
    marginTop: "1rem",
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  };

  const imageStyle = {
    width: "60px",
    height: "60px",
    cursor: "pointer",
  };

  return (
    <div style={containerStyle}>
      <div style={modalStyle}>
        <h3>Select a piece to promote:</h3>
        <div style={optionsStyle}>
          <img
            src="./assets/queen-black.png"
            alt="Queen"
            onClick={() => onSelect("queen")}
            style={imageStyle}
          />
          <img
            src="./assets/rook-black.png"
            alt="Rook"
            onClick={() => onSelect("rook")}
            style={imageStyle}
          />
          <img
            src="./assets/bishop-black.png"
            alt="Bishop"
            onClick={() => onSelect("bishop")}
            style={imageStyle}
          />
          <img
            src="./assets/knight-black.png"
            alt="Knight"
            onClick={() => onSelect("knight")}
            style={imageStyle}
          />
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
