'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, Briefcase, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [accountType, setAccountType] = useState<'personal' | 'brand' | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    fetch('/api/account/type', { credentials: 'include', cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Please log in');
        setAccountType(data.accountType === 'brand' ? 'brand' : 'personal');
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  async function convertToBrand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password) return;
    setConverting(true);
    try {
      const response = await fetch('/api/account/type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not change account type');
      setAccountType('brand');
      setPassword('');
      toast.success('Your account is now a Brand Account');
    } catch (error: any) {
      toast.error(error.message || 'Could not change account type');
    } finally {
      setConverting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 md:max-w-2xl md:mx-auto">
      <Link href="/home" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft size={18} /> Back
      </Link>
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-muted-foreground mb-8">Manage your Sharable account.</p>

      <section className="rounded-2xl border border-border p-5">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600"><Briefcase size={22} /></div>
          <div className="flex-1">
            <h2 className="font-semibold text-lg">Account Type</h2>
            <p className="text-sm text-muted-foreground mt-1">Every new account starts as a Personal Account.</p>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-muted-foreground">Loading account settings…</div>
        ) : accountType === 'brand' ? (
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-green-500/10 p-4 text-green-700 dark:text-green-400">
            <CheckCircle2 size={20} />
            <div>
              <p className="font-semibold">Brand Account</p>
              <p className="text-sm">Brand Accounts cannot be changed back to Personal Accounts.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={convertToBrand} className="mt-6 space-y-4">
            <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
              Changing to a Brand Account is permanent. You will not be able to switch back to a Personal Account.
            </div>
            <label className="block text-sm font-medium" htmlFor="account-password">Confirm with your password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input id="account-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-foreground/20" required />
            </div>
            <button type="submit" disabled={converting || !password} className="w-full rounded-xl bg-foreground px-4 py-3 font-semibold text-background disabled:opacity-50">
              {converting ? 'Confirming…' : 'Change to Brand Account'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
