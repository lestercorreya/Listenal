import "./App.css";
import Home from "./components/home.js";
import Chat from "./components/chat.js";
import Trial from "./components/trial.js";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { UsernameProvider } from "./UsernameContext";

function App() {
  return (
    <UsernameProvider>
      <div className="App">
        <Router>
          <Switch>
            <Route exact path="/" component={Home} />
            {/* <Route exact path="/chat" component={Chat} /> */}
            <Route exact path="/chat" component={Trial} />
          </Switch>
        </Router>
      </div>
    </UsernameProvider>
  );
}

export default App;
