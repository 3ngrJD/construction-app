// ============================================
// MAIN APP - CONSTRUCTION COMMAND CENTER
// ============================================

import { useState } from "react"
import Sidebar from "./components/Sidebar"
import Dashboard from "./pages/Dashboard"
import Tasks from "./pages/Tasks"
import Materials from "./pages/Materials"
import Plans from "./pages/Plans"
import Manpower from "./pages/Manpower"
import Lookahead from "./pages/Lookahead"
import Inbox from "./pages/Inbox"
import Projects from "./pages/Projects"

function App() {
  const [activePage, setActivePage] = useState("dashboard")

  // Shared state across modules
  const [tasks, setTasks] = useState([])
  const [materials, setMaterials] = useState([])
  const [plans, setPlans] = useState([])
  const [manpower, setManpower] = useState([])

  // Inbox → Module handlers
  const handleSendToTasks = (newTask) => {
    setTasks(prev => [...prev, newTask])
    setActivePage("tasks")
  }

  const handleSendToMaterials = (newMaterial) => {
    setMaterials(prev => [...prev, newMaterial])
    setActivePage("materials")
  }

  const handleSendToPlans = (newPlan) => {
    setPlans(prev => [...prev, newPlan])
    setActivePage("plans")
  }

  const handleSendToManpower = (newEntry) => {
    setManpower(prev => [...prev, newEntry])
    setActivePage("manpower")
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />
      case "projects":
        return <Projects />
      case "tasks":
        return <Tasks inboxTasks={tasks} />
      case "materials":
        return <Materials inboxMaterials={materials} />
      case "plans":
        return <Plans inboxPlans={plans} />
      case "manpower":
        return <Manpower inboxManpower={manpower} />
      case "lookahead":
        return <Lookahead />
      case "inbox":
        return (
          <Inbox
            onSendToTasks={handleSendToTasks}
            onSendToMaterials={handleSendToMaterials}
            onSendToPlans={handleSendToPlans}
            onSendToManpower={handleSendToManpower}
          />
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  )
}

export default App