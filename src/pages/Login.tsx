import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function AnimatedStat({ value, label, delay, colorClass }: { value: string; label: string; delay: number; colorClass: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <p className={`text-2xl xl:text-3xl font-bold font-mono ${colorClass}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-background" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-10 w-10 text-cam-processing" />
            <span className="text-3xl font-bold tracking-tight">CAM-IQ</span>
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-cam-gold font-medium">
            Autonomous Credit Intelligence Officer
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-3xl xl:text-4xl font-bold leading-tight">
            India's First AI Engine That<br />
            <span className="text-cam-processing">Cross-Examines</span> Financial Documents
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            Detect fraud. Generate Credit Appraisal Memos. Protect your bank's portfolio — in hours, not weeks.
          </p>
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
            <AnimatedStat value="3 Wks → 2 Hrs" label="Processing Time" delay={300} colorClass="text-cam-processing" />
            <AnimatedStat value="₹800 Cr" label="NPA Savings / Bank / Year" delay={600} colorClass="text-cam-success" />
            <AnimatedStat value="5 Types" label="Fraud Auto-Detected" delay={900} colorClass="text-cam-danger" />
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-muted-foreground tracking-wide flex items-center gap-2">
            <Lock className="h-3 w-3" />
            Secured · RBI Compliance Ready · 256-bit Encrypted
          </p>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-8 w-8 text-cam-processing" />
              <span className="text-2xl font-bold">CAM-IQ</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cam-gold">Credit Intelligence Officer</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">Sign In</h2>
            <p className="text-sm text-muted-foreground mt-1">Access your credit intelligence dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="officer@sbi.co.in" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select defaultValue="credit_officer">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_officer">Credit Officer</SelectItem>
                  <SelectItem value="branch_manager">Branch Manager</SelectItem>
                  <SelectItem value="risk_committee">Risk Committee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" size="lg">
              Sign In to CAM-IQ
            </Button>
          </form>

          <p className="text-center text-[10px] text-muted-foreground tracking-wide flex items-center justify-center gap-1 lg:hidden">
            <Lock className="h-3 w-3" /> Secured · RBI Compliance Ready
          </p>
        </div>
      </div>
    </div>
  );
}
