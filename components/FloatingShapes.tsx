import React from 'react';
import Image from 'next/image';

export const FloatingShapes: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Floral corner — top left */}
      <div className="absolute -top-6 -left-6 w-48 sm:w-64 md:w-80 opacity-80">
        <Image src="/images/floral-corner.png" alt="" width={400} height={400} priority />
      </div>

      {/* Floral corner — bottom right (rotated) */}
      <div className="absolute -bottom-10 -right-10 w-48 sm:w-64 md:w-80 opacity-70 rotate-180">
        <Image src="/images/floral-corner.png" alt="" width={400} height={400} />
      </div>

      {/* Butterflies fluttering */}
      <div className="absolute top-[20%] right-[8%] w-16 sm:w-20 animate-flutter opacity-80">
        <Image src="/images/butterfly-1.png" alt="" width={120} height={120} />
      </div>
      <div className="absolute top-[55%] left-[6%] w-14 sm:w-16 animate-flutter opacity-75" style={{ animationDelay: '1.2s' }}>
        <Image src="/images/butterfly-2.png" alt="" width={120} height={120} />
      </div>
      <div className="hidden md:block absolute top-[75%] right-[12%] w-12 animate-flutter opacity-60" style={{ animationDelay: '2s' }}>
        <Image src="/images/butterfly-1.png" alt="" width={120} height={120} />
      </div>
    </div>
  );
};
