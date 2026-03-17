import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { ScoreBadge } from '@/components/ScoreBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import type { AssessmentStatus } from '@/lib/types';

type SortField = 'borrower_name' | 'composite_score' | 'loan_requested' | 'created_at' | 'status';
type SortDir = 'asc' | 'desc';

export default function Register() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const { data: assessments, isLoading } = useQuery({
    queryKey: ['register-assessments'],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from('assessments')
        .select('id, borrower_name, cin, sector, loan_requested, composite_score, status, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // fetch fraud flag counts per assessment
      const ids = rows.map(r => r.id);
      const { data: flags } = await supabase
        .from('fraud_flags')
        .select('assessment_id')
        .in('assessment_id', ids);

      const flagCounts: Record<string, number> = {};
      flags?.forEach(f => { flagCounts[f.assessment_id] = (flagCounts[f.assessment_id] || 0) + 1; });

      return rows.map(r => ({ ...r, flag_count: flagCounts[r.id] || 0 }));
    },
  });

  const filtered = useMemo(() => {
    if (!assessments) return [];
    let list = assessments;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.borrower_name.toLowerCase().includes(q) ||
        (a.cin && a.cin.toLowerCase().includes(q)) ||
        (a.sector && a.sector.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter(a => a.status === statusFilter);
    }

    list = [...list].sort((a, b) => {
      let cmp = 0;
      const field = sortField;
      const av = a[field], bv = b[field];
      if (av == null && bv == null) cmp = 0;
      else if (av == null) cmp = -1;
      else if (bv == null) cmp = 1;
      else if (typeof av === 'string') cmp = av.localeCompare(bv as string);
      else cmp = (av as number) - (bv as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [assessments, search, statusFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
    return sortDir === 'asc'
      ? <ArrowUp className="ml-1 h-3 w-3 text-primary" />
      : <ArrowDown className="ml-1 h-3 w-3 text-primary" />;
  };

  const formatLoan = (v: number | null) => v != null ? `₹${v} Cr` : '—';

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = ['Borrower', 'CIN', 'Sector', 'Loan Requested', 'Score', 'Flags', 'Status', 'Date'];
    const rows = filtered.map(a => [
      a.borrower_name,
      a.cin || '',
      a.sector || '',
      a.loan_requested ?? '',
      a.composite_score ?? '',
      a.flag_count,
      a.status,
      new Date(a.created_at).toLocaleDateString('en-IN'),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assessments_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-bold uppercase tracking-wider">Assessment Register</h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search borrower, CIN, sector..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="conditional">Conditional</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={!filtered.length} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />Export CSV
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] cursor-pointer select-none" onClick={() => toggleSort('borrower_name')}>
                      <span className="inline-flex items-center">Borrower<SortIcon field="borrower_name" /></span>
                    </TableHead>
                    <TableHead className="text-[10px]">CIN</TableHead>
                    <TableHead className="text-[10px]">Sector</TableHead>
                    <TableHead className="text-[10px] text-right cursor-pointer select-none" onClick={() => toggleSort('loan_requested')}>
                      <span className="inline-flex items-center justify-end">Loan<SortIcon field="loan_requested" /></span>
                    </TableHead>
                    <TableHead className="text-[10px] text-center cursor-pointer select-none" onClick={() => toggleSort('composite_score')}>
                      <span className="inline-flex items-center justify-center">Score<SortIcon field="composite_score" /></span>
                    </TableHead>
                    <TableHead className="text-[10px] text-center">Flags</TableHead>
                    <TableHead className="text-[10px] cursor-pointer select-none" onClick={() => toggleSort('status')}>
                      <span className="inline-flex items-center">Status<SortIcon field="status" /></span>
                    </TableHead>
                    <TableHead className="text-[10px] cursor-pointer select-none" onClick={() => toggleSort('created_at')}>
                      <span className="inline-flex items-center">Date<SortIcon field="created_at" /></span>
                    </TableHead>
                    <TableHead className="text-[10px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 9 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                        No assessments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(a => (
                      <TableRow key={a.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => navigate(`/assessment/${a.id}/results`)}>
                        <TableCell className="font-medium">{a.borrower_name}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{a.cin || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{a.sector || '—'}</TableCell>
                        <TableCell className="text-right font-mono">{formatLoan(a.loan_requested)}</TableCell>
                        <TableCell className="text-center"><ScoreBadge score={a.composite_score ?? 0} /></TableCell>
                        <TableCell className="text-center">
                          {a.flag_count > 0
                            ? <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">{a.flag_count}</span>
                            : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell><StatusBadge status={a.status as AssessmentStatus} /></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell><Button variant="ghost" size="sm" className="text-xs">View CAM</Button></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
