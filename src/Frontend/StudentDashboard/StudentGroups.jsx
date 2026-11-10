
import { useState } from "react";

function StudentGroups({
	course,
	currentUser,
	users,
	groups,
	open,
	onOpen,
	onClose,
	onCreateGroup,
	onJoinGroup,
}) {
	const [groupAction, setGroupAction] = useState("create");
	const [groupName, setGroupName] = useState("");
	const [selectedGroupId, setSelectedGroupId] = useState("");


	// Helper functions

	const getMemberIds = (group) => {
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

	const getUserName = (userId) => {
		const user = users.find(
			(item) => String(item.id) === String(userId)
		);

		return user?.username || user?.name || user?.email || "Student";
	};


	// Find current student's group

	const currentGroup = groups.find(
		(group) =>
			String(group.courseId) === String(course.id) &&
			getMemberIds(group).includes(String(currentUser.id))
	);

	// Groups that the student can join
	const availableGroups = groups.filter(
		(group) =>
			String(group.courseId) === String(course.id) &&
			!getMemberIds(group).includes(String(currentUser.id))
	);

	const isLeader =
		currentGroup &&
		String(currentGroup.leaderId) === String(currentUser.id);


	// Create group

	const handleCreate = (e) => {
		e.preventDefault();

		const created = onCreateGroup(groupName);

		if (created) {
			setGroupName("");
			setSelectedGroupId("");
			onClose();
		}
	};


	// Join group


	const handleJoin = () => {
		if (!selectedGroupId) {
			return;
		}

		const joined = onJoinGroup(selectedGroupId);

		if (joined) {
			setSelectedGroupId("");
			onClose();
		}
	};


	// Close modal

	const handleClose = () => {
		setGroupName("");
		setSelectedGroupId("");
		setGroupAction("create");
		onClose();
	};


	// UI

	return (
		<>

			{/* GROUP INFORMATION */}

			<section className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 mb-7">

				<div className="flex flex-wrap justify-between items-center gap-4 mb-5">

					<div>

						<h2 className="text-lg font-semibold text-zinc-800">
							My Group
						</h2>

						<p className="text-sm text-zinc-400 mt-1">
							Your group details for {course.name}.
						</p>

					</div>

					{currentGroup && (

						<span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
							{isLeader ? "Group Leader" : "Group Member"}
						</span>

					)}

				</div>

				{currentGroup ? (

					<>

						<h3 className="text-lg font-semibold text-[#7938EB] mb-2">
							{currentGroup.name}
						</h3>

						<p className="text-sm text-zinc-500 mb-4">
							Leader: {getUserName(currentGroup.leaderId)}
						</p>

						<p className="text-sm font-medium text-zinc-700 mb-3">
							Group Members ({getMemberIds(currentGroup).length})
						</p>

						<div className="flex flex-wrap gap-2">

							{getMemberIds(currentGroup).map((memberId) => (

								<span
									key={memberId}
									className="bg-purple-50 text-[#7938EB] text-xs px-3 py-2 rounded-lg"
								>
									{getUserName(memberId)}

									{String(memberId) === String(currentGroup.leaderId)
										? " (Leader)"
										: ""}
								</span>

							))}

						</div>

					</>

				) : (

					<div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">

						<p className="text-sm font-medium text-orange-700">
							You have not joined a group in this course yet.
						</p>

						<p className="text-xs text-orange-600 mt-2">
							Create a new group or join an existing group to work on Group assignments.
						</p>

						<button
							type="button"
							onClick={() => {
								setGroupAction(
									availableGroups.length > 0 ? "join" : "create"
								);
								onOpen();
							}}
							className="mt-4 bg-[#7938EB] hover:bg-[#652BD0] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer"
						>
							Create or Join Group
						</button>

					</div>

				)}

			</section>

			{/* CREATE / JOIN GROUP MODAL */}

			{open && (

				<div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

					<div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 shadow-2xl">

						{/* Modal heading */}
						<div className="flex justify-between items-center mb-2">

							<h2 className="text-xl font-semibold text-zinc-800">
								Create or Join Group
							</h2>

							<button
								type="button"
								onClick={handleClose}
								className="text-2xl text-zinc-400 hover:text-red-500 cursor-pointer"
							>
								x
							</button>

						</div>

						<p className="text-sm text-zinc-500 mb-6">
							Choose how you want to join a group for {course.name}.
						</p>

						{/* Tabs */}
						<div className="flex gap-3 mb-6">

							<button
								type="button"
								onClick={() => setGroupAction("create")}
								className={`flex-1 py-3 rounded-lg border text-sm font-medium cursor-pointer ${groupAction === "create"
									? "bg-[#7938EB] text-white border-[#7938EB]"
									: "border-zinc-300 text-zinc-500 hover:bg-purple-50"
									}`}
							>
								Create Group
							</button>

							<button
								type="button"
								onClick={() => setGroupAction("join")}
								className={`flex-1 py-3 rounded-lg border text-sm font-medium transition cursor-pointer ${groupAction === "join"
									? "bg-[#7938EB] text-white border-[#7938EB]"
									: "border-zinc-300 text-zinc-500 hover:bg-purple-50"
									}`}
							>
								Join Group
							</button>

						</div>

						{/* Create group form */}
						{groupAction === "create" && (

							<div onSubmit={handleCreate}>

								<label className="block text-sm font-medium text-zinc-700 mb-2">
									Group Name
								</label>

								<input
									type="text"
									value={groupName}
									onChange={(e) => setGroupName(e.target.value)}
									placeholder="Enter group name"
									className="w-full border border-zinc-300 rounded-lg px-4 py-3 outline-none focus:border-[#7938EB] text-sm"
								/>

								<div className="bg-purple-50 p-4 rounded-xl mt-4">

									<p className="text-sm font-medium text-[#7938EB]">
										You will be the group leader.
									</p>

									<p className="text-xs text-zinc-500 mt-1">
										Other students can join your group.
									</p>

								</div>

								<button
									type="submit"
									className="w-full mt-6 bg-[#7938EB] hover:bg-[#652BD0] text-white py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer"
								>
									Create Group
								</button>

							</div>

						)}

						{/* Join group */}
						{groupAction === "join" && (

							<div>

								<p className="text-sm font-medium text-zinc-700 mb-3">
									Available Groups
								</p>

								{availableGroups.length === 0 ? (

									<div className="bg-purple-50 p-5 rounded-xl text-center">

										<p className="text-sm text-zinc-600">
											No existing groups are available in this course.
										</p>

										<button
											type="button"
											onClick={() => setGroupAction("create")}
											className="text-sm text-[#7938EB] font-semibold mt-3 hover:underline"
										>
											Create a new group instead
										</button>

									</div>

								) : (

									<>

										<div className="space-y-3 max-h-64 overflow-y-auto">

											{availableGroups.map((group) => (

												<button
													type="button"
													key={group.id}
													onClick={() => setSelectedGroupId(String(group.id))}
													className={`w-full text-left p-4 rounded-xl border transition ${String(selectedGroupId) === String(group.id)
														? "border-[#7938EB] bg-purple-50"
														: "border-zinc-200 hover:border-purple-300"
														}`}
												>

													<div className="flex justify-between items-center">

														<p className="font-medium text-zinc-800">
															{group.name}
														</p>

														{String(selectedGroupId) === String(group.id) && (
															<span className="text-[#7938EB] font-bold">
																✓
															</span>
														)}

													</div>

													<p className="text-xs text-zinc-400 mt-2">
														Leader: {getUserName(group.leaderId)}
													</p>

													<p className="text-xs text-zinc-400 mt-1">
														{getMemberIds(group).length} members
													</p>

												</button>

											))}

										</div>

										<button
											type="button"
											onClick={handleJoin}
											disabled={!selectedGroupId}
											className="w-full mt-6 bg-[#7938EB] hover:bg-[#652BD0] disabled:bg-zinc-300 text-white py-3 rounded-xl font-medium transition"
										>
											Join Selected Group
										</button>

									</>

								)}

							</div>

						)}

					</div>

				</div>

			)}

		</>
	);
}

export default StudentGroups;
