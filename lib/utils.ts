import dayjs from "dayjs";

export const formatCurrency = (value: number, currency = "USD"): string => {
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return value.toFixed(2);
    }
};

export const formatSubscriptionDateTime = (value?: string): string => {
    if (!value) return "Not provided";
    const parsedDate = dayjs(value);
    return parsedDate.isValid() ? parsedDate.format("MM/DD/YYYY") : "Not provided";
};

export const formatSubscriptionDateLong = (value?: string): string => {
    if (!value) return "Not provided";
    const parsedDate = dayjs(value);
    return parsedDate.isValid() ? parsedDate.format("MMM D, YYYY") : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
    if (!value) return "Unknown";
    return value.charAt(0).toUpperCase() + value.slice(1);
};

export const getBillingCycleProgress = (
    startDate?: string,
    billing?: string,
): number => {
    if (!startDate) return 0;
    const start = dayjs(startDate);
    if (!start.isValid()) return 0;
    const now = dayjs();
    const totalDays = billing === "Yearly" ? 365 : 30;
    const daysSinceStart = now.diff(start, "day") % totalDays;
    return Math.min(Math.max(daysSinceStart / totalDays, 0), 1);
};

export const getMonthsActive = (startDate?: string): number => {
    if (!startDate) return 0;
    const start = dayjs(startDate);
    if (!start.isValid()) return 0;
    return dayjs().diff(start, "month");
};

export const getSmartStatusLabel = (
    status?: string,
    renewalDate?: string,
): { label: string; urgency: "normal" | "warning" | "danger" } => {
    if (status === "cancelled") return { label: "Cancelled", urgency: "danger" };
    if (status === "paused") return { label: "Paused", urgency: "warning" };
    if (!renewalDate) return { label: "Active", urgency: "normal" };

    const renewal = dayjs(renewalDate);
    if (!renewal.isValid()) return { label: "Active", urgency: "normal" };

    const now = dayjs();
    const daysUntil = renewal.diff(now, "day");

    if (daysUntil < 0) return { label: "Overdue", urgency: "danger" };
    if (daysUntil === 0) return { label: "Renews today", urgency: "danger" };
    if (daysUntil <= 3) return { label: `Renews in ${daysUntil}d`, urgency: "danger" };
    if (daysUntil <= 7) return { label: `Renews in ${daysUntil}d`, urgency: "warning" };
    return { label: "Active", urgency: "normal" };
};

export const getDaysUntilRenewal = (renewalDate?: string): number | null => {
    if (!renewalDate) return null;
    const renewal = dayjs(renewalDate);
    if (!renewal.isValid()) return null;
    return renewal.diff(dayjs(), "day");
};