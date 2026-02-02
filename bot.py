"""
RP LAVKA - Telegram бот для продажи виртуальной валюты
Запускает Mini App с веб-интерфейсом
"""

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo, MenuButtonWebApp
from telegram.ext import Application, CommandHandler, ContextTypes
import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv('BOT_TOKEN')
# URL Mini App (замените на ваш GitHub Pages или хостинг)
MINI_APP_URL = "https://yourusername.github.io/rplavka"


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обработчик команды /start — кнопка для открытия Mini App."""
    keyboard = [[
        InlineKeyboardButton("🌴 Открыть RP LAVKA", web_app=WebAppInfo(url=MINI_APP_URL))
    ]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "🌴 <b>RP LAVKA</b> 🌴\n\n"
        "Добро пожаловать в сервис по продаже виртуальной валюты!\n\n"
        "💎 Безопасные сделки\n"
        "⚡ Быстрые транзакции\n"
        "🛡️ Гарантия качества\n\n"
        "Нажми кнопку ниже или используй меню слева от поля ввода 👇",
        reply_markup=reply_markup,
        parse_mode='HTML'
    )


async def post_init(application) -> None:
    """Устанавливает Menu Button после запуска бота."""
    await application.bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(
            text="🌴 RP LAVKA",
            web_app=WebAppInfo(url=MINI_APP_URL)
        )
    )


def main() -> None:
    """Запуск бота."""
    application = Application.builder().token(BOT_TOKEN).post_init(post_init).build()
    
    application.add_handler(CommandHandler("start", start))
    
    print("🤖 RP LAVKA бот запущен!")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
