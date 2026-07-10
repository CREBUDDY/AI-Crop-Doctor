import { motion } from 'framer-motion';
import { Clock, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

export function BlogPage() {
  const { t } = useTranslation();
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
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f0fdfa 100%)' }}>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle, #bbf7d0, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #99f6e4, transparent 70%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold uppercase tracking-widest mb-4 border border-emerald-100">{t('landing.blog.page.tag')}</span>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
              {t('landing.blog.page.title1')} <span className="text-emerald-600">{t('landing.blog.page.title2')}</span>
            </h1>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed">
              {t('landing.blog.page.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(t('landing.blog.posts', { returnObjects: true }) as any[]).map((post, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-400 cursor-pointer"
            >
              <div className="relative h-52 overflow-hidden">
                <img src={i === 0 ? "/blog-disease.jpg" : i === 1 ? "/blog-farming.jpg" : i === 2 ? "/blog-ai.jpg" : post.img || "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop"} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-600" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm bg-white/90 ${i === 0 ? "text-red-600 border-red-100" : i === 1 ? "text-amber-600 border-amber-100" : "text-blue-600 border-blue-100"}`}>{post.tag}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mb-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.date}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                </div>
                <h2 className="font-bold text-slate-900 text-lg leading-snug mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2">{post.title}</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{post.author[0]}</div>
                    <span className="text-xs font-semibold text-slate-600">{post.author}</span>
                  </div>
                  <span className="text-emerald-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2.5 transition-all">
                    {t('common.read')} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #0f766e 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl font-extrabold text-white mb-4">{t('landing.blog.page.ctaTitle')}</h2>
            <p className="text-emerald-100/80 text-lg mb-8">{t('landing.blog.page.ctaSubtitle')}</p>
            <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-lg shadow-xl shadow-black/20 transition-all hover:-translate-y-1">
              {t('landing.blog.page.ctaButton')} <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
