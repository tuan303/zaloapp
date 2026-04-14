/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Bell,
  Lightbulb,
  CalendarDays,
  ClipboardCheck,
  BookOpen,
  Clock,
  Home,
  BookMarked,
  Wallet,
  MessageCircleQuestion,
  UserCircle,
  Search,
  X,
  Cloud,
  CloudRain,
  Sun,
  CloudLightning,
} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {type ReactNode, useEffect, useMemo, useState} from 'react';
import {openOutApp, openWebview} from 'zmp-sdk/apis';

type NewsItem = {
  id: string;
  title: string;
  date: string;
  publishedAt?: string;
  tag: string;
  img: string;
  url: string;
  desc: string;
  views: number;
};

type ArticleDetail = {
  title: string;
  date: string;
  publishedAt?: string;
  tag: string;
  img: string;
  url: string;
  html: string;
  desc: string;
};

type ViewerState =
  | {
      type: 'web';
      url: string;
      title: string;
    }
  | {
      type: 'news';
      item: NewsItem;
    }
  | null;

type NavigationMode = 'oaChat' | 'outApp' | 'webview' | 'sameWindow';

type QuickAction = {
  icon: ReactNode;
  title: string;
  desc: string;
  color: string;
  url: string;
  navigationMode: NavigationMode;
  fallbackMode?: Exclude<NavigationMode, 'oaChat'>;
};

type BottomNavAction = {
  icon: ReactNode;
  label: string;
  url?: string;
  navigationMode?: 'oaLink' | 'webview';
};

const DEFAULT_REMOTE_API_BASE = 'https://zaloapp-snowy.vercel.app';
const TEACHER_PORTAL_URL = 'https://erp-coral-rho.vercel.app/';
const FANPAGE_URL = 'https://www.facebook.com/ngoisaohoangmai';
const FANPAGE_EMBED_URL = `https://www.facebook.com/plugins/page.php?${new URLSearchParams({
  href: FANPAGE_URL,
  tabs: 'timeline',
  width: '500',
  height: '980',
  small_header: 'false',
  adapt_container_width: 'true',
  hide_cover: 'false',
  show_facepile: 'false',
  lazy: 'true',
}).toString()}`;

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? ''
    : DEFAULT_REMOTE_API_BASE);

const NEWS_API_URL = `${API_BASE_URL}/api/news`;
const NEWS_ARTICLE_API_URL = `${API_BASE_URL}/api/news/article`;
const FACEBOOK_POSTS_API_URL = `${API_BASE_URL}/api/facebook-posts`;
const NEWS_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

const FALLBACK_NEWS: NewsItem[] = [
  {
    id: 'fallback-1',
    title: 'Workshop đồng hành cùng học sinh trong giai đoạn phát triển',
    date: '07/04/2026',
    publishedAt: '2026-04-07T09:00:00+07:00',
    tag: 'Workshop',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmp0pra8FgPwn4a7TknxlEhMPqdIav7XOZBNgzGB3w2P4Og88NDdDNeL3e52jxPL1Q6-GRSYBkRRSWpCfytLFql3wHU28k9RjYAkF9vaXyodH_ZykLJQjHh_KP4nOVLEUzEJR9MqDZziu85tNthaJf4ENNeaaJRxKjILlWm7YyT0r2EMxUHqf395_kzg6xOnSNDY08aT5iE9NJ-Rd1INex8y6mMTzpo-D6l1ZtReCB4-iHmoTpYNj_4_Yvik13XxgJNkh2VLiLFtOk',
    url: 'https://hoangmaistarschool.edu.vn/blog',
    desc: 'Bản dự phòng được dùng khi nguồn dữ liệu trực tiếp chưa phản hồi.',
    views: 185,
  },
  {
    id: 'fallback-2',
    title: 'EduTalk xây dựng lộ trình học tập vững chắc cho học sinh',
    date: '30/03/2026',
    publishedAt: '2026-03-30T09:00:00+07:00',
    tag: 'EduTalk',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1x6Q9nJ60TDpqukl98Dduj-kmMEzwN8MACsiv8UiqBUQ-QcUbJ3NgS9o0mCefUIfj-5dTuqsVnfTI3WtryMG3JNZ6vxW4JlpX2z66urE9Ja1W-rOpcmfBFVHMO33TQmy7slqu8NJ0MB0zal46J36fMrIR0-Bt_f061ZcYGOUw3Y4pXqCXwi0P_2SAD9UiuZnPqV2saUi3e9Ga2IwUUIAncu2DcXx2JJc6x3bC3Qx0FvsHumDeNdVzRWJGjhCqMxOhWSVArqD8PvEO',
    url: 'https://hoangmaistarschool.edu.vn/blog',
    desc: 'App sẽ tự cập nhật lại khi endpoint tin tức hoạt động bình thường.',
    views: 116,
  },
];

const dateSortValue = (item: Pick<NewsItem, 'publishedAt' | 'date'>) => {
  if (item.publishedAt) {
    const parsed = Date.parse(item.publishedAt);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  const match = item.date.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) {
    return 0;
  }

  const [, day, month, year] = match;
  return Date.parse(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00+07:00`);
};

const sortNewsItems = (items: NewsItem[]) =>
  [...items].sort((a, b) => dateSortValue(b) - dateSortValue(a));

const WeatherWidget = () => {
  const [weather, setWeather] = useState<{temp: number; code: number} | null>(null);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const now = new Date();
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    setDateStr(`${days[now.getDay()]}, ${now.getDate()}/${now.getMonth() + 1}`);

    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=21.0285&longitude=105.8542&current=temperature_2m,weather_code&timezone=Asia%2FBangkok',
        );
        const data = await response.json();
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          code: data.current.weather_code,
        });
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    };

    fetchWeather();
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code <= 3) return <Sun size={14} className="text-amber-500" />;
    if (code <= 48) return <Cloud size={14} className="text-slate-400" />;
    if (code <= 67 || code >= 80) return <CloudRain size={14} className="text-blue-400" />;
    if (code >= 95) return <CloudLightning size={14} className="text-purple-500" />;
    return <Cloud size={14} className="text-slate-400" />;
  };

  return (
    <motion.div
      initial={{opacity: 0, x: 10}}
      animate={{opacity: 1, x: 0}}
      className="flex flex-col items-end text-right"
    >
      <div className="flex items-center gap-1.5 rounded-full border border-slate-100 bg-white px-2.5 py-1 shadow-sm">
        {weather ? (
          getWeatherIcon(weather.code)
        ) : (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-slate-400" />
        )}
        <span className="text-xs font-bold text-slate-700">
          {weather ? `${weather.temp}°C` : '--°C'}
        </span>
      </div>
      <span className="mr-1 mt-1 text-[10px] font-medium text-slate-400">{dateStr}</span>
    </motion.div>
  );
};

const Header = () => (
  <header className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/80 pt-safe shadow-sm backdrop-blur-xl">
    <div className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between pl-[5px] pr-5">
      <div className="flex items-center">
        <img
          src="https://hoangmaistarschool.edu.vn/thongtin/logo.svg"
          alt="Ngôi Sao Hoàng Mai"
          className="h-[46px] object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex items-center gap-1">
        <motion.button
          whileTap={{scale: 0.9}}
          className="p-2 text-slate-400 transition-colors hover:text-primary-container"
        >
          <Search size={20} />
        </motion.button>
        <motion.button
          whileTap={{scale: 0.9}}
          className="relative p-2 text-slate-400 transition-colors hover:text-primary-container"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
        </motion.button>
      </div>
    </div>
  </header>
);

const HeroSlider = ({onSlideClick}: {onSlideClick: (url: string) => void}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = [
    {img: 'https://hoangmaistarschool.edu.vn/thongtin/k1.jpg', link: 'https://tuyensinh.nshn-hm.edu.vn/lop-1'},
    {img: 'https://hoangmaistarschool.edu.vn/thongtin/k6.jpg', link: 'https://tuyensinh.nshn-hm.edu.vn/lop-6'},
    {img: 'https://hoangmaistarschool.edu.vn/thongtin/k10.jpg', link: 'https://tuyensinh.nshn-hm.edu.vn/lop-10'},
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative mt-2 h-48 w-full overflow-hidden shadow-sm">
      {slides.map((slide, index) => (
        <div
          key={slide.link}
          className={`absolute inset-0 cursor-pointer transition-opacity duration-1000 ${
            index === currentIndex ? 'z-10 opacity-100' : 'z-0 opacity-0'
          }`}
          onClick={() => onSlideClick(slide.link)}
        >
          <img src={slide.img} alt={`Slide ${index + 1}`} className="h-full w-full object-cover" />
        </div>
      ))}
      <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
        {slides.map((slide, index) => (
          <div
            key={slide.link}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

const CategoryTabs = ({
  activeTab,
  onTabChange,
  onTeacherPortalClick,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onTeacherPortalClick: () => void;
}) => {
  const tabs = ['Phụ huynh', 'Học sinh', 'Giáo viên'];

  const handleTabClick = (tab: string) => {
    onTabChange(tab);
    if (tab === 'Giáo viên') {
      onTeacherPortalClick();
    }
  };

  return (
    <nav className="mx-5 mb-4 mt-4 flex rounded-2xl border border-slate-200/50 bg-slate-100/50 p-1.5">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={`relative flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${
            activeTab === tab
              ? 'bg-white text-primary-container shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
};

const ActionGrid = ({
  activeTab,
  onActionClick,
}: {
  activeTab: string;
  onActionClick: (action: QuickAction) => void;
}) => {
  const parentActions: QuickAction[] = [
    {
      icon: <Lightbulb size={22} />,
      title: 'Tư vấn',
      desc: 'Tuyển sinh 2026 - 2027',
      color: 'bg-rose-50 text-rose-600',
      url: 'https://zalo.me/ngoisaohoangmai',
      navigationMode: 'oaChat',
      fallbackMode: 'webview',
    },
    {
      icon: <CalendarDays size={22} />,
      title: 'Estore',
      desc: 'Mua đồng phục',
      color: 'bg-amber-50 text-amber-600',
      url: 'https://estore.nshm.vn/',
      navigationMode: 'webview',
    },
    {
      icon: <ClipboardCheck size={22} />,
      title: 'Canvas LMS',
      desc: 'Theo dõi học tập',
      color: 'bg-indigo-50 text-indigo-600',
      url: 'https://4015.instructure.com/login/canvas',
      navigationMode: 'outApp',
      fallbackMode: 'webview',
    },
    {
      icon: <BookOpen size={22} />,
      title: 'School Online',
      desc: 'Quản lý thông tin học sinh',
      color: 'bg-emerald-50 text-emerald-600',
      url: 'https://so.nshn-hm.edu.vn/login',
      navigationMode: 'outApp',
      fallbackMode: 'webview',
    },
  ];

  const studentActions: QuickAction[] = [
    {
      icon: <ClipboardCheck size={22} />,
      title: 'Canvas LMS',
      desc: 'Hệ thống học tập',
      color: 'bg-indigo-50 text-indigo-600',
      url: 'https://4015.instructure.com/login/canvas',
      navigationMode: 'outApp',
      fallbackMode: 'webview',
    },
    {
      icon: <BookOpen size={22} />,
      title: 'Nội quy - Quy chế',
      desc: 'Nội quy nhà trường',
      color: 'bg-rose-50 text-rose-600',
      url: '#',
      navigationMode: 'sameWindow',
    },
    {
      icon: <MessageCircleQuestion size={22} />,
      title: 'Tâm lý học đường',
      desc: 'Tư vấn tâm lý học đường',
      color: 'bg-amber-50 text-amber-600',
      url: '#',
      navigationMode: 'sameWindow',
    },
    {
      icon: <Bell size={22} />,
      title: 'Thông báo',
      desc: 'Thông báo nhà trường',
      color: 'bg-emerald-50 text-emerald-600',
      url: '#',
      navigationMode: 'sameWindow',
    },
  ];

  const actions = activeTab === 'Học sinh' ? studentActions : parentActions;

  const handleClick = (action: QuickAction) => {
    if (action.url === '#') return;
    onActionClick(action);
  };

  if (activeTab === 'Giáo viên') return null;

  return (
    <section className="grid grid-cols-2 gap-3 px-5">
      {actions.map(action => (
        <motion.div
          key={action.title}
          whileHover={{y: -2}}
          whileTap={{scale: 0.98}}
          onClick={() => handleClick(action)}
          className="group flex cursor-pointer flex-col gap-4 rounded-[28px] border border-white/90 bg-white/92 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
        >
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${action.color} transition-transform group-hover:scale-110`}
          >
            {action.icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{action.title}</h3>
            <p className="mt-0.5 text-[10px] font-medium text-slate-400">{action.desc}</p>
          </div>
        </motion.div>
      ))}
    </section>
  );
};

const FanpageSection = ({
  onOpenFanpage,
  onPostClick,
}: {
  onOpenFanpage: () => void;
  onPostClick: (post: NewsItem) => void;
}) => {
  const [posts, setPosts] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmbedFallback, setShowEmbedFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchPosts = async () => {
      try {
        const response = await fetch(FACEBOOK_POSTS_API_URL, {cache: 'no-store'});
        if (!response.ok) {
          throw new Error(`Facebook posts API returned ${response.status}`);
        }

        const data = await response.json();
        const nextPosts = Array.isArray(data) ? data.slice(0, 5) : [];

        if (!cancelled) {
          setPosts(nextPosts);
          setShowEmbedFallback(nextPosts.length === 0);
        }
      } catch (error) {
        console.error('Error fetching fanpage posts:', error);
        if (!cancelled) {
          setPosts([]);
          setShowEmbedFallback(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPosts();
    const timer = window.setInterval(fetchPosts, NEWS_REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <section className="mt-7 space-y-4 px-5 pb-36">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="font-headline text-lg font-extrabold tracking-tight text-slate-800">
            Tin tức từ Fanpage
          </h2>
          <div className="h-1 w-8 rounded-full bg-primary-container" />
        </div>
        <button
          onClick={onOpenFanpage}
          className="rounded-lg bg-primary-container/5 px-3 py-1.5 text-xs font-bold text-primary-container"
        >
          Xem đầy đủ
        </button>
      </div>

      {loading ? (
        <section className="flex flex-col items-center justify-center gap-4 rounded-[28px] border border-white/90 bg-white/94 px-5 py-12 shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-container border-t-transparent" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Đang đồng bộ 5 bài viết mới nhất từ Fanpage...
          </p>
        </section>
      ) : showEmbedFallback ? (
        <div className="space-y-3">
          <div className="rounded-[24px] border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
            Chưa có cấu hình Facebook Page Access Token nên app chưa thể tách riêng 5 bài viết.
            Hiện đang dùng giao diện Fanpage đầy đủ để bạn vẫn xem được nội dung.
          </div>
          <div className="overflow-hidden rounded-[28px] border border-white/90 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
            <iframe
              title="Fanpage Trường Ngôi Sao Hoàng Mai"
              src={FANPAGE_EMBED_URL}
              className="fanpage-timeline-frame h-[980px] w-full border-none bg-white"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; web-share"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{opacity: 0, y: 12}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{delay: index * 0.06}}
              onClick={() => onPostClick(post)}
              className="group cursor-pointer overflow-hidden rounded-[28px] border border-white/90 bg-white/94 shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
            >
              {post.img ? (
                <img
                  src={post.img}
                  alt={post.title}
                  className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-28 items-center justify-center bg-slate-100 text-sm font-semibold text-slate-400">
                  Fanpage Ngôi Sao Hoàng Mai
                </div>
              )}
              <div className="space-y-3 p-5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary-container/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-container">
                    Fanpage
                  </span>
                  <span className="text-xs text-slate-400">{post.date}</span>
                </div>
                <h3 className="text-base font-bold leading-snug text-slate-900">{post.title}</h3>
                <p className="line-clamp-4 text-sm leading-relaxed text-slate-600">{post.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

const NewsSection = ({onArticleClick}: {onArticleClick: (item: NewsItem) => void}) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchNews = async () => {
      try {
        const response = await fetch(NEWS_API_URL, {cache: 'no-store'});
        if (!response.ok) {
          throw new Error(`News API returned ${response.status}`);
        }

        const data = await response.json();
        const nextNews = Array.isArray(data) && data.length > 0 ? sortNewsItems(data) : FALLBACK_NEWS;

        if (!cancelled) {
          setNews(nextNews);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        if (!cancelled) {
          setNews(sortNewsItems(FALLBACK_NEWS));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchNews();
    const timer = window.setInterval(fetchNews, NEWS_REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center gap-4 px-5 py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-container border-t-transparent" />
        <p className="animate-pulse text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Đang đồng bộ tin tức từ website...
        </p>
      </section>
    );
  }

  const featured = news[0];
  const list = news.slice(1);

  return (
    <section className="mt-6 space-y-4 px-5 pb-32">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="font-headline text-lg font-extrabold tracking-tight text-slate-800">
            Tin tức mới
          </h2>
          <div className="h-1 w-8 rounded-full bg-primary-container" />
        </div>
        <span className="rounded-lg bg-primary-container/5 px-3 py-1.5 text-xs font-bold text-primary-container">
          Real time
        </span>
      </div>

      {featured && (
        <motion.div
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          onClick={() => onArticleClick(featured)}
          className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
        >
          <div className="relative h-52 overflow-hidden">
            <img
              alt={featured.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              src={featured.img}
              referrerPolicy="no-referrer"
            />
            <div className="absolute right-4 top-4">
              <span className="rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-bold text-primary-container shadow-sm backdrop-blur-md">
                MỚI NHẤT
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded bg-primary-container/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-container">
                {featured.tag}
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <div className="flex items-center gap-1 text-slate-400">
                <Clock size={10} />
                <span className="text-[9px] font-medium">{featured.date}</span>
              </div>
            </div>
            <h3 className="text-base font-bold leading-snug text-slate-800 transition-colors group-hover:text-primary-container">
              {featured.title}
            </h3>
            <p className="mt-3 line-clamp-2 text-xs font-light leading-relaxed text-slate-500">
              {featured.desc}
            </p>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {list.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{opacity: 0, x: -10}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true}}
            transition={{delay: index * 0.08}}
            onClick={() => onArticleClick(item)}
            className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-50 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
              <img
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                src={item.img}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 space-y-2">
              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                {item.tag}
              </span>
              <h4 className="line-clamp-2 text-xs font-bold leading-snug text-slate-800 transition-colors group-hover:text-primary-container">
                {item.title}
              </h4>
              <div className="flex items-center gap-1 text-slate-400">
                <CalendarDays size={10} />
                <span className="text-[9px] font-medium">{item.date}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const ArticleModal = ({item, onClose}: {item: NewsItem; onClose: () => void}) => {
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [useIframeFallback, setUseIframeFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setUseIframeFallback(false);

        const response = await fetch(
          `${NEWS_ARTICLE_API_URL}?url=${encodeURIComponent(item.url)}`,
          {cache: 'no-store'},
        );

        if (!response.ok) {
          throw new Error(`Article API returned ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) {
          setArticle(data);
        }
      } catch (error) {
        console.error('Error fetching article detail:', error);
        if (!cancelled) {
          setUseIframeFallback(true);
          setArticle(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchArticle();

    return () => {
      cancelled = true;
    };
  }, [item.url]);

  const title = article?.title || item.title;
  const date = article?.date || item.date;
  const tag = article?.tag || item.tag;
  const image = article?.img || item.img;

  return (
    <motion.div
      initial={{opacity: 0, y: '100%'}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: '100%'}}
      transition={{type: 'spring', damping: 25, stiffness: 200}}
      className="fixed inset-0 z-[100] mx-auto flex max-w-2xl flex-col bg-white shadow-2xl"
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-slate-800 transition-colors hover:text-primary-container"
        >
          <Home size={18} />
          <span className="text-sm font-bold">Trang chủ</span>
        </button>
        <button
          onClick={onClose}
          className="rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"
        >
          <X size={18} />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-slate-50 px-6">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-container border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Đang tải nội dung bài viết...</p>
        </div>
      ) : useIframeFallback ? (
        <iframe src={item.url} className="flex-1 w-full border-none bg-slate-50" title={item.title} />
      ) : (
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="overflow-hidden bg-white shadow-sm">
            <img src={image} alt={title} className="h-60 w-full object-cover" referrerPolicy="no-referrer" />
            <div className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary-container/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-container">
                  {tag}
                </span>
                <span className="text-xs text-slate-400">{date}</span>
              </div>
              <h2 className="text-xl font-extrabold leading-tight text-slate-900">{title}</h2>
              <p className="text-sm leading-relaxed text-slate-500">{article?.desc || item.desc}</p>
            </div>
          </div>

          <div className="news-article-content mx-4 my-4 rounded-3xl bg-white p-5 shadow-sm">
            <div dangerouslySetInnerHTML={{__html: article?.html || ''}} />
          </div>
        </div>
      )}
    </motion.div>
  );
};

const WebModal = ({
  title,
  url,
  onClose,
}: {
  title: string;
  url: string;
  onClose: () => void;
}) => (
  <motion.div
    initial={{opacity: 0, y: '100%'}}
    animate={{opacity: 1, y: 0}}
    exit={{opacity: 0, y: '100%'}}
    transition={{type: 'spring', damping: 25, stiffness: 200}}
    className="fixed inset-0 z-[100] mx-auto flex max-w-2xl flex-col bg-white shadow-2xl"
  >
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4">
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-slate-800 transition-colors hover:text-primary-container"
      >
        <Home size={18} />
        <span className="text-sm font-bold">Trang chủ</span>
      </button>
      <div className="max-w-[45%] truncate text-xs font-semibold text-slate-500">{title}</div>
      <button
        onClick={onClose}
        className="rounded-full bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"
      >
        <X size={18} />
      </button>
    </div>
    <iframe src={url} className="flex-1 w-full border-none bg-slate-50" title={title} />
  </motion.div>
);

const BottomNav = ({
  onItemClick,
}: {
  onItemClick: (item: BottomNavAction) => void;
}) => {
  const [active, setActive] = useState('Trang chủ');
  const legacyItems = [
    {icon: <Home size={22} />, label: 'Trang chủ'},
    {icon: <BookMarked size={22} />, label: 'CT học'},
    {icon: <Wallet size={22} />, label: 'Biểu phí'},
    {icon: <MessageCircleQuestion size={22} />, label: 'Hỗ trợ'},
    {icon: <UserCircle size={22} />, label: 'Cá nhân'},
  ];
  const items: BottomNavAction[] = [
    legacyItems[0],
    {
      icon: <BookMarked size={22} />,
      label: 'CT học',
      url: 'https://hoangmaistarschool.edu.vn/thongtin/cth.pdf',
      navigationMode: 'webview',
    },
    {
      icon: <Wallet size={22} />,
      label: 'Biểu phí',
      url: 'https://hoangmaistarschool.edu.vn/thongtin/bieuphi.pdf',
      navigationMode: 'webview',
    },
    {
      icon: <MessageCircleQuestion size={22} />,
      label: 'Hỗ trợ',
      url: 'https://zalo.me/664388665648927162',
      navigationMode: 'oaLink',
    },
    legacyItems[4],
  ];

  return (
    <nav className="fixed bottom-0 z-50 w-full px-3 pb-safe">
      <div className="mx-auto mb-3 flex h-[76px] w-full max-w-2xl items-center justify-around rounded-[30px] border border-white/85 bg-white/94 px-3 shadow-[0_-2px_0_rgba(255,255,255,0.4),0_16px_36px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
        {items.map(item => (
          <button
            key={item.label}
            onClick={() => {
              setActive(item.label);
              onItemClick(item);
            }}
            className={`relative flex w-16 flex-col items-center justify-center transition-all ${
              active === item.label ? 'text-primary-container' : 'text-slate-400'
            }`}
          >
            <motion.div
              animate={active === item.label ? {y: -4, scale: 1.1} : {y: 0, scale: 1}}
              className="relative"
            >
              {item.icon}
              {active === item.label && (
                <motion.div
                  layoutId="activeGlow"
                  className="absolute inset-0 -z-10 rounded-full bg-primary-container/10 blur-lg"
                />
              )}
            </motion.div>
            <span
              className={`mt-1.5 text-[9px] font-bold transition-all ${
                active === item.label ? 'opacity-100' : 'opacity-70'
              }`}
            >
              {item.label}
            </span>
            {active === item.label && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute -bottom-2 h-1 w-1 rounded-full bg-primary-container"
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default function App() {
  const [viewer, setViewer] = useState<ViewerState>(null);
  const [activeTab, setActiveTab] = useState('Phụ huynh');

  const isZaloMiniApp = useMemo(
    () => typeof navigator !== 'undefined' && /zalo/i.test(navigator.userAgent),
    [],
  );

  const greeting = useMemo(() => {
    const now = new Date();
    return now.getHours() < 12 ? 'Chào buổi sáng' : 'Chào buổi chiều';
  }, []);

  const redirectToUrl = (url: string) => {
    if (typeof window === 'undefined') {
      return;
    }

    window.location.assign(url);
  };

  const openExternalDestination = async (url: string) => {
    if (!isZaloMiniApp) {
      redirectToUrl(url);
      return true;
    }

    try {
      await openOutApp({url});
      return true;
    } catch (error) {
      console.error('Error opening external destination:', error);
      return false;
    }
  };

  const openZaloOaLink = async (url: string) => {
    if (!isZaloMiniApp) {
      redirectToUrl(url);
      return;
    }

    try {
      await openOutApp({url});
    } catch (error) {
      console.error('Error opening Zalo OA link:', error);
      redirectToUrl(url);
    }
  };

  const openInternalWebview = async (url: string, title: string) => {
    if (!isZaloMiniApp) {
      setViewer({type: 'web', url, title});
      return;
    }

    try {
      await openWebview({
        url,
        config: {
          style: 'normal',
          leftButton: 'back',
        },
      });
    } catch (error) {
      console.error('Error opening webview:', error);
      setViewer({type: 'web', url, title});
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    switch (action.navigationMode) {
      case 'oaChat':
        await openZaloOaLink(action.url);
        return;
      case 'webview':
        await openInternalWebview(action.url, action.title);
        return;
      case 'outApp':
        if (await openExternalDestination(action.url)) {
          return;
        }
        if (action.fallbackMode === 'webview') {
          await openInternalWebview(action.url, action.title);
          return;
        }
        redirectToUrl(action.url);
        return;
      default:
        redirectToUrl(action.url);
    }
  };

  const handleBottomNavItem = async (item: BottomNavAction) => {
    if (!item.url || !item.navigationMode) {
      return;
    }

    if (item.navigationMode === 'oaLink') {
      await openZaloOaLink(item.url);
      return;
    }

    await openInternalWebview(item.url, item.label);
  };

  return (
    <div className="mx-auto flex h-screen max-w-2xl flex-col overflow-hidden bg-white font-body shadow-2xl shadow-slate-200 selection:bg-primary-container/10">
      <Header />

      <main className="flex-1 overflow-y-auto pb-24">
        <section className="mb-2 mt-20 flex items-center justify-between px-5">
          <motion.div initial={{opacity: 0, x: -10}} animate={{opacity: 1, x: 0}}>
            <span className="text-sm font-normal text-slate-900">{greeting}</span>
            <br />
            <span className="text-sm font-normal text-red-500">Khách!</span>
          </motion.div>
          <WeatherWidget />
        </section>

        <HeroSlider onSlideClick={redirectToUrl} />

        <section className="hidden">
          <motion.div initial={{opacity: 0, x: -10}} animate={{opacity: 1, x: 0}}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-white/80">{greeting}</p>
                <h1 className="max-w-[220px] text-[26px] font-extrabold leading-tight tracking-tight">
                  Cổng tiện ích Ngôi Sao Hoàng Mai
                </h1>
                <p className="max-w-[240px] text-sm leading-relaxed text-white/80">
                  Truy cập nhanh tuyển sinh, học tập, tài liệu và hỗ trợ ngay trong Zalo.
                </p>
              </div>
              <div className="shrink-0 rounded-[22px] bg-white/18 p-2 backdrop-blur-md">
                <WeatherWidget />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/16 px-3 py-1.5 text-[11px] font-semibold text-white">
                Webview tối ưu cho ZMA
              </span>
              <span className="rounded-full bg-white/16 px-3 py-1.5 text-[11px] font-semibold text-white">
                Điều hướng nhanh
              </span>
            </div>
          </motion.div>
        </section>

        <section className="hidden">
          <HeroSlider onSlideClick={redirectToUrl} />
        </section>
        <CategoryTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onTeacherPortalClick={async () => {
            await openInternalWebview(TEACHER_PORTAL_URL, 'Giáo viên');
          }}
        />
        <ActionGrid activeTab={activeTab} onActionClick={handleQuickAction} />
        <FanpageSection
          onOpenFanpage={() => openInternalWebview(FANPAGE_URL, 'Fanpage')}
          onPostClick={post => openInternalWebview(post.url, post.title)}
        />
      </main>

      <BottomNav onItemClick={handleBottomNavItem} />

      <AnimatePresence>
        {viewer?.type === 'news' && (
          <ArticleModal item={viewer.item} onClose={() => setViewer(null)} />
        )}
        {viewer?.type === 'web' && (
          <WebModal title={viewer.title} url={viewer.url} onClose={() => setViewer(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
