export function PagePlaceholder({
  title,
  description,
  frIds,
  fase,
}: {
  title: string;
  description: string;
  frIds: string;
  fase: string;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md rounded-[10px] border border-border bg-surface p-6">
        <div className="mb-2 inline-block rounded-full bg-cyan/15 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wide text-cyan">
          {fase}
        </div>
        <h2 className="mb-2 text-[16px] font-extrabold">{title}</h2>
        <p className="mb-3 text-[12.5px] leading-relaxed text-ink-2">{description}</p>
        <div className="font-mono text-[10.5px] text-ink-3">Referensi: {frIds}</div>
      </div>
    </div>
  );
}
