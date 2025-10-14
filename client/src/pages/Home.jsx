import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useEventStore from '../store/eventStore';
import useSettingsStore from '../store/settingsStore';
import Going from './Going';
import CantGo from './CantGo';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Home = () => {
  const navigate = useNavigate();
  const { activeEvent, fetchActiveEvent } = useEventStore();

  const {
    logoText,
    subtitleText,
    goingButtonText,
    cantGoButtonText,
    dressCodeLabel,
    addressLabel,
    eventAgendaLabel,
    guestInfoLabel,
    goingButtonColor,
    goingButtonTextColor,
    goingButtonHoverColor,
    cantGoButtonColor,
    cantGoButtonTextColor,
    cantGoButtonBorderColor,
    cantGoButtonHoverColor,
    logoImage,
    showLinearGradient,
    showRadialGradient,
    fetchSettings,
  } = useSettingsStore();

  const [showContent, setShowContent] = useState(false);
  const [showAgenda, setShowAgenda] = useState(false);
  const [activeMedia, setActiveMedia] = useState([]);
  const [isMuted, setIsMuted] = useState(true);
  const [showGoing, setShowGoing] = useState(false);
  const [showCantGo, setShowCantGo] = useState(false);

  const mediaRefs = useRef({});

  const fetchActiveMedia = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/media/public/test`);
      const list = res.data?.data;
      if (Array.isArray(list) && list.length) {
        setActiveMedia(list);
      } else {
        setActiveMedia([
          { _id: 'default-video', type: 'video', filePath: '/default-video.mp4' },
          { _id: 'default-image', type: 'image', filePath: '/default-image.jpg' },
        ]);
      }
    } catch {
      setActiveMedia([
        { _id: 'default-video', type: 'video', filePath: '/default-video.mp4' },
        { _id: 'default-image', type: 'image', filePath: '/default-image.jpg' },
      ]);
    }
  };

  useEffect(() => {
    fetchActiveEvent();
    fetchActiveMedia();
    fetchSettings();

    const t1 = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    setShowAgenda(false);
    const ms = Number(activeEvent?.animationDuration) || 3000;
    const timer = setTimeout(() => setShowAgenda(true), ms);
    return () => clearTimeout(timer);
  }, [activeEvent]);

  useEffect(() => {
    Object.values(mediaRefs.current).forEach((v) => {
      if (v && v.tagName === 'VIDEO') {
        v.muted = true; // ensure muted for mobile autoplay
        const p = v.play();
        if (p?.catch) {
          p.catch(() => {
            v.muted = true;
            v.play().catch(() => {});
          });
        }
      }
    });
  }, [activeMedia]);

  
  const handleGoing = () => setShowGoing(true);
  const handleCantGo = () => setShowCantGo(true);

  const eventData = activeEvent || {
    title: '',
    date: '',
    dressCode: '',
    address: '',
    guestInfo: '',
    agenda: [],
  };

  const displayDate = (() => {
    if (!eventData?.date) return '';
    const d = new Date(eventData.date);
    if (Number.isNaN(d.getTime())) return String(eventData.date);
    return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
  })();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .going-button:hover { background-color: var(--hover-color) !important; }
          .cant-go-button:hover { background-color: var(--hover-color) !important; }
        `,
        }}
      />

      <div className="absolute inset-0 z-0">
        {activeMedia.map((m) => {
          if (m.type === 'video') {
            const src = `${API_BASE}${m.filePath}`;
            return (
              <video
                key={m._id}
                ref={(el) => {
                  if (el) mediaRefs.current[m._id] = el;
                }}
                src={src}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                disablePictureInPicture
                controls={false}
                className="w-full h-full object-cover absolute inset-0"
                onCanPlay={(e) => {
                  const v = e.currentTarget;
                  const p = v.play();
                  if (p?.catch) {
                    p.catch(() => {
                      v.muted = true;
                      v.play().catch(() => {});
                    });
                  }
                }}
              >
                <source src={src} type="video/mp4" />
              </video>
            );
          }
          return (
            <img
              key={m._id}
              src={`${API_BASE}${m.filePath}`}
              alt="Background"
              className="w-full h-full object-cover absolute inset-0"
            />
          );
        })}

        {showLinearGradient && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90 z-10" />
        )}
        {showRadialGradient && (
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                'radial-gradient(60% 60% at 50% 40%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.75) 100%)',
            }}
          />
        )}
      </div>

      <div
        className={`relative z-20 min-h-screen flex flex-col items-center justify-between py-12 transition-all duration-1000 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="text-center mt-12">
          {logoImage ? (
            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <img src={logoImage} alt="Logo" className="max-h-20 mx-auto mb-4" />
            </div>
          ) : (
            <h1
              className={`font-display font-bold text-white mb-2 tracking-wider animate-slide-up ${
                logoText.length <= 6 
                  ? 'responsive-text-large' 
                  : logoText.length <= 10 
                  ? 'responsive-text' 
                  : logoText.length <= 15 
                  ? 'text-lg sm:text-xl md:text-2xl' 
                  : 'text-base sm:text-lg md:text-xl'
              }`}
              style={{ 
                animationDelay: '200ms',
                fontSize: logoText.length > 15 ? `clamp(0.875rem, ${Math.max(2, 8 - logoText.length * 0.3)}vw, 1.5rem)` : undefined
              }}
            >
              {logoText}
            </h1>
          )}
          <div
            className="flex items-center justify-center space-x-4 animate-slide-up"
            style={{ animationDelay: '400ms' }}
          >
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/50" />
            <p className="text-lg md:text-xl text-white/90 tracking-[0.3em] uppercase">{subtitleText}</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/50" />
          </div>
        </div>

        <div
          className={`transition-all duration-1000 ${
            showAgenda ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {showAgenda && (
            <div className="max-w-2xl mx-auto px-6 text-center">
              <h2 className="text-3xl md:text-4xl font-light text-white mb-2">{displayDate}</h2>
              <p className="text-lg text-white font-bold mb-4">{eventData.title}</p>
              <div className="h-8"></div>

              {eventData.agenda?.length > 0 && (
                <div className="mb-8 text-left">
                  <h3 className="text-xl font-semibold text-white mb-6">{eventAgendaLabel}:</h3>
                  <div className="space-y-4">
                    {eventData.agenda.map((item, index) => (
                      <div
                        key={item._id || index}
                        className="flex items-start space-x-4 animate-slide-up"
                        style={{ animationDelay: `${800 + index * 100}ms` }}
                      >
                        <div className="text-white font-semibold text-lg min-w-[60px]">
                          {(() => {
                            if (!item?.time) return '';
                            // Accept values like "20:00" or full ISO/time strings
                            if (/^\d{1,2}:\d{2}$/.test(item.time)) return item.time;
                            const d = new Date(item.time);
                            if (!Number.isNaN(d.getTime())) {
                              return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                            }
                            return String(item.time);
                          })()}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-base">{item.title}</p>
                          {item.subtitle && <p className="text-white/60 text-sm mt-1">{item.subtitle}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-8"></div>

              <div className="space-y-4 text-sm text-white/70 mb-8">
                {eventData.dressCode && (
                  <p>
                    <span className="font-semibold text-white">{dressCodeLabel}:</span> {eventData.dressCode}
                  </p>
                )}
                {eventData.address && (
                  <p>
                    <span className="font-semibold text-white">{addressLabel}:</span> {eventData.address}
                  </p>
                )}
                {eventData.guestInfo && <p className="text-white/60">{eventData.guestInfo}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-12 px-4 animate-slide-up" style={{ animationDelay: '800ms' }}>
          <button
            onClick={handleGoing}
            className="going-button group relative px-16 py-4 font-bold text-lg tracking-wider uppercase overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              '--bg-color': goingButtonColor,
              '--hover-color': goingButtonHoverColor,
              '--text-color': goingButtonTextColor,
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-color)',
            }}
          >
            <span className="relative z-10">{goingButtonText}</span>
            <div
              className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"
              style={{ background: `linear-gradient(to right, var(--hover-color), var(--hover-color))` }}
            />
          </button>
          <button
            onClick={handleCantGo}
            className="cant-go-button px-16 py-4 font-bold text-lg tracking-wider uppercase border-2 transition-all duration-300 hover:scale-105"
            style={{
              '--bg-color': cantGoButtonColor,
              '--hover-color': cantGoButtonHoverColor,
              '--text-color': cantGoButtonTextColor,
              '--border-color': cantGoButtonBorderColor,
              backgroundColor: 'var(--bg-color)',
              color: 'var(--text-color)',
              borderColor: 'var(--border-color)',
            }}
          >
            {cantGoButtonText}
          </button>
        </div>
      </div>

      

      <div className="absolute inset-0 z-5 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {showGoing && <Going onClose={() => setShowGoing(false)} />}
      {showCantGo && <CantGo onClose={() => setShowCantGo(false)} />}
    </div>
  );
};

export default Home;
