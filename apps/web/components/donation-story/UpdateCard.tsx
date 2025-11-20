import { useState } from "react";
import Image from "next/image";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DonorBadges } from "./DonorBadges";
import type { Update, Comment } from "./types";

interface UpdateCardProps {
  update: Update;
  index: number;
  comments: Comment[];
  newComment: string;
  onCommentChange: (value: string) => void;
  onAddComment: () => void;
  onImageClick: (image: string, update: Update) => void;
}

export function UpdateCard({
  update,
  index,
  comments,
  newComment,
  onCommentChange,
  onAddComment,
  onImageClick,
}: UpdateCardProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleComments = showAll ? comments : comments.slice(-3);
  const hasMoreComments = comments.length > 3;

  return (
    <div className="overflow-hidden rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm">
      <div className="p-4 md:p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-[200px_1fr]">
          <div
            className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-md md:aspect-square md:h-[200px] md:w-[200px] hover:opacity-90 transition-opacity"
            onClick={() => onImageClick(update.image, update)}
          >
            <Image
              src={update.image || "/placeholder.svg"}
              alt={update.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col space-y-3">
            <div>
              <div className="mb-2 flex items-start justify-between gap-4">
                <h3 className="font-sans text-lg font-bold text-foreground md:text-xl">
                  {update.title}
                </h3>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {update.date}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 md:text-base">
                {update.description}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary/20 pt-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MessageCircle className="h-4 w-4" />
            <span className="font-semibold">
              {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
            </span>
          </div>

          {visibleComments.length > 0 && (
            <div className="space-y-2">
              {visibleComments.map((comment, commentIndex) => (
                <div key={commentIndex} className="rounded-lg bg-background/60 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {comment.author}
                      </span>
                      {comment.badges !== undefined && comment.badges > 0 && (
                        <DonorBadges badges={comment.badges} />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{comment.date}</span>
                  </div>
                  <p className="text-sm text-foreground/90">{comment.message}</p>
                </div>
              ))}
            </div>
          )}

          {hasMoreComments && !showAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(true)}
              className="w-full text-primary hover:text-primary/80"
            >
              Read {comments.length - 3} more {comments.length - 3 === 1 ? "comment" : "comments"}
            </Button>
          )}

          {hasMoreComments && showAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(false)}
              className="w-full text-primary hover:text-primary/80"
            >
              Show less
            </Button>
          )}

          <div className="flex gap-2">
            <Textarea
              placeholder="Leave a message of support..."
              value={newComment}
              onChange={(e) => onCommentChange(e.target.value)}
              className="min-h-[60px] resize-none"
            />
            <Button
              size="icon"
              onClick={onAddComment}
              disabled={!newComment.trim()}
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
