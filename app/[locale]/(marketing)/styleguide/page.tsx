import { notFound } from 'next/navigation';
import { StyleguideContent } from '@/components/styleguide/styleguide-content';

export const metadata = {
  title: 'BIASHARA Styleguide',
  robots: {
    index: false,
    follow: false,
  },
};

export default function StyleguidePage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <StyleguideContent />;
}
