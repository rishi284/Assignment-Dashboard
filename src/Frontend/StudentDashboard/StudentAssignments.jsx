
import { useState } from "react";

function StudentAssignments({
    assignments,
    submissions,
    currentUser,
    users,
    currentGroup,
    onAcknowledge,
    onOpenGroups,
}) {
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // ---------------------------------
    // Helper functions
    // ---------------------------------

    const isGroupAssignment = (assignment) => {
        return (
            String(assignment.submissionType || "Individual").toLowerCase() ===
            "group"
        );
    };

    const getUserName = (userId) => {
        const user = users.find(
            (item) => String(item.id) === String(userId)
        );

        return user?.username || user?.name || user?.email || "Student";
    };

    const getAcknowledgment = (assignment) => {
        if (isGroupAssignment(assignment)) {
            if (!currentGroup) {
                return null;
            }

            return submissions.find(
                (submission) =>
                    String(submission.assignmentId) === String(assignment.id) &&
                    String(submission.groupId) === String(currentGroup.id)
            );
        }

        return submissions.find(
            (submission) =>
                String(submission.assignmentId) === String(assignment.id) &&
                String(submission.studentId) === String(currentUser.id)
        );
    };

    const isAcknowledged = (assignment) => {
        const acknowledgment = getAcknowledgment(assignment);

        return Boolean(
            acknowledgment &&
            (
                acknowledgment.status === "Submitted" ||
                acknowledgment.status === "Acknowledged" ||
                acknowledgment.acknowledgedAt
            )
        );
    };

    // ---------------------------------
    // Deadline functions
    // ---------------------------------

    const getDeadline = (value) => {
        if (!value) {
            return null;
        }

        // Old date-only deadline
        if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
            return new Date(`${value}T23:59:59`);
        }

        return new Date(value);
    };

    const formatDateTime = (value) => {
        if (!value) {
            return "Not specified";
        }

        const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(String(value));

        const date = dateOnly
            ? new Date(`${value}T00:00:00`)
            : new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Not specified";
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            ...(dateOnly
                ? {}
                : {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
        });
    };

    const isOverdue = (assignment) => {
        const deadline = getDeadline(
            assignment.deadline || assignment.dueDate
        );

        return (
            deadline &&
            deadline.getTime() &&
            !isAcknowledged(assignment)
        );
    };

    // ---------------------------------
    // Confirmation
    // ---------------------------------

    const openConfirmation = (assignment) => {
        setSelectedAssignment(assignment);
    };

    const handleConfirmSubmission = () => {
        if (!selectedAssignment || submitting) {
            return;
        }

        setSubmitting(true);

        const success = onAcknowledge(selectedAssignment);

        setSubmitting(false);

        if (success) {
            setSelectedAssignment(null);
        }
    };

    // ---------------------------------
    // UI
    // ---------------------------------

    return (
        <section id="assignments">

            {/* Heading */}
            <div className="flex justify-between items-center mb-5">

                <div>
                    <h2 className="text-xl font-semibold text-zinc-800">
                        Course Assignments
                    </h2>

                    <p className="text-sm text-zinc-400 mt-1">
                        View deadlines and acknowledge your submissions.
                    </p>
                </div>

                <span className="text-sm text-zinc-400">
                    {assignments.length} assignments
                </span>

            </div>

            {/* Empty state */}
            {assignments.length === 0 ? (

                <div className="bg-white rounded-2xl p-12 text-center">

                    <div className="text-4xl mb-4">
                        📝
                    </div>

                    <h3 className="text-lg font-semibold text-zinc-700">
                        No assignments yet
                    </h3>

                    <p className="text-sm text-zinc-400 mt-2">
                        Assignments for this course will appear here.
                    </p>

                </div>

            ) : (

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

                    {assignments.map((item) => {

                        const groupAssignment = isGroupAssignment(item);
                        const acknowledgment = getAcknowledgment(item);
                        const acknowledged = isAcknowledged(item);
                        const overdue = isOverdue(item);

                        const deadline = item.deadline || item.dueDate;
                        const oneDriveLink = item.oneDriveLink || item.driveLink;

                        const isLeader =
                            currentGroup &&
                            String(currentGroup.leaderId) === String(currentUser.id);

                        const acknowledgedBy =
                            acknowledgment?.acknowledgedBy || currentGroup?.leaderId;

                        const acknowledgedAt =
                            acknowledgment?.acknowledgedAt ||
                            acknowledgment?.submittedAt;

                        return (

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
                                        className={`text-xs font-medium px-3 py-1.5 rounded-full ${acknowledged
                                            ? "bg-green-100 text-green-700"
                                            : overdue
                                                ? "bg-red-100 text-red-700"
                                                : "bg-orange-100 text-orange-600"
                                            }`}
                                    >
                                        {acknowledged
                                            ? "Acknowledged"
                                            : overdue
                                                ? "Overdue"
                                                : "Pending"}
                                    </span>

                                </div>

                                {/* Submission type */}
                                <span className="inline-block text-xs font-medium bg-purple-50 text-[#7938EB] px-3 py-1.5 rounded-full mb-3">
                                    {groupAssignment ? "Group Submission" : "Individual Submission"}
                                </span>

                                {/* Description */}
                                <p className="text-sm text-zinc-500 leading-6 mb-5">
                                    {item.description || "No description provided."}
                                </p>

                                {/* Deadline */}
                                <div className="border-t border-zinc-100 pt-4 flex flex-wrap justify-between items-center gap-3">

                                    <div>
                                        <p className="text-xs text-zinc-400">
                                            Deadline
                                        </p>

                                        <p
                                            className={`text-sm font-medium mt-1 ${overdue ? "text-red-600" : "text-zinc-700"
                                                }`}
                                        >
                                            {formatDateTime(deadline)}
                                        </p>
                                    </div>

                                    {oneDriveLink && (
                                        <a
                                            href={oneDriveLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-[#7938EB] font-medium hover:underline"
                                        >
                                            ↗ Open OneDrive Link
                                        </a>
                                    )}

                                </div>

                                {/* Individual acknowledgment */}
                                {!groupAssignment && (

                                    <div className="mt-5 border-t border-zinc-100 pt-4">

                                        {acknowledged ? (

                                            <div className="bg-green-50 p-4 rounded-xl">

                                                <p className="text-sm font-medium text-green-700">
                                                    ✓ You have acknowledged this assignment.
                                                </p>

                                                <p className="text-xs text-green-600 mt-2">
                                                    Acknowledged on: {formatDateTime(acknowledgedAt)}
                                                </p>

                                            </div>

                                        ) : (

                                            <button
                                                type="button"
                                                onClick={() => openConfirmation(item)}
                                                className="w-full bg-[#7938EB] hover:bg-[#652BD0] text-white py-3 rounded-xl font-medium text-sm transition-all duration-300"
                                            >
                                                Yes, I have submitted
                                            </button>

                                        )}

                                    </div>

                                )}

                                {/* Group acknowledgment */}
                                {groupAssignment && (

                                    <div className="mt-5 border-t border-zinc-100 pt-4">

                                        {!currentGroup ? (

                                            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">

                                                <p className="text-sm text-orange-700 font-medium">
                                                    You are not part of any group. Create or join one to submit this assignment.
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={onOpenGroups}
                                                    className="mt-4 bg-[#7938EB] hover:bg-[#652BD0] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
                                                >
                                                    Create or Join Group
                                                </button>

                                            </div>

                                        ) : acknowledged ? (

                                            <div className="bg-green-50 p-4 rounded-xl">

                                                <p className="text-sm font-medium text-green-700">
                                                    ✓ Group assignment acknowledged.
                                                </p>

                                                <p className="text-xs text-green-600 mt-2">
                                                    Acknowledged by {getUserName(acknowledgedBy)} on{" "}
                                                    {formatDateTime(acknowledgedAt)}
                                                </p>

                                            </div>

                                        ) : isLeader ? (

                                            <button
                                                type="button"
                                                onClick={() => openConfirmation(item)}
                                                className="w-full bg-[#7938EB] hover:bg-[#652BD0] text-white py-3 rounded-xl font-medium text-sm transition-all duration-300"
                                            >
                                                Yes, I have submitted (Group Leader)
                                            </button>

                                        ) : (

                                            <div className="bg-purple-50 p-4 rounded-xl">

                                                <p className="text-sm text-[#7938EB] font-medium">
                                                    Only the group leader can acknowledge this assignment.
                                                </p>

                                                <p className="text-xs text-zinc-500 mt-2">
                                                    Group Leader: {getUserName(currentGroup.leaderId)}
                                                </p>

                                            </div>

                                        )}

                                    </div>

                                )}

                            </div>

                        );

                    })}

                </div>

            )}

            {/* Confirmation modal */}
            {selectedAssignment && (

                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

                    <div className="bg-white w-full max-w-md rounded-2xl p-7 shadow-2xl">

                        <h2 className="text-xl font-semibold text-zinc-800 text-center">
                            Confirm Submission
                        </h2>

                        <p className="text-sm text-zinc-500 text-center mt-3 leading-6">
                            Have you really submitted your{" "}
                            <span className="font-semibold text-zinc-700">
                                {selectedAssignment.title}
                            </span>{" "}
                            assignment?
                        </p>

                        {isGroupAssignment(selectedAssignment) && (
                            <p className="text-xs text-purple-600 text-center mt-3">
                                This acknowledgment will be visible to all members of your group.
                            </p>
                        )}

                        <p className="text-xs text-orange-500 text-center mt-3">
                            Please confirm only after submitting your work.
                        </p>

                        <div className="flex gap-3 mt-7">

                            <button
                                type="button"
                                onClick={() => setSelectedAssignment(null)}
                                disabled={submitting}
                                className="flex-1 border border-zinc-300 text-zinc-600 py-3 rounded-xl hover:bg-zinc-50 transition disabled:opacity-50"
                            >
                                Go Back
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmSubmission}
                                disabled={submitting}
                                className="flex-1 bg-[#7938EB] text-white py-3 rounded-xl hover:bg-[#652BD0] transition disabled:opacity-50"
                            >
                                {submitting ? "Submitting..." : "Confirm"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </section>
    );
}

export default StudentAssignments;
