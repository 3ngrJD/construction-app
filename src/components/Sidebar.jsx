// ============================================
// SIDEBAR NAVIGATION
// ============================================

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⚡" },
  { id: "projects", label: "Projects", icon: "🏢" },
  { id: "tasks", label: "Master Tasks", icon: "✅" },
  { id: "materials", label: "Materials", icon: "🏗️" },
  { id: "plans", label: "Plans & Drawings", icon: "📐" },
  { id: "manpower", label: "Manpower", icon: "👷" },
  { id: "lookahead", label: "Two-Week Lookahead", icon: "📅" },
  { id: "inbox", label: "Inbox / Capture", icon: "📥" },
]

function Sidebar({ activePage, setActivePage }) {
  return (
    <div className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      
      {/* App Title */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-yellow-400 font-bold text-lg leading-tight">
          ⚙️ Construction
        </h1>
        <p className="text-yellow-400 font-bold text-lg leading-tight">
          Command Center
        </p>
        <p className="text-gray-500 text-xs mt-1">Project Controls System</p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActivePage(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 ${
                  activePage === item.id
                    ? "bg-yellow-400 text-gray-900 font-bold"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <p className="text-gray-600 text-xs text-center">
          Single User Mode
        </p>
      </div>

    </div>
  );
}

export default Sidebar;