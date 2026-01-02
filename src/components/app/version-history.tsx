"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

interface Version {
  id: string
  version_number: number
  title: string
  description: string
  created_at: string
}

interface VersionHistoryProps {
  architectureId: string
  versions: Version[]
  onRestore: (versionId: string) => Promise<void>
  onCompare: (fromId: string, toId: string) => Promise<void>
}

export function VersionHistory({ architectureId, versions, onRestore, onCompare }: VersionHistoryProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)

  const handleRestore = async (versionId: string) => {
    setIsLoading(true)
    try {
      await onRestore(versionId)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Version History</h3>
        <Badge>{versions.length} versions</Badge>
      </div>

      <div className="space-y-3">
        {versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No versions yet. Create a snapshot to get started.</p>
        ) : (
          versions.map((version, index) => (
            <Card
              key={version.id}
              className={`p-4 cursor-pointer transition-colors ${
                selectedVersion === version.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedVersion(version.id)}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{version.title}</h4>
                    <Badge variant="outline">v{version.version_number}</Badge>
                    {index === 0 && <Badge className="bg-green-500/20 text-green-700">Current</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{version.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {index > 0 && (
                    <Button size="sm" variant="outline" onClick={() => handleRestore(version.id)} disabled={isLoading}>
                      Restore
                    </Button>
                  )}
                  {index > 0 && selectedVersion && (
                    <Button size="sm" variant="outline" onClick={() => onCompare(version.id, selectedVersion)}>
                      Compare
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
