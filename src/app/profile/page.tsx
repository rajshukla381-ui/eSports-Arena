
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center text-center">
        <Card className="w-full max-w-lg p-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-glow-primary">
              Become an Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              If you would like to gain admin privileges to host tournaments,
              please send a request to the following email address:
            </p>
            <a
              href="mailto:rajshukla381@gmail.com"
              className="text-lg font-semibold text-accent text-glow-accent hover:underline"
            >
              rajshukla381@gmail.com
            </a>
          </CardContent>
        </Card>
         <Link href="/" passHref className='mt-8'>
            <Button variant="outline">
                Back to Tournaments
            </Button>
         </Link>
      </main>
    </div>
  );
}
