"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

interface Comment {
  id: string
  content: string
  created_at: string
  user_profiles: {
    email: string
    full_name: string
    avatar_url: string
  }
}

interface CommentsSectionProps {
  architectureId: string
  comments: Comment[]
  onAddComment: (content: string) => Promise<void>
  isReadOnly?: boolean
}

export function CommentsSection({ architectureId, comments, onAddComment, isReadOnly = false }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    setIsLoading(true)
    try {
      await onAddComment(newComment)
      setNewComment("")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Comments ({comments.length})</h3>

      {/* Add Comment */}
      {!isReadOnly && (
        <div className="space-y-2">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isLoading}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button onClick={handleAddComment} disabled={isLoading || !newComment.trim()} size="sm">
              {isLoading ? "Adding..." : "Add Comment"}
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet</p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">
                    {comment.user_profiles.full_name ? comment.user_profiles.full_name.charAt(0).toUpperCase() : "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-medium text-sm">{comment.user_profiles.full_name || "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground">{comment.user_profiles.email}</p>
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-sm mt-2">{comment.content}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
