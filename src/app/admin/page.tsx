
'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminPage() {

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-glow-primary">Admin Panel</h1>
                <p className="text-muted-foreground">Manage your eSports Arena</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Tournament Creation</CardTitle>
                    <CardDescription>How users create tournaments.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>
                        Users can now create their own tournaments directly from their profile page.
                    </p>
                    <p>
                        When a user creates a tournament, they are required to pay the full prize pool amount plus a 20% service fee to the main administrator's UPI address.
                    </p>
                    <p>
                        Once the payment is confirmed by the admin, the tournament will become visible to all users.
                    </p>
                     <Link href="/profile" passHref>
                        <Button>Go to Profile to Create</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
