'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';

export default function BackButton({ href = '/' }: { href?: string }) {
  return (
    <Link href={href}>
      <Button variant="ghost" size="sm">
        ← Back
      </Button>
    </Link>
  );
}
