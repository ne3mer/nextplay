import Link from 'next/link';
import Image from 'next/image';
import { SearchBar } from '@/components/filters/SearchBar';
import { CreativeBanner } from '@/components/sections/CreativeBanner';
import { HomeCarousel } from '@/components/sections/HomeCarousel';
import { NewArrivalsSection } from '@/components/sections/NewArrivalsSection';
import { PopularGamesSection } from '@/components/sections/PopularGamesSection';
import { CategoriesSection } from '@/components/sections/CategoriesSection';
import { TrustSection } from '@/components/sections/TrustSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { defaultBannerContent, type BannerContent } from '@/data/marketing';
import { catalogGames } from '@/data/catalog';
import { defaultHomeContent, type HomeContent, type HeroContent, type Spotlight as CMSHighlight } from '@/data/homeContent';
import { formatToman } from '@/lib/format';

import { API_BASE_URL } from '@/lib/api';

type MarketingSnapshot = {
  settings: {
    bannerContent: BannerContent;
  };
};

const fetchMarketingSnapshot = async (): Promise<MarketingSnapshot | null> => {
  try {
    const url = `${API_BASE_URL}/api/marketing`;
    const response = await fetch(url, {
      next: { revalidate: 120 }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to load marketing settings from ${url}:`, response.status, errorText);
      throw new Error(`Failed to load marketing settings: ${response.status}`);
    }
    const payload = await response.json();
    return payload?.data ?? null;
  } catch (error) {
    console.error('Marketing snapshot unavailable:', error);
    return null;
  }
};

const fetchHomeSettings = async (): Promise<HomeContent | null> => {
  try {
    const url = `${API_BASE_URL}/api/home`;
    const response = await fetch(url, {
      next: { revalidate: 120 }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to load home content from ${url}:`, response.status, errorText);
      throw new Error(`Failed to load home content: ${response.status}`);
    }
    const payload = await response.json();
    return payload?.data?.settings ?? null;
  } catch (error) {
    console.error('Home content unavailable:', error);
    return null;
  }
};

const fetchGames = async () => {
  try {
    // Ensure we're using the correct API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
    const url = `${apiUrl}/api/games?limit=12`;
    console.log('🔍 Fetching games from:', url);
    console.log('🔍 API_BASE_URL constant:', API_BASE_URL);
    console.log('🔍 process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    const response = await fetch(url, {
      next: { revalidate: 0 },
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache control for development
      cache: 'no-store'
    });
    console.log('📡 Response status:', response.status, response.statusText);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Failed to load games from ${url}:`, response.status, errorText);
      return [];
    }
    const payload = await response.json();
    console.log('✅ Received games payload:', {
      hasData: !!payload.data,
      dataLength: payload.data?.length || 0,
      firstGame: payload.data?.[0] ? {
        id: payload.data[0].id,
        title: payload.data[0].title,
        slug: payload.data[0].slug
      } : null
    });
    return payload.data || [];
  } catch (error) {
    console.error('❌ Games unavailable:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return [];
  }
};

export default async function HomePage() {
  const [snapshot, homeSettings, games] = await Promise.all([
    fetchMarketingSnapshot(),
    fetchHomeSettings(),
    fetchGames()
  ]);
  console.log('🏠 HomePage rendered with games:', games.length, games);
  const bannerContent = snapshot?.settings?.bannerContent ?? defaultBannerContent;
  const homeContent: HomeContent = homeSettings ? { ...defaultHomeContent, ...homeSettings } : defaultHomeContent;

  // Debug: Show what we received (remove this after debugging)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Debug - Games data:', JSON.stringify(games, null, 2));
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950/90 via-slate-50 to-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 md:px-8">
        {/* Debug info - remove after fixing */}
        {process.env.NODE_ENV === 'development' && (
          <div className="rounded-lg bg-yellow-100 p-4 text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>Games fetched: {games.length}</p>
            <p>API URL: {API_BASE_URL}</p>
            <p>First game: {games[0]?.title || 'None'}</p>
            <p>First game has coverUrl: {games[0]?.coverUrl ? 'Yes' : 'No'}</p>
            <p>First game basePrice: {games[0]?.basePrice || 'N/A'}</p>
            <details className="mt-2">
              <summary className="cursor-pointer font-bold">View all games data</summary>
              <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(games, null, 2)}</pre>
            </details>
          </div>
        )}
        <HeroShowcase hero={homeContent.hero} />
        <HomeCarousel slides={homeContent.carouselSlides} />
        <SearchBar />
        <SpotlightTiles highlights={homeContent.spotlights} />
        <ProductShowcase games={games} />
        <CreativeBanner content={bannerContent} />
        <NewArrivalsSection />
        <PopularGamesSection />
        <CategoriesSection />
        <TrustSection signals={homeContent.trustSignals} />
        <TestimonialsSection testimonials={homeContent.testimonials} />
        <SiteFooter />
      </div>
    </div>
  );
}

const HeroShowcase = ({ hero }: { hero: HeroContent }) => {
  return (
    <section className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-700 px-8 py-12 text-white shadow-2xl">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -right-24 top-10 h-56 w-56 rounded-full bg-emerald-400 blur-3xl" />
        <div className="absolute left-12 -bottom-16 h-48 w-48 rounded-full bg-blue-400 blur-3xl" />
      </div>
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          <span className="rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            {hero.badge}
          </span>
          <h1 className="text-4xl font-black leading-tight md:text-5xl">{hero.title}</h1>
          <p className="text-base text-slate-100 md:text-lg">{hero.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={hero.primaryCta.href} className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-900">
              {hero.primaryCta.label}
            </Link>
            <Link href={hero.secondaryCta.href} className="rounded-2xl border border-white/40 px-6 py-3 text-sm font-bold text-white">
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>
        <div className="grid gap-4 rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <p className="text-sm text-emerald-100">آمار نمایش داده شده</p>
          <div className="grid grid-cols-2 gap-4">
            {hero.stats.map((stat) => (
              <div key={stat.id} className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <p className="text-xs text-emerald-200">{stat.label}</p>
                <p className="text-xl font-black">{stat.value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-emerald-100">تمامی متن‌ها را از پنل مدیریت Landing تغییر دهید.</p>
        </div>
      </div>
    </section>
  );
};

const SpotlightTiles = ({ highlights }: { highlights: CMSHighlight[] }) => {
  if (!highlights.length) return null;
  const accentClass = (accent: string) => {
    switch (accent) {
      case 'emerald':
        return 'from-emerald-50/80 to-white border-emerald-100';
      case 'indigo':
        return 'from-indigo-50/80 to-white border-indigo-100';
      case 'slate':
      default:
        return 'from-slate-50/80 to-white border-slate-100';
    }
  };

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {highlights.map((block) => (
        <article
          key={block.id}
          className={`group relative overflow-hidden rounded-3xl border bg-white p-5 shadow-[0_15px_40px_rgba(15,23,42,0.08)] ${accentClass(block.accent)}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent opacity-0 transition group-hover:opacity-100" />
          <div className="relative space-y-3">
            <h3 className="text-lg font-bold text-slate-900">{block.title}</h3>
            <p className="text-sm text-slate-500">{block.description}</p>
            <Link href={block.href} className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600">
              مشاهده
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
};

const ProductShowcase = ({ games }: { games: any[] }) => {
  console.log('🎮 ProductShowcase received games:', games.length, games);
  // Show all games if available, otherwise fallback to catalog
  const spotlight = games.length > 0 ? games : catalogGames.slice(0, 3);
  console.log('✨ Spotlight games:', spotlight.length, spotlight.map(g => ({ 
    id: g?.id, 
    title: g?.title,
    hasCoverUrl: !!g?.coverUrl,
    hasCover: !!g?.cover,
    basePrice: g?.basePrice,
    price: g?.price
  })));
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-emerald-600">انتخاب GameClub</p>
          <h2 className="text-2xl font-bold text-slate-900">ویترین محصولات</h2>
        </div>
        <Link href="/games" className="text-sm font-bold text-emerald-600">
          مرور همه بازی‌ها
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {spotlight.length > 0 ? spotlight.map((game) => {
          if (!game || !game.id) {
            console.warn('Invalid game object:', game);
            return null;
          }
          return (
            <article
              key={game.id}
              className="group relative overflow-hidden rounded-[32px] border border-slate-100 bg-white p-5 shadow-lg transition hover:-translate-y-1"
            >
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-900/90 to-transparent opacity-70" />
              <div className="relative">
                <div className="relative h-56 w-full overflow-hidden rounded-2xl">
                  <Image
                    src={game.coverUrl || game.cover || 'https://images.igdb.com/igdb/image/upload/t_cover_big/nocover.webp'}
                    alt={game.title || 'Game'}
                    fill
                    sizes="(max-width: 768px) 90vw, 300px"
                    className="object-cover"
                  />
                  <div className="absolute left-3 top-3 flex gap-2 text-xs font-bold">
                    <span className="rounded-full bg-slate-900/70 px-3 py-1 text-white">{game.platform || 'PS5'}</span>
                    <span className="rounded-full bg-white/80 px-3 py-1 text-slate-900">{game.regionOptions?.[0] || game.region || 'R2'}</span>
                  </div>
                  {(game.safeAccountAvailable ?? game.isSafe) && (
                    <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                      Safe
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">{game.title || 'Untitled Game'}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">{formatToman(game.basePrice || game.price || 0)}</span>
                    <span className="text-xs text-slate-500">تومان</span>
                  </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full border border-slate-200 px-3 py-1">تحویل فوری</span>
                  <span className="rounded-full border border-slate-200 px-3 py-1">پشتیبانی آنلاین</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Link
                    href={`/games/${game.slug ?? game.id}`}
                    className="flex-1 rounded-2xl bg-slate-900 py-3 text-center text-sm font-bold text-white shadow hover:bg-slate-800"
                  >
                    مشاهده جزییات
                  </Link>
                  <Link href="/checkout" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
                    خرید سریع
                  </Link>
                </div>
              </div>
            </div>
          </article>
          );
        }).filter(Boolean) : (
          <div className="col-span-3 text-center py-8 text-slate-500">
            No games available
          </div>
        )}
      </div>
    </section>
  );
};
