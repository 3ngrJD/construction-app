// ============================================
// PLANS & DRAWINGS TRACKING MODULE
// ============================================

import { useState, useEffect } from "react"
import { initialPlans, projects } from "../data/store"

// ============================================
// URGENCY CALCULATOR
// ============================================

function calculateUrgency(plan) {
  if (plan.status === "Issued to Site") return "Closed"
  const today = new Date()
  const neededBy = new Date(plan.neededByDate)
  const days = Math.ceil((neededBy - today) / (1000 * 60 * 60 * 24))

  if (days < 0) return "Overdue"
  if (days <= 3) return "Critical"
  if (days <= 7) return "High"
  if (days <= 14) return "Medium"
  return "Low"
}

// ============================================
// URGENCY BADGE
// ============================================

function UrgencyBadge({ urgency }) {
  const colors = {
    Overdue: "bg-red-500/20 text-red-400 border border-red-500/30",
    Critical: "bg-red-500/20 text-red-400 border border-red-500/30",
    High: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    Medium: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    Low: "bg-green-500/20 text-green-400 border border-green-500/30",
    Closed: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colors[urgency] || colors.Low}`}>
      {urgency}
    </span>
  )
}

// ============================================
// STATUS BADGE
// ============================================

function StatusBadge({ status }) {
  const colors = {
    "Not Requested": "bg-gray-500/20 text-gray-400",
    "Requested": "bg-blue-500/20 text-blue-400",
    "Pending Approval": "bg-yellow-500/20 text-yellow-400",
    "For Revision": "bg-orange-500/20 text-orange-400",
    "Approved": "bg-green-500/20 text-green-400",
    "Issued to Site": "bg-green-700/20 text-green-300",
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colors[status] || colors["Not Requested"]}`}>
      {status}
    </span>
  )
}

// ============================================
// DAYS BADGE
// ============================================

function DaysBadge({ date }) {
  if (!date) return <span className="text-xs text-gray-600">No date</span>
  const today = new Date()
  const target = new Date(date)
  const days = Math.ceil((target - today) / (1000 * 60 * 60 * 24))

  if (days < 0) return <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 font-bold">{Math.abs(days)}d OVERDUE</span>
  if (days === 0) return <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 font-bold">TODAY</span>
  if (days <= 3) return <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 font-bold">{days}d left</span>
  if (days <= 7) return <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">{days}d left</span>
  return <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">{days}d left</span>
}

// ============================================
// ADD/EDIT PLAN MODAL
// ============================================

function PlanModal({ plan, onSave, onClose }) {
  const [form, setForm] = useState(plan || {
    project: projects[0].name,
    planType: "",
    neededForActivity: "",
    neededByDate: "",
    status: "Not Requested",
    requestedFrom: "",
    revisionNumber: "",
    remarks: "",
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    if (!form.planType) return alert("Plan type is required")
    if (!form.project) return alert("Project is required")
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-bold text-lg">
            {plan ? "✏️ Edit Plan" : "➕ Add New Plan"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          {/* Project */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">Project *</label>
            <select name="project" value={form.project} onChange={handleChange}
              className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
              {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </div>

          {/* Plan Type */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">Plan Type *</label>
            <input name="planType" value={form.planType} onChange={handleChange}
              placeholder="e.g. Structural, Architectural, Shop Drawing"
              className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
          </div>

          {/* Needed For Activity */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">Needed For Activity</label>
            <input name="neededForActivity" value={form.neededForActivity} onChange={handleChange}
              placeholder="e.g. Foundation works, Masonry works"
              className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
          </div>

          {/* Needed By Date & Revision */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Needed By Date</label>
              <input type="date" name="neededByDate" value={form.neededByDate} onChange={handleChange}
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Revision Number</label>
              <input name="revisionNumber" value={form.revisionNumber} onChange={handleChange}
                placeholder="e.g. Rev 1, Rev 2"
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
          </div>

          {/* Status & Requested From */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                <option>Not Requested</option>
                <option>Requested</option>
                <option>Pending Approval</option>
                <option>For Revision</option>
                <option>Approved</option>
                <option>Issued to Site</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Requested From</label>
              <input name="requestedFrom" value={form.requestedFrom} onChange={handleChange}
                placeholder="e.g. Structural Engineer"
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">Remarks</label>
            <textarea name="remarks" value={form.remarks} onChange={handleChange}
              placeholder="Additional notes..." rows={3}
              className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-800">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit}
            className="px-6 py-2 text-sm bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors">
            {plan ? "Save Changes" : "Add Plan"}
          </button>
        </div>

      </div>
    </div>
  )
}

// ============================================
// MAIN PLANS PAGE
// ============================================

function Plans({ inboxPlans = [] }) {
  const [plans, setPlans] = useState(
    initialPlans.map(p => ({ ...p, urgency: calculateUrgency(p) }))
  )

  useEffect(() => {
    if (inboxPlans.length > 0) {
      setPlans(prev => [
        ...prev,
        ...inboxPlans.map(p => ({ ...p, urgency: calculateUrgency(p) }))
      ])
    }
  }, [inboxPlans])
  const [selectedProject, setSelectedProject] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedUrgency, setSelectedUrgency] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [showIssued, setShowIssued] = useState(false)

  // Filter
  const filteredPlans = plans
    .filter(p => selectedProject === "All" ? true : p.project === selectedProject)
    .filter(p => selectedStatus === "All" ? true : p.status === selectedStatus)
    .filter(p => selectedUrgency === "All" ? true : p.urgency === selectedUrgency)
    .filter(p => showIssued ? true : p.status !== "Issued to Site")
    .filter(p => searchQuery === "" ? true :
      p.planType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.neededForActivity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.requestedFrom.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const order = { Overdue: 0, Critical: 1, High: 2, Medium: 3, Low: 4, Closed: 5 }
      return (order[a.urgency] ?? 6) - (order[b.urgency] ?? 6)
    })

  // Stats
  const overdue = plans.filter(p => p.urgency === "Overdue").length
  const critical = plans.filter(p => p.urgency === "Critical").length
  const forRevision = plans.filter(p => p.status === "For Revision").length
  const pendingApproval = plans.filter(p => p.status === "Pending Approval").length

  // Add
  const handleAdd = (form) => {
    const newPlan = {
      ...form,
      id: Date.now(),
      urgency: calculateUrgency(form),
    }
    setPlans([...plans, newPlan])
    setShowModal(false)
  }

  // Edit
  const handleEdit = (form) => {
    setPlans(plans.map(p => p.id === editingPlan.id
      ? { ...form, id: p.id, urgency: calculateUrgency(form) }
      : p
    ))
    setEditingPlan(null)
    setShowModal(false)
  }

  // Delete
  const handleDelete = (id) => {
    if (window.confirm("Delete this plan?")) {
      setPlans(plans.filter(p => p.id !== id))
    }
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">📐 Plans & Drawings</h1>
          <p className="text-gray-500 text-sm mt-1">{filteredPlans.length} active plans</p>
        </div>
        <button
          onClick={() => { setEditingPlan(null); setShowModal(true) }}
          className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-300 transition-colors">
          ➕ Add Plan
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-red-500/30 rounded-xl p-4 text-center">
          <p className="text-red-400 text-2xl font-bold">{overdue + critical}</p>
          <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Critical / Overdue</p>
        </div>
        <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-4 text-center">
          <p className="text-orange-400 text-2xl font-bold">{forRevision}</p>
          <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">For Revision</p>
        </div>
        <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-4 text-center">
          <p className="text-yellow-400 text-2xl font-bold">{pendingApproval}</p>
          <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Pending Approval</p>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-center">
          <p className="text-white text-2xl font-bold">{plans.filter(p => p.status !== "Issued to Site").length}</p>
          <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Total Active</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          placeholder="🔍 Search plans..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-400"
        />
        <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
          <option value="All">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>
        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
          <option value="All">All Statuses</option>
          <option>Not Requested</option>
          <option>Requested</option>
          <option>Pending Approval</option>
          <option>For Revision</option>
          <option>Approved</option>
          <option>Issued to Site</option>
        </select>
        <select value={selectedUrgency} onChange={e => setSelectedUrgency(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
          <option value="All">All Urgency</option>
          <option>Overdue</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      {/* Show Issued Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowIssued(!showIssued)}
          className={`text-xs px-3 py-1 rounded-full transition-colors ${showIssued ? "bg-green-400 text-gray-900 font-bold" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
          {showIssued ? "✅ Showing Issued Plans" : "Show Issued to Site"}
        </button>
      </div>

      {/* Plans Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Project</th>
                <th className="text-left px-4 py-3">Plan Type</th>
                <th className="text-left px-4 py-3">Needed For</th>
                <th className="text-left px-4 py-3">Urgency</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Needed By</th>
                <th className="text-left px-4 py-3">Days Left</th>
                <th className="text-left px-4 py-3">Requested From</th>
                <th className="text-left px-4 py-3">Revision</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center text-gray-500 py-10">
                    No plans found. Add your first plan!
                  </td>
                </tr>
              )}
              {filteredPlans.map((plan, index) => (
                <tr key={plan.id}
                  className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${index % 2 === 0 ? "bg-gray-900" : "bg-gray-800/20"}`}>
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-xs">{plan.project}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{plan.planType}</p>
                      {plan.revisionNumber && (
                        <p className="text-gray-500 text-xs">{plan.revisionNumber}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-xs">{plan.neededForActivity || "—"}</span>
                  </td>
                  <td className="px-4 py-3"><UrgencyBadge urgency={plan.urgency} /></td>
                  <td className="px-4 py-3"><StatusBadge status={plan.status} /></td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-xs">{plan.neededByDate || "—"}</span>
                  </td>
                  <td className="px-4 py-3"><DaysBadge date={plan.neededByDate} /></td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-xs">{plan.requestedFrom || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-xs">{plan.revisionNumber || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingPlan(plan); setShowModal(true) }}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
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
        <PlanModal
          plan={editingPlan}
          onSave={editingPlan ? handleEdit : handleAdd}
          onClose={() => { setShowModal(false); setEditingPlan(null) }}
        />
      )}

    </div>
  )
}

export default Plans