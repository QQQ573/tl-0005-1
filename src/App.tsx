import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Editor } from "@/pages/Editor";
import { Player } from "@/pages/Player";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Editor />} />
        <Route path="/player" element={<Player />} />
      </Routes>
    </Router>
  );
}
