@echo off
echo Копирование файлов в репозиторий...

REM Создаем папку если её нет
if not exist "C:\Users\Nishiki\Documents\GitHub\rplavka" mkdir "C:\Users\Nishiki\Documents\GitHub\rplavka"

REM Копируем файлы
copy /Y "web\index.html" "C:\Users\Nishiki\Documents\GitHub\rplavka\index.html"
copy /Y "web\style.css" "C:\Users\Nishiki\Documents\GitHub\rplavka\style.css"
copy /Y "web\app.js" "C:\Users\Nishiki\Documents\GitHub\rplavka\app.js"
copy /Y ".gitignore" "C:\Users\Nishiki\Documents\GitHub\rplavka\.gitignore"
copy /Y "README.md" "C:\Users\Nishiki\Documents\GitHub\rplavka\README.md"
copy /Y "supabase_setup.sql" "C:\Users\Nishiki\Documents\GitHub\rplavka\supabase_setup.sql"
copy /Y "DEPLOY.md" "C:\Users\Nishiki\Documents\GitHub\rplavka\DEPLOY.md"

echo.
echo Готово! Файлы скопированы в C:\Users\Nishiki\Documents\GitHub\rplavka\
echo.
echo Следующие шаги:
echo 1. Откройте app.js и настройте Supabase URL и KEY
echo 2. Создайте таблицы в Supabase используя supabase_setup.sql
echo 3. Отправьте файлы в GitHub
echo 4. Включите GitHub Pages в настройках репозитория
echo 5. Обновите MINI_APP_URL в bot.py
echo.
pause
