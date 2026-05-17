// ============================================
// DASHBOARD - WITH SUPABASE
// ============================================

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { useProjects } from "../useProjects"

// ============================================
// PRIORITY SCORING ENGINE
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
// STAT CARD
// ============================================

function StatCard({ label, value, color, icon }) {
  return (
    <div className={`bg-gray-900 border ${color} rounded-xl p-5 flex items-center gap-4`}>
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-wider">{label}</p>
        <p className="text-white text-3xl font-bold">{value}</p>
      </div>
    </div>
  )
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
  return <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">{days}d left</span>
}

// ============================================
// MAIN DASHBOARD
// ============================================

function Dashboard() {
  const { projects } = useProjects()
  const [selectedProject, setSelectedProject] = useState("All")
  const [tasks, setTasks] = useState([])
  const [materials, setMaterials] = useState([])
  const [plans, setPlans] = useState([])
  const [manpower, setManpower] = useState([])
  const [loading, setLoading] = useState(true)
  const today = new Date()

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      // Fetch all data in parallel
      const [tasksRes, materialsRes, plansRes, manpowerRes] = await Promise.all([
        supabase.from("tasks").select("*"),
        supabase.from("materials").select("*"),
        supabase.from("plans").select("*"),
        supabase.from("manpower").select("*"),
      ])

      // Map tasks
      if (tasksRes.data) {
        const mapped = tasksRes.data.map(t => ({
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
        }))
        setTasks(mapped)
      }

      // Map materials
      if (materialsRes.data) {
        const mapped = materialsRes.data.map(m => ({
          id: m.id,
          project: m.project,
          materialName: m.material_name,
          neededOnSiteDate: m.needed_on_site_date || "",
          requestStatus: m.request_status || "Not Requested",
        }))
        setMaterials(mapped)
      }

      // Map plans
      if (plansRes.data) {
        const mapped = plansRes.data.map(p => ({
          id: p.id,
          project: p.project,
          planType: p.plan_type,
          neededByDate: p.needed_by_date || "",
          status: p.status || "Not Requested",
        }))
        setPlans(mapped)
      }

      // Map manpower
      if (manpowerRes.data) {
        const mapped = manpowerRes.data.map(m => ({
          id: m.id,
          project: m.project,
          trade: m.trade,
          allocated: m.allocated || 0,
          required: m.required || 0,
        }))
        setManpower(mapped)
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
    setLoading(false)
  }

  // Filter by project
  const filterByProject = (items) =>
    selectedProject === "All" ? items : items.filter(i => i.project === selectedProject)

  // Derived data
  const filteredTasks = filterByProject(tasks)
    .filter(t => t.status !== "Done")
    .sort((a, b) => b.score - a.score)

  const overdueTasks = filteredTasks.filter(t => {
    const days = Math.ceil((new Date(t.targetDate) - today) / (1000 * 60 * 60 * 24))
    return days < 0 && t.targetDate
  })

  const dueSoonTasks = filteredTasks.filter(t => {
    const days = Math.ceil((new Date(t.targetDate) - today) / (1000 * 60 * 60 * 24))
    return days >= 0 && days <= 3 && t.targetDate
  })

  const top5Tasks = filteredTasks.slice(0, 5)

  const materialAlerts = filterByProject(materials).filter(m => {
    if (m.requestStatus === "Delivered") return false
    const days = Math.ceil((new Date(m.neededOnSiteDate) - today) / (1000 * 60 * 60 * 24))
    return days <= 7 && m.neededOnSiteDate
  })

  const planAlerts = filterByProject(plans).filter(p => {
    if (p.status === "Issued to Site") return false
    const days = Math.ceil((new Date(p.neededByDate) - today) / (1000 * 60 * 60 * 24))
    return days <= 7 && p.neededByDate
  })

  const manpowerAlerts = filterByProject(manpower).filter(m => m.allocated < m.required)

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">⚡ Command Center</h1>
          <p className="text-gray-500 text-sm mt-1">
            {today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-400">
          <option value="All">All Projects</option>
          {(projects || []).map(p => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <p className="text-yellow-400 text-lg animate-pulse">⚡ Loading command center...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Active Tasks" value={filteredTasks.length} color="border-gray-700" icon="📋" />
            <StatCard label="Overdue Tasks" value={overdueTasks.length} color="border-red-500/50" icon="🔴" />
            <StatCard label="Due Within 3 Days" value={dueSoonTasks.length} color="border-orange-500/50" icon="⚠️" />
            <StatCard label="Material Alerts" value={materialAlerts.length} color="border-yellow-500/50" icon="🏗️" />
          </div>

          {/* Top 5 Priority Tasks */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-bold text-lg mb-4">🎯 Top 5 Priority Tasks</h2>
            <div className="space-y-3">
              {top5Tasks.length === 0 && (
                <p className="text-gray-500 text-sm">No active tasks found. Add tasks in the Master Tasks module.</p>
              )}
              {top5Tasks.map((task, index) => (
                <div key={task.id} className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-4">
                  <div className="text-yellow-400 font-bold text-lg w-6">#{index + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{task.activity}</p>
                    <p className="text-gray-500 text-xs mt-1">{task.project} · {task.area}</p>
                    {task.blockingItems && (
                      <p className="text-red-400 text-xs mt-1">⚠ {task.blockingItems}</p>
                    )}
                    {task.nextAction && (
                      <p className="text-yellow-400 text-xs mt-1">→ {task.nextAction}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                    <DaysBadge targetDate={task.targetDate} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overdue + Due Soon */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-red-500/30 rounded-xl p-5">
              <h2 className="text-red-400 font-bold text-lg mb-4">🔴 Overdue Tasks ({overdueTasks.length})</h2>
              <div className="space-y-2">
                {overdueTasks.length === 0 && (
                  <p className="text-gray-500 text-sm">No overdue tasks. Great job!</p>
                )}
                {overdueTasks.map(task => (
                  <div key={task.id} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-white text-sm font-medium">{task.activity}</p>
                    <p className="text-gray-400 text-xs mt-1">{task.project} · {task.responsible}</p>
                    <div className="mt-2"><DaysBadge targetDate={task.targetDate} /></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-5">
              <h2 className="text-orange-400 font-bold text-lg mb-4">⚠️ Due Within 3 Days ({dueSoonTasks.length})</h2>
              <div className="space-y-2">
                {dueSoonTasks.length === 0 && (
                  <p className="text-gray-500 text-sm">No tasks due in the next 3 days.</p>
                )}
                {dueSoonTasks.map(task => (
                  <div key={task.id} className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                    <p className="text-white text-sm font-medium">{task.activity}</p>
                    <p className="text-gray-400 text-xs mt-1">{task.project} · {task.responsible}</p>
                    <div className="mt-2"><DaysBadge targetDate={task.targetDate} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Material Alerts */}
            <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-5">
              <h2 className="text-yellow-400 font-bold mb-4">🏗️ Material Alerts</h2>
              <div className="space-y-2">
                {materialAlerts.length === 0 && (
                  <p className="text-gray-500 text-sm">No material alerts.</p>
                )}
                {materialAlerts.map(m => (
                  <div key={m.id} className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-white text-sm font-medium">{m.materialName}</p>
                    <p className="text-gray-400 text-xs">{m.project}</p>
                    <p className="text-yellow-400 text-xs mt-1">Needed: {m.neededOnSiteDate}</p>
                    <p className="text-gray-500 text-xs">Status: {m.requestStatus}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Alerts */}
            <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-5">
              <h2 className="text-blue-400 font-bold mb-4">📐 Plan Alerts</h2>
              <div className="space-y-2">
                {planAlerts.length === 0 && (
                  <p className="text-gray-500 text-sm">No plan alerts.</p>
                )}
                {planAlerts.map(p => (
                  <div key={p.id} className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-white text-sm font-medium">{p.planType}</p>
                    <p className="text-gray-400 text-xs">{p.project}</p>
                    <p className="text-blue-400 text-xs mt-1">Needed: {p.neededByDate}</p>
                    <p className="text-gray-500 text-xs">Status: {p.status}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Manpower Alerts */}
            <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-5">
              <h2 className="text-purple-400 font-bold mb-4">👷 Manpower Alerts</h2>
              <div className="space-y-2">
                {manpowerAlerts.length === 0 && (
                  <p className="text-gray-500 text-sm">No manpower shortages.</p>
                )}
                {manpowerAlerts.map(m => (
                  <div key={m.id} className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                    <p className="text-white text-sm font-medium">{m.trade}</p>
                    <p className="text-gray-400 text-xs">{m.project}</p>
                    <p className="text-red-400 text-xs mt-1">{m.allocated}/{m.required} allocated</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  )
}

export default Dashboard