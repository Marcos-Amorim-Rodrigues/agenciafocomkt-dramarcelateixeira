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

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQd8NHg8n3eEhS3MTU22XZKK_0600UPqsLGPeY-d44AsivNYYk2T37SiFUr9DhPTEQ448wjiokQDTKs/pub?gid=0&single=true&output=csv';

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
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    return { from, to };
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error('Failed to fetch data');
        const text = await response.text();
        const parsed = parseCSV(text);
        setRawData(parsed);
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
    return getCampaignTrends(filteredData, dateRange.to);
  }, [filteredData, dateRange.to]);

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
