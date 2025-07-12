-- 🚗 Ultimate Auto Marketplace SQL Schema (PostgreSQL)
-- QuickFlip AI - Multi-Agent Car Flipping Platform

-- USERS (internal, no PII)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    user_type VARCHAR(50), -- buyer, seller, agent, etc.
    is_active BOOLEAN DEFAULT TRUE
);

-- SESSIONS
CREATE TABLE sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(user_id),
    login_time TIMESTAMP,
    logout_time TIMESTAMP,
    user_agent TEXT,
    location_city VARCHAR(100),
    location_region VARCHAR(100),
    location_country VARCHAR(100),
    platform VARCHAR(50), -- web, mobile, etc.
    ip_masked VARCHAR(100)
);

-- MARKETPLACES
CREATE TABLE marketplaces (
    marketplace_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    platform_type VARCHAR(50), -- FB, Craigslist, OfferUp, etc.
    group_id VARCHAR(100),
    location_city VARCHAR(100),
    location_region VARCHAR(100)
);

-- CARS/ITEMS
CREATE TABLE cars (
    car_id SERIAL PRIMARY KEY,
    marketplace_id INTEGER REFERENCES marketplaces(marketplace_id),
    seller_id INTEGER REFERENCES users(user_id),
    year INTEGER,
    make VARCHAR(100),
    model VARCHAR(100),
    trim VARCHAR(100),
    vin VARCHAR(100),
    color VARCHAR(50),
    price NUMERIC,
    mileage INTEGER,
    posted_at TIMESTAMP,
    status VARCHAR(50), -- active, sold, removed, etc.
    description TEXT,
    images JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- EVENTS (every action: click, view, search, etc.)
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(session_id),
    user_id INTEGER REFERENCES users(user_id),
    car_id INTEGER REFERENCES cars(car_id),
    event_type VARCHAR(100), -- click, view, search, etc.
    event_detail TEXT, -- button name, filter, etc.
    timestamp TIMESTAMP DEFAULT NOW(),
    platform VARCHAR(50),
    page VARCHAR(100),
    element VARCHAR(100),
    referrer VARCHAR(200)
);

-- MESSAGES/CHATS
CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(session_id),
    sender_id INTEGER REFERENCES users(user_id),
    receiver_id INTEGER REFERENCES users(user_id),
    car_id INTEGER REFERENCES cars(car_id),
    message_type VARCHAR(50), -- text, image, emoji, etc.
    content TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    sentiment VARCHAR(20),
    keywords TEXT
);

-- SEARCHES
CREATE TABLE searches (
    search_id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(session_id),
    user_id INTEGER REFERENCES users(user_id),
    search_term VARCHAR(200),
    filters_applied JSONB,
    sort_order VARCHAR(50),
    results_count INTEGER,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- RECOMMENDATIONS
CREATE TABLE recommendations (
    recommendation_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    agent_id INTEGER REFERENCES users(user_id),
    car_id INTEGER REFERENCES cars(car_id),
    recommendation TEXT,
    made_at TIMESTAMP DEFAULT NOW(),
    accepted BOOLEAN,
    feedback TEXT
);

-- AGENT LOGS
CREATE TABLE agent_logs (
    agent_log_id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(user_id),
    session_id UUID REFERENCES sessions(session_id),
    action VARCHAR(100),
    script_used TEXT,
    result VARCHAR(100),
    timestamp TIMESTAMP DEFAULT NOW()
);

-- CONVERSIONS (purchases, completed actions)
CREATE TABLE conversions (
    conversion_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    car_id INTEGER REFERENCES cars(car_id),
    session_id UUID REFERENCES sessions(session_id),
    conversion_type VARCHAR(100), -- purchase, bid, etc.
    amount NUMERIC,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- MICRO INTERACTIONS (scrolls, hovers, time on page, etc.)
CREATE TABLE micro_interactions (
    micro_id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(session_id),
    user_id INTEGER REFERENCES users(user_id),
    car_id INTEGER REFERENCES cars(car_id),
    interaction_type VARCHAR(100), -- scroll, hover, pause, etc.
    element VARCHAR(100),
    value TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- IMAGE ENGAGEMENT (which images/angles get clicked/shared)
CREATE TABLE image_engagement (
    image_engagement_id SERIAL PRIMARY KEY,
    car_id INTEGER REFERENCES cars(car_id),
    session_id UUID REFERENCES sessions(session_id),
    user_id INTEGER REFERENCES users(user_id),
    image_url TEXT,
    action VARCHAR(50), -- view, click, share, etc.
    timestamp TIMESTAMP DEFAULT NOW()
);

-- PRICE CHANGES
CREATE TABLE price_changes (
    price_change_id SERIAL PRIMARY KEY,
    car_id INTEGER REFERENCES cars(car_id),
    old_price NUMERIC,
    new_price NUMERIC,
    changed_at TIMESTAMP DEFAULT NOW()
);

-- NEGOTIATION LOGS
CREATE TABLE negotiation_logs (
    negotiation_id SERIAL PRIMARY KEY,
    car_id INTEGER REFERENCES cars(car_id),
    session_id UUID REFERENCES sessions(session_id),
    user_id INTEGER REFERENCES users(user_id),
    message_id INTEGER REFERENCES messages(message_id),
    negotiation_step VARCHAR(100),
    offer_amount NUMERIC,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- VIRAL EVENTS (spikes, shares, group effects)
CREATE TABLE viral_events (
    viral_event_id SERIAL PRIMARY KEY,
    car_id INTEGER REFERENCES cars(car_id),
    event_type VARCHAR(100), -- share, spike, etc.
    platform VARCHAR(50),
    group_id VARCHAR(100),
    detected_at TIMESTAMP DEFAULT NOW(),
    details TEXT
);

-- GEO STATS (location-based analytics)
CREATE TABLE geo_stats (
    geo_id SERIAL PRIMARY KEY,
    session_id UUID REFERENCES sessions(session_id),
    user_id INTEGER REFERENCES users(user_id),
    car_id INTEGER REFERENCES cars(car_id),
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100),
    timestamp TIMESTAMP DEFAULT NOW()
);

-- DEAL ANALYSIS (for the multi-agent system)
CREATE TABLE deal_analysis (
    analysis_id SERIAL PRIMARY KEY,
    car_id INTEGER REFERENCES cars(car_id),
    scout_score DECIMAL(3,2), -- 0.00 to 1.00
    valuation_score DECIMAL(3,2),
    inspection_score DECIMAL(3,2),
    negotiator_score DECIMAL(3,2),
    orchestrator_score DECIMAL(3,2),
    overall_score DECIMAL(3,2),
    profit_potential NUMERIC,
    risk_level VARCHAR(20), -- low, medium, high
    recommended_action VARCHAR(100),
    analysis_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- AGENT PERFORMANCE TRACKING
CREATE TABLE agent_performance (
    performance_id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES users(user_id),
    agent_type VARCHAR(50), -- scout, valuation, inspection, etc.
    success_rate DECIMAL(5,4), -- 0.0000 to 1.0000
    total_actions INTEGER,
    successful_actions INTEGER,
    average_response_time INTEGER, -- milliseconds
    last_updated TIMESTAMP DEFAULT NOW()
);

-- INDEXES for fast analytics
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_car_id ON events(car_id);
CREATE INDEX idx_events_timestamp ON events(timestamp);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_make_model ON cars(make, model);
CREATE INDEX idx_cars_price ON cars(price);
CREATE INDEX idx_cars_posted_at ON cars(posted_at);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_car_id ON messages(car_id);
CREATE INDEX idx_conversions_user_id ON conversions(user_id);
CREATE INDEX idx_conversions_car_id ON conversions(car_id);
CREATE INDEX idx_deal_analysis_car_id ON deal_analysis(car_id);
CREATE INDEX idx_deal_analysis_overall_score ON deal_analysis(overall_score);
CREATE INDEX idx_agent_performance_agent_type ON agent_performance(agent_type);

-- Add some sample data for testing
INSERT INTO users (user_type) VALUES 
('seller'),
('buyer'),
('agent'),
('admin');

INSERT INTO marketplaces (name, platform_type, location_city, location_region) VALUES 
('Facebook Marketplace', 'facebook', 'Los Angeles', 'CA'),
('Craigslist', 'craigslist', 'Los Angeles', 'CA'),
('OfferUp', 'offerup', 'Los Angeles', 'CA'),
('CarGurus', 'cargurus', 'Los Angeles', 'CA'); 