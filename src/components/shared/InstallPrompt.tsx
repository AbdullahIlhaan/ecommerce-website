import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "pwa-install-dismissed";

export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(DISMISS_KEY) === "true";
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setHidden(dismissed);
    };

    const handleAppInstalled = () => {
      setPromptEvent(null);
      setHidden(true);
      window.localStorage.removeItem(DISMISS_KEY);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const dismiss = () => {
    setHidden(true);
    window.localStorage.setItem(DISMISS_KEY, "true");
  };

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome !== "accepted") {
      setHidden(false);
      return;
    }

    setPromptEvent(null);
    setHidden(true);
  };

  if (!promptEvent || hidden) return null;

  return (
    <div className="safe-x safe-bottom fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="surface-card flex w-full max-w-md items-center gap-3 rounded-[1.5rem] px-4 py-3 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.55)]">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold md:text-base">Install FutureBD</div>
          <div className="text-xs text-muted-foreground md:text-sm">Save the dashboard to your home screen for offline access.</div>
        </div>
        <Button className="shrink-0" size="sm" onClick={install}>Install</Button>
        <Button type="button" variant="ghost" size="icon" className="shrink-0 rounded-full" onClick={dismiss} aria-label="Dismiss install prompt">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
