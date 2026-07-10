// src/components/PhishingSimulation.jsx
import React, { useState } from 'react';

export default function PhishingSimulation({ onComplete }) {
  const [flags, setFlags] = useState({
    sender: false,
    urgency: false,
    domain: false
  });
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleFlag = (key) => {
    setFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const verifySubmission = () => {
    const isAllCorrect = flags.sender && flags.urgency && flags.domain;
    setSuccess(isAllCorrect);
    setShowFeedback(true);
    if (isAllCorrect && onComplete) {
      onComplete();
    }
  };

  return (
    <div className="bg-[#0b0b14] border border-gray-800 rounded-xl p-6 max-w-2xl mx-auto my-6 shadow-2xl">
      <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-4">
        <h4 className="text-[#ffb703] font-bold text-lg flex items-center gap-2">
          <span>🎣</span> מעבדת סימולציית פישינג
        </h4>
        <span className="text-xs text-gray-400">סמן את כל 3 סימני האזהרה באימייל</span>
      </div>

      <div className="bg-[#141424] border border-gray-800 rounded-lg p-5 mb-6 text-right text-sm leading-relaxed relative">
        <div className="border-b border-gray-800 pb-3 mb-3 text-xs text-gray-400">
          <div className="mb-2">
            <strong>מאת: </strong>
            <span 
              onClick={() => toggleFlag('sender')}
              className={`cursor-pointer px-1.5 py-0.5 rounded transition-all ${
                flags.sender ? 'bg-[#ffb703]/25 text-[#ffb703] border border-[#ffb703]/50' : 'hover:bg-gray-800'
              }`}
            >
              security-team@paypa1-alert.com
            </span>
          </div>
          <div>
            <strong>נושא: </strong>
            <span 
              onClick={() => toggleFlag('urgency')}
              className={`cursor-pointer px-1.5 py-0.5 rounded transition-all ${
                flags.urgency ? 'bg-[#ffb703]/25 text-[#ffb703] border border-[#ffb703]/50' : 'hover:bg-gray-800'
              }`}
            >
              ⚠️ פעולה דחופה נדרשת: חשבונך יושעה תוך 24 שעות!
            </span>
          </div>
        </div>

        <p className="text-gray-300 mb-4">
          לקוח יקר,<br />
          זיהינו ניסיון גישה חריג לחשבונך. על מנת למנוע השעיית גישה מיידית, עליך לעדכן את פרטי האשראי והזיהוי שלך כעת.
        </p>

        <div className="text-center my-5">
          <span 
            onClick={() => toggleFlag('domain')}
            className={`cursor-pointer px-5 py-2.5 rounded-md font-bold text-white transition-all inline-block ${
              flags.domain ? 'bg-[#ffb703]/25 text-[#ffb703] border border-[#ffb703]/50' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            אמת את חשבונך כאן
          </span>
          <div className="text-[10px] text-gray-500 mt-2 font-mono">
            Link: http://verify.paypa1-update.com/login
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button 
          onClick={verifySubmission}
          className="px-6 py-2.5 rounded-lg bg-[#ffb703] text-black font-bold hover:bg-[#ffb703]/90 transition-all text-sm"
        >
          בדוק פתרון
        </button>

        <div className="flex gap-3 text-xs">
          <span className={`px-2 py-1 rounded border ${flags.sender ? 'border-[#ffb703]/40 text-[#ffb703]' : 'border-gray-800 text-gray-600'}`}>שולח חשוד</span>
          <span className={`px-2 py-1 rounded border ${flags.urgency ? 'border-[#ffb703]/40 text-[#ffb703]' : 'border-gray-800 text-gray-600'}`}>דחיפות</span>
          <span className={`px-2 py-1 rounded border ${flags.domain ? 'border-[#ffb703]/40 text-[#ffb703]' : 'border-gray-800 text-gray-600'}`}>קישור מזויף</span>
        </div>
      </div>

      {showFeedback && (
        <div className={`mt-5 p-4 rounded-lg border text-sm ${
          success 
            ? 'bg-green-950/20 border-green-500/30 text-green-455' 
            : 'bg-red-950/20 border-red-500/30 text-red-400'
        }`}>
          {success ? (
            <div>
              <strong>🎉 עבודה מצוינת!</strong> זיהית את כל סימני האזהרה: כתובת השולח המזויפת (paypa1), נושא המשרה לחץ פסיכולוגי, והקישור שאינו מוביל לאתר הרשמי.
            </div>
          ) : (
            <div>
              <strong>❌ ישנם סימני אזהרה נוספים.</strong> נסה שוב – קרא בעיון את השולח, הנושא והקישור המצורף.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
