'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import {
  MessageSquare,
  Package,
  Search,
  ShoppingCart,
  Store,
  Tag,
  X,
} from 'lucide-react';
import type {
  CommandPaletteResult,
  CommandPaletteSearchResult,
} from '@/lib/platform/command-palette.logic';
import { cn } from '@/lib/utils/cn';

interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  }
  return context;
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent | globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }

    document.addEventListener('keydown', handleKeyDown as EventListener);
    return () => document.removeEventListener('keydown', handleKeyDown as EventListener);
  }, []);

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandPaletteOverlay open={open} onClose={close} />
    </CommandPaletteContext.Provider>
  );
}

const GROUP_ICONS = {
  listing: Store,
  offer: Tag,
  order: ShoppingCart,
  conversation: MessageSquare,
} as const;

function flattenResults(results: CommandPaletteSearchResult): CommandPaletteResult[] {
  return [
    ...results.listings,
    ...results.offers,
    ...results.orders,
    ...results.conversations,
  ];
}

interface CommandPaletteOverlayProps {
  open: boolean;
  onClose: () => void;
}

function CommandPaletteOverlay({ open, onClose }: CommandPaletteOverlayProps) {
  const t = useTranslations('platform.commandPalette');
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const wasOpenRef = useRef(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CommandPaletteSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const flatResults = results ? flattenResults(results) : [];

  const search = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 1) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/platform/search?q=${encodeURIComponent(trimmed)}`);
      if (response.ok) {
        const data = (await response.json()) as CommandPaletteSearchResult;
        setResults(data);
        setActiveIndex(0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }

    if (wasOpenRef.current) {
      setQuery('');
      setResults(null);
      setActiveIndex(0);
      wasOpenRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      void search(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, open, search]);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  function navigateTo(result: CommandPaletteResult) {
    onClose();
    router.push(result.href as '/dashboard');
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (flatResults.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % flatResults.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const selected = flatResults[activeIndex];
      if (selected) {
        navigateTo(selected);
      }
    }
  }

  if (!open) return null;

  const groups: Array<{
    key: keyof CommandPaletteSearchResult;
    label: string;
    items: CommandPaletteResult[];
  }> = results
    ? ([
        { key: 'listings' as const, label: t('groups.listings'), items: results.listings },
        { key: 'offers' as const, label: t('groups.offers'), items: results.offers },
        { key: 'orders' as const, label: t('groups.orders'), items: results.orders },
        {
          key: 'conversations' as const,
          label: t('groups.conversations'),
          items: results.conversations,
        },
      ] as const).filter((group) => group.items.length > 0)
    : [];

  let resultOffset = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] md:pt-[15vh]">
      <button
        type="button"
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--ink)_40%,transparent)]"
        aria-label={t('close')}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('title')}
        className="relative z-10 flex max-h-[80vh] w-full max-w-[640px] flex-col overflow-hidden rounded-card border border-border bg-bg card-shadow"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-5 w-5 shrink-0 text-muted" strokeWidth={1.75} aria-hidden="true" />
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={t('placeholder')}
            className="h-[52px] flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-button text-muted hover:bg-bg-tint"
            aria-label={t('close')}
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="overflow-y-auto p-2">
          {loading ? (
            <p className="px-3 py-8 text-center text-[13px] text-muted">{t('searching')}</p>
          ) : query.trim().length < 1 ? (
            <p className="px-3 py-8 text-center text-[13px] text-muted">{t('hint')}</p>
          ) : flatResults.length === 0 ? (
            <p className="px-3 py-8 text-center text-[13px] text-muted">{t('noResults')}</p>
          ) : (
            groups.map((group) => {
              const groupStart = resultOffset;
              resultOffset += group.items.length;

              return (
                <div key={group.key} className="mb-2">
                  <p className="px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {group.label}
                  </p>
                  <ul>
                    {group.items.map((item, index) => {
                      const globalIndex = groupStart + index;
                      const Icon = GROUP_ICONS[item.type];
                      const isActive = globalIndex === activeIndex;

                      return (
                        <li key={`${item.type}-${item.id}`}>
                          <button
                            type="button"
                            onClick={() => navigateTo(item)}
                            onMouseEnter={() => setActiveIndex(globalIndex)}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-button px-3 py-2 text-left transition-colors',
                              isActive ? 'bg-bg-tint' : 'hover:bg-bg-tint',
                            )}
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-button bg-bg-tint">
                              <Icon
                                className="h-4 w-4 text-brand-blue"
                                strokeWidth={1.75}
                                aria-hidden="true"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[15px] font-medium text-ink">
                                {item.title}
                              </p>
                              {item.subtitle ? (
                                <p className="truncate text-[13px] text-muted">{item.subtitle}</p>
                              ) : null}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          )}
        </div>

        <div className="hidden border-t border-border px-4 py-2 sm:block">
          <p className="text-[12px] text-muted">
            <kbd className="rounded border border-border bg-bg-tint px-1.5 py-0.5 font-sans text-[11px]">
              ↑↓
            </kbd>{' '}
            {t('keyboard.navigate')}{' '}
            <kbd className="rounded border border-border bg-bg-tint px-1.5 py-0.5 font-sans text-[11px]">
              ↵
            </kbd>{' '}
            {t('keyboard.select')}{' '}
            <kbd className="rounded border border-border bg-bg-tint px-1.5 py-0.5 font-sans text-[11px]">
              Esc
            </kbd>{' '}
            {t('keyboard.close')}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CommandPaletteTrigger({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const t = useTranslations('platform.commandPalette');
  const { setOpen } = useCommandPalette();

  return (
    <button
      type="button"
      onClick={() => {
        setOpen(true);
        onClick?.();
      }}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-button border border-border bg-bg text-muted transition-colors hover:bg-bg-tint hover:text-brand-blue',
        className,
      )}
      aria-label={t('open')}
    >
      <Search className="h-[18px] w-[18px]" strokeWidth={1.75} />
    </button>
  );
}
