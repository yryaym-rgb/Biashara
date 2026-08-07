'use client';

import * as React from 'react';
import { PackageOpen, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SectionHeading } from '@/components/ui/section-heading';
import { Container } from '@/components/ui/container';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { KitengeStrip } from '@/components/ui/kitenge-strip';
import { Link } from '@/lib/i18n/navigation';

const COLOR_TOKENS = [
  { name: '--brand-blue', className: 'bg-brand-blue' },
  { name: '--brand-blue-dark', className: 'bg-brand-blue-dark' },
  { name: '--brand-gold', className: 'bg-brand-gold' },
  { name: '--brand-gold-dark', className: 'bg-brand-gold-dark' },
  { name: '--ink', className: 'bg-ink' },
  { name: '--body', className: 'bg-body' },
  { name: '--muted', className: 'bg-muted' },
  { name: '--bg', className: 'bg-bg border border-border' },
  { name: '--bg-tint', className: 'bg-bg-tint' },
  { name: '--border', className: 'bg-border' },
  { name: '--success', className: 'bg-success' },
  { name: '--danger', className: 'bg-danger' },
] as const;

function StyleguideSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border py-16 last:border-b-0">
      <Container>
        <h2 className="mb-8">{title}</h2>
        {children}
      </Container>
    </section>
  );
}

export function StyleguideContent() {
  const [tab, setTab] = React.useState('all');

  return (
    <div className="bg-bg">
      <StyleguideSection title="Typography">
        <div className="flex flex-col gap-8">
          <div>
            <p className="eyebrow mb-4">Eyebrow label</p>
            <h1>
              Trade with confidence.
              <br />
              Trace every lot.
              <br />
              <span className="text-brand-gold">Grow your business.</span>
            </h1>
          </div>
          <h2>Section heading (H2)</h2>
          <h3>Card title (H3)</h3>
          <p className="max-w-2xl text-base text-body">
            Body text at 16px with line-height 1.65. Used for paragraphs, descriptions,
            and secondary content across the platform.
          </p>
          <p className="tabular-nums text-[28px] text-ink">$42,850.00</p>
        </div>
      </StyleguideSection>

      <StyleguideSection title="Color palette">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {COLOR_TOKENS.map((token) => (
            <div key={token.name} className="flex flex-col gap-2">
              <div className={`h-16 rounded-card ${token.className}`} />
              <code className="text-[13px] text-muted">{token.name}</code>
            </div>
          ))}
        </div>
      </StyleguideSection>

      <StyleguideSection title="Buttons">
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-4">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small primary</Button>
            <Button size="sm" variant="secondary">
              Small secondary
            </Button>
            <Button size="sm" variant="ghost">
              Small ghost
            </Button>
          </div>
          <Button asChild>
            <Link href="/">Link as button</Link>
          </Button>
        </div>
      </StyleguideSection>

      <StyleguideSection title="Cards">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Base card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body">White background, 1px border, 14px radius, subtle shadow.</p>
            </CardContent>
          </Card>
          <Card hoverable>
            <CardHeader>
              <CardTitle>Hoverable card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body">Lifts on hover with deeper shadow (150ms ease).</p>
            </CardContent>
          </Card>
        </div>
      </StyleguideSection>

      <StyleguideSection title="Form controls">
        <div className="grid max-w-xl gap-6">
          <Input label="Email" hint="We will never share your email." placeholder="you@company.com" />
          <Input
            label="Password"
            type="password"
            error="Password must be at least 12 characters"
            defaultValue="short"
          />
          <Textarea
            label="Message"
            hint="Describe your inquiry."
            placeholder="How can we help?"
          />
          <Select
            label="Mineral"
            placeholder="Select a mineral"
            options={[
              { value: 'cobalt', label: 'Cobalt' },
              { value: 'copper', label: 'Copper' },
              { value: 'gold', label: 'Gold' },
            ]}
          />
        </div>
      </StyleguideSection>

      <StyleguideSection title="Status chips">
        <div className="flex flex-wrap gap-3">
          <Badge variant="success">Success</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="neutral">Neutral</Badge>
        </div>
      </StyleguideSection>

      <StyleguideSection title="Tabs">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All minerals</TabsTrigger>
            <TabsTrigger value="cobalt">Cobalt</TabsTrigger>
            <TabsTrigger value="copper">Copper</TabsTrigger>
            <TabsTrigger value="gold">Gold</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <p className="text-body">Active tab uses brand blue with 2px gold underline offset 6px.</p>
          </TabsContent>
          <TabsContent value="cobalt">
            <p className="text-body">Cobalt listings will appear here.</p>
          </TabsContent>
          <TabsContent value="copper">
            <p className="text-body">Copper listings will appear here.</p>
          </TabsContent>
          <TabsContent value="gold">
            <p className="text-body">Gold listings will appear here.</p>
          </TabsContent>
        </Tabs>
      </StyleguideSection>

      <StyleguideSection title="Section heading">
        <SectionHeading
          eyebrow="B2B Platform"
          title="Trusted mineral trading"
          subtitle="Connect with verified buyers and sellers across the DRC mineral supply chain."
        />
      </StyleguideSection>

      <StyleguideSection title="Skeleton">
        <div className="flex max-w-md flex-col gap-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="mt-2 h-24 w-full rounded-card" />
        </div>
      </StyleguideSection>

      <StyleguideSection title="Empty state">
        <Card>
          <EmptyState
            icon={<PackageOpen className="h-5 w-5" strokeWidth={1.75} />}
            title="No listings published yet"
            description="When sellers publish offers on the marketplace, they will appear here. Check back soon."
            action={
              <Button size="sm" variant="secondary" asChild>
                <Link href="/marketplace">
                  <Search className="h-4 w-4" strokeWidth={1.75} />
                  Browse marketplace
                </Link>
              </Button>
            }
          />
        </Card>
      </StyleguideSection>

      <StyleguideSection title="Kitenge strip">
        <KitengeStrip />
      </StyleguideSection>
    </div>
  );
}
