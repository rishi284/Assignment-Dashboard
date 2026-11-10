
import { useState } from "react";
import loginIllustration from "../../assets/login.png";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

function Login() {
    const navigate = useNavigate();

    // Login states
    const [role, setRole] = useState("Student");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Toggle between Login and Signup
    const [showSignup, setShowSignup] = useState(false);

    // Password visibility
    const [showPassword, setShowPassword] = useState(false);

    // Signup states
    const [signupData, setSignupData] = useState({
        username: "",
        email: "",
        role: "Student",
        password: "",
        confirmPassword: "",
    });

    // Handle signup input changes
    const handleSignupChange = (e) => {
        const { name, value } = e.target;

        setSignupData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Read users from localStorage safely
    const getUsers = () => {
        const users = JSON.parse(localStorage.getItem("users") || "[]");

        return Array.isArray(users) ? users : [];
    };

    // Handle signup
    const handleSignup = (e) => {
        e.preventDefault();

        const username = signupData.username.trim();
        const enteredEmail = signupData.email.trim().toLowerCase();
        const enteredPassword = signupData.password;
        const confirmPassword = signupData.confirmPassword;

        // Validate empty fields
        if (
            !username ||
            !enteredEmail ||
            !enteredPassword ||
            !confirmPassword
        ) {
            toast.error("Please fill all fields");
            return;
        }

        // Validate password length
        if (enteredPassword.length < 6) {
            toast.error("Password must contain at least 6 characters");
            return;
        }

        // Check password confirmation
        if (enteredPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const users = getUsers();

        if (users === null) {
            return;
        }

        // Check duplicate email
        const emailExists = users.some(
            (user) => user.email?.toLowerCase() === enteredEmail
        );

        if (emailExists) {
            toast.error("Email is already registered");
            return;
        }

        // Check duplicate username
        const usernameExists = users.some(
            (user) =>
                user.username?.toLowerCase() === username.toLowerCase()
        );

        if (usernameExists) {
            toast.error("Username is already taken");
            return;
        }

        // Create new user
        const newUser = {
            id: crypto.randomUUID(),
            username: username,
            email: enteredEmail,
            password: enteredPassword,
            role: signupData.role,
        };

        // Save user in localStorage
        users.push(newUser);

        localStorage.setItem("users", JSON.stringify(users));

        toast.success("Account created successfully!");

        // Switch back to Login
        setEmail(enteredEmail);
        setRole(signupData.role);
        setPassword("");

        setSignupData({
            username: "",
            email: "",
            role: "Student",
            password: "",
            confirmPassword: "",
        });

        setShowSignup(false);
    };

    // Handle login
    const handleLogin = (e) => {
        e.preventDefault();

        const enteredEmail = email.trim().toLowerCase();
        const enteredPassword = password;

        // Validate inputs
        if (!enteredEmail) {
            toast.error("Please enter email or username");
            return;
        }

        if (!enteredPassword) {
            toast.error("Please enter password");
            return;
        }

        // Get registered users
        const users = getUsers();

        if (users === null) {
            return;
        }

        // Find user using email or username
        const existingUser = users.find(
            (user) =>
                user.email?.toLowerCase() === enteredEmail ||
                user.username?.toLowerCase() === enteredEmail
        );

        // Check whether user exists
        if (!existingUser) {
            toast.error("Account does not exist. Please sign up.");
            return;
        }

        // Validate role
        if (existingUser.role !== role) {
            toast.error("Please select the correct role");
            return;
        }

        // Validate password
        if (existingUser.password !== enteredPassword) {
            toast.error("Incorrect password");
            return;
        }

        // Generate simulated authentication token
        const simulatedToken = `joineazy_${existingUser.id}}`;

        // Store logged-in user details
        const loggedInUser = {
            id: existingUser.id,
            username: existingUser.username,
            email: existingUser.email,
            role: existingUser.role,
        };

        // Save authentication details
        localStorage.setItem(
            "currentUser",
            JSON.stringify(loggedInUser)
        );

        localStorage.setItem("authToken", simulatedToken);

        toast.success("Login successful!");

        // Navigate according to role
        if (existingUser.role === "Student") {
            navigate("/student-dashboard");
        } else if (existingUser.role === "Professor") {
            navigate("/admin-dashboard");
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#9267e3] to-[#794cc2] flex items-center justify-center p-4 sm:p-6">

            {/* Main card - shared by Login and Signup */}
            <div className="relative w-full max-w-6xl bg-white shadow-2xl grid grid-cols-1 md:grid-cols-[45%_55%] overflow-hidden min-h-162">

                {/* Left illustration - remains unchanged */}
                <div>
                    <img
                        src={loginIllustration}
                        className="h-full object-cover"
                    />
                </div>

                {/* Right panel - only this content changes */}
                <div className="px-7 sm:px-12 lg:px-16 py-8 flex flex-col justify-center">

                    <div className="w-full max-w-md mx-auto">

                        {showSignup ? (

                            // ================= SIGNUP FORM =================

                            <>
                                {/* Signup heading */}
                                <h1 className="text-3xl font-semibold text-zinc-800">
                                    Create Account
                                </h1>

                                <p className="text-sm text-zinc-400 mt-2 mb-7">
                                    Register to get started with Joineazy.
                                </p>

                                <form onSubmit={handleSignup} className="space-y-4">

                                    {/* Username */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Username
                                        </label>

                                        <input
                                            type="text"
                                            name="username"
                                            value={signupData.username}
                                            onChange={handleSignupChange}
                                            placeholder="Enter your username"
                                            className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-md outline-none focus:border-[#7938EB] text-sm"
                                            
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={signupData.email}
                                            onChange={handleSignupChange}
                                            placeholder="Enter your email"
                                            className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-md outline-none focus:border-[#7938EB] text-sm"
                                            
                                        />
                                    </div>

                                    {/* Role selection */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Register As
                                        </label>

                                        <select
                                            name="role"
                                            value={signupData.role}
                                            onChange={handleSignupChange}
                                            className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-md outline-none focus:border-[#7938EB] text-sm bg-white"
                                        >
                                            <option value="Student">Student</option>
                                            <option value="Professor">Professor</option>
                                        </select>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Password
                                        </label>

                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={signupData.password}
                                            onChange={handleSignupChange}
                                            placeholder="Create a password"
                                            className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-md outline-none focus:border-[#7938EB] text-sm"
                                            
                                        />
                                    </div>

                                    {/* Confirm password */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Confirm Password
                                        </label>

                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={signupData.confirmPassword}
                                            onChange={handleSignupChange}
                                            placeholder="Confirm your password"
                                            className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-md outline-none focus:border-[#7938EB] text-sm"
                                            
                                        />
                                    </div>

                                    {/* Show password */}
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="showPassword"
                                            checked={showPassword}
                                            onChange={(e) =>
                                                setShowPassword(e.target.checked)
                                            }
                                            className="accent-[#7938EB]"
                                        />

                                        <label
                                            htmlFor="showPassword"
                                            className="text-sm text-gray-600"
                                        >
                                            Show password
                                        </label>
                                    </div>

                                    {/* Create account button */}
                                    <button
                                        className="w-full bg-[#7938EB] hover:bg-[#652BD0] text-white py-3 rounded-full transition-all duration-300 font-medium cursor-pointer"
                                    >
                                        Create Account
                                    </button>

                                </form>

                                {/* Back to Login */}
                                <p className="text-center text-sm text-gray-500 mt-6">
                                    Already have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowSignup(false);
                                            setShowPassword(false);
                                        }}
                                        className="text-[#7938EB] font-semibold hover:underline cursor-pointer"
                                    >
                                        Login
                                    </button>
                                </p>

                            </>

                        ) : (

                            //  LOGIN FORM 

                            <>
                                {/* Login heading */}
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
                                            onClick={() => setRole("Student")}
                                            className={`flex-1 py-3 rounded-lg border text-md transition-all duration-300 font-medium
                                                        ${role === "Student"
                                                    ? "bg-[#7938EB] text-white border-[#7938EB]"
                                                    : "border-zinc-300 text-zinc-500 hover:bg-purple-200"
                                                }`}
                                        >
                                            Student
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setRole("Professor")}
                                            className={`flex-1 py-3 rounded-lg border text-md transition-all duration-300 font-medium
                                                        ${role === "Professor"
                                                    ? "bg-[#7938EB] text-white border-[#7938EB]"
                                                    : "border-zinc-300 text-zinc-500 hover:bg-purple-200"
                                                }`}
                                        >
                                            Professor
                                        </button>

                                    </div>
                                </div>

                                <form onSubmit={handleLogin}>

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
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-md outline-none focus:border-[#7938EB] text-sm"
                                            
                                        />

                                    </div>

                                    {/* Show password */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <input
                                            type="checkbox"
                                            id="loginShowPassword"
                                            checked={showPassword}
                                            onChange={(e) =>
                                                setShowPassword(e.target.checked)
                                            }
                                            className="accent-[#7938EB]"
                                        />

                                        <label
                                            htmlFor="loginShowPassword"
                                            className="text-sm text-gray-600"
                                        >
                                            Show password
                                        </label>
                                    </div>

                                    {/* Login button */}
                                    <button
                                        type="submit"
                                        className="w-full bg-[#7938EB] hover:bg-[#652BD0] text-white py-3 rounded-full transition-all duration-300 font-medium cursor-pointer"
                                    >
                                        Login
                                    </button>

                                </form>

                                {/* Switch to Signup */}
                                <p className="text-center text-sm text-gray-500 mt-7">
                                    Don't have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowSignup(true);
                                            setShowPassword(false);
                                        }}
                                        className="text-[#7938EB] font-semibold hover:underline cursor-pointer"
                                    >
                                        Sign Up
                                    </button>
                                </p>

                            </>
                        )}

                        {/* Footer */}
                        <p className="text-center text-xs text-gray-400 mt-8">
                            © 2026 Joineazy. All rights reserved.
                        </p>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
