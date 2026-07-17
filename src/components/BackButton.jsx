import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BackButton({ to = '/', onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="group ml-0 mr-auto grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gray-700 bg-gray-900 text-gray-300 shadow-lg shadow-black/15 transition-all hover:border-[#00e6ff]/45 hover:bg-[#00e6ff]/10 hover:text-[#00e6ff]"
      aria-label="חזור"
      title="חזור"
    >
      <ArrowLeft size={21} className="transition-transform group-hover:-translate-x-0.5" />
    </Link>
  );
}

