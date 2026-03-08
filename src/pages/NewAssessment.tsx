import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/AppLayout';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const STEPS = ['Company Details', 'Document Upload', 'AI Analysis', 'Field Insights'];
const SECTORS = ['Manufacturing', 'Real Estate', 'Trading', 'Infrastructure', 'Services', 'FMCG', 'Steel', 'Textile', 'Pharma', 'Shipping', 'Construction', 'Agriculture', 'IT', 'Hospitality'];

export default function NewAssessment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [cin, setCin] = useState('');
  const [sector, setSector] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [purpose, setPurpose] = useState('');

  const cinValid = /^[A-Z]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(cin);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={cn('h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                i < step ? 'bg-cam-success border-cam-success text-primary-foreground' :
                i === step ? 'bg-primary border-primary text-primary-foreground' :
                'border-border text-muted-foreground'
              )}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={cn('h-0.5 w-8 sm:w-16 mx-1', i < step ? 'bg-cam-success' : 'bg-border')} />}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">{STEPS[step]}</p>

        {step === 0 && (
          <Card>
            <CardHeader><CardTitle>Company Details</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input placeholder="e.g. Rajasthan Steel Works Pvt Ltd" value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>CIN Number *</Label>
                <div className="relative">
                  <Input placeholder="e.g. U27100RJ2010PTC031245" value={cin} onChange={e => setCin(e.target.value.toUpperCase())} />
                  {cin && <span className={cn('absolute right-3 top-1/2 -translate-y-1/2 text-xs', cinValid ? 'text-cam-success' : 'text-cam-danger')}>{cinValid ? '✓ Valid' : '✗ Invalid'}</span>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Industry Sector *</Label>
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                  <SelectContent>{SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Loan Amount Requested (₹ Crore) *</Label>
                <Input type="number" placeholder="e.g. 25" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Purpose of Loan</Label>
                <Textarea placeholder="Working capital expansion, machinery procurement..." value={purpose} onChange={e => setPurpose(e.target.value)} />
              </div>
              <Button onClick={() => {
                if (!companyName || !sector || !loanAmount) {
                  toast({ title: 'Validation Error', description: 'Please fill all required fields.', variant: 'destructive' });
                  return;
                }
                setStep(1);
              }} className="w-full">Continue to Document Upload →</Button>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <p className="text-sm text-muted-foreground">All documents processed using AWS Textract OCR with Devanagari and English support</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['GSTR-3B Returns *', 'GSTR-2A Returns *', 'ITR-6 / ITR-7 *', 'Bank Statements (24 Months) *', 'MCA / ROC Filing *', 'Annual Report *', 'Legal Notices (Optional)'].map((doc) => (
                  <div key={doc} className="border border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <p className="font-medium text-sm">{doc}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Click to upload or drag and drop · Max 50MB</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)}>← Back</Button>
                <Button onClick={() => setStep(2)} className="flex-1">Proceed to AI Analysis →</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-secondary/50">
            <CardContent className="p-8 text-center space-y-4">
              <div className="font-mono text-sm text-cam-processing">CAM-IQ ANALYSIS ENGINE v2.1</div>
              <p className="text-muted-foreground text-sm">AI analysis requires backend integration with Lovable Cloud.</p>
              <p className="text-muted-foreground text-xs">Connect to Lovable Cloud to enable real-time AI-powered credit analysis with Claude API.</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
                <Button onClick={() => { setStep(3); toast({ title: 'Analysis Simulated', description: 'View sample results to explore the full CAM output.' }); }}>Skip to Field Insights →</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Credit Officer Field Observations</CardTitle>
              <p className="text-sm text-muted-foreground">Enter observations from your site visit and management meeting.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea placeholder="Example: Factory running at 40% capacity. MD was evasive about the revenue discrepancy. Machinery appears outdated and poorly maintained." className="min-h-[140px]" />
              <div className="flex flex-wrap gap-2">
                {['Factory utilisation low', 'Strong management team', 'Assets in good condition', 'Evasive promoter', 'Overstated inventory', 'Clean site visit'].map((chip) => (
                  <button key={chip} className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:bg-secondary transition-colors">{chip}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
                <Button onClick={() => navigate('/assessment/a1/results')} className="flex-1">View Full CAM Results →</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
