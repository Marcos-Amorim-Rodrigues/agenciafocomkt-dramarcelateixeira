import { useState, useEffect, useMemo } from 'react';
import {
  parseCSV,
  CampaignData,
  filterByDateRange,
  aggregateMetrics,
  getTopCreatives,
  getCampaignTrends,
  AdPerformance,
  CampaignTrend
} from '@/lib/csvParser';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMgxkBl-N7ZDzlVucK-ho6WnqFjE7z2rY6QS7kZYde61EwlTkMdI6WGc0x7KSDjCEHDfUXnojqmfOb/pub?output=csv';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DashboardMetrics {
  totalSpend: number;
  totalConversions: number;
  totalReach: number;
  totalImpressions: number;
  totalEngagement: number;
  avgCPA: number;
  ctr: number;
}

export function useCampaignData() {
  const [rawData, setRawData] = useState<CampaignData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error('Failed to fetch data');
        const text = await response.text();
        const parsed = parseCSV(text);
        setRawData(parsed);
        
        // Set initial date range based on data
        if (parsed.length > 0) {
          const dates = parsed
            .map(d => new Date(d.date))
            .filter(d => !isNaN(d.getTime()))
            .sort((a, b) => a.getTime() - b.getTime());
          
          if (dates.length > 0) {
            const maxDate = dates[dates.length - 1];
            const from = new Date(maxDate);
            from.setDate(maxDate.getDate() - 29); // Last 30 days
            from.setHours(0, 0, 0, 0);
            
            const to = new Date(maxDate);
            to.setHours(23, 59, 59, 999);
            
            setDateRange({ from, to });
          }
        }
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!dateRange) return [];
    return filterByDateRange(rawData, dateRange.from, dateRange.to);
  }, [rawData, dateRange]);

  const metrics: DashboardMetrics = useMemo(() => {
    const agg = aggregateMetrics(filteredData);
    const avgCPA = agg.totalConversions > 0 ? agg.totalSpend / agg.totalConversions : 0;
    const ctr = agg.totalImpressions > 0 ? (agg.totalEngagement / agg.totalImpressions) * 100 : 0;

    return {
      ...agg,
      avgCPA,
      ctr,
    };
  }, [filteredData]);

  const topCreatives: AdPerformance[] = useMemo(() => {
    return getTopCreatives(filteredData, 6);
  }, [filteredData]);

  const campaignTrends: CampaignTrend[] = useMemo(() => {
    if (!dateRange) return [];
    return getCampaignTrends(filteredData, dateRange.to);
  }, [filteredData, dateRange]);

  const availableDateRange = useMemo(() => {
    if (rawData.length === 0) return null;

    const dates = rawData
      .map(d => new Date(d.date))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    return {
      min: dates[0],
      max: dates[dates.length - 1],
    };
  }, [rawData]);

  return {
    rawData,
    filteredData,
    metrics,
    topCreatives,
    campaignTrends,
    loading,
    error,
    dateRange,
    setDateRange,
    availableDateRange,
  };
}
