import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Search, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// We'll dynamically construct this from translations, mapping colors.
const CATEGORY_COLORS = ['emerald', 'blue', 'violet', 'amber'];

const COLOR_MAP: Record<string, { badge: string; icon: string; border: string }> = {
  emerald: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-200' },
  blue: { badge: 'bg-blue-50 text-blue-700 border-blue-100', icon: 'bg-blue-100 text-blue-600', border: 'border-blue-200' },
  violet: { badge: 'bg-violet-50 text-violet-700 border-violet-100', icon: 'bg-violet-100 text-violet-600', border: 'border-violet-200' },
  amber: { badge: 'bg-amber-50 text-amber-700 border-amber-100', icon: 'bg-amber-100 text-amber-600', border: 'border-amber-200' },
};

export function FAQPage() {
  const { t } = useTranslation();
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const translatedCategories = (t('landing.faq.page.categories', { returnObjects: true }) as any[]);
  const FAQ_CATEGORIES = translatedCategories.map((c, i) => ({
    ...c,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
  }));

  const allItems = FAQ_CATEGORIES.flatMap(c => c.items.map((item: any) => ({ ...item, category: c.category, color: c.color })));
  const filtered = search.trim() ? allItems.filter((i: any) => i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase())) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 overflow-y-auto bg-slate-50 font-sans"
    >
      <Link to="/" className="absolute top-6 left-6 flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm hover:shadow transition-all z-50">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('common.backToHome')}
      </Link>
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0f766e 100%)' }}>
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #34d399, transparent 70%)' }} />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #2dd4bf, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-emerald-200 text-sm font-bold uppercase tracking-widest mb-4 border border-white/20">{t('landing.faq.tag')}</span>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight mb-6">
              {t('landing.faq.page.title1')} <span className="text-emerald-300">{t('landing.faq.page.title2')}</span>
            </h1>
            <p className="text-emerald-100/80 text-xl mb-10">{t('landing.faq.page.subtitle')}</p>
            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-slate-800 placeholder-slate-400 font-medium shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 text-base"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {filtered ? (
          <div className="space-y-3">
            <p className="text-slate-500 text-sm mb-6 font-medium">{filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;</p>
            {filtered.length === 0 && (
              <div className="text-center py-20 text-slate-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No questions found. Try different keywords.</p>
              </div>
            )}
            {filtered.map((item, i) => (
              <FAQItem key={i} item={item} id={`search-${i}`} openItem={openItem} setOpenItem={setOpenItem} colorMap={COLOR_MAP} />
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            {FAQ_CATEGORIES.map((cat, ci) => (
              <motion.div key={ci} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: ci * 0.1 }}>
                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${COLOR_MAP[cat.color].badge}`}>{cat.category}</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="space-y-3">
                  {cat.items.map((item, ii) => (
                    <FAQItem key={ii} item={{ ...item, category: cat.category, color: cat.color }} id={`${ci}-${ii}`} openItem={openItem} setOpenItem={setOpenItem} colorMap={COLOR_MAP} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #0f766e 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <MessageCircle className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
            <h2 className="text-4xl font-extrabold text-white mb-4">{t('landing.faq.page.ctaTitle')}</h2>
            <p className="text-emerald-100/80 text-lg mb-8">{t('landing.faq.page.ctaSubtitle')}</p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-lg shadow-xl shadow-black/20 transition-all hover:-translate-y-1">
              {t('landing.faq.page.ctaButton')} <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}

function FAQItem({ item, id, openItem, setOpenItem, colorMap }: { item: any; id: string; openItem: string | null; setOpenItem: (id: string | null) => void; colorMap: any }) {
  const isOpen = openItem === id;
  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white ${ isOpen ? `${colorMap[item.color]?.border || 'border-emerald-200'} shadow-md` : 'border-slate-200 hover:border-slate-300' }`}>
      <button onClick={() => setOpenItem(isOpen ? null : id)} className="w-full flex items-center justify-between px-6 py-5 text-left gap-4">
        <span className={`font-semibold text-base ${isOpen ? 'text-emerald-700' : 'text-slate-900'}`}>{item.q}</span>
        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${ isOpen ? 'bg-emerald-500 text-white rotate-45' : 'bg-slate-100 text-slate-500' }`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }}>
            <p className="px-6 pb-5 text-slate-600 leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
