#!/bin/bash
# ===================================================
#  מערכת הדרכה לאבטחת מידע — סקריפט הפעלה
#  לחץ פעמיים על הקובץ להרצת האפליקציה
# ===================================================

cd "$(dirname "$0")"

echo "🔍 בודק התקנות..."

# בדיקה שJava קיים
if ! command -v java &> /dev/null; then
    osascript -e 'display dialog "Java לא מותקן!\n\nיש להוריד ולהתקין JDK מ:\nhttps://adoptium.net\n\nלאחר ההתקנה לחץ שוב על הקובץ." with title "שגיאה — Java חסר" buttons {"פתח להורדה","סגור"}'
    if [ $? -eq 0 ]; then
        open "https://adoptium.net"
    fi
    exit 1
fi

JAVA_VER=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
if [ "$JAVA_VER" -lt 17 ] 2>/dev/null; then
    osascript -e 'display dialog "גרסת Java ישנה מדי!\n\nנדרשת Java 17 או חדשה יותר.\nהמערכת זיהתה Java '$JAVA_VER'" with title "שגיאה — Java ישן" buttons {"סגור"}'
    exit 1
fi

# בדיקה שMaven קיים
if ! command -v mvn &> /dev/null; then
    echo "Maven לא נמצא - משתמש בקומפיל ידני..."
    echo "⚙️  מקמפל את הפרויקט..."

    mkdir -p target/classes
    javac -cp sqlite-jdbc-3.42.0.0.jar:jbcrypt-0.4.jar:lib/*:lib/javafx-sdk-17.0.2/lib/*:sib-api-v3-sdk-5.0.0.jar:gson-2.10.1.jar:okhttp-2.7.5.jar:okio-1.6.0.jar:slf4j-api.jar:slf4j-simple.jar:threetenbp-1.4.4.jar:gsonfire-1.8.5.jar -d target/classes -sourcepath src/main/java src/main/java/com/cybertraining/Main.java
    if [ $? -ne 0 ]; then
        osascript -e 'display dialog "שגיאה בקומפיל!\nנסה להריץ: javac -d target/classes -sourcepath src/main/java src/main/java/com/cybertraining/Main.java בטרמינל לפרטים." with title "שגיאת קומפיל" buttons {"סגור"}'
        exit 1
    fi

    echo "🚀 מפעיל את האפליקציה..."
    
    # בדיקת מפתח Brevo API
    export BREVO_API_KEY="YOUR_BREVO_API_KEY_HERE"
    echo "✅ מפתח Brevo API הוגדר"
    
    java -cp target/classes:src/main/resources:sqlite-jdbc-3.42.0.0.jar:jbcrypt-0.4.jar:sib-api-v3-sdk-5.0.0.jar:gson-2.10.1.jar:okhttp-2.7.5.jar:okio-1.6.0.jar:slf4j-api.jar:slf4j-simple.jar:threetenbp-1.4.4.jar:gsonfire-1.8.5.jar:lib/javafx-sdk-17.0.2/lib/* com.cybertraining.Main
else
    echo "✅ Java ו-Maven נמצאו"
    echo "⚙️  מקמפל את הפרויקט..."

    mvn compile -q
    if [ $? -ne 0 ]; then
        osascript -e 'display dialog "שגיאה בקומפיל!\nנסה להריץ: mvn compile בטרמינל לפרטים." with title "שגיאת קומפיל" buttons {"סגור"}'
        exit 1
    fi

    echo "🚀 מפעיל את האפליקציה..."
    mvn exec:java -Dexec.mainClass="com.cybertraining.Main" -q
fi
