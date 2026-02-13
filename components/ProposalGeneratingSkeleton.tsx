'use client';

export function ProposalGeneratingSkeleton() {
  return (
    <div className="bg-[#111111] rounded-xl border border-zinc-800/50 min-h-[500px] shadow-2xl relative overflow-hidden p-12">
      {/* Subtle accent at the top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FFB800]/0 via-[#FFB800]/20 to-[#FFB800]/0 opacity-50" />
      
      <div className="space-y-6">
        {/* Title Line */}
        <div 
          className="h-9 w-3/4 rounded-md bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 animate-pulse"
          style={{ 
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite, pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
        
        {/* Greeting Block */}
        <div 
          className="h-6 w-1/4 rounded-md bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 animate-pulse"
          style={{ 
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite, pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            animationDelay: '0.1s'
          }}
        />
        
        {/* Paragraph Blocks */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div 
                className="h-5 w-full rounded-md bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 animate-pulse"
                style={{ 
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite, pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  animationDelay: `${i * 0.1}s`
                }}
              />
              <div 
                className="h-5 w-full rounded-md bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 animate-pulse"
                style={{ 
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite, pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  animationDelay: `${i * 0.1 + 0.05}s`
                }}
              />
              <div 
                className="h-5 w-4/5 rounded-md bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 animate-pulse"
                style={{ 
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite, pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  animationDelay: `${i * 0.1 + 0.1}s`
                }}
              />
            </div>
          ))}
        </div>
        
        {/* Section Heading */}
        <div 
          className="h-7 w-2/5 rounded-md bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 animate-pulse mt-8"
          style={{ 
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite, pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            animationDelay: '0.5s'
          }}
        />
        
        {/* Bullet Points */}
        <div className="space-y-3 pl-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div 
                className="h-2 w-2 rounded-full bg-neutral-700 mt-2 flex-shrink-0"
                style={{ 
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  animationDelay: `${i * 0.15}s`
                }}
              />
              <div 
                className="h-5 flex-1 rounded-md bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 animate-pulse"
                style={{ 
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite, pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  animationDelay: `${i * 0.15 + 0.05}s`
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
