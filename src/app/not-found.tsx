'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@system/design-ui';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">404 - Không tìm thấy trang</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Trang bạn đang truy cập không tồn tại hoặc đã được chuyển sang đường dẫn khác.
      </p>
      <Button asChild className="mt-6 rounded-full px-6">
        <Link href="/">Quay về trang chủ</Link>
      </Button>
    </div>
  );
}
