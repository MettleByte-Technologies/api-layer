import { useState } from "react";
import GoogleIntegration from "@/components/GoogleIntegration";
import { Calendar, Mail, BarChart3 } from "lucide-react";

type Integration = "google" | "outlook" | "hubspot";

const integrations: { id: Integration; name: string; icon: typeof Calendar; colorClass: string; ready: boolean }[] = [
  { id: "google", name: "Google", icon: Calendar, colorClass: "bg-google text-google-foreground", ready: true },
  { id: "outlook", name: "Outlook", icon: Mail, colorClass: "bg-outlook text-outlook-foreground", ready: false },
  { id: "hubspot", name: "HubSpot", icon: BarChart3, colorClass: "bg-hubspot text-hubspot-foreground", ready: false },
];

const Index = () => {
  const [active, setActive] = useState<Integration>("google");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
          <p className="mt-1 text-sm text-muted-foreground">Connect your accounts to get started</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {integrations.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => item.ready && setActive(item.id)}
                disabled={!item.ready}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? `${item.colorClass} shadow-sm`
                    : item.ready
                    ? "bg-secondary text-secondary-foreground hover:bg-accent"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
                {!item.ready && (
                  <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          {active === "google" && <GoogleIntegration />}
          {active === "outlook" && (
            <p className="text-center text-muted-foreground py-12">Outlook integration coming soon.</p>
          )}
          {active === "hubspot" && (
            <p className="text-center text-muted-foreground py-12">HubSpot integration coming soon.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
