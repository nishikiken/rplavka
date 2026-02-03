// Supabase Configuration (используем существующий проект)
const SUPABASE_URL = 'https://hyxyablgkjtoxcxnurkk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5eHlhYmxna2p0b3hjeG51cmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxODE5NjksImV4cCI6MjA4NDc1Nzk2OX0._3HQYSymZ2ArXIN143gAiwulCL1yt7i5fiHaTd4bp5U';

// Debug Console - максимально простая реализация
const debugLogs = [];

function debugLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    debugLogs.push({ timestamp, message, type });
}

function toggleDebugConsole() {
    const consoleEl = document.getElementById('debug-console');
    if (consoleEl.style.display === 'none') {
        consoleEl.style.display = 'flex';
        renderDebugLogs();
    } else {
        consoleEl.style.display = 'none';
    }
}

function renderDebugLogs() {
    const debugContent = document.getElementById('debug-content');
    debugContent.innerHTML = '';
    debugLogs.forEach(log => {
        const logEl = document.createElement('div');
        logEl.className = `debug-log ${log.type}`;
        logEl.innerHTML = `<span class="debug-log-time">${log.timestamp}</span>${log.message}`;
        debugContent.appendChild(logEl);
    });
    debugContent.scrollTop = debugContent.scrollHeight;
}

function clearDebugConsole() {
    debugLogs.length = 0;
    const debugContent = document.getElementById('debug-content');
    if (debugContent) {
        debugContent.innerHTML = '<div class="debug-log info"><span class="debug-log-time">' + new Date().toLocaleTimeString() + '</span>Console cleared</div>';
    }
}

function copyDebugLogs() {
    const text = debugLogs.map(log => `[${log.timestamp}] [${log.type.toUpperCase()}] ${log.message}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
        alert('Логи скопированы в буфер обмена');
    }).catch(err => {
        alert('Ошибка копирования: ' + err);
    });
}

console.log('=== RP LAVKA LOADED ===');
debugLog('=== RP LAVKA LOADED ===', 'info');

// Инициализация Supabase
let supabaseClient;
if (window.supabase) {
    console.log('Initializing Supabase...');
    debugLog('Initializing Supabase...', 'info');
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase initialized');
    debugLog('Supabase initialized', 'info');
} else {
    console.warn('Supabase library not loaded');
    debugLog('Supabase library not loaded', 'warn');
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

// Загрузка ВСЕХ объявлений (без фильтрации по типу)
async function loadListings() {
    if (!supabaseClient) {
        console.log('Supabase not available, showing demo listings');
        debugLog('Supabase not available, showing demo listings', 'warn');
        return;
    }
    
    try {
        debugLog('Loading all listings...', 'info');
        const { data: listings, error } = await supabaseClient
            .from('rplavka_listings')
            .select('*, seller:rplavka_users!seller_id(*)')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(50);
        
        if (error) throw error;
        
        console.log('All listings loaded:', listings);
        debugLog(`Loaded ${listings.length} listings`, 'info');
        
        if (listings && listings.length > 0) {
            renderListings(listings);
        } else {
            // Показываем пустое состояние
            const container = document.getElementById('listings-container');
            container.innerHTML = '<div class="empty-state">Пока нет объявлений</div>';
        }
    } catch (error) {
        console.error('Error loading listings:', error);
        debugLog('Error loading listings: ' + error.message, 'error');
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
    window.currentListing = listing;
    
    document.getElementById('listing-detail-page').style.display = 'block';
    document.getElementById('publications-section').style.display = 'none';
    document.getElementById('user-profile-card').style.display = 'none';
    
    // Заполняем информацию о продавце
    const avatarEl = document.getElementById('detail-seller-avatar');
    if (listing.seller.avatar_url) {
        avatarEl.innerHTML = `<img src="${listing.seller.avatar_url}" alt="Avatar">`;
    } else {
        avatarEl.innerHTML = '👤';
    }
    
    document.getElementById('detail-seller-name').textContent = listing.seller.name;
    document.getElementById('detail-seller-rating').textContent = calculateRating(listing.seller.rating || 0);
    
    // Заполняем информацию о лоте
    document.getElementById('detail-server').textContent = listing.game;
    document.getElementById('detail-amount').textContent = (listing.amount * 1000) + 'к виртов';
    document.getElementById('detail-price').textContent = listing.price + '₽ за 1000к';
    
    // Очищаем калькулятор
    document.getElementById('purchase-amount').value = '';
    document.getElementById('purchase-price').value = '';
    const hintEl = document.getElementById('purchase-hint');
    hintEl.style.display = 'none';
    hintEl.textContent = '';
    hintEl.className = 'purchase-hint';
    
    if (tg) tg.HapticFeedback.impactOccurred('medium');
    debugLog('Opened listing detail: ' + listing.id, 'info');
}

// Закрыть детали лота
function closeListingDetail() {
    document.getElementById('listing-detail-page').style.display = 'none';
    document.getElementById('publications-section').style.display = 'block';
    document.getElementById('user-profile-card').style.display = 'block';
    
    if (tg) tg.HapticFeedback.impactOccurred('light');
}

// Рассчитать стоимость покупки (от количества в тысячах)
function calculatePurchaseFromAmount() {
    const listing = window.currentListing;
    if (!listing) return;
    
    const amountK = parseFloat(document.getElementById('purchase-amount').value) || 0; // В тысячах
    const minAmountK = listing.min_amount || 1000; // Минимум в тысячах
    const maxAmountK = listing.amount * 1000; // Максимум в тысячах
    const pricePerMil = listing.price; // Цена за 1000к (1кк)
    
    const hintEl = document.getElementById('purchase-hint');
    const priceInput = document.getElementById('purchase-price');
    
    if (amountK === 0) {
        hintEl.style.display = 'none';
        priceInput.value = '';
        return;
    }
    
    if (amountK < minAmountK) {
        hintEl.textContent = `⚠️ Минимум ${minAmountK}к виртов (требование продавца)`;
        hintEl.className = 'purchase-hint error';
        hintEl.style.display = 'flex';
        priceInput.value = '';
        return;
    }
    
    if (amountK > maxAmountK) {
        hintEl.textContent = `⚠️ Доступно только ${maxAmountK}к виртов`;
        hintEl.className = 'purchase-hint error';
        hintEl.style.display = 'flex';
        priceInput.value = '';
        return;
    }
    
    const total = (amountK / 1000) * pricePerMil;
    hintEl.style.display = 'none';
    priceInput.value = Math.round(total);
}

// Рассчитать количество (от суммы)
function calculatePurchaseFromPrice() {
    const listing = window.currentListing;
    if (!listing) return;
    
    const total = parseFloat(document.getElementById('purchase-price').value) || 0;
    const pricePerMil = listing.price;
    
    const hintEl = document.getElementById('purchase-hint');
    const amountInput = document.getElementById('purchase-amount');
    
    if (total === 0) {
        hintEl.style.display = 'none';
        amountInput.value = '';
        return;
    }
    
    const amountK = (total / pricePerMil) * 1000; // Переводим в тысячи
    const minAmountK = listing.min_amount || 1000;
    const maxAmountK = listing.amount * 1000;
    
    if (amountK < minAmountK) {
        hintEl.textContent = `⚠️ Минимум ${minAmountK}к виртов (требование продавца)`;
        hintEl.className = 'purchase-hint error';
        hintEl.style.display = 'flex';
        amountInput.value = '';
        return;
    }
    
    if (amountK > maxAmountK) {
        hintEl.textContent = `⚠️ Доступно только ${maxAmountK}к виртов`;
        hintEl.className = 'purchase-hint error';
        hintEl.style.display = 'flex';
        amountInput.value = '';
        return;
    }
    
    hintEl.style.display = 'none';
    amountInput.value = Math.round(amountK);
}

// Купить с баланса
function purchaseWithBalance() {
    const listing = window.currentListing;
    const amountK = parseFloat(document.getElementById('purchase-amount').value) || 0;
    const total = parseFloat(document.getElementById('purchase-price').value) || 0;
    
    if (!listing || amountK === 0 || total === 0) {
        if (tg) tg.showAlert('Укажите количество');
        else alert('Укажите количество');
        return;
    }
    
    const minAmountK = listing.min_amount || 1000;
    const maxAmountK = listing.amount * 1000;
    
    if (amountK < minAmountK) {
        if (tg) tg.showAlert(`Минимум ${minAmountK}к виртов`);
        else alert(`Минимум ${minAmountK}к виртов`);
        return;
    }
    
    if (amountK > maxAmountK) {
        if (tg) tg.showAlert(`Доступно только ${maxAmountK}к виртов`);
        else alert(`Доступно только ${maxAmountK}к виртов`);
        return;
    }
    
    debugLog('Purchase with balance: amount=' + amountK + 'k, total=' + total, 'info');
    
    if (tg) {
        tg.showAlert('⚠️ Функция покупки находится в разработке');
        tg.HapticFeedback.notificationOccurred('warning');
    } else {
        alert('⚠️ Функция покупки находится в разработке');
    }
}

// Пополнить и купить
function purchaseWithTopup() {
    const listing = window.currentListing;
    const amountK = parseFloat(document.getElementById('purchase-amount').value) || 0;
    const total = parseFloat(document.getElementById('purchase-price').value) || 0;
    
    if (!listing || amountK === 0 || total === 0) {
        if (tg) tg.showAlert('Укажите количество');
        else alert('Укажите количество');
        return;
    }
    
    const minAmountK = listing.min_amount || 1000;
    const maxAmountK = listing.amount * 1000;
    
    if (amountK < minAmountK) {
        if (tg) tg.showAlert(`Минимум ${minAmountK}к виртов`);
        else alert(`Минимум ${minAmountK}к виртов`);
        return;
    }
    
    if (amountK > maxAmountK) {
        if (tg) tg.showAlert(`Доступно только ${maxAmountK}к виртов`);
        else alert(`Доступно только ${maxAmountK}к виртов`);
        return;
    }
    
    debugLog('Purchase with topup: amount=' + amountK + 'k, total=' + total, 'info');
    
    if (tg) {
        tg.showAlert('⚠️ Функция покупки находится в разработке');
        tg.HapticFeedback.notificationOccurred('warning');
    } else {
        alert('⚠️ Функция покупки находится в разработке');
    }
}

// Загрузка данных пользователя
function loadUserData() {
    console.log('Loading user data...');
    debugLog('Loading user data...', 'info');
    
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        console.log('User:', user.first_name);
        debugLog('User: ' + user.first_name + ' (ID: ' + user.id + ')', 'info');
        
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
        debugLog('No Telegram user data', 'warn');
        document.getElementById('user-name').textContent = 'Гость';
    }
}

// Загрузка данных с Supabase (имя НИКОГДА не обновляется после первого сохранения)
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
            console.log('Creating new user with LOCKED name...');
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
            console.log('User found, updating avatar only (name is LOCKED)...');
            // Обновляем ТОЛЬКО аватар, имя НИКОГДА не меняется
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
        }
        
        console.log('User data loaded:', userData);
        
        // Обновляем имя на плашке из БД (закрепленное навсегда)
        document.getElementById('user-name').textContent = userData.name;
        
        // Обновляем рейтинг (звёзды от 0 до 5)
        const rating = calculateRating(userData.rating || 0);
        document.getElementById('user-rating').textContent = rating;
        
        // Обновляем баланс
        const balance = userData.balance || 0;
        document.getElementById('user-balance').textContent = balance + ' ₽';
        
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


// Открыть профиль
function openProfile() {
    document.getElementById('profile-page').style.display = 'block';
    document.getElementById('publications-section').style.display = 'none';
    document.getElementById('user-profile-card').style.display = 'none';
    
    // Загружаем данные профиля из БД (закрепленное имя)
    if (window.currentUserData) {
        document.getElementById('profile-name-input').value = window.currentUserData.name;
        document.getElementById('profile-telegram-id').textContent = window.currentUserData.telegram_id || '—';
        document.getElementById('profile-rating-display').textContent = calculateRating(window.currentUserData.rating || 0);
        
        // Обновляем баланс
        const balance = window.currentUserData.balance || 0;
        document.getElementById('user-balance').textContent = balance + ' ₽';
        
        const avatarEl = document.getElementById('profile-avatar-large');
        if (window.currentUserData.avatar_url) {
            avatarEl.innerHTML = `<img src="${window.currentUserData.avatar_url}" alt="Avatar">`;
        }
    }
    
    // Переключаемся на вкладку "Профиль"
    switchProfileTab('info');
    
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
    // Закрываем профиль если он открыт
    document.getElementById('profile-page').style.display = 'none';
    
    // Открываем форму создания
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
    const server = document.getElementById('listing-server').value;
    const amount = document.getElementById('listing-amount').value;
    const minAmount = document.getElementById('listing-min-amount').value;
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
    
    if (!minAmount || minAmount <= 0) {
        if (tg) tg.showAlert('Укажите минимальную продажу');
        else alert('Укажите минимальную продажу');
        return;
    }
    
    if (parseInt(minAmount) > parseInt(amount)) {
        if (tg) tg.showAlert('Минимальная продажа не может быть больше общего количества');
        else alert('Минимальная продажа не может быть больше общего количества');
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
        debugLog('Publishing listing: server=' + server + ', amount=' + amount + ', min=' + minAmount + ', price=' + price, 'info');
        
        // Создаем объявление
        const { error } = await supabaseClient
            .from('rplavka_listings')
            .insert([{
                seller_id: userId,
                game: server,
                amount: parseInt(amount),
                min_amount: parseInt(minAmount),
                price: parseInt(price),
                description: description || `${amount}кк - ${price}₽`,
                status: 'active'
            }]);
        
        if (error) throw error;
        
        debugLog('Listing published successfully', 'info');
        
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
        debugLog('Error publishing: ' + error.message, 'error');
        if (tg) {
            tg.showAlert('Ошибка при публикации: ' + error.message);
        } else {
            alert('Ошибка при публикации: ' + error.message);
        }
    }
}

// Переключение вкладок профиля с анимацией индикатора
function switchProfileTab(tab) {
    const tabs = document.querySelectorAll('.profile-tab');
    const indicator = document.querySelector('.profile-tab-indicator');
    
    // Обновляем активную вкладку
    tabs.forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'info') {
        tabs[0].classList.add('active');
        indicator.style.transform = 'translateX(0%)';
        document.getElementById('profile-tab-info').style.display = 'block';
        document.getElementById('profile-tab-listings').style.display = 'none';
    } else if (tab === 'listings') {
        tabs[1].classList.add('active');
        indicator.style.transform = 'translateX(100%)';
        document.getElementById('profile-tab-info').style.display = 'none';
        document.getElementById('profile-tab-listings').style.display = 'block';
        
        // Загружаем мои объявления
        loadMyListings();
    }
    
    if (tg) tg.HapticFeedback.impactOccurred('light');
}

// Загрузка моих объявлений
async function loadMyListings() {
    if (!supabaseClient || !window.currentUserId) {
        document.getElementById('my-listings-container').innerHTML = '<div class="empty-state">Нет данных</div>';
        return;
    }
    
    try {
        const { data: listings, error } = await supabaseClient
            .from('rplavka_listings')
            .select('*')
            .eq('seller_id', window.currentUserId)
            .eq('status', 'active')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log('My listings loaded:', listings);
        
        if (listings && listings.length > 0) {
            renderMyListings(listings);
        } else {
            document.getElementById('my-listings-container').innerHTML = '<div class="empty-state">У вас пока нет объявлений</div>';
        }
    } catch (error) {
        console.error('Error loading my listings:', error);
        document.getElementById('my-listings-container').innerHTML = '<div class="empty-state">Ошибка загрузки</div>';
    }
}

// Отрисовка моих объявлений
function renderMyListings(listings) {
    const container = document.getElementById('my-listings-container');
    container.innerHTML = '';
    
    listings.forEach(listing => {
        const card = document.createElement('div');
        card.className = 'my-listing-card';
        
        card.innerHTML = `
            <div class="my-listing-info">
                <div class="my-listing-server">${listing.game}</div>
                <div class="my-listing-details">${listing.amount}кк - ${listing.price}₽</div>
            </div>
            <button class="delete-listing-btn" onclick="deleteListing(${listing.id})">🗑️</button>
        `;
        
        container.appendChild(card);
    });
}

// Удалить объявление
async function deleteListing(listingId) {
    if (!supabaseClient) {
        alert('Ошибка: нет подключения к базе данных');
        debugLog('Delete failed: no supabase client', 'error');
        return;
    }
    
    // Используем confirm из Telegram или браузера
    let confirmed;
    if (tg && tg.showConfirm) {
        confirmed = await new Promise(resolve => {
            tg.showConfirm('Удалить это объявление?', resolve);
        });
    } else {
        confirmed = confirm('Удалить это объявление?');
    }
    
    if (!confirmed) {
        debugLog('Delete cancelled by user', 'info');
        return;
    }
    
    try {
        console.log('Deleting listing ID:', listingId);
        debugLog('Deleting listing ID: ' + listingId + ', user: ' + window.currentUserId, 'info');
        
        // Используем delete вместо update для полного удаления
        const { data, error } = await supabaseClient
            .from('rplavka_listings')
            .delete()
            .eq('id', listingId)
            .eq('seller_id', window.currentUserId) // Проверяем что это объявление пользователя
            .select();
        
        if (error) {
            console.error('Delete error details:', error);
            debugLog('Delete error: ' + JSON.stringify(error), 'error');
            throw error;
        }
        
        console.log('Deleted successfully:', data);
        debugLog('Deleted successfully: ' + JSON.stringify(data), 'info');
        
        if (tg) {
            tg.showAlert('Объявление удалено');
            tg.HapticFeedback.notificationOccurred('success');
        } else {
            alert('Объявление удалено');
        }
        
        // Перезагружаем список
        loadMyListings();
        loadListings(); // Обновляем главную страницу
    } catch (error) {
        console.error('Error deleting listing:', error);
        const errorMsg = 'Ошибка при удалении: ' + (error.message || error.hint || 'неизвестная ошибка');
        debugLog('Delete exception: ' + errorMsg, 'error');
        if (tg) {
            tg.showAlert(errorMsg);
        } else {
            alert(errorMsg);
        }
    }
}

// Открыть пополнение баланса
function openTopup() {
    document.getElementById('topup-page').style.display = 'block';
    document.getElementById('profile-page').style.display = 'none';
    document.getElementById('publications-section').style.display = 'none';
    document.getElementById('user-profile-card').style.display = 'none';
    
    // Очищаем форму
    document.getElementById('topup-amount').value = '';
    window.selectedPaymentMethod = null;
    
    // Убираем выделение со всех кнопок
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    if (tg) tg.HapticFeedback.impactOccurred('medium');
    debugLog('Topup page opened', 'info');
}

// Выбрать способ оплаты
function selectPaymentMethod(method) {
    window.selectedPaymentMethod = method;
    
    // Убираем выделение со всех кнопок
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Выделяем выбранную кнопку
    const selectedBtn = document.querySelector(`[data-method="${method}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('selected');
    }
    
    if (tg) tg.HapticFeedback.selectionChanged();
    debugLog('Payment method selected: ' + method, 'info');
}

// Закрыть пополнение
function closeTopup() {
    document.getElementById('topup-page').style.display = 'none';
    document.getElementById('profile-page').style.display = 'block';
    document.getElementById('user-profile-card').style.display = 'none';
    
    if (tg) tg.HapticFeedback.impactOccurred('light');
}

// Обработать пополнение
function processTopup() {
    const amount = document.getElementById('topup-amount').value;
    const method = window.selectedPaymentMethod;
    
    if (!amount || amount < 100) {
        if (tg) tg.showAlert('Минимальная сумма пополнения: 100₽');
        else alert('Минимальная сумма пополнения: 100₽');
        return;
    }
    
    if (!method) {
        if (tg) tg.showAlert('Выберите способ оплаты');
        else alert('Выберите способ оплаты');
        return;
    }
    
    debugLog('Topup attempt: amount=' + amount + ', method=' + method, 'info');
    
    if (tg) {
        tg.showAlert('⚠️ Система пополнения находится на технических работах. Попробуйте позже.');
        tg.HapticFeedback.notificationOccurred('warning');
    } else {
        alert('⚠️ Система пополнения находится на технических работах. Попробуйте позже.');
    }
}

// Делаем функции глобальными
window.openProfile = openProfile;
window.closeProfile = closeProfile;
window.createListing = createListing;
window.closeCreateListing = closeCreateListing;
window.publishListing = publishListing;
window.switchProfileTab = switchProfileTab;
window.loadMyListings = loadMyListings;
window.deleteListing = deleteListing;
window.toggleDebugConsole = toggleDebugConsole;
window.clearDebugConsole = clearDebugConsole;
window.copyDebugLogs = copyDebugLogs;
window.openTopup = openTopup;
window.closeTopup = closeTopup;
window.processTopup = processTopup;
window.selectPaymentMethod = selectPaymentMethod;
window.closeListingDetail = closeListingDetail;
window.calculatePurchaseFromAmount = calculatePurchaseFromAmount;
window.calculatePurchaseFromPrice = calculatePurchaseFromPrice;
window.purchaseWithBalance = purchaseWithBalance;
window.purchaseWithTopup = purchaseWithTopup;
