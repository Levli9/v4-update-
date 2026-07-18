import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Search, Users, Video, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { subjectsData } from '../data/subjectsData';
import { knowledgeDocuments } from '../data/knowledgeDocuments';

export default function GlobalSearch({ buttonClassName = '' }) {
  const { users, currentUser } = useApp();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  useEffect(() => { const listener = (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen((value) => !value); } }; window.addEventListener('keydown', listener); return () => window.removeEventListener('keydown', listener); }, []);
  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);
  const results = useMemo(() => {
    const term = query.trim().toLowerCase(); if (!term) return [];
    const courses = subjectsData.flatMap((subject) => [{ type: 'קורס', icon: FileText, title: subject.title, subtitle: subject.description, to: `/subject/${subject.id}` }, { type: 'סרטון', icon: Video, title: `סרטון: ${subject.title}`, subtitle: 'וידאו וכתוביות', to: `/subject/${subject.id}` }, { type: 'מבחן', icon: FileText, title: `מבדק: ${subject.title}`, subtitle: 'שאלות ותרגולים', to: `/subject/${subject.id}` }]);
    const documents = knowledgeDocuments.map((document) => ({ type: 'מסמך', icon: FileText, title: document.title, subtitle: document.category, to: '/knowledge' }));
    const people = currentUser.role === 'manager' || currentUser.role === 'admin'
      ? users.filter((user) => ['employee', 'manager'].includes(user.role)).map((user) => ({
        type: user.role === 'manager' ? 'מנהל' : 'עובד',
        icon: Users,
        title: user.username,
        subtitle: user.department,
        to: '/manager'
      }))
      : [];
    return [...courses, ...documents, ...people].filter((item) => `${item.title} ${item.subtitle} ${item.type}`.toLowerCase().includes(term)).slice(0, 12);
  }, [query, users, currentUser.role]);
  return <><button type="button" onClick={() => setOpen(true)} className={buttonClassName} aria-label="חיפוש גלובלי"><Search size={18} /><span className="hidden xl:inline">חיפוש</span><kbd className="hidden rounded border border-gray-700 px-1.5 py-0.5 text-[9px] text-gray-600 lg:inline">⌘K</kbd></button>{open && <div className="fixed inset-0 z-[120] flex items-start justify-center bg-black/75 p-4 pt-[12vh] backdrop-blur-sm" onMouseDown={() => setOpen(false)}><section role="dialog" aria-modal="true" aria-label="חיפוש גלובלי" className="w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-700 bg-[#0b0f19] shadow-2xl" onMouseDown={(event) => event.stopPropagation()} dir="rtl"><div className="flex items-center gap-3 border-b border-gray-800 p-4"><Search className="text-[#00e6ff]" /><label className="flex-1"><span className="sr-only">מונח לחיפוש</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-base text-white outline-none" placeholder="חיפוש עובדים, קורסים, מבחנים, סרטונים ומסמכים…" /></label><button type="button" onClick={() => setOpen(false)} className="text-gray-500" aria-label="סגירת החיפוש"><X /></button></div><div className="max-h-[55vh] overflow-y-auto p-3">{query && !results.length && <p className="p-8 text-center text-xs font-bold text-gray-600">לא נמצאו תוצאות</p>}{results.map((item, index) => { const Icon = item.icon; return <Link key={`${item.type}-${item.title}-${index}`} to={item.to} onClick={() => { setOpen(false); setQuery(''); }} className="flex items-center gap-3 rounded-2xl p-3 hover:bg-gray-900"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#00e6ff]/8 text-[#00e6ff]"><Icon size={17} /></span><span className="flex-1"><strong className="block text-xs text-white">{item.title}</strong><small className="mt-1 block text-[10px] text-gray-600">{item.subtitle}</small></span><span className="rounded bg-gray-900 px-2 py-1 text-[9px] font-bold text-gray-500">{item.type}</span></Link>; })}</div></section></div>}</>;
}
