type Props = { text: string | null };

/** Renders stored plain text as paragraphs (no HTML injection). */
export function BlogPostBody({ text }: Props) {
  const raw = (text ?? "").trim();
  if (!raw) return null;

  const blocks = raw
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4 text-base leading-relaxed text-[#111111] md:text-lg">
      {blocks.map((block, i) => (
        <p key={i} className="whitespace-pre-wrap">
          {block}
        </p>
      ))}
    </div>
  );
}
