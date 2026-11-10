
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

import StudentOverview from "./StudentOverview";
import StudentAssignments from "./StudentAssignments";
import StudentGroups from "./StudentGroups";

function StudentPortal() {
    const navigate = useNavigate();

    // Logged-in student
    const [currentUser] = useState(() => {
        return JSON.parse(localStorage.getItem("currentUser") || "null");
    });

    // Shared application data
    const [courses, setCourses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [groups, setGroups] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    // Selected course
    const [selectedCourseId, setSelectedCourseId] = useState(null);

    // Group modal
    const [showGroupModal, setShowGroupModal] = useState(false);

    // ---------------------------------
    // Authentication and data loading
    // ---------------------------------

    useEffect(() => {
        const token = localStorage.getItem("authToken");

        if (!currentUser || currentUser.role !== "Student" || !token) {
            navigate("/login");
            return;
        }

        const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
        const allCourses = JSON.parse(localStorage.getItem("courses") || "[]");
        const allAssignments = JSON.parse(localStorage.getItem("assignments") || "[]");
        const allGroups = JSON.parse(localStorage.getItem("groups") || "[]");
        const allSubmissions = JSON.parse(localStorage.getItem("submissions") || "[]");

        setUsers(allUsers);
        setCourses(allCourses);
        setAssignments(allAssignments);
        setGroups(allGroups);
        setSubmissions(allSubmissions);

        setLoading(false);
    }, [currentUser, navigate]);

    // ---------------------------------
    // Helper functions
    // ---------------------------------

    const getGroupMemberIds = (group) => {
        let memberIds = [];

        if (Array.isArray(group.memberIds)) {
            memberIds = [...group.memberIds];
        } else if (Array.isArray(group.members)) {
            memberIds = group.members.map((member) =>
                typeof member === "object"
                    ? member.id ?? member.studentId
                    : member
            );
        }

        // Ensure group leader is included
        if (group.leaderId) {
            memberIds.push(group.leaderId);
        }

        return [...new Set(memberIds.filter(Boolean).map(String))];
    };

    const getCourseGroup = (courseId) => {
        return groups.find(
            (group) =>
                String(group.courseId) === String(courseId) &&
                getGroupMemberIds(group).includes(String(currentUser.id))
        );
    };

    // ---------------------------------
    // Courses available to this student
    // ---------------------------------

    const visibleCourses = courses.filter((course) => {
        if (course.enrollAllStudents === true) {
            return true;
        }

        const studentIds =
            course.studentIds ??
            course.enrolledStudentIds ??
            course.assignedStudentIds;

        // When a course has an explicit enrollment list
        if (Array.isArray(studentIds) && studentIds.length > 0) {
            return studentIds.map(String).includes(String(currentUser.id));
        }

        // Backward compatibility: courses without an enrollment list
        // are visible to all students.
        return true;
    });

    // ---------------------------------
    // Selected course
    // ---------------------------------

    const selectedCourse = visibleCourses.find(
        (course) => String(course.id) === String(selectedCourseId)
    );

    const selectedCourseAssignments = selectedCourse
        ? assignments.filter(
            (assignment) =>
                String(assignment.courseId) === String(selectedCourse.id)
        )
        : [];

    const currentGroup = selectedCourse
        ? getCourseGroup(selectedCourse.id)
        : null;

    // ---------------------------------
    // Find acknowledgment
    // ---------------------------------

    const getAcknowledgment = (assignment, courseId) => {
        if (assignment.submissionType === "Group") {
            const studentGroup = getCourseGroup(courseId);

            if (!studentGroup) {
                return null;
            }

            return submissions.find(
                (submission) =>
                    String(submission.assignmentId) === String(assignment.id) &&
                    String(submission.groupId) === String(studentGroup.id)
            );
        }

        return submissions.find(
            (submission) =>
                String(submission.assignmentId) === String(assignment.id) &&
                String(submission.studentId) === String(currentUser.id)
        );
    };

    // ---------------------------------
    // Dashboard statistics
    // ---------------------------------

    const courseStats = {};

    visibleCourses.forEach((course) => {
        const courseAssignments = assignments.filter(
            (assignment) =>
                String(assignment.courseId) === String(course.id)
        );

        const acknowledged = courseAssignments.filter((assignment) =>
            getAcknowledgment(assignment, course.id)
        ).length;

        const total = courseAssignments.length;

        courseStats[course.id] = {
            total,
            acknowledged,
            pending: total - acknowledged,
            progress:
                total === 0
                    ? 0
                    : Math.round((acknowledged / total) * 100),
        };
    });

    const totalCourses = visibleCourses.length;

    const totalAssignments = Object.values(courseStats).reduce(
        (total, item) => total + item.total,
        0
    );

    const acknowledgedCount = Object.values(courseStats).reduce(
        (total, item) => total + item.acknowledged,
        0
    );

    const pendingCount = totalAssignments - acknowledgedCount;

    const overallProgress =
        totalAssignments === 0
            ? 0
            : Math.round((acknowledgedCount / totalAssignments) * 100);

    const dashboardStats = {
        totalCourses,
        totalAssignments,
        acknowledgedCount,
        pendingCount,
        overallProgress,
    };

    // ---------------------------------
    // Logout
    // ---------------------------------

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("authToken");

        toast.success("Logged out successfully");
        navigate("/login");
    };

    // ---------------------------------
    // Individual / group acknowledgment
    // ---------------------------------

    const handleAcknowledge = (assignment) => {
        const isGroupAssignment =
            assignment.submissionType === "Group";

        const studentGroup = isGroupAssignment
            ? getCourseGroup(assignment.courseId)
            : null;

        // A group must exist for group assignments
        if (isGroupAssignment && !studentGroup) {
            toast.error("Please create or join a group first");
            return false;
        }

        // Only group leader can acknowledge
        if (
            isGroupAssignment &&
            String(studentGroup.leaderId) !== String(currentUser.id)
        ) {
            toast.error("Only the group leader can acknowledge");
            return false;
        }

        const allSubmissions = JSON.parse(
            localStorage.getItem("submissions") || "[]"
        );

        // Find existing acknowledgment
        const existingSubmission = allSubmissions.find((item) => {
            const sameAssignment =
                String(item.assignmentId) === String(assignment.id);

            if (isGroupAssignment) {
                return (
                    sameAssignment &&
                    String(item.groupId) === String(studentGroup.id)
                );
            }

            return (
                sameAssignment &&
                String(item.studentId) === String(currentUser.id)
            );
        });

        const acknowledgedAt = new Date().toISOString();

        const newSubmission = {
            id: existingSubmission?.id || crypto.randomUUID(),
            assignmentId: assignment.id,
            courseId: assignment.courseId,
            status: "Submitted",
            submissionType: isGroupAssignment ? "Group" : "Individual",
            studentId: isGroupAssignment ? null : currentUser.id,
            groupId: isGroupAssignment ? studentGroup.id : null,
            acknowledgedBy: currentUser.id,
            acknowledgedAt,
            submittedAt: acknowledgedAt,
        };

        let updatedSubmissions;

        if (existingSubmission) {
            updatedSubmissions = allSubmissions.map((item) =>
                String(item.id) === String(existingSubmission.id)
                    ? { ...item, ...newSubmission }
                    : item
            );
        } else {
            updatedSubmissions = [...allSubmissions, newSubmission];
        }

        localStorage.setItem(
            "submissions",
            JSON.stringify(updatedSubmissions)
        );

        setSubmissions(updatedSubmissions);

        toast.success(
            isGroupAssignment
                ? "Group assignment acknowledged successfully!"
                : "Assignment acknowledged successfully!"
        );

        return true;
    };

    // ---------------------------------
    // Create group
    // ---------------------------------

    const handleCreateGroup = (groupName) => {
        if (!selectedCourse) {
            toast.error("Please select a course");
            return false;
        }

        if (!groupName.trim()) {
            toast.error("Please enter a group name");
            return false;
        }

        const allGroups = JSON.parse(
            localStorage.getItem("groups") || "[]"
        );

        // A student can belong to only one group per course
        const alreadyInGroup = allGroups.some(
            (group) =>
                String(group.courseId) === String(selectedCourse.id) &&
                getGroupMemberIds(group).includes(String(currentUser.id))
        );

        if (alreadyInGroup) {
            toast.error("You are already part of a group in this course");
            return false;
        }

        // Prevent duplicate group names
        const duplicateName = allGroups.some(
            (group) =>
                String(group.courseId) === String(selectedCourse.id) &&
                group.name?.toLowerCase() === groupName.trim().toLowerCase()
        );

        if (duplicateName) {
            toast.error("A group with this name already exists");
            return false;
        }

        const newGroup = {
            id: crypto.randomUUID(),
            courseId: selectedCourse.id,
            name: groupName.trim(),
            leaderId: currentUser.id,
            memberIds: [currentUser.id],
            createdAt: new Date().toISOString(),
        };

        const updatedGroups = [...allGroups, newGroup];

        localStorage.setItem("groups", JSON.stringify(updatedGroups));

        setGroups(updatedGroups);

        toast.success("Group created successfully! You are the leader.");

        return true;
    };

    // ---------------------------------
    // Join group
    // ---------------------------------

    const handleJoinGroup = (groupId) => {
        if (!selectedCourse) {
            return false;
        }

        const allGroups = JSON.parse(
            localStorage.getItem("groups") || "[]"
        );

        const alreadyInGroup = allGroups.some(
            (group) =>
                String(group.courseId) === String(selectedCourse.id) &&
                getGroupMemberIds(group).includes(String(currentUser.id))
        );

        if (alreadyInGroup) {
            toast.error("You are already part of a group in this course");
            return false;
        }

        const groupExists = allGroups.some(
            (group) =>
                String(group.id) === String(groupId) &&
                String(group.courseId) === String(selectedCourse.id)
        );

        if (!groupExists) {
            toast.error("Selected group does not exist");
            return false;
        }

        const updatedGroups = allGroups.map((group) => {
            if (String(group.id) === String(groupId)) {
                const memberIds = getGroupMemberIds(group);

                return {
                    ...group,
                    memberIds: [...memberIds, currentUser.id],
                };
            }

            return group;
        });

        localStorage.setItem("groups", JSON.stringify(updatedGroups));

        setGroups(updatedGroups);

        toast.success("You joined the group successfully!");

        return true;
    };

    
    // Main UI
    

    const studentName =
        currentUser?.username ||
        currentUser?.name ||
        currentUser?.email ||
        "Student";

    return (
        <div className="min-h-screen bg-[#F8F7FC] flex">

            {/* Sidebar */}
            <aside className="hidden md:flex w-64 bg-white border-r border-zinc-100 flex-col p-6">

                <h1 className="text-2xl font-bold text-[#7938EB] mb-10">
                    Joineazy
                </h1>

                <nav className="flex flex-col gap-3">

                    <button
                        onClick={() => setSelectedCourseId(null)}
                        className={`text-left px-4 py-3 rounded-xl font-medium transition ${!selectedCourse
                                ? "bg-[#7938EB] text-white"
                                : "text-zinc-500 hover:bg-purple-50 hover:text-[#7938EB]"
                            }`}
                    >
                        ▦ Dashboard
                    </button>

                    <button
                        onClick={() => setSelectedCourseId(null)}
                        className="text-left text-zinc-500 hover:bg-purple-50 hover:text-[#7938EB] px-4 py-3 rounded-xl transition"
                    >
                        ▤ My Courses
                    </button>

                </nav>

                {/* Profile and logout */}
                <div className="mt-auto">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#7938EB] font-bold">
                            {studentName.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-zinc-700 truncate">
                                {studentName}
                            </h3>

                            <p className="text-xs text-zinc-400">
                                Student
                            </p>
                        </div>

                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full text-white bg-rose-500 hover:bg-rose-600 py-3 rounded-xl transition"
                    >
                        Logout
                    </button>

                </div>

            </aside>

            {/* Main content */}
            <main className="flex-1 p-5 sm:p-8 lg:p-10">

                {/* Mobile header */}
                <div className="flex md:hidden justify-between items-center mb-8">

                    <h1 className="text-xl font-bold text-[#7938EB]">
                        Joineazy
                    </h1>

                    <button
                        onClick={handleLogout}
                        className="text-sm text-white bg-rose-500 px-4 py-2 rounded-lg"
                    >
                        Logout
                    </button>

                </div>

                {loading ? (

                    <div className="bg-white rounded-2xl p-12 text-center text-zinc-500">
                        Loading your dashboard...
                    </div>

                ) : !selectedCourse ? (

                    <StudentOverview
                        currentUser={currentUser}
                        courses={visibleCourses}
                        stats={dashboardStats}
                        courseStats={courseStats}
                        onSelectCourse={(courseId) => setSelectedCourseId(courseId)}
                    />

                ) : (

                    <>

                        {/* Back to courses */}
                        <button
                            onClick={() => setSelectedCourseId(null)}
                            className="text-sm text-[#7938EB] font-medium hover:underline mb-5"
                        >
                            ← Back to My Courses
                        </button>

                        {/* Course heading */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 mb-7">

                            <p className="text-sm text-[#7938EB] font-medium mb-2">
                                COURSE
                            </p>

                            <h1 className="text-2xl font-semibold text-zinc-800">
                                {selectedCourse.name}
                            </h1>

                            {selectedCourse.code && (
                                <p className="text-sm text-zinc-400 mt-2">
                                    Course Code: {selectedCourse.code}
                                </p>
                            )}

                            {selectedCourse.description && (
                                <p className="text-sm text-zinc-500 mt-3">
                                    {selectedCourse.description}
                                </p>
                            )}

                        </div>

                        {/* Group information and modal */}
                        <StudentGroups
                            course={selectedCourse}
                            currentUser={currentUser}
                            users={users}
                            groups={groups}
                            open={showGroupModal}
                            onOpen={() => setShowGroupModal(true)}
                            onClose={() => setShowGroupModal(false)}
                            onCreateGroup={handleCreateGroup}
                            onJoinGroup={handleJoinGroup}
                        />

                        {/* Course assignments */}
                        <StudentAssignments
                            course={selectedCourse}
                            assignments={selectedCourseAssignments}
                            submissions={submissions}
                            currentUser={currentUser}
                            users={users}
                            currentGroup={currentGroup}
                            onAcknowledge={handleAcknowledge}
                            onOpenGroups={() => setShowGroupModal(true)}
                        />

                    </>

                )}

            </main>

        </div>
    );
}

export default StudentPortal;