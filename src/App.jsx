import { Routes, Route, Navigate } from 'react-router'
import Login from './Frontend/LoginFolder/Login'
import StudentDashboard from "./Frontend/StudentDashboard/StudentPortal";
import AdminDashboard from "./Frontend/AdminDashboard/AdminPortal";
import { Toaster } from 'react-hot-toast'

function App() {

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000
                }}
            />
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Routes>

        </>
    )
}

export default App
