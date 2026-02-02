# Инструкция по копированию в репозиторий

## Шаг 1: Подготовка файлов для GitHub Pages

Скопируйте эти файлы в `C:\Users\Nishiki\Documents\GitHub\rplavka\`:

### Файлы для корня репозитория (GitHub Pages):
```
rplavka/web/index.html  →  C:\Users\Nishiki\Documents\GitHub\rplavka\index.html
rplavka/web/style.css   →  C:\Users\Nishiki\Documents\GitHub\rplavka\style.css
rplavka/web/app.js      →  C:\Users\Nishiki\Documents\GitHub\rplavka\app.js
rplavka/README.md       →  C:\Users\Nishiki\Documents\GitHub\rplavka\README.md
rplavka/.gitignore      →  C:\Users\Nishiki\Documents\GitHub\rplavka\.gitignore
```

### Команды для копирования (PowerShell):
```powershell
# Перейдите в папку проекта
cd C:\Users\Nishiki\Documents\GitHub

# Создайте папку rplavka если её нет
mkdir rplavka -ErrorAction SilentlyContinue

# Скопируйте файлы
copy "путь\к\rplavka\web\index.html" "rplavka\index.html"
copy "путь\к\rplavka\web\style.css" "rplavka\style.css"
copy "путь\к\rplavka\web\app.js" "rplavka\app.js"
copy "путь\к\rplavka\README.md" "rplavka\README.md"
copy "путь\к\rplavka\.gitignore" "rplavka\.gitignore"
```

## Шаг 2: Настройка Supabase

1. Откройте `app.js` в репозитории
2. Замените строки:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';
```

На ваши данные из Supabase (создайте проект на supabase.com)

## Шаг 3: Создание таблиц в Supabase

1. Зайдите в Supabase → SQL Editor
2. Скопируйте содержимое файла `supabase_setup.sql`
3. Выполните запрос

## Шаг 4: Отправка в GitHub

```bash
cd C:\Users\Nishiki\Documents\GitHub\rplavka

# Инициализация git (если ещё не сделано)
git init

# Добавление файлов
git add .

# Коммит
git commit -m "Initial commit: RP LAVKA Mini App"

# Подключение к GitHub (замените на ваш репозиторий)
git remote add origin https://github.com/yourusername/rplavka.git

# Отправка
git push -u origin main
```

## Шаг 5: Включение GitHub Pages

1. Зайдите в Settings → Pages
2. Source: Deploy from a branch
3. Branch: main → / (root)
4. Save

Ваш сайт будет доступен: `https://yourusername.github.io/rplavka`

## Шаг 6: Обновление бота

1. Откройте `bot.py` (НЕ копируйте в репозиторий!)
2. Замените `MINI_APP_URL` на ваш GitHub Pages URL
3. Запустите бота локально или на сервере

## Шаг 7: Настройка Menu Button

1. Напишите @BotFather
2. `/mybots` → выберите бота → Bot Settings → Menu Button
3. Button text: `🌴 RP LAVKA`
4. URL: `https://yourusername.github.io/rplavka`

## Готово! 🎉

Теперь ваш бот работает с Mini App интерфейсом!
