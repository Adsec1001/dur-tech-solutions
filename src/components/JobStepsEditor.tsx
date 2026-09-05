import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Pencil, Trash2, Save, X, Plus, GripVertical, ArrowRight } from "lucide-react";
import type { JobStep } from "@/types/serviceJob";

interface Props {
  steps: JobStep[];
  onChange: (steps: JobStep[]) => void | Promise<void>;
  title?: string;
}

const JobStepsEditor = ({ steps, onChange, title = "İşlem Adımları" }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newText, setNewText] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const list = steps || [];

  const addStep = async () => {
    const text = newText.trim();
    if (!text) return;
    setNewText("");
    await onChange([
      ...list,
      { id: crypto.randomUUID(), description: text, completed: false, createdAt: new Date().toISOString() },
    ]);
  };

  const toggle = (id: string) =>
    onChange(
      list.map((s) =>
        s.id === id
          ? { ...s, completed: !s.completed, completedAt: !s.completed ? new Date().toISOString() : undefined }
          : s,
      ),
    );

  const saveEdit = async (id: string) => {
    const text = editText.trim();
    if (!text) return;
    setEditingId(null);
    setEditText("");
    await onChange(list.map((s) => (s.id === id ? { ...s, description: text } : s)));
  };

  const remove = (id: string) => onChange(list.filter((s) => s.id !== id));

  const dropOn = async (targetId: string) => {
    const sourceId = dragId;
    setDragId(null);
    setOverId(null);
    if (!sourceId || sourceId === targetId) return;
    const next = [...list];
    const from = next.findIndex((s) => s.id === sourceId);
    const to = next.findIndex((s) => s.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    await onChange(next);
  };

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{title}</p>
      {list.length === 0 && <p className="text-xs text-muted-foreground mb-2">Henüz adım eklenmedi</p>}
      <div className="space-y-1.5">
        {list.map((step, i) => (
          <div
            key={step.id}
            onDragOver={(e) => {
              e.preventDefault();
              if (dragId && overId !== step.id) setOverId(step.id);
            }}
            onDrop={(e) => {
              e.preventDefault();
              dropOn(step.id);
            }}
            className={`flex items-center gap-2 rounded-md bg-card/60 px-2 py-1.5 border transition-all ${
              overId === step.id && dragId && dragId !== step.id ? "border-primary" : "border-transparent"
            } ${dragId === step.id ? "opacity-50" : ""}`}
          >
            <span
              draggable
              onDragStart={() => setDragId(step.id)}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
              title="Sıralamak için sürükleyin"
              className="shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-primary"
            >
              <GripVertical className="h-4 w-4" />
            </span>
            <button
              onClick={() => toggle(step.id)}
              className={`h-5 w-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                step.completed
                  ? "bg-green-500/20 border-green-500/50 text-green-400"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {step.completed ? <Check className="h-3 w-3" /> : <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            </button>
            {editingId === step.id ? (
              <>
                <Input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(step.id)}
                  className="text-sm h-7 flex-1"
                  maxLength={200}
                  autoFocus
                />
                <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => saveEdit(step.id)}>
                  <Save className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                <span className={`text-sm flex-1 min-w-0 break-words ${step.completed ? "text-muted-foreground" : "text-foreground"}`}>
                  {i + 1}. {step.description}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    setEditingId(step.id);
                    setEditText(step.description);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => remove(step.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <Input
          placeholder="Yeni adım ekle..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addStep()}
          className="text-sm h-8"
          maxLength={200}
        />
        <Button size="sm" variant="outline" className="h-8" onClick={addStep}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default JobStepsEditor;
