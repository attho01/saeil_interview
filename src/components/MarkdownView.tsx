import React from 'react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Simple clean markdown parser for standard blocks, tables, headers, lists, and callouts
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let tableKey = 0;

  const flushTable = () => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const bodyRows = tableRows.slice(1).filter(r => !r.every(c => c.trim().match(/^:?-+:?$/)));

      elements.push(
        <div key={`table-${tableKey++}`} className="overflow-x-auto my-4 border border-slate-200 rounded-lg">
          <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-200">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-900 uppercase">
              <tr>
                {headerRow.map((cell, idx) => (
                  <th key={idx} className="px-4 py-3 whitespace-nowrap">
                    {formatInline(cell.trim())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 text-slate-700 align-top">
                      {formatInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for table line
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      const cells = line
        .trim()
        .slice(1, -1)
        .split('|');
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="text-base font-semibold text-slate-900 mt-5 mb-2">
          {formatInline(line.replace('### ', ''))}
        </h4>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="text-lg font-bold text-slate-900 mt-6 mb-3 border-b border-slate-100 pb-1">
          {formatInline(line.replace('## ', ''))}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h2 key={i} className="text-xl font-bold text-slate-900 mt-6 mb-4">
          {formatInline(line.replace('# ', ''))}
        </h2>
      );
    }
    // Blockquote
    else if (line.startsWith('> ')) {
      elements.push(
        <div key={i} className="border-l-4 border-amber-400 bg-amber-50/60 px-4 py-2 my-2 text-slate-800 text-sm italic">
          {formatInline(line.replace('> ', ''))}
        </div>
      );
    }
    // Bullet list
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      elements.push(
        <div key={i} className="flex items-start gap-2 my-1 text-sm text-slate-700">
          <span className="text-slate-400 mt-1 select-none">•</span>
          <div className="flex-1">{formatInline(line.trim().slice(2))}</div>
        </div>
      );
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line.trim())) {
      const match = line.trim().match(/^(\d+\.)\s(.*)$/);
      if (match) {
        elements.push(
          <div key={i} className="flex items-start gap-2.5 my-1.5 text-sm text-slate-700">
            <span className="font-semibold text-slate-900 shrink-0 tabular-nums">{match[1]}</span>
            <div className="flex-1">{formatInline(match[2])}</div>
          </div>
        );
      }
    }
    // Empty line
    else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    }
    // Regular text
    else {
      // Check if it's a "추가 확인 필요" alert line
      const isMissingInfo = line.includes('추가 확인 필요');
      elements.push(
        <p
          key={i}
          className={`text-sm leading-relaxed my-1.5 ${
            isMissingInfo ? 'bg-amber-50 text-amber-900 border border-amber-200 p-2.5 rounded-lg font-medium' : 'text-slate-700'
          }`}
        >
          {formatInline(line)}
        </p>
      );
    }
  }

  if (inTable) {
    flushTable();
  }

  return <div className={`prose-sm max-w-none text-slate-800 ${className}`}>{elements}</div>;
};

// Helper for formatting inline markdown like bold, tags, code
function formatInline(text: string): React.ReactNode {
  // Replace [추가 확인 필요]
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[추가 확인 필요\]|\[확인됨\]|\[추정\]|구직자A)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part === '[추가 확인 필요]') {
      return (
        <span key={index} className="inline-flex items-center text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded text-xs mx-1">
          ⚠️ 추가 확인 필요
        </span>
      );
    }
    if (part === '[확인됨]') {
      return (
        <span key={index} className="inline-flex items-center text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-xs mx-1">
          ✓ 확인됨
        </span>
      );
    }
    if (part === '[추정]') {
      return (
        <span key={index} className="inline-flex items-center text-slate-600 font-medium bg-slate-100 px-1.5 py-0.5 rounded text-xs mx-1">
          ~ 추정
        </span>
      );
    }
    if (part === '구직자A') {
      return (
        <span key={index} className="font-semibold text-rose-700">
          구직자A
        </span>
      );
    }
    return part;
  });
}
