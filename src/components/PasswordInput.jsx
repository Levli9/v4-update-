import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ className = '', ...props }) {
  const [visible, setVisible] = useState(false);

  return <div className="relative">
    <input {...props} type={visible ? 'text' : 'password'} className={`${className} pl-12`} />
    <button
      type="button"
      onClick={() => setVisible((current) => !current)}
      className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-gray-500 transition hover:bg-white/5 hover:text-[#00e6ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e6ff]"
      aria-label={visible ? 'הסתרת הסיסמה' : 'הצגת הסיסמה'}
      title={visible ? 'הסתר סיסמה' : 'הצג סיסמה'}
    >
      {visible ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  </div>;
}
