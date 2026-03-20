#!/bin/bash
# ===================================================
#  מערכת הדרכה לאבטחת מידע — הפעלה פשוטה
#  עובד על Windows, Mac, Linux
# ===================================================

echo "🚀 מפעיל את מערכת ההדרכה לאבטחת מידע..."

# הגדרת API key
export BREVO_API_KEY="YOUR_BREVO_API_KEY_HERE"

# בדיקה אם יש Maven
if command -v mvn &> /dev/null; then
    echo "✅ Maven נמצא - משתמש ב-Maven"
    mvn compile -q
    if [ $? -eq 0 ]; then
        mvn exec:java -Dexec.mainClass="com.cybertraining.Main" -q
    else
        echo "❌ שגיאה בקומפילציה עם Maven"
        exit 1
    fi
else
    echo "⚠️  Maven לא נמצא - משתמש בקומפיל ידני"

    # קומפילציה ידנית
    mkdir -p target/classes

    # איסוף כל JAR files
    CP="lib/*:lib/javafx-sdk-17.0.2/lib/*"
    # הוספת JAR files מהתיקייה הראשית
    for jar in *.jar; do
        if [ -f "$jar" ]; then
            CP="$CP:$jar"
        fi
    done

    echo "🔧 קומפילציה עם classpath: $CP"
    javac -cp "$CP" -d target/classes -sourcepath src/main/java src/main/java/com/cybertraining/Main.java

    if [ $? -eq 0 ]; then
        java -cp "target/classes:src/main/resources:$CP" com.cybertraining.Main
    else
        echo "❌ שגיאה בקומפילציה ידנית"
        echo "ודא ש-Java 17+ מותקן"
        exit 1
    fi
fi