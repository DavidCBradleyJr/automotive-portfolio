import { CldImageWrapper } from '@/components/CldImageWrapper';
import galleryData from '@/data/gallery-images.json';

export default function Home() {
  const testImage = galleryData.images[0];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="font-[family-name:var(--font-orbitron)] text-4xl font-bold tracking-wider text-white">
        David Bradley
      </h1>
      <p className="mt-4 font-[family-name:var(--font-space-grotesk)] text-lg text-gray-400">
        Automotive Photography
      </p>

      {/* Pipeline validation: CldImage with LQIP blur-up */}
      {testImage && (
        <div className="mt-12 w-full max-w-2xl overflow-hidden rounded-lg">
          <CldImageWrapper
            publicId={testImage.publicId}
            width={testImage.width}
            height={testImage.height}
            alt={testImage.alt || 'Gallery test image'}
            lqip={testImage.lqip}
          />
        </div>
      )}

      <p className="mt-8 text-sm text-gray-600">
        v4.0 Foundation -- Pipeline Validation
      </p>
    </main>
  );
}
