'use client';

import { useCallback, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface ExportPdfButtonProps {
  klineId: string;
  fileName?: string;
  label?: string;
  className?: string;
}

export function ExportPdfButton({
  klineId,
  fileName = 'astrokline-report',
  label = 'Export PDF',
  className,
}: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/kline/export-pdf?id=${encodeURIComponent(klineId)}`);

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Export failed' }));
        alert(data.error || 'PDF export failed. Please try again.');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [klineId, fileName]);

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      className={
        className ||
        'text-muted-foreground hover:text-foreground hover:border-primary/30 flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2 text-sm transition-all disabled:opacity-50'
      }
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  );
}
