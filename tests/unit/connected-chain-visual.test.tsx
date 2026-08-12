import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import {
  CHAIN_NODE_DOT_RESERVE_CLASS,
  CHAIN_NODE_LABEL_GAP_CLASS,
  ConnectedChainVisual,
} from '@/components/marketing/connected-chain-visual';

/** Longest real labels from logistics, traceability, and how-it-works usages. */
const LONGEST_LOGISTICS_LABELS = [
  'En attente',
  'Collecté',
  'En transit',
  'Douanes',
  'Livré',
] as const;

const LONGEST_TRACEABILITY_LABELS = [
  'Mine',
  'Coopérative',
  'Contrôle',
  'Transport',
  'Acheteur',
] as const;

const LONGEST_HOW_IT_WORKS_LABELS = [
  'Minerai',
  'Publier',
  'KYC',
  'Négocier',
  'Traçabilité',
  'Marché mondial',
] as const;

describe('ConnectedChainVisual layout', () => {
  const source = readFileSync(
    resolve(process.cwd(), 'components/marketing/connected-chain-visual.tsx'),
    'utf8',
  );

  it('reserves space below the node icon and widens label gap on horizontal layouts', () => {
    expect(source).toContain('HORIZONTAL_DOT_RESERVE');
    expect(source).toContain('HORIZONTAL_LAYOUT');
    expect(source).toContain(`CHAIN_NODE_DOT_RESERVE_CLASS = '${CHAIN_NODE_DOT_RESERVE_CLASS}'`);
    expect(source).toContain(`CHAIN_NODE_LABEL_GAP_CLASS = '${CHAIN_NODE_LABEL_GAP_CLASS}'`);
  });

  it('renders logistics labels without sharing overlap-prone classes with the node dot', () => {
    const { container } = render(
      <ConnectedChainVisual
        ariaLabel="Logistics chain"
        columnCount={5}
        tint="gold"
        steps={LONGEST_LOGISTICS_LABELS.map((label, index) => ({
          id: `logistics-${index}`,
          label,
          node: <span aria-hidden="true">•</span>,
        }))}
      />,
    );

    const nodes = container.querySelectorAll('li > div');
    const labels = screen.getAllByText(/En attente|En transit|Douanes|Livré|Collecté/);

    expect(nodes.length).toBe(5);
    expect(labels.length).toBe(5);

    for (const node of nodes) {
      expect(node.className).toMatch(/pb-3/);
    }

    for (const label of labels) {
      expect(label.className).toMatch(/relative/);
      expect(label.closest('li')?.className).toMatch(/gap-3/);
    }
  });

  it('renders traceability labels with the same node-to-label spacing guard', () => {
    const { container } = render(
      <ConnectedChainVisual
        ariaLabel="Traceability chain"
        columnCount={5}
        tint="blue"
        steps={LONGEST_TRACEABILITY_LABELS.map((label, index) => ({
          id: `traceability-${index}`,
          label,
          node: <span>{index + 1}</span>,
        }))}
      />,
    );

    expect(container.querySelectorAll('li > div').length).toBe(5);
    expect(screen.getByText('Coopérative')).toBeInTheDocument();
    expect(screen.getByText('Coopérative').closest('li')?.className).toMatch(/gap-3/);
  });

  it('renders how-it-works labels including Marché mondial and Traçabilité', () => {
    const { container } = render(
      <ConnectedChainVisual
        ariaLabel="How it works chain"
        columnCount={6}
        tint="gold"
        steps={LONGEST_HOW_IT_WORKS_LABELS.map((label, index) => ({
          id: `step-${index}`,
          label,
          node: <span aria-hidden="true">•</span>,
        }))}
      />,
    );

    expect(container.querySelectorAll('li > div').length).toBe(6);
    expect(screen.getByText('Marché mondial')).toBeInTheDocument();
    expect(screen.getByText('Traçabilité')).toBeInTheDocument();
    expect(screen.getByText('Marché mondial').closest('li')?.className).toMatch(/gap-3/);
  });
});
