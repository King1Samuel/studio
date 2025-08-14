'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// A simple markdown-to-HTML converter
function markdownToHtml(markdown: string) {
  if (!markdown) return '';

  return markdown
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italics
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    // Lists
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    // Add <ul> around list items
    .replace(/<li>/g, '<ul><li>')
    .replace(/<\/li>\n<ul>/g, '</li><li>')
    .replace(/<\/li>(?!<li>)/g, '</li></ul>')
    // Replace newlines with <br> for paragraph breaks that are not part of other tags
    .replace(/\n/g, '<br />');
}

function RecommendationsContent() {
  const [recommendations, setRecommendations] = useState('');
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsClient(true);
    const data = searchParams.get('data');
    if (data) {
      try {
        const decodedData = atob(decodeURIComponent(data));
        setRecommendations(decodedData);
      } catch (error) {
        console.error("Failed to decode recommendations from URL:", error);
        setRecommendations('');
      }
    }
  }, [searchParams]);

  if (!isClient) {
    // Render nothing or a loading spinner on the server
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>No Recommendations Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>It seems there are no recommendations to display. Please go back and generate them first.</p>
            <Button onClick={() => window.history.back()} className="mt-4">Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold font-headline mb-4">AI Recommendations</h1>
        <p className="text-muted-foreground mb-8">
          Here are personalized suggestions for courses and projects to help you bridge the skill gap for your target job.
        </p>
        <Card>
          <CardContent className="p-6">
            <div
              className="prose prose-blue max-w-none [&_ul]:list-disc [&_ul]:ml-4 [&_a]:text-blue-600 hover:[&_a]:underline"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(recommendations) }}
            />
          </CardContent>
        </Card>
        <div className="mt-8 text-center">
             <Button onClick={() => window.close()}>Close Tab</Button>
        </div>
      </main>
    </div>
  );
}

export default function RecommendationsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RecommendationsContent />
        </Suspense>
    )
}
