import "./App.css";
import { Routes, Route } from "react-router-dom";

import Home from "./Components/Home";
import StartPage from "./Components/StartPage";
import MetaMemTut from "./Components/MetaMemTut";
import MetaMemTask from "./Components/MetaMemTask";
import Bonus from "./Components/Bonus";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/startPage" element={<StartPage />} />
      <Route path="MetaMemTut" element={<MetaMemTut />} />
      <Route path="MetaMemTask" element={<MetaMemTask />} />
      <Route path="Bonus" element={<Bonus />} />
    </Routes>
  );
}

export default App;
