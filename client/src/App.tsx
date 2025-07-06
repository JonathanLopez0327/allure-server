// front/src/App.tsx ----------------------------------------------
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import ReportViewer from "./pages/ReportViewer.tsx";


export default function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/runs/:id/*" element={<ReportViewer />} />
      </Routes>
    </BrowserRouter>
  );
}
