
'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md p-6">
          <CardHeader className="items-center">
            <Skeleton className="h-24 w-24 rounded-full" />
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-6 w-64 mx-auto" />
             <Skeleton className="h-10 w-24 mx-auto mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md p-8 text-center">
            <CardTitle className="mb-4">Access Denied</CardTitle>
            <p className="mb-6 text-muted-foreground">You must be logged in to view this page.</p>
            <Button asChild>
                <Link href="/login">Go to Login</Link>
            </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
       <div className="absolute top-4 left-4">
            <Button variant="outline" asChild>
                <Link href="/">Back to Editor</Link>
            </Button>
        </div>
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardHeader className="items-center">
           <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
            <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{user.displayName || 'User Profile'}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <p className="text-lg text-muted-foreground">{user.email}</p>
        </CardContent>
      </Card>
    </div>
  );
}
