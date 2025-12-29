"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, SeverityBadge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Alert, AlertSeverity, RedFlag } from "@/types/alert";

// Mock data for demonstration
const mockAlerts: Alert[] = [
  {
    id: "1",
    symbol: "NVDA",
    type: "volume_surge",
    severity: "warning",
    title: "Unusual Volume Spike",
    description:
      "NVDA mentions increased by 340% in the last 2 hours compared to the 24h average.",
    metrics: { before: 1200, after: 5280, changePercent: 340 },
    createdAt: new Date(Date.now() - 3600000),
    expiresAt: new Date(Date.now() + 86400000),
    acknowledged: false,
  },
  {
    id: "2",
    symbol: "TSLA",
    type: "sentiment_spike",
    severity: "info",
    title: "Sentiment Shift Detected",
    description:
      "Bullish sentiment for TSLA increased significantly following positive earnings news.",
    metrics: { before: 23, after: 67, changePercent: 191 },
    createdAt: new Date(Date.now() - 7200000),
    expiresAt: new Date(Date.now() + 86400000),
    acknowledged: false,
  },
];

const mockRedFlags: RedFlag[] = [
  {
    id: "rf1",
    symbol: "SCAM",
    type: "pump_and_dump",
    severity: "critical",
    title: "Potential Pump & Dump Detected",
    description:
      "Coordinated activity detected with 847 similar posts from new accounts in the last hour.",
    evidence: [
      "94% of mentions from accounts < 30 days old",
      "Identical hashtag patterns across posts",
      "No institutional coverage or fundamentals",
    ],
    detectedAt: new Date(Date.now() - 1800000),
    confidence: 0.94,
  },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [redFlags] = useState(mockRedFlags);

  const criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const warningAlerts = alerts.filter((a) => a.severity === "warning");
  const infoAlerts = alerts.filter((a) => a.severity === "info");

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Alerts & Warnings
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Stay informed about unusual activity and red flags
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="critical" size="md">
            {criticalAlerts.length + redFlags.length} critical
          </Badge>
          <Badge variant="warning" size="md">
            {warningAlerts.length} warnings
          </Badge>
        </div>
      </div>

      {/* Red Flags Section */}
      {redFlags.length > 0 && (
        <Card className="border-critical/30">
          <CardHeader>
            <span className="flex items-center gap-2 text-critical">
              <AlertTriangleIcon className="w-5 h-5" />
              Red Flags Detected
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            {redFlags.map((flag) => (
              <RedFlagCard key={flag.id} flag={flag} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Alerts Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="critical">
            Critical ({criticalAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="warnings">
            Warnings ({warningAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="info">
            Info ({infoAlerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <AlertsList
            alerts={alerts}
            onAcknowledge={acknowledgeAlert}
            onDismiss={dismissAlert}
          />
        </TabsContent>

        <TabsContent value="critical">
          <AlertsList
            alerts={criticalAlerts}
            onAcknowledge={acknowledgeAlert}
            onDismiss={dismissAlert}
          />
        </TabsContent>

        <TabsContent value="warnings">
          <AlertsList
            alerts={warningAlerts}
            onAcknowledge={acknowledgeAlert}
            onDismiss={dismissAlert}
          />
        </TabsContent>

        <TabsContent value="info">
          <AlertsList
            alerts={infoAlerts}
            onAcknowledge={acknowledgeAlert}
            onDismiss={dismissAlert}
          />
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {alerts.length === 0 && redFlags.length === 0 && (
        <Card className="p-12 text-center">
          <CheckCircleIcon className="w-16 h-16 text-bullish mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">
            All Clear!
          </h3>
          <p className="text-text-secondary">
            No alerts or red flags detected for your watchlist.
          </p>
        </Card>
      )}
    </div>
  );
}

function AlertsList({
  alerts,
  onAcknowledge,
  onDismiss,
}: {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  if (alerts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-text-secondary">No alerts in this category</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
          onAcknowledge={() => onAcknowledge(alert.id)}
          onDismiss={() => onDismiss(alert.id)}
        />
      ))}
    </div>
  );
}

function AlertCard({
  alert,
  onAcknowledge,
  onDismiss,
}: {
  alert: Alert;
  onAcknowledge: () => void;
  onDismiss: () => void;
}) {
  return (
    <Card
      className={`transition-opacity ${
        alert.acknowledged ? "opacity-60" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <SeverityBadge severity={alert.severity} />
              <span className="font-mono font-semibold text-text-amber">
                ${alert.symbol}
              </span>
              <span className="text-xs text-text-tertiary">
                {formatTimeAgo(alert.createdAt)}
              </span>
            </div>
            <h3 className="font-semibold text-text-primary mb-1">
              {alert.title}
            </h3>
            <p className="text-sm text-text-secondary">{alert.description}</p>
            {alert.metrics && (
              <div className="mt-2 flex items-center gap-4 text-xs">
                <span className="text-text-tertiary">
                  Before: {alert.metrics.before}
                </span>
                <span className="text-text-tertiary">
                  After: {alert.metrics.after}
                </span>
                <span
                  className={
                    alert.metrics.changePercent > 0
                      ? "text-bullish"
                      : "text-bearish"
                  }
                >
                  {alert.metrics.changePercent > 0 ? "+" : ""}
                  {alert.metrics.changePercent}%
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!alert.acknowledged && (
              <Button variant="secondary" size="sm" onClick={onAcknowledge}>
                Acknowledge
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Dismiss
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RedFlagCard({ flag }: { flag: RedFlag }) {
  return (
    <Card className="bg-critical/5 border-critical/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-critical/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangleIcon className="w-5 h-5 text-critical" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono font-semibold text-text-amber">
                ${flag.symbol}
              </span>
              <Badge variant="critical" size="sm">
                {Math.round(flag.confidence * 100)}% confidence
              </Badge>
            </div>
            <h3 className="font-semibold text-text-primary mb-1">
              {flag.title}
            </h3>
            <p className="text-sm text-text-secondary mb-3">
              {flag.description}
            </p>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Evidence:
              </p>
              <ul className="text-xs text-text-secondary space-y-1">
                {flag.evidence.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-critical">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 60) return `${diffMins}m ago`;
  return `${diffHours}h ago`;
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
