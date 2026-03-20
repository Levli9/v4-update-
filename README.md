# 🛡️ מערכת הדרכה לאבטחת מידע

מערכת הדרכה אינטראקטיבית לאבטחת מידע עם ממשק משתמש מתקדם, ניהול משתמשים, ומעקב אחר התקדמות הלמידה.

## ✨ תכונות עיקריות

### 👥 ניהול משתמשים
- **אימות משתמשים** עם הצפנת BCrypt
- **שחזור סיסמה** עם שליחת קוד אימות בדוא"ל (Brevo API)
- **תפקידים שונים**: מנהלים ועובדים
- **משתמשים מיוחדים** עם גישה לשני סוגי התצוגות

### 📚 פורטל למידה
- **חומרי למידה אינטראקטיביים** עם תמיכה בוידאו (MP4)
- **שאלונים והערכות** עם שאלות מותאמות
- **מעקב התקדמות** עם ציונים וסטטיסטיקות
- **תמיכה בעברית** עם כתב RTL מלא

### 📊 דשבורד ניהול
- **סטטיסטיקות ארגוניות** עם גרפים דינמיים
- **מעקב אחר עובדים** ורמת ההכשרה שלהם
- **דוחות ביצועים** וניתוח מגמות
- **ממשק אינטואיטיבי** עם עיצוב מודרני

### 🔧 טכני
- **מסד נתונים SQLite** עם ניהול אוטומטי
- **ממשק משתמש JavaFX** עם עיצוב מותאם
- **ארכיטקטורה מודולרית** עם הפרדת שכבות
- **תמיכה רב-פלטפורמית** (Windows/Mac/Linux)

## 🚀 התקנה והפעלה

### דרישות מוקדמות
- **Java 17+** - [הורד מ-Adoptium](https://adoptium.net)
- **Maven** (מומלץ) - [הורד מ-Apache](https://maven.apache.org)
- **Git** - לשריפת הפרויקט

### שכפול והתקנה
```bash
# שכפול הפרויקט
git clone https://github.com/Levli9/v4-update-.git
cd v4-update-

# התקנה עם Maven
mvn clean install
```

### הפעלה

#### אופציה 1: Maven (מומלץ)
```bash
mvn compile exec:java -Dexec.mainClass="com.cybertraining.Main"
```

#### אופציה 2: סקריפט הפעלה
```bash
# Mac
./run.command

# Windows/Linux/Mac
./run.sh
```

#### אופציה 3: הרצה ידנית
```bash
# קומפילציה
javac -cp "lib/*:*.jar" -d target/classes -sourcepath src/main/java src/main/java/com/cybertraining/Main.java

# הרצה
java -cp "target/classes:src/main/resources:lib/*:*.jar" com.cybertraining.Main
```

## 👤 משתמשי מערכת

### משתמשים רגילים
- **עובדים**: גישה לפורטל הלמידה והמבחנים
- **מנהלים**: גישה לדשבורד הניהול עם סטטיסטיקות

### משתמשים מיוחדים (גישה מלאה)
המשתמשים הבאים יכולים לגשת גם לתצוגת העובדים וגם לתצוגת המנהלים:

| שם משתמש | סיסמה | תפקיד |
|----------|--------|--------|
| `Yaniv123` | `Yaniv123` | מנהל |
| `Lev123` | `Lev123` | מנהל |
| `Yaniv123_emp` | `Yaniv123` | עובד |
| `Lev123_emp` | `Lev123` | עובד |

### הרשמה ראשונית
בפעם הראשונה שהמערכת רצה, היא יוצרת אוטומטית את המשתמשים המיוחדים.

## 🏗️ מבנה הפרויקט

```
v4-update/
├── src/main/java/com/cybertraining/
│   ├── Main.java                    # נקודת כניסה
│   ├── db/                          # שכבת מסד נתונים
│   │   ├── DatabaseManager.java     # ניהול DB וטבלאות
│   │   └── DatabaseInitializer.java # אתחול נתונים
│   ├── model/                       # מודלים של נתונים
│   │   ├── User.java               # משתמש
│   │   ├── Course.java             # קורס
│   │   ├── Question.java           # שאלה
│   │   └── Result.java             # תוצאת מבחן
│   ├── service/                     # שירותים עסקיים
│   │   ├── AuthenticationService.java # אימות והרשמה
│   │   └── QuizService.java        # לוגיקת מבחנים
│   ├── repository/                  # שכבת גישה לנתונים
│   │   └── ResultRepository.java    # ניהול תוצאות
│   ├── ui/                          # ממשק משתמש
│   │   ├── WelcomeFrame.java        # מסך פתיחה
│   │   ├── LoginFrame.java          # התחברות
│   │   ├── ViewSelectionScreen.java # בחירת תצוגה (מיוחד)
│   │   ├── EmployeeHomeFrame.java   # תצוגת עובד
│   │   ├── ManagerDashboardFrame.java # דשבורד מנהל
│   │   └── LearningFrame.java       # מסך למידה
│   └── security/                    # אבטחה
│       └── Session.java             # ניהול סשנים
├── src/main/resources/
│   ├── images/                      # תמונות וסמלים
│   └── data/
│       └── questions.json           # שאלות המבחן
├── videos/                          # קבצי וידאו להדרכה
├── data/                            # מסד נתונים וקבצי נתונים
├── lib/                             # ספריות חיצוניות
├── pom.xml                          # הגדרות Maven
├── run.command                      # סקריפט הפעלה Mac
└── run.sh                           # סקריפט הפעלה רב-פלטפורמי
```

## 🛠️ טכנולוגיות

- **Java 17** - שפת התכנות הראשית
- **JavaFX 17** - ממשק משתמש גרפי
- **SQLite** - מסד נתונים
- **Maven** - ניהול פרויקט ותלויות
- **BCrypt** - הצפנת סיסמאות
- **Brevo API** - שליחת מיילים
- **Gson** - עיבוד JSON
- **SLF4J** - לוגינג

## 🔧 פתרון בעיות

### שגיאת JavaFX
```
Error: package javafx.* does not exist
```
**פתרון**: וודא ש-JavaFX נמצא ב-classpath
```bash
# הוסף ל-classpath
export CLASSPATH="$CLASSPATH:lib/javafx-sdk-17.0.2/lib/*"
```

### שגיאת מסד נתונים
```
Error: no such table: users
```
**פתרון**: מחק את קובץ המסד נתונים והרץ מחדש
```bash
rm data/app.db
./run.sh
```

### שגיאת API Key
```
BREVO_API_KEY לא מוגדר
```
**פתרון**: הגדר את המשתנה
```bash
export BREVO_API_KEY="YOUR_BREVO_API_KEY_HERE"
```

### בעיות הרשאות (Linux/Mac)
```bash
chmod +x run.sh run.command
```

## 📊 סטטיסטיקות פרויקט

- **שורות קוד**: ~5000+
- **מחלקות**: 25+
- **טבלאות DB**: 4
- **שאלות מבחן**: 50+
- **קבצי משאבים**: 10+

## 🤝 תרומה

1. Fork את הפרויקט
2. צור branch חדש (`git checkout -b feature/AmazingFeature`)
3. Commit את השינויים (`git commit -m 'Add some AmazingFeature'`)
4. Push ל-branch (`git push origin feature/AmazingFeature`)
5. פתח Pull Request

## 📝 רישיון

פרויקט זה הוא קוד פתוח תחת רישיון MIT.

## 📞 קשר

- **מחבר**: Yaniv Legin
- **מייל**: thebeastcom71@gmail.com
- **GitHub**: [Levli9](https://github.com/Levli9)

---

**הערה**: המערכת כוללת קבצי API key לדוגמה. לשימוש בפרודקשן, החלף ל-API keys שלך.
