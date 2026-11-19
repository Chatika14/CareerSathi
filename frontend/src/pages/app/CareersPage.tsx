import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { CareerPathSummary } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Layers, ArrowRight, Search } from 'lucide-react';

export const CareersPage: React.FC = () => {
  const [careers, setCareers] = useState<CareerPathSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const data = await api.careers.list();
        setCareers(data);
      } catch (err) {
        console.error('Failed to load career paths:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCareers();
  }, []);

  const filtered = careers.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase()) ||
    c.overview.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text">Curated Career Paths</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Industry competency frameworks, learning sequences, and portfolio standards.
          </p>
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
          <Input
            placeholder="Search roles or categories..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LoadingSkeleton className="h-44 w-full" />
          <LoadingSkeleton className="h-44 w-full" />
          <LoadingSkeleton className="h-44 w-full" />
          <LoadingSkeleton className="h-44 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((career) => (
            <Card key={career.id} className="hover:border-primary/40 transition-colors flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="primary" className="text-[10px]">
                    {career.category}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">Curated Framework</Badge>
                </div>
                <CardTitle className="text-base">{career.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {career.overview}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link to={`/app/careers/${career.slug}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View Competencies & Learning Sequence
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
