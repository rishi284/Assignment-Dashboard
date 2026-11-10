
function AdminOverview({
    professorName,
    courses,
    stats,
    courseStats,
    onCreateCourse,
    onSelectCourse,
}) {
    return (
        <div>

            {/* Welcome section */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-9">

                <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-800">
                        Welcome back, {professorName}! 👋
                    </h1>

                    <p className="text-zinc-400 mt-2 text-sm">
                        Manage your courses, assignments and student progress.
                    </p>
                </div>


            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">

                    <p className="text-sm text-zinc-500">
                        My Courses
                    </p>

                    <h2 className="text-3xl font-bold text-[#7938EB] mt-3">
                        {String(stats.totalCourses).padStart(2, "0")}
                    </h2>

                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">

                    <p className="text-sm text-zinc-500">
                        Total Assignments
                    </p>

                    <h2 className="text-3xl font-bold text-green-600 mt-3">
                        {String(stats.totalAssignments).padStart(2, "0")}
                    </h2>

                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">

                    <p className="text-sm text-zinc-500">
                        Pending Submissions
                    </p>

                    <h2 className="text-3xl font-bold text-orange-500 mt-3">
                        {String(stats.pendingCount).padStart(2, "0")}
                    </h2>

                </div>

            </div>

            {/* Overall progress */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 mb-9">

                <div className="flex justify-between items-center mb-4">

                    <div>
                        <h2 className="font-semibold text-zinc-800">
                            Overall Submission Progress
                        </h2>

                        <p className="text-sm text-zinc-400 mt-1">
                            {stats.submittedCount} of {stats.expectedCount} acknowledgments completed
                        </p>
                    </div>

                    <span className="text-xl font-bold text-[#7938EB]">
                        {stats.overallProgress}%
                    </span>

                </div>

                <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden">

                    <div
                        className="h-full bg-[#7938EB] rounded-full transition-all duration-500"
                        style={{
                            width: `${stats.overallProgress}%`,
                        }}
                    />

                </div>

            </div>

            {/* Course heading */}
            <div id="courses">

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
                        type="button"
                        onClick={onCreateCourse}
                        className="bg-[#7938EB] hover:bg-[#652BD0] text-white px-5 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer"
                    >
                        + Create Course
                    </button>

                </div>

                {/* Empty courses */}
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

                        <button
                            type="button"
                            onClick={onCreateCourse}
                            className="mt-5 bg-[#7938EB] hover:bg-[#652BD0] text-white px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                        >
                            Create Course
                        </button>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

                        {courses.map((course) => {

                            const courseInfo = courseStats[course.id] || {
                                assignmentCount: 0,
                                studentCount: 0,
                                progress: 0,
                            };

                            return (

                                <button
                                    type="button"
                                    key={course.id}
                                    onClick={() => onSelectCourse(course.id)}
                                    className="text-left bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300"
                                >

                                    <div className="flex justify-between items-start mb-5">

                                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                                            📘
                                        </div>

                                        <span className="text-xs font-medium bg-purple-50 text-[#7938EB] px-3 py-1.5 rounded-full">
                                            {courseInfo.assignmentCount} assignments
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

                                    {/* Course details */}
                                    <div className="flex gap-6 mt-6">

                                        <div>
                                            <p className="text-xl font-bold text-[#7938EB]">
                                                {courseInfo.studentCount}
                                            </p>

                                            <p className="text-xs text-zinc-400">
                                                Students
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xl font-bold text-[#7938EB]">
                                                {courseInfo.assignmentCount}
                                            </p>

                                            <p className="text-xs text-zinc-400">
                                                Assignments
                                            </p>
                                        </div>

                                    </div>

                                    {/* Course progress */}
                                    <div className="mt-6">

                                        <div className="flex justify-between text-xs mb-2">

                                            <span className="text-zinc-500">
                                                Submission Progress
                                            </span>

                                            <span className="font-semibold text-[#7938EB]">
                                                {courseInfo.progress}%
                                            </span>

                                        </div>

                                        <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">

                                            <div
                                                className="h-full bg-[#7938EB] rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${courseInfo.progress}%`,
                                                }}
                                            />

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

            </div>

        </div>
    );
}

export default AdminOverview;
