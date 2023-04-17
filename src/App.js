import "./App.css";
import { Routes, Route } from "react-router-dom";

import Home from "./Components/Home";
import StartPage from "./Components/StartPage";
import MetaMemPreTut from "./Components/MetaMemPreTut";
import MetaMemTut from "./Components/MetaMemTut";
import MetaMemTask from "./Components/MetaMemTask";
import Bonus from "./Components/Bonus";
import Questionnaires from "./Components/Questionnaires";
import End from "./Components/EndPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/startPage" element={<StartPage />} />
      <Route path="MetaMemPreTut" element={<MetaMemPreTut />} />
      <Route path="MetaMemTut" element={<MetaMemTut />} />
      <Route path="MetaMemTask" element={<MetaMemTask />} />
      <Route path="Bonus" element={<Bonus />} />
      <Route path="Questionnaires" element={<Questionnaires />} />
      <Route path="End" element={<End />} />
    </Routes>
  );
}

export default App;
