// ============================================
// INBOX / CAPTURE SYSTEM - WITH SUPABASE
// ============================================

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { useProjects } from "../useProjects"

// ============================================
// AUTO CLASSIFIER
// ============================================

function classifyEntry(text) {
  const lower = text.toLowerCase()

  const materialKeywords = ["deliver", "supply", "material", "rebar", "cement",
    "concrete", "steel", "lumber", "pipe", "wire", "aggregate", "sand", "gravel",
    "paint", "order", "purchase", "procure", "stock", "inventory", "supplier", "vendor"]

  const planKeywords = ["drawing", "plan", "blueprint", "submit", "approval", "approve",
    "design", "structural", "architectural", "shop drawing", "revision", "revise",
    "engineer", "architect", "permit", "specification"]

  const manpowerKeywords = ["worker", "workers", "manpower", "labor", "labour", "crew",
    "carpenter", "mason", "welder", "electrician", "plumber", "foreman",
    "hire", "mobilize", "team", "staff", "personnel", "people"]

  const scores = {
    Tasks: 0,
    Materials: materialKeywords.filter(k => lower.includes(k)).length,
    Plans: planKeywords.filter(k => lower.includes(k)).length,
    Manpower: manpowerKeywords.filter(k => lower.includes(k)).length,
  }

  const maxScore = Math.max(...Object.values(scores))
  if (maxScore === 0) return "Tasks"
  return Object.keys(scores).find(k => scores[k] === maxScore)
}

// ============================================
// EXTRACT DATE FROM TEXT
// ============================================

function extractDate(text) {
  const lower = text.toLowerCase()
  const today = new Date()

  if (lower.includes("today")) return today.toISOString().split("T")[0]

  if (lower.includes("tomorrow")) {
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  if (lower.includes("next week")) {
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    return nextWeek.toISOString().split("T")[0]
  }

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  for (const day of days) {
    if (lower.includes(day)) {
      const targetDay = days.indexOf(day)
      const currentDay = today.getDay() === 0 ? 6 : today.getDay() - 1
      let daysUntil = targetDay - currentDay
      if (daysUntil <= 0) daysUntil += 7
      const result = new Date(today)
      result.setDate(today.getDate() + daysUntil)
      return result.toISOString().split("T")[0]
    }
  }

  return ""
}

// ============================================
// CATEGORY BADGE
// ============================================

function CategoryBadge({ category }) {
  const colors = {
    Tasks: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    Materials: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    Plans: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    Manpower: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  }
  const icons = { Tasks: "✅", Materials: "🏗️", Plans: "📐", Manpower: "👷" }
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colors[category] || colors.Tasks}`}>
      {icons[category]} {category}
    </span>
  )
}

// ============================================
// STATUS BADGE
// ============================================

function StatusBadge({ status }) {
  const colors = {
    "New": "bg-gray-500/20 text-gray-400",
    "Processed": "bg-green-500/20 text-green-400",
    "Dismissed": "bg-red-500/20 text-red-400",
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colors[status] || colors.New}`}>
      {status}
    </span>
  )
}

// ============================================
// SEND TO MODULE MODAL
// ============================================

function SendToModuleModal({ entry, projects, onConfirm, onClose }) {
  const [form, setForm] = useState(() => {
    const base = {
      category: entry.category,
      project: entry.project || (projects[0]?.name || ""),
      targetDate: entry.extracted_date || "",
      description: entry.raw_text,
    }
    if (entry.category === "Tasks") {
      return { ...base, priority: "Medium", status: "Not Started", area: "", nextAction: "", responsible: "", blockingItems: "", remarks: "" }
    }
    if (entry.category === "Materials") {
      return { ...base, materialName: entry.raw_text, unit: "", quantity: "", leadTime: "", supplier: "", requestStatus: "Not Started", notes: "" }
    }
    if (entry.category === "Plans") {
      return { ...base, planType: entry.raw_text, neededForActivity: "", status: "Not Requested", requestedFrom: "", revisionNumber: "", remarks: "" }
    }
    if (entry.category === "Manpower") {
      return { ...base, trade: "", allocated: 0, required: 0, date: entry.extracted_date || "", remarks: entry.raw_text }
    }
    return base
  })

  const handleChange = (e) => {
    const value = e.target.type === "number" ? parseInt(e.target.value) || 0 : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-white font-bold text-lg">📤 Send to Module</h2>
            <p className="text-gray-500 text-xs mt-1">Review and confirm details before sending</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-6 space-y-4">

          {/* Original Text */}
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-500 text-xs uppercase tracking-wider">Original Entry</p>
            <p className="text-white text-sm mt-1">{entry.raw_text}</p>
          </div>

          {/* Category Selector */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">
              Category — Change if misclassified
            </label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {["Tasks", "Materials", "Plans", "Manpower"].map(cat => (
                <button key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                    form.category === cat
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}>
                  {cat === "Tasks" ? "✅ Tasks" :
                   cat === "Materials" ? "🏗️ Materials" :
                   cat === "Plans" ? "📐 Plans" : "👷 Manpower"}
                </button>
              ))}
            </div>
          </div>

          {/* Project */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">Project</label>
            <select name="project" value={form.project} onChange={handleChange}
              className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
              {(projects || []).map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Target Date */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">
              Target Date {entry.extracted_date ? "(auto-detected)" : ""}
            </label>
            <input type="date" name="targetDate" value={form.targetDate} onChange={handleChange}
              className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
          </div>

          {/* TASKS FIELDS */}
          {form.category === "Tasks" && (
            <>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider">Activity Description</label>
                <input name="description" value={form.description} onChange={handleChange}
                  placeholder="Describe the task"
                  className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
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
                    <option>On Hold</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider">Area / Location</label>
                  <input name="area" value={form.area} onChange={handleChange}
                    placeholder="e.g. Foundation"
                    className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider">Responsible Person</label>
                  <input name="responsible" value={form.responsible} onChange={handleChange}
                    placeholder="e.g. Juan"
                    className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider">Next Action</label>
                <input name="nextAction" value={form.nextAction} onChange={handleChange}
                  placeholder="e.g. Follow up supplier"
                  className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
            </>
          )}

          {/* MATERIALS FIELDS */}
          {form.category === "Materials" && (
            <>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider">Material Name</label>
                <input name="materialName" value={form.materialName} onChange={handleChange}
                  placeholder="e.g. Rebar 16mm"
                  className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider">Quantity</label>
                  <input type="number" name="quantity" value={form.quantity} onChange={handleChange}
                    placeholder="e.g. 500"
                    className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider">Unit</label>
                  <input name="unit" value={form.unit} onChange={handleChange}
                    placeholder="e.g. pcs, bags, kg"
                    className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider">Lead Time (days)</label>
                  <input type="number" name="leadTime" value={form.leadTime} onChange={handleChange}
                    placeholder="e.g. 7"
                    className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider">Supplier</label>
                  <input name="supplier" value={form.supplier} onChange={handleChange}
                    placeholder="e.g. Steel Corp"
                    className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
              </div>
            </>
          )}

          {/* PLANS FIELDS */}
          {form.category === "Plans" && (
            <>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider">Plan Type</label>
                <input name="planType" value={form.planType} onChange={handleChange}
                  placeholder="e.g. Structural, Shop Drawing"
                  className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider">Needed For Activity</label>
                  <input name="neededForActivity" value={form.neededForActivity} onChange={handleChange}
                    placeholder="e.g. Foundation works"
                    className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider">Requested From</label>
                  <input name="requestedFrom" value={form.requestedFrom} onChange={handleChange}
                    placeholder="e.g. Structural Engineer"
                    className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
              </div>
            </>
          )}

          {/* MANPOWER FIELDS */}
          {form.category === "Manpower" && (
            <>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider">Trade / Classification</label>
                <input name="trade" value={form.trade} onChange={handleChange}
                  placeholder="e.g. Carpenter, Mason, Welder"
                  className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider">Allocated Workers</label>
                  <input type="number" name="allocated" value={form.allocated} onChange={handleChange}
                    min="0"
                    className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-wider">Required Workers</label>
                  <input type="number" name="required" value={form.required} onChange={handleChange}
                    min="0"
                    className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider">Remarks</label>
                <textarea name="remarks" value={form.remarks} onChange={handleChange}
                  rows={2}
                  className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-800">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={() => onConfirm(form)}
            className="px-6 py-2 text-sm bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-300 transition-colors">
            📤 Send to {form.category}
          </button>
        </div>

      </div>
    </div>
  )
}

// ============================================
// INBOX ENTRY CARD
// ============================================

function InboxCard({ entry, onSendTo, onDismiss, onDelete }) {
  return (
    <div className={`bg-gray-900 border rounded-xl p-5 transition-all ${
      entry.status === "New" ? "border-yellow-500/30" :
      entry.status === "Processed" ? "border-green-500/20 opacity-60" :
      "border-gray-800 opacity-40"
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm">{entry.raw_text}</p>
          <p className="text-gray-500 text-xs mt-1">
            {new Date(entry.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <CategoryBadge category={entry.category} />
          <StatusBadge status={entry.status} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {entry.project && (
          <div className="bg-gray-800/50 rounded-lg px-3 py-2">
            <p className="text-gray-500 text-xs">Project</p>
            <p className="text-white text-xs font-medium">{entry.project}</p>
          </div>
        )}
        {entry.extracted_date && (
          <div className="bg-gray-800/50 rounded-lg px-3 py-2">
            <p className="text-gray-500 text-xs">Detected Date</p>
            <p className="text-yellow-400 text-xs font-medium">{entry.extracted_date}</p>
          </div>
        )}
      </div>

      <div className="mt-3 bg-gray-800/30 rounded-lg px-3 py-2">
        <p className="text-gray-500 text-xs">Suggested Action</p>
        <p className="text-yellow-400 text-xs font-medium mt-1">
          → Send to {entry.category} module
          {entry.extracted_date ? ` · Date: ${entry.extracted_date}` : ""}
        </p>
      </div>

      {entry.sent_to && (
        <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
          <p className="text-green-400 text-xs font-medium">
            ✅ Sent to {entry.sent_to} module successfully
          </p>
        </div>
      )}

      {entry.status === "New" && (
        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => onSendTo(entry)}
            className="flex-1 bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg text-xs hover:bg-yellow-300 transition-colors">
            📤 Review & Send to Module
          </button>
          <button onClick={() => onDismiss(entry.id)}
            className="px-4 py-2 text-xs text-gray-400 hover:text-white border border-gray-700 rounded-lg transition-colors">
            Dismiss
          </button>
          <button onClick={() => onDelete(entry.id)}
            className="px-3 py-2 text-xs text-red-400 hover:text-red-300 transition-colors">
            🗑️
          </button>
        </div>
      )}

      {entry.status !== "New" && (
        <div className="flex justify-end mt-3">
          <button onClick={() => onDelete(entry.id)}
            className="text-xs text-red-400 hover:text-red-300 transition-colors">
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// MAIN INBOX PAGE
// ============================================

function Inbox({ onSendToTasks, onSendToMaterials, onSendToPlans, onSendToManpower }) {
  const { projects } = useProjects()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [rawInput, setRawInput] = useState("")
  const [selectedProject, setSelectedProject] = useState("")
  const [filterStatus, setFilterStatus] = useState("New")
  const [filterCategory, setFilterCategory] = useState("All")
  const [isProcessing, setIsProcessing] = useState(false)
  const [sendToEntry, setSendToEntry] = useState(null)

  const defaultProject = projects[0]?.name || ""

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("inbox")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching inbox:", error)
    } else {
      setEntries(data)
    }
    setLoading(false)
  }

  const handleCapture = async () => {
    if (!rawInput.trim()) return
    setIsProcessing(true)

    const category = classifyEntry(rawInput)
    const extractedDate = extractDate(rawInput)
    const project = selectedProject || defaultProject

    const { error } = await supabase.from("inbox").insert([{
      raw_text: rawInput.trim(),
      category,
      project,
      extracted_date: extractedDate || null,
      status: "New",
    }])

    if (error) {
      console.error("Error saving inbox entry:", error)
    } else {
      await fetchEntries()
      setRawInput("")
    }
    setIsProcessing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleCapture()
    }
  }

  const handleSendTo = (entry) => setSendToEntry(entry)

  const handleConfirmSend = async (form) => {
    const category = form.category

    if (category === "Tasks" && onSendToTasks) {
      onSendToTasks({
        project: form.project,
        area: form.area || "",
        activity: form.description,
        priority: form.priority || "Medium",
        status: form.status || "Not Started",
        startDate: "",
        targetDate: form.targetDate || "",
        blockingItems: "",
        dependencies: "",
        nextAction: form.nextAction || "",
        responsible: form.responsible || "",
        remarks: "",
        dateType: form.targetDate ? "Fixed Date" : "No Deadline",
      })
    }

    if (category === "Materials" && onSendToMaterials) {
      onSendToMaterials({
        project: form.project,
        materialName: form.materialName || form.description,
        unit: form.unit || "",
        quantity: form.quantity || "",
        neededOnSiteDate: form.targetDate || "",
        leadTime: form.leadTime || "",
        supplier: form.supplier || "",
        notes: "",
      })
    }

    if (category === "Plans" && onSendToPlans) {
      onSendToPlans({
        project: form.project,
        planType: form.planType || form.description,
        neededForActivity: form.neededForActivity || "",
        neededByDate: form.targetDate || "",
        status: "Not Requested",
        requestedFrom: form.requestedFrom || "",
        revisionNumber: "",
        remarks: "",
      })
    }

    if (category === "Manpower" && onSendToManpower) {
      onSendToManpower({
        project: form.project,
        trade: form.trade || "",
        allocated: form.allocated || 0,
        required: form.required || 0,
        date: form.targetDate || new Date().toISOString().split("T")[0],
        remarks: form.remarks || form.description,
      })
    }

    // Update entry status in Supabase
    const { error } = await supabase
      .from("inbox")
      .update({ status: "Processed", sent_to: category })
      .eq("id", sendToEntry.id)

    if (error) console.error("Error updating inbox entry:", error)
    else await fetchEntries()

    setSendToEntry(null)
  }

  const handleDismiss = async (id) => {
    const { error } = await supabase
      .from("inbox")
      .update({ status: "Dismissed" })
      .eq("id", id)
    if (error) console.error("Error dismissing entry:", error)
    else await fetchEntries()
  }

  const handleDelete = async (id) => {
    if (window.confirm("Delete this entry?")) {
      const { error } = await supabase
        .from("inbox")
        .delete()
        .eq("id", id)
      if (error) console.error("Error deleting entry:", error)
      else await fetchEntries()
    }
  }

  const handleClearProcessed = async () => {
    if (window.confirm("Clear all processed and dismissed entries?")) {
      const { error } = await supabase
        .from("inbox")
        .delete()
        .in("status", ["Processed", "Dismissed"])
      if (error) console.error("Error clearing entries:", error)
      else await fetchEntries()
    }
  }

  const filteredEntries = entries
    .filter(e => filterStatus === "All" ? true : e.status === filterStatus)
    .filter(e => filterCategory === "All" ? true : e.category === filterCategory)

  const newCount = entries.filter(e => e.status === "New").length
  const processedCount = entries.filter(e => e.status === "Processed").length
  const categoryBreakdown = {
    Tasks: entries.filter(e => e.category === "Tasks" && e.status === "New").length,
    Materials: entries.filter(e => e.category === "Materials" && e.status === "New").length,
    Plans: entries.filter(e => e.category === "Plans" && e.status === "New").length,
    Manpower: entries.filter(e => e.category === "Manpower" && e.status === "New").length,
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">📥 Inbox / Capture</h1>
          <p className="text-gray-500 text-sm mt-1">
            Brain dump your thoughts — classify and send to the right module
          </p>
        </div>
        {processedCount > 0 && (
          <button onClick={handleClearProcessed}
            className="text-xs text-gray-400 hover:text-white border border-gray-700 px-3 py-2 rounded-lg transition-colors">
            🧹 Clear Processed
          </button>
        )}
      </div>

      {/* Capture Box */}
      <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-5">
        <h2 className="text-yellow-400 font-bold mb-1">⚡ Quick Capture</h2>
        <p className="text-gray-500 text-xs mb-4">
          Type anything — system auto-classifies it. You can change the category before sending.
        </p>

        {/* Hint Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            "Need rebar delivery by Friday",
            "Submit structural drawings",
            "Request 5 carpenters next week",
            "Follow up on concrete pour",
          ].map(hint => (
            <button key={hint} onClick={() => setRawInput(hint)}
              className="text-xs text-gray-500 hover:text-yellow-400 border border-gray-700 hover:border-yellow-500/50 px-2 py-1 rounded-lg transition-colors">
              {hint}
            </button>
          ))}
        </div>

        {/* Input */}
        <textarea
          value={rawInput}
          onChange={e => setRawInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your task, material need, plan request, or manpower requirement... (Enter to capture)"
          rows={3}
          className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 resize-none placeholder-gray-600"
        />

        {/* Project & Submit */}
        <div className="flex items-center gap-3 mt-3">
          <select
            value={selectedProject || defaultProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
            {(projects || []).map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
          <button onClick={handleCapture}
            disabled={!rawInput.trim() || isProcessing}
            className="flex-1 bg-yellow-400 text-gray-900 font-bold px-6 py-2 rounded-lg text-sm hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isProcessing ? "⚡ Saving..." : "⚡ Capture"}
          </button>
        </div>

        {/* Live Preview */}
        {rawInput.trim() && (
          <div className="mt-3 bg-gray-800/50 rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap">
            <span className="text-gray-400 text-xs">Will be classified as:</span>
            <CategoryBadge category={classifyEntry(rawInput)} />
            {extractDate(rawInput) && (
              <>
                <span className="text-gray-400 text-xs">Date detected:</span>
                <span className="text-yellow-400 text-xs font-medium">{extractDate(rawInput)}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-4 text-center">
          <p className="text-yellow-400 text-2xl font-bold">{newCount}</p>
          <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">New Items</p>
        </div>
        <div className="bg-gray-900 border border-orange-500/30 rounded-xl p-4 text-center">
          <p className="text-orange-400 text-2xl font-bold">{categoryBreakdown.Materials}</p>
          <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">🏗️ Materials</p>
        </div>
        <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-4 text-center">
          <p className="text-blue-400 text-2xl font-bold">{categoryBreakdown.Plans}</p>
          <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">📐 Plans</p>
        </div>
        <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-4 text-center">
          <p className="text-purple-400 text-2xl font-bold">{categoryBreakdown.Manpower}</p>
          <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">👷 Manpower</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-gray-500 text-xs uppercase tracking-wider">Status:</span>
        {["New", "Processed", "Dismissed", "All"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${filterStatus === s ? "bg-yellow-400 text-gray-900 font-bold" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            {s}
          </button>
        ))}
        <span className="text-gray-700">|</span>
        <span className="text-gray-500 text-xs uppercase tracking-wider">Category:</span>
        {["All", "Tasks", "Materials", "Plans", "Manpower"].map(c => (
          <button key={c} onClick={() => setFilterCategory(c)}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${filterCategory === c ? "bg-yellow-400 text-gray-900 font-bold" : "bg-gray-800 text-gray-400 hover:text-white"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-10">
          <p className="text-yellow-400 animate-pulse">⚡ Loading inbox...</p>
        </div>
      )}

      {/* Entries */}
      {!loading && (
        <div className="space-y-3">
          {filteredEntries.length === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
              <p className="text-gray-500 text-sm">No entries found.</p>
              <p className="text-gray-600 text-xs mt-1">
                Use the Quick Capture box above to add your first entry.
              </p>
            </div>
          )}
          {filteredEntries.map(entry => (
            <InboxCard
              key={entry.id}
              entry={entry}
              onSendTo={handleSendTo}
              onDismiss={handleDismiss}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Send To Modal */}
      {sendToEntry && (
        <SendToModuleModal
          entry={sendToEntry}
          projects={projects}
          onConfirm={handleConfirmSend}
          onClose={() => setSendToEntry(null)}
        />
      )}

    </div>
  )
}

export default Inbox