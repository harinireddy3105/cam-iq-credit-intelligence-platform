import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Brain, AlertTriangle, ShieldCheck, Upload, FileText, X, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AppLayout } from '@/components/AppLayout';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const STEPS = ['Company Details', 'Document Upload', 'AI Analysis', 'Field Insights'];
const SECTORS = ['Manufacturing', 'Real Estate', 'Trading', 'Infrastructure', 'Services', 'FMCG', 'Steel', 'Textile', 'Pharma', 'Shipping', 'Construction', 'Agriculture', 'IT', 'Hospitality'];

const DOC_TYPES = [
  { key: 'gstr3b', label: 'GSTR-3B Returns', required: true },
  { key: 'gstr2a', label: 'GSTR-2A Returns', required: true },
  { key: 'itr', label: 'ITR-6 / ITR-7', required: true },
  { key: 'bank', label: 'Bank Statements (24 Months)', required: true },
  { key: 'mca', label: 'MCA / ROC Filing', required: true },
  { key: 'annual', label: 'Annual Report', required: true },
  { key: 'legal', label: 'Legal Notices', required: false },
] as const;

type DocKey = typeof DOC_TYPES[number]['key'];

interface UploadedFile {
  file: File;
  uploading: boolean;
  uploaded: boolean;
  storagePath?: string;
  error?: string;
}

const ANALYSIS_STAGES = [
  'Initializing CAM-IQ Analysis Engine...',
  'Cross-referencing GST & ITR data patterns...',
  'Running Five-Cs credit scoring model...',
  'Scanning for fraud indicators & red flags...',
  'Generating research findings & covenants...',
  'Compiling final credit assessment...',
];

interface AnalysisResult {
  composite_score: number;
  character_score: number;
  capacity_score: number;
  capital_score: number;
  collateral_score: number;
  conditions_score: number;
  recommendation: string;
  loan_recommended: number;
  interest_rate: number;
  tenure_months: number;
  rationale: string;
  fraud_flags: Array<{
    fraud_type: string;
    source_a: string;
    source_b: string;
    variance_amount: string;
    severity: string;
    evidence: string;
  }>;
  research_findings: Array<{
    source: string;
    finding: string;
    sentiment: string;
  }>;
  covenants: string[];
}

export default function NewAssessment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [cin, setCin] = useState('');
  const [sector, setSector] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [streamedText, setStreamedText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [uploads, setUploads] = useState<Record<DocKey, UploadedFile | null>>(
    () => Object.fromEntries(DOC_TYPES.map(d => [d.key, null])) as Record<DocKey, UploadedFile | null>
  );
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const cinValid = /^[A-Z]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(cin);

  const handleFileSelect = async (docKey: DocKey, file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: 'File Too Large', description: 'Maximum file size is 50MB.', variant: 'destructive' });
      return;
    }
    if (!user) return;

    setUploads(prev => ({ ...prev, [docKey]: { file, uploading: true, uploaded: false } }));

    const ext = file.name.split('.').pop() || 'pdf';
    const path = `${user.id}/${docKey}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('cam-iq-documents')
      .upload(path, file, { upsert: true });

    if (error) {
      setUploads(prev => ({ ...prev, [docKey]: { file, uploading: false, uploaded: false, error: error.message } }));
      toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
    } else {
      setUploads(prev => ({ ...prev, [docKey]: { file, uploading: false, uploaded: true, storagePath: path } }));
    }
  };

  const removeFile = async (docKey: DocKey) => {
    const upload = uploads[docKey];
    if (upload?.storagePath) {
      await supabase.storage.from('cam-iq-documents').remove([upload.storagePath]);
    }
    setUploads(prev => ({ ...prev, [docKey]: null }));
  };

  const requiredDocsUploaded = DOC_TYPES.filter(d => d.required).every(d => uploads[d.key]?.uploaded);

  const runAnalysis = useCallback(async () => {
    setAnalyzing(true);
    setAnalysisStage(0);
    setAnalysisProgress(0);
    setStreamedText('');
    setAnalysisResult(null);

    // Progress animation
    const stageInterval = setInterval(() => {
      setAnalysisStage(prev => {
        if (prev < ANALYSIS_STAGES.length - 1) return prev + 1;
        return prev;
      });
      setAnalysisProgress(prev => Math.min(prev + 15, 90));
    }, 2500);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/credit-analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            company_name: companyName,
            cin,
            sector,
            loan_amount: loanAmount,
            purpose,
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(err.error || 'Analysis failed');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '' || !line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setStreamedText(fullText);
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      clearInterval(stageInterval);
      setAnalysisProgress(100);

      // Parse the JSON result from the streamed text
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Failed to parse AI response');

      const result: AnalysisResult = JSON.parse(jsonMatch[0]);
      setAnalysisResult(result);

      // Save to database
      if (user) {
        const { data: assessment, error: assessmentError } = await supabase
          .from('assessments')
          .insert({
            borrower_name: companyName,
            cin,
            sector,
            loan_requested: parseFloat(loanAmount),
            loan_recommended: result.loan_recommended,
            interest_rate: result.interest_rate,
            tenure_months: result.tenure_months,
            composite_score: result.composite_score,
            character_score: result.character_score,
            capacity_score: result.capacity_score,
            capital_score: result.capital_score,
            collateral_score: result.collateral_score,
            conditions_score: result.conditions_score,
            status: result.recommendation === 'approved' ? 'approved' : result.recommendation === 'conditional' ? 'conditional' : 'rejected',
            recommendation_rationale: result.rationale,
            created_by: user.id,
          })
          .select('id')
          .single();

        if (assessmentError) {
          console.error('Failed to save assessment:', assessmentError);
          toast({ title: 'Warning', description: 'Analysis complete but failed to save to database.', variant: 'destructive' });
        } else if (assessment) {
          setAssessmentId(assessment.id);

          // Save fraud flags, research findings, covenants in parallel
          const promises = [];

          if (result.fraud_flags?.length) {
            promises.push(
              supabase.from('fraud_flags').insert(
                result.fraud_flags.map(f => ({ assessment_id: assessment.id, ...f }))
              ).then(() => {})
            );
          }
          if (result.research_findings?.length) {
            promises.push(
              supabase.from('research_findings').insert(
                result.research_findings.map(r => ({ assessment_id: assessment.id, ...r }))
              ).then(() => {})
            );
          }
          if (result.covenants?.length) {
            promises.push(
              supabase.from('covenants').insert(
                result.covenants.map(c => ({ assessment_id: assessment.id, covenant_text: c }))
              ).then(() => {})
            );
          }

          await Promise.all(promises);
        }
      }

      toast({ title: 'Analysis Complete', description: `Composite Score: ${result.composite_score}/100 — ${result.recommendation.toUpperCase()}` });
    } catch (e) {
      console.error('Analysis error:', e);
      toast({ title: 'Analysis Failed', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    } finally {
      clearInterval(stageInterval);
      setAnalyzing(false);
    }
  }, [companyName, cin, sector, loanAmount, purpose, user, toast]);

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
            <CardContent className="p-8 space-y-6">
              {!analyzing && !analysisResult && (
                <div className="text-center space-y-4">
                  <Brain className="h-12 w-12 mx-auto text-primary animate-pulse" />
                  <div className="font-mono text-sm text-primary">CAM-IQ ANALYSIS ENGINE v2.1</div>
                  <p className="text-muted-foreground text-sm">
                    AI will perform Five-Cs credit analysis for <strong>{companyName}</strong> in the <strong>{sector}</strong> sector
                    for a ₹{loanAmount} Cr loan request.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
                    <Button onClick={runAnalysis}>
                      <Brain className="h-4 w-4 mr-2" />
                      Start AI Analysis
                    </Button>
                  </div>
                </div>
              )}

              {analyzing && (
                <div className="space-y-6">
                  <div className="text-center">
                    <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin" />
                    <p className="font-mono text-sm text-primary mt-3">{ANALYSIS_STAGES[analysisStage]}</p>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                  {streamedText && (
                    <div className="bg-background/80 rounded-lg p-4 max-h-48 overflow-y-auto">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">{streamedText.slice(0, 500)}...</pre>
                    </div>
                  )}
                </div>
              )}

              {analysisResult && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <ShieldCheck className="h-10 w-10 mx-auto text-cam-success" />
                    <h3 className="text-lg font-bold">Analysis Complete</h3>
                    <div className={cn(
                      'inline-block px-4 py-1 rounded-full text-sm font-bold',
                      analysisResult.recommendation === 'approved' ? 'bg-cam-success/20 text-cam-success' :
                      analysisResult.recommendation === 'conditional' ? 'bg-cam-warning/20 text-cam-warning' :
                      'bg-cam-danger/20 text-cam-danger'
                    )}>
                      {analysisResult.recommendation.toUpperCase()}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                    {([
                      ['Composite', analysisResult.composite_score],
                      ['Character', analysisResult.character_score],
                      ['Capacity', analysisResult.capacity_score],
                      ['Capital', analysisResult.capital_score],
                      ['Collateral', analysisResult.collateral_score],
                      ['Conditions', analysisResult.conditions_score],
                    ] as const).map(([label, score]) => (
                      <div key={label} className="bg-background rounded-lg p-2">
                        <div className={cn('text-lg font-bold', score >= 70 ? 'text-cam-success' : score >= 50 ? 'text-cam-warning' : 'text-cam-danger')}>{score}</div>
                        <div className="text-[10px] text-muted-foreground">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-background rounded-lg p-4 text-sm text-muted-foreground">
                    <p>{analysisResult.rationale}</p>
                  </div>

                  {analysisResult.fraud_flags?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-1"><AlertTriangle className="h-4 w-4 text-cam-danger" /> Fraud Flags ({analysisResult.fraud_flags.length})</h4>
                      {analysisResult.fraud_flags.map((f, i) => (
                        <div key={i} className={cn('bg-background rounded-lg p-3 text-xs border-l-2',
                          f.severity === 'HIGH' ? 'border-cam-danger' : f.severity === 'MEDIUM' ? 'border-cam-warning' : 'border-muted'
                        )}>
                          <span className="font-semibold">{f.fraud_type}</span> — {f.evidence}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setAnalysisResult(null); setStreamedText(''); }}>Re-run Analysis</Button>
                    <Button onClick={() => setStep(3)} className="flex-1">Continue to Field Insights →</Button>
                  </div>
                </div>
              )}
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
                <Button onClick={() => navigate(assessmentId ? `/assessment/${assessmentId}/results` : '/assessment/a1/results')} className="flex-1">View Full CAM Results →</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
