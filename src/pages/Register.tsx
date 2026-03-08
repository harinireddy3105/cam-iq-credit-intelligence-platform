import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { ScoreBadge } from '@/components/ScoreBadge';
import { sampleAssessments } from '@/lib/sample-data';
import { formatINR } from '@/lib/format';

export default function Register() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filtered = sampleAssessments.filter(a =>
    a.borrower_name.toLowerCase().includes(search.toLowerCase()) ||
    a.cin.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl font-bold uppercase tracking-wider">Assessment Register</h1>
          <Button variant="outline" size="sm">Export to CSV</Button>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by borrower name or CIN..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Ref No</TableHead>
                    <TableHead className="text-[10px]">Borrower Name</TableHead>
                    <TableHead className="text-[10px]">CIN</TableHead>
                    <TableHead className="text-[10px]">Sector</TableHead>
                    <TableHead className="text-[10px] text-right">Loan ₹Cr</TableHead>
                    <TableHead className="text-[10px] text-center">Score</TableHead>
                    <TableHead className="text-[10px] text-center">Flags</TableHead>
                    <TableHead className="text-[10px]">Status</TableHead>
                    <TableHead className="text-[10px]">Date</TableHead>
                    <TableHead className="text-[10px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(a => (
                    <TableRow key={a.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => navigate(`/assessment/${a.id}/results`)}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{a.ref_no}</TableCell>
                      <TableCell className="font-medium">{a.borrower_name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{a.cin}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{a.sector}</TableCell>
                      <TableCell className="text-right font-mono">{formatINR(a.loan_requested)}</TableCell>
                      <TableCell className="text-center"><ScoreBadge score={a.composite_score} /></TableCell>
                      <TableCell className="text-center">
                        {a.fraud_flags.length > 0
                          ? <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-cam-danger text-primary-foreground text-[10px] font-bold">{a.fraud_flags.length}</span>
                          : <span className="text-cam-success">—</span>}
                      </TableCell>
                      <TableCell><StatusBadge status={a.status} /></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell><Button variant="ghost" size="sm" className="text-xs">View CAM</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
