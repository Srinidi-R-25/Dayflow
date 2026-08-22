'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { FileText, Download, Upload, Search, Filter } from 'lucide-react';

export default function DocumentsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  if (!user) return null;

  const docs = api.getDocuments(user.employeeId);
  const filtered = docs.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Document Center</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Access contracts, tax declarations, and official company files
          </p>
        </div>

        <Button className="gap-2 shadow-md shadow-indigo-600/20">
          <Upload className="h-4 w-4" /> Upload Document
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>My Employee Records</CardTitle>
            <CardDescription>Secure cloud-stored documents</CardDescription>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 dark:bg-indigo-950 dark:text-indigo-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">{doc.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {doc.category} • Uploaded {formatDate(doc.uploadDate)} • {doc.size}
                    </p>
                  </div>
                </div>

                <Button size="sm" variant="outline" className="gap-1 text-xs shrink-0">
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
