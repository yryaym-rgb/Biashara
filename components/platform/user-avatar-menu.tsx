'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { companyInitials } from '@/lib/utils/avatar';
import { cn } from '@/lib/utils/cn';

export interface UserAvatarMenuProps {
  companyName: string | null;
  email: string | null;
  onLogoutRequest: () => void;
}

export function UserAvatarMenu({ companyName, email, onLogoutRequest }: UserAvatarMenuProps) {
  const t = useTranslations('platform.shell');
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const initials = companyInitials(companyName, email);

  const menuItems = React.useMemo(
    () => [
      { id: 'profile', label: t('profile'), action: () => router.push('/settings') },
      { id: 'dashboard', label: t('dashboard'), action: () => router.push('/dashboard') },
      { id: 'logout', label: t('logout'), action: () => onLogoutRequest() },
    ],
    [t, router, onLogoutRequest],
  );

  React.useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
        setFocusedIndex(-1);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  function handleMenuKeyDown(event: React.KeyboardEvent) {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex((index) => {
          const next = index < menuItems.length - 1 ? index + 1 : 0;
          itemRefs.current[next]?.focus();
          return next;
        });
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex((index) => {
          const next = index > 0 ? index - 1 : menuItems.length - 1;
          itemRefs.current[next]?.focus();
          return next;
        });
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        itemRefs.current[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        const last = menuItems.length - 1;
        setFocusedIndex(last);
        itemRefs.current[last]?.focus();
        break;
      default:
        break;
    }
  }

  function handleItemSelect(index: number) {
    const item = menuItems[index];
    if (!item) return;
    item.action();
    setOpen(false);
    setFocusedIndex(-1);
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-tint text-[14px] font-semibold text-brand-blue hover:bg-border motion-safe:transition-colors motion-safe:duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        aria-label={t('userMenu')}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => {
          setOpen((current) => !current);
          if (!open) {
            setFocusedIndex(0);
            requestAnimationFrame(() => itemRefs.current[0]?.focus());
          }
        }}
        onKeyDown={handleMenuKeyDown}
      >
        {initials}
      </button>

      {open ? (
        <div
          ref={panelRef}
          className="absolute right-0 top-[calc(100%+8px)] z-[80] min-w-[200px] w-max max-w-[calc(100vw-32px)] overflow-hidden rounded-card border border-border bg-bg shadow-[0_8px_24px_rgba(14,42,71,0.10)]"
          role="menu"
          aria-label={t('userMenu')}
          onKeyDown={handleMenuKeyDown}
        >
          {email ? (
            <div className="border-b border-border px-4 py-3">
              <p className="truncate text-[13px] text-muted">{email}</p>
            </div>
          ) : null}
          <ul className="py-1">
            {menuItems.map((item, index) => (
              <li key={item.id}>
                {index > 0 ? (
                  <div className="mx-3 border-t border-border" role="separator" />
                ) : null}
                <button
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  type="button"
                  role="menuitem"
                  className={cn(
                    'flex w-full whitespace-nowrap px-4 py-3 text-left text-[14px] font-medium text-ink hover:bg-bg-tint motion-safe:transition-colors motion-safe:duration-150',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]',
                    item.id === 'logout' && 'text-body',
                  )}
                  onClick={() => handleItemSelect(index)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
