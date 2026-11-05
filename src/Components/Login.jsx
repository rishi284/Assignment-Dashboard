import { useState } from 'react'
import loginIllustration from '../assets/login.png'
import { useNavigate } from 'react-router'
import axios from 'axios'
import toast from 'react-hot-toast'

function Login() {
    const [role, setRole] = useState('Student')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()


    const handleLogin = () => {

        const enteredEmail = email.trim().toLowerCase()
        const enteredPassword = password.trim()

        if (!enteredEmail) {
            toast.error('Please enter email or username')
            return
        }
        else if (!enteredPassword) {
            toast.error('Please enter password')
            return
        }

        if (enteredEmail.length < 4) {
            toast.error('Email must contain at least 4 characters')
            return
        }
        else if (enteredPassword.length < 4) {
            toast.error('Password must contain at least 4 characters')
            return
        }

        setLoading(true)

        // GET students
        axios.get('http://localhost:3000/students')

            .then((studentResponse) => {

                const students = studentResponse.data

                // GET admins
                return axios.get('http://localhost:3000/admins')

                    .then((adminResponse) => {

                        const admins = adminResponse.data

                        // Find email in both collections
                        const existingUser = [...students, ...admins].find(
                            (user) => user.email.toLowerCase() === enteredEmail
                        )

                        if (existingUser) {

                            if (existingUser.role !== role) {
                                toast.error('Please select the correct role')
                                return null
                            }

                            if (existingUser.password !== enteredPassword) {
                                toast.error('Incorrect password')
                                return null
                            }

                            toast.success('Login successful!')

                            return existingUser

                        }
                        else {

                            const newUser = {
                                id: `student_${Date.now()}`,
                                name: enteredEmail.split('@')[0],
                                email: enteredEmail,
                                password: enteredPassword,
                                role: role
                            }

                            const endpoint = role === 'Admin' ? 'admins' : 'students'

                            // POST new student
                            return axios.post(
                                `http://localhost:3000/${endpoint}`,
                                newUser
                            )

                                .then((createResponse) => {

                                    toast.success('Student account created!')

                                    return createResponse.data

                                })

                                .catch((error) => {

                                    console.error('Student creation error:', error)
                                    toast.error('Unable to create student account')

                                    return null

                                })

                        }

                    })

            })

            .then((currentUser) => {

                if (!currentUser) {
                    setLoading(false)
                    return
                }

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

                setLoading(false)

                if (currentUser.role === 'Student') {
                    navigate('/student-dashboard')
                }
                else {
                    navigate('/admin-dashboard')
                }

            })

            .catch((error) => {

                console.error('Login API error:', error)

                toast.error('Unable to fetch user data')

                setLoading(false)

            })
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
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
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
                            disabled={loading}
                            className="w-full bg-[#7938EB] hover:bg-[#652BD0] text-white py-3 rounded-full transition-all duration-300 font-medium cursor-pointer disabled:opacity-50"
                        >
                            {loading ? 'Logging in...' : 'Login'}
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
