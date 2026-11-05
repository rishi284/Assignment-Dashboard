
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import toast from 'react-hot-toast'
const API_URL = import.meta.env.VITE_API_URL

function StudentDashboard() {

    const navigate = useNavigate()

    // Get logged-in user
    const [currentUser] = useState(() => {
        return JSON.parse(sessionStorage.getItem('currentUser') || 'null')
    })

    const [assignments, setAssignments] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Confirmation dialog state
    const [selectedAssignment, setSelectedAssignment] = useState(null)


    // Fetch student assignments and submissions
    useEffect(() => {

        if (!currentUser || currentUser.role !== 'Student') {
            navigate('/login')
            return
        }

        // GET request - Fetch all assignments
        axios.get(`${API_URL}/assignments`)

            .then((assignmentResponse) => {

                // Filter assignments assigned to the current student
                const studentAssignments = assignmentResponse.data.filter(
                    (item) => item.assignedTo === 'all'
                )

                // GET request - Fetch current student's submissions
                axios.get(`${API_URL}/submissions`, {
                    params: {
                        studentId: currentUser.id
                    }
                })

                    .then((submissionResponse) => {

                        // Match assignments with submission records
                        const updatedAssignments = studentAssignments.map((item) => {

                            const submission = submissionResponse.data.find(
                                (sub) => String(sub.assignmentId) === String(item.id)
                            )

                            return {
                                ...item,
                                status: submission ? submission.status : 'Pending',
                                submissionId: submission ? submission.id : null
                            }

                        })

                        setAssignments(updatedAssignments)
                        setLoading(false)

                    })

                    .catch((error) => {

                        console.error('Submission fetch error:', error)
                        // toast.error('Unable to fetch submissions')
                        setLoading(false)

                    })

            })

            .catch((error) => {

                console.error('Assignment fetch error:', error)
                // toast.error('Unable to fetch assignments')
                setLoading(false)

            })

    }, [currentUser, navigate])


    // Calculate assignment statistics
    const totalAssignments = assignments.length

    const submittedCount = assignments.filter(
        (item) => item.status === 'Submitted'
    ).length

    const pendingCount = totalAssignments - submittedCount

    const progress = totalAssignments === 0
        ? 0
        : Math.round((submittedCount / totalAssignments) * 100)


    // Format due date
    const formatDate = (date) => {

        if (!date) {
            return 'Not specified'
        }

        return new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })

    }


    // Logout
    const handleLogout = () => {

        sessionStorage.removeItem('currentUser')
        navigate('/login')

    }


    // Final submission confirmation
    const confirmSubmission = () => {

        if (!selectedAssignment || submitting) {
            return
        }

        setSubmitting(true)

        const submissionData = {
            assignmentId: selectedAssignment.id,
            studentId: currentUser.id,
            status: 'Submitted',
            submittedAt: new Date().toISOString()
        }

        // Check whether a submission record already exists
        const request = selectedAssignment.submissionId
            ? axios.patch(`${API_URL}/submissions/${selectedAssignment.submissionId}`, submissionData)
            : axios.post(`${API_URL}/submissions`, submissionData)

        request

            .then((response) => {

                // Update the assignment status in React state
                setAssignments((previousAssignments) =>

                    previousAssignments.map((item) =>

                        item.id === selectedAssignment.id

                            ? {
                                ...item,
                                status: 'Submitted',
                                submissionId: response.data.id
                            }

                            : item

                    )

                )

                setSelectedAssignment(null)
                setSubmitting(false)

                toast.success('Assignment submitted successfully!')

            })

            .catch((error) => {

                console.error('Submission error:', error)

                toast.error('Unable to update submission')

                setSubmitting(false)

            })

    }


    return (

        <div className="min-h-screen bg-[#F8F7FC] flex">

            {/* Sidebar */}
            <div className="hidden md:flex w-64 bg-white border-r border-zinc-100 flex-col p-6">

                <nav className="flex flex-col gap-3">

                    <a
                        href="#dashboard"
                        className="bg-[#7938EB] text-white px-4 py-3 rounded-xl font-medium"
                    >
                        ▦ Dashboard
                    </a>

                    <a
                        href="#assignments"
                        className="text-zinc-500 hover:bg-purple-50 hover:text-[#7938EB] px-4 py-3 rounded-xl transition"
                    >
                        ▤ Assignments
                    </a>

                    <a
                        href="#profile"
                        className="text-zinc-500 hover:bg-purple-50 hover:text-[#7938EB] px-4 py-3 rounded-xl transition"
                    >
                        ♙ Profile
                    </a>

                </nav>

                {/* Student profile and logout */}
                <div className="mt-auto">

                    <div id="profile" className="flex items-center gap-3 mb-6">

                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#7938EB] font-bold">
                            {currentUser?.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>

                            <h3 className="text-sm font-semibold text-zinc-700">
                                {currentUser?.name}
                            </h3>

                            <p className="text-xs text-zinc-400">
                                Student
                            </p>

                        </div>

                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full text-white text-center bg-rose-500 py-3 rounded-xl cursor-pointer"
                    >
                        Logout
                    </button>

                </div>

            </div>


            {/* Main content */}
            <main className="flex-1 p-5 sm:p-8 lg:p-10">

                {/* Mobile header */}
                <div className="flex md:hidden justify-between items-center mb-8">


                    <button
                        onClick={handleLogout}
                        className="text-sm text-white font-medium rounded-lg p-2 bg-rose-500 cursor-pointer"
                    >
                        Logout
                    </button>

                </div>


                {/* Welcome section */}
                <section
                    id="dashboard"
                    className="flex flex-wrap justify-between items-center gap-4 mb-9"
                >

                    <div>

                        <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-800">
                            Hello, {currentUser?.name}! 👋
                        </h1>

                        <p className="text-zinc-400 mt-2 text-sm">
                            Here's your assignment overview.
                        </p>

                    </div>

                    <div className="hidden sm:flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">

                        <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-[#7938EB] font-semibold">
                            {currentUser?.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>

                            <p className="text-sm font-semibold text-zinc-700">
                                {currentUser?.name}
                            </p>

                            <p className="text-xs text-zinc-400">
                                Student
                            </p>

                        </div>

                    </div>

                </section>


                {/* Statistics cards */}
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">

                        <p className="text-sm text-zinc-500">
                            Total Assignments
                        </p>

                        <h2 className="text-3xl font-bold text-[#7938EB] mt-3">
                            {totalAssignments.toString().padStart(2, '0')}
                        </h2>

                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">

                        <p className="text-sm text-zinc-500">
                            Submitted
                        </p>

                        <h2 className="text-3xl font-bold text-green-600 mt-3">
                            {submittedCount.toString().padStart(2, '0')}
                        </h2>

                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">

                        <p className="text-sm text-zinc-500">
                            Pending
                        </p>

                        <h2 className="text-3xl font-bold text-orange-500 mt-3">
                            {pendingCount.toString().padStart(2, '0')}
                        </h2>

                    </div>

                </section>


                {/* Overall progress */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 mb-9">

                    <div className="flex justify-between items-center mb-4">

                        <div>

                            <h2 className="font-semibold text-zinc-800">
                                Overall Progress
                            </h2>

                            <p className="text-sm text-zinc-400 mt-1">
                                {submittedCount} of {totalAssignments} assignments completed
                            </p>

                        </div>

                        <span className="text-xl font-bold text-[#7938EB]">
                            {progress}%
                        </span>

                    </div>

                    <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden">

                        <div
                            className="h-full bg-[#7938EB] rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />

                    </div>

                </section>


                {/* Assignments */}
                <section id="assignments">

                    <div className="flex justify-between items-center mb-5">

                        <h2 className="text-xl font-semibold text-zinc-800">
                            My Assignments
                        </h2>

                        <span className="text-sm text-zinc-400">
                            {totalAssignments} assignments
                        </span>

                    </div>


                    {/* Loading state */}
                    {loading && (

                        <div className="bg-white rounded-2xl p-12 text-center">

                            <p className="text-zinc-500">
                                Loading assignments...
                            </p>

                        </div>

                    )}


                    {/* Assignment cards */}
                    {!loading && (

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                            {assignments.map((item) => (

                                <div
                                    key={item.id}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition-all duration-300"
                                >

                                    {/* Title and status */}
                                    <div className="flex flex-wrap justify-between items-center gap-3 mb-3">

                                        <h3 className="text-lg font-semibold text-zinc-800">
                                            {item.title}
                                        </h3>

                                        <span
                                            className={`text-xs font-medium px-3 py-1.5 rounded-full ${item.status === 'Submitted'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-orange-100 text-orange-600'
                                                }`}
                                        >
                                            {item.status}
                                        </span>

                                    </div>


                                    {/* Description */}
                                    <p className="text-sm text-zinc-500 leading-6 mb-5">
                                        {item.description}
                                    </p>


                                    {/* Due date and Drive link */}
                                    <div className="flex flex-wrap justify-between items-center gap-3 border-t border-zinc-100 pt-4">

                                        <div>

                                            <p className="text-xs text-zinc-400">
                                                Due Date
                                            </p>

                                            <p className="text-sm font-medium text-zinc-700 mt-1">
                                                {formatDate(item.dueDate)}
                                            </p>

                                        </div>

                                        <a
                                            href={item.driveLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-[#7938EB] font-medium hover:underline"
                                        >
                                            Drive Link
                                        </a>

                                    </div>


                                    {/* Submission button */}
                                    {item.status === 'Pending' && (

                                        <button
                                            onClick={() => setSelectedAssignment(item)}
                                            className="w-full mt-5 bg-[#7938EB] hover:bg-[#652BD0] text-white py-3 rounded-xl font-medium text-sm transition-all duration-300"
                                        >
                                            Yes, I have submitted
                                        </button>

                                    )}

                                </div>

                            ))}

                        </div>

                    )}


                    {/* Empty state */}
                    {!loading && assignments.length === 0 && (

                        <div className="bg-white rounded-2xl p-12 text-center">

                            <h3 className="text-lg font-semibold text-zinc-700">
                                No assignments yet
                            </h3>

                            <p className="text-sm text-zinc-400 mt-2">
                                Your assigned work will appear here.
                            </p>

                        </div>

                    )}

                </section>

            </main>


            {/* Final confirmation dialog */}
            {selectedAssignment && (

                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

                    <div className="bg-white w-full max-w-md rounded-2xl p-7 shadow-2xl">


                        <h2 className="text-xl font-semibold text-zinc-800 text-center">
                            Confirm Submission
                        </h2>

                        <p className="text-sm text-zinc-500 text-center mt-3 leading-6">

                            Have you really submitted your

                            <span className="font-semibold text-zinc-700">
                                {' '}{selectedAssignment.title}
                            </span>

                            {' '}assignment?

                        </p>

                        <p className="text-xs text-orange-500 text-center mt-3">
                            Please confirm only after submitting your work.
                        </p>


                        <div className="flex gap-3 mt-7">

                            <button
                                onClick={() => setSelectedAssignment(null)}
                                disabled={submitting}
                                className="flex-1 border border-zinc-300 text-zinc-600 py-3 rounded-xl hover:bg-zinc-50 transition disabled:opacity-50"
                            >
                                Go Back
                            </button>

                            <button
                                onClick={confirmSubmission}
                                disabled={submitting}
                                className="flex-1 bg-[#7938EB] text-white py-3 rounded-xl hover:bg-[#652BD0] transition disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Confirm'}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    )
}

export default StudentDashboard
