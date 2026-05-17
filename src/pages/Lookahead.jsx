// ============================================
// TWO-WEEK LOOKAHEAD - WITH SUPABASE
// ============================================

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { useProjects } from "../useProjects"

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
// DAYS BADGE
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
  return <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">{days}d left</span>
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
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colors[priority] || colors.Low}`}>
      {priority}
    </span>
  )
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
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colors[status] || colors["Not Started"]}`}>
      {status}
    </span>
  )
}

// ============================================
// DATE HEADER
// ============================================

function DateHeader({ date }) {
  const d = new Date(date)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  const dayName = d.toLocaleDateString("en-US", { weekday: "short" })
  const dayNum = d.getDate()
  const month = d.toLocaleDateString("en-US", { month: "short" })

  return (
    <div className={`text-center p-2 rounded-lg ${isToday ? "bg-yellow-400 text-gray-900" : "bg-gray-800 text-gray-300"}`}>
      <p className="text-xs font-bold">{dayName}</p>
      <p className="text-lg font-bold">{dayNum}</p>
      <p className="text-xs">{month}</p>
    </div>
  )
}

// ============================================
// MAIN LOOKAHEAD PAGE
// ============================================

function Lookahead() {
  const { projects } = useProjects()
  const [selectedProject, setSelectedProject] = useState("All")
  const [tasks, setTasks] = useState([])
  const [materials, setMaterials] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const today = new Date()

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [tasksRes, materialsRes, plansRes] = await Promise.all([
        supabase.from("tasks").select("*"),
        supabase.from("materials").select("*"),
        supabase.from("plans").select("*"),
      ])

      if (tasksRes.data) {
        setTasks(tasksRes.data.map(t => ({
          id: t.id,
          project: t.project,
          area: t.area || "",
          activity: t.activity,
          priority: t.priority,
          status: t.status,
          targetDate: t.target_date || "",
          blockingItems: t.blocking_items || "",
          nextAction: t.next_action || "",
          responsible: t.responsible || "",
          score: calculatePriorityScore({
            targetDate: t.target_date,
            priority: t.priority,
            blockingItems: t.blocking_items,
            status: t.status,
          }),
        })))
      }

      if (materialsRes.data) {
        setMaterials(materialsRes.data.map(m => ({
          id: m.id,
          project: m.project,
          materialName: m.material_name,
          quantity: m.quantity || "",
          unit: m.unit || "",
          neededOnSiteDate: m.needed_on_site_date || "",
          requestStatus: m.request_status || "Not Requested",
        })))
      }

      if (plansRes.data) {
        setPlans(plansRes.data.map(p => ({
          id: p.id,
          project: p.project,
          planType: p.plan_type,
          neededForActivity: p.needed_for_activity || "",
          neededByDate: p.needed_by_date || "",
          status: p.status || "Not Requested",
        })))
      }

    } catch (error) {
      console.error("Error fetching lookahead data:", error)
    }
    setLoading(false)
  }

  // Generate next 14 days
  const next14Days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    return date.toISOString().split("T")[0]
  })

  // Filter tasks for lookahead
  const lookaheadTasks = tasks
    .filter(t => t.targetDate)
    .filter(t => t.status !== "Done")
    .filter(t => {
      const days = Math.ceil((new Date(t.targetDate) - today) / (1000 * 60 * 60 * 24))
      return days <= 14
    })
    .filter(t => selectedProject === "All" ? true : t.project === selectedProject)
    .sort((a, b) => b.score - a.score)

  // Materials due in 14 days
  const lookaheadMaterials = materials
    .filter(m => m.neededOnSiteDate)
    .filter(m => m.requestStatus !== "Delivered")
    .filter(m => {
      const days = Math.ceil((new Date(m.neededOnSiteDate) - today) / (1000 * 60 * 60 * 24))
      return days <= 14
    })
    .filter(m => selectedProject === "All" ? true : m.project === selectedProject)

  // Plans due in 14 days
  const lookaheadPlans = plans
    .filter(p => p.neededByDate)
    .filter(p => p.status !== "Issued to Site")
    .filter(p => {
      const days = Math.ceil((new Date(p.neededByDate) - today) / (1000 * 60 * 60 * 24))
      return days <= 14
    })
    .filter(p => selectedProject === "All" ? true : p.project === selectedProject)

  // Group tasks by date for calendar
  const tasksByDate = next14Days.reduce((acc, date) => {
    acc[date] = lookaheadTasks.filter(t => t.targetDate === date)
    return acc
  }, {})

  // Overdue tasks
  const overdueTasks = lookaheadTasks.filter(t => {
    const days = Math.ceil((new Date(t.targetDate) - today) / (1000 * 60 * 60 * 24))
    return days < 0
  })

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">📅 Two-Week Lookahead</h1>
          <p className="text-gray-500 text-sm mt-1">
            {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            {" → "}
            {new Date(today.getTime() + 13 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-400">
          <option value="All">All Projects</option>
          {(projects || []).map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <p className="text-yellow-400 text-lg animate-pulse">⚡ Loading lookahead...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-red-500/30 rounded-xl p-4 text-center">
              <p className="text-red-400 text-2xl font-bold">{overdueTasks.length}</p>
              <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Overdue Tasks</p>
            </div>
            <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-4 text-center">
              <p className="text-yellow-400 text-2xl font-bold">{lookaheadTasks.length}</p>
              <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Tasks in 14 Days</p>
            </div>
            <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-4 text-center">
              <p className="text-orange-400 text-2xl font-bold">{lookaheadMaterials.length}</p>
              <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Materials Due</p>
            </div>
            <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-4 text-center">
              <p className="text-blue-400 text-2xl font-bold">{lookaheadPlans.length}</p>
              <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Plans Due</p>
            </div>
          </div>

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className="bg-gray-900 border border-red-500/30 rounded-xl p-5">
              <h2 className="text-red-400 font-bold text-lg mb-4">🔴 Overdue — Immediate Attention Required</h2>
              <div className="space-y-2">
                {overdueTasks.map(task => (
                  <div key={task.id} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm">{task.activity}</p>
                      <p className="text-gray-400 text-xs mt-1">{task.project} · {task.area}</p>
                      {task.blockingItems && <p className="text-red-400 text-xs mt-1">⚠ {task.blockingItems}</p>}
                      {task.nextAction && <p className="text-yellow-400 text-xs mt-1">→ {task.nextAction}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                      <DaysBadge targetDate={task.targetDate} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority Task List */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-bold text-lg mb-4">🎯 All Tasks — Next 14 Days (By Priority)</h2>
            {lookaheadTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No tasks scheduled in the next 14 days.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                      <th className="text-left px-4 py-3">Score</th>
                      <th className="text-left px-4 py-3">Target Date</th>
                      <th className="text-left px-4 py-3">Days Left</th>
                      <th className="text-left px-4 py-3">Project</th>
                      <th className="text-left px-4 py-3">Activity</th>
                      <th className="text-left px-4 py-3">Priority</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Blocking Item</th>
                      <th className="text-left px-4 py-3">Next Action</th>
                      <th className="text-left px-4 py-3">Responsible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lookaheadTasks.map((task, index) => (
                      <tr key={task.id}
                        className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${index % 2 === 0 ? "bg-gray-900" : "bg-gray-800/20"}`}>
                        <td className="px-4 py-3"><span className="text-yellow-400 font-bold">{task.score}</span></td>
                        <td className="px-4 py-3"><span className="text-gray-300 text-xs">{task.targetDate}</span></td>
                        <td className="px-4 py-3"><DaysBadge targetDate={task.targetDate} /></td>
                        <td className="px-4 py-3"><span className="text-gray-300 text-xs">{task.project}</span></td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-white font-medium">{task.activity}</p>
                            {task.area && <p className="text-gray-500 text-xs">{task.area}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
                        <td className="px-4 py-3"><StatusBadge status={task.status} /></td>
                        <td className="px-4 py-3">
                          {task.blockingItems
                            ? <span className="text-red-400 text-xs">⚠ {task.blockingItems}</span>
                            : <span className="text-gray-600 text-xs">—</span>}
                        </td>
                        <td className="px-4 py-3"><span className="text-gray-400 text-xs">{task.nextAction || "—"}</span></td>
                        <td className="px-4 py-3"><span className="text-gray-400 text-xs">{task.responsible || "—"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Calendar View */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-bold text-lg mb-4">📆 14-Day Calendar View</h2>
            <div className="grid grid-cols-7 gap-2">
              {next14Days.map(date => (
                <div key={date}>
                  <DateHeader date={date} />
                  <div className="mt-2 space-y-1 min-h-16">
                    {tasksByDate[date].length === 0 && (
                      <p className="text-gray-700 text-xs text-center mt-2">—</p>
                    )}
                    {tasksByDate[date].map(task => (
                      <div key={task.id}
                        className={`text-xs p-1 rounded text-center truncate ${
                          task.priority === "High" ? "bg-red-500/20 text-red-300" :
                          task.priority === "Medium" ? "bg-yellow-500/20 text-yellow-300" :
                          "bg-green-500/20 text-green-300"}`}
                        title={`${task.project}: ${task.activity}`}>
                        {task.activity.slice(0, 12)}...
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Materials & Plans Due */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-5">
              <h2 className="text-orange-400 font-bold mb-4">🏗️ Materials Due in 14 Days</h2>
              {lookaheadMaterials.length === 0 ? (
                <p className="text-gray-500 text-sm">No materials due in the next 14 days.</p>
              ) : (
                <div className="space-y-2">
                  {lookaheadMaterials.map(m => (
                    <div key={m.id} className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                      <p className="text-white text-sm font-medium">{m.materialName}</p>
                      <p className="text-gray-400 text-xs">{m.project}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-400 text-xs">{m.quantity} {m.unit}</span>
                        <DaysBadge targetDate={m.neededOnSiteDate} />
                      </div>
                      <p className="text-orange-400 text-xs mt-1">Status: {m.requestStatus}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-5">
              <h2 className="text-blue-400 font-bold mb-4">📐 Plans Due in 14 Days</h2>
              {lookaheadPlans.length === 0 ? (
                <p className="text-gray-500 text-sm">No plans due in the next 14 days.</p>
              ) : (
                <div className="space-y-2">
                  {lookaheadPlans.map(p => (
                    <div key={p.id} className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                      <p className="text-white text-sm font-medium">{p.planType}</p>
                      <p className="text-gray-400 text-xs">{p.project}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-400 text-xs">{p.neededForActivity}</span>
                        <DaysBadge targetDate={p.neededByDate} />
                      </div>
                      <p className="text-blue-400 text-xs mt-1">Status: {p.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  )
}

export default Lookahead