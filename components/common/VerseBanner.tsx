import Cross from '@/components/common/Cross';

// A one-line Scripture banner about family joy and unity — Psalm 133:1.
export default function VerseBanner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-2.5 text-center ${className}`}
    >
      <Cross size={14} className="text-[#c8933f] shrink-0" />
      <p className="font-hand text-[var(--ink-soft)] text-[0.95rem] leading-snug">
        兄弟が共に住むことは、なんと恵み豊かで、麗しいことでしょう。
        <span className="opacity-60 ml-1.5 font-ui text-xs">— 詩編 133:1</span>
      </p>
      <Cross size={14} className="text-[#c8933f] shrink-0" />
    </div>
  );
}
