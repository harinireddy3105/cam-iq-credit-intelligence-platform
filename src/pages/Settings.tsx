import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AppLayout } from '@/components/AppLayout';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  const [weights, setWeights] = useState([25, 30, 20, 15, 10]);
  const labels = ['Character', 'Capacity', 'Capital', 'Collateral', 'Conditions'];
  const total = weights.reduce((a, b) => a + b, 0);

  const updateWeight = (index: number, value: number) => {
    const nw = [...weights];
    nw[index] = value;
    setWeights(nw);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <h1 className="text-xl font-bold uppercase tracking-wider">Settings</h1>

        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Full Name</Label><Input defaultValue="Rajesh Kumar" /></div>
              <div className="space-y-2"><Label>Employee ID</Label><Input defaultValue="SBI-CO-2847" /></div>
              <div className="space-y-2"><Label>Email</Label><Input defaultValue="rajesh.kumar@sbi.co.in" /></div>
              <div className="space-y-2"><Label>Branch</Label><Input defaultValue="Mumbai Corporate" /></div>
            </div>
            <Button onClick={() => toast({ title: 'Settings Saved', description: 'Profile updated successfully.' })}>Save Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Five-Cs Weight Configuration</CardTitle>
            <p className="text-xs text-muted-foreground">Weight adjustments subject to RBI compliance guidelines</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {labels.map((label, i) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>{label}</Label>
                  <span className="font-mono text-muted-foreground">{weights[i]}%</span>
                </div>
                <Slider value={[weights[i]]} onValueChange={([v]) => updateWeight(i, v)} min={0} max={50} step={5} />
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-sm font-medium">Total</span>
              <span className={`font-mono font-bold ${total === 100 ? 'text-cam-success' : 'text-cam-danger'}`}>{total}%</span>
            </div>
            {total !== 100 && <p className="text-xs text-cam-danger">Weights must sum to exactly 100%</p>}
            <Button disabled={total !== 100} onClick={() => toast({ title: 'Settings Saved', description: 'Five-Cs weights updated.' })}>Save Weights</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>API Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'Claude API', connected: false },
              { name: 'Lovable Cloud', connected: false },
              { name: 'Storage', connected: false },
            ].map(s => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <span>{s.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${s.connected ? 'bg-cam-success' : 'bg-cam-warning'}`} />
                  <span className="text-xs text-muted-foreground">{s.connected ? 'Connected' : 'Not Connected'}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
