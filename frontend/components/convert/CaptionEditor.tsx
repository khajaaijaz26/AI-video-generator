"use client";
import { useState } from "react";
import { Captions, Plus, Trash2, Toggle } from "lucide-react";

interface Caption { start: number; end: number; text: string; }
interface Props {
  captions: Caption[];
  onChange: (c: Caption[]) => void;
  addCaptions: boolean;
  onToggle: (v: boolean) => void;
}

export default function CaptionEditor({ captions, onChange, addCaptions, onToggle }: Props) {
  const [newText, setNewText] = useState("");
  const [newStart, setNewStart] = useState(0);
  const [newEnd, setNewEnd] = useState(5);

  const addCaption = () => {
    if (!newText.trim()) return;
    onChange([...captions, { start: newStart, end: newEnd, text: newText.trim() }]);
    setNewText("");
  };

  const removeCaption = (i: number) => {
    onChange(captions.filter((_, idx) => idx !== i));
  };

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20">
            <Captions className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold">Captions</h3>
            <p className="text-xs text-muted-foreground">Auto-captions from subtitles + custom overlays</p>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-muted-foreground">Auto-captions</span>
          <div
            onClick={() => onToggle(!addCaptions)}
            className={`w-10 h-6 rounded-full transition-colors relative ${addCaptions ? "bg-primary" : "bg-muted"}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${addCaptions ? "translate-x-5" : "translate-x-1"}`} />
          </div>
        </label>
      </div>

      {/* Custom captions */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Custom Text Overlays</h4>
        {captions.map((c, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <span className="text-xs text-muted-foreground font-mono w-16 shrink-0">{c.start}s–{c.end}s</span>
            <span className="flex-1 text-sm truncate">{c.text}</span>
            <button onClick={() => removeCaption(i)} className="p-1 hover:text-destructive transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Add new */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="number"
            value={newStart}
            onChange={e => setNewStart(Number(e.target.value))}
            placeholder="0"
            className="w-14 px-2 py-1.5 text-xs rounded-lg bg-background border border-border focus:outline-none focus:border-primary"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="number"
            value={newEnd}
            onChange={e => setNewEnd(Number(e.target.value))}
            placeholder="5"
            className="w-14 px-2 py-1.5 text-xs rounded-lg bg-background border border-border focus:outline-none focus:border-primary"
          />
          <input
            type="text"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCaption()}
            placeholder="Caption text..."
            className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-background border border-border focus:outline-none focus:border-primary"
          />
          <button
            onClick={addCaption}
            className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
