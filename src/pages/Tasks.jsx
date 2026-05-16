// ============================================
// MASTER TASKS MODULE
// ============================================

import { useState, useEffect } from "react"
import { initialTasks, projects } from "../data/store"

// ============================================
// PRIORITY SCORE CALCULATOR
// ============================================

function calculatePriorityScore(task) {
  let score = 0
  const today = new Date()
  const target = new Date(task.targetDate)
  const daysRemaining = Math.ceil((target - today) / (1000 * 60 * 60 * 24))

  if (daysRemaining < 0) score += 100
  else if (daysRemaining <= 3) score += 60
  else if (daysRemaining <= 7) score += 30
  else if (daysRemaining <= 14) score += 15
  if (task.priority === "High") score += 30
  else if (task.priority === "Medium") score += 15
  else if (task.priority === "Low") score += 5
  if (task.blockingItems) score += 20
  if (task.status === "Ongoing") score += 10
  if (task.status === "Pending") score += 5

  return score
}

// ============================================
// DAYS REMAINING BADGE
// ============================================

function DaysBadge({ targetDate }) {
  if (!targetDate) return <span className="text-xs text-gray-600">No date</span>
  const today = new Date()
  const target = new Date(targetDate)
  const days = Math.ceil((target - today) / (1000 * 60 * 60 * 24))

  if (days < 0) return <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 font-bold">{Math.abs(days)}d OVERDUE</span>
  if (days === 0) return <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 font-bold">DUE TODAY</span>
  if (days <= 3) return <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 font-bold">{days}d left</span>
  if (days <= 7) return <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">{days}d left</span>
  return <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">{days}d left</span>
}

// ============================================
// PRIORITY BADGE
// ============================================

function PriorityBadge({ priority }) {
  const colors = {
    High: "bg-red-500/20 text-red-400 border border-red-500/30",
    Medium: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    Low: "bg-green-500/20 text-green-400 border border-green-500/30",
  }
  return <span className={`text-xs px-2 py-1 rounded-full ${colors[priority] || colors.Low}`}>{priority}</span>
}

// ============================================
// STATUS BADGE
// ============================================

function StatusBadge({ status }) {
  const colors = {
    "Not Started": "bg-gray-500/20 text-gray-400",
    "Ongoing": "bg-blue-500/20 text-blue-400",
    "Pending": "bg-yellow-500/20 text-yellow-400",
    "Done": "bg-green-500/20 text-green-400",
    "On Hold": "bg-purple-500/20 text-purple-400",
  }
  return <span className={`text-xs px-2 py-1 rounded-full ${colors[status] || colors["Not Started"]}`}>{status}</span>
}

// ============================================
// ADD/EDIT TASK MODAL
// ============================================

function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState(task || {
    project: projects[0].name,
    area: "",
    activity: "",
    priority: "Medium",
    status: "Not Started",
    startDate: "",
    targetDate: "",
    blockingItems: "",
    dependencies: "",
    nextAction: "",
    responsible: "",
    remarks: "",
    dateType: "Fixed Date",
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    if (!form.activity) return alert("Activity description is required")
    if (!form.project) return alert("Project is required")
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-bold text-lg">
            {task ? "✏️ Edit Task" : "➕ Add New Task"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">

          {/* Project & Area */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Project *</label>
              <select name="project" value={form.project} onChange={handleChange}
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Area / Location</label>
              <input name="area" value={form.area} onChange={handleChange} placeholder="e.g. Foundation"
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
          </div>

          {/* Activity */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">Activity Description *</label>
            <input name="activity" value={form.activity} onChange={handleChange} placeholder="e.g. Pour concrete slab"
              className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                <option>Not Started</option>
                <option>Ongoing</option>
                <option>Pending</option>
                <option>Done</option>
                <option>On Hold</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Start Date</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange}
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Target Date</label>
              <input type="date" name="targetDate" value={form.targetDate} onChange={handleChange}
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Date Type</label>
              <select name="dateType" value={form.dateType} onChange={handleChange}
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                <option>Fixed Date</option>
                <option>Estimated</option>
                <option>No Deadline</option>
                <option>On Hold</option>
              </select>
            </div>
          </div>

          {/* Blocking Items & Dependencies */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Blocking Items</label>
              <input name="blockingItems" value={form.blockingItems} onChange={handleChange} placeholder="e.g. Awaiting approval"
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Dependencies</label>
              <input name="dependencies" value={form.dependencies} onChange={handleChange} placeholder="e.g. Task #1 must finish first"
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
          </div>

          {/* Next Action & Responsible */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Next Action</label>
              <input name="nextAction" value={form.nextAction} onChange={handleChange} placeholder="e.g. Follow up supplier"
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Responsible Person</label>
              <input name="responsible" value={form.responsible} onChange={handleChange} placeholder="e.g. Juan"
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">Remarks</label>
            <textarea name="remarks" value={form.remarks} onChange={handleChange} placeholder="Additional notes..."
              rows={3}
              className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-800">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit}
            className="px-6 py-2 text-sm bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors">
            {task ? "Save Changes" : "Add Task"}
          </button>
        </div>

      </div>
    </div>
  )
}

// ============================================
// MAIN TASKS PAGE
// ============================================

function Tasks({ inboxTasks = [] }) {
  const [tasks, setTasks] = useState(
    initialTasks.map(t => ({ ...t, score: calculatePriorityScore(t) }))
  )

  // Merge inbox tasks when they arrive
  useEffect(() => {
    if (inboxTasks.length > 0) {
      setTasks(prev => [
        ...prev,
        ...inboxTasks.map(t => ({ ...t, score: calculatePriorityScore(t) }))
      ])
    }
  }, [inboxTasks])
  const [selectedProject, setSelectedProject] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedPriority, setSelectedPriority] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [sortBy, setSortBy] = useState("score")

  // Filtering
  const filteredTasks = tasks
    .filter(t => selectedProject === "All" ? true : t.project === selectedProject)
    .filter(t => selectedStatus === "All" ? true : t.status === selectedStatus)
    .filter(t => selectedPriority === "All" ? true : t.priority === selectedPriority)
    .filter(t => searchQuery === "" ? true :
      t.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.responsible.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(t => t.status !== "Done")
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score
      if (sortBy === "targetDate") return new Date(a.targetDate) - new Date(b.targetDate)
      if (sortBy === "priority") {
        const order = { High: 0, Medium: 1, Low: 2 }
        return order[a.priority] - order[b.priority]
      }
      return 0
    })

  // Add Task
  const handleAddTask = (form) => {
    const newTask = {
      ...form,
      id: Date.now(),
      score: calculatePriorityScore(form),
      createdDate: new Date().toISOString().split("T")[0],
      updatedDate: new Date().toISOString().split("T")[0],
    }
    setTasks([...tasks, newTask])
    setShowModal(false)
  }

  // Edit Task
  const handleEditTask = (form) => {
    setTasks(tasks.map(t => t.id === editingTask.id
      ? { ...form, id: t.id, score: calculatePriorityScore(form), updatedDate: new Date().toISOString().split("T")[0] }
      : t
    ))
    setEditingTask(null)
    setShowModal(false)
  }

  // Delete Task
  const handleDeleteTask = (id) => {
    if (window.confirm("Delete this task?")) {
      setTasks(tasks.filter(t => t.id !== id))
    }
  }

  // Mark Done
  const handleMarkDone = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: "Done" } : t))
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">✅ Master Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">{filteredTasks.length} active tasks</p>
        </div>
        <button
          onClick={() => { setEditingTask(null); setShowModal(true) }}
          className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-300 transition-colors">
          ➕ Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <input
          placeholder="🔍 Search tasks..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="lg:col-span-2 bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-400"
        />
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
          <option value="All">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>
        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
          <option value="All">All Statuses</option>
          <option>Not Started</option>
          <option>Ongoing</option>
          <option>Pending</option>
          <option>On Hold</option>
        </select>
        <select value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
          <option value="All">All Priorities</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      {/* Sort Bar */}
      <div className="flex items-center gap-3">
        <span className="text-gray-500 text-xs uppercase tracking-wider">Sort by:</span>
        {["score", "targetDate", "priority"].map(s => (
          <button key={s} onClick={() => setSortBy(s)}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${sortBy === s ? "bg-yellow-400 text-gray-900 font-bold" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            {s === "score" ? "Priority Score" : s === "targetDate" ? "Target Date" : "Priority Level"}
          </button>
        ))}
      </div>

      {/* Tasks Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Score</th>
                <th className="text-left px-4 py-3">Project</th>
                <th className="text-left px-4 py-3">Activity</th>
                <th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Target Date</th>
                <th className="text-left px-4 py-3">Days Left</th>
                <th className="text-left px-4 py-3">Next Action</th>
                <th className="text-left px-4 py-3">Responsible</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center text-gray-500 py-10">
                    No tasks found. Add your first task!
                  </td>
                </tr>
              )}
              {filteredTasks.map((task, index) => (
                <tr key={task.id}
                  className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${index % 2 === 0 ? "bg-gray-900" : "bg-gray-800/20"}`}>
                  <td className="px-4 py-3">
                    <span className="text-yellow-400 font-bold">{task.score}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-xs">{task.project}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{task.activity}</p>
                      {task.area && <p className="text-gray-500 text-xs">{task.area}</p>}
                      {task.blockingItems && (
                        <p className="text-red-400 text-xs mt-1">⚠ {task.blockingItems}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-xs">{task.targetDate || "—"}</span>
                  </td>
                  <td className="px-4 py-3"><DaysBadge targetDate={task.targetDate} /></td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-xs">{task.nextAction || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-xs">{task.responsible || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingTask(task); setShowModal(true) }}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        ✏️
                      </button>
                      <button
                        onClick={() => handleMarkDone(task.id)}
                        className="text-xs text-green-400 hover:text-green-300 transition-colors">
                        ✅
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <TaskModal
          task={editingTask}
          onSave={editingTask ? handleEditTask : handleAddTask}
          onClose={() => { setShowModal(false); setEditingTask(null) }}
        />
      )}

    </div>
  )
}

export default Tasks