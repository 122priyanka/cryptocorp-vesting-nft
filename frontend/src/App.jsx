import { Routes, Route, Navigate } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";

function App() {
  return (
    <WalletProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </WalletProvider>
  );
}

export default App;
