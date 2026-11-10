
function StudentOverview({
  currentUser,
  courses,
  stats,
  courseStats,
  onSelectCourse,
}) {
  const studentName =
    currentUser?.username ||
    currentUser?.name ||
    currentUser?.email ||
    "Student";

  return (
    <div>

      {/* Welcome section */}
      <section className="flex flex-wrap justify-between items-center gap-4 mb-9">

        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-800">
            Hello, {studentName}! 👋
          </h1>

          <p className="text-zinc-400 mt-2 text-sm">
            Here's your learning and assignment overview.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">

          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-[#7938EB] font-bold">
            {studentName.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-700">
              {studentName}
            </p>

            <p className="text-xs text-zinc-400">
              Student
            </p>
          </div>

        </div>

      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">

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

          <h2 className="text-3xl font-bold text-zinc-800 mt-3">
            {String(stats.totalAssignments).padStart(2, "0")}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <p className="text-sm text-zinc-500">
            Pending Acknowledgments
          </p>

          <h2 className="text-3xl font-bold text-orange-500 mt-3">
            {String(stats.pendingCount).padStart(2, "0")}
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
              {stats.acknowledgedCount} of {stats.totalAssignments} assignments acknowledged
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

      </section>

      {/* Courses */}
      <section id="courses">

        <div className="flex justify-between items-center mb-5">

          <div>
            <h2 className="text-xl font-semibold text-zinc-800">
              My Courses
            </h2>

            <p className="text-sm text-zinc-400 mt-1">
              Select a course to view its assignments.
            </p>
          </div>

          <span className="text-sm text-zinc-400">
            {courses.length} courses
          </span>

        </div>

        {courses.length === 0 ? (

          <div className="bg-white rounded-2xl p-12 text-center border border-zinc-100">

            <div className="text-4xl mb-4">
              📚
            </div>

            <h3 className="text-lg font-semibold text-zinc-700">
              No courses available
            </h3>

            <p className="text-sm text-zinc-400 mt-2">
              Your enrolled courses will appear here.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

            {courses.map((course) => {

              const courseProgress = courseStats[course.id] || {
                total: 0,
                acknowledged: 0,
                pending: 0,
                progress: 0,
              };

              return (

                <button
                  key={course.id}
                  type="button"
                  onClick={() => onSelectCourse(course.id)}
                  className="text-left bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300"
                >

                  <div className="flex justify-between items-start mb-5">

                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                      📘
                    </div>

                    <span className="text-xs font-medium bg-purple-50 text-[#7938EB] px-3 py-1.5 rounded-full">
                      {courseProgress.total} assignments
                    </span>

                  </div>

                  <h3 className="text-lg font-semibold text-zinc-800">
                    {course.name || course.title || "Untitled Course"}
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

                  {/* Course progress */}
                  <div className="mt-6">

                    <div className="flex justify-between text-xs mb-2">

                      <span className="text-zinc-500">
                        Assignment Progress
                      </span>

                      <span className="font-semibold text-[#7938EB]">
                        {courseProgress.progress}%
                      </span>

                    </div>

                    <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">

                      <div
                        className="h-full bg-[#7938EB] rounded-full transition-all duration-500"
                        style={{
                          width: `${courseProgress.progress}%`,
                        }}
                      />

                    </div>

                  </div>

                  <div className="flex justify-between items-center mt-6 text-sm">

                    <span className="text-zinc-500">
                      View assignments
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

    </div>
  );
}

export default StudentOverview;
