import "./App.css";
import { Routes, Route } from "react-router-dom";

import Home from "./Components/Home";
import StartPage from "./Components/StartPage";
import MemPreTut from "./Components/MemPreTut";
import MemTut from "./Components/MemTut";
import MemTask from "./Components/MemTask";
import Bonus from "./Components/Bonus";
import Questionnaires from "./Components/Questionnaires";
import EndPage from "./Components/EndPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="StartPage" element={<StartPage />} />
      <Route path="MemPreTut" element={<MemPreTut />} />
      <Route path="MemTut" element={<MemTut />} />
      <Route path="MemTask" element={<MemTask />} />
      <Route path="Bonus" element={<Bonus />} />
      <Route path="Questionnaires" element={<Questionnaires />} />
      <Route path="End" element={<EndPage />} />
    </Routes>
  );
}

export default App;
