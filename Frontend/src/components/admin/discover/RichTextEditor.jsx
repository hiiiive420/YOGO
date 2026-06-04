import { useEffect, useRef } from 'react';
import { Bold, Italic, List, Pilcrow } from 'lucide-react';

const tools = [
  ['bold', Bold, 'Bold'],
  ['italic', Italic, 'Italic'],
  ['insertUnorderedList', List, 'List'],
  ['formatBlock', Pilcrow, 'Paragraph'],
];

export default function RichTextEditor({
  error,
  label,
  onChange,
  value,
}) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  function runCommand(command) {
    editorRef.current?.focus();
    document.execCommand(command, false, command === 'formatBlock' ? 'p' : null);
    onChange(editorRef.current?.innerHTML || '');
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-black/48">
          {label}
        </span>
        <div className="flex gap-1 rounded-lg border border-black/10 bg-pearl p-1">
          {tools.map(([command, Icon, toolLabel]) => (
            <button
              key={command}
              type="button"
              onClick={() => runCommand(command)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-black/58 transition hover:bg-white hover:text-cinnamon"
              aria-label={toolLabel}
              title={toolLabel}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className="min-h-56 rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-semibold leading-7 outline-none transition empty:before:text-black/34 empty:before:content-[attr(data-placeholder)] focus:border-obsidian"
        data-placeholder="Write the editorial destination story..."
      />
      {error && <p className="mt-2 text-sm text-red-600">{error.message}</p>}
    </div>
  );
}
