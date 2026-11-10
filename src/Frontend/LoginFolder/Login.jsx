import { useState } from 'react'
import loginIllustration from '../../assets/login.png'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'

function Login() {

    const [role, setRole] = useState('Student')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const navigate = useNavigate()

    // Handle login
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

        // Get registered users
        const users = JSON.parse(
            localStorage.getItem('users') || '[]'
        )

        // Find user using email or username
        const existingUser = users.find(
            (user) =>
                user.email.toLowerCase() === enteredEmail ||
                user.username.toLowerCase() === enteredEmail
        )

        // Check whether user exists
        if (!existingUser) {
            toast.error('Account does not exist. Please sign up.')
            return
        }

        // Validate role
        if (existingUser.role !== role) {
            toast.error('Please select the correct role')
            return
        }

        // Validate password
        if (existingUser.password !== enteredPassword) {
            toast.error('Incorrect password')
            return
        }

        // Generate simulated authentication token
        const simulatedToken = `joineazy_${existingUser.id}_${Date.now()}`

        // Store logged-in user details
        const loggedInUser = {
            id: existingUser.id,
            username: existingUser.username,
            email: existingUser.email,
            role: existingUser.role
        }

        localStorage.setItem(
            'currentUser',
            JSON.stringify(loggedInUser)
        )

        localStorage.setItem(
            'authToken',
            simulatedToken
        )

        toast.success('Login successful!')

        // Navigate according to role
        if (existingUser.role === 'Student') {
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

                        {/* Heading */}
                        <h1 className="text-3xl font-semibold text-zinc-800">
                            Welcome Back!
                        </h1>

                        <p className="text-sm text-zinc-400 mt-2 mb-7">
                            Login to continue to Joineazy.
                        </p>

                        {/* Role selection */}
                        <div className="mb-7">

                            <label className="text-2xl font-medium">
                                Login as
                            </label>

                            <div className="flex gap-3 mt-3">

                                <button
                                    type="button"
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
                                    type="button"
                                    onClick={() => setRole('Professor')}
                                    className={`flex-1 py-3 rounded-lg border text-md transition-all duration-300 font-medium
                                        ${role === 'Professor'
                                            ? 'bg-[#7938EB] text-white border-[#7938EB]'
                                            : 'border-zinc-300 text-zinc-500 hover:bg-purple-200'
                                        }`}
                                >
                                    Professor
                                </button>

                            </div>

                        </div>

                        {/* Email or Username */}
                        <div className="my-5">

                            <label className="text-sm font-medium text-gray-700">
                                Email or Username
                            </label>

                            <input
                                type="text"
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

                        {/* Login button */}
                        <button
                            type="button"
                            onClick={handleLogin}
                            className="w-full bg-[#7938EB] hover:bg-[#652BD0] text-white py-3 rounded-full transition-all duration-300 font-medium cursor-pointer"
                        >
                            Login
                        </button>

                        {/* Signup navigation */}
                        <p className="text-center text-sm text-gray-500 mt-7">

                            Don't have an account?

                            <button
                                type="button"
                                onClick={() => navigate('/signup')}
                                className="text-[#7938EB] font-semibold ml-1 hover:underline"
                            >
                                Sign up
                            </button>

                        </p>

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
