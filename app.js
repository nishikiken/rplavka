// Supabase Configuration (используем существующий проект)
const SUPABASE_URL = 'https://hyxyablgkjtoxcxnurkk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eHlhYmxna2p0b3hjeG51cmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxODE5NjksImV4cCI6MjA4NDc1Nzk2OX0._3HQYSymZ2ArXIN143gAiwulCL1yt7i5fiHaTd4bp5U';

console.log('=== RP LAVKA LOADED ===');

// Инициализация Supabase
let supabaseClient;
if (window.supabase) {
    console.log('Initializing Supabase...');
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase initialized');
} else {
    console.warn('Supabase library not loaded');
}

// Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    
    // Применяем тему Telegram
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#000000');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#00ff88');
}

// Загрузка данных пользователя
function loadUserData() {
    console.log('Loading user data...');
    
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        console.log('User:', user.first_name);
        
        const userName = user.first_name || user.username || 'Пользователь';
        document.getElementById('profile-name').textContent = userName;
        
        // Загрузка данных с сервера
        if (supabaseClient) {
            loadUserDataFromAPI(user.id, userName, user.photo_url || null);
        }
    } else {
        console.warn('No Telegram user data');
        document.getElementById('profile-name').textContent = 'Гость';
    }
}

// Загрузка данных с Supabase
async function loadUserDataFromAPI(telegramId, name, avatarUrl) {
    if (!supabaseClient) return;
    
    try {
        console.log('Fetching user from database...');
        
        const { data: existingUser, error: fetchError } = await supabaseClient
            .from('rplavka_users')
            .select('*')
            .eq('telegram_id', telegramId)
            .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }
        
        let userData;
        
        if (!existingUser) {
            console.log('Creating new user...');
            const { data: newUser, error: createError } = await supabaseClient
                .from('rplavka_users')
                .insert([{
                    telegram_id: telegramId,
                    name: name,
                    avatar_url: avatarUrl,
                    rating: 0
                }])
                .select()
                .single();
            
            if (createError) throw createError;
            userData = newUser;
        } else {
            console.log('User found, updating...');
            const { data: updatedUser, error: updateError } = await supabaseClient
                .from('rplavka_users')
                .update({
                    name: name,
                    avatar_url: avatarUrl
                })
                .eq('telegram_id', telegramId)
                .select()
                .single();
            
            if (updateError) throw updateError;
            userData = updatedUser;
        }
        
        console.log('User data loaded:', userData);
        document.getElementById('profile-rating').textContent = `Рейтинг: ${'⭐'.repeat(userData.rating || 0)}`;
        
        window.currentUserId = telegramId;
        
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Анимация падающих денег
function createMoneyRain() {
    const moneyRain = document.querySelector('.money-rain');
    if (!moneyRain) return;
    
    setInterval(() => {
        const money = document.createElement('div');
        money.textContent = '💵';
        money.style.position = 'absolute';
        money.style.left = Math.random() * 100 + '%';
        money.style.top = '-20px';
        money.style.fontSize = '24px';
        money.style.animation = 'fall 3s linear';
        money.style.opacity = '0.7';
        
        moneyRain.appendChild(money);
        
        setTimeout(() => {
            money.remove();
        }, 3000);
    }, 300);
}

// CSS для анимации падения
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(400px) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Обработчики кнопок
document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const isBuy = this.classList.contains('buy-btn');
        if (tg) tg.HapticFeedback.impactOccurred('medium');
        alert(isBuy ? 'Открыть раздел покупки' : 'Открыть раздел продажи');
    });
});

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        if (tg) tg.HapticFeedback.impactOccurred('light');
    });
});

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    createMoneyRain();
});
