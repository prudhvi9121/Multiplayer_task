import PlayerCount from "./components/PlayerCount";
import Grid from "./components/Grid";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Multiplayer Unicode Canvas</h1>
        <p className="app__subtitle">
          Drop your favorite Unicode glyphs onto a shared 10×10 canvas and watch
          it evolve as other players join in real time.
        </p>
        <PlayerCount />
      </header>

      <main className="app__content">
        <section className="app__board">
          <Grid />
        </section>
        
      </main>
    </div>
  );
}

export default App;
