"use client";

import { Fragment } from "react";

interface MarkdownRendererProps {
  text: string;
  className?: string;
}

export function MarkdownRenderer({ text, className }: MarkdownRendererProps) {
  return (
    <div className={`prose-dpiq text-sm leading-relaxed text-foreground ${className ?? ""}`}>
      {renderBlocks(text)}
    </div>
  );
}

function renderBlocks(text: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      out.push(
        <pre key={`code-${i}`} className="my-2 rounded-md bg-zinc-950/80 border border-border p-3 text-xs font-mono overflow-x-auto">
          <code>{buf.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    if (line.includes("|") && i + 1 < lines.length && lines[i + 1].match(/^[\s|\-:]+$/)) {
      const headers = line.split("|").map(c => c.trim()).filter(Boolean);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i].split("|").map(c => c.trim()).filter(Boolean));
        i++;
      }
      out.push(
        <div key={`tbl-${i}`} className="my-2 overflow-x-auto">
          <table className="w-full text-xs border border-border rounded-md">
            <thead className="bg-muted/40">
              <tr>{headers.map((h, hi) => <th key={hi} className="px-2 py-1.5 text-left border-b border-border">{renderInline(h)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} className="border-b border-border/40">
                  {r.map((c, ci) => <td key={ci} className="px-2 py-1.5">{renderInline(c)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const h1 = line.match(/^# (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    if (h1) { out.push(<h1 key={i} className="text-lg font-semibold mt-3 mb-1.5">{renderInline(h1[1])}</h1>); i++; continue; }
    if (h2) { out.push(<h2 key={i} className="text-base font-semibold mt-3 mb-1.5">{renderInline(h2[1])}</h2>); i++; continue; }
    if (h3) { out.push(<h3 key={i} className="text-sm font-semibold mt-2.5 mb-1">{renderInline(h3[1])}</h3>); i++; continue; }

    if (line.match(/^[\-\*] /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[\-\*] /)) {
        items.push(lines[i].replace(/^[\-\*] /, ""));
        i++;
      }
      out.push(
        <ul key={`ul-${i}`} className="list-disc pl-5 space-y-0.5 my-1.5">
          {items.map((it, ix) => <li key={ix}>{renderInline(it)}</li>)}
        </ul>,
      );
      continue;
    }

    if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      out.push(
        <ol key={`ol-${i}`} className="list-decimal pl-5 space-y-0.5 my-1.5">
          {items.map((it, ix) => <li key={ix}>{renderInline(it)}</li>)}
        </ol>,
      );
      continue;
    }

    if (!line.trim()) {
      out.push(<div key={`sp-${i}`} className="h-1.5" />);
      i++;
      continue;
    }

    out.push(<p key={i} className="my-1">{renderInline(line)}</p>);
    i++;
  }

  return out;
}

function renderInline(text: string): React.ReactNode {
  const out: React.ReactNode[] = [];
  let cursor = 0;
  const re = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\*([^*]+)\*)|(_([^_]+)_)|(\[([^\]]+)\]\(([^)]+)\))/g;
  let m: RegExpExecArray | null;
  let key = 0;

  while ((m = re.exec(text))) {
    if (m.index > cursor) out.push(<Fragment key={key++}>{text.slice(cursor, m.index)}</Fragment>);
    if (m[1]) out.push(<strong key={key++} className="font-semibold text-foreground">{m[2]}</strong>);
    else if (m[3]) out.push(<code key={key++} className="px-1 py-0.5 rounded bg-muted/60 text-emerald-300 font-mono text-[0.85em]">{m[4]}</code>);
    else if (m[5]) out.push(<em key={key++} className="italic">{m[6]}</em>);
    else if (m[7]) out.push(<em key={key++} className="italic">{m[8]}</em>);
    else if (m[9]) out.push(<a key={key++} href={m[11]} className="text-emerald-300 hover:underline" target="_blank" rel="noreferrer">{m[10]}</a>);
    cursor = m.index + m[0].length;
  }
  if (cursor < text.length) out.push(<Fragment key={key++}>{text.slice(cursor)}</Fragment>);
  return out;
}
