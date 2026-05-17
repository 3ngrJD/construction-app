// ============================================
// PROJECTS MANAGEMENT PAGE
// ============================================

import { useState } from "react"
import { useProjects } from "../useProjects"

// ============================================
// STATUS BADGE
// ============================================

function StatusBadge({ status }) {
  const colors = {
    "Active": "bg-green-500/20 text-green-400 border border-green-500/30",
    "Archived": "bg-gray-500/20 text-gray-400 border border-gray-500/30",
    "On Hold": "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colors[status] || colors.Active}`}>
      {status}
    </span>
  )
}

// ============================================
// ADD/EDIT PROJECT MODAL
// ============================================

function ProjectModal({ project, onSave, onClose }) {
  const [form, setForm] = useState(project || {
    name: "",
    description: "",
    status: "Active",
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    if (!form.name.trim()) return alert("Project name is required")
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-white font-bold text-lg">
            {project ? "✏️ Edit Project" : "➕ Add New Project"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">Project Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. SM Mall Renovation"
              className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of the project..."
              rows={3}
              className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full mt-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
              <option>Active</option>
              <option>On Hold</option>
              <option>Archived</option>
            </select>
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
            {project ? "Save Changes" : "Add Project"}
          </button>
        </div>

      </div>
    </div>
  )
}

// ============================================
// MAIN PROJECTS PAGE
// ============================================

function Projects() {
  const { projects, loading, addProject, updateProject, archiveProject } = useProjects()
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("Active")

  const filteredProjects = projects
    .filter(p => selectedStatus === "All" ? true : p.status === selectedStatus)
    .filter(p => searchQuery === "" ? true :
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

  const handleSave = async (form) => {
    if (editingProject) {
      await updateProject(editingProject.id, {
        name: form.name,
        description: form.description,
        status: form.status,
      })
    } else {
      await addProject(form.name, form.description)
    }
    setShowModal(false)
    setEditingProject(null)
  }

  const handleArchive = async (id) => {
    if (window.confirm("Archive this project? It will be hidden from all dropdowns.")) {
      await archiveProject(id)
    }
  }

  const activeCount = projects.filter(p => p.status === "Active").length
  const onHoldCount = projects.filter(p => p.status === "On Hold").length

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">🏢 Projects</h1>
          <p className="text-gray-500 text-sm mt-1">{activeCount} active projects</p>
        </div>
        <button
          onClick={() => { setEditingProject(null); setShowModal(true) }}
          className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-300 transition-colors">
          ➕ Add Project
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-green-500/30 rounded-xl p-4 text-center">
          <p className="text-green-400 text-2xl font-bold">{activeCount}</p>
          <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Active Projects</p>
        </div>
        <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-4 text-center">
          <p className="text-yellow-400 text-2xl font-bold">{onHoldCount}</p>
          <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">On Hold</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="🔍 Search projects..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-yellow-400"
        />
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400">
          <option value="All">All Statuses</option>
          <option>Active</option>
          <option>On Hold</option>
          <option>Archived</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <p className="text-yellow-400 text-lg animate-pulse">⚡ Loading projects...</p>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredProjects.length === 0 && (
            <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
              <p className="text-gray-500 text-sm">No projects found.</p>
              <p className="text-gray-600 text-xs mt-1">Add your first project using the button above.</p>
            </div>
          )}
          {filteredProjects.map(project => (
            <div key={project.id}
              className="bg-gray-900 border border-gray-800 hover:border-yellow-500/30 rounded-xl p-5 transition-all">

              {/* Project Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg truncate">🏢 {project.name}</h3>
                  {project.description && (
                    <p className="text-gray-400 text-xs mt-1">{project.description}</p>
                  )}
                  <p className="text-gray-600 text-xs mt-2">
                    Added {new Date(project.created_date).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={project.status} />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-800">
                <button
                  onClick={() => { setEditingProject(project); setShowModal(true) }}
                  className="flex-1 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/20 hover:border-blue-500/40 rounded-lg py-2 transition-colors">
                  ✏️ Edit
                </button>
                {project.status !== "Archived" && (
                  <button
                    onClick={() => handleArchive(project.id)}
                    className="flex-1 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg py-2 transition-colors">
                    📦 Archive
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProjectModal
          project={editingProject}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingProject(null) }}
        />
      )}

    </div>
  )
}

export default Projects