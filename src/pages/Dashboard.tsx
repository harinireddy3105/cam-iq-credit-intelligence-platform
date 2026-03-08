import { useNavigate } from 'react-router-dom';
import { FileText, AlertTriangle, TrendingDown, Clock, Plus } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AppLayout } from '@/components/AppLayout';
import { KPICard } from '@/components/KPICard';
import { StatusBadge } from '@/components/StatusBadge';
import { ScoreBadge } from '@/components/ScoreBadge';
import { sampleAssessments } from '@/lib/sample-data';
import { formatINR } from '@/lib/format';

const weeklyData = [
  { week: 'W1', cams: 12 }, { week: 'W2', cams: 18 }, { week: 'W3', cams: 15 },
  { week: 'W4', cams: 22 }, { week: 'W5', cams: 19 }, { week: 'W6', cams: 25 },
  { week: 'W7', cams: 21 }, { week: 'W8', cams: 28 },
];
const scoreData = [
  { week: 'W1', score: 65 }, { week: 'W2', score: 68 }, { week: 'W3', score: 62 },
  { week: 'W4', score: 71 }, { week: 'W5', score: 69 }, { week: 'W6', score: 74 },
  { week: 'W7', score: 72 }, { week: 'W8', score: 76 },
];
const fraudTypes = [
  { name: 'GSTR-3B Suppression', value: 8 },
  { name: 'ITC Mismatch', value: 6 },
  { name: 'Revenue Inflation', value: 5 },
  { name: 'Circular Trading', value: 3 },
  { name: 'Shell Vendors', value: 2 },
];
const PIE_COLORS = ['hsl(0,72%,51%)', 'hsl(32,95%,44%)', 'hsl(187,92%,37%)', 'hsl(270,50%,55%)', 'hsl(160,84%,39%)'];

const tooltipStyle = { background: 'hsl(222,25%,11%)', border: '1px solid hsl(222,15%,18%)', borderRadius: '6px', color: 'hsl(213,20%,88%)' };

export default function Dashboard() {
  const navigate = useNavigate();
  const allFlags = sampleAssessments.flatMap(a =>
    a.fraud_flags.map(f => ({ ...f, borrower: a.borrower_name }))
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="CAMs This Month" value="28" icon={FileText} color="teal" />
          <KPICard title="Active Fraud Flags" value="7" icon={AlertTriangle} color="red" pulse />
          <KPICard title="Est. NPA Prevention" value="₹842 Cr" icon={TrendingDown} color="green" />
          <KPICard title="Avg Processing Time" value="1h 47m" icon={Clock} color="teal" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <Card className="lg:col-span-7">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Recent Assessments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px]">Ref No</TableHead>
                      <TableHead className="text-[10px]">Borrower</TableHead>
                      <TableHead className="text-[10px]">Sector</TableHead>
                      <TableHead className="text-[10px] text-right">Loan</TableHead>
                      <TableHead className="text-[10px] text-center">Score</TableHead>
                      <TableHead className="text-[10px] text-center">Flags</TableHead>
                      <TableHead className="text-[10px]">Status</TableHead>
                      <TableHead className="text-[10px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleAssessments.map((a) => (
                      <TableRow key={a.id} className="cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => navigate(`/assessment/${a.id}/results`)}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{a.ref_no}</TableCell>
                        <TableCell className="font-medium text-sm">{a.borrower_name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{a.sector}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{formatINR(a.loan_requested)}</TableCell>
                        <TableCell className="text-center"><ScoreBadge score={a.composite_score} /></TableCell>
                        <TableCell className="text-center">
                          {a.fraud_flags.length > 0
                            ? <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-cam-danger text-primary-foreground text-[10px] font-bold">{a.fraud_flags.length}</span>
                            : <span className="text-cam-success">—</span>}
                        </TableCell>
                        <TableCell><StatusBadge status={a.status} /></TableCell>
                        <TableCell><Button variant="ghost" size="sm" className="text-xs">View CAM</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cam-danger animate-live-pulse" />
                  Live Fraud Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                {allFlags.slice(0, 5).map((f) => (
                  <div key={f.id} className="flex items-start gap-2 text-xs border-b border-border pb-2 last:border-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-cam-danger animate-live-pulse mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{f.borrower}</p>
                      <p className="text-muted-foreground">{f.fraud_type}</p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${f.severity === 'HIGH' ? 'bg-cam-danger text-primary-foreground' : 'bg-cam-warning text-primary-foreground'}`}>{f.severity}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Fraud Typology</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={fraudTypes} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                      {fraudTypes.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {fraudTypes.map((f, i) => (
                    <div key={f.name} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: PIE_COLORS[i] }} />
                        <span className="text-muted-foreground">{f.name}</span>
                      </div>
                      <span className="font-mono">{f.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">CAMs Processed — Last 8 Weeks</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData}>
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(215,15%,50%)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(215,15%,50%)' }} />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="cams" fill="hsl(187,92%,37%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Avg Composite Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={scoreData}>
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(215,15%,50%)' }} />
                  <YAxis domain={[50, 85]} tick={{ fontSize: 11, fill: 'hsl(215,15%,50%)' }} />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="score" stroke="hsl(42,80%,55%)" strokeWidth={2} dot={{ fill: 'hsl(42,80%,55%)', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      <Button onClick={() => navigate('/assessment/new')} className="fixed bottom-6 right-6 shadow-lg gap-2 z-50" size="lg">
        <Plus className="h-5 w-5" /> New CAM Assessment
      </Button>
    </AppLayout>
  );
}
