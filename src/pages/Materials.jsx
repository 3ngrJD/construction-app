// ============================================
// MATERIALS TRACKING MODULE
// ============================================

import { useState, useEffect } from "react"
import { initialMaterials, projects } from "../data/store"

// ============================================
// URGENCY CALCULATOR
// ============================================

function calculateUrgency(material) {
  const today = new Date()
  const prepDate = new Date(material.requestPrepDate)
  const siteDate = new Date(material.neededOnSiteDate)
  const daysToSite = Math.ceil((siteDate - today) / (1000 * 60 * 60 * 24))
  const daysToPrep = Math.ceil((prepDate - today) / (1000 * 60 * 60 * 24))

  if (daysToSite < 0) return "Overdue"
  if (daysToPrep <= 0) return "Critical"
  if (daysToPrep <= 3) return "High"
  if (daysToPrep <= 7) return "Medium"
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
    "Not Started": "bg-gray-500/20 text-gray-400",
    "Pending": "bg-yellow-500/20 text-yellow-400",
    "Ordered": "bg-blue-500/20 text-blue-400",
    "Delivered": "bg-green-500/20 text-green-400",
    "Delayed": "bg-red-500/20 text-red-400",
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

function DaysBadge({ date, label }) {
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
// ADD/EDIT MATERIAL MODAL
// ============================================

function MaterialModal({ material, onSave, onClose }) {
  const [form, setForm] = useState(material || {
    project: projects[0].name,
    materialName: "",
    unit: "",
    quantity: "",
    neededOnSiteDate: "",
    leadTime: "",
    requestPrepDate: "",
    requestStatus: "Not Started",
    deliveryDate: "",
    supplier: "",
    notes: "",
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    if (!form.materialName) return alert("Material name is required")
    if (!form.project) return alert("Project is required")
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-bold text-lg">
            {material ? "✏️ Edit Material" : "➕ Add New Material"}
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

          {/* Material Name */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">Material Name *</label>
            <input name="materialName" value={form.materialName} onChange={handleChange}
              placeholder="e.g. Rebar 16mm"
              className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Quantity</label>
              <input name="quantity" value={form.quantity} onChange={handleChange}
                type="number" placeholder="e.g. 500"
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Unit</label>
              <input name="unit" value={form.unit} onChange={handleChange}
                placeholder="e.g. pcs, bags, kg"
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Needed On Site</label>
              <input type="date" name="neededOnSiteDate" value={form.neededOnSiteDate} onChange={handleChange}
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Lead Time (days)</label>
              <input type="number" name="leadTime" value={form.leadTime} onChange={handleChange}
                placeholder="e.g. 7"
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Request Prep Date</label>
              <input type="date" name="requestPrepDate" value={form.requestPrepDate} onChange={handleChange}
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
          </div>

          {/* Status & Delivery */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Request Status</label>
              <select name="requestStatus" value={form.requestStatus} onChange={handleChange}
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
                <option>Not Started</option>
                <option>Pending</option>
                <option>Ordered</option>
                <option>Delivered</option>
                <option>Delayed</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider">Delivery Date</label>
              <input type="date" name="deliveryDate" value={form.deliveryDate} onChange={handleChange}
                className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">Supplier</label>
            <input name="supplier" value={form.supplier} onChange={handleChange}
              placeholder="e.g. Steel Corp"
              className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
          </div>

          {/* Notes */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange}
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
            {material ? "Save Changes" : "Add Material"}
          </button>
        </div>

      </div>
    </div>
  )
}

// ============================================
// MAIN MATERIALS PAGE
// ============================================

function Materials({ inboxMaterials = [] }) {
  const [materials, setMaterials] = useState(
    initialMaterials.map(m => ({ ...m, urgency: calculateUrgency(m) }))
  )

 useEffect(() => {
    if (inboxMaterials.length > 0) {
      setMaterials(prev => [
        ...prev,
        ...inboxMaterials.map(m => ({ ...m, urgency: calculateUrgency(m) }))
      ])
    }
  }, [inboxMaterials])
  const [selectedProject, setSelectedProject] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedUrgency, setSelectedUrgency] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState(null)

  // Filter
  const filteredMaterials = materials
    .filter(m => selectedProject === "All" ? true : m.project === selectedProject)
    .filter(m => selectedStatus === "All" ? true : m.requestStatus === selectedStatus)
    .filter(m => selectedUrgency === "All" ? true : m.urgency === selectedUrgency)
    .filter(m => searchQuery === "" ? true :
      m.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(m => m.requestStatus !== "Delivered")
    .sort((a, b) => {
      const order = { Overdue: 0, Critical: 1, High: 2, Medium: 3, Low: 4 }
      return (order[a.urgency] ?? 5) - (order[b.urgency] ?? 5)
    })

  // Stats
  const overdue = materials.filter(m => m.urgency === "Overdue").length
  const critical = materials.filter(m => m.urgency === "Critical").length
  const high = materials.filter(m => m.urgency === "High").length

  // Add
  const handleAdd = (form) => {
    const newMaterial = {
      ...form,
      id: Date.now(),
      urgency: calculateUrgency(form),
    }
    setMaterials([...materials, newMaterial])
    setShowModal(false)
  }

  // Edit
  const handleEdit = (form) => {
    setMaterials(materials.map(m => m.id === editingMaterial.id
      ? { ...form, id: m.id, urgency: calculateUrgency(form) }
      : m
    ))
    setEditingMaterial(null)
    setShowModal(false)
  }

  // Delete
  const handleDelete = (id) => {
    if (window.confirm("Delete this material?")) {
      setMaterials(materials.filter(m => m.id !== id))
    }
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">🏗️ Materials Tracking</h1>
          <p className="text-gray-500 text-sm mt-1">{filteredMaterials.length} active materials</p>
        </div>
        <button
          onClick={() => { setEditingMaterial(null); setShowModal(true) }}
          className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-300 transition-colors">
          ➕ Add Material
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-red-500/30 rounded-xl p-4 text-center">
          <p className="text-red-400 text-2xl font-bold">{overdue + critical}</p>
          <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Critical / Overdue</p>
        </div>
        <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-4 text-center">
          <p className="text-orange-400 text-2xl font-bold">{high}</p>
          <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">High Urgency</p>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-center">
          <p className="text-white text-2xl font-bold">{materials.filter(m => m.requestStatus !== "Delivered").length}</p>
          <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Total Active</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          placeholder="🔍 Search materials..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="lg:col-span-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-400"
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
          <option>Pending</option>
          <option>Ordered</option>
          <option>Delayed</option>
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

      {/* Materials Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Project</th>
                <th className="text-left px-4 py-3">Material</th>
                <th className="text-left px-4 py-3">Qty / Unit</th>
                <th className="text-left px-4 py-3">Urgency</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Needed On Site</th>
                <th className="text-left px-4 py-3">Request By</th>
                <th className="text-left px-4 py-3">Lead Time</th>
                <th className="text-left px-4 py-3">Supplier</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center text-gray-500 py-10">
                    No materials found. Add your first material!
                  </td>
                </tr>
              )}
              {filteredMaterials.map((material, index) => (
                <tr key={material.id}
                  className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${index % 2 === 0 ? "bg-gray-900" : "bg-gray-800/20"}`}>
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-xs">{material.project}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{material.materialName}</p>
                      {material.notes && <p className="text-gray-500 text-xs mt-1">{material.notes}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-xs">{material.quantity} {material.unit}</span>
                  </td>
                  <td className="px-4 py-3"><UrgencyBadge urgency={material.urgency} /></td>
                  <td className="px-4 py-3"><StatusBadge status={material.requestStatus} /></td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-gray-300 text-xs">{material.neededOnSiteDate || "—"}</p>
                      <DaysBadge date={material.neededOnSiteDate} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-gray-300 text-xs">{material.requestPrepDate || "—"}</p>
                      <DaysBadge date={material.requestPrepDate} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300 text-xs">{material.leadTime ? `${material.leadTime} days` : "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-400 text-xs">{material.supplier || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingMaterial(material); setShowModal(true) }}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
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
        <MaterialModal
          material={editingMaterial}
          onSave={editingMaterial ? handleEdit : handleAdd}
          onClose={() => { setShowModal(false); setEditingMaterial(null) }}
        />
      )}

    </div>
  )
}

export default Materials