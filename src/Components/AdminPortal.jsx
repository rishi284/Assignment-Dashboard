
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'
import toast from 'react-hot-toast'

function AdminDashboard() {

    const navigate = useNavigate()

    // Get logged-in admin
    const [currentUser] = useState(() => {
        return JSON.parse(sessionStorage.getItem('currentUser') || 'null')
    })

    // Dashboard data
    const [assignments, setAssignments] = useState([])
    const [students, setStudents] = useState([])
    const [submissions, setSubmissions] = useState([])

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Create assignment modal
    const [showCreateModal, setShowCreateModal] = useState(false)

    // Assignment form
    const [assignmentForm, setAssignmentForm] = useState({
        title: '',
        description: '',
        dueDate: '',
        driveLink: '',
    })


    // Fetch admin dashboard data
    useEffect(() => {

        if (!currentUser || currentUser.role !== 'Admin') {
            navigate('/login')
            return
        }

        Promise.all([
            axios.get('http://localhost:3000/assignments'),
            axios.get('http://localhost:3000/students'),
            axios.get('http://localhost:3000/submissions')
        ])

            .then(([assignmentResponse, studentResponse, submissionResponse]) => {

                // Get only assignments created by this admin
                const adminAssignments = assignmentResponse.data.filter(
                    (item) => String(item.createdBy) === String(currentUser.id)
                )

                // Get all students
                const allStudents = studentResponse.data

                setAssignments(adminAssignments)
                setStudents(allStudents)
                setSubmissions(submissionResponse.data)

                setLoading(false)

            })

            .catch((error) => {

                console.error('Dashboard fetch error:', error)
                toast.error('Unable to fetch dashboard data')

                setLoading(false)

            })

    }, [currentUser, navigate])


    // Calculate dashboard statistics
    const totalAssignments = assignments.length

    const totalStudents = students.length

    const totalExpected = totalAssignments * totalStudents

    const submittedCount = assignments.reduce((total, assignment) => {

        const submittedStudents = new Set(
            submissions
                .filter((submission) =>
                    String(submission.assignmentId) === String(assignment.id) &&
                    submission.status === 'Submitted' &&
                    students.some(
                        (student) => String(student.id) === String(submission.studentId)
                    )
                )
                .map((submission) => String(submission.studentId))
        )

        return total + submittedStudents.size

    }, 0)

    const pendingCount = Math.max(0, totalExpected - submittedCount)


    // Calculate individual assignment progress
    const getAssignmentProgress = (assignment) => {

        const submitted = students.filter((student) => {

            return submissions.some(
                (item) =>
                    String(item.assignmentId) === String(assignment.id) &&
                    String(item.studentId) === String(student.id) &&
                    item.status === 'Submitted'
            )

        }).length

        const total = students.length

        const percentage = total === 0
            ? 0
            : Math.round((submitted / total) * 100)

        return { submitted, total, percentage }
    }


    // Format date
    const formatDate = (date) => {

        if (!date) return 'Not specified'

        return new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })

    }


    // Handle form inputs
    const handleFormChange = (e) => {

        const { name, value } = e.target

        setAssignmentForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }))

    }


    // Reset assignment form
    const resetAssignmentForm = () => {

        setAssignmentForm({
            title: '',
            description: '',
            dueDate: '',
            driveLink: '',
        })

    }


    // Create assignment
    const handleCreateAssignment = () => {

        const {
            title,
            description,
            dueDate,
            driveLink,
        } = assignmentForm


        // Validate fields
        if (!title.trim()) {
            toast.error('Please enter assignment title')
            return
        }

        else if (!dueDate) {
            toast.error('Please select due date')
            return
        }
        else if (!driveLink.trim()) {
            toast.error('Please enter Drive link')
            return
        }



        // New assignment object
        const newAssignment = {
            title: title.trim(),
            description: description.trim(),
            dueDate,
            driveLink: driveLink.trim(),
            createdBy: currentUser.id,
            assignedTo: 'all'

        }


        setSaving(true)


        // POST request - Create assignment
        axios.post('http://localhost:3000/assignments', newAssignment)

            .then((response) => {

                // Add new assignment to dashboard
                setAssignments((previousAssignments) => [
                    ...previousAssignments,
                    response.data
                ])

                // Reset form
                resetAssignmentForm()

                setShowCreateModal(false)
                setSaving(false)

                toast.success('Assignment created successfully!')

            })

            .catch((error) => {

                console.error('Create assignment error:', error)

                toast.error('Unable to create assignment')

                setSaving(false)

            })
    }


    // Close modal
    const handleCloseModal = () => {

        if (saving) return

        setShowCreateModal(false)
        resetAssignmentForm()

    }


    // Logout
    const handleLogout = () => {

        sessionStorage.removeItem('currentUser')
        navigate('/login')

    }


    return (

        <div className="min-h-screen bg-[#F8F7FC] flex">

            {/* Sidebar */}
            <aside className="hidden md:flex w-64 bg-white border-r border-zinc-100 flex-col p-6">


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
                        ▤ Manage Assignments
                    </a>

                    <a
                        href="#students"
                        className="text-zinc-500 hover:bg-purple-50 hover:text-[#7938EB] px-4 py-3 rounded-xl transition"
                    >
                        ♙ Students
                    </a>

                </nav>


                {/* Admin profile */}
                <div className="mt-auto">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#7938EB] font-bold">
                            {currentUser?.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>

                            <h3 className="text-sm font-semibold text-zinc-700">
                                {currentUser?.name}
                            </h3>

                            <p className="text-xs text-zinc-400">
                                Admin
                            </p>

                        </div>

                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full text-left text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl transition"
                    >
                        ↪ Logout
                    </button>

                </div>

            </aside>


            {/* Main content */}
            <main className="flex-1 p-5 sm:p-8 lg:p-10">

                {/* Mobile header */}
                <div className="flex md:hidden justify-between items-center mb-8">

                    <button
                        onClick={handleLogout}
                        className="text-sm text-white bg-rose-500 p-2 rounded-lg font-medium"
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
                            Welcome back, {currentUser?.name}! 👋
                        </h1>

                        <p className="text-zinc-400 mt-2 text-sm">
                            Manage your assignments and track student progress.
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
                                Admin
                            </p>

                        </div>

                    </div>

                </section>


                {/* Statistics */}
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-9">

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">

                        <p className="text-sm text-zinc-500">
                            My Assignments
                        </p>

                        <h2 className="text-3xl font-bold text-[#7938EB] mt-3">
                            {totalAssignments.toString().padStart(2, '0')}
                        </h2>

                    </div>


                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">

                        <p className="text-sm text-zinc-500">
                            Total Students
                        </p>

                        <h2 className="text-3xl font-bold text-green-600 mt-3">
                            {totalStudents.toString().padStart(2, '0')}
                        </h2>

                    </div>


                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">

                        <p className="text-sm text-zinc-500">
                            Pending Submissions
                        </p>

                        <h2 className="text-3xl font-bold text-orange-500 mt-3">
                            {pendingCount.toString().padStart(2, '0')}
                        </h2>

                    </div>

                </section>


                {/* Assignments */}
                <section id="assignments">

                    {/* Assignment heading and create button */}
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-5">

                        <div>

                            <h2 className="text-xl font-semibold text-zinc-800">
                                My Assignments
                            </h2>

                            <p className="text-sm text-zinc-400 mt-1">
                                Manage and track your assignments
                            </p>

                        </div>


                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-[#7938EB] hover:bg-[#652BD0] text-white px-5 py-3 rounded-xl font-medium transition-all"
                        >
                            + Create Assignment
                        </button>

                    </div>


                    {/* Loading state */}
                    {loading ? (

                        <div className="bg-white rounded-2xl p-12 text-center text-zinc-500">
                            Loading assignments...
                        </div>

                    ) : assignments.length === 0 ? (

                        <div className="bg-white rounded-2xl p-12 text-center">

                            <h3 className="text-lg font-semibold text-zinc-700">
                                No assignments created yet
                            </h3>

                            <p className="text-sm text-zinc-400 mt-2">
                                Create your first assignment to get started.
                            </p>

                        </div>

                    ) : (

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                            {assignments.map((item) => {

                                const stats = getAssignmentProgress(item)

                                return (

                                    <div
                                        key={item.id}
                                        className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition-all duration-300"
                                    >

                                        <h3 className="text-lg font-semibold text-zinc-800">
                                            {item.title}
                                        </h3>

                                        <p className="text-sm text-zinc-500 leading-6 mt-3 mb-5">
                                            {item.description}
                                        </p>


                                        {/* Due date and Drive link */}
                                        <div className="flex justify-between items-center border-t border-zinc-100 pt-4">

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
                                                Drive Link ↗
                                            </a>

                                        </div>


                                        {/* Class progress */}
                                        <div className="mt-6">

                                            <div className="flex justify-between items-center mb-3">

                                                <p className="text-sm font-medium text-zinc-700">
                                                    Class Completion
                                                </p>

                                                <p className="text-sm font-semibold text-[#7938EB]">
                                                    {stats.percentage}%
                                                </p>

                                            </div>


                                            <div className="w-full h-2.5 bg-purple-100 rounded-full overflow-hidden">

                                                <div
                                                    className="h-full bg-[#7938EB] rounded-full transition-all"
                                                    style={{
                                                        width: `${stats.percentage}%`
                                                    }}
                                                />

                                            </div>


                                            <p className="text-xs text-zinc-400 mt-2">
                                                {stats.submitted} of {stats.total} students submitted
                                            </p>

                                        </div>

                                    </div>

                                )

                            })}

                        </div>

                    )}

                </section>

            </main>


            {/* Create Assignment Modal */}
            {showCreateModal && (

                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

                    <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 shadow-2xl">


                        {/* Modal heading */}
                        <div className="flex justify-between items-center mb-7">

                            <div>

                                <h2 className="text-2xl font-semibold text-zinc-800">
                                    Create Assignment
                                </h2>

                                <p className="text-sm text-zinc-400 mt-1">
                                    Add a new assignment for your students.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={saving}
                                className="text-zinc-400 hover:text-red-500 text-2xl"
                            >
                                &times;
                            </button>

                        </div>


                        {/* Assignment form */}
                        <div className="space-y-5">


                            {/* Title */}
                            <div>

                                <label className="text-sm font-medium text-zinc-700">
                                    Assignment Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={assignmentForm.title}
                                    onChange={handleFormChange}
                                    placeholder="Enter assignment title"
                                    className="w-full mt-2 px-4 py-3 border border-zinc-300 rounded-lg outline-none focus:border-[#7938EB] text-sm"
                                />

                            </div>


                            {/* Description */}
                            <div>

                                <label className="text-sm font-medium text-zinc-700">
                                    Description
                                </label>

                                <textarea
                                    rows="3"
                                    name="description"
                                    value={assignmentForm.description}
                                    onChange={handleFormChange}
                                    placeholder="Enter assignment description"
                                    className="w-full mt-2 px-4 py-3 border border-zinc-300 rounded-lg outline-none focus:border-[#7938EB] text-sm resize-none"
                                />

                            </div>


                            {/* Due date */}
                            <div>

                                <label className="text-sm font-medium text-zinc-700">
                                    Due Date
                                </label>

                                <input
                                    type="date"
                                    name="dueDate"
                                    value={assignmentForm.dueDate}
                                    onChange={handleFormChange}
                                    className="w-full mt-2 px-4 py-3 border border-zinc-300 rounded-lg outline-none focus:border-[#7938EB] text-sm"
                                />

                            </div>


                            {/* Drive link */}
                            <div>

                                <label className="text-sm font-medium text-zinc-700">
                                    Google Drive Link
                                </label>

                                <input
                                    type="url"
                                    name="driveLink"
                                    value={assignmentForm.driveLink}
                                    onChange={handleFormChange}
                                    placeholder="https://drive.google.com/..."
                                    className="w-full mt-2 px-4 py-3 border border-zinc-300 rounded-lg outline-none focus:border-[#7938EB] text-sm"
                                />

                            </div>


                            {/* Assign students */}
                            <div>

                                <label className="text-sm font-medium text-zinc-700">
                                    Assign To
                                </label>

                                <div className="mt-2 px-4 py-3 border border-zinc-300 rounded-lg bg-purple-50">

                                    <p className="text-sm font-medium text-[#7938EB]">
                                        All Students
                                    </p>

                                    <p className="text-xs text-zinc-500 mt-1">
                                        This assignment will be available to all registered students.
                                    </p>

                                </div>

                            </div>


                        </div>


                        {/* Modal buttons */}
                        <div className="flex gap-3 mt-8">

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={saving}
                                className="flex-1 border border-zinc-300 text-zinc-600 py-3 rounded-xl hover:bg-zinc-50 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                onClick={handleCreateAssignment}
                                disabled={saving}
                                className="flex-1 bg-[#7938EB] hover:bg-[#652BD0] text-white py-3 rounded-xl transition disabled:opacity-50"
                            >
                                {saving ? 'Creating...' : 'Create Assignment'}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    )

}

export default AdminDashboard
