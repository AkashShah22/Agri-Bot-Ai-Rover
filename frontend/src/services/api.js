const api_base = "http://localhost:5000/api";

export const fetchLatestTelemetry = async () => {
    try {
        const res = await fetch(`${api_base}/telemetry/records`);
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const result = await res.json();
        return result.data || [];
    } catch (error) {
        console.error("Error fetching telemetry:", error);
        return [];
    }
};