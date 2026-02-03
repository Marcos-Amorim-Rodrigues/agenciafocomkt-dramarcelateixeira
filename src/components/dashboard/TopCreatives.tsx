import { Trophy, MessageCircle, Eye, DollarSign } from 'lucide-react';
import { AdPerformance, formatCurrency, formatNumber } from '@/lib/csvParser';
import { cn } from '@/lib/utils';

interface TopCreativesProps {
  creatives: AdPerformance[];
}

function CreativeCard({ creative, rank }: { creative: AdPerformance; rank: number }) {
  const rankColors = {
    1: 'border-primary ring-2 ring-primary/20',
    2: 'border-dashboard-info/50',
    3: 'border-dashboard-success/50',
  };

  return (
    <div
      className={cn(
        "glass-card rounded-xl overflow-hidden animate-fade-in hover:scale-[1.02] transition-transform",
        rankColors[rank as keyof typeof rankColors] || 'border-border/50'
      )}
      style={{ animationDelay: `${500 + rank * 100}ms` }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-secondary/50 overflow-hidden">
        {creative.thumbnailUrl ? (
          <img
            src={creative.thumbnailUrl}
            alt={creative.adName}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Eye className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}

        {/* Rank Badge */}
        <div className={cn(
          "absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
          rank === 1
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary/90 text-foreground'
        )}>
          {rank === 1 ? <Trophy className="h-4 w-4" /> : `#${rank}`}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground truncate mb-1" title={creative.campaignName}>
          {creative.campaignName.replace(/\[/g, '').replace(/\]/g, ' ').trim().slice(0, 40)}
        </p>
        <h4 className="font-semibold text-sm line-clamp-2 mb-4 min-h-[2.5rem]" title={creative.adName}>
          {creative.adName.replace(/\[/g, '').replace(/\]/g, ' ').trim()}
        </h4>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Conversões</p>
              <p className="font-semibold text-sm">{formatNumber(creative.conversions)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-dashboard-success" />
            <div>
              <p className="text-xs text-muted-foreground">CPA</p>
              <p className="font-semibold text-sm">
                {creative.costPerConversion > 0 ? formatCurrency(creative.costPerConversion) : '-'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-dashboard-info" />
            <div>
              <p className="text-xs text-muted-foreground">Impressões</p>
              <p className="font-semibold text-sm">{formatNumber(creative.impressions)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-dashboard-warning" />
            <div>
              <p className="text-xs text-muted-foreground">Investido</p>
              <p className="font-semibold text-sm">{formatCurrency(creative.spend)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TopCreatives({ creatives }: TopCreativesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Criativos Campeões
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Melhores anúncios por número de conversões no período
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {creatives.map((creative, index) => (
          <CreativeCard
            key={creative.adName}
            creative={creative}
            rank={index + 1}
          />
        ))}
      </div>

      {creatives.length === 0 && (
        <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
          Nenhum criativo com conversões encontrado no período selecionado
        </div>
      )}
    </div>
  );
}
