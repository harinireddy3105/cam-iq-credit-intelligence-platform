import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, AlertTriangle, TrendingDown, Clock, Plus, Loader2, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AppLayout } from '@/components/AppLayout';
import { KPICard } from '@/components/KPICard';
import { StatusBadge } from '@/components/StatusBadge';
import { ScoreBadge } from '@/components/ScoreBadge';
import { formatINR } from '@/lib/format';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const PIE_COLORS = ['hsl(18,100%,60%)', 'hsl(340,82%,52%)', 'hsl(45,100%,51%)', 'hsl(187,100%,42%)', 'hsl(122,39%,49%)'];
const tooltipStyle = { background: 'hsl(0,0%,10%)', border: '1px solid hsl(0,0%,18%)', borderRadius: '8px', color: 'hsl(0,0%,100%)', boxShadow: '0 8px 32px -8px hsl(0,0%,0%,0.6)' };

interface DashboardAssessment {
  id: string;
  borrower_name: string;
  cin: string | null;
  sector: string | null;
  loan_requested: number | null;
  composite_score: number | null;
  status: string;
  created_at: string;
}

interface FraudAlert {
  id: string;
  fraud_type: string | null;
  severity: string | null;
  assessment_id: string;
  borrower_name?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<DashboardAssessment[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [flagCounts, setFlagCounts] = useState<Record<string, number>>({});
  const [totalFlags, setTotalFlags] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      setLoading(true);

      const [assessmentsRes, flagsRes] = await Promise.all([
        supabase
          .from('assessments')
          .select('id, borrower_name, cin, sector, loan_requested, composite_score, status, created_at')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('fraud_flags')
          .select('id, fraud_type, severity, assessment_id')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      const assessmentData = assessmentsRes.data || [];
      const flagsData = flagsRes.data || [];

      setAssessments(assessmentData);
      setTotalFlags(flagsData.length);

      const assessmentMap = new Map(assessmentData.map(a => [a.id, a.borrower_name]));
      const enrichedAlerts = flagsData.map(f => ({
        ...f,
        borrower_name: assessmentMap.get(f.assessment_id) || 'Unknown',
      }));
      setFraudAlerts(enrichedAlerts);

      const typeCounts: Record<string, number> = {};
      flagsData.forEach(f => {
        const type = f.fraud_type || 'Other';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      setFlagCounts(typeCounts);

      setLoading(false);
    };

    fetchDashboard();
  }, [user]);

  const fraudTypesData = Object.entries(flagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const totalLoanRequested = assessments.reduce((sum, a) => sum + (a.loan_requested || 0), 0);

  const weeklyData = (() => {
    const weeks: Record<string, number> = {};
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      weeks[`W${8 - i}`] = 0;
    }
    assessments.forEach(a => {
      const created = new Date(a.created_at);
      const weeksAgo = Math.floor((now.getTime() - created.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const weekKey = `W${Math.max(1, 8 - weeksAgo)}`;
      if (weeks[weekKey] !== undefined) weeks[weekKey]++;
    });
    return Object.entries(weeks).map(([week, cams]) => ({ week, cams }));
  })();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64 gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg" />
            <Loader2 className="h-8 w-8 animate-spin text-primary relative" />
          </div>
          <span className="text-muted-foreground text-sm font-medium">Loading dashboard...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Command Center</h1>
            <p className="text-sm text-muted-foreground mt-0.5 font-normal">Real-time credit intelligence overview</p>
          </div>
          <Button onClick={() => navigate('/assessment/new')} className="gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold">
            <Plus className="h-4 w-4" /> New Assessment
          </Button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="CAMs This Month" value={String(assessments.length)} icon={FileText} color="orange" />
          <KPICard title="Active Fraud Flags" value={String(totalFlags)} icon={AlertTriangle} color="red" pulse={totalFlags > 0} />
          <KPICard title="Total Exposure" value={totalLoanRequested > 0 ? formatINR(totalLoanRequested) : '₹0'} icon={TrendingDown} color="green" />
          <KPICard title="Assessments" value={String(assessments.length)} icon={Clock} color="teal" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <Card className="lg:col-span-7 border-border/30">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Recent Assessments</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1 hover:bg-primary/10 font-semibold" onClick={() => navigate('/register')}>
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {assessments.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">No assessments yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Click "New Assessment" to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Borrower</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Sector</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 text-right">Loan</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 text-center">Score</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Status</TableHead>
                        <TableHead className="text-[10px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessments.map((a, idx) => (
                        <TableRow
                          key={a.id}
                          className={`cursor-pointer transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary hover:bg-primary/5 ${idx % 2 === 1 ? 'bg-secondary/15' : ''}`}
                          onClick={() => navigate(`/assessment/${a.id}/results`)}
                        >
                          <TableCell className="font-semibold text-sm py-3">{a.borrower_name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {a.sector ? (
                              <span className="inline-flex items-center rounded-full bg-secondary/60 px-2.5 py-0.5 text-[10px] font-medium">{a.sector}</span>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">{a.loan_requested ? formatINR(a.loan_requested) : '—'}</TableCell>
                          <TableCell className="text-center"><ScoreBadge score={a.composite_score || 0} /></TableCell>
                          <TableCell><StatusBadge status={a.status as any} /></TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="text-[11px] h-7 px-2.5 text-primary hover:bg-primary/10 font-semibold">View</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-4">
            <Card className="border-border/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-destructive animate-live-pulse" />
                  Live Fraud Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                {fraudAlerts.length === 0 && (
                  <div className="py-6 text-center">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground/60 font-medium">No fraud alerts detected</p>
                  </div>
                )}
                {fraudAlerts.slice(0, 5).map((f) => (
                  <div key={f.id} className="flex items-start gap-2.5 text-xs border-b border-border/20 pb-3 last:border-0 last:pb-0 group hover:bg-secondary/30 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-live-pulse mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{f.borrower_name}</p>
                      <p className="text-muted-foreground/70">{f.fraud_type}</p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${f.severity === 'HIGH' ? 'bg-destructive/15 text-destructive' : 'bg-cam-warning/15 text-cam-warning'}`}>
                      {f.severity}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Fraud Typology</CardTitle>
              </CardHeader>
              <CardContent>
                {fraudTypesData.length === 0 ? (
                  <p className="text-xs text-muted-foreground/50 text-center py-8 font-medium">No fraud data yet</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={fraudTypesData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} strokeWidth={0}>
                          {fraudTypesData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 mt-3">
                      {fraudTypesData.map((f, i) => (
                        <div key={f.name} className="flex items-center justify-between text-[11px] py-0.5">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span className="text-muted-foreground">{f.name}</span>
                          </div>
                          <span className="font-mono font-semibold">{f.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">CAMs Processed — Recent Weeks</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData}>
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(0,0%,63%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(0,0%,63%)' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(0,0%,14%,0.5)' }} />
                  <Bar dataKey="cams" fill="hsl(18,100%,60%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {assessments.length === 0 ? (
                <p className="text-xs text-muted-foreground/50 text-center py-16 font-medium">No score data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={assessments.filter(a => a.composite_score).map(a => ({ name: a.borrower_name.split(' ')[0], score: a.composite_score }))}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(0,0%,63%)' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(0,0%,63%)' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(0,0%,14%,0.5)' }} />
                    <Bar dataKey="score" fill="hsl(45,100%,51%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
