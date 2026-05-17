// ============================================
// MATERIALS TRACKING MODULE - WORKFLOW VERSION
// ============================================

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { useProjects } from "../useProjects"

// ============================================
// URGENCY CALCULATOR
// ============================================

function calculateUrgency(material) {
  if (material.requestStatus === "Delivered") return "Delivered"
  const today = new Date()
  const siteDate = new Date(material.neededOnSiteDate)
  const daysToSite = Math.ceil((siteDate - today) / (1000 * 60 * 60 * 24))

  if (daysToSite < 0) return "Overdue"
  if (daysToSite <= 3) return "Critical"
  if (daysToSite <= 7) return "High"
  if (daysToSite <= 14) return "Medium"
  return "Low"
}

// ============================================
// AUTO REQUEST DATE CALCULATOR
// ============================================

function calculateRequestDate(neededOnSiteDate, leadTime) {
  if (!neededOnSiteDate || !leadTime) return null
  const siteDate = new Date(neededOnSiteDate)
  siteDate.setDate(siteDate.getDate() - parseInt(leadTime))
  return siteDate.toISOString().split("T")[0]
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
    Delivered: "bg-gray-500/20 text-gray-400 border border-gray-500/30",
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
    "Ordered": "bg-yellow-500/20 text-yellow-400",
    "Delivered": "bg-green-500/20 text-green-400",
    "Delayed": "bg-red-500/20 text-red-400",
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
  if (!date) return <span className="text-xs text-gray-600">—</span>
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

function MaterialModal({ material, projects, onSave, onClose }) {
  const [form, setForm] = useState(material || {
    project: projects[0]?.name || "",
    materialName: "",
    unit: "",
    quantity: "",
    neededOnSiteDate: "",
    leadTime: "",
    supplier: "",
    notes: "",
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Auto calculate request date preview
  const suggestedRequestDate = calculateRequestDate(form.neededOnSiteDate, form.leadTime)

  const handleSubmit = () => {
    if (!form.materialName) return alert("Material name is required")
    if (!form.project) return alert("Project is required")
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-bold text-lg">
            {material ? "✏️ Edit Material" : "➕ Add New Material"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-6 space-y-4">

          {/* Project */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">Project *</label>
            <select name="project" value={form.project} onChange={handleChange}
              className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
              {(projects || []).map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
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

          {/* Needed On Site Date */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">
              📅 Needed On Site Date *
            </label>
            <input type="date" name="neededOnSiteDate" value={form.neededOnSiteDate} onChange={handleChange}
              className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
          </div>

          {/* Lead Time */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">
              Lead Time (days) — How many days to deliver after requesting
            </label>
            <input type="number" name="leadTime" value={form.leadTime} onChange={handleChange}
              placeholder="e.g. 7"
              className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
          </div>

          {/* Auto-calculated Request Date Preview */}
          {suggestedRequestDate && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-400 text-xs font-medium">
                ⚡ You should request this material by:
              </p>
              <p className="text-white text-lg font-bold mt-1">{suggestedRequestDate}</p>
              <p className="text-gray-500 text-xs mt-1">
                Based on {form.leadTime} day lead time before {form.neededOnSiteDate}
              </p>
            </div>
          )}

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
  const { projects } = useProjects()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedUrgency, setSelectedUrgency] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [showDelivered, setShowDelivered] = useState(false)

  useEffect(() => {
    fetchMaterials()
  }, [])

  useEffect(() => {
    if (inboxMaterials.length > 0) {
      inboxMaterials.forEach(m => saveMaterial(m))
    }
  }, [inboxMaterials])

  const fetchMaterials = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .order("created_date", { ascending: false })

    if (error) {
      console.error("Error fetching materials:", error)
    } else {
      const mapped = data.map(m => ({
        id: m.id,
        project: m.project,
        materialName: m.material_name,
        unit: m.unit || "",
        quantity: m.quantity || "",
        neededOnSiteDate: m.needed_on_site_date || "",
        leadTime: m.lead_time || "",
        requestPrepDate: m.request_prep_date || "",
        requestStatus: m.request_status || "Not Requested",
        deliveryDate: m.delivery_date || "",
        supplier: m.supplier || "",
        notes: m.notes || "",
        urgency: calculateUrgency({
          neededOnSiteDate: m.needed_on_site_date,
          requestStatus: m.request_status,
        }),
        suggestedRequestDate: calculateRequestDate(m.needed_on_site_date, m.lead_time),
      }))
      setMaterials(mapped)
    }
    setLoading(false)
  }

  const saveMaterial = async (form) => {
    const { error } = await supabase.from("materials").insert([{
      project: form.project,
      material_name: form.materialName,
      unit: form.unit || "",
      quantity: form.quantity || null,
      needed_on_site_date: form.neededOnSiteDate || null,
      lead_time: form.leadTime || null,
      request_prep_date: null,
      request_status: "Not Requested",
      delivery_date: null,
      supplier: form.supplier || "",
      notes: form.notes || "",
    }])
    if (error) console.error("Error saving material:", error)
    else fetchMaterials()
  }

  const handleAdd = async (form) => {
    await saveMaterial(form)
    setShowModal(false)
  }

  const handleEdit = async (form) => {
    const { error } = await supabase
      .from("materials")
      .update({
        project: form.project,
        material_name: form.materialName,
        unit: form.unit || "",
        quantity: form.quantity || null,
        needed_on_site_date: form.neededOnSiteDate || null,
        lead_time: form.leadTime || null,
        supplier: form.supplier || "",
        notes: form.notes || "",
      })
      .eq("id", editingMaterial.id)

    if (error) console.error("Error updating material:", error)
    else {
      fetchMaterials()
      setEditingMaterial(null)
      setShowModal(false)
    }
  }

  // Mark as Requested — saves today as request date
  const handleMarkRequested = async (id) => {
    const today = new Date().toISOString().split("T")[0]
    const { error } = await supabase
      .from("materials")
      .update({
        request_status: "Requested",
        request_prep_date: today,
      })
      .eq("id", id)
    if (error) console.error("Error marking requested:", error)
    else fetchMaterials()
  }

  // Mark as Delivered — saves today as delivery date
  const handleMarkDelivered = async (id) => {
    const today = new Date().toISOString().split("T")[0]
    if (window.confirm("Mark this material as delivered?")) {
      const { error } = await supabase
        .from("materials")
        .update({
          request_status: "Delivered",
          delivery_date: today,
        })
        .eq("id", id)
      if (error) console.error("Error marking delivered:", error)
      else fetchMaterials()
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Delete this material?")) {
      const { error } = await supabase.from("materials").delete().eq("id", id)
      if (error) console.error("Error deleting material:", error)
      else fetchMaterials()
    }
  }

  const filteredMaterials = materials
    .filter(m => showDelivered ? true : m.requestStatus !== "Delivered")
    .filter(m => selectedProject === "All" ? true : m.project === selectedProject)
    .filter(m => selectedStatus === "All" ? true : m.requestStatus === selectedStatus)
    .filter(m => selectedUrgency === "All" ? true : m.urgency === selectedUrgency)
    .filter(m => searchQuery === "" ? true :
      m.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.supplier || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const order = { Overdue: 0, Critical: 1, High: 2, Medium: 3, Low: 4, Delivered: 5 }
      return (order[a.urgency] ?? 5) - (order[b.urgency] ?? 5)
    })

  const overdue = materials.filter(m => m.urgency === "Overdue").length
  const critical = materials.filter(m => m.urgency === "Critical").length
  const high = materials.filter(m => m.urgency === "High").length
  const deliveredCount = materials.filter(m => m.requestStatus === "Delivered").length

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="bg-gray-900 border border-green-500/30 rounded-xl p-4 text-center">
          <p className="text-green-400 text-2xl font-bold">{deliveredCount}</p>
          <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Delivered</p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-20">
          <p className="text-yellow-400 text-lg animate-pulse">⚡ Loading materials...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Filters */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              placeholder="🔍 Search materials..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-400"
            />
            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
              <option value="All">All Projects</option>
              {(projects || []).map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
              className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
              <option value="All">All Statuses</option>
              <option>Not Requested</option>
              <option>Requested</option>
              <option>Ordered</option>
              <option>Delayed</option>
              <option>Delivered</option>
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

          {/* Show Delivered Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDelivered(!showDelivered)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${showDelivered ? "bg-green-400 text-gray-900 font-bold" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
              {showDelivered ? "✅ Showing Delivered" : "Show Delivered Materials"}
            </button>
          </div>

          {/* Materials Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3">Project</th>
                    <th className="text-left px-4 py-3">Material</th>
                    <th className="text-left px-4 py-3">Qty</th>
                    <th className="text-left px-4 py-3">Urgency</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Needed On Site</th>
                    <th className="text-left px-4 py-3">Request By</th>
                    <th className="text-left px-4 py-3">Requested On</th>
                    <th className="text-left px-4 py-3">Delivered On</th>
                    <th className="text-left px-4 py-3">Supplier</th>
                    <th className="text-left px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterials.length === 0 && (
                    <tr>
                      <td colSpan={11} className="text-center text-gray-500 py-10">
                        No materials found. Add your first material!
                      </td>
                    </tr>
                  )}
                  {filteredMaterials.map((material, index) => (
                    <tr key={material.id}
                      className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${
                        material.requestStatus === "Delivered" ? "opacity-50" :
                        index % 2 === 0 ? "bg-gray-900" : "bg-gray-800/20"
                      }`}>
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
                      <td className="px-4 py-3">
                        <UrgencyBadge urgency={material.urgency} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={material.requestStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-gray-300 text-xs">{material.neededOnSiteDate || "—"}</p>
                          <DaysBadge date={material.neededOnSiteDate} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          {material.suggestedRequestDate ? (
                            <>
                              <p className="text-yellow-400 text-xs font-medium">{material.suggestedRequestDate}</p>
                              <DaysBadge date={material.suggestedRequestDate} />
                            </>
                          ) : (
                            <span className="text-gray-600 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-300 text-xs">{material.requestPrepDate || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-400 text-xs">{material.deliveryDate || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-400 text-xs">{material.supplier || "—"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          {/* Edit */}
                          <button
                            onClick={() => { setEditingMaterial(material); setShowModal(true) }}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                            ✏️
                          </button>

                          {/* Mark Requested */}
                          {material.requestStatus === "Not Requested" && (
                            <button
                              onClick={() => handleMarkRequested(material.id)}
                              title="Mark as Requested"
                              className="text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 px-2 py-1 rounded-lg transition-colors">
                              📋 Requested
                            </button>
                          )}

                          {/* Mark Delivered */}
                          {material.requestStatus !== "Delivered" && material.requestStatus !== "Not Requested" && (
                            <button
                              onClick={() => handleMarkDelivered(material.id)}
                              title="Mark as Delivered"
                              className="text-xs bg-green-500/20 text-green-400 hover:bg-green-500/40 px-2 py-1 rounded-lg transition-colors">
                              ✅ Delivered
                            </button>
                          )}

                          {/* Delete */}
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
        </>
      )}

      {/* Modal */}
      {showModal && (
        <MaterialModal
          material={editingMaterial}
          projects={projects}
          onSave={editingMaterial ? handleEdit : handleAdd}
          onClose={() => { setShowModal(false); setEditingMaterial(null) }}
        />
      )}

    </div>
  )
}

export default Materials