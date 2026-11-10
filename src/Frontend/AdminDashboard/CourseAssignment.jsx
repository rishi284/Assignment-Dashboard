import React from "react";
function AdminCourseAssignments({
    course,
    assignments,
    groups,
    getCourseStudents,
    getAssignmentProgress,
    onBack,
    onCreateAssignment,
    onEditAssignment,
    onDeleteAssignment,
}) {


    // Assignment type


    const isGroupAssignment = (assignment) => {
        return (
            String(assignment.submissionType || "Individual").toLowerCase() === "group"
        );
    };


    // Overdue status


    const isOverdue = (assignment, stats) => {
        if (!assignment.deadline || stats.pending === 0) {
            return false;
        }

        const deadline = new Date(assignment.deadline);

        return deadline < new Date();
    };


    // UI


    return (
        <div>

            {/* Back button and course information */}
            <div className="mb-7">

                <button
                    type="button"
                    onClick={onBack}
                    className="text-sm text-[#7938EB] font-medium hover:underline mb-5 cursor-pointer"
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
                                {course.name}
                            </h2>

                            {course.code && (
                                <p className="text-sm text-zinc-400 mt-2">
                                    Course Code: {course.code}
                                </p>
                            )}

                            {course.description && (
                                <p className="text-sm text-zinc-500 mt-3">
                                    {course.description}
                                </p>
                            )}

                        </div>

                        <div className="flex flex-wrap gap-3">

                            <span className="bg-purple-50 text-[#7938EB] px-4 py-2 rounded-xl text-sm font-medium">
                                {getCourseStudents(course).length} Students
                            </span>

                            <span className="bg-purple-50 text-[#7938EB] px-4 py-2 rounded-xl text-sm font-medium">
                                {groups.filter(
                                    (group) =>
                                        String(group.courseId) === String(course.id)
                                ).length} Groups
                            </span>

                        </div>

                    </div>

                </div>

            </div>

            {/* Assignments heading */}
            <div id="assignments">

                <div className="flex flex-wrap justify-between items-center gap-3 mb-5">

                    <div>

                        <h2 className="text-xl font-semibold text-zinc-800">
                            Course Assignments
                        </h2>

                        <p className="text-sm text-zinc-400 mt-1">
                            Create and monitor assignments for this course.
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={onCreateAssignment}
                        className="bg-[#7938EB] hover:bg-[#652BD0] text-white px-5 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer"
                    >
                        + Create Assignment
                    </button>

                </div>

                {/* Empty assignments */}
                {assignments.length === 0 ? (

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

                        {assignments.map((item) => {

                            const stats = getAssignmentProgress(item);
                            const overdue = isOverdue(item, stats);
                            const groupAssignment = isGroupAssignment(item);

                            return (

                                <AssignmentProgressCard
                                    key={item.id}
                                    assignment={item}
                                    stats={stats}
                                    overdue={overdue}
                                    groupAssignment={groupAssignment}
                                    onEdit={() => onEditAssignment(item)}
                                    onDelete={() => onDeleteAssignment(item)}
                                />

                            );
                        })}

                    </div>

                )}

            </div>

        </div>
    );
}


// Assignment card


function AssignmentProgressCard({
    assignment,
    stats,
    overdue,
    groupAssignment,
    onEdit,
    onDelete,
}) {
    const [showDetails, setShowDetails] = React.useState(false);

    const formatDeadline = (deadline) => {
        if (!deadline) {
            return "Not specified";
        }

        const date = new Date(
            /^\d{4}-\d{2}-\d{2}$/.test(String(deadline))
                ? `${deadline}T23:59:00`
                : deadline
        );

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

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition-all duration-300">

            {/* Title and actions */}
            <div className="flex flex-wrap justify-between items-start gap-3">

                <div className="flex-1 min-w-0">

                    <h3 className="text-lg font-semibold text-zinc-800">
                        {assignment.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 mt-3">

                        <span className="text-xs font-medium bg-purple-50 text-[#7938EB] px-3 py-1.5 rounded-full">
                            {groupAssignment ? "Group" : "Individual"}
                        </span>

                        <span
                            className={`text-xs font-medium px-3 py-1.5 rounded-full ${overdue
                                ? "bg-red-100 text-red-700"
                                : stats.total > 0 && stats.pending === 0
                                    ? "bg-green-100 text-green-700"
                                    : "bg-orange-100 text-orange-600"
                                }`}
                        >
                            {overdue
                                ? "Overdue"
                                : stats.total > 0 && stats.pending === 0
                                    ? "Completed"
                                    : "In Progress"}
                        </span>

                    </div>

                </div>

                <div className="flex gap-2">

                    <button
                        type="button"
                        onClick={onEdit}
                        className="px-3 py-1.5 text-sm text-[#7938EB] bg-purple-50 rounded-lg hover:bg-purple-100 cursor-pointer"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        onClick={onDelete}
                        className="px-3 py-1.5 text-sm text-red-500 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer"
                    >
                        Delete
                    </button>

                </div>

            </div>

            {/* Description */}
            <p className="text-sm text-zinc-500 leading-6 mt-4 mb-5">
                {assignment.description || "No description provided."}
            </p>

            {/* Deadline and OneDrive link */}
            <div className="border-t border-zinc-100 pt-4 flex flex-wrap justify-between items-center gap-3">

                <div>

                    <p className="text-xs text-zinc-400">
                        Deadline
                    </p>

                    <p className={`text-sm font-medium mt-1 ${overdue ? "text-red-600" : "text-zinc-700"
                        }`}>
                        {formatDeadline(assignment.deadline || assignment.dueDate)}
                    </p>

                </div>

                {(assignment.oneDriveLink || assignment.driveLink) && (

                    <a
                        href={assignment.oneDriveLink || assignment.driveLink}
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

            {/* Submission details */}
            <button
                type="button"
                onClick={() => setShowDetails((previous) => !previous)}
                className="w-full mt-5 border border-purple-200 text-[#7938EB] hover:bg-purple-50 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer"
            >
                {showDetails
                    ? "Hide Submission Details"
                    : "View Submission Details"}
            </button>

            {showDetails && (

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
                                                {groupAssignment
                                                    ? entry.name
                                                    : entry.username || entry.name || entry.email}
                                            </p>

                                            {groupAssignment && (
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
                                                {groupAssignment
                                                    ? entry.name
                                                    : entry.username || entry.name || entry.email}
                                            </p>

                                            {groupAssignment && (
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
}

export default AdminCourseAssignments;
