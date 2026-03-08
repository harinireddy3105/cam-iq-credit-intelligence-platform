import { AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/AppLayout';
import { KPICard } from '@/components/KPICard';
import { ScoreBadge } from '@/components/ScoreBadge';
import { sampleAssessments } from '@/lib/sample-data';
import { useNavigate } from 'react-router-dom';

const typologyData = [
  { type: 'GSTR-3B Suppression', count: 8 },
  { type: 'ITC Mismatch', count: 6 },
  { type: 'Revenue Inflation', count: 5 },
  { type: 'Circular Trading', count: 3 },
  { type: 'Shell Vendors', count: 2 },
];

const tooltipStyle = { background: 'hsl(222,25%,11%)', border: '1px solid hsl(222,15%,18%)', borderRadius: '6px', color: 'hsl(213,20%,88%)' };

export default function FraudIntelligence() {
  const navigate = useNavigate();
  const allFlags = sampleAssessments.flatMap(a => a.fraud_flags);
  const highFlags = allFlags.filter(f => f.severity === 'HIGH');

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-bold uppercase tracking-wider">Fraud Intelligence Centre</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard title="Total Flags This Month" value={String(allFlags.length)} icon={AlertTriangle} color="red" />
          <KPICard title="HIGH Severity Flags" value={String(highFlags.length)} icon={AlertTriangle} color="red" pulse />
          <KPICard title="Total ₹ Variance" value="₹105.4 Cr" icon={AlertTriangle} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Fraud Typology Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={typologyData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(215,15%,50%)' }} />
                  <YAxis type="category" dataKey="type" width={140} tick={{ fontSize: 10, fill: 'hsl(215,15%,50%)' }} />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="hsl(0,72%,51%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
                    <TableHead className="text-[10px] text-center">Avg Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>Real Estate</TableCell><TableCell className="text-center">1</TableCell><TableCell className="text-center text-cam-danger font-bold">3</TableCell><TableCell className="text-center"><ScoreBadge score={31} /></TableCell></TableRow>
                  <TableRow><TableCell>Steel</TableCell><TableCell className="text-center">1</TableCell><TableCell className="text-center text-cam-danger font-bold">3</TableCell><TableCell className="text-center"><ScoreBadge score={73} /></TableCell></TableRow>
                  <TableRow><TableCell>Textile</TableCell><TableCell className="text-center">1</TableCell><TableCell className="text-center text-cam-success">0</TableCell><TableCell className="text-center"><ScoreBadge score={84} /></TableCell></TableRow>
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
                  <TableHead className="text-[10px] text-center">Score</TableHead>
                  <TableHead className="text-[10px] text-center">Flags</TableHead>
                  <TableHead className="text-[10px] text-center">Severity</TableHead>
                  <TableHead className="text-[10px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...sampleAssessments].sort((a, b) => a.composite_score - b.composite_score).map(a => (
                  <TableRow key={a.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => navigate(`/assessment/${a.id}/results`)}>
                    <TableCell className="font-medium">{a.borrower_name}</TableCell>
                    <TableCell className="text-center"><ScoreBadge score={a.composite_score} /></TableCell>
                    <TableCell className="text-center">{a.fraud_flags.length}</TableCell>
                    <TableCell className="text-center">
                      {a.fraud_flags.some(f => f.severity === 'HIGH')
                        ? <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cam-danger text-primary-foreground">HIGH</span>
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell><Button variant="ghost" size="sm" className="text-xs">View</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
