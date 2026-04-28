"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_LABELS, BUILD_PATH_LABELS, STATUS_LABELS, type Status } from "@/lib/utils/constants";
import { scoreBg } from "@/lib/utils/scoring";
import { toast } from "sonner";
import { Recycle, Boxes, Star, Hammer, Rocket } from "lucide-react";
import type { Idea } from "@/types/database";

const COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: "detected", label: "Detected", color: "border-zinc-500/40" },
  { id: "reviewing", label: "Reviewing", color: "border-amber-500/40" },
  { id: "approved", label: "Approved", color: "border-emerald-500/40" },
  { id: "incubating", label: "Incubating", color: "border-cyan-500/40" },
  { id: "in_build", label: "In Build", color: "border-blue-500/40" },
  { id: "launched", label: "Launched", color: "border-fuchsia-500/40" },
];

export default function PipelinePage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ideas?limit=200&sort=score").then(r => r.json()).then(j => setIdeas(j.data)).finally(() => setLoading(false));
  }, []);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const id = result.draggableId;
    const newStatus = result.destination.droppableId as Status;
    const idea = ideas.find(i => i.id === id);
    if (!idea || idea.status === newStatus) return;

    setIdeas(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    toast.success(`Moved "${idea.title}" → ${STATUS_LABELS[newStatus]}`);

    await fetch(`/api/ideas/${id}/feedback`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: `move_to_${newStatus}` }),
    });
  };

  return (
    <div className="p-6 space-y-4 max-w-full">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">Drag ideas between columns to update status</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-6 gap-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-96" />)}</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {COLUMNS.map(col => {
              const colIdeas = ideas.filter(i => i.status === col.id).sort((a, b) => b.composite_score - a.composite_score);
              const Icon = col.id === "detected" ? Recycle : col.id === "approved" ? Boxes : col.id === "starred" ? Star : col.id === "in_build" ? Hammer : col.id === "launched" ? Rocket : Boxes;
              return (
                <Droppable key={col.id} droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded-lg border-2 ${col.color} bg-card/30 transition-colors ${snapshot.isDraggingOver ? "bg-accent/50" : ""}`}
                    >
                      <div className="px-3 py-2 border-b border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="size-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium uppercase tracking-wider">{col.label}</span>
                        </div>
                        <Badge variant="secondary" className="text-[9px]">{colIdeas.length}</Badge>
                      </div>

                      <div className="p-2 space-y-2 min-h-[400px] max-h-[calc(100vh-220px)] overflow-y-auto">
                        {colIdeas.length === 0 && (
                          <div className="text-center py-8 px-3">
                            <div className="size-8 rounded-full bg-muted/30 grid place-items-center mx-auto mb-2 opacity-40">
                              <Icon className="size-4" />
                            </div>
                            <p className="text-[10px] text-muted-foreground/70">Drop ideas here</p>
                          </div>
                        )}
                        {colIdeas.map((idea, idx) => (
                          <Draggable key={idea.id} draggableId={idea.id} index={idx}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={snapshot.isDragging ? "rotate-2 shadow-2xl" : ""}
                              >
                                <PipelineCard idea={idea} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}

function PipelineCard({ idea }: { idea: Idea }) {
  return (
    <Card className="hover:border-emerald-500/30 transition-colors cursor-grab active:cursor-grabbing">
      <CardContent className="p-2.5">
        <div className="flex items-start gap-2">
          <div className={`shrink-0 w-9 h-9 rounded-lg border grid place-items-center font-mono text-sm font-bold ${scoreBg(idea.composite_score)}`}>
            {idea.composite_score.toFixed(0)}
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/ideas/${idea.id}`} onClick={(e) => e.stopPropagation()} className="text-xs font-medium leading-tight line-clamp-2 hover:text-emerald-300">
              {idea.title}
            </Link>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="secondary" className="text-[8px] px-1 py-0">{CATEGORY_LABELS[idea.category]}</Badge>
              {idea.compliance_flag !== "green" && <span className={`size-1.5 rounded-full ${idea.compliance_flag === "red" ? "bg-red-400" : "bg-amber-400"}`} title={idea.compliance_flag} />}
            </div>
            <div className="text-[9px] text-muted-foreground mt-0.5">{BUILD_PATH_LABELS[idea.build_path]}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
