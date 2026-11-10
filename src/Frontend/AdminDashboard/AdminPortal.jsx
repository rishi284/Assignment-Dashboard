
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

import AdminOverview from "./AdminOverview";

import AdminCourseAssignments from "./CourseAssignment";

import {
    AdminCourseModal,
    AdminAssignmentModal,
    AdminDeleteModal
} from "./CourseManagment";

function AdminPortal() {
    const navigate = useNavigate();


    // Logged-in professor


    const [currentUser] = useState(() => {
        return JSON.parse(localStorage.getItem("currentUser") || "null");
    });

    const professorName =
        currentUser?.username ||
        currentUser?.name ||
        currentUser?.email ||
        "Professor";


    // Application data


    const [courses, setCourses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [students, setStudents] = useState([]);
    const [groups, setGroups] = useState([]);
    const [submissions, setSubmissions] = useState([]);

    const [loading, setLoading] = useState(true);


    // Navigation


    const [selectedCourseId, setSelectedCourseId] = useState(null);

    const selectedCourse = courses.find(
        (course) => String(course.id) === String(selectedCourseId)
    );



    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);

    const [editingAssignment, setEditingAssignment] = useState(null);
    const [deletingAssignment, setDeletingAssignment] = useState(null);


    // Load data and authenticate


    useEffect(() => {
        const token = localStorage.getItem("authToken");

        if (!currentUser || currentUser.role !== "Professor" || !token) {
            navigate("/login");
            return;
        }

        const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const allCourses = JSON.parse(localStorage.getItem("courses") || "[]");
        const allAssignments = JSON.parse(localStorage.getItem("assignments") || "[]");
        const allGroups = JSON.parse(localStorage.getItem("groups") || "[]");
        const allSubmissions = JSON.parse(localStorage.getItem("submissions") || "[]");

        // Get only this professor's courses
        const professorCourses = allCourses.filter(
            (course) =>
                String(course.professorId ?? course.createdBy) ===
                String(currentUser.id)
        );

        const professorCourseIds = professorCourses.map(
            (course) => String(course.id)
        );

        // Get assignments belonging to this professor
        const professorAssignments = allAssignments.filter(
            (assignment) =>
                String(assignment.createdBy) === String(currentUser.id) ||
                professorCourseIds.includes(String(assignment.courseId))
        );

        setStudents(allUsers.filter((user) => user.role === "Student"));
        setCourses(professorCourses);
        setAssignments(professorAssignments);
        setGroups(allGroups);
        setSubmissions(allSubmissions);

        setLoading(false);
    }, [currentUser, navigate]);


    // Course helper functions


    const getCourseStudents = (course) => {
        if (!course) return [];

        // All current and future students can access this course
        if (course.enrollAllStudents === true) {
            return students;
        }

        const studentIds =
            course.studentIds ??
            course.enrolledStudentIds ??
            course.assignedStudentIds;

        if (studentIds == null) {
            return students;
        }

        return students.filter((student) =>
            studentIds.map(String).includes(String(student.id))
        );
    };

    const getGroupMemberIds = (group) => {
        let memberIds = [];

        if (group.memberIds) {
            memberIds = [...group.memberIds];
        } else if (group.members) {
            memberIds = group.members.map((member) =>
                member && typeof member === "object"
                    ? member.id ?? member.studentId
                    : member
            );
        }

        if (group.leaderId) {
            memberIds.push(group.leaderId);
        }

        return [...new Set(memberIds.filter(Boolean).map(String))];
    };

    const getCourseGroups = (courseId) => {
        return groups.filter(
            (group) => String(group.courseId) === String(courseId)
        );
    };

    const getStudentName = (studentId) => {
        const student = students.find(
            (item) => String(item.id) === String(studentId)
        );

        return (
            student?.username ||
            student?.name ||
            student?.email ||
            "Student"
        );
    };

    const isAcknowledged = (submission) => {
        return (
            submission?.status === "Submitted" ||
            submission?.status === "Acknowledged" ||
            Boolean(submission?.acknowledgedAt)
        );
    };


    // Assignment progress calculation


    const getAssignmentProgress = (assignment) => {
        const isGroupAssignment =
            String(assignment.submissionType).toLowerCase() === "group";

        // Group assignment progress
        if (isGroupAssignment) {
            const courseGroups = getCourseGroups(assignment.courseId);

            const acknowledgedGroupIds = new Set(
                submissions
                    .filter(
                        (submission) =>
                            String(submission.assignmentId) === String(assignment.id) &&
                            submission.groupId &&
                            isAcknowledged(submission)
                    )
                    .map((submission) => String(submission.groupId))
            );

            const submittedEntries = courseGroups
                .filter((group) =>
                    acknowledgedGroupIds.has(String(group.id))
                )
                .map((group) => ({
                    id: group.id,
                    name: group.name || "Unnamed Group",
                    leader: getStudentName(group.leaderId),
                    memberCount: getGroupMemberIds(group).length,
                }));

            const pendingEntries = courseGroups
                .filter(
                    (group) =>
                        !acknowledgedGroupIds.has(String(group.id))
                )
                .map((group) => ({
                    id: group.id,
                    name: group.name || "Unnamed Group",
                    leader: getStudentName(group.leaderId),
                    memberCount: getGroupMemberIds(group).length,
                }));

            const total = courseGroups.length;
            const submitted = submittedEntries.length;

            return {
                submitted,
                total,
                pending: total - submitted,
                percentage:
                    total === 0
                        ? 0
                        : Math.round((submitted / total) * 100),
                unit: "groups",
                submittedEntries,
                pendingEntries,
            };
        }

        // Individual assignment progress
        const course = courses.find(
            (item) => String(item.id) === String(assignment.courseId)
        );

        const courseStudents = getCourseStudents(course);

        const acknowledgedStudentIds = new Set(
            submissions
                .filter(
                    (submission) =>
                        String(submission.assignmentId) === String(assignment.id) &&
                        submission.studentId &&
                        isAcknowledged(submission)
                )
                .map((submission) => String(submission.studentId))
        );

        const submittedEntries = courseStudents.filter((student) =>
            acknowledgedStudentIds.has(String(student.id))
        );

        const pendingEntries = courseStudents.filter(
            (student) =>
                !acknowledgedStudentIds.has(String(student.id))
        );

        const total = courseStudents.length;
        const submitted = submittedEntries.length;

        return {
            submitted,
            total,
            pending: total - submitted,
            percentage:
                total === 0
                    ? 0
                    : Math.round((submitted / total) * 100),
            unit: "students",
            submittedEntries,
            pendingEntries,
        };
    };


    // Dashboard statistics


    const totalCourses = courses.length;

    const totalAssignments = assignments.length;

    const totalStudents = students.length;

    const overallStats = {
        expected: 0,
        submitted: 0
    };

    for (let i = 0; i < assignments.length; i++) {
        const stats = getAssignmentProgress(assignments[i]);

        overallStats.expected += stats.total;
        overallStats.submitted += stats.submitted;
    }

    const pendingCount = Math.max(
        0,
        overallStats.expected - overallStats.submitted
    );

    const overallProgress =
        overallStats.expected === 0
            ? 0
            : Math.round(
                (overallStats.submitted / overallStats.expected) * 100
            );

    const dashboardStats = {
        totalCourses,
        totalAssignments,
        totalStudents,
        pendingCount,
        overallProgress,
        submittedCount: overallStats.submitted,
        expectedCount: overallStats.expected,
    };


    // Course card statistics


    const courseStats = {};

    courses.forEach((course) => {
        const courseAssignments = assignments.filter(
            (assignment) =>
                String(assignment.courseId) === String(course.id)
        );

        let courseExpected = 0;
        let courseSubmitted = 0;

        for (let i = 0; i < courseAssignments.length; i++) {
            const stats = getAssignmentProgress(courseAssignments[i]);

            courseExpected += stats.total;
            courseSubmitted += stats.submitted;
        }

        courseStats[course.id] = {
            assignmentCount: courseAssignments.length,
            studentCount: getCourseStudents(course).length,
            groupCount: getCourseGroups(course.id).length,
            progress:
                courseExpected === 0
                    ? 0
                    : Math.round((courseSubmitted / courseExpected) * 100),
        };
    });


    // Create course


    const handleCreateCourse = (courseData) => {
        const name = courseData.name.trim();

        if (!name) {
            toast.error("Please enter course name");
            return false;
        }

        const allCourses = JSON.parse(
            localStorage.getItem("courses") || "[]"
        );

        const duplicateCourse = allCourses.some(
            (course) =>
                String(course.professorId ?? course.createdBy) ===
                String(currentUser.id) &&
                course.name?.toLowerCase() === name.toLowerCase()
        );

        if (duplicateCourse) {
            toast.error("You already created a course with this name");
            return false;
        }

        const newCourse = {
            id: crypto.randomUUID(),
            name,
            code: courseData.code.trim(),
            description: courseData.description.trim(),
            professorId: currentUser.id,
            createdBy: currentUser.id,

            // All registered and future students can access this course
            enrollAllStudents: true,

        };

        const updatedCourses = [...allCourses, newCourse];

        localStorage.setItem("courses", JSON.stringify(updatedCourses));

        setCourses((previous) => [...previous, newCourse]);
        setShowCourseModal(false);

        toast.success("Course created successfully!");

        return true;
    };


    // Save assignment


    const handleSaveAssignment = (formData) => {
        const title = formData.title.trim();
        const description = formData.description.trim();
        const deadline = formData.deadline;
        const oneDriveLink = formData.oneDriveLink.trim();

        if (!title) {
            toast.error("Please enter assignment title");
            return false;
        }


        if (!deadline) {
            toast.error("Please select deadline date and time");
            return false;
        }

        if (!oneDriveLink) {
            toast.error("Please provide link to submit");
            return false;
        }


        if (!selectedCourse) {
            toast.error("Please select a course");
            return false;
        }

        const allAssignments = JSON.parse(
            localStorage.getItem("assignments") || "[]"
        );

        let updatedAssignments;

        if (editingAssignment) {
            // Update existing assignment
            updatedAssignments = allAssignments.map((item) =>
                String(item.id) === String(editingAssignment.id)
                    ? {
                        ...item,
                        title,
                        description,
                        deadline,
                        oneDriveLink,
                        submissionType: formData.submissionType,
                    }
                    : item
            );

            toast.success("Assignment updated successfully!");
        } else {
            // Create new assignment
            const newAssignment = {
                id: crypto.randomUUID(),
                courseId: selectedCourse.id,
                createdBy: currentUser.id,
                title,
                description,
                deadline,
                oneDriveLink,
                submissionType: formData.submissionType,
                createdAt: new Date().toISOString(),
            };

            updatedAssignments = [...allAssignments, newAssignment];

            toast.success("Assignment created successfully!");
        }

        localStorage.setItem(
            "assignments",
            JSON.stringify(updatedAssignments)
        );

        const courseIds = courses.map((course) => String(course.id));

        setAssignments(
            updatedAssignments.filter(
                (item) =>
                    String(item.createdBy) === String(currentUser.id) ||
                    courseIds.includes(String(item.courseId))
            )
        );

        setShowAssignmentModal(false);
        setEditingAssignment(null);

        return true;
    };


    // Edit assignment


    const handleEditAssignment = (assignment) => {
        setEditingAssignment(assignment);
        setShowAssignmentModal(true);
    };


    // Delete assignment


    const handleDeleteAssignment = (assignment) => {
        setDeletingAssignment(assignment);
    };

    const handleConfirmDelete = () => {
        if (!deletingAssignment) return;

        const allAssignments = JSON.parse(
            localStorage.getItem("assignments") || "[]"
        );

        const allSubmissions = JSON.parse(
            localStorage.getItem("submissions") || "[]"
        );

        const updatedAssignments = allAssignments.filter(
            (item) =>
                String(item.id) !== String(deletingAssignment.id)
        );

        const updatedSubmissions = allSubmissions.filter(
            (item) =>
                String(item.assignmentId) !== String(deletingAssignment.id)
        );

        localStorage.setItem(
            "assignments",
            JSON.stringify(updatedAssignments)
        );

        localStorage.setItem(
            "submissions",
            JSON.stringify(updatedSubmissions)
        );

        setAssignments((previous) =>
            previous.filter(
                (item) =>
                    String(item.id) !== String(deletingAssignment.id)
            )
        );

        setSubmissions(updatedSubmissions);
        setDeletingAssignment(null);

        toast.success("Assignment deleted successfully!");
    };


    // Logout


    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("authToken");

        toast.success("Logged out successfully");
        navigate("/login");
    };


    // UI


    return (
        <div className="min-h-screen bg-[#F8F7FC] flex">

            {/* Sidebar */}
            <div className="hidden md:flex w-64 bg-white border-r border-zinc-100 flex-col p-6">


                <nav className="flex flex-col gap-3">

                    <button
                        onClick={() => setSelectedCourseId(null)}
                        className={`text-left px-4 py-3 rounded-xl font-medium transition cursor-pointer ${!selectedCourse
                            ? "bg-[#7938EB] text-white"
                            : "text-zinc-500 hover:bg-purple-50 hover:text-[#7938EB]"
                            }`}
                    >
                         Dashboard
                    </button>

                    <button
                        onClick={() => setSelectedCourseId(null)}
                        className="text-left text-zinc-500 hover:bg-purple-50 hover:text-[#7938EB] px-4 py-3 rounded-xl transition cursor-pointer"
                    >
                         My Courses
                    </button>

                </nav>

                {/* Professor profile */}
                <div className="mt-auto">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#7938EB] font-bold">
                            {professorName.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-700 truncate">
                                {professorName}
                            </p>

                            <p className="text-xs text-zinc-400">
                                Admin
                            </p>
                        </div>

                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full text-white bg-rose-500 hover:bg-rose-600 py-3 rounded-xl transition cursor-pointer"
                    >
                        Logout
                    </button>

                </div>

            </div>

            {/* Main content */}
            <div className="flex-1 p-5 sm:p-8 lg:p-10">

                {/* Mobile header */}
                <div className="flex md:hidden justify-between items-center mb-8">

                    <button
                        onClick={handleLogout}
                        className="text-sm text-white bg-rose-500 px-4 py-2 rounded-lg cursor-pointer"
                    >
                        Logout
                    </button>

                </div>

                {loading ? (

                    <div className="bg-white rounded-2xl p-12 text-center text-zinc-500">
                        Loading Professor Dashboard...
                    </div>

                ) : !selectedCourse ? (

                    <AdminOverview
                        professorName={professorName}
                        courses={courses}
                        stats={dashboardStats}
                        courseStats={courseStats}
                        onCreateCourse={() => setShowCourseModal(true)}
                        onSelectCourse={(courseId) => setSelectedCourseId(courseId)}
                    />

                ) : (

                    <AdminCourseAssignments
                        key={selectedCourse.id}
                        course={selectedCourse}
                        assignments={assignments.filter(
                            (item) =>
                                String(item.courseId) === String(selectedCourse.id)
                        )}
                        students={students}
                        groups={groups}
                        submissions={submissions}
                        getCourseStudents={getCourseStudents}
                        getAssignmentProgress={getAssignmentProgress}
                        onBack={() => setSelectedCourseId(null)}
                        onCreateAssignment={() => {
                            setEditingAssignment(null);
                            setShowAssignmentModal(true);
                        }}
                        onEditAssignment={handleEditAssignment}
                        onDeleteAssignment={handleDeleteAssignment}
                    />

                )}

            </div>

            {/* Create Course Modal */}
            <AdminCourseModal
                open={showCourseModal}
                studentCount={students.length}
                onClose={() => setShowCourseModal(false)}
                onSave={handleCreateCourse}
            />

            {/* Create / Edit Assignment Modal */}
            <AdminAssignmentModal
                open={showAssignmentModal}
                course={selectedCourse}
                assignment={editingAssignment}
                onClose={() => {
                    setShowAssignmentModal(false);
                    setEditingAssignment(null);
                }}
                onSave={handleSaveAssignment}
            />

            {/* Delete Confirmation Modal */}
            <AdminDeleteModal
                open={Boolean(deletingAssignment)}
                assignmentTitle={deletingAssignment?.title}
                onCancel={() => setDeletingAssignment(null)}
                onConfirm={handleConfirmDelete}
            />

        </div>
    );
}

export default AdminPortal;
