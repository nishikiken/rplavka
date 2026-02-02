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
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#0a1f1a');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff');
}

// Текущий режим (buy/sell)
let currentMode = 'buy';

// Переключение режима
function switchMode(mode) {
    currentMode = mode;
    
    // Скрываем приветственный экран
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }
    
    // Показываем заголовок, кнопку создания и контейнер с объявлениями
    const sectionTitle = document.getElementById('section-title');
    const createBtn = document.getElementById('create-listing-btn');
    const listingsContainer = document.getElementById('listings-container');
    if (sectionTitle) sectionTitle.style.display = 'block';
    if (createBtn) createBtn.style.display = 'block';
    if (listingsContainer) listingsContainer.style.display = 'flex';
    
    // Обновляем активную кнопку
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    if (mode === 'buy') {
        document.querySelector('.buy-btn').classList.add('active');
        sectionTitle.textContent = 'ПУБЛИКАЦИИ О ПРОДАЖЕ';
    } else {
        document.querySelector('.sell-btn').classList.add('active');
        sectionTitle.textContent = 'ПУБЛИКАЦИИ О СКУПКЕ';
    }
    
    // Haptic feedback
    if (tg) tg.HapticFeedback.impactOccurred('light');
    
    // Загружаем объявления
    loadListings();
}

// Загрузка объявлений
async function loadListings() {
    if (!supabaseClient) {
        console.log('Supabase not available, showing demo listings');
        return;
    }
    
    try {
        // Определяем какой тип объявлений загружать
        // buy режим = показываем sell объявления (кто продает)
        // sell режим = показываем buy объявления (кто скупает)
        const listingType = currentMode === 'buy' ? 'sell' : 'buy';
        
        const { data: listings, error } = await supabaseClient
            .from('rplavka_listings')
            .select('*, seller:rplavka_users!seller_id(*)')
            .eq('status', 'active')
            .eq('listing_type', listingType)
            .order('created_at', { ascending: false })
            .limit(20);
        
        if (error) throw error;
        
        console.log('Listings loaded:', listings);
        
        if (listings && listings.length > 0) {
            renderListings(listings);
        } else {
            // Показываем пустое состояние
            const container = document.getElementById('listings-container');
            container.innerHTML = '<div class="empty-state">Пока нет объявлений</div>';
        }
    } catch (error) {
        console.error('Error loading listings:', error);
    }
}

// Отрисовка объявлений
function renderListings(listings) {
    const container = document.getElementById('listings-container');
    container.innerHTML = '';
    
    listings.forEach(listing => {
        const card = document.createElement('div');
        card.className = 'seller-card';
        
        const rating = calculateRating(listing.seller.rating || 0);
        
        card.innerHTML = `
            <div class="seller-info">
                <div class="seller-details">
                    <div class="seller-name">${listing.game}</div>
                    <div class="seller-username">${listing.seller.name}</div>
                    <div class="seller-rating">${rating}</div>
                </div>
                <div class="seller-avatar">
                    ${listing.seller.avatar_url ? `<img src="${listing.seller.avatar_url}" alt="Avatar">` : '👤'}
                </div>
            </div>
            <div class="seller-banner">
                <div class="banner-text">${listing.amount}кк - ${listing.price}₽</div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            if (tg) tg.HapticFeedback.impactOccurred('medium');
            showListingDetails(listing);
        });
        
        container.appendChild(card);
    });
}

// Расчёт рейтинга (средний балл из отзывов)
function calculateRating(avgRating) {
    if (!avgRating || avgRating === 0) return '☆☆☆☆☆';
    
    const fullStars = Math.floor(avgRating);
    const hasHalfStar = avgRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '⭐'.repeat(fullStars);
    if (hasHalfStar) stars += '⭐'; // Можно заменить на половинку если нужно
    stars += '☆'.repeat(emptyStars);
    
    return stars;
}

// Показать детали объявления
function showListingDetails(listing) {
    alert(`${listing.game}\n\nКоличество: ${listing.amount}\nЦена: ${listing.price}₽\n\nПродавец: ${listing.seller.name}`);
}

// Загрузка данных пользователя
function loadUserData() {
    console.log('Loading user data...');
    
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        console.log('User:', user.first_name);
        
        // Сохраняем userId сразу
        window.currentUserId = user.id;
        
        const userName = user.first_name || user.username || 'Пользователь';
        document.getElementById('user-name').textContent = userName;
        
        // Устанавливаем аватар
        const avatarEl = document.getElementById('user-avatar');
        if (user.photo_url) {
            avatarEl.innerHTML = `<img src="${user.photo_url}" alt="Avatar">`;
        }
        
        // Загрузка данных с сервера
        if (supabaseClient) {
            loadUserDataFromAPI(user.id, userName, user.photo_url || null);
        }
    } else {
        console.warn('No Telegram user data');
        document.getElementById('user-name').textContent = 'Гость';
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
            console.log('User found, updating avatar only...');
            // Обновляем только аватар, НЕ имя (имя меняется только через профиль)
            const { data: updatedUser, error: updateError } = await supabaseClient
                .from('rplavka_users')
                .update({
                    avatar_url: avatarUrl
                })
                .eq('telegram_id', telegramId)
                .select()
                .single();
            
            if (updateError) throw updateError;
            userData = updatedUser;
            
            // Обновляем имя на плашке из БД
            document.getElementById('user-name').textContent = userData.name;
        }
        
        console.log('User data loaded:', userData);
        
        // Обновляем рейтинг (звёзды от 0 до 5)
        const rating = calculateRating(userData.rating || 0);
        document.getElementById('user-rating').textContent = rating;
        
        window.currentUserId = telegramId;
        window.currentUserData = userData;
        
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    loadListings();
});

// Делаем функцию глобальной
window.switchMode = switchMode;


// Открыть профиль
function openProfile() {
    document.getElementById('profile-page').style.display = 'block';
    document.getElementById('publications-section').style.display = 'none';
    document.getElementById('user-profile-card').style.display = 'none';
    
    // Загружаем данные профиля
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        document.getElementById('profile-name-input').value = user.first_name || user.username || '';
        document.getElementById('profile-telegram-id').textContent = user.id || '—';
        
        const avatarEl = document.getElementById('profile-avatar-large');
        if (user.photo_url) {
            avatarEl.innerHTML = `<img src="${user.photo_url}" alt="Avatar">`;
        }
    }
    
    if (tg) tg.HapticFeedback.impactOccurred('medium');
}

// Закрыть профиль
function closeProfile() {
    document.getElementById('profile-page').style.display = 'none';
    document.getElementById('publications-section').style.display = 'block';
    document.getElementById('user-profile-card').style.display = 'block';
    
    if (tg) tg.HapticFeedback.impactOccurred('light');
}

// Создать объявление
function createListing() {
    document.getElementById('create-listing-page').style.display = 'block';
    document.getElementById('publications-section').style.display = 'none';
    document.getElementById('user-profile-card').style.display = 'none';
    
    // Очищаем форму
    document.getElementById('listing-server').value = '';
    document.getElementById('listing-amount').value = '';
    document.getElementById('listing-price').value = '';
    document.getElementById('listing-description').value = '';
    
    if (tg) tg.HapticFeedback.impactOccurred('medium');
}

// Закрыть форму создания объявления
function closeCreateListing() {
    document.getElementById('create-listing-page').style.display = 'none';
    document.getElementById('publications-section').style.display = 'block';
    document.getElementById('user-profile-card').style.display = 'block';
    
    if (tg) tg.HapticFeedback.impactOccurred('light');
}

// Опубликовать объявление
async function publishListing() {
    const listingType = document.getElementById('listing-type').value;
    const server = document.getElementById('listing-server').value;
    const amount = document.getElementById('listing-amount').value;
    const price = document.getElementById('listing-price').value;
    const description = document.getElementById('listing-description').value.trim();
    
    // Валидация
    if (!server) {
        if (tg) tg.showAlert('Выберите сервер');
        else alert('Выберите сервер');
        return;
    }
    
    if (!amount || amount <= 0) {
        if (tg) tg.showAlert('Укажите количество');
        else alert('Укажите количество');
        return;
    }
    
    if (!price || price <= 0) {
        if (tg) tg.showAlert('Укажите цену');
        else alert('Укажите цену');
        return;
    }
    
    // Получаем userId
    let userId = window.currentUserId;
    if (!userId && tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        userId = tg.initDataUnsafe.user.id;
        window.currentUserId = userId;
    }
    
    if (!supabaseClient || !userId) {
        if (tg) tg.showAlert('Ошибка: нет подключения к базе данных');
        else alert('Ошибка: нет подключения к базе данных');
        return;
    }
    
    try {
        // Создаем объявление
        const { error } = await supabaseClient
            .from('rplavka_listings')
            .insert([{
                seller_id: userId,
                listing_type: listingType,
                game: server,
                amount: parseInt(amount),
                price: parseInt(price),
                description: description || `${amount}кк - ${price}₽`,
                status: 'active'
            }]);
        
        if (error) throw error;
        
        if (tg) {
            tg.showAlert('Объявление успешно опубликовано!');
            tg.HapticFeedback.notificationOccurred('success');
        } else {
            alert('Объявление успешно опубликовано!');
        }
        
        closeCreateListing();
        loadListings(); // Перезагружаем список
    } catch (error) {
        console.error('Error publishing listing:', error);
        if (tg) {
            tg.showAlert('Ошибка при публикации: ' + error.message);
        } else {
            alert('Ошибка при публикации: ' + error.message);
        }
    }
}

// Сохранить профиль
async function saveProfile() {
    const newName = document.getElementById('profile-name-input').value.trim();
    
    if (!newName) {
        if (tg) {
            tg.showAlert('Введите имя пользователя');
        } else {
            alert('Введите имя пользователя');
        }
        return;
    }
    
    // Получаем userId из Telegram
    let userId = window.currentUserId;
    if (!userId && tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        userId = tg.initDataUnsafe.user.id;
        window.currentUserId = userId;
    }
    
    if (!supabaseClient || !userId) {
        if (tg) {
            tg.showAlert('Ошибка: нет подключения к базе данных');
        } else {
            alert('Ошибка: нет подключения к базе данных');
        }
        console.error('Save profile error:', { supabaseClient: !!supabaseClient, userId });
        return;
    }
    
    try {
        const { error } = await supabaseClient
            .from('rplavka_users')
            .update({ name: newName })
            .eq('telegram_id', userId);
        
        if (error) throw error;
        
        // Обновляем имя на плашке
        document.getElementById('user-name').textContent = newName;
        
        if (tg) {
            tg.showAlert('Профиль успешно обновлен!');
            tg.HapticFeedback.notificationOccurred('success');
        } else {
            alert('Профиль успешно обновлен!');
        }
        
        closeProfile();
    } catch (error) {
        console.error('Error saving profile:', error);
        if (tg) {
            tg.showAlert('Ошибка при сохранении профиля: ' + error.message);
        } else {
            alert('Ошибка при сохранении профиля: ' + error.message);
        }
    }
}

// Делаем функции глобальными
window.openProfile = openProfile;
window.closeProfile = closeProfile;
window.createListing = createListing;
window.closeCreateListing = closeCreateListing;
window.publishListing = publishListing;
window.saveProfile = saveProfile;
