import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import CategoryGrid from "@/pages/CategoryGrid";
import ServiceDetail from "@/pages/ServiceDetail";
import BookingForm from "@/pages/BookingForm";
import LabourBuilder from "@/pages/LabourBuilder";
import ProfessionalBooking from "@/pages/ProfessionalBooking";
import JobStatus from "@/pages/JobStatus";
import WorkerDashboard from "@/pages/WorkerDashboard";
import SupplierMapPage from "@/pages/SupplierMapPage";
import Payment from "@/pages/Payment";
import SavingsSummary from "@/pages/SavingsSummary";
import SupplierManager from "@/pages/SupplierManager";
import AdminVerifications from "@/pages/AdminVerifications";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/categories" element={<CategoryGrid />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/book/:serviceId" element={
            <ProtectedRoute roles={["customer"]}><BookingForm /></ProtectedRoute>
          } />
          <Route path="/labour" element={<LabourBuilder />} />
          <Route path="/professional/:serviceId" element={
            <ProtectedRoute roles={["customer"]}><ProfessionalBooking /></ProtectedRoute>
          } />
          <Route path="/jobs/:bookingId" element={
            <ProtectedRoute><JobStatus /></ProtectedRoute>
          } />
          <Route path="/worker" element={
            <ProtectedRoute roles={["worker"]}><WorkerDashboard /></ProtectedRoute>
          } />
          <Route path="/suppliers/map" element={<SupplierMapPage />} />
          <Route path="/payment/:bookingId" element={
            <ProtectedRoute roles={["customer"]}><Payment /></ProtectedRoute>
          } />
          <Route path="/savings/:bookingId" element={
            <ProtectedRoute><SavingsSummary /></ProtectedRoute>
          } />
          <Route path="/supplier" element={
            <ProtectedRoute roles={["supplier"]}><SupplierManager /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute roles={["admin"]}><AdminVerifications /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
