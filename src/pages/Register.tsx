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

const PAGE_SIZE = 15;

export default function Register() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

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

  // Reset page when filters change
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
            <Input placeholder="Search borrower, CIN, sector..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
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

        <Card className="border-border/60 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/60 border-b-2 border-border hover:bg-secondary/60">
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 cursor-pointer select-none py-3 pl-4" onClick={() => toggleSort('borrower_name')}>
                      <span className="inline-flex items-center gap-0.5">Borrower<SortIcon field="borrower_name" /></span>
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 py-3">CIN</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 py-3">Sector</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 text-right cursor-pointer select-none py-3" onClick={() => toggleSort('loan_requested')}>
                      <span className="inline-flex items-center justify-end gap-0.5">Loan Amt<SortIcon field="loan_requested" /></span>
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 text-center cursor-pointer select-none py-3" onClick={() => toggleSort('composite_score')}>
                      <span className="inline-flex items-center justify-center gap-0.5">Score<SortIcon field="composite_score" /></span>
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 text-center py-3">Flags</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 cursor-pointer select-none py-3" onClick={() => toggleSort('status')}>
                      <span className="inline-flex items-center gap-0.5">Status<SortIcon field="status" /></span>
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 cursor-pointer select-none py-3" onClick={() => toggleSort('created_at')}>
                      <span className="inline-flex items-center gap-0.5">Date<SortIcon field="created_at" /></span>
                    </TableHead>
                    <TableHead className="text-[10px] py-3 pr-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i} className={i % 2 === 0 ? 'bg-card' : 'bg-secondary/20'}>
                        {Array.from({ length: 9 }).map((_, j) => (
                          <TableCell key={j} className="py-2.5"><Skeleton className="h-4 w-full rounded" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-16">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-muted-foreground/40" />
                          <span className="text-sm">No assessments found</span>
                          <span className="text-xs text-muted-foreground/60">Try adjusting your search or filters</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((a, idx) => (
                      <TableRow
                        key={a.id}
                        className={`cursor-pointer transition-colors border-l-2 border-l-transparent hover:border-l-primary hover:bg-primary/5 ${idx % 2 === 0 ? 'bg-card' : 'bg-secondary/15'}`}
                        onClick={() => navigate(`/assessment/${a.id}/results`)}
                      >
                        <TableCell className="font-medium text-sm py-2.5 pl-4">{a.borrower_name}</TableCell>
                        <TableCell className="font-mono text-[11px] text-muted-foreground py-2.5">{a.cin || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground py-2.5">
                          {a.sector ? (
                            <span className="inline-flex items-center rounded-md bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                              {a.sector}
                            </span>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm py-2.5">{formatLoan(a.loan_requested)}</TableCell>
                        <TableCell className="text-center py-2.5"><ScoreBadge score={a.composite_score ?? 0} /></TableCell>
                        <TableCell className="text-center py-2.5">
                          {a.flag_count > 0
                            ? <span className="inline-flex items-center justify-center h-5 min-w-[20px] rounded-full bg-destructive/90 text-destructive-foreground text-[10px] font-bold shadow-sm shadow-destructive/20">{a.flag_count}</span>
                            : <span className="text-muted-foreground/40">—</span>}
                        </TableCell>
                        <TableCell className="py-2.5"><StatusBadge status={a.status as AssessmentStatus} /></TableCell>
                        <TableCell className="text-xs text-muted-foreground py-2.5">{new Date(a.created_at).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell className="py-2.5 pr-4">
                          <Button variant="ghost" size="sm" className="text-[11px] h-7 px-2.5 text-primary hover:text-primary hover:bg-primary/10">
                            View CAM
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1]) > 1) acc.push('ellipsis');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === 'ellipsis'
                    ? <span key={`e${i}`} className="px-1">…</span>
                    : <Button key={p} variant={p === safePage ? 'default' : 'outline'} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(p)}>{p}</Button>
                )}
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={safePage >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
