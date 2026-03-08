import { Fragment, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Share2 } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AppLayout } from '@/components/AppLayout';
import { sampleAssessments } from '@/lib/sample-data';
import { formatINR, getScoreColor, getScoreBarColor } from '@/lib/format';
import { cn } from '@/lib/utils';

const FIVE_CS = ['character', 'capacity', 'capital', 'collateral', 'conditions'] as const;
const FIVE_CS_WEIGHTS: Record<string, number> = { character: 25, capacity: 30, capital: 20, collateral: 15, conditions: 10 };
const sentimentDot: Record<string, string> = {
  positive: 'bg-cam-success', neutral: 'bg-muted-foreground', negative: 'bg-cam-warning', critical: 'bg-cam-danger',
};

export default function AssessmentResults() {
  const { id } = useParams();
  const assessment = sampleAssessments.find(a => a.id === id);
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null);
  const [barsAnimated, setBarsAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBarsAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!assessment) {
    return <AppLayout><div className="flex items-center justify-center h-64 text-muted-foreground">Assessment not found. Please select a valid assessment from the register.</div></AppLayout>;
  }

  const a = assessment;
  const statusBg = a.status === 'approved' ? 'bg-cam-success' : a.status === 'conditional' ? 'bg-cam-warning' : 'bg-cam-danger';
  const statusIcon = a.status === 'approved' ? '✓' : a.status === 'conditional' ? '⚠' : '✗';
  const statusText = a.status === 'approved' ? 'LOAN APPROVED' : a.status === 'conditional' ? 'CONDITIONAL APPROVAL — Subject to Covenants' : 'LOAN REJECTED — High Risk Profile Detected';

  const cibilFinding = a.research_findings.find(f => f.source === 'CIBIL');
  const cibilScoreMatch = cibilFinding?.finding.match(/(\d{3})/);
  const cibilScore = cibilScoreMatch ? parseInt(cibilScoreMatch[1]) : 650;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Status Banner */}
        <div className={cn('rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4', statusBg)}>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">{statusIcon} {statusText}</h1>
            <p className="text-sm text-primary-foreground/80">{a.borrower_name} · {a.cin}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="gap-1"><Download className="h-4 w-4" /> Download CAM PDF</Button>
            <Button variant="secondary" size="sm" className="gap-1"><Share2 className="h-4 w-4" /> Share</Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Recommended Limit</p><p className="text-2xl font-bold font-mono text-cam-processing">{a.loan_recommended > 0 ? formatINR(a.loan_recommended) : 'N/A'}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Interest Rate</p><p className="text-2xl font-bold font-mono text-cam-gold">{a.interest_rate ? `${a.interest_rate}%` : 'N/A'}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Tenure</p><p className="text-2xl font-bold font-mono">{a.tenure_months ? `${a.tenure_months} Months` : 'N/A'}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Composite Score</p><p className={cn('text-2xl font-bold font-mono', getScoreColor(a.composite_score))}>{a.composite_score}/100</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* Fraud Flags */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className={cn('text-xs uppercase tracking-widest', a.fraud_flags.length > 0 ? 'text-cam-danger' : 'text-cam-success')}>
                  {a.fraud_flags.length > 0 ? `⚠ TRIANGULATION FLAGS (${a.fraud_flags.length} DETECTED)` : '✓ NO FRAUD SIGNALS DETECTED'}
                </CardTitle>
              </CardHeader>
              {a.fraud_flags.length > 0 && (
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[10px]">Fraud Type</TableHead>
                          <TableHead className="text-[10px]">Source A</TableHead>
                          <TableHead className="text-[10px]">Source B</TableHead>
                          <TableHead className="text-[10px] text-right">₹ Variance</TableHead>
                          <TableHead className="text-[10px] text-center">Severity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {a.fraud_flags.map((f) => (
                          <Fragment key={f.id}>
                            <TableRow className="cursor-pointer hover:bg-secondary/50" onClick={() => setExpandedFlag(expandedFlag === f.id ? null : f.id)}>
                              <TableCell className="text-sm font-medium">{f.fraud_type}</TableCell>
                              <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">{f.source_a}</TableCell>
                              <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">{f.source_b}</TableCell>
                              <TableCell className="text-right font-mono text-sm text-cam-danger">{f.variance_amount}</TableCell>
                              <TableCell className="text-center">
                                <span className={cn('inline-block px-2 py-0.5 rounded text-[10px] font-bold', f.severity === 'HIGH' ? 'bg-cam-danger text-primary-foreground animate-fraud-pulse' : 'border border-cam-warning text-cam-warning')}>{f.severity}</span>
                              </TableCell>
                            </TableRow>
                            {expandedFlag === f.id && (
                              <TableRow>
                                <TableCell colSpan={5} className="bg-secondary/30 text-sm italic text-muted-foreground py-4">{f.evidence}</TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Five-Cs */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-widest text-cam-gold border-b border-cam-gold/30 pb-2">Five-Cs Scoring Model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {FIVE_CS.map((c) => {
                  const score = a[`${c}_score` as keyof typeof a] as number;
                  return (
                    <div key={c} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">{c}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-muted-foreground">{FIVE_CS_WEIGHTS[c]}%</span>
                          <span className={cn('font-mono font-bold', getScoreColor(score))}>{score}/100</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-[1500ms] ease-in-out"
                          style={{ width: barsAnimated ? `${score}%` : '0%', backgroundColor: getScoreBarColor(score) }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-widest text-cam-processing">Research Agent Findings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {a.research_findings.map((f) => (
                  <div key={f.id} className="p-3 rounded-lg bg-secondary/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary text-muted-foreground">{f.source}</span>
                      <span className={cn('h-2.5 w-2.5 rounded-full', sentimentDot[f.sentiment])} title={f.sentiment} />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.finding}</p>
                  </div>
                ))}
                <div className="flex flex-col items-center pt-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">CIBIL Commercial Score</p>
                  <ResponsiveContainer width={160} height={90}>
                    <RadialBarChart cx="50%" cy="100%" innerRadius={55} outerRadius={75} startAngle={180} endAngle={0} data={[{ value: cibilScore, fill: cibilScore > 700 ? 'hsl(160,84%,39%)' : cibilScore > 500 ? 'hsl(32,95%,44%)' : 'hsl(0,72%,51%)' }]}>
                      <RadialBar background dataKey="value" cornerRadius={4} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <p className={cn('text-xl font-bold font-mono -mt-2', cibilScore > 700 ? 'text-cam-success' : cibilScore > 500 ? 'text-cam-warning' : 'text-cam-danger')}>{cibilScore}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-widest text-cam-gold border-b border-cam-gold/30 pb-2">Recommendation Rationale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm italic text-muted-foreground leading-relaxed">{a.recommendation_rationale}</p>
                {a.covenants.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Covenants</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      {a.covenants.map((c, i) => <li key={i}>{c}</li>)}
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
