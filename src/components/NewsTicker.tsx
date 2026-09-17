import React, { useEffect, useState } from 'react';

export default function NewsTicker() {
  const [headlines, setHeadlines] = useState<string[]>([]);

  useEffect(() => {
    async function fetchNews() {
      try {
        // Fetch top story IDs from Hacker News
        const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const ids = await res.json();
        
        // Fetch details for the top 8 stories
        const topIds = ids.slice(0, 8);
        const storyPromises = topIds.map((id: number) => 
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
        );
        const stories = await Promise.all(storyPromises);
        setHeadlines(stories.map(s => s.title));
      } catch (err) {
        console.error("Failed to fetch news", err);
        setHeadlines([
          "GLOBAL MARKETS RALLY AS TECH STOCKS SURGE",
          "AI STUDIO RELEASES NEW HARDWARE RESEARCH ENVIRONMENT",
          "FACTORY EFFICIENCY REACHES ALL-TIME HIGH OF 94%",
          "QUANTUM COMPUTING BREAKTHROUGH ANNOUNCED IN GENEVA"
        ]);
      }
    }
    fetchNews();
  }, []);

  return (
    <div className="h-8 bg-slate-900 border-t border-slate-800 shrink-0 flex items-center overflow-hidden">
      <div className="bg-red-600 h-full flex items-center px-3 font-bold text-xs uppercase shrink-0 z-10 shadow-[4px_0_10px_rgba(0,0,0,0.5)] tracking-widest text-white">
        LIVE NEWS
      </div>
      <div className="flex-1 overflow-hidden relative h-full">
         <div className="absolute whitespace-nowrap animate-[ticker_30s_linear_infinite] flex items-center h-full text-xs text-slate-300">
           {headlines.map((headline, i) => (
             <React.Fragment key={i}>
               <span className="mx-4 uppercase">{headline}</span>
               <span className="mx-4 text-blue-400">•</span>
             </React.Fragment>
           ))}
           {/* Duplicate for seamless scrolling */}
           {headlines.map((headline, i) => (
             <React.Fragment key={`dup-${i}`}>
               <span className="mx-4 uppercase">{headline}</span>
               <span className="mx-4 text-blue-400">•</span>
             </React.Fragment>
           ))}
         </div>
      </div>
    </div>
  );
}
