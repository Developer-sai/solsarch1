"use client"

import { useEffect, useRef } from "react"
import Mermaid from "mermaid"

interface ArchitectureDiagramProps {
  components: Array<{
    id: string
    component_name: string
    component_type: string
    cloud_provider?: string
  }>
}

export function ArchitectureDiagram({ components }: ArchitectureDiagramProps) {
  const diagramRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!diagramRef.current) return

    // Initialize mermaid
    Mermaid.initialize({ startOnLoad: true, theme: "dark" })

    const diagram = generateDiagram(components)
    diagramRef.current.innerHTML = `<div class="mermaid">${diagram}</div>`

    // Render the diagram
    Mermaid.contentLoaded()
  }, [components])

  return <div ref={diagramRef} className="w-full overflow-auto bg-card/50 rounded-lg p-4 border border-border/40" />
}

function generateDiagram(components: Array<{ id: string; component_name: string; component_type: string }>) {
  if (!components || components.length === 0) {
    return `graph TD
      A["No Components"]`
  }

  // Group components by type
  const grouped: Record<string, typeof components> = {}
  components.forEach((c) => {
    if (!grouped[c.component_type]) {
      grouped[c.component_type] = []
    }
    grouped[c.component_type].push(c)
  })

  let diagram = `graph TD
    subgraph Frontend["🎨 Frontend & API"]
        direction LR
`

  let nodeCount = 0
  const nodeIds: Record<string, string> = {}

  // Add compute components
  if (grouped["compute"]) {
    grouped["compute"].forEach((c) => {
      const id = `C${nodeCount++}`
      nodeIds[c.id] = id
      diagram += `        ${id}["🖥️ ${c.component_name}"]
`
    })
  }

  // Add API components
  if (grouped["api"]) {
    grouped["api"].forEach((c) => {
      const id = `C${nodeCount++}`
      nodeIds[c.id] = id
      diagram += `        ${id}["🔌 ${c.component_name}"]
`
    })
  }

  diagram += `    end

    subgraph Data["🗄️ Data Layer"]
        direction LR
`

  // Add database components
  if (grouped["database"]) {
    grouped["database"].forEach((c) => {
      const id = `C${nodeCount++}`
      nodeIds[c.id] = id
      diagram += `        ${id}["🗄️ ${c.component_name}"]
`
    })
  }

  // Add cache components
  if (grouped["cache"]) {
    grouped["cache"].forEach((c) => {
      const id = `C${nodeCount++}`
      nodeIds[c.id] = id
      diagram += `        ${id}["⚡ ${c.component_name}"]
`
    })
  }

  // Add storage components
  if (grouped["storage"]) {
    grouped["storage"].forEach((c) => {
      const id = `C${nodeCount++}`
      nodeIds[c.id] = id
      diagram += `        ${id}["📦 ${c.component_name}"]
`
    })
  }

  diagram += `    end

    subgraph Infra["🌐 Infrastructure & Services"]
        direction LR
`

  // Add remaining components
  Object.entries(grouped).forEach(([type, comps]) => {
    if (!["compute", "api", "database", "cache", "storage"].includes(type)) {
      comps.forEach((c) => {
        const id = `C${nodeCount++}`
        nodeIds[c.id] = id
        const icon = getIcon(type)
        diagram += `        ${id}["${icon} ${c.component_name}"]
`
      })
    }
  })

  diagram += `    end

    style Frontend fill:#1e293b,stroke:#a78bfa,color:#f1f5f9
    style Data fill:#1e293b,stroke:#a78bfa,color:#f1f5f9
    style Infra fill:#1e293b,stroke:#a78bfa,color:#f1f5f9
`

  return diagram
}

function getIcon(type: string): string {
  const icons: Record<string, string> = {
    compute: "🖥️",
    database: "🗄️",
    storage: "📦",
    cache: "⚡",
    cdn: "🌍",
    messaging: "📨",
    networking: "🔗",
    security: "🔒",
    monitoring: "📊",
    api: "🔌",
    messaging_queue: "📬",
    search: "🔍",
  }
  return icons[type] || "📌"
}
