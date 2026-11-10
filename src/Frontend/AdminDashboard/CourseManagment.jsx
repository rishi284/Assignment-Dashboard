
import { useEffect, useState } from "react";


// COURSE MODAL


export function AdminCourseModal({
    open,
    studentCount,
    onClose,
    onSave,
}) {
    const [courseForm, setCourseForm] = useState({
        name: "",
        code: "",
        description: "",
    });

    // Reset form whenever modal opens
    useEffect(() => {
        if (open) {
            setCourseForm({
                name: "",
                code: "",
                description: "",
            });
        }
    }, [open]);

    if (!open) {
        return null;
    }

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setCourseForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Submit course
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(courseForm);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 shadow-2xl">

                {/* Modal heading */}
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
                        onClick={onClose}
                        className="text-zinc-400 hover:text-red-500 text-2xl cursor-pointer"
                    >
                        x
                    </button>

                </div>

                {/* Course form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Course name */}
                    <div>
                        <p className="text-sm font-medium text-zinc-700">
                            Course Name
                        </p>

                        <input
                            type="text"
                            name="name"
                            value={courseForm.name}
                            onChange={handleChange}
                            placeholder="e.g. Web Development"
                            className="w-full mt-2 px-4 py-3 border border-zinc-300 rounded-lg outline-none focus:border-[#7938EB] text-sm"
                        />
                    </div>

                    {/* Course code */}
                    <div>
                        <p className="text-sm font-medium text-zinc-700">
                            Course Code
                        </p>

                        <input
                            type="text"
                            name="code"
                            value={courseForm.code}
                            onChange={handleChange}
                            placeholder="e.g. CSE301"
                            className="w-full mt-2 px-4 py-3 border border-zinc-300 rounded-lg outline-none focus:border-[#7938EB] text-sm"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <p className="text-sm font-medium text-zinc-700">
                            Course Description
                        </p>

                        <textarea
                            rows="3"
                            name="description"
                            value={courseForm.description}
                            onChange={handleChange}
                            placeholder="Enter a short course description"
                            className="w-full mt-2 px-4 py-3 border border-zinc-300 rounded-lg outline-none focus:border-[#7938EB] text-sm resize-none"
                        />
                    </div>

                    {/* Enrollment information */}
                    <div className="bg-purple-50 p-4 rounded-xl">

                        <p className="text-sm font-medium text-[#7938EB]">
                            Student Enrollment
                        </p>

                        <p className="text-xs text-zinc-500 mt-1">
                            All registered students, including students who register later, can access this course.
                        </p>

                        <p className="text-sm font-semibold text-zinc-700 mt-2">
                            {studentCount} currently registered students
                        </p>

                    </div>

                    {/* Create button */}
                    <button
                        type="submit"
                        className="w-full bg-[#7938EB] hover:bg-[#652BD0] text-white py-3 rounded-xl font-medium transition"
                    >
                        Create Course
                    </button>

                </form>

            </div>
        </div>
    );
}



// ASSIGNMENT MODAL


export function AdminAssignmentModal({
    open,
    course,
    assignment,
    onClose,
    onSave,
}) {
    const [assignmentForm, setAssignmentForm] = useState({
        title: "",
        description: "",
        deadline: "",
        oneDriveLink: "",
        submissionType: "Individual",
    });

    // Convert saved date into datetime-local format
    const formatDateTimeInput = (value) => {
        if (!value) {
            return "";
        }

        // Handle old date-only values
        if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
            return `${value}T23:59`;
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const localDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000
        );

        return localDate.toISOString().slice(0, 16);
    };

    // Populate or reset form
    useEffect(() => {
        if (open) {
            if (assignment) {
                setAssignmentForm({
                    title: assignment.title || "",
                    description: assignment.description || "",
                    deadline: formatDateTimeInput(
                        assignment.deadline || assignment.dueDate
                    ),
                    oneDriveLink:
                        assignment.oneDriveLink || assignment.driveLink || "",
                    submissionType: assignment.submissionType || "Individual",
                });
            } else {
                setAssignmentForm({
                    title: "",
                    description: "",
                    deadline: "",
                    oneDriveLink: "",
                    submissionType: "Individual",
                });
            }
        }
    }, [open, assignment]);

    if (!open) {
        return null;
    }

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setAssignmentForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // Submit assignment
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(assignmentForm);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 shadow-2xl">

                {/* Modal heading */}
                <div className="flex justify-between items-center mb-7">

                    <div>
                        <h2 className="text-2xl font-semibold text-zinc-800">
                            {assignment ? "Edit Assignment" : "Create Assignment"}
                        </h2>

                        <p className="text-sm text-zinc-400 mt-1">
                            Course: {course?.name}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-zinc-400 hover:text-red-500 text-2xl"
                    >
                        x
                    </button>

                </div>

                {/* Assignment form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Title */}
                    <div>
                        <p className="text-sm font-medium text-zinc-700">
                            Assignment Title
                        </p>

                        <input
                            type="text"
                            name="title"
                            value={assignmentForm.title}
                            onChange={handleChange}
                            placeholder="Enter assignment title"
                            className="w-full mt-2 px-4 py-3 border border-zinc-300 rounded-lg outline-none focus:border-[#7938EB] text-sm"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <p className="text-sm font-medium text-zinc-700">
                            Description
                        </p>

                        <textarea
                            rows="3"
                            name="description"
                            value={assignmentForm.description}
                            onChange={handleChange}
                            placeholder="Enter assignment description"
                            className="w-full mt-2 px-4 py-3 border border-zinc-300 rounded-lg outline-none focus:border-[#7938EB] text-sm resize-none"
                        />
                    </div>

                    {/* Deadline */}
                    <div>
                        <p className="text-sm font-medium text-zinc-700">
                            Deadline (Date and Time)
                        </p>

                        <input
                            type="datetime-local"
                            name="deadline"
                            value={assignmentForm.deadline}
                            onChange={handleChange}
                            className="w-full mt-2 px-4 py-3 border border-zinc-300 rounded-lg outline-none focus:border-[#7938EB] text-sm"
                        />
                    </div>

                    {/* OneDrive link */}
                    <div>
                        <p className="text-sm font-medium text-zinc-700">
                            OneDrive Link
                        </p>

                        <input
                            type="text"
                            name="oneDriveLink"
                            value={assignmentForm.oneDriveLink}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="w-full mt-2 px-4 py-3 border border-zinc-300 rounded-lg outline-none focus:border-[#7938EB] text-sm"
                        />
                    </div>

                    {/* Submission type */}
                    <div>
                        <p className="text-sm font-medium text-zinc-700">
                            Submission Type
                        </p>

                        <select
                            name="submissionType"
                            value={assignmentForm.submissionType}
                            onChange={handleChange}
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

                    {/* Submission information */}
                    <div className="bg-purple-50 p-4 rounded-xl">

                        <p className="text-sm font-medium text-[#7938EB]">
                            {assignmentForm.submissionType === "Individual"
                                ? "Individual Submission"
                                : "Group Submission"}
                        </p>

                        <p className="text-xs text-zinc-500 mt-1">
                            {assignmentForm.submissionType === "Individual"
                                ? "Each student must acknowledge their own submission."
                                : "Only the group leader can acknowledge the group's submission."}
                        </p>

                    </div>

                    {/* Save button */}
                    <button
                        type="submit"
                        className="w-full bg-[#7938EB] hover:bg-[#652BD0] text-white py-3 rounded-xl font-medium transition"
                    >
                        {assignment ? "Update Assignment" : "Create Assignment"}
                    </button>

                </form>

            </div>
        </div>
    );
}



// DELETE ASSIGNMENT MODAL


export function AdminDeleteModal({
    open,
    assignmentTitle,
    onCancel,
    onConfirm,
}) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-md rounded-2xl p-7 shadow-2xl">

                <div className="text-center">

                    <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center text-2xl mb-4">
                        🗑️
                    </div>

                    <h2 className="text-xl font-semibold text-zinc-800">
                        Delete Assignment?
                    </h2>

                    <p className="text-sm text-zinc-500 mt-3 leading-6">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-zinc-700">
                            {assignmentTitle}
                        </span>
                        ?
                    </p>

                    <p className="text-xs text-red-500 mt-2">
                        Its acknowledgment records will also be deleted.
                    </p>

                </div>

                <div className="flex gap-3 mt-7">

                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 border border-zinc-300 text-zinc-600 py-3 rounded-xl hover:bg-zinc-50 transition"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl transition"
                    >
                        Yes, Delete
                    </button>

                </div>

            </div>
        </div>
    );
}
