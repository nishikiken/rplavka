# 📁 Структура проекта RP LAVKA

## Файлы в текущей папке (для разработки)

```
rplavka/
├── 📄 bot.py                    # Telegram бот (запускать локально)
├── 📄 requirements.txt          # Python зависимости
├── 📄 .env                      # Конфигурация (НЕ отправлять в Git!)
├── 📄 .env.example              # Пример конфигурации
├── 📄 .gitignore                # Что не отправлять в Git
├── 📄 supabase_setup.sql        # SQL для создания таблиц
├── 📄 copy_files.bat            # Скрипт копирования (уже выполнен)
├── 📄 README.md                 # Документация
├── 📄 DEPLOY.md                 # Инструкция по развертыванию
├── 📄 QUICK_START.md            # Быстрый старт (читай это!)
├── 📄 COPY_TO_REPO.md           # Инструкция по копированию
├── 📄 PROJECT_STRUCTURE.md      # Этот файл
└── 📁 web/                      # Веб-интерфейс (Mini App)
    ├── index.html               # Главная страница
    ├── style.css                # Стили (зелёная тема)
    └── app.js                   # JavaScript логика
```

## Файлы в репозитории GitHub (для GitHub Pages)

```
C:\Users\Nishiki\Documents\GitHub\rplavka\
├── 📄 index.html                # Главная страница Mini App
├── 📄 style.css                 # Стили
├── 📄 app.js                    # JavaScript (настроить Supabase!)
├── 📄 .gitignore                # Git ignore
├── 📄 README.md                 # Документация
├── 📄 supabase_setup.sql        # SQL для Supabase
└── 📄 DEPLOY.md                 # Инструкция
```

## Что где находится

### 🤖 Telegram бот
- **Файл**: `rplavka/bot.py`
- **Запуск**: `python bot.py` (локально или на сервере)
- **Настройка**: Обновить `MINI_APP_URL` на ваш GitHub Pages URL
- **Токен**: Уже настроен в `.env`

### 🌐 Веб-интерфейс (Mini App)
- **Файлы**: `index.html`, `style.css`, `app.js`
- **Хостинг**: GitHub Pages
- **URL**: `https://ваш_username.github.io/rplavka`
- **Настройка**: Обновить Supabase URL и KEY в `app.js`

### 💾 База данных
- **Платформа**: Supabase (PostgreSQL)
- **Таблицы**: 
  - `users` - пользователи с рейтингом
  - `listings` - объявления о продаже
  - `deals` - сделки
  - `reviews` - отзывы
- **Настройка**: Выполнить SQL из `supabase_setup.sql`

## Как это работает

```
┌─────────────┐
│  Telegram   │
│    User     │
└──────┬──────┘
       │ /start
       ▼
┌─────────────┐
│  Telegram   │
│     Bot     │ ◄── bot.py (локально/сервер)
└──────┬──────┘
       │ Opens Mini App
       ▼
┌─────────────┐
│   GitHub    │
│    Pages    │ ◄── index.html, style.css, app.js
└──────┬──────┘
       │ API calls
       ▼
┌─────────────┐
│  Supabase   │
│  Database   │ ◄── users, listings, deals, reviews
└─────────────┘
```

## Файлы которые НЕ нужно отправлять в Git

- `.env` - содержит токен бота
- `__pycache__/` - Python кэш
- `*.pyc` - скомпилированные Python файлы

Эти файлы уже добавлены в `.gitignore`

## Что нужно настроить

### 1. В `app.js` (в репозитории GitHub)
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';  // ← Заменить
const SUPABASE_KEY = 'YOUR_SUPABASE_KEY';  // ← Заменить
```

### 2. В `bot.py` (локально)
```python
MINI_APP_URL = "https://yourusername.github.io/rplavka"  # ← Заменить
```

### 3. В Supabase
- Выполнить SQL из `supabase_setup.sql`

### 4. В @BotFather
- Настроить Menu Button с вашим GitHub Pages URL

## Дополнительные файлы

### Для разработки
- `copy_files.bat` - автоматическое копирование в репозиторий
- `QUICK_START.md` - пошаговая инструкция
- `COPY_TO_REPO.md` - инструкция по копированию

### Для документации
- `README.md` - основная документация
- `DEPLOY.md` - подробная инструкция по развертыванию
- `PROJECT_STRUCTURE.md` - этот файл

## Следующие шаги

1. ✅ Файлы скопированы в репозиторий
2. ⏳ Настроить Supabase → см. `QUICK_START.md`
3. ⏳ Обновить `app.js` с Supabase данными
4. ⏳ Отправить в GitHub
5. ⏳ Включить GitHub Pages
6. ⏳ Обновить `bot.py` с GitHub Pages URL
7. ⏳ Запустить бота
8. ⏳ Тестировать!

Читайте `QUICK_START.md` для подробных инструкций! 🚀
