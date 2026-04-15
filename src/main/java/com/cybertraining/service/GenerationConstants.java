package com.cybertraining.service;

/**
 * קבועים ותבניות עבור יצירת תוכן AI
 */
public final class GenerationConstants {

    private GenerationConstants() {
        // Utility class
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━ ORGANIZATION CONTEXTS ━━━━━━━━━━━━━━━━━━━━━━━━

    public static final String[] ORGANIZATION_CONTEXTS = {
      "בתי חולים",
      "בנק",
      "חברת ביטוח",
      "מפעל",
      "סטארטאפ",
      "משרד ממשלתי",
      "חברת טלקום",
      "קמעונאות",
      "חברת לוגיסטיקה",
      "מוסד חינוכי"
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━ ORGANIZATION DETAILS (RANDOM SUGGESTIONS) ━━━━━━━━━━━━━━━━━━━━━━━━

    public static final String[] ORGANIZATION_DETAILS_SUGGESTIONS = {
      "עובדים חדשים",
      "מערכות ליבה ותיקות",
      "סביבה היברידית",
      "גישה מרחוק",
      "נתונים רגישים מאוד",
      "צוות תפעול מצומצם",
      "ריבוי משתמשים וקבוצות עבודה",
      "תהליכי אישור מחמירים",
      "תלות גבוהה בשירותי ענן",
      "עומסי עבודה גדולים"
    };

    public static String getRandomDetails() {
        return ORGANIZATION_DETAILS_SUGGESTIONS[
            (int)(Math.random() * ORGANIZATION_DETAILS_SUGGESTIONS.length)
        ];
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━ PROMPT TEMPLATES ━━━━━━━━━━━━━━━━━━━━━━━━

    public static String buildGenerationPrompt(String topic, String organizationContext, String organizationDetails) {
      String contextPart = organizationContext != null && !organizationContext.isBlank()
        ? String.format("בהקשר של %s", organizationContext)
        : "בהקשר כללי";

        String detailsPart = organizationDetails != null && !organizationDetails.isBlank()
            ? String.format(". דרישות ספציפיות: %s", organizationDetails)
            : "";

        return String.format(
            """
            צור תוכן הדרכה מקיף בנושא: "%s"
            %s%s
            
            הפק נא תשובה בפורמט JSON עברי בדיוק עם המבנה הזה:
            {
              "courseTitle": "כותרת ההדרכה",
              "introduction": "מבוא הסברי",
              "sections": [
                {
                  "title": "כותרת חלק",
                  "slides": [
                    {
                      "title": "כותרת השקף",
                      "content": "פסקת הסבר קצרה",
                      "bullets": ["נקודה 1", "נקודה 2", "נקודה 3"],
                      "summary": "סיכום קצר",
                      "speakerNotes": "הערות אופציונליות"
                    }
                  ]
                }
              ],
              "quiz": [
                {
                  "question": "שאלה",
                  "options": ["א", "ב", "ג", "ד"],
                  "correctAnswer": "א",
                  "explanation": "הסבר"
                }
              ]
            }
            
            דרישות חשובות:
            1. כל התוכן חייב להיות בעברית טהורה
            2. התאם את הדוגמאות לנושא ולארגון
            3. אם הנושא הוא בתי חולים, השתמש בדוגמאות רפואיות
            4. אם הנושא הוא בנק, השתמש בדוגמאות פיננסיות
            5. אם הנושא הוא מפעל, השתמש בדוגמאות תפעוליות
            6. לפחות 5 שקפים
            7. לפחות 5 שאלות
            """,
            topic, contextPart, detailsPart
        );
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━ FALLBACK CONTENT ━━━━━━━━━━━━━━━━━━━━━━━━

    public static final String FALLBACK_LEARNING_TITLE = "הדרכה בנושא: אבטחת מידע וסייבר";
    
    public static final String FALLBACK_LEARNING_INTRO = 
        "אבטחת מידע היא תחום חיוני בעולם הדיגיטלי של ימינו. " +
        "מטרת הדרכה זו היא להדריך את עובדי הארגון על התנהגויות בטוחות " +
        "ועל זיהוי ומניעת איומים סייברנטיים שכיחים.";

    public static final String FALLBACK_LEARNING_SUMMARY = 
        "סיכום: אבטחת מידע היא אחריות משותפת. כל עובד צריך להיות מודע " +
        "לסכנות, להשתמש בסיסמאות חזקות, לא ללחוץ על קישורים חשודים, " +
        "ולדווח על חשד למצב חשוד.";

    // ━━━━━━━━━━━━━━━━━━━━━━━━ DEFAULTS ━━━━━━━━━━━━━━━━━━━━━━━━

    public static final int DEFAULT_SLIDES_COUNT = 6;
    public static final int DEFAULT_QUIZ_COUNT = 5;
    public static final String DEFAULT_LANGUAGE = "he";
    public static final String DEFAULT_CHARSET = "UTF-8";

}
