import "./App.css";
import Game from "./components/Game";

function App() {
  return (
    <div className="App">
      <header className="bg-black p-2 white">
        <nav className="d-grid nav-grid align-items-center">
          <a
            className="hide-on-sm font-md "
            href="https://github.com/Luthin2003"
          >
            Github
          </a>
          <div className="d-flex justify-content-center">
            <h1 className="m-0">Chess</h1>
          </div>
          <a
            className="justify-self-end hide-on-sm font-md"
            href="https://www.linkedin.com/in/nithul-k-57a738233/"
          >
            Linkdin
          </a>
        </nav>
      </header>
      <Game />
    </div>
  );
}

export default App;
