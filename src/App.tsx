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
  ChevronRight,
  Search,
  X,
  Cloud,
  CloudRain,
  Sun,
  CloudLightning
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

const WeatherWidget = () => {
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const now = new Date();
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const day = days[now.getDay()];
    const date = now.getDate();
    const month = now.getMonth() + 1;
    setDateStr(`${day}, ${date}/${month}`);

    const fetchWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=21.0285&longitude=105.8542&current=temperature_2m,weather_code&timezone=Asia%2FBangkok');
        const data = await res.json();
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          code: data.current.weather_code
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
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col items-end text-right"
    >
      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full shadow-sm border border-slate-100">
        {weather ? getWeatherIcon(weather.code) : <div className="w-3 h-3 rounded-full border-2 border-slate-200 border-t-slate-400 animate-spin" />}
        <span className="text-xs font-bold text-slate-700">
          {weather ? `${weather.temp}°C` : '--°C'}
        </span>
      </div>
      <span className="text-[10px] text-slate-400 font-medium mt-1 mr-1">{dateStr}</span>
    </motion.div>
  );
};

const Header = () => (
  <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
    <div className="flex justify-between items-center pl-[5px] pr-5 h-16 w-full max-w-2xl mx-auto">
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
          whileTap={{ scale: 0.9 }}
          className="p-2 text-slate-400 hover:text-primary-container transition-colors"
        >
          <Search size={20} />
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          className="p-2 text-slate-400 hover:text-primary-container relative transition-colors"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </motion.button>
      </div>
    </div>
  </header>
);

const HeroSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = [
    { img: 'https://hoangmaistarschool.edu.vn/thongtin/k1.jpg', link: 'https://tuyensinh.nshn-hm.edu.vn/lop-1' },
    { img: 'https://hoangmaistarschool.edu.vn/thongtin/k6.jpg', link: 'https://tuyensinh.nshn-hm.edu.vn/lop-6' },
    { img: 'https://hoangmaistarschool.edu.vn/thongtin/k10.jpg', link: 'https://tuyensinh.nshn-hm.edu.vn/lop-10' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-48 overflow-hidden shadow-sm mt-2 w-full">
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 cursor-pointer ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          onClick={() => window.open(slide.link, '_blank')}
        >
          <img src={slide.img} alt={`Slide ${idx}`} className="w-full h-full object-cover" />
        </div>
      ))}
      <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
        {slides.map((_, idx) => (
          <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
        ))}
      </div>
    </section>
  );
};

const CategoryTabs = ({ activeTab, onTabChange, onUrlChange }: { activeTab: string, onTabChange: (tab: string) => void, onUrlChange: (url: string) => void }) => {
  const tabs = ['Phụ huynh', 'Học sinh', 'Giáo viên'];

  const handleTabClick = (tab: string) => {
    onTabChange(tab);
    if (tab === 'Giáo viên') {
      onUrlChange('https://erp-coral-rho.vercel.app/');
    }
  };

  return (
    <nav className="flex bg-slate-100/50 p-1.5 rounded-2xl mt-4 mb-4 mx-5 border border-slate-200/50">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={`flex-1 py-2.5 text-xs font-bold transition-all rounded-xl relative ${
            activeTab === tab 
              ? 'text-primary-container bg-white shadow-sm' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
};

const ActionGrid = ({ activeTab, onActionClick }: { activeTab: string, onActionClick: (url: string) => void }) => {
  const parentActions = [
    { 
      icon: <Lightbulb size={22} />, 
      title: 'Tư vấn', 
      desc: 'Tuyển sinh 2026 - 2027', 
      color: 'bg-rose-50 text-rose-600',
      url: 'https://zalo.me/ngoisaohoangmai',
      external: true
    },
    { 
      icon: <CalendarDays size={22} />, 
      title: 'Estore', 
      desc: 'Mua đồng phục', 
      color: 'bg-amber-50 text-amber-600',
      url: 'https://estore.nshm.vn/',
      external: true
    },
    { 
      icon: <ClipboardCheck size={22} />, 
      title: 'Canvas LMS', 
      desc: 'Theo dõi học tập', 
      color: 'bg-indigo-50 text-indigo-600',
      url: 'https://4015.instructure.com/login/canvas',
      external: true
    },
    { 
      icon: <BookOpen size={22} />, 
      title: 'School Online', 
      desc: 'Quản lý thông tin học sinh', 
      color: 'bg-emerald-50 text-emerald-600',
      url: 'https://so.nshn-hm.edu.vn/',
      external: true
    },
  ];

  const studentActions = [
    { 
      icon: <ClipboardCheck size={22} />, 
      title: 'Canvas LMS', 
      desc: 'Hệ thống học tập', 
      color: 'bg-indigo-50 text-indigo-600',
      url: 'https://4015.instructure.com/login/canvas',
      external: true
    },
    { 
      icon: <BookOpen size={22} />, 
      title: 'Nội quy - Quy chế', 
      desc: 'Nội quy nhà trường', 
      color: 'bg-rose-50 text-rose-600',
      url: '#',
      external: false
    },
    { 
      icon: <MessageCircleQuestion size={22} />, 
      title: 'Tâm lý học đường', 
      desc: 'Tư vấn tâm lý học đường', 
      color: 'bg-amber-50 text-amber-600',
      url: '#',
      external: false
    },
    { 
      icon: <Bell size={22} />, 
      title: 'Thông báo', 
      desc: 'Thông báo nhà trường', 
      color: 'bg-emerald-50 text-emerald-600',
      url: '#',
      external: false
    },
  ];

  const actions = activeTab === 'Học sinh' ? studentActions : parentActions;

  const handleClick = (action: typeof actions[0]) => {
    if (action.url === '#') return;
    if (action.external) {
      window.open(action.url, '_blank');
    } else {
      onActionClick(action.url);
    }
  };

  if (activeTab === 'Giáo viên') return null;

  return (
    <section className="grid grid-cols-2 gap-4 px-5">
      {actions.map((action, idx) => (
        <motion.div 
          key={idx}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleClick(action)}
          className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 group cursor-pointer hover:shadow-md transition-all duration-300"
        >
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${action.color} transition-transform group-hover:scale-110`}>
            {action.icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{action.title}</h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{action.desc}</p>
          </div>
        </motion.div>
      ))}
    </section>
  );
};

const NewsSection = ({ onArticleClick }: { onArticleClick: (url: string) => void }) => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <section className="px-5 py-12 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-3 border-primary-container border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase animate-pulse">Đang đồng bộ tin tức Zalo OA...</p>
      </section>
    );
  }

  const featured = news[0];
  const list = news.slice(1);

  return (
    <section className="space-y-4 px-5 pb-32 mt-6">
      <div className="flex justify-between items-center">
        <div className="space-y-0.5">
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight font-headline">Tin tức mới</h2>
          <div className="h-1 w-8 bg-primary-container rounded-full"></div>
        </div>
        <button className="text-xs font-bold text-primary-container bg-primary-container/5 px-3 py-1.5 rounded-lg hover:bg-primary-container/10 transition-colors">
          Tất cả
        </button>
      </div>

      {/* Featured News */}
      {featured && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => featured.url && onArticleClick(featured.url)}
          className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm group cursor-pointer"
        >
          <div className="relative h-52 overflow-hidden">
            <img 
              alt={featured.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              src={featured.img}
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 right-4">
              <span className="bg-white/90 backdrop-blur-md text-primary-container text-[9px] font-bold px-3 py-1.5 rounded-full shadow-sm">NỔI BẬT</span>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-bold text-primary-container bg-primary-container/5 px-2 py-0.5 rounded uppercase tracking-wider">{featured.tag}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <div className="flex items-center gap-1 text-slate-400">
                <Clock size={10} />
                <span className="text-[9px] font-medium">{featured.date}</span>
              </div>
            </div>
            <h3 className="text-base font-bold leading-snug text-slate-800 group-hover:text-primary-container transition-colors">
              {featured.title}
            </h3>
            <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed font-light">
              {featured.desc}
            </p>
          </div>
        </motion.div>
      )}

      {/* News List */}
      <div className="space-y-4">
        {list.map((item, idx) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => item.url && onArticleClick(item.url)}
            className="bg-white p-3 rounded-xl flex gap-4 items-center border border-slate-50 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
          >
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                src={item.img}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 space-y-2">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.tag}</span>
              <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-primary-container transition-colors">{item.title}</h4>
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

const BottomNav = () => {
  const [active, setActive] = useState('Trang chủ');
  const items = [
    { icon: <Home size={22} />, label: 'Trang chủ' },
    { icon: <BookMarked size={22} />, label: 'CT học' },
    { icon: <Wallet size={22} />, label: 'Biểu phí' },
    { icon: <MessageCircleQuestion size={22} />, label: 'Hỗ trợ' },
    { icon: <UserCircle size={22} />, label: 'Cá nhân' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-white/90 backdrop-blur-2xl border-t border-slate-100 pb-safe">
      <div className="flex justify-around items-center h-20 px-4 w-full max-w-2xl mx-auto">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => setActive(item.label)}
            className={`flex flex-col items-center justify-center transition-all relative w-16 ${
              active === item.label ? 'text-primary-container' : 'text-slate-400'
            }`}
          >
            <motion.div
              animate={active === item.label ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
              className="relative"
            >
              {item.icon}
              {active === item.label && (
                <motion.div 
                  layoutId="activeGlow"
                  className="absolute inset-0 bg-primary-container/10 blur-lg rounded-full -z-10"
                />
              )}
            </motion.div>
            <span className={`text-[9px] font-bold mt-1.5 transition-all ${active === item.label ? 'opacity-100' : 'opacity-70'}`}>
              {item.label}
            </span>
            {active === item.label && (
              <motion.div 
                layoutId="activeIndicator"
                className="absolute -bottom-2 w-1 h-1 bg-primary-container rounded-full"
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default function App() {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Phụ huynh');
  
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const isMorning = currentHour < 12 || (currentHour === 12 && currentMinute === 0);
  const greeting = isMorning ? 'Chào buổi sáng' : 'Chào buổi chiều';

  return (
    <div className="min-h-screen bg-white flex flex-col font-body selection:bg-primary-container/10 max-w-2xl mx-auto shadow-2xl shadow-slate-200">
      <Header />
      
      <main className="flex-1 overflow-y-auto">
        <section className="mt-20 px-5 mb-2 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-sm text-slate-900 font-normal">{greeting}</span>
            <br />
            <span className="text-sm text-red-500 font-normal">Khách !</span>
          </motion.div>
          <WeatherWidget />
        </section>

        <HeroSlider />
        <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} onUrlChange={setSelectedUrl} />
        <ActionGrid activeTab={activeTab} onActionClick={setSelectedUrl} />
        
        <NewsSection onArticleClick={setSelectedUrl} />
      </main>

      <BottomNav />

      {/* Article Modal */}
      <AnimatePresence>
        {selectedUrl && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col max-w-2xl mx-auto shadow-2xl"
          >
            <div className="h-14 border-b border-slate-100 flex items-center justify-between px-4 bg-white shrink-0">
              <button 
                onClick={() => setSelectedUrl(null)} 
                className="flex items-center gap-2 text-slate-800 hover:text-primary-container transition-colors"
              >
                <Home size={18} />
                <span className="text-sm font-bold">Trang chủ</span>
              </button>
              <button onClick={() => setSelectedUrl(null)} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors">
                <X size={18} />
              </button>
            </div>
            <iframe src={selectedUrl} className="flex-1 w-full border-none bg-slate-50" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
