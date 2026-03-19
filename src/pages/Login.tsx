import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, Zap, BarChart3, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

function AnimatedStat({ value, label, delay, colorClass }: { value: string; label: string; delay: number; colorClass: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <p className={`text-2xl xl:text-3xl font-extrabold font-mono ${colorClass}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 font-medium">{label}</p>
    </div>
  );
}

function FeatureChip({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border/40 text-xs text-muted-foreground font-medium hover:bg-secondary/80 transition-colors">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <span>{text}</span>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, session } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session) navigate('/dashboard', { replace: true });
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({ title: 'Registration Failed', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Account Created', description: 'Please check your email to confirm your account, or sign in directly.' });
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: 'Authentication Failed', description: error.message, variant: 'destructive' });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="absolute top-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[140px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-accent/6 blur-[120px]" />
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-cam-gold/4 blur-[100px]" />

      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 relative">
        <div className="relative z-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/25 rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-primary/20 to-accent/10 rounded-2xl p-3 border border-primary/25">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-extrabold tracking-tight">CAM-IQ</span>
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-semibold">
                Autonomous Credit Intelligence
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8" style={{ animationDelay: '0.15s' }}>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-[1.12] tracking-tight">
              India's First AI Engine That{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text" style={{ backgroundImage: 'var(--gradient-primary)' }}>
                  Cross-Examines
                </span>
                <span className="absolute bottom-1 left-0 right-0 h-[3px] rounded-full opacity-50" style={{ backgroundImage: 'var(--gradient-primary)' }} />
              </span>{' '}
              Financial Documents
            </h1>
          </div>

          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed animate-fade-in-up font-normal" style={{ animationDelay: '0.2s' }}>
            Detect fraud. Generate Credit Appraisal Memos. Protect your bank's portfolio — in hours, not weeks.
          </p>

          <div className="flex flex-wrap gap-2.5 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <FeatureChip icon={Zap} text="AI-Powered Analysis" />
            <FeatureChip icon={ShieldCheck} text="Fraud Detection" />
            <FeatureChip icon={BarChart3} text="5C Scoring" />
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/40">
            <AnimatedStat value="3 Wks → 2 Hrs" label="Processing Time" delay={500} colorClass="text-primary" />
            <AnimatedStat value="₹800 Cr" label="NPA Savings / Bank / Year" delay={700} colorClass="text-cam-success" />
            <AnimatedStat value="5 Types" label="Fraud Auto-Detected" delay={900} colorClass="text-destructive" />
          </div>
        </div>

        <div className="relative z-10 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <p className="text-xs text-muted-foreground/50 tracking-wide flex items-center gap-2 font-medium">
            <Lock className="h-3.5 w-3.5" />
            Secured · RBI Compliance Ready · 256-bit Encrypted · SOC2 Type II
          </p>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-sm">
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-extrabold">CAM-IQ</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">Credit Intelligence Officer</p>
          </div>

          {/* Form card */}
          <div className="glass-card-elevated rounded-2xl p-8 space-y-7">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
              <p className="text-sm text-muted-foreground mt-1.5 font-normal">
                {isSignUp ? 'Register for CAM-IQ access' : 'Sign in to your intelligence dashboard'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                  <Input id="fullName" placeholder="e.g. Rajesh Kumar" value={fullName} onChange={e => setFullName(e.target.value)} required className="h-12 bg-secondary/50 border-border/40 focus:border-primary/50 rounded-xl transition-colors" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <Input id="email" type="email" placeholder="officer@sbi.co.in" value={email} onChange={e => setEmail(e.target.value)} required className="h-12 bg-secondary/50 border-border/40 focus:border-primary/50 rounded-xl transition-colors" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="h-12 bg-secondary/50 border-border/40 focus:border-primary/50 rounded-xl transition-colors" />
              </div>
              <Button type="submit" className="w-full h-12 font-bold gap-2 text-sm rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In to CAM-IQ'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/30" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground/60 font-medium">
                  {isSignUp ? 'Already registered?' : 'New to CAM-IQ?'}
                </span>
              </div>
            </div>

            <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-center text-sm text-primary hover:text-primary/80 font-semibold transition-colors">
              {isSignUp ? 'Sign In Instead' : 'Create an Account'}
            </button>
          </div>

          <p className="text-center text-[10px] text-muted-foreground/40 tracking-wide flex items-center justify-center gap-1.5 mt-6 lg:hidden font-medium">
            <Lock className="h-3 w-3" /> Secured · RBI Compliance Ready
          </p>
        </div>
      </div>
    </div>
  );
}
