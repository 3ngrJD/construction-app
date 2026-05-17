// ============================================
// PROJECTS HOOK - FETCH FROM SUPABASE
// ============================================

import { useState, useEffect } from "react"
import { supabase } from "./supabase"

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "Active")
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching projects:", error)
    } else {
      setProjects(data)
    }
    setLoading(false)
  }

  const addProject = async (name, description = "") => {
    const { error } = await supabase
      .from("projects")
      .insert([{ name, description, status: "Active" }])
    if (error) console.error("Error adding project:", error)
    else fetchProjects()
  }

  const updateProject = async (id, updates) => {
    const { error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
    if (error) console.error("Error updating project:", error)
    else fetchProjects()
  }

  const archiveProject = async (id) => {
    const { error } = await supabase
      .from("projects")
      .update({ status: "Archived" })
      .eq("id", id)
    if (error) console.error("Error archiving project:", error)
    else fetchProjects()
  }

  return { projects, loading, fetchProjects, addProject, updateProject, archiveProject }
}