import { useEffect, useState } from 'react';
import { AlertTriangle, Filter, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/AppLayout';
import { KPICard } from '@/components/KPICard';
import { ScoreBadge } from '@/components/ScoreBadge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '@/lib/format';

const tooltipStyle = { background: 'hsl(222,25%,11%)', border: '1px solid hsl(222,15%,18%)', borderRadius: '6px', color: 'hsl(213,20%,88%)' };

interface FraudFlagRow {
  id: string;
  fraud_type: string | null;
  severity: string | null;
  variance_amount: string | null;
  source_a: string | null;
  source_b: string | null;
  evidence: string | null;
  assessment_id: string;
}

interface AssessmentRow {
  id: string;
  borrower_name: string;
  sector: string | null;
  composite_score: number | null;
  loan_requested: number | null;
  status: string;
}

export default function FraudIntelligence() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<FraudFlagRow[]>([]);
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      const [flagsRes, assessmentsRes] = await Promise.all([
        supabase.from('fraud_flags').select('id, fraud_type, severity, variance_amount, source_a, source_b, evidence, assessment_id').order('created_at', { ascending: false }),
        supabase.from('assessments').select('id, borrower_name, sector, composite_score, loan_requested, status'),
      ]);
      setFlags(flagsRes.data || []);
      setAssessments(assessmentsRes.data || []);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Build lookup
  const assessmentMap = new Map(assessments.map(a => [a.id, a]));

  // Apply filters
  const filteredFlags = flags.filter(f => {
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && f.fraud_type !== typeFilter) return false;
    return true;
  });

  const highFlags = filteredFlags.filter(f => f.severity === 'HIGH');

  // Compute total variance
  const totalVariance = filteredFlags.reduce((sum, f) => {
    const num = parseFloat(f.variance_amount?.replace(/[₹,\sCr]/g, '') || '0');
    return sum + num;
  }, 0);

  // Typology frequency data
  const typologyCounts: Record<string, number> = {};
  filteredFlags.forEach(f => {
    const t = f.fraud_type || 'Unknown';
    typologyCounts[t] = (typologyCounts[t] || 0) + 1;
  });
  const typologyData = Object.entries(typologyCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // Sector risk matrix
  const sectorMap: Record<string, { assessments: Set<string>; flags: number; scores: number[]; highFlags: number }> = {};
  filteredFlags.forEach(f => {
    const a = assessmentMap.get(f.assessment_id);
    const sector = a?.sector || 'Unknown';
    if (!sectorMap[sector]) sectorMap[sector] = { assessments: new Set(), flags: 0, scores: [], highFlags: 0 };
    sectorMap[sector].assessments.add(f.assessment_id);
    sectorMap[sector].flags += 1;
    if (f.severity === 'HIGH') sectorMap[sector].highFlags += 1;
    if (a?.composite_score != null) sectorMap[sector].scores.push(a.composite_score);
  });
  // Also include assessments without flags
  assessments.forEach(a => {
    const sector = a.sector || 'Unknown';
    if (!sectorMap[sector]) sectorMap[sector] = { assessments: new Set(), flags: 0, scores: [], highFlags: 0 };
    sectorMap[sector].assessments.add(a.id);
    if (a.composite_score != null) sectorMap[sector].scores.push(a.composite_score);
  });
  const sectorRows = Object.entries(sectorMap)
    .map(([sector, d]) => ({
      sector,
      assessmentCount: d.assessments.size,
      flagCount: d.flags,
      highCount: d.highFlags,
      avgScore: d.scores.length > 0 ? Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length) : 0,
    }))
    .sort((a, b) => b.flagCount - a.flagCount);

  // Highest-risk borrowers (sorted by composite_score ascending)
  const borrowersWithFlags = assessments
    .map(a => ({
      ...a,
      flagCount: flags.filter(f => f.assessment_id === a.id).length,
      hasHigh: flags.some(f => f.assessment_id === a.id && f.severity === 'HIGH'),
    }))
    .sort((a, b) => (a.composite_score || 0) - (b.composite_score || 0));

  // Unique fraud types for filter
  const uniqueTypes = [...new Set(flags.map(f => f.fraud_type).filter(Boolean))] as string[];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold uppercase tracking-wider">Fraud Intelligence Centre</h1>
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="HIGH">HIGH</SelectItem>
                <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                <SelectItem value="LOW">LOW</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder="Fraud Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard title="Total Flags" value={String(filteredFlags.length)} icon={AlertTriangle} color="red" />
          <KPICard title="HIGH Severity Flags" value={String(highFlags.length)} icon={AlertTriangle} color="red" pulse={highFlags.length > 0} />
          <KPICard title="Total ₹ Variance" value={totalVariance > 0 ? `₹${totalVariance.toFixed(1)} Cr` : '₹0'} icon={AlertTriangle} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Fraud Typology Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              {typologyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={typologyData} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(215,15%,50%)' }} />
                    <YAxis type="category" dataKey="type" width={160} tick={{ fontSize: 10, fill: 'hsl(215,15%,50%)' }} />
                    <RechartsTooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill="hsl(0,72%,51%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-10">No fraud flags detected.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Sector Risk Matrix</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Sector</TableHead>
                    <TableHead className="text-[10px] text-center">Assessments</TableHead>
                    <TableHead className="text-[10px] text-center">Flags</TableHead>
                    <TableHead className="text-[10px] text-center">HIGH</TableHead>
                    <TableHead className="text-[10px] text-center">Avg Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sectorRows.length > 0 ? sectorRows.map(r => (
                    <TableRow key={r.sector}>
                      <TableCell>{r.sector}</TableCell>
                      <TableCell className="text-center">{r.assessmentCount}</TableCell>
                      <TableCell className={`text-center font-bold ${r.flagCount > 0 ? 'text-cam-danger' : 'text-cam-success'}`}>{r.flagCount}</TableCell>
                      <TableCell className="text-center">{r.highCount > 0 ? <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cam-danger text-primary-foreground">{r.highCount}</span> : '—'}</TableCell>
                      <TableCell className="text-center"><ScoreBadge score={r.avgScore} /></TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No data available.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Highest-Risk Borrowers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Borrower</TableHead>
                  <TableHead className="text-[10px]">Sector</TableHead>
                  <TableHead className="text-[10px] text-center">Score</TableHead>
                  <TableHead className="text-[10px] text-center">Flags</TableHead>
                  <TableHead className="text-[10px] text-center">Severity</TableHead>
                  <TableHead className="text-[10px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowersWithFlags.length > 0 ? borrowersWithFlags.map(a => (
                  <TableRow key={a.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => navigate(`/assessment/${a.id}/results`)}>
                    <TableCell className="font-medium">{a.borrower_name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{a.sector || '—'}</TableCell>
                    <TableCell className="text-center"><ScoreBadge score={a.composite_score || 0} /></TableCell>
                    <TableCell className="text-center">{a.flagCount}</TableCell>
                    <TableCell className="text-center">
                      {a.hasHigh
                        ? <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cam-danger text-primary-foreground">HIGH</span>
                        : a.flagCount > 0 ? <span className="text-muted-foreground text-xs">MED/LOW</span> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell><Button variant="ghost" size="sm" className="text-xs">View</Button></TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No assessments found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
