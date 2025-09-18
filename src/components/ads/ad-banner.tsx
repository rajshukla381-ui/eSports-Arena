
'use client';

import Image from 'next/image';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { Badge } from '../ui/badge';
import Link from 'next/link';

export default function AdBanner() {
  const adImage = placeholderImages.find(p => p.id === 'ad-banner-1');

  if (!adImage) return null;

  return (
    <Link href="#" className="block w-full group">
        <div className="relative rounded-lg overflow-hidden border-2 border-dashed border-muted hover:border-primary transition-all">
            <Image
                src={adImage.imageUrl}
                alt="Advertisement"
                width={400}
                height={200}
                className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={adImage.imageHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
            <Badge variant="secondary" className="absolute top-2 right-2 text-xs">Ad</Badge>
            <div className="absolute bottom-2 left-3">
                 <h4 className="text-lg font-bold text-white drop-shadow-md">AdMob Banner</h4>
                 <p className="text-xs text-white/80 drop-shadow-sm">Your ad could be here!</p>
            </div>
        </div>
    </Link>
  );
}
