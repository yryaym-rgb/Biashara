'use client';

import * as React from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Plus, Trash2 } from 'lucide-react';
import { saveCooperativeSitesAction } from '@/actions/lots';
import { DRC_PROVINCES } from '@/lib/constants/provinces';
import { cooperativeSitesFormSchema } from '@/lib/validators/lot';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/input';
import type { CooperativeSiteRow } from '@/lib/platform/lots.types';

interface SiteDraft {
  id: string;
  siteName: string;
  zeaReference: string;
  province: string;
}

export interface CooperativeSitesFormProps {
  initialSites: CooperativeSiteRow[];
}

function toDraft(site: CooperativeSiteRow): SiteDraft {
  return {
    id: site.id,
    siteName: site.site_name,
    zeaReference: site.zea_reference,
    province: site.province,
  };
}

/** Stable sentinel for the first empty draft row — must match on server and client. */
const INITIAL_EMPTY_SITE_ID = '__new_site__';

function createEmptySite(id: string = INITIAL_EMPTY_SITE_ID): SiteDraft {
  return {
    id,
    siteName: '',
    zeaReference: '',
    province: '',
  };
}

export function CooperativeSitesForm({ initialSites }: CooperativeSitesFormProps) {
  const t = useTranslations('platform.settings.cooperativeSites');
  const tValidation = useTranslations('validation');
  const router = useRouter();
  const baseSiteId = React.useId();
  const nextSiteKeyRef = React.useRef(0);

  const [sites, setSites] = React.useState<SiteDraft[]>(() =>
    initialSites.length > 0 ? initialSites.map(toDraft) : [createEmptySite()],
  );
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const provinceOptions = DRC_PROVINCES.map((province) => ({
    value: province,
    label: province,
  }));

  function updateSite(id: string, patch: Partial<SiteDraft>) {
    setSites((current) =>
      current.map((site) => (site.id === id ? { ...site, ...patch } : site)),
    );
  }

  function removeSite(id: string) {
    setSites((current) => (current.length <= 1 ? current : current.filter((site) => site.id !== id)));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccess(null);
    setFieldErrors({});

    const parsed = cooperativeSitesFormSchema.safeParse({
      sites: sites.map((site) => ({
        siteName: site.siteName,
        zeaReference: site.zeaReference,
        province: site.province,
      })),
    });

    if (!parsed.success) {
      setFormError(tValidation('required'));
      return;
    }

    setLoading(true);
    try {
      const result = await saveCooperativeSitesAction(parsed.data);
      if (result.error) {
        setFormError(result.error === 'forbidden' ? t('forbidden') : t('error'));
        return;
      }

      setSuccess(t('success'));
      router.refresh();
    } catch {
      setFormError(t('error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-[15px] text-body">{t('description')}</p>

        {formError ? (
          <p className="text-[13px] text-danger" role="alert">
            {formError}
          </p>
        ) : null}
        {success ? (
          <p className="text-[13px] text-success" role="status">
            {success}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          {sites.map((site, index) => (
            <div
              key={site.id}
              className="space-y-4 rounded-card border border-border p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[15px] font-semibold text-ink">
                  {t('siteLabel', { index: index + 1 })}
                </h3>
                {sites.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSite(site.id)}
                    aria-label={t('removeSite')}
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  </Button>
                ) : null}
              </div>

              <Input
                label={t('siteName')}
                value={site.siteName}
                onChange={(event) => updateSite(site.id, { siteName: event.target.value })}
                error={fieldErrors[`sites.${index}.siteName`]}
                required
                disabled={loading}
              />
              <Input
                label={t('zeaReference')}
                value={site.zeaReference}
                onChange={(event) => updateSite(site.id, { zeaReference: event.target.value })}
                hint={t('zeaHint')}
                error={fieldErrors[`sites.${index}.zeaReference`]}
                required
                disabled={loading}
              />
              <Select
                label={t('province')}
                value={site.province}
                onChange={(event) => updateSite(site.id, { province: event.target.value })}
                options={provinceOptions}
                placeholder={t('province')}
                error={fieldErrors[`sites.${index}.province`]}
                required
                disabled={loading}
              />
            </div>
          ))}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                nextSiteKeyRef.current += 1;
                const siteId = `${baseSiteId}-${nextSiteKeyRef.current}`;
                setSites((current) => [...current, createEmptySite(siteId)]);
              }}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              {t('addSite')}
            </Button>
            <Button type="submit" loading={loading} disabled={loading} className="w-full sm:w-auto">
              {t('submit')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
