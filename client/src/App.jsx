import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DataEntry from "./pages/DataEntry";
import Visualisation from "./pages/Visualisation";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import Contact from "./pages/Contact";
import AdminMessages from "./pages/AdminMessages";
import UserManual from "./pages/UserManual";
import CropRecords from "./pages/CropRecords";
import Error from "./pages/Error";
import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";


function App() {
  const { isAdmin } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/data-entry" element={<DataEntry />} />
          <Route path="/visualisation" element={<Visualisation />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/manual" element={<UserManual />} />
          <Route path="/records" element={<CropRecords />} />
          <Route
            path="/admin"
            element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/users"
            element={isAdmin ? <UserManagement /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/messages"
            element={isAdmin ? <AdminMessages /> : <Navigate to="/" />}
          />
          <Route path="*" element={<Error />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
