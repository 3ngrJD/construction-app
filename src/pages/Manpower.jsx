// ============================================
// MANPOWER TRACKING MODULE
// ============================================

import { useState, useEffect } from "react"
import { initialManpower, projects } from "../data/store"

// ============================================
// STATUS CALCULATOR
// ============================================

function calculateStatus(manpower) {
  if (manpower.allocated === 0) return "No Workers"
  if (manpower.allocated < manpower.required) return "Shortage"
  if (manpower.allocated === manpower.required) return "Fully Staffed"
  return "Overstaffed"
}

// ============================================
// STATUS BADGE
// ============================================

function StatusBadge({ status }) {
  const colors = {
    "No Workers": "bg-red-500/20 text-red-400 border border-red-500/30",
    "Shortage": "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    "Fully Staffed": "bg-green-500/20 text-green-400 border border-green-500/30",
    "Overstaffed": "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colors[status] || colors["Shortage"]}`}>
      {status}
    </span>
  )
}

// ============================================
// MANPOWER BAR
// ============================================

function ManpowerBar({ allocated, required }) {
  const percentage = required === 0 ? 100 : Math.min((allocated / required) * 100, 100)
  const color = percentage === 0 ? "bg-red-500" :
    percentage < 100 ? "bg-orange-500" :
    "bg-green-500"

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{allocated} allocated</span>
        <span>{required} required</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// ============================================
// ADD/EDIT MANPOWER MODAL
// ============================================

function ManpowerModal({ manpower, onSave, onClose }) {
  const [form, setForm] = useState(manpower || {
    project: projects[0].name,
    trade: "",
    allocated: 0,
    required: 0,
    date: new Date().toISOString().split("T")[0],
    remarks: "",
  })

  const handleChange = (e) => {
    const value = e.target.type === "number" ? parseInt(e.target.value) || 0 : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  const handleSubmit = () => {
    if (!form.trade) return alert("Trade is required")
    if (!form.project) return alert("Project is required")
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-bold text-lg">
            {manpower ? "✏️ Edit Manpower" : "➕ Add Manpower Entry"}
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

          {/* Trade */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">Trade / Classification *</label>
            <input name="trade" value={form.trade} onChange={handleChange}
              placeholder="e.g. Carpenter, Mason, Welder"
              className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
          </div>

          {/* Allocated & Required */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Allocated Workers</label>
              <input type="number" name="allocated" value={form.allocated} onChange={handleChange}
                min="0" placeholder="0"
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Required Workers</label>
              <input type="number" name="required" value={form.required} onChange={handleChange}
                min="0" placeholder="0"
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange}
              className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
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
            {manpower ? "Save Changes" : "Add Entry"}
          </button>
        </div>

      </div>
    </div>
  )
}

// ============================================
// MAIN MANPOWER PAGE
// ============================================

function Manpower({ inboxManpower = [] }) {
  const [manpower, setManpower] = useState(
    initialManpower.map(m => ({ ...m, staffingStatus: calculateStatus(m) }))
  )

  useEffect(() => {
    if (inboxManpower.length > 0) {
      setManpower(prev => [
        ...prev,
        ...inboxManpower.map(m => ({ ...m, staffingStatus: calculateStatus(m) }))
      ])
    }
  }, [inboxManpower])
  const [selectedProject, setSelectedProject] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)

  // Filter
  const filteredManpower = manpower
    .filter(m => selectedProject === "All" ? true : m.project === selectedProject)
    .filter(m => selectedStatus === "All" ? true : m.staffingStatus === selectedStatus)
    .filter(m => searchQuery === "" ? true :
      m.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.project.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const order = { "No Workers": 0, "Shortage": 1, "Fully Staffed": 2, "Overstaffed": 3 }
      return (order[a.staffingStatus] ?? 4) - (order[b.staffingStatus] ?? 4)
    })

  // Stats
  const totalAllocated = manpower.reduce((sum, m) => sum + m.allocated, 0)
  const totalRequired = manpower.reduce((sum, m) => sum + m.required, 0)
  const shortages = manpower.filter(m => m.staffingStatus === "Shortage" || m.staffingStatus === "No Workers").length

  // Add
  const handleAdd = (form) => {
    const newEntry = {
      ...form,
      id: Date.now(),
      staffingStatus: calculateStatus(form),
    }
    setManpower([...manpower, newEntry])
    setShowModal(false)
  }

  // Edit
  const handleEdit = (form) => {
    setManpower(manpower.map(m => m.id === editingEntry.id
      ? { ...form, id: m.id, staffingStatus: calculateStatus(form) }
      : m
    ))
    setEditingEntry(null)
    setShowModal(false)
  }

  // Delete
  const handleDelete = (id) => {
    if (window.confirm("Delete this entry?")) {
      setManpower(manpower.filter(m => m.id !== id))
    }
  }

  // Project Summary
  const projectSummary = projects.map(p => {
    const projectEntries = manpower.filter(m => m.project === p.name)
    const allocated = projectEntries.reduce((sum, m) => sum + m.allocated, 0)
    const required = projectEntries.reduce((sum, m) => sum + m.required, 0)
    return { ...p, allocated, required, shortage: required - allocated }
  }).filter(p => p.required > 0)

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">👷 Manpower Tracking</h1>
          <p className="text-gray-500 text-sm mt-1">{filteredManpower.length} entries</p>
        </div>
        <button
          onClick={() => { setEditingEntry(null); setShowModal(true) }}
          className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-300 transition-colors">
          ➕ Add Entry
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-red-500/30 rounded-xl p-4 text-center">
          <p className="text-red-400 text-2xl font-bold">{shortages}</p>
          <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Shortage Alerts</p>
        </div>
        <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-4 text-center">
          <p className="text-yellow-400 text-2xl font-bold">{totalAllocated}</p>
          <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Total Allocated</p>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-center">
          <p className="text-white text-2xl font-bold">{totalRequired}</p>
          <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Total Required</p>
        </div>
      </div>

      {/* Project Summary */}
      {projectSummary.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-white font-bold mb-4">📊 Project Workforce Summary</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projectSummary.map(p => (
              <div key={p.id} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-white text-sm font-medium">{p.name}</p>
                  {p.shortage > 0 && (
                    <span className="text-xs text-red-400">⚠ Short by {p.shortage}</span>
                  )}
                  {p.shortage <= 0 && (
                    <span className="text-xs text-green-400">✓ Fully staffed</span>
                  )}
                </div>
                <ManpowerBar allocated={p.allocated} required={p.required} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <input
          placeholder="🔍 Search trade or project..."
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
          <option>No Workers</option>
          <option>Shortage</option>
          <option>Fully Staffed</option>
          <option>Overstaffed</option>
        </select>
      </div>

      {/* Manpower Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Project</th>
                <th className="text-left px-4 py-3">Trade</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Allocated</th>
                <th className="text-left px-4 py-3">Required</th>
                <th className="text-left px-4 py-3">Shortage</th>
                <th className="text-left px-4 py-3">Workforce Bar</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Remarks</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredManpower.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center text-gray-500 py-10">
                    No manpower entries found. Add your first entry!
                  </td>
                </tr>
              )}
              {filteredManpower.map((entry, index) => (
                <tr key={entry.id}
                  className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${index % 2 === 0 ? "bg-gray-900" : "bg-gray-800/20"}`}>
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-xs">{entry.project}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white font-medium">{entry.trade}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={entry.staffingStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white font-bold">{entry.allocated}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300">{entry.required}</span>
                  </td>
                  <td className="px-4 py-3">
                    {entry.required - entry.allocated > 0 ? (
                      <span className="text-red-400 font-bold text-xs">-{entry.required - entry.allocated}</span>
                    ) : (
                      <span className="text-green-400 text-xs">✓</span>
                    )}
                  </td>
                  <td className="px-4 py-3 min-w-32">
                    <ManpowerBar allocated={entry.allocated} required={entry.required} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-xs">{entry.date || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-xs">{entry.remarks || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingEntry(entry); setShowModal(true) }}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
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
        <ManpowerModal
          manpower={editingEntry}
          onSave={editingEntry ? handleEdit : handleAdd}
          onClose={() => { setShowModal(false); setEditingEntry(null) }}
        />
      )}

    </div>
  )
}

export default Manpower