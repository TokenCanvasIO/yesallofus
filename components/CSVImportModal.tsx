'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: Record<string, string>[]) => Promise<{ success: number; failed: number; errors: string[] }>;
  templateColumns: string[];
  requiredColumns: string[];
  templateName: string;
}

interface ParsedRow {
  data: Record<string, string>;
  errors: string[];
  rowIndex: number;
}

export default function CSVImportModal({
  isOpen,
  onClose,
  onImport,
  templateColumns,
  requiredColumns,
  templateName
}: CSVImportModalProps) {
  // All hooks must be called before any conditional returns
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // Early return after all hooks
  if (!isOpen) return null;

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setParseErrors([]);
    setResult(null);
    setProgress(0);
  };

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setParseErrors(['Please select a CSV file']);
      return;
    }

    setFile(selectedFile);
    setParseErrors([]);
    setParsedData([]);
    setResult(null);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        const errors: string[] = [];

        // Check for required columns
        const headers = results.meta.fields || [];
        const normalizedRequired = requiredColumns.map(c => c.toLowerCase());
        const missingColumns = normalizedRequired.filter(col => !headers.includes(col));

        if (missingColumns.length > 0) {
          errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
        }

        // Parse errors from Papa Parse
        if (results.errors.length > 0) {
          results.errors.slice(0, 5).forEach(err => {
            errors.push(`Row ${(err.row || 0) + 2}: ${err.message}`);
          });
        }

        if (errors.length > 0) {
          setParseErrors(errors);
          return;
        }

        // Validate each row
        const parsed: ParsedRow[] = (results.data as Record<string, string>[]).map((row, index) => {
          const rowErrors: string[] = [];

          // Validate required fields
          normalizedRequired.forEach(col => {
            if (!row[col] || row[col].trim() === '') {
              rowErrors.push(`${col} is required`);
            }
          });

          // Validate price if present
          if (row.price !== undefined) {
            const price = parseFloat(row.price);
            if (isNaN(price) || price < 0) {
              rowErrors.push('price must be a valid positive number');
            }
          }

          // Validate quantity if present
          if (row.quantity !== undefined && row.quantity !== '') {
            const qty = parseInt(row.quantity);
            if (isNaN(qty) || qty < 0) {
              rowErrors.push('quantity must be a non-negative integer');
            }
          }

          return {
            data: row,
            errors: rowErrors,
            rowIndex: index + 2 // +2 for header row and 0-index
          };
        });

        setParsedData(parsed);
      },
      error: (error) => {
        setParseErrors([`Failed to parse CSV: ${error.message}`]);
      }
    });
  };

  // Handle file drop - wrapper that calls handleFile
  const onFileDrop = (e: React.DragEvent) => {
    handleDrop(e);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleImport = async () => {
    const validRows = parsedData.filter(row => row.errors.length === 0);
    if (validRows.length === 0) return;

    setImporting(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90));
      }, 200);

      const importResult = await onImport(validRows.map(r => r.data));

      clearInterval(progressInterval);
      setProgress(100);
      setResult(importResult);
    } catch (err: any) {
      setResult({
        success: 0,
        failed: validRows.length,
        errors: [err.message || 'Import failed']
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = Papa.unparse({
      fields: templateColumns,
      data: [
        // Example row
        templateColumns.reduce((acc, col) => {
          if (col === 'name') acc[col] = 'Example Product';
          else if (col === 'price') acc[col] = '9.99';
          else if (col === 'category') acc[col] = 'Category';
          else if (col === 'barcode') acc[col] = '5901234123457';
          else if (col === 'sku') acc[col] = 'SKU001';
          else if (col === 'quantity') acc[col] = '100';
          else if (col === 'low_stock_threshold') acc[col] = '10';
          else acc[col] = '';
          return acc;
        }, {} as Record<string, string>)
      ]
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedData.filter(r => r.errors.length === 0).length;
  const invalidCount = parsedData.filter(r => r.errors.length > 0).length;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Import {templateName}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Template download */}
          <div className="mb-6">
            <button
              onClick={downloadTemplate}
              className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-2 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download CSV Template
            </button>
            <p className="text-zinc-500 text-xs mt-1">
              Required columns: {requiredColumns.join(', ')}
            </p>
          </div>

          {/* Drop zone */}
          {!file && !result && (
            <div
              onDrop={onFileDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <svg className="w-12 h-12 text-zinc-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-zinc-400 mb-2">Drag and drop your CSV file here</p>
              <p className="text-zinc-500 text-sm mb-4">or</p>
              <label className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg cursor-pointer transition">
                Browse Files
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* File selected indicator */}
          {file && !result && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-zinc-800 rounded-lg">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-white flex-1 truncate">{file.name}</span>
              <button
                onClick={resetState}
                className="text-zinc-400 hover:text-white transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Parse errors */}
          {parseErrors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-red-400 font-medium mb-2">Errors found:</p>
              <ul className="text-sm text-red-300 space-y-1">
                {parseErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {parsedData.length > 0 && !result && (
            <div>
              {/* Summary */}
              <div className="flex gap-4 mb-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2">
                  <span className="text-emerald-400 font-bold">{validCount}</span>
                  <span className="text-zinc-400 text-sm ml-2">valid rows</span>
                </div>
                {invalidCount > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                    <span className="text-red-400 font-bold">{invalidCount}</span>
                    <span className="text-zinc-400 text-sm ml-2">invalid rows</span>
                  </div>
                )}
              </div>

              {/* Preview table */}
              <div className="border border-zinc-800 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-zinc-400 w-12">Row</th>
                      <th className="px-3 py-2 text-left text-zinc-400">Name</th>
                      <th className="px-3 py-2 text-left text-zinc-400">Price</th>
                      <th className="px-3 py-2 text-left text-zinc-400">Category</th>
                      <th className="px-3 py-2 text-left text-zinc-400 w-20">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 50).map((row) => (
                      <tr key={row.rowIndex} className="border-t border-zinc-800">
                        <td className="px-3 py-2 text-zinc-500">{row.rowIndex}</td>
                        <td className="px-3 py-2 text-white truncate max-w-[150px]">
                          {row.data.name || '-'}
                        </td>
                        <td className="px-3 py-2 text-white">
                          {row.data.price ? `£${parseFloat(row.data.price).toFixed(2)}` : '-'}
                        </td>
                        <td className="px-3 py-2 text-zinc-400 truncate max-w-[100px]">
                          {row.data.category || '-'}
                        </td>
                        <td className="px-3 py-2">
                          {row.errors.length === 0 ? (
                            <span className="text-emerald-400 text-xs">Valid</span>
                          ) : (
                            <span
                              className="text-red-400 text-xs cursor-help"
                              title={row.errors.join(', ')}
                            >
                              Invalid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 50 && (
                  <div className="p-3 text-center text-zinc-500 text-sm bg-zinc-800/50">
                    Showing first 50 of {parsedData.length} rows
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress */}
          {importing && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Importing products...</span>
                <span className="text-white">{progress}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mt-4">
              <div className={`rounded-lg p-4 ${
                result.failed === 0
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : 'bg-amber-500/10 border border-amber-500/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {result.failed === 0 ? (
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  <p className={`font-medium ${result.failed === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    Import Complete
                  </p>
                </div>
                <p className="text-sm text-zinc-400">
                  {result.success} product{result.success !== 1 ? 's' : ''} imported successfully
                  {result.failed > 0 && `, ${result.failed} failed`}
                </p>
                {result.errors.length > 0 && (
                  <ul className="mt-3 text-sm text-red-400 space-y-1 max-h-32 overflow-y-auto">
                    {result.errors.slice(0, 10).map((err: any, i: number) => (
                      <li key={i} className="truncate">
                        {typeof err === 'object' && err !== null
                          ? `Row ${err.row}${err.name ? `: ${err.name}` : ''} — ${err.reason}`
                          : String(err)}
                      </li>
                    ))}
                    {result.errors.length > 10 && (
                      <li className="text-zinc-500">...and {result.errors.length - 10} more errors</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 flex gap-3">
          {!result ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={validCount === 0 || importing}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition"
              >
                {importing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Importing...
                  </span>
                ) : (
                  `Import ${validCount} Product${validCount !== 1 ? 's' : ''}`
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  resetState();
                }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl transition"
              >
                Import More
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
