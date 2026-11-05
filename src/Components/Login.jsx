import { useState } from 'react'
import loginIllustration from '../assets/login.png'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'

function Login() {
    const [role, setRole] = useState('Student')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()


    const handleLogin = () => {

        const enteredEmail = email.trim().toLowerCase()
        const enteredPassword = password.trim()

        // Validate inputs
        if (!enteredEmail) {
            toast.error('Please enter email or username')
            return
        }

        if (!enteredPassword) {
            toast.error('Please enter password')
            return
        }

        if (enteredEmail.length < 4) {
            toast.error('Email must contain at least 4 characters')
            return
        }

        if (enteredPassword.length < 4) {
            toast.error('Password must contain at least 4 characters')
            return
        }

        // Get existing users from localStorage
        const students = JSON.parse(
            localStorage.getItem('students') || '[]'
        )

        const admins = JSON.parse(
            localStorage.getItem('admins') || '[]'
        )

        // Find user in both collections
        const existingUser = [...students, ...admins].find(
            (user) => user.email.toLowerCase() === enteredEmail
        )

        let currentUser

        if (existingUser) {

            // Check selected role
            if (existingUser.role !== role) {
                toast.error('Please select the correct role')
                return
            }

            // Check password
            if (existingUser.password !== enteredPassword) {
                toast.error('Incorrect password')
                return
            }

            currentUser = existingUser

            toast.success('Login successful!')

        }
        else {

            // Create new user
            const newUser = {
                id: `${role.toLowerCase()}_${Date.now()}`,
                name: enteredEmail.split('@')[0],
                email: enteredEmail,
                password: enteredPassword,
                role: role
            }

            // Save user according to selected role
            if (role === 'Admin') {

                admins.push(newUser)

                localStorage.setItem(
                    'admins',
                    JSON.stringify(admins)
                )

            }
            else {

                students.push(newUser)

                localStorage.setItem(
                    'students',
                    JSON.stringify(students)
                )

            }

            currentUser = newUser

            toast.success(`${role} account created!`)

        }

        // Store logged-in user
        const loggedInUser = {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role
        }

        sessionStorage.setItem(
            'currentUser',
            JSON.stringify(loggedInUser)
        )

        // Navigate according to role
        if (currentUser.role === 'Student') {
            navigate('/student-dashboard')
        }
        else {
            navigate('/admin-dashboard')
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#9267e3] to-[#794cc2] flex items-center justify-center p-4 sm:p-6">

            {/* Main login card */}
            <div className="relative w-full max-w-6xl bg-white shadow-2xl grid grid-cols-1 md:grid-cols-[45%_55%] overflow-hidden min-h-162">

                {/* Left illustration panel */}
                <div>

                    <img
                        src={loginIllustration}
                        alt="Login illustration"
                        className="w-full h-full"
                    />

                </div>

                {/* Right login panel */}
                <div className="px-7 sm:px-12 lg:px-16 py-8 flex flex-col justify-center">

                    <div className="w-full max-w-md mx-auto">



                        {/* Role selection */}
                        <div className="mb-7">
                            <label className="text-2xl font-medium">
                                Login as
                            </label>

                            <div className="flex gap-3 mt-3 *:cursor-pointer">

                                <button
                                    onClick={() => setRole('Student')}
                                    className={`flex-1 py-3 rounded-lg border text-md transition-all duration-300 font-medium 
                                        ${role === 'Student'
                                            ? 'bg-[#7938EB] text-white border-[#7938EB]'
                                            : 'border-zinc-300 text-zinc-500 hover:bg-purple-200'
                                        }`}
                                >
                                    Student
                                </button>

                                <button
                                    onClick={() => setRole('Admin')}
                                    className={`flex-1 py-3 rounded-lg border text-md transition-all duration-300 font-medium
                                        ${role === 'Admin'
                                            ? 'bg-[#7938EB] text-white border-[#7938EB]'
                                            : 'border-zinc-300 text-zinc-500 hover:bg-purple-200'
                                        }`}
                                >
                                    Admin
                                </button>

                            </div>
                        </div>

                        {/* Email */}
                        <div className="my-5">
                            <label className="text-sm font-medium text-gray-700">
                                Email or Username
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email or username"
                                className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-md outline-none focus:border-[#7938EB] text-sm"
                            />
                        </div>

                        {/* Password */}
                        <div className="my-4">
                            <label className="text-sm font-medium text-gray-700">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-md outline-none focus:border-[#7938EB] text-sm"
                            />
                        </div>

                        <div className="text-right mb-7 *:cursor-pointer">
                            <button className="text-sm text-[#7938EB] hover:underline">
                                Forgot password?
                            </button>
                        </div>

                        {/* Login button */}
                        <button
                            type="button"
                            onClick={handleLogin}
                            className="w-full bg-[#7938EB] hover:bg-[#652BD0] text-white py-3 rounded-full transition-all duration-300 font-medium cursor-pointer"
                        >
                            Login
                        </button>

                        <p className="text-center text-xs text-gray-400 mt-8">
                            © 2026 Joineazy. All rights reserved.
                        </p>

                    </div>
                </div>

            </div>
        </div>
    )
}

export default Login
