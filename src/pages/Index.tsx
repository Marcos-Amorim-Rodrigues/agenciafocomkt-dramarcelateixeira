import { DollarSign, MessageCircle, Eye, Users, Target, TrendingUp } from 'lucide-react';
import { useCampaignData } from '@/hooks/useCampaignData';
import { formatCurrency, formatNumber } from '@/lib/csvParser';
import { Header } from '@/components/dashboard/Header';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { BigNumberCard } from '@/components/dashboard/BigNumberCard';
import { TrendsTable } from '@/components/dashboard/TrendsTable';
import { TopCreatives } from '@/components/dashboard/TopCreatives';
import { LoadingState, ErrorState } from '@/components/dashboard/LoadingState';

const Index = () => {
  const {
    metrics,
    topCreatives,
    campaignTrends,
    loading,
    error,
    dateRange,
    setDateRange,
    availableDateRange,
  } = useCampaignData();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <Header />

        <main className="p-6 space-y-8">
          {/* Date Filter */}
          <DateFilter
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            availableDateRange={availableDateRange}
          />

          {/* Big Numbers Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <BigNumberCard
              title="Investimento Total"
              value={formatCurrency(metrics.totalSpend)}
              icon={DollarSign}
              variant="primary"
              delay={0}
            />
            <BigNumberCard
              title="Conversões"
              value={formatNumber(metrics.totalConversions)}
              subtitle="Mensagens iniciadas"
              icon={MessageCircle}
              variant="success"
              delay={50}
            />
            <BigNumberCard
              title="CPA Médio"
              value={formatCurrency(metrics.avgCPA)}
              subtitle="Custo por conversão"
              icon={Target}
              variant="warning"
              delay={100}
            />
            <BigNumberCard
              title="Alcance"
              value={formatNumber(metrics.totalReach)}
              subtitle="Pessoas alcançadas"
              icon={Users}
              delay={150}
            />
            <BigNumberCard
              title="Impressões"
              value={formatNumber(metrics.totalImpressions)}
              icon={Eye}
              delay={200}
            />
            <BigNumberCard
              title="Engajamento"
              value={formatNumber(metrics.totalEngagement)}
              icon={TrendingUp}
              delay={250}
            />
          </section>

          {/* Trends Table */}
          <section>
            <TrendsTable trends={campaignTrends} />
          </section>

          {/* Top Creatives */}
          <section>
            <TopCreatives creatives={topCreatives} />
          </section>

          {/* Footer */}
          <footer className="text-center py-8 border-t border-border/30">
            <p className="text-sm text-muted-foreground">
              Dashboard desenvolvido por{' '}
              <span className="text-primary font-semibold">Foco Marketing</span>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Index;
