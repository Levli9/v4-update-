import React from 'react';
import { Award, BookCheck, Clock3, PlayCircle, Star, Trophy } from 'lucide-react';
import { subjectsData } from '../data/subjectsData';
import { knowledgeDocuments } from '../data/knowledgeDocuments';

export function buildLearningTimeline(user) {
  const events = [];
  Object.entries(user?.analytics?.courses || {}).forEach(([subjectId, course]) => {
    const subject = subjectsData.find((item) => item.id === Number(subjectId));
    if (course.startedAt) events.push({ date: course.startedAt, icon: PlayCircle, color: 'text-cyan-400', title: `התחיל את הקורס: ${subject?.title || subjectId}` });
    if (course.completedAt) events.push({ date: course.completedAt, icon: BookCheck, color: 'text-emerald-400', title: `השלים את הקורס: ${subject?.title || subjectId}` });
  });
  (user?.progress?.finalExam?.history || []).forEach((attempt) => events.push({ date: attempt.attemptedAt, icon: attempt.passed ? Trophy : Clock3, color: attempt.passed ? 'text-emerald-400' : 'text-rose-400', title: `${attempt.passed ? 'עבר' : 'לא עבר'} את המבחן המסכם — ציון ${attempt.score}` }));
  if (user?.progress?.finalExam?.passedAt) events.push({ date: user.progress.finalExam.passedAt, icon: Award, color: 'text-amber-400', title: 'קיבל תעודת הסמכה של ShieldX' });
  Object.entries(user?.progress?.courseRatings || {}).forEach(([subjectId, rating]) => {
    const subject = subjectsData.find((item) => item.id === Number(subjectId));
    events.push({ date: rating.ratedAt, icon: Star, color: 'text-yellow-400', title: `דירג את “${subject?.title || subjectId}” ב־${rating.value} כוכבים` });
  });
  Object.entries(user?.progress?.readDocuments || {}).forEach(([documentId, record]) => {
    const document = knowledgeDocuments.find((item) => item.id === documentId);
    events.push({ date: record.readAt, icon: BookCheck, color: 'text-blue-400', title: `קרא את המסמך: ${document?.title || documentId}` });
  });
  return events.filter((event) => event.date).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export default function LearningTimeline({ user, limit = 12 }) {
  const events = buildLearningTimeline(user).slice(0, limit);
  if (!events.length) return <p className="rounded-2xl border border-gray-800 bg-gray-950/40 p-5 text-center text-xs font-bold text-gray-600">היסטוריית הלמידה תופיע לאחר תחילת הפעילות.</p>;
  return <div className="relative space-y-1 before:absolute before:bottom-4 before:right-[17px] before:top-4 before:w-px before:bg-gray-800">{events.map((event, index) => {
    const Icon = event.icon;
    return <div key={`${event.date}-${index}`} className="relative flex items-start gap-3 rounded-xl p-2.5 text-right hover:bg-gray-900/45"><span className={`z-10 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-gray-800 bg-[#0b0f19] ${event.color}`}><Icon size={16} /></span><span><strong className="block text-[11px] font-bold text-gray-200">{event.title}</strong><time className="mt-1 block text-[9px] font-semibold text-gray-600">{new Intl.DateTimeFormat('he-IL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(event.date))}</time></span></div>;
  })}</div>;
}
