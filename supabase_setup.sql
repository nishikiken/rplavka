-- Создание таблиц для RP LAVKA
-- Добавляем в существующий проект Supabase

-- Таблица пользователей RP LAVKA (отдельная от campus_bot)
CREATE TABLE IF NOT EXISTS rplavka_users (
    id BIGSERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    rating INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица объявлений о продаже
CREATE TABLE IF NOT EXISTS rplavka_listings (
    id BIGSERIAL PRIMARY KEY,
    seller_id BIGINT REFERENCES rplavka_users(telegram_id) ON DELETE CASCADE,
    game TEXT NOT NULL,
    amount INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    banner_url TEXT,
    status TEXT DEFAULT 'active', -- active, sold, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица сделок
CREATE TABLE IF NOT EXISTS rplavka_deals (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT REFERENCES rplavka_listings(id) ON DELETE CASCADE,
    buyer_id BIGINT REFERENCES rplavka_users(telegram_id) ON DELETE CASCADE,
    seller_id BIGINT REFERENCES rplavka_users(telegram_id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Таблица отзывов
CREATE TABLE IF NOT EXISTS rplavka_reviews (
    id BIGSERIAL PRIMARY KEY,
    deal_id BIGINT REFERENCES rplavka_deals(id) ON DELETE CASCADE,
    reviewer_id BIGINT REFERENCES rplavka_users(telegram_id) ON DELETE CASCADE,
    reviewed_id BIGINT REFERENCES rplavka_users(telegram_id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_rplavka_users_telegram_id ON rplavka_users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_rplavka_listings_seller_id ON rplavka_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_rplavka_listings_status ON rplavka_listings(status);
CREATE INDEX IF NOT EXISTS idx_rplavka_deals_buyer_id ON rplavka_deals(buyer_id);
CREATE INDEX IF NOT EXISTS idx_rplavka_deals_seller_id ON rplavka_deals(seller_id);
CREATE INDEX IF NOT EXISTS idx_rplavka_reviews_reviewed_id ON rplavka_reviews(reviewed_id);

-- Функция для обновления updated_at (если ещё не создана)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_rplavka_users_updated_at BEFORE UPDATE ON rplavka_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rplavka_listings_updated_at BEFORE UPDATE ON rplavka_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Включаем Row Level Security (RLS)
ALTER TABLE rplavka_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rplavka_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rplavka_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rplavka_reviews ENABLE ROW LEVEL SECURITY;

-- Политики доступа (все могут читать, но изменять только свои данные)
CREATE POLICY "Users can view all rplavka users" ON rplavka_users FOR SELECT USING (true);
CREATE POLICY "Users can update own rplavka profile" ON rplavka_users FOR UPDATE USING (true);
CREATE POLICY "Users can insert own rplavka profile" ON rplavka_users FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view active rplavka listings" ON rplavka_listings FOR SELECT USING (status = 'active');
CREATE POLICY "Users can create rplavka listings" ON rplavka_listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own rplavka listings" ON rplavka_listings FOR UPDATE USING (true);

CREATE POLICY "Users can view own rplavka deals" ON rplavka_deals FOR SELECT USING (true);
CREATE POLICY "Users can create rplavka deals" ON rplavka_deals FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own rplavka deals" ON rplavka_deals FOR UPDATE USING (true);

CREATE POLICY "Anyone can view rplavka reviews" ON rplavka_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create rplavka reviews" ON rplavka_reviews FOR INSERT WITH CHECK (true);
