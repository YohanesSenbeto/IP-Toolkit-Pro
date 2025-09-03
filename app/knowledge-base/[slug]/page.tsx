'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Video, Calendar, User } from 'lucide-react';
import Link from 'next/link';

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  routerModels: string[];
  videoUrl?: string;
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
}

export default function KnowledgeBaseArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [article, setArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/knowledge-base?slug=${slug}`);
        
        if (!response.ok) {
          throw new Error('Article not found');
        }
        
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Article Not Found</h2>
                <p className="text-gray-600 mb-6">
                  {error || 'The requested article could not be found.'}
                </p>
                <Link href="/knowledge-base">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Knowledge Base
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/knowledge-base">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Base
          </Button>
        </Link>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {article.category}
              </span>
              {article.routerModels.length > 0 && (
                <span className="text-sm text-gray-600">
                  Compatible with: {article.routerModels.join(', ')}
                </span>
              )}
            </div>
            
            <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
              {article.title}
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {article.author.name}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(article.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="prose max-w-none">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
            
            {article.videoUrl && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Video Tutorial</h3>
                <Button 
                  onClick={() => window.open(article.videoUrl, '_blank')}
                  className="w-full sm:w-auto"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Watch Video Tutorial
                </Button>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link href="/knowledge-base">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Knowledge Base
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}