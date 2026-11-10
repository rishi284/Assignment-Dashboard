
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

function AdminDashboard() {
  const navigate = useNavigate();

  // --------------------------------
  // Logged-in professor
  // --------------------------------

  const [currentUser] = useState(() => {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  });

  // --------------------------------
  // Application data
  // --------------------------------

  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --------------------------------
  // Page navigation
  // --------------------------------

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);

  // --------------------------------
  // Course modal
  // --------------------------------

  const [showCourseModal, setShowCourseModal] = useState(false);

  const [courseForm, setCourseForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  // --------------------------------
  // Assignment modal
  // --------------------------------

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);

  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    deadline: "",
    oneDriveLink: "",
    submissionType: "Individual",
  });

  // --------------------------------
  // Delete confirmation
  // --------------------------------

  const [deleteAssignmentId, setDeleteAssignmentId] = useState(null);

  // --------------------------------
  // Load data and authenticate
  // --------------------------------

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

    // Get assignments belonging to this professor's courses
    const professorAssignments = allAssignments.filter(
      (assignment) =>
        String(assignment.createdBy) === String(currentUser.id) ||
        professorCourseIds.includes(String(assignment.courseId))
    );

    // Get registered students from the new users collection
    setStudents(
      allUsers.filter((user) => user.role === "Student")
    );

    setCourses(professorCourses);
    setAssignments(professorAssignments);
    setGroups(allGroups);
    setSubmissions(allSubmissions);

    setLoading(false);
  }, [currentUser, navigate]);

  // --------------------------------
  // Common values
  // --------------------------------

  const professorName =
    currentUser?.username ||
    currentUser?.name ||
    currentUser?.email ||
    "Professor";

  const selectedCourse = courses.find(
    (course) => String(course.id) === String(selectedCourseId)
  );

  const courseAssignments = assignments.filter(
    (assignment) =>
      String(assignment.courseId) === String(selectedCourseId)
  );

  // --------------------------------
  // Helper functions
  // --------------------------------

  const getCourseStudents = (course) => {
    if (!course) return [];

    const studentIds =
      course.studentIds ??
      course.enrolledStudentIds ??
      course.assignedStudentIds;

    if (!Array.isArray(studentIds)) {
      return students;
    }

    return students.filter((student) =>
      studentIds.map(String).includes(String(student.id))
    );
  };

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

    if (group.leaderId) {
      memberIds.push(group.leaderId);
    }

    return [...new Set(memberIds.filter(Boolean).map(String))];
  };

  const getStudentName = (student) => {
    return (
      student?.username ||
      student?.name ||
      student?.email ||
      "Student"
    );
  };

  const getGroupName = (group) => {
    return group?.name || "Unnamed Group";
  };

  const getUserById = (userId) => {
    return students.find(
      (student) => String(student.id) === String(userId)
    );
  };

  const isAcknowledged = (submission) => {
    return (
      submission?.status === "Submitted" ||
      submission?.status === "Acknowledged" ||
      Boolean(submission?.acknowledgedAt)
    );
  };

  // --------------------------------
  // Get groups belonging to a course
  // --------------------------------

  const getCourseGroups = (courseId) => {
    return groups.filter(
      (group) => String(group.courseId) === String(courseId)
    );
  };

  // --------------------------------
  // Calculate assignment progress
  // --------------------------------

  const getAssignmentProgress = (assignment) => {
    const course = courses.find(
      (item) => String(item.id) === String(assignment.courseId)
    );

    // Group assignment progress
    if (assignment.submissionType === "Group") {
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
          name: getGroupName(group),
          leader: getStudentName(getUserById(group.leaderId)),
          memberCount: getGroupMemberIds(group).length,
        }));

      const pendingEntries = courseGroups
        .filter(
          (group) =>
            !acknowledgedGroupIds.has(String(group.id))
        )
        .map((group) => ({
          id: group.id,
          name: getGroupName(group),
          leader: getStudentName(getUserById(group.leaderId)),
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

  // --------------------------------
  // Format deadline
  // --------------------------------

  const formatDeadline = (deadline) => {
    if (!deadline) return "Not specified";

    const date = new Date(deadline);

    if (Number.isNaN(date.getTime())) {
      return "Not specified";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue = (assignment, stats) => {
    if (!assignment.deadline || stats.pending === 0) {
      return false;
    }

    return new Date(assignment.deadline).getTime() < Date.now();
  };

  // --------------------------------
  // Overall dashboard statistics
  // --------------------------------

  const totalCourses = courses.length;

  const totalAssignments = assignments.length;

  const totalStudents = new Set(
    courses.flatMap((course) =>
      getCourseStudents(course).map((student) => String(student.id))
    )
  ).size;

  const overallStats = assignments.reduce(
    (result, assignment) => {
      const stats = getAssignmentProgress(assignment);

      result.expected += stats.total;
      result.submitted += stats.submitted;

      return result;
    },
    { expected: 0, submitted: 0 }
  );

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

  // --------------------------------
  // Course form handling
  // --------------------------------

  const handleCourseFormChange = (e) => {
    const { name, value } = e.target;

    setCourseForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetCourseForm = () => {
    setCourseForm({
      name: "",
      code: "",
      description: "",
    });
  };

  // --------------------------------
  // Create course
  // --------------------------------

  const handleCreateCourse = (e) => {
    e.preventDefault();

    const name = courseForm.name.trim();
    const code = courseForm.code.trim();
    const description = courseForm.description.trim();

    if (!name) {
      toast.error("Please enter course name");
      return;
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
      return;
    }

    // Automatically enroll currently registered students
    const newCourse = {
      id: crypto.randomUUID(),
      name,
      code,
      description,
      professorId: currentUser.id,
      createdBy: currentUser.id,
      studentIds: students.map((student) => student.id),
      createdAt: new Date().toISOString(),
    };

    const updatedCourses = [...allCourses, newCourse];

    localStorage.setItem(
      "courses",
      JSON.stringify(updatedCourses)
    );

    setCourses((previous) => [...previous, newCourse]);

    resetCourseForm();
    setShowCourseModal(false);

    toast.success("Course created successfully!");

    if (students.length === 0) {
      toast("No students are registered yet. You can register students and update enrollment later.");
    }
  };

  // --------------------------------
  // Assignment form handling
  // --------------------------------

  const handleAssignmentFormChange = (e) => {
    const { name, value } = e.target;

    setAssignmentForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({
      title: "",
      description: "",
      deadline: "",
      oneDriveLink: "",
      submissionType: "Individual",
    });

    setEditingAssignmentId(null);
  };

  const closeAssignmentModal = () => {
    if (saving) return;

    setShowAssignmentModal(false);
    resetAssignmentForm();
  };

  // --------------------------------
  // Create or update assignment
  // --------------------------------

  const handleSaveAssignment = (e) => {
    e.preventDefault();

    const title = assignmentForm.title.trim();
    const description = assignmentForm.description.trim();
    const deadline = assignmentForm.deadline;
    const oneDriveLink = assignmentForm.oneDriveLink.trim();
    const submissionType = assignmentForm.submissionType;

    if (!title) {
      toast.error("Please enter assignment title");
      return;
    }

    if (!description) {
      toast.error("Please enter assignment description");
      return;
    }

    if (!deadline) {
      toast.error("Please select deadline date and time");
      return;
    }

    if (!oneDriveLink) {
      toast.error("Please enter OneDrive link");
      return;
    }

    if (!/^https?:\/\//i.test(oneDriveLink)) {
      toast.error("Please enter a valid OneDrive URL");
      return;
    }

    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }

    setSaving(true);

    const allAssignments = JSON.parse(
      localStorage.getItem("assignments") || "[]"
    );

    let updatedAssignments = [];

    if (editingAssignmentId) {
      // Update existing assignment
      updatedAssignments = allAssignments.map((item) =>
        String(item.id) === String(editingAssignmentId)
          ? {
              ...item,
              title,
              description,
              deadline,
              oneDriveLink,
              submissionType,
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
        submissionType,
        createdAt: new Date().toISOString(),
      };

      updatedAssignments = [...allAssignments, newAssignment];

      toast.success("Assignment created successfully!");
    }

    localStorage.setItem(
      "assignments",
      JSON.stringify(updatedAssignments)
    );

    // Update Professor state
    const professorCourseIds = courses.map((course) =>
      String(course.id)
    );

    setAssignments(
      updatedAssignments.filter(
        (item) =>
          String(item.createdBy) === String(currentUser.id) ||
          professorCourseIds.includes(String(item.courseId))
      )
    );

    setSaving(false);
    setShowAssignmentModal(false);
    resetAssignmentForm();
  };

  // --------------------------------
  // Open edit assignment
  // --------------------------------

  const handleEditAssignment = (assignment) => {
    setEditingAssignmentId(assignment.id);

    setAssignmentForm({
      title: assignment.title || "",
      description: assignment.description || "",
      deadline: assignment.deadline
        ? String(assignment.deadline).slice(0, 16)
        : assignment.dueDate
          ? `${assignment.dueDate}T23:59`
          : "",
      oneDriveLink:
        assignment.oneDriveLink || assignment.driveLink || "",
      submissionType:
        assignment.submissionType || "Individual",
    });

    setShowAssignmentModal(true);
  };

  // --------------------------------
  // Delete assignment
  // --------------------------------

  const handleDeleteAssignment = (assignmentId) => {
    setDeleteAssignmentId(assignmentId);
  };

  const handleConfirmDelete = () => {
    if (!deleteAssignmentId) return;

    const allAssignments = JSON.parse(
      localStorage.getItem("assignments") || "[]"
    );

    const allSubmissions = JSON.parse(
      localStorage.getItem("submissions") || "[]"
    );

    const updatedAssignments = allAssignments.filter(
      (item) => String(item.id) !== String(deleteAssignmentId)
    );

    const updatedSubmissions = allSubmissions.filter(
      (item) =>
        String(item.assignmentId) !== String(deleteAssignmentId)
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
        (item) => String(item.id) !== String(deleteAssignmentId)
      )
    );

    setSubmissions(updatedSubmissions);

    setDeleteAssignmentId(null);
    setExpandedAssignmentId(null);

    toast.success("Assignment deleted successfully!");
  };

  // --------------------------------
  // Logout
  // --------------------------------

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("authToken");

    toast.success("Logged out successfully");
    navigate("/login");
  };

  // --------------------------------
  // Open create assignment modal
  // --------------------------------

  const openCreateAssignment = () => {
    resetAssignmentForm();
    setShowAssignmentModal(true);
  };

  // --------------------------------
  // UI
  // --------------------------------

  return (
    <div className="min-h-screen bg-[#F8F7FC] flex">

      {/* ================= SIDEBAR ================= */}

      <aside className="hidden md:flex w-64 bg-white border-r border-zinc-100 flex-col p-6">

        <h1 className="text-2xl font-bold text-[#7938EB] mb-10">
          Joineazy
        </h1>

        <nav className="flex flex-col gap-3">

          <button
            onClick={() => setSelectedCourseId(null)}
            className={`text-left px-4 py-3 rounded-xl font-medium transition ${
              !selectedCourse
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

          {selectedCourse && (
            <button
              onClick={() => setSelectedCourseId(null)}
              className="text-left text-zinc-500 hover:bg-purple-50 hover:text-[#7938EB] px-4 py-3 rounded-xl transition"
            >
              ← Back to Courses
            </button>
          )}

        </nav>

        {/* Professor profile */}
        <div className="mt-auto">

          <div className="flex items-center gap-3 mb-6">

            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#7938EB] font-bold">
              {professorName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-zinc-700 truncate">
                {professorName}
              </h3>

              <p className="text-xs text-zinc-400">
                Professor
              </p>
            </div>

          </div>

          <button
            onClick={handleLogout}
            className="w-full text-white text-center bg-rose-500 hover:bg-rose-600 py-3 rounded-xl cursor-pointer transition"
          >
            Logout
          </button>

        </div>

      </aside>

      {/* ================= MAIN CONTENT ================= */}

      <main className="flex-1 p-5 sm:p-8 lg:p-10">

        {/* Mobile header */}
        <div className="flex md:hidden justify-between items-center mb-8">

          <h1 className="text-xl font-bold text-[#7938EB]">
            Joineazy
          </h1>

          <button
            onClick={handleLogout}
            className="text-sm text-white font-medium rounded-lg px-4 py-2 bg-rose-500"
          >
            Logout
          </button>

        </div>

        {loading ? (

          <div className="bg-white rounded-2xl p-12 text-center text-zinc-500">
            Loading Professor Dashboard...
          </div>

        ) : (

          <>

            {/* Welcome section */}
            <section className="flex flex-wrap justify-between items-center gap-4 mb-9">

              <div>

                <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-800">
                  Welcome back, {professorName}! 👋
                </h1>

                <p className="text-zinc-400 mt-2 text-sm">
                  Manage your courses, assignments and student progress.
                </p>

              </div>

              <div className="hidden sm:flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">

                <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-[#7938EB] font-semibold">
                  {professorName.charAt(0).toUpperCase()}
                </div>

                <div>

                  <p className="text-sm font-semibold text-zinc-700">
                    {professorName}
                  </p>

                  <p className="text-xs text-zinc-400">
                    Professor
                  </p>

                </div>

              </div>

            </section>

            {/* =================================
                COURSE DASHBOARD
            ================================= */}

            {!selectedCourse && (

              <>

                {/* Statistics */}
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">

                    <p className="text-sm text-zinc-500">
                      My Courses
                    </p>

                    <h2 className="text-3xl font-bold text-[#7938EB] mt-3">
                      {String(totalCourses).padStart(2, "0")}
                    </h2>

                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">

                    <p className="text-sm text-zinc-500">
                      Total Assignments
                    </p>

                    <h2 className="text-3xl font-bold text-green-600 mt-3">
                      {String(totalAssignments).padStart(2, "0")}
                    </h2>

                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">

                    <p className="text-sm text-zinc-500">
                      Pending Acknowledgments
                    </p>

                    <h2 className="text-3xl font-bold text-orange-500 mt-3">
                      {String(pendingCount).padStart(2, "0")}
                    </h2>

                  </div>

                </section>

                {/* Overall progress */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 mb-9">

                  <div className="flex justify-between items-center mb-4">

                    <div>

                      <h2 className="font-semibold text-zinc-800">
                        Overall Submission Progress
                      </h2>

                      <p className="text-sm text-zinc-400 mt-1">
                        {overallStats.submitted} of {overallStats.expected} acknowledgments completed
                      </p>

                    </div>

                    <span className="text-xl font-bold text-[#7938EB]">
                      {overallProgress}%
                    </span>

                  </div>

                  <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-[#7938EB] rounded-full transition-all duration-500"
                      style={{ width: `${overallProgress}%` }}
                    />

                  </div>

                </section>

                {/* Courses section */}
                <section id="courses">

                  <div className="flex flex-wrap justify-between items-center gap-3 mb-5">

                    <div>

                      <h2 className="text-xl font-semibold text-zinc-800">
                        My Courses
                      </h2>

                      <p className="text-sm text-zinc-400 mt-1">
                        Select a course to manage its assignments.
                      </p>

                    </div>

                    <button
                      onClick={() => setShowCourseModal(true)}
                      className="bg-[#7938EB] hover:bg-[#652BD0] text-white px-5 py-3 rounded-xl font-medium transition cursor-pointer"
                    >
                      + Create Course
                    </button>

                  </div>

                  {courses.length === 0 ? (

                    <div className="bg-white rounded-2xl p-12 text-center border border-zinc-100">

                      <div className="text-4xl mb-4">
                        📚
                      </div>

                      <h3 className="text-lg font-semibold text-zinc-700">
                        No courses created yet
                      </h3>

                      <p className="text-sm text-zinc-400 mt-2">
                        Create your first course to start managing assignments.
                      </p>

                    </div>

                  ) : (

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

                      {courses.map((course) => {

                        const courseAssignmentList = assignments.filter(
                          (item) =>
                            String(item.courseId) === String(course.id)
                        );

                        const courseStudentCount =
                          getCourseStudents(course).length;

                        const courseGroupCount =
                          getCourseGroups(course.id).length;

                        return (

                          <button
                            key={course.id}
                            onClick={() => setSelectedCourseId(course.id)}
                            className="text-left bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300"
                          >

                            <div className="flex justify-between items-start mb-5">

                              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                                📘
                              </div>

                              <span className="text-xs font-medium bg-purple-50 text-[#7938EB] px-3 py-1.5 rounded-full">
                                {courseAssignmentList.length} assignments
                              </span>

                            </div>

                            <h3 className="text-lg font-semibold text-zinc-800">
                              {course.name}
                            </h3>

                            {course.code && (
                              <p className="text-xs text-zinc-400 mt-1">
                                Course Code: {course.code}
                              </p>
                            )}

                            {course.description && (
                              <p className="text-sm text-zinc-500 mt-3 line-clamp-2">
                                {course.description}
                              </p>
                            )}

                            <div className="flex gap-5 mt-6">

                              <div>
                                <p className="text-xl font-bold text-[#7938EB]">
                                  {courseStudentCount}
                                </p>

                                <p className="text-xs text-zinc-400">
                                  Students
                                </p>
                              </div>

                              <div>
                                <p className="text-xl font-bold text-[#7938EB]">
                                  {courseGroupCount}
                                </p>

                                <p className="text-xs text-zinc-400">
                                  Groups
                                </p>
                              </div>

                            </div>

                            <div className="flex justify-between items-center mt-6 text-sm">

                              <span className="text-zinc-500">
                                Manage course
                              </span>

                              <span className="text-[#7938EB] font-bold">
                                →
                              </span>

                            </div>

                          </button>

                        );

                      })}

                    </div>

                  )}

                </section>

              </>

            )}

            {/* =================================
                SELECTED COURSE PAGE
            ================================= */}

            {selectedCourse && (

              <>

                {/* Course information */}
                <section className="mb-7">

                  <button
                    onClick={() => {
                      setSelectedCourseId(null);
                      setExpandedAssignmentId(null);
                    }}
                    className="text-sm text-[#7938EB] font-medium hover:underline mb-5"
                  >
                    ← Back to My Courses
                  </button>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">

                    <div className="flex flex-wrap justify-between items-start gap-4">

                      <div>

                        <p className="text-sm text-[#7938EB] font-medium mb-2">
                          COURSE
                        </p>

                        <h2 className="text-2xl font-semibold text-zinc-800">
                          {selectedCourse.name}
                        </h2>

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

                      <div className="flex gap-3">

                        <span className="bg-purple-50 text-[#7938EB] px-4 py-2 rounded-xl text-sm font-medium">
                          {getCourseStudents(selectedCourse).length} Students
                        </span>

                        <span className="bg-purple-50 text-[#7938EB] px-4 py-2 rounded-xl text-sm font-medium">
                          {getCourseGroups(selectedCourse.id).length} Groups
                        </span>

                      </div>

                    </div>

                  </div>

                </section>

                {/* Course assignment heading */}
                <section id="assignments">

                  <div className="flex flex-wrap justify-between items-center gap-3 mb-5">

                    <div>

                      <h2 className="text-xl font-semibold text-zinc-800">
                        Course Assignments
                      </h2>

                      <p className="text-sm text-zinc-400 mt-1">
                        Create and monitor assignments for {selectedCourse.name}.
                      </p>

                    </div>

                    <button
                      onClick={openCreateAssignment}
                      className="bg-[#7938EB] hover:bg-[#652BD0] text-white px-5 py-3 rounded-xl font-medium transition cursor-pointer"
                    >
                      + Create Assignment
                    </button>

                  </div>

                  {/* Empty assignments */}
                  {courseAssignments.length === 0 ? (

                    <div className="bg-white rounded-2xl p-12 text-center">

                      <div className="text-4xl mb-4">
                        📝
                      </div>

                      <h3 className="text-lg font-semibold text-zinc-700">
                        No assignments created yet
                      </h3>

                      <p className="text-sm text-zinc-400 mt-2">
                        Create an assignment for this course to get started.
                      </p>

                    </div>

                  ) : (

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                      {courseAssignments.map((item) => {

                        const stats = getAssignmentProgress(item);
                        const overdue = isOverdue(item, stats);

                        const expanded =
                          String(expandedAssignmentId) === String(item.id);

                        return (

                          <div
                            key={item.id}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition-all duration-300"
                          >

                            {/* Assignment title and actions */}
                            <div className="flex flex-wrap justify-between items-start gap-3">

                              <div className="flex-1 min-w-0">

                                <h3 className="text-lg font-semibold text-zinc-800">
                                  {item.title}
                                </h3>

                                <div className="flex flex-wrap gap-2 mt-3">

                                  <span className="text-xs font-medium bg-purple-50 text-[#7938EB] px-3 py-1.5 rounded-full">
                                    {item.submissionType || "Individual"}
                                  </span>

                                  <span
                                    className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                                      overdue
                                        ? "bg-red-100 text-red-700"
                                        : stats.pending === 0 && stats.total > 0
                                          ? "bg-green-100 text-green-700"
                                          : "bg-orange-100 text-orange-600"
                                    }`}
                                  >
                                    {overdue
                                      ? "Overdue"
                                      : stats.pending === 0 && stats.total > 0
                                        ? "Completed"
                                        : "In Progress"}
                                  </span>

                                </div>

                              </div>

                              <div className="flex gap-2">

                                <button
                                  onClick={() => handleEditAssignment(item)}
                                  className="px-3 py-1.5 text-sm text-[#7938EB] bg-purple-50 rounded-lg hover:bg-purple-100"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() => handleDeleteAssignment(item.id)}
                                  className="px-3 py-1.5 text-sm text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                                >
                                  Delete
                                </button>

                              </div>

                            </div>

                            {/* Description */}
                            <p className="text-sm text-zinc-500 leading-6 mt-4 mb-5">
                              {item.description}
                            </p>

                            {/* Deadline and OneDrive link */}
                            <div className="border-t border-zinc-100 pt-4 flex flex-wrap justify-between items-center gap-3">

                              <div>

                                <p className="text-xs text-zinc-400">
                                  Deadline
                                </p>

                                <p className={`text-sm font-medium mt-1 ${
                                  overdue ? "text-red-600" : "text-zinc-700"
                                }`}>
                                  {formatDeadline(item.deadline || item.dueDate)}
                                </p>

                              </div>

                              {(item.oneDriveLink || item.driveLink) && (

                                <a
                                  href={item.oneDriveLink || item.driveLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-[#7938EB] font-medium hover:underline"
                                >
                                  ↗ OneDrive Link
                                </a>

                              )}

                            </div>

                            {/* Progress */}
                            <div className="mt-6">

                              <div className="flex justify-between items-center mb-3">

                                <p className="text-sm font-medium text-zinc-700">
                                  Submission Progress
                                </p>

                                <p className="text-sm font-semibold text-[#7938EB]">
                                  {stats.percentage}%
                                </p>

                              </div>

                              <div className="w-full h-2.5 bg-purple-100 rounded-full overflow-hidden">

                                <div
                                  className="h-full bg-[#7938EB] rounded-full transition-all"
                                  style={{
                                    width: `${stats.percentage}%`,
                                  }}
                                />

                              </div>

                              <p className="text-xs text-zinc-400 mt-2">
                                {stats.submitted} of {stats.total} {stats.unit} acknowledged
                              </p>

                            </div>

                            {/* Drill down button */}
                            <button
                              onClick={() =>
                                setExpandedAssignmentId(
                                  expanded ? null : item.id
                                )
                              }
                              className="w-full mt-5 border border-purple-200 text-[#7938EB] hover:bg-purple-50 py-2.5 rounded-xl text-sm font-medium transition"
                            >
                              {expanded
                                ? "Hide Submission Details"
                                : "View Submission Details"}
                            </button>

                            {/* Submitted and pending details */}
                            {expanded && (

                              <div className="mt-5 border-t border-zinc-100 pt-5">

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                  {/* Submitted */}
                                  <div className="bg-green-50 p-4 rounded-xl">

                                    <h4 className="text-sm font-semibold text-green-700 mb-3">
                                      Submitted ({stats.submitted})
                                    </h4>

                                    {stats.submittedEntries.length === 0 ? (

                                      <p className="text-xs text-green-600">
                                        No acknowledgments yet.
                                      </p>

                                    ) : (

                                      <div className="space-y-2 max-h-52 overflow-y-auto">

                                        {stats.submittedEntries.map((entry) => (

                                          <div
                                            key={entry.id}
                                            className="text-xs text-green-800 border-b border-green-100 pb-2"
                                          >

                                            <p className="font-medium">
                                              {item.submissionType === "Group"
                                                ? entry.name
                                                : getStudentName(entry)}
                                            </p>

                                            {item.submissionType === "Group" && (
                                              <>
                                                <p className="mt-1">
                                                  Leader: {entry.leader}
                                                </p>

                                                <p>
                                                  Members: {entry.memberCount}
                                                </p>
                                              </>
                                            )}

                                          </div>

                                        ))}

                                      </div>

                                    )}

                                  </div>

                                  {/* Pending */}
                                  <div className="bg-orange-50 p-4 rounded-xl">

                                    <h4 className="text-sm font-semibold text-orange-700 mb-3">
                                      Pending ({stats.pending})
                                    </h4>

                                    {stats.pendingEntries.length === 0 ? (

                                      <p className="text-xs text-orange-600">
                                        Everyone has acknowledged.
                                      </p>

                                    ) : (

                                      <div className="space-y-2 max-h-52 overflow-y-auto">

                                        {stats.pendingEntries.map((entry) => (

                                          <div
                                            key={entry.id}
                                            className="text-xs text-orange-800 border-b border-orange-100 pb-2"
                                          >

                                            <p className="font-medium">
                                              {item.submissionType === "Group"
                                                ? entry.name
                                                : getStudentName(entry)}
                                            </p>

                                            {item.submissionType === "Group" && (
                                              <>
                                                <p className="mt-1">
                                                  Leader: {entry.leader}
                                                </p>

                                                <p>
                                                  Members: {entry.memberCount}
                                                </p>
                                              </>
                                            )}

                                          </div>

                                        ))}

                                      </div>

                                    )}

                                  </div>

                                </div>

                              </div>

                            )}

                          </div>

                        );

                      })}

                    </div>

                  )}

                </section>

              </>

            )}

          </>

        )}

      </main>

      {/* =================================
          CREATE COURSE MODAL
      ================================= */}

      {showCourseModal && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 shadow-2xl">

            <div className="flex justify-between items-center mb-7">

              <div>

                <h2 className="text-2xl font-semibold text-zinc-800">
                  Create Course
                </h2>

                <p className="text-sm text-zinc-400 mt-1">
                  Add a course to your Professor dashboard.
                </p>

              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCourseModal(false);
                  resetCourseForm();
                }}
                className="text-zinc-400 hover:text-red-500 text-2xl"
              >
                ×
              </button>

            </div>

            <form onSubmit={handleCreateCourse} className="space-y-5">

              <div>

                <label className="text-sm font-medium text-zinc-700">
                  Course Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={courseForm.name}
                  onChange={handleCourseFormChange}
                  placeholder="e.g. Web Development"
                  className="w-full mt-2 px-4 py-3 border border-zinc-300 rounded-lg outline-none focus:border-[#7938EB] text-sm"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-zinc-700">
                  Course Code
                </label>

                <input
                  type="text"
                  name="code"
                  value={courseForm.code}
                  onChange={handleCourseFormChange}
                  placeholder="e.g. CSE301"
                  className="w-full mt-2 px-4 py-3 border border-zinc-300 rounded-lg outline-none focus:border-[#7938EB] text-sm"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-zinc-700">
                  Course Description
                </label>

                <textarea
                  rows="3"
                  name="description"
                  value={courseForm.description}
                  onChange={handleCourseFormChange}
                  placeholder="Enter a short course description"
                  className="w-full mt-2 px-4 py-3 border border-zinc-300 rounded-lg outline-none focus:border-[#7938EB] text-sm resize-none"
                />

              </div>

              <div className="bg-purple-50 p-4 rounded-xl">

                <p className="text-sm font-medium text-[#7938EB]">
                  Student Enrollment
                </p>

                <p className="text-xs text-zinc-500 mt-1">
                  All currently registered students will be enrolled automatically.
                </p>

                <p className="text-sm font-semibold text-zinc-700 mt-2">
                  {students.length} registered students
                </p>

              </div>

              <button
                type="submit"
                className="w-full bg-[#7938EB] hover:bg-[#652BD0] text-white py-3 rounded-xl font-medium transition"
              >
                Create Course
              </button>

            </form>

          </div>

        </div>

      )}

      {/* =================================
          CREATE / EDIT ASSIGNMENT MODAL
      ================================= */}

      {showAssignmentModal && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 shadow-2xl">

            <div className="flex justify-between items-center mb-7">

              <div>

                <h2 className="text-2xl font-semibold text-zinc-800">
                  {editingAssignmentId
                    ? "Edit Assignment"
                    : "Create Assignment"}
                </h2>

                <p className="text-sm text-zinc-400 mt-1">
                  Course: {selectedCourse?.name}
                </p>

              </div>

              <button
                type="button"
                onClick={closeAssignmentModal}
                disabled={saving}
                className="text-zinc-400 hover:text-red-500 text-2xl"
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-5">

              {/* Assignment title */}
              <div>

                <label className="text-sm font-medium text-zinc-700">
                  Assignment Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={assignmentForm.title}
                  onChange={handleAssignmentFormChange}
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
                  onChange={handleAssignmentFormChange}
                  placeholder="Enter assignment description"
                  className="w-full mt-2 px-4 py-3 border border-zinc-300 rounded-lg outline-none focus:border-[#7938EB] text-sm resize-none"
                />

              </div>

              {/* Deadline date and time */}
              <div>

                <label className="text-sm font-medium text-zinc-700">
                  Deadline (Date and Time)
                </label>

                <input
                  type="datetime-local"
                  name="deadline"
                  value={assignmentForm.deadline}
                  onChange={handleAssignmentFormChange}
                  className="w-full mt-2 px-4 py-3 border border-zinc-300 rounded-lg outline-none focus:border-[#7938EB] text-sm"
                />

              </div>

              {/* OneDrive link */}
              <div>

                <label className="text-sm font-medium text-zinc-700">
                  OneDrive Link
                </label>

                <input
                  type="url"
                  name="oneDriveLink"
                  value={assignmentForm.oneDriveLink}
                  onChange={handleAssignmentFormChange}
                  placeholder="https://..."
                  className="w-full mt-2 px-4 py-3 border border-zinc-300 rounded-lg outline-none focus:border-[#7938EB] text-sm"
                />

              </div>

              {/* Submission type */}
              <div>

                <label className="text-sm font-medium text-zinc-700">
                  Submission Type
                </label>

                <select
                  name="submissionType"
                  value={assignmentForm.submissionType}
                  onChange={handleAssignmentFormChange}
                  className="w-full mt-2 px-4 py-3 border border-zinc-300 rounded-lg outline-none focus:border-[#7938EB] text-sm bg-white"
                >
                  <option value="Individual">
                    Individual
                  </option>

                  <option value="Group">
                    Group
                  </option>
                </select>

              </div>

              {/* Form button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#7938EB] hover:bg-[#652BD0] text-white py-3 rounded-xl font-medium transition disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingAssignmentId
                    ? "Update Assignment"
                    : "Create Assignment"}
              </button>

            </form>

          </div>

        </div>

      )}

      {/* =================================
          DELETE ASSIGNMENT MODAL
      ================================= */}

      {deleteAssignmentId && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md rounded-2xl p-7 shadow-2xl">

            <h2 className="text-xl font-semibold text-zinc-800 text-center">
              Delete Assignment?
            </h2>

            <p className="text-sm text-zinc-500 text-center mt-3">
              Are you sure you want to delete this assignment? Its acknowledgment records will also be deleted.
            </p>

            <div className="flex gap-3 mt-7">

              <button
                onClick={() => setDeleteAssignmentId(null)}
                className="flex-1 border border-zinc-300 text-zinc-600 py-3 rounded-xl hover:bg-zinc-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl transition"
              >
                Yes, Delete
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminDashboard;
