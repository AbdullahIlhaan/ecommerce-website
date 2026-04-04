import { cn } from "@/lib/utils";
import { useLocalization, type SupportedLocale } from "@/hooks/use-localization";

type LanguageToggleProps = {
  className?: string;
};

const options: Array<{
  code: SupportedLocale;
  label: string;
  flagUrl: string;
  flagAlt: string;
}> = [
  {
    code: "en",
    label: "English",
    flagUrl: "https://flagcdn.com/w40/gb.png",
    flagAlt: "British flag",
  },
  {
    code: "bn",
    label: "বাংলা",
    flagUrl: "https://flagcdn.com/w40/bd.png",
    flagAlt: "Bangladesh flag",
  },
];

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { locale, setLocale } = useLocalization();

  return (
    <div className={cn("flex items-center", className)}>
      <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
        {options.map((option) => {
          const active = locale === option.code;

          return (
            <button
              key={option.code}
              type="button"
              onClick={() => setLocale(option.code)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <img
                src={option.flagUrl}
                alt={option.flagAlt}
                className="h-3.5 w-[22px] rounded-[3px] object-cover"
              />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
