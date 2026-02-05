export interface CampaignData {
  accountName: string;
  date: string;
  campaignName: string;
  adName: string;
  spend: number;
  conversions: number;
  costPerConversion: number;
  reach: number;
  impressions: number;
  thumbnailUrl: string;
  engagement: number;
}

export function parseNumber(value: string): number {
  if (!value || value === '') return 0;
  // Handle comma as decimal separator
  const cleaned = value.replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

export function parseCSV(csvText: string): CampaignData[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  const data: CampaignData[] = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);

    if (fields.length >= 11) {
      const entry: CampaignData = {
        accountName: fields[0] || '',
        date: fields[1] || '',
        campaignName: fields[2] || '',
        adName: fields[3] || '',
        spend: parseNumber(fields[4]),
        conversions: parseNumber(fields[5]),
        costPerConversion: parseNumber(fields[6]),
        reach: parseNumber(fields[7]),
        impressions: parseNumber(fields[8]),
        thumbnailUrl: fields[9] || '',
        engagement: parseNumber(fields[10]),
      };

      // Only include rows with actual campaign data
      if (entry.campaignName || entry.spend > 0 || entry.impressions > 0) {
        data.push(entry);
      }
    }
  }

  return data;
}

export function filterByDateRange(data: CampaignData[], startDate: Date, endDate: Date): CampaignData[] {
  // Normalize dates to start/end of day for accurate comparison
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  return data.filter(item => {
    const itemDate = new Date(item.date);
    itemDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
    return itemDate >= start && itemDate <= end;
  });
}

export function getLastNDays(data: CampaignData[], days: number): CampaignData[] {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  return filterByDateRange(data, startDate, endDate);
}

export function aggregateMetrics(data: CampaignData[]) {
  return data.reduce(
    (acc, item) => ({
      totalSpend: acc.totalSpend + item.spend,
      totalConversions: acc.totalConversions + item.conversions,
      totalReach: acc.totalReach + item.reach,
      totalImpressions: acc.totalImpressions + item.impressions,
      totalEngagement: acc.totalEngagement + item.engagement,
    }),
    { totalSpend: 0, totalConversions: 0, totalReach: 0, totalImpressions: 0, totalEngagement: 0 }
  );
}

export interface AdPerformance {
  adName: string;
  campaignName: string;
  thumbnailUrl: string;
  spend: number;
  conversions: number;
  costPerConversion: number;
  impressions: number;
  reach: number;
  engagement: number;
}

export function getTopCreatives(data: CampaignData[], limit: number = 6): AdPerformance[] {
  const adMap = new Map<string, AdPerformance>();

  data.forEach(item => {
    if (!item.adName || !item.thumbnailUrl) return;

    const existing = adMap.get(item.adName);
    if (existing) {
      existing.spend += item.spend;
      existing.conversions += item.conversions;
      existing.impressions += item.impressions;
      existing.reach += item.reach;
      existing.engagement += item.engagement;
    } else {
      adMap.set(item.adName, {
        adName: item.adName,
        campaignName: item.campaignName,
        thumbnailUrl: item.thumbnailUrl,
        spend: item.spend,
        conversions: item.conversions,
        costPerConversion: 0,
        impressions: item.impressions,
        reach: item.reach,
        engagement: item.engagement,
      });
    }
  });

  const ads = Array.from(adMap.values());

  // Calculate cost per conversion
  ads.forEach(ad => {
    ad.costPerConversion = ad.conversions > 0 ? ad.spend / ad.conversions : 0;
  });

  // Sort by conversions (best performers first)
  return ads
    .filter(ad => ad.conversions > 0)
    .sort((a, b) => b.conversions - a.conversions)
    .slice(0, limit);
}

export interface CampaignTrend {
  campaignName: string;
  cost7d: number;
  cost14d: number;
  cost30d: number;
  conversions7d: number;
  conversions14d: number;
  conversions30d: number;
  cpa7d: number;
  cpa14d: number;
  cpa30d: number;
}

export function getCampaignTrends(data: CampaignData[], referenceDate?: Date): CampaignTrend[] {
  const endDate = referenceDate || new Date();

  const getDataForDays = (days: number) => {
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - days);
    return filterByDateRange(data, startDate, endDate);
  };

  const data7d = getDataForDays(7);
  const data14d = getDataForDays(14);
  const data30d = getDataForDays(30);

  const campaigns = new Set<string>();
  data.forEach(item => {
    if (item.campaignName) campaigns.add(item.campaignName);
  });

  const trends: CampaignTrend[] = [];

  campaigns.forEach(campaignName => {
    const filter7d = data7d.filter(d => d.campaignName === campaignName);
    const filter14d = data14d.filter(d => d.campaignName === campaignName);
    const filter30d = data30d.filter(d => d.campaignName === campaignName);

    const agg7d = aggregateMetrics(filter7d);
    const agg14d = aggregateMetrics(filter14d);
    const agg30d = aggregateMetrics(filter30d);

    if (agg30d.totalSpend > 0 || agg14d.totalSpend > 0 || agg7d.totalSpend > 0) {
      trends.push({
        campaignName,
        cost7d: agg7d.totalSpend,
        cost14d: agg14d.totalSpend,
        cost30d: agg30d.totalSpend,
        conversions7d: agg7d.totalConversions,
        conversions14d: agg14d.totalConversions,
        conversions30d: agg30d.totalConversions,
        cpa7d: agg7d.totalConversions > 0 ? agg7d.totalSpend / agg7d.totalConversions : 0,
        cpa14d: agg14d.totalConversions > 0 ? agg14d.totalSpend / agg14d.totalConversions : 0,
        cpa30d: agg30d.totalConversions > 0 ? agg30d.totalSpend / agg30d.totalConversions : 0,
      });
    }
  });

  return trends.sort((a, b) => b.cost30d - a.cost30d);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(Math.round(value));
}
