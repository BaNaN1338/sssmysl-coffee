const STORAGE_KEY = 'smysl_qrb_menu_v3';
        const STORY_DURATION = 6000;
        const IS_ANDROID_APP = new URLSearchParams(window.location.search).get('app') === 'android';

        const STORY_THEMES = {
            caramel: { gradient: 'linear-gradient(155deg, #E2A45E 0%, #D48C46 42%, #A55F22 100%)', icon: 'ph-fill ph-percent' },
            green:   { gradient: 'linear-gradient(155deg, #9BB166 0%, #7B9244 45%, #3F4D20 100%)', icon: 'ph-fill ph-coffee' },
            dark:    { gradient: 'linear-gradient(155deg, #3A451E 0%, #252E13 58%, #151B0A 100%)', icon: 'ph-bold ph-download-simple' },
            cream:   { gradient: 'linear-gradient(155deg, #FBF8EC 0%, #E9EFE0 62%, #C9D6B3 100%)', icon: 'ph-fill ph-storefront' },
            rose:    { gradient: 'linear-gradient(155deg, #E8B4B8 0%, #C97C86 52%, #7F3242 100%)', icon: 'ph-fill ph-heart' }
        };

        // Категории меню в стиле verymatch.qrbooster.ru/menu
        const MENU_CATEGORIES = [
            { id: 'seasonal', title: 'Сезонное', icon: '🔥' },
            { id: 'signature', title: 'Авторские', icon: '✨' },
            { id: 'coffee', title: 'Кофе', icon: '☕' },
            { id: 'noncoffee', title: 'Не кофе', icon: '🍵' },
            { id: 'tea', title: 'Чай', icon: '🫖' }
        ];

        // Полное меню кофейни «Смысл»
        const defaultAppState = {
            schemaVersion: 2,
            ytimesMap: null,
            ytimesIgnored: [],
            menuSyncedAt: null,
            menuSyncSource: null,
            happyHourActive: false,
            discountPercent: 0,
            workingHours: '08:00 – 22:00',
            categoryOrder: ['seasonal', 'signature', 'coffee', 'noncoffee', 'tea'],
            stories: [
                { id: 'story-discount', title: 'Будни 12–16', subtitle: 'Скидка −20% на всё меню. Загляните в гости в будний день с 12:00 до 16:00.', badge: 'Акция', theme: 'caramel', image: '', action: 'link', link: '#cat-seasonal', ctaLabel: 'Смотреть меню', active: true },
                { id: 'story-seasonal', title: 'Сезонное меню', subtitle: 'Крем-матча, пунш и яблочный пай — уже в меню кофейни.', badge: 'Новинки', theme: 'green', image: '', action: 'link', link: '#cat-seasonal', ctaLabel: 'Открыть сезонное', active: true },
                { id: 'story-app', title: 'В телефон', subtitle: 'Скачайте APK для Android или добавьте иконку кофейни на главный экран.', badge: 'iOS & Android', theme: 'dark', image: '', action: 'install', link: '', ctaLabel: 'Установить', active: true }
            ],
            supabase: {
                url: 'https://jbsjtvpkgofiwiazqczz.supabase.co',
                anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impic2p0dnBrZ29maXdpYXpxY3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MzY3OTUsImV4cCI6MjEwOTMxMjc5NX0.6rjCKrYI5r7zY8stG5CAA0L9Vrpz68IQ_XFM_RBSpSs'
            },
            selectedLocationId: 1,
            pickupTime: 'Через 7–10 мин',
            locations: [
                { id: 1, shortName: 'Рожда', address: 'Кофейня «Смысл» — Рожда', hours: '08:00 – 22:00' },
                { id: 2, shortName: 'Горького', address: 'Кофейня «Смысл» — ул. Горького', hours: '08:00 – 22:00' }
            ],
            drinks: [
                // 1. СЕЗОННОЕ МЕНЮ
                { id: 's1', category: 'seasonal', title: 'Шоколадный какао с финиками', desc: 'Густой бархатный какао с карамельной сладостью натуральных фиников', basePrice: 420, defaultVol: '350 мл', volumeOptions: [{ label: '350 мл', price: 420 }], kbzhu: '245 ккал', art: 'cocoa', stopped: false },
                { id: 's2', category: 'seasonal', title: 'Какао-пунш с вишневой пенкой', desc: 'Согревающий пряный какао под воздушной шапкой вишневой крем-пены', basePrice: 420, defaultVol: '350 мл', volumeOptions: [{ label: '350 мл', price: 420 }], kbzhu: '260 ккал', art: 'cherry', stopped: false },
                { id: 's3', category: 'seasonal', title: 'Латте Яблочный пирог', desc: 'Нежный эспрессо с молоком, нотами печеного яблока, корицы и крамбла', basePrice: 420, defaultVol: '350 мл', volumeOptions: [{ label: '350 мл', price: 420 }], kbzhu: '215 ккал', art: 'latte', stopped: false },
                { id: 's4', category: 'seasonal', title: 'Чай апельсиновый ройбуш с карамелью', desc: 'Ароматный южноафриканский ройбуш со свежим апельсином и мягкой карамелью', basePrice: 420, defaultVol: '350 мл', volumeOptions: [{ label: '350 мл', price: 420 }], kbzhu: '95 ккал', art: 'tea', stopped: false },
                { id: 's5', category: 'seasonal', title: 'Фильтр рябина-лимон', desc: 'Яркий черный фильтр-кофе с терпкой сладостью красной рябины и цитрусом', basePrice: 420, defaultVol: '350 мл', volumeOptions: [{ label: '350 мл', price: 420 }], kbzhu: '65 ккал', art: 'filter', stopped: false },
                { id: 's6', category: 'seasonal', title: 'Пряная тыквенная матча', desc: 'Японский зеленый чай матча со специями, тыквенным пюре и шелковистым молоком', basePrice: 400, defaultVol: '350 мл', volumeOptions: [{ label: '350 мл', price: 400 }], kbzhu: '190 ккал', art: 'matcha', stopped: false },
                { id: 's7', category: 'seasonal', title: 'Шоколадная крем-матча с мятой', desc: 'Слоистый напиток на основе церемониальной матчи, шоколада и освежающей мяты', basePrice: 400, defaultVol: '350 мл', volumeOptions: [{ label: '350 мл', price: 400 }], kbzhu: '220 ккал', art: 'matcha', stopped: false },
                { id: 's8', category: 'seasonal', title: 'Жасминовая крем-матча с медом', desc: 'Цветочный аромат жасмина, взбитые сливки, матча и цветочный мёд', basePrice: 400, defaultVol: '350 мл', volumeOptions: [{ label: '350 мл', price: 400 }], kbzhu: '210 ккал', art: 'matcha', stopped: false },

                // 2. АВТОРСКИЕ НАПИТКИ
                { id: 'a1', category: 'signature', title: 'Латте халва', desc: 'Фирменный сливочный латте с настоящей тахинной халвой и ореховым послевкусием', basePrice: 400, defaultVol: '350 мл', volumeOptions: [{ label: '350 мл', price: 400 }], kbzhu: '240 ккал', art: 'latte', stopped: false },
                { id: 'a2', category: 'signature', title: 'Латте бузина-малина', desc: 'Ягодно-цветочный авторский латте с сиропом бузины и спелой малиной', basePrice: 400, defaultVol: '350 мл', volumeOptions: [{ label: '350 мл', price: 400 }], kbzhu: '195 ккал', art: 'cherry', stopped: false },
                { id: 'a3', category: 'signature', title: 'Латте синнабон', desc: 'Вкус свежеиспеченной булочки с корицей и сливочным крем-чизом в чашке', basePrice: 400, defaultVol: '350 мл', volumeOptions: [{ label: '350 мл', price: 400 }], kbzhu: '250 ккал', art: 'latte', stopped: false },
                { id: 'a4', category: 'signature', title: 'Раф соленая карамель', desc: 'Взбитый эспрессо со сливками и тягучей домашней карамелью с морской солью', basePrice: 400, defaultVol: '350 мл', volumeOptions: [{ label: '350 мл', price: 400 }], kbzhu: '285 ккал', art: 'cappuccino', stopped: false },
                { id: 'a5', category: 'signature', title: 'Раф лаванда', desc: 'Воздушный сливочный кофе с натуральными цветами горной крымской лаванды', basePrice: 400, defaultVol: '350 мл', volumeOptions: [{ label: '350 мл', price: 400 }], kbzhu: '270 ккал', art: 'cappuccino', stopped: false },

                // 3. КЛАССИЧЕСКИЙ И АЛЬТЕРНАТИВНЫЙ КОФЕ
                { id: 'c1', category: 'coffee', title: 'Эспрессо', desc: 'Плотный двойной шот из 100% спешелти арабики свежей обжарки', basePrice: 240, defaultVol: 'Порция', volumeOptions: [{ label: 'Порция', price: 240 }], kbzhu: '10 ккал', art: 'americano', stopped: false },
                { id: 'c2', category: 'coffee', title: 'Американо', desc: 'Чистый черный кофе на базе двойного эспрессо с мягким балансом', basePrice: 240, defaultVol: '200 мл', volumeOptions: [{ label: '200 мл', price: 240 }, { label: '350 мл', price: 290 }], kbzhu: '15 ккал', art: 'americano', stopped: false },
                { id: 'c3', category: 'coffee', title: 'Капучино', desc: 'Классика с выраженным вкусом эспрессо и глянцевой молочной микропеной', basePrice: 320, defaultVol: '200 мл', volumeOptions: [{ label: '200 мл', price: 320 }, { label: '350 мл', price: 350 }], kbzhu: '140 ккал', art: 'cappuccino', stopped: false },
                { id: 'c4', category: 'coffee', title: 'Флэт уайт', desc: 'Насыщенный кофейный вкус двойного эспрессо с тонким слоем бархатного молока', basePrice: 330, defaultVol: '200 мл', volumeOptions: [{ label: '200 мл', price: 330 }], kbzhu: '130 ккал', art: 'cappuccino', stopped: false },
                { id: 'c5', category: 'coffee', title: 'Латте', desc: 'Мягкий и нежный молочно-кофейный напиток с легкой воздушной пенкой', basePrice: 350, defaultVol: '350 мл', volumeOptions: [{ label: '350 мл', price: 350 }], kbzhu: '175 ккал', art: 'latte', stopped: false },
                { id: 'c6', category: 'coffee', title: 'Раф', desc: 'Кофе, взбитый паром вместе с нежными сливками и ванильным сахаром', basePrice: 380, defaultVol: '350 мл', volumeOptions: [{ label: '350 мл', price: 380 }], kbzhu: '260 ккал', art: 'latte', stopped: false },
                { id: 'c7', category: 'coffee', title: 'Фильтр', desc: 'Свежезаваренный черный кофе с яркими ягодно-фруктовыми дескрипторами зерна', basePrice: 270, defaultVol: '200 мл', volumeOptions: [{ label: '200 мл', price: 270 }, { label: '350 мл', price: 340 }], kbzhu: '12 ккал', art: 'filter', stopped: false },
                { id: 'c8', category: 'coffee', title: 'Пуровер (V60)', desc: 'Ручное заваривание через воронку Hario V60 для максимальной чистоты вкуса', basePrice: 340, defaultVol: '250 мл', volumeOptions: [{ label: '250 мл', price: 340 }], kbzhu: '12 ккал', art: 'filter', stopped: false },
                { id: 'c9', category: 'coffee', title: 'Аэропресс', desc: 'Плотный и сочный альтернативный кофе, заваренный под давлением воздуха', basePrice: 340, defaultVol: '250 мл', volumeOptions: [{ label: '250 мл', price: 340 }], kbzhu: '12 ккал', art: 'filter', stopped: false },

                // 4. НЕ КОФЕ
                { id: 'n1', category: 'noncoffee', title: 'Какао', desc: 'Натуральный согревающий какао на молоке с насыщенным шоколадным вкусом', basePrice: 300, defaultVol: '200 мл', volumeOptions: [{ label: '200 мл', price: 300 }, { label: '350 мл', price: 330 }], kbzhu: '210 ккал', art: 'cocoa', stopped: false },
                { id: 'n2', category: 'noncoffee', title: 'Матча латте', desc: 'Японский пудровый зеленый чай Удзи, взбитый с теплым молоком', basePrice: 300, defaultVol: '200 мл', volumeOptions: [{ label: '200 мл', price: 300 }, { label: '350 мл', price: 350 }], kbzhu: '155 ккал', art: 'matcha', stopped: false },
                { id: 'n3', category: 'noncoffee', title: 'Пряный чай латте', desc: 'Согревающий индийский масала-чай с кардамоном, корицей, имбирем и молоком', basePrice: 370, defaultVol: '350 мл', volumeOptions: [{ label: '350 мл', price: 370 }], kbzhu: '165 ккал', art: 'latte', stopped: false },

                // 5. ЧАЙ
                { id: 't1', category: 'tea', title: 'Облепиховый чай', desc: 'Витаминный согревающий чай из протертой алтайской облепихи, апельсина и мёда', basePrice: 300, defaultVol: '200 мл', volumeOptions: [{ label: '200 мл', price: 300 }, { label: '350 мл', price: 350 }], kbzhu: '115 ккал', art: 'tea', stopped: false },
                { id: 't2', category: 'tea', title: 'Листовой чай (на выбор)', desc: 'Отборный крупнолистовой чай: Жасмин, Улун, Ромашка, Бергамот или Ассам', basePrice: 250, defaultVol: '400 мл', volumeOptions: [{ label: '400 мл', price: 250 }], kbzhu: '5 ккал', art: 'tea', isLeafTea: true, stopped: false }
            ],
            volumes: [
                { label: '200 мл', addPrice: 0 },
                { label: '350 мл', addPrice: 50 }
            ],
            milks: [
                { label: 'Классическое', addPrice: 0 },
                { label: 'Кокосовое', addPrice: 100 },
                { label: 'Банановое', addPrice: 100 },
                { label: 'Миндальное', addPrice: 100 },
                { label: 'Овсяное', addPrice: 100 }
            ],
            syrups: [
                { label: 'Без сиропа', addPrice: 0 },
                { label: 'Солёная карамель', addPrice: 70 },
                { label: 'Ваниль', addPrice: 70 },
                { label: 'Лесной орех', addPrice: 70 },
                { label: 'Лаванда', addPrice: 70 }
            ],
            teaVarieties: ['Жасмин', 'Улун', 'Ромашка', 'Бергамот', 'Ассам']
        };

        let appState = loadLocalState();
        let isAdminMode = false;
        let activeCategoryFilter = 'all';
        let currentSearchQuery = '';
        let cart = [];
        let selectedOrderType = 'TOGO';
        let activeCustomizer = {
            drinkId: 'c3',
            volIndex: 0,
            milkIndex: 0,
            syrupIndex: 0,
            teaVariety: 'Жасмин'
        };
        let deferredPwaPrompt = null;

        function cloneDefaultState() {
            return JSON.parse(JSON.stringify(defaultAppState));
        }

        function getSupabaseBaseUrl(rawUrl) {
            return String(rawUrl || '')
                .trim()
                .replace(/\/+$/, '')
                .replace(/\/rest\/v1\/?$/i, '')
                .replace(/\/+$/, '');
        }

        function isCurrentStateShape(state) {
            if (!state || typeof state !== 'object') return false;
            if (state.schemaVersion === 2) return true;
            const categoryIds = new Set(MENU_CATEGORIES.map(c => c.id));
            return Array.isArray(state.stories) &&
                Array.isArray(state.drinks) &&
                state.drinks.length > 0 &&
                state.drinks.every(drink => drink && categoryIds.has(drink.category));
        }

        function normalizeCategoryOrder(order) {
            const allIds = MENU_CATEGORIES.map(category => category.id);
            const result = [];
            if (Array.isArray(order)) {
                order.forEach(id => {
                    if (allIds.includes(id) && !result.includes(id)) result.push(id);
                });
            }
            allIds.forEach(id => {
                if (!result.includes(id)) result.push(id);
            });
            return result;
        }

        function getOrderedCategories() {
            return normalizeCategoryOrder(appState.categoryOrder)
                .map(id => MENU_CATEGORIES.find(category => category.id === id))
                .filter(Boolean);
        }

        function applySupabaseCredentials(target, source) {
            const fallback = defaultAppState.supabase;
            const candidate = source && typeof source === 'object' ? source : {};
            target.supabase = {
                url: getSupabaseBaseUrl(candidate.url) || fallback.url,
                anonKey: (typeof candidate.anonKey === 'string' && candidate.anonKey) ? candidate.anonKey : fallback.anonKey
            };
            return target;
        }

        let supabaseClient = null;
        let supabaseClientConfigKey = '';

        function getSupabaseClient() {
            if (!window.supabase || !appState.supabase.url || !appState.supabase.anonKey) return null;
            const configKey = `${appState.supabase.url}|${appState.supabase.anonKey}`;
            if (!supabaseClient || supabaseClientConfigKey !== configKey) {
                supabaseClient = window.supabase.createClient(appState.supabase.url, appState.supabase.anonKey, {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true,
                        detectSessionInUrl: false
                    }
                });
                supabaseClientConfigKey = configKey;
            }
            return supabaseClient;
        }

        function loadLocalState() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                const base = cloneDefaultState();
                if (!raw) return base;

                const parsed = JSON.parse(raw);
                applySupabaseCredentials(base, parsed.supabase);

                // Старые версии сайта имели другую структуру меню — сбрасываем их,
                // сохраняя только пароль владельца и доступ к Supabase.
                if (!isCurrentStateShape(parsed)) return base;

                const merged = Object.assign(base, parsed);
                merged.schemaVersion = 2;
                Object.keys(merged).forEach(key => {
                    if (!Object.prototype.hasOwnProperty.call(defaultAppState, key)) delete merged[key];
                });
                applySupabaseCredentials(merged, parsed.supabase);
                merged.categoryOrder = normalizeCategoryOrder(merged.categoryOrder);
                if (!Array.isArray(merged.stories)) merged.stories = cloneDefaultState().stories;
                merged.drinks = merged.drinks.map(drink => normalizeDrinkVolumeOptions(drink, merged.volumes));
                merged.happyHourActive = false;
                merged.discountPercent = 0;
                return merged;
            } catch (e) {
                return cloneDefaultState();
            }
        }

        function normalizeCloudConfig(config) {
            const base = cloneDefaultState();
            if (!config || typeof config !== 'object') return base;

            // Конфиг от старой версии сайта (без schemaVersion) несовместим
            // с текущим меню и структурой сторис.
            if (config.schemaVersion !== 2) {
                applySupabaseCredentials(base, config.supabase);
                return base;
            }

            const merged = Object.assign(base, config);
            merged.schemaVersion = 2;
            Object.keys(merged).forEach(key => {
                if (!Object.prototype.hasOwnProperty.call(defaultAppState, key)) delete merged[key];
            });
            applySupabaseCredentials(merged, config.supabase);

            if (!Array.isArray(merged.stories)) merged.stories = cloneDefaultState().stories;
            if (!Array.isArray(merged.drinks) || merged.drinks.length === 0) merged.drinks = cloneDefaultState().drinks;
            if (!Array.isArray(merged.locations) || merged.locations.length === 0) merged.locations = cloneDefaultState().locations;
            if (!Array.isArray(merged.volumes) || merged.volumes.length === 0) merged.volumes = cloneDefaultState().volumes;
            if (!Array.isArray(merged.milks) || merged.milks.length === 0) merged.milks = cloneDefaultState().milks;
            if (!Array.isArray(merged.syrups) || merged.syrups.length === 0) merged.syrups = cloneDefaultState().syrups;
            if (!Array.isArray(merged.teaVarieties) || merged.teaVarieties.length === 0) merged.teaVarieties = cloneDefaultState().teaVarieties;
            merged.drinks = merged.drinks.map(drink => normalizeDrinkVolumeOptions(drink, merged.volumes));
            merged.categoryOrder = normalizeCategoryOrder(merged.categoryOrder);
            if (!merged.locations.some(location => location.id === merged.selectedLocationId)) {
                merged.selectedLocationId = merged.locations[0].id;
            }
            merged.happyHourActive = false;
            merged.discountPercent = 0;
            return merged;
        }

        // Генерация фирменных иллюстраций напитков для карточек в стиле QRBooster
        function getDrinkArtSvg(artType) {
            const palettes = {
                cappuccino: { bg: '#E9EFE0', cup: '#7B9244', top: '#D48C46', accent: '#F6F4E8' },
                latte:      { bg: '#F4EFE4', cup: '#D48C46', top: '#FFFFFF', accent: '#7B9244' },
                americano:  { bg: '#EAE6DF', cup: '#2C221E', top: '#D48C46', accent: '#7B9244' },
                matcha:     { bg: '#E3EED6', cup: '#6C8E3A', top: '#E9F5DB', accent: '#252E13' },
                cocoa:      { bg: '#F2E8E1', cup: '#5A3A29', top: '#F6F4E8', accent: '#D48C46' },
                cherry:     { bg: '#F6E6E8', cup: '#7F3242', top: '#FCE8EB', accent: '#F6F4E8' },
                tea:        { bg: '#FBF0D9', cup: '#D9822B', top: '#FFE8B3', accent: '#7B9244' },
                filter:     { bg: '#E9EFE0', cup: '#3D2B24', top: '#C68B59', accent: '#7B9244' }
            };
            const p = palettes[artType] || palettes.cappuccino;

            return `
            <svg viewBox="0 0 120 120" class="w-full h-full select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="120" height="120" rx="22" fill="${p.bg}"/>
                <!-- Мягкое свечение -->
                <circle cx="60" cy="62" r="40" fill="#FFFFFF" fill-opacity="0.65"/>
                <!-- Пар -->
                <path d="M50 25 C48 19, 54 16, 51 11" stroke="${p.cup}" stroke-width="2.2" stroke-linecap="round" opacity="0.65"/>
                <path d="M62 23 C60 17, 66 14, 63 9" stroke="${p.cup}" stroke-width="2.2" stroke-linecap="round" opacity="0.65"/>
                <path d="M72 26 C70 20, 76 17, 73 12" stroke="${p.cup}" stroke-width="2.2" stroke-linecap="round" opacity="0.65"/>
                <!-- Стаканчик -->
                <path d="M37 36 H83 L77.5 96 C77 100.5 73 104 68.5 104 H51.5 C47 104 43 100.5 42.5 96 L37 36Z" fill="${p.cup}"/>
                <!-- Крафтовый капхолдер Смысл -->
                <path d="M39 54 H81 L78.8 79 H41.2 L39 54Z" fill="#7B9244"/>
                <image href="smysl-wordmark.png" x="42" y="61" width="36" height="14.5" preserveAspectRatio="xMidYMid meet" opacity="0.95"></image>
                <!-- Пенка сверху -->
                <ellipse cx="60" cy="36" rx="23" ry="5.5" fill="${p.top}"/>
                <ellipse cx="60" cy="36" rx="17" ry="3" fill="${p.accent}" opacity="0.5"/>
            </svg>`;
        }

        // ================= ОБЪЁМЫ И ЦЕНЫ ПОЗИЦИЙ =================
        function normalizeDrinkVolumeOptions(drink, fallbackVolumes) {
            if (!drink || typeof drink !== 'object') return drink;

            const volumes = (Array.isArray(fallbackVolumes) && fallbackVolumes.length)
                ? fallbackVolumes
                : defaultAppState.volumes;

            if (!Array.isArray(drink.volumeOptions) || drink.volumeOptions.length === 0) {
                const defaultDrink = defaultAppState.drinks.find(item => item.id === drink.id);
                if (defaultDrink && Array.isArray(defaultDrink.volumeOptions) && defaultDrink.volumeOptions.length > 0) {
                    drink.volumeOptions = defaultDrink.volumeOptions.map(v => ({ label: v.label, price: v.price }));
                }
            }

            if (!Array.isArray(drink.volumeOptions) || drink.volumeOptions.length === 0) {
                const base = Number(drink.basePrice) || 0;
                drink.volumeOptions = volumes.map(v => ({
                    label: String(v.label || 'Порция'),
                    price: base + (Number(v.addPrice) || 0)
                }));
            } else {
                drink.volumeOptions = drink.volumeOptions
                    .map(v => ({
                        label: String(v.label || '').trim() || 'Порция',
                        price: Math.max(0, Number(v.price) || 0)
                    }))
                    .filter(v => v.label);
            }

            if (!drink.volumeOptions.length) {
                drink.volumeOptions = [{
                    label: drink.defaultVol || 'Порция',
                    price: Math.max(0, Number(drink.basePrice) || 0)
                }];
            }

            drink.stoppedVolumes = Array.isArray(drink.stoppedVolumes)
                ? drink.stoppedVolumes.map(value => String(value).trim()).filter(Boolean)
                : [];
            drink.basePrice = Number(drink.volumeOptions[0].price) || 0;
            drink.defaultVol = drink.volumeOptions[0].label;
            return drink;
        }

        function getDrinkVolumeOptions(drink) {
            normalizeDrinkVolumeOptions(drink, appState.volumes);
            return drink.volumeOptions;
        }

        function isVolumeStopped(drink, label) {
            return !!(drink && Array.isArray(drink.stoppedVolumes) && drink.stoppedVolumes.includes(label));
        }

        function calculatePrice(basePrice, addPrice = 0) {
            const regularTotal = basePrice + addPrice;
            if (appState.happyHourActive) {
                const discounted = Math.round(regularTotal * (1 - appState.discountPercent / 100));
                return { finalPrice: discounted, regularPrice: regularTotal, isDiscounted: true };
            }
            return { finalPrice: regularTotal, regularPrice: regularTotal, isDiscounted: false };
        }

        // ================= РЕНДЕР ЛИПКИХ ТАБОВ КАТЕГОРИЙ =================
        function renderCategoryPills() {
            const container = document.getElementById('categoryPillsContainer');
            const pills = [
                { id: 'all', title: 'Все', icon: '' },
                ...getOrderedCategories()
            ];

            container.innerHTML = pills.map(cat => {
                const isActive = activeCategoryFilter === cat.id;
                return `
                    <button onclick="selectCategoryPill('${cat.id}')" data-category-id="${cat.id}"
                        class="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition flex items-center gap-1 shrink-0 ${
                            isActive
                                ? 'bg-smysl-green text-smysl-cream shadow-sm'
                                : 'bg-white text-smysl-greenDeep/80 hover:bg-smysl-greenSoft border border-smysl-green/15'
                        }">
                        ${cat.icon ? `<span>${cat.icon}</span>` : ''}
                        <span>${cat.title}</span>
                    </button>
                `;
            }).join('');
        }

        function selectCategoryPill(catId) {
            const previousCategory = activeCategoryFilter;
            const orderedIds = ['all', ...getOrderedCategories().map(category => category.id)];
            const previousIndex = orderedIds.indexOf(previousCategory);
            const nextIndex = orderedIds.indexOf(catId);

            activeCategoryFilter = catId;
            renderCategoryPills();

            // В мобильном приложении сдвигаем ленту категорий на одну позицию
            // в направлении выбранной категории.
            requestAnimationFrame(() => {
                const container = document.getElementById('categoryPillsContainer');
                const button = container ? container.querySelector(`[data-category-id="${catId}"]`) : null;
                if (!container || !button) return;
                if (previousIndex === -1 || nextIndex === -1 || previousIndex === nextIndex) return;

                const direction = nextIndex > previousIndex ? 1 : -1;
                const step = button.offsetWidth + 6;
                if (container.scrollWidth > container.clientWidth) {
                    container.scrollBy({ left: direction * step, behavior: 'smooth' });
                }

                setTimeout(() => {
                    if (!button.isConnected) return;
                    const buttonRect = button.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();
                    if (buttonRect.left < containerRect.left || buttonRect.right > containerRect.right) {
                        button.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }
                }, 280);
            });

            if (catId === 'all') {
                renderMenuSections();
                window.scrollTo({ top: 220, behavior: 'smooth' });
            } else {
                const secEl = document.getElementById(`cat-${catId}`);
                if (secEl) {
                    secEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    renderMenuSections();
                }
            }
        }

        function toggleSearchInput() {
            const box = document.getElementById('searchBarCollapse');
            const input = document.getElementById('menuSearchInput');
            box.classList.toggle('hidden');
            if (!box.classList.contains('hidden')) {
                input.focus();
            } else {
                clearMenuSearch();
            }
        }

        function handleMenuSearch(val) {
            currentSearchQuery = val.trim().toLowerCase();
            renderMenuSections();
        }

        function clearMenuSearch() {
            currentSearchQuery = '';
            document.getElementById('menuSearchInput').value = '';
            renderMenuSections();
        }

        // ================= РЕНДЕР 2-КОЛОНОЧНОЙ СЕТКИ МЕНЮ (QRBOOSTER STYLE) =================
        function renderMenuSections() {
            const wrapper = document.getElementById('menuSectionsWrapper');
            let html = '';

            getOrderedCategories().forEach(cat => {
                const items = appState.drinks.filter(d => {
                    const matchCat = d.category === cat.id;
                    const matchSearch = !currentSearchQuery ||
                        d.title.toLowerCase().includes(currentSearchQuery) ||
                        (d.desc && d.desc.toLowerCase().includes(currentSearchQuery));
                    return matchCat && matchSearch;
                });

                if (items.length === 0 && !isAdminMode) return;

                const cardsHtml = items.map(drink => {
                    const volumeOptions = getDrinkVolumeOptions(drink);
                    const availableVolumes = volumeOptions.filter(volume => !isVolumeStopped(drink, volume.label));
                    const firstVolume = availableVolumes[0] || volumeOptions[0] || { label: drink.defaultVol || 'Порция', price: drink.basePrice || 0 };
                    const priceObj = calculatePrice(firstVolume.price, 0);
                    const isStopped = !!drink.stopped || availableVolumes.length === 0;
                    const cardArt = drink.image
                        ? `<img src="${escapeHtml(drink.image)}" alt="${escapeHtml(drink.title)}" class="w-full h-full object-cover" loading="lazy">`
                        : getDrinkArtSvg(drink.art);

                    return `
                    <div onclick="${isStopped && !isAdminMode ? '' : `openDrinkCustomizer('${drink.id}')`}"
                        class="group bg-white rounded-[22px] p-2.5 shadow-qrb hover:shadow-qrb-hover border border-smysl-green/10 flex flex-col justify-between transition relative ${
                            isStopped ? 'opacity-60' : 'cursor-pointer active:scale-[0.99]'
                        }">
                        
                        <div>
                            <!-- Квадратный визуал напитка сверху карточки (как в QRBooster) -->
                            <div class="relative aspect-square w-full rounded-[18px] overflow-hidden mb-2.5 bg-smysl-greenSoft/40">
                                <div class="w-full h-full group-hover:scale-105 transition-transform duration-300">
                                    ${cardArt}
                                </div>

                                <!-- Бейдж объёма в левом верхнем углу -->
                                <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-smysl-greenDeep font-bold text-[10px] shadow-xs">
                                    ${firstVolume.label}
                                </span>

                                <!-- Бейдж скидки -20% в правом верхнем углу -->
                                ${priceObj.isDiscounted && !isStopped ? `
                                    <span class="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-smysl-caramel text-white font-extrabold text-[10px] shadow-xs">
                                        -${appState.discountPercent}%
                                    </span>
                                ` : ''}

                                <!-- Метка СТОП-ЛИСТ -->
                                ${isStopped ? `
                                    <div class="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center">
                                        <span class="px-3 py-1 rounded-full bg-white text-smysl-greenDeep font-display font-extrabold text-[11px] uppercase">
                                            В стопе
                                        </span>
                                    </div>
                                ` : ''}

                                <!-- Быстрые кнопки владельца прямо на карточке (в режиме Админа) -->
                                ${isAdminMode ? `
                                    <div onclick="event.stopPropagation()" class="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 bg-smysl-greenDeep/90 text-white p-1 rounded-xl text-[10px]">
                                        <button onclick="toggleDrinkStopStatus('${drink.id}')" class="px-2 py-1 rounded-lg font-bold ${isStopped ? 'bg-red-500 text-white' : 'bg-white/15 hover:bg-white/25'}">
                                            ${isStopped ? 'В стопе' : 'В наличии'}
                                        </button>
                                        <button onclick="openAdminTab('drinks')" class="px-2 py-1 rounded-lg bg-smysl-green font-bold">
                                            Цена ✎
                                        </button>
                                    </div>
                                ` : ''}
                            </div>

                            <!-- Название и краткий состав -->
                            <div class="px-1">
                                <h3 class="font-display font-bold text-xs sm:text-[13px] text-smysl-greenDeep leading-snug line-clamp-2">
                                    ${drink.title}
                                </h3>
                                <p class="text-[11px] text-smysl-greenDeep/60 mt-1 line-clamp-2 leading-tight">
                                    ${drink.desc}
                                </p>
                            </div>
                        </div>

                        <!-- Нижний ряд карточки: Цена + Кнопка "+" -->
                        <div class="mt-3 pt-2 px-1 border-t border-smysl-green/10 flex items-center justify-between gap-1">
                            <div>
                                <div class="flex items-baseline gap-1.5">
                                    <span class="font-display font-extrabold text-sm sm:text-base text-smysl-greenDeep">${priceObj.finalPrice} ₽</span>
                                    ${priceObj.isDiscounted ? `
                                        <span class="text-[11px] text-smysl-greenDeep/40 line-through font-bold">${priceObj.regularPrice} ₽</span>
                                    ` : ''}
                                </div>
                            </div>

                            ${isStopped ? `
                                <span class="px-2.5 py-1.5 rounded-xl bg-gray-100 text-gray-400 font-bold text-[11px]">Нет</span>
                            ` : `
                                <button type="button" class="w-8 h-8 rounded-xl bg-smysl-greenSoft group-hover:bg-smysl-green text-smysl-greenDark group-hover:text-smysl-cream flex items-center justify-center transition shadow-xs">
                                    <i class="ph-bold ph-plus text-sm"></i>
                                </button>
                            `}
                        </div>
                    </div>
                    `;
                }).join('');

                // В режиме конструктора добавляем карточку "+ Добавить в категорию"
                const adminAddCard = isAdminMode ? `
                    <div onclick="addNewDrinkAdmin('${cat.id}')" class="cursor-pointer rounded-[22px] border-2 border-dashed border-smysl-green/35 hover:border-smysl-green bg-white/60 p-4 flex flex-col items-center justify-center text-center min-h-[210px] transition">
                        <div class="w-10 h-10 rounded-2xl bg-smysl-green/15 text-smysl-greenDark flex items-center justify-center mb-2">
                            <i class="ph-bold ph-plus text-lg"></i>
                        </div>
                        <span class="font-display font-bold text-xs text-smysl-greenDeep">+ Добавить в «${cat.title}»</span>
                    </div>
                ` : '';

                html += `
                <section id="cat-${cat.id}" class="scroll-mt-28">
                    <div class="flex items-center justify-between mb-3 px-0.5">
                        <h2 class="font-display font-bold text-base sm:text-lg text-smysl-greenDeep flex items-center gap-1.5">
                            <span>${cat.icon}</span>
                            <span>${cat.title}</span>
                        </h2>
                    </div>
                    <!-- 2-колоночная сетка карточек как в QRBooster (в широком режиме до 3-4 колонок) -->
                    <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        ${cardsHtml}
                        ${adminAddCard}
                    </div>
                </section>
                `;
            });

            if (!html) {
                html = `
                <div class="text-center py-12 px-4 bg-white rounded-3xl border border-smysl-green/15">
                    <i class="ph-duotone ph-magnifying-glass text-4xl text-smysl-green mb-2"></i>
                    <div class="font-display font-bold text-sm text-smysl-greenDeep">Ничего не найдено</div>
                    <p class="text-xs text-smysl-greenDeep/65 mt-1">Попробуйте изменить запрос или сбросить фильтр</p>
                </div>`;
            }

            wrapper.innerHTML = html;
        }

        // ================= СТОРИС =================
        let activeStoryIndex = 0;
        let storyTimer = null;
        let storyProgress = 0;
        let storySaveTimer = null;
        const viewedStories = new Set();

        function queueStorySave() {
            if (storySaveTimer) clearTimeout(storySaveTimer);
            storySaveTimer = setTimeout(() => saveStateToStorageAndCloud(true), 700);
        }

        function escapeHtml(value) {
            return String(value == null ? '' : value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function getStoryTheme(story) {
            return STORY_THEMES[story && story.theme] || STORY_THEMES.green;
        }

        function getActiveStories() {
            return (appState.stories || []).filter(story =>
                story &&
                story.active !== false &&
                !(IS_ANDROID_APP && story.action === 'install')
            );
        }

        function renderStories() {
            const track = document.getElementById('storiesTrack');
            const section = document.getElementById('storiesSection');
            const addBtn = document.getElementById('storiesAdminAddBtn');
            if (!track || !section) return;

            const previousScroll = track.scrollLeft;
            const stories = getActiveStories();
            let html = stories.map(story => {
                const theme = getStoryTheme(story);
                const viewed = viewedStories.has(story.id);
                const hasCta = story.action && story.action !== 'none';
                const ctaLabel = story.ctaLabel || (story.action === 'install' ? 'Установить' : 'Подробнее');
                const media = story.image
                    ? `<img class="story-card-img" src="${escapeHtml(story.image)}" alt="" loading="lazy" decoding="async" draggable="false">`
                    : `<span class="story-card-fallback" style="background:${theme.gradient}"><i class="${theme.icon} text-[84px] text-white/25"></i></span>`;
                return `
                    <article class="story-card${viewed ? ' is-viewed' : ''}" role="button" tabindex="0" data-story-id="${escapeHtml(story.id)}" aria-label="Открыть новинку: ${escapeHtml(story.title)}">
                        ${media}
                        <span class="story-card-shade"></span>
                        ${story.badge ? `<span class="story-card-badge">${escapeHtml(story.badge)}</span>` : ''}
                        ${isAdminMode ? `<button type="button" class="story-card-edit" data-story-edit="${escapeHtml(story.id)}" aria-label="Редактировать новинку" title="Редактировать"><i class="ph-bold ph-pencil-simple text-xs"></i></button>` : ''}
                        ${!isAdminMode && viewed ? `<span class="story-card-viewed" aria-label="Просмотрено" title="Просмотрено">✓</span>` : ''}
                        <span class="story-card-body">
                            <span class="story-card-title">${escapeHtml(story.title)}</span>
                            ${story.subtitle ? `<span class="story-card-subtitle">${escapeHtml(story.subtitle)}</span>` : ''}
                            ${hasCta ? `<span class="story-card-cta">${escapeHtml(ctaLabel)} <i class="ph-bold ph-arrow-right text-[10px]"></i></span>` : ''}
                        </span>
                    </article>
                `;
            }).join('');

            if (isAdminMode) {
                html += `
                    <button type="button" class="story-card story-card-add" onclick="openAdminTab('stories')">
                        <span class="w-10 h-10 rounded-full border border-white/25 flex items-center justify-center"><i class="ph-bold ph-plus text-lg"></i></span>
                        <span class="text-[11px] font-bold">Добавить новинку</span>
                    </button>
                `;
            }

            track.innerHTML = html || `<div class="w-full text-[11px] text-smysl-cream/60 py-8 text-center">Пока нет новинок.</div>`;
            if (previousScroll > 0) track.scrollLeft = previousScroll;
            section.classList.toggle('hidden', stories.length === 0 && !isAdminMode);
            if (addBtn) {
                addBtn.classList.toggle('hidden', !isAdminMode);
                addBtn.classList.toggle('flex', isAdminMode);
            }
            updateStoriesProgress();
        }

        function scrollStories(direction) {
            const track = document.getElementById('storiesTrack');
            if (!track) return;
            const card = track.querySelector('.story-card');
            const gap = parseFloat(getComputedStyle(track).columnGap) || 10;
            const step = card ? card.getBoundingClientRect().width + gap : Math.max(240, track.clientWidth * 0.8);
            track.scrollBy({ left: direction * step, behavior: 'smooth' });
        }

        function updateStoriesProgress() {
            const track = document.getElementById('storiesTrack');
            const wrapper = document.getElementById('storiesProgress');
            const bar = document.getElementById('storiesProgressBar');
            const prev = document.getElementById('storiesPrevBtn');
            const next = document.getElementById('storiesNextBtn');
            if (!track) return;

            const max = track.scrollWidth - track.clientWidth;
            const hasScroll = max > 4;
            if (wrapper) wrapper.classList.toggle('hidden', !hasScroll);
            if (prev) prev.disabled = !hasScroll || track.scrollLeft <= 2;
            if (next) next.disabled = !hasScroll || track.scrollLeft >= max - 2;
            if (bar) {
                const ratio = hasScroll ? Math.min(1, Math.max(0, track.scrollLeft / max)) : 1;
                bar.style.width = `${ratio * 100}%`;
            }
        }

        function editStoryFromFeed(storyId) {
            openAdminTab('stories');
            setTimeout(() => {
                const card = document.getElementById(`adminStoryCard-${storyId}`);
                if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 180);
        }

        function openStoryViewer(storyId) {
            const stories = getActiveStories();
            const index = stories.findIndex(story => story.id === storyId);
            if (index < 0) return;

            activeStoryIndex = index;
            document.getElementById('storyViewer').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            renderStoryViewer();
            startStoryTimer(true);
        }

        function renderStoryViewer() {
            const stories = getActiveStories();
            if (!stories.length) return closeStoryViewer();
            if (activeStoryIndex >= stories.length) activeStoryIndex = stories.length - 1;

            const story = stories[activeStoryIndex];
            const theme = getStoryTheme(story);
            const media = document.getElementById('storyViewerMedia');
            const fallback = document.getElementById('storyViewerFallbackIcon');

            if (story.image) {
                media.style.background = '';
                media.style.backgroundImage = `url("${story.image}")`;
                media.style.backgroundSize = 'cover';
                media.style.backgroundPosition = 'center';
                fallback.classList.add('hidden');
            } else {
                media.style.backgroundImage = 'none';
                media.style.background = theme.gradient;
                fallback.classList.remove('hidden');
                fallback.className = `${theme.icon} text-[120px] ${story.theme === 'cream' ? 'text-smysl-greenDeep/15' : 'text-white/15'}`;
            }

            document.getElementById('storyViewerHeaderTitle').textContent = story.title || '';
            document.getElementById('storyViewerTitle').textContent = story.title || '';
            document.getElementById('storyViewerSubtitle').textContent = story.subtitle || '';

            const badge = document.getElementById('storyViewerBadge');
            if (story.badge) {
                badge.textContent = story.badge;
                badge.classList.remove('hidden');
                badge.classList.add('inline-flex');
            } else {
                badge.classList.add('hidden');
                badge.classList.remove('inline-flex');
            }

            const cta = document.getElementById('storyViewerCta');
            const hasLink = story.link && story.action === 'link';
            const ctaVisible = story.action === 'install' || story.action === 'info' || hasLink;
            if (ctaVisible) {
                document.getElementById('storyViewerCtaText').textContent = story.ctaLabel || (story.action === 'install' ? 'Установить' : 'Подробнее');
                cta.classList.remove('hidden');
                cta.classList.add('inline-flex');
            } else {
                cta.classList.add('hidden');
                cta.classList.remove('inline-flex');
            }

            document.getElementById('storyAdminEditBtn').classList.toggle('hidden', !isAdminMode);
            document.getElementById('storyAdminEditBtn').classList.toggle('flex', isAdminMode);

            renderStoryProgressBars();
            updateStoryProgress();
        }

        function renderStoryProgressBars() {
            const track = document.getElementById('storyProgressTrack');
            const stories = getActiveStories();
            track.innerHTML = stories.map((_, index) => `
                <span class="story-progress-bar"><span class="story-progress-fill" data-story-progress="${index}"></span></span>
            `).join('');
        }

        function updateStoryProgress() {
            const fills = document.querySelectorAll('[data-story-progress]');
            fills.forEach((fill, index) => {
                if (index < activeStoryIndex) {
                    fill.style.width = '100%';
                } else if (index > activeStoryIndex) {
                    fill.style.width = '0%';
                } else {
                    fill.style.width = `${Math.min(100, (storyProgress / STORY_DURATION) * 100)}%`;
                }
            });
        }

        function startStoryTimer(reset = true) {
            stopStoryTimer();
            if (reset) storyProgress = 0;
            updateStoryProgress();
            storyTimer = setInterval(() => {
                storyProgress += 50;
                if (storyProgress >= STORY_DURATION) {
                    nextStory(true);
                    return;
                }
                updateStoryProgress();
            }, 50);
        }

        function stopStoryTimer() {
            if (storyTimer) {
                clearInterval(storyTimer);
                storyTimer = null;
            }
        }

        function nextStory(auto = false) {
            const stories = getActiveStories();
            if (activeStoryIndex < stories.length - 1) {
                activeStoryIndex += 1;
                renderStoryViewer();
                startStoryTimer(true);
            } else {
                closeStoryViewer();
            }
        }

        function prevStory() {
            if (activeStoryIndex > 0) {
                activeStoryIndex -= 1;
                renderStoryViewer();
                startStoryTimer(true);
            } else {
                startStoryTimer(true);
            }
        }

        function closeStoryViewer() {
            const stories = getActiveStories();
            if (stories[activeStoryIndex]) viewedStories.add(stories[activeStoryIndex].id);
            stopStoryTimer();
            document.getElementById('storyViewer').classList.add('hidden');
            document.body.style.overflow = '';
            renderStories();
        }

        function handleStoryCta() {
            const stories = getActiveStories();
            const story = stories[activeStoryIndex];
            if (!story) return;

            if (story.action === 'install') {
                closeStoryViewer();
                triggerPwaInstall();
                return;
            }
            if (story.action === 'info') {
                closeStoryViewer();
                openModal('venueInfoModal');
                return;
            }
            if (story.action === 'link' && story.link) {
                const link = String(story.link).trim();
                if (link.startsWith('#')) {
                    closeStoryViewer();
                    const target = document.querySelector(link);
                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else if (/^(https?:\/\/|mailto:|tel:|\/|\.\/)/i.test(link)) {
                    window.open(link, '_blank', 'noopener,noreferrer');
                } else {
                    showToast('Ссылка должна начинаться с https://, mailto:, tel: или /');
                }
            }
        }

        function editCurrentStory() {
            const story = getActiveStories()[activeStoryIndex];
            if (!story) return;
            closeStoryViewer();
            editStoryFromFeed(story.id);
        }

        // ================= РЕДАКТОР СТОРИС В АДМИНКЕ =================
        function renderAdminStories() {
            const container = document.getElementById('adminStoriesList');
            if (!container) return;

            if (!appState.stories.length) {
                container.innerHTML = `
                    <div class="text-center py-8 px-4 rounded-2xl bg-white border border-dashed border-smysl-green/25">
                        <i class="ph-duotone ph-images text-3xl text-smysl-green mb-1"></i>
                        <div class="font-bold text-smysl-greenDeep">Новинок пока нет</div>
                        <p class="text-[11px] text-smysl-greenDeep/60 mt-1">Добавьте первую новинку и загрузите картинку.</p>
                    </div>
                `;
                return;
            }

            const themeOptions = [
                ['caramel', 'Карамель'],
                ['green', 'Зелёный'],
                ['dark', 'Тёмный'],
                ['cream', 'Светлый'],
                ['rose', 'Розовый']
            ];

            container.innerHTML = appState.stories.map((story, index) => {
                const theme = getStoryTheme(story);
                const preview = story.image
                    ? `<span class="block w-full h-full bg-cover bg-center" style="background-image:url('${escapeHtml(story.image)}')"></span>`
                    : `<span class="w-full h-full flex items-center justify-center" style="background:${theme.gradient}"><i class="${theme.icon} text-2xl text-white/80"></i></span>`;

                return `
                    <div id="adminStoryCard-${escapeHtml(story.id)}" class="p-3.5 rounded-2xl bg-white border border-smysl-green/20 space-y-3">
                        <div class="flex gap-3">
                            <div class="w-16 h-20 rounded-2xl overflow-hidden shrink-0 border border-smysl-green/10">${preview}</div>
                            <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
                                <input type="text" value="${escapeHtml(story.title)}" oninput="updateStoryField(${index}, 'title', this.value)" placeholder="Заголовок" class="sm:col-span-2 px-2.5 py-1.5 rounded-xl bg-smysl-creamLight border border-smysl-green/20 text-xs font-bold">
                                <input type="text" value="${escapeHtml(story.subtitle)}" oninput="updateStoryField(${index}, 'subtitle', this.value)" placeholder="Описание новинки" class="sm:col-span-2 px-2.5 py-1.5 rounded-xl bg-smysl-creamLight border border-smysl-green/20 text-xs">
                                <input type="text" value="${escapeHtml(story.badge)}" oninput="updateStoryField(${index}, 'badge', this.value)" placeholder="Плашка (например, Новинки)" class="px-2.5 py-1.5 rounded-xl bg-smysl-creamLight border border-smysl-green/20 text-xs">
                                <input type="text" value="${escapeHtml(story.ctaLabel)}" oninput="updateStoryField(${index}, 'ctaLabel', this.value)" placeholder="Текст кнопки" class="px-2.5 py-1.5 rounded-xl bg-smysl-creamLight border border-smysl-green/20 text-xs">
                                <select onchange="updateStoryField(${index}, 'action', this.value)" class="px-2.5 py-1.5 rounded-xl bg-smysl-creamLight border border-smysl-green/20 text-xs">
                                    <option value="none" ${story.action === 'none' || !story.action ? 'selected' : ''}>Без кнопки</option>
                                    <option value="link" ${story.action === 'link' ? 'selected' : ''}>Открыть ссылку</option>
                                    <option value="install" ${story.action === 'install' ? 'selected' : ''}>Установить приложение</option>
                                    <option value="info" ${story.action === 'info' ? 'selected' : ''}>О кофейне</option>
                                </select>
                                <select onchange="updateStoryField(${index}, 'theme', this.value)" class="px-2.5 py-1.5 rounded-xl bg-smysl-creamLight border border-smysl-green/20 text-xs">
                                    ${themeOptions.map(([value, label]) => `<option value="${value}" ${story.theme === value ? 'selected' : ''}>${label}</option>`).join('')}
                                </select>
                                <input type="text" value="${escapeHtml(story.link)}" oninput="updateStoryField(${index}, 'link', this.value)" placeholder="Ссылка или #cat-seasonal" class="sm:col-span-2 px-2.5 py-1.5 rounded-xl bg-smysl-creamLight border border-smysl-green/20 text-xs">
                            </div>
                        </div>

                        <div class="flex flex-wrap items-center gap-1.5 pt-2 border-t border-smysl-green/10">
                            <label class="cursor-pointer px-2.5 py-1.5 rounded-xl bg-smysl-green text-smysl-cream text-[11px] font-bold flex items-center gap-1">
                                <i class="ph-bold ph-upload-simple"></i>
                                <span>Загрузить фото</span>
                                <input type="file" accept="image/*" onchange="handleStoryImageUpload(event, ${index})" class="hidden">
                            </label>
                            ${story.image ? `<button onclick="removeStoryImage(${index})" class="px-2.5 py-1.5 rounded-xl bg-smysl-cream text-smysl-greenDeep border border-smysl-green/20 text-[11px] font-bold">Убрать фото</button>` : ''}
                            <label class="px-2.5 py-1.5 rounded-xl bg-smysl-creamLight border border-smysl-green/20 text-[11px] font-bold flex items-center gap-1 cursor-pointer">
                                <input type="checkbox" ${story.active !== false ? 'checked' : ''} onchange="updateStoryField(${index}, 'active', this.checked)" class="accent-smysl-green">
                                <span>Показывать</span>
                            </label>
                            <button onclick="moveStory(${index}, -1)" ${index === 0 ? 'disabled' : ''} title="Переместить левее" class="w-7 h-7 rounded-xl bg-smysl-creamLight border border-smysl-green/20 text-smysl-greenDeep text-xs font-bold disabled:opacity-30">←</button>
                            <button onclick="moveStory(${index}, 1)" ${index === appState.stories.length - 1 ? 'disabled' : ''} title="Переместить правее" class="w-7 h-7 rounded-xl bg-smysl-creamLight border border-smysl-green/20 text-smysl-greenDeep text-xs font-bold disabled:opacity-30">→</button>
                            <button onclick="removeStory(${index})" class="ml-auto px-2.5 py-1.5 rounded-xl bg-red-50 text-red-600 text-[11px] font-bold">Удалить</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function updateStoryField(index, field, value) {
            if (!appState.stories[index]) return;
            appState.stories[index][field] = value;
            renderStories();
            if (field === 'theme') renderAdminStories();
            queueStorySave();
        }

        function addStoryAdmin() {
            appState.stories.push({
                id: 'story-' + Date.now(),
                title: 'Новая карточка',
                subtitle: 'Добавьте текст и загрузите фотографию',
                badge: 'Новое',
                theme: 'green',
                image: '',
                action: 'none',
                link: '',
                ctaLabel: 'Подробнее',
                active: true
            });
            renderAdminStories();
            renderStories();
            saveStateToStorageAndCloud(true);
            showToast('Новинка добавлена. Загрузите фото и заполните текст.');
        }

        function removeStory(index) {
            if (!appState.stories[index]) return;
            appState.stories.splice(index, 1);
            renderAdminStories();
            renderStories();
            saveStateToStorageAndCloud(true);
            showToast('Новинка удалена');
        }

        function moveStory(index, direction) {
            const target = index + direction;
            if (target < 0 || target >= appState.stories.length) return;
            const [story] = appState.stories.splice(index, 1);
            appState.stories.splice(target, 0, story);
            renderAdminStories();
            renderStories();
            saveStateToStorageAndCloud(true);
        }

        function compressImageFile(file, maxSide, quality, callback) {
            const reader = new FileReader();
            reader.onload = event => {
                const image = new Image();
                image.onload = () => {
                    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.max(1, Math.round(image.width * scale));
                    canvas.height = Math.max(1, Math.round(image.height * scale));
                    const context = canvas.getContext('2d');
                    context.fillStyle = '#FAF9F3';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);
                    callback(canvas.toDataURL('image/jpeg', quality));
                };
                image.onerror = () => callback(event.target.result);
                image.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }

        function compressStoryImage(file, callback) {
            // Карточки в ленте вертикальные: 1000 px достаточно для 2x-экрана
            // и заметно меньше нагружает localStorage и site_settings.
            compressImageFile(file, 1000, 0.8, callback);
        }

        function compressDrinkImage(file, callback) {
            compressImageFile(file, 720, 0.8, callback);
        }

        function handleDrinkImageUpload(event, index) {
            const file = event.target.files && event.target.files[0];
            event.target.value = '';
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                showToast('Выберите файл изображения');
                return;
            }
            compressDrinkImage(file, dataUrl => {
                if (!appState.drinks[index]) return;
                appState.drinks[index].image = dataUrl;
                renderAdminModalInputs();
                renderMenuSections();
                if (activeCustomizer.drinkId === appState.drinks[index].id) updateCustomizerSheet();
                saveStateToStorageAndCloud(true);
                showToast('Фото позиции обновлено');
            });
        }

        function removeDrinkImage(index) {
            if (!appState.drinks[index]) return;
            appState.drinks[index].image = '';
            renderAdminModalInputs();
            renderMenuSections();
            if (activeCustomizer.drinkId === appState.drinks[index].id) updateCustomizerSheet();
            saveStateToStorageAndCloud(true);
        }

        function handleStoryImageUpload(event, index) {
            const file = event.target.files && event.target.files[0];
            event.target.value = '';
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                showToast('Выберите файл изображения');
                return;
            }
            compressStoryImage(file, dataUrl => {
                if (!appState.stories[index]) return;
                appState.stories[index].image = dataUrl;
                renderAdminStories();
                renderStories();
                saveStateToStorageAndCloud(true);
                showToast('Фото новинки обновлено');
            });
        }

        function removeStoryImage(index) {
            if (!appState.stories[index]) return;
            appState.stories[index].image = '';
            renderAdminStories();
            renderStories();
            saveStateToStorageAndCloud(true);
        }

        // ================= BOTTOM-SHEET КАСТОМИЗАТОР НАПИТКА =================
        function openDrinkCustomizer(drinkId) {
            const drink = appState.drinks.find(d => d.id === drinkId);
            if (!drink) return;
            const volumeOptions = getDrinkVolumeOptions(drink);
            const firstAvailable = volumeOptions.findIndex(v => !isVolumeStopped(drink, v.label));
            if (drink.stopped || firstAvailable < 0) {
                showToast(`«${drink.title}» сейчас нет в наличии`);
                return;
            }

            activeCustomizer = {
                drinkId: drink.id,
                volIndex: firstAvailable,
                milkIndex: 0,
                syrupIndex: 0,
                teaVariety: appState.teaVarieties[0]
            };

            updateCustomizerSheet();
            openModal('drinkModal');
        }

        function updateCustomizerSheet() {
            const { drinkId, volIndex, milkIndex, syrupIndex, teaVariety } = activeCustomizer;
            const drink = appState.drinks.find(d => d.id === drinkId);
            if (!drink) return;

            const catObj = MENU_CATEGORIES.find(c => c.id === drink.category) || MENU_CATEGORIES[2];
            document.getElementById('sheetCategoryBadge').textContent = `${catObj.icon} ${catObj.title}`;
            document.getElementById('sheetDrinkTitle').textContent = drink.title;
            document.getElementById('sheetDrinkDesc').textContent = drink.desc;
            document.getElementById('sheetKbzhuText').textContent = drink.kbzhu || '150 ккал';
            document.getElementById('sheetDrinkArt').innerHTML = drink.image
                ? `<img src="${escapeHtml(drink.image)}" alt="${escapeHtml(drink.title)}" class="w-full h-full object-cover rounded-2xl">`
                : getDrinkArtSvg(drink.art);

            const discountTag = document.getElementById('sheetDiscountTag');
            discountTag.textContent = `-${appState.discountPercent}% Будни`;
            discountTag.style.display = appState.happyHourActive ? 'inline-block' : 'none';

            // Объёмы и цены конкретного напитка (как в YTimes)
            const volumeOptions = getDrinkVolumeOptions(drink);
            if (volIndex >= volumeOptions.length || isVolumeStopped(drink, volumeOptions[volIndex]?.label)) {
                const firstAvailable = volumeOptions.findIndex(v => !isVolumeStopped(drink, v.label));
                volIndex = firstAvailable >= 0 ? firstAvailable : 0;
            }
            document.getElementById('sheetVolumesGrid').innerHTML = volumeOptions.map((v, idx) => {
                const stopped = isVolumeStopped(drink, v.label);
                return `
                <button type="button" onclick="setCustomizerOption('volIndex', ${idx})" ${stopped ? 'disabled' : ''}
                    class="p-2.5 rounded-2xl border text-left transition ${
                        stopped
                            ? 'opacity-45 cursor-not-allowed bg-white text-smysl-greenDeep/60 border-smysl-green/10'
                            : idx === volIndex
                                ? 'bg-smysl-green text-smysl-cream border-smysl-green shadow-xs'
                                : 'bg-white text-smysl-greenDeep border-smysl-green/20'
                    }">
                    <div class="font-display font-bold text-xs">${v.label}</div>
                    <div class="text-[10px] opacity-80">${stopped ? 'Нет в наличии' : `${v.price} ₽`}</div>
                </button>
            `;
            }).join('');

            // Если это Листовой чай — показываем выбор сорта чая (Жасмин, Улун, Ромашка, Бергамот, Ассам)
            const teaBlock = document.getElementById('sheetTeaVarietiesBlock');
            const milkBlock = document.getElementById('sheetMilkBlock');
            const syrupBlock = document.getElementById('sheetSyrupBlock');

            if (drink.isLeafTea) {
                teaBlock.classList.remove('hidden');
                milkBlock.classList.add('hidden');
                syrupBlock.classList.add('hidden');

                document.getElementById('sheetTeaVarietiesGrid').innerHTML = appState.teaVarieties.map(tv => `
                    <button type="button" onclick="setCustomizerOption('teaVariety', '${tv}')"
                        class="p-2.5 rounded-xl border text-xs font-bold transition ${
                            tv === teaVariety
                                ? 'bg-smysl-green text-smysl-cream border-smysl-green'
                                : 'bg-white text-smysl-greenDeep border-smysl-green/20'
                        }">
                        ${tv}
                    </button>
                `).join('');
            } else {
                teaBlock.classList.add('hidden');
                milkBlock.classList.remove('hidden');
                syrupBlock.classList.remove('hidden');

                document.getElementById('sheetMilksGrid').innerHTML = appState.milks.map((m, idx) => `
                    <button type="button" onclick="setCustomizerOption('milkIndex', ${idx})"
                        class="p-2.5 rounded-xl border text-left transition ${
                            idx === milkIndex
                                ? 'bg-smysl-green text-smysl-cream border-smysl-green'
                                : 'bg-white text-smysl-greenDeep border-smysl-green/20'
                        }">
                        <div class="font-bold text-xs">${m.label}</div>
                        <div class="text-[10px] opacity-75">${m.addPrice === 0 ? '+0 ₽' : '+' + m.addPrice + ' ₽'}</div>
                    </button>
                `).join('');

                document.getElementById('sheetSyrupsGrid').innerHTML = appState.syrups.map((s, idx) => `
                    <button type="button" onclick="setCustomizerOption('syrupIndex', ${idx})"
                        class="p-2.5 rounded-xl border text-left transition ${
                            idx === syrupIndex
                                ? 'bg-smysl-green text-smysl-cream border-smysl-green'
                                : 'bg-white text-smysl-greenDeep border-smysl-green/20'
                        }">
                        <div class="font-bold text-xs">${s.label}</div>
                        <div class="text-[10px] opacity-75">${s.addPrice === 0 ? '+0 ₽' : '+' + s.addPrice + ' ₽'}</div>
                    </button>
                `).join('');
            }

            const vol = volumeOptions[volIndex] || volumeOptions[0];
            const milkAdd = drink.isLeafTea ? 0 : appState.milks[milkIndex].addPrice;
            const syrupAdd = drink.isLeafTea ? 0 : appState.syrups[syrupIndex].addPrice;
            const priceObj = calculatePrice(vol.price, milkAdd + syrupAdd);

            document.getElementById('sheetFinalPrice').textContent = `${priceObj.finalPrice} ₽`;
            const oldEl = document.getElementById('sheetOldPrice');
            if (priceObj.isDiscounted) {
                oldEl.textContent = `${priceObj.regularPrice} ₽`;
                oldEl.classList.remove('hidden');
            } else {
                oldEl.classList.add('hidden');
            }
        }

        function setCustomizerOption(key, val) {
            activeCustomizer[key] = val;
            updateCustomizerSheet();
        }

        function confirmAddToCart() {
            const { drinkId, volIndex, milkIndex, syrupIndex, teaVariety } = activeCustomizer;
            const drink = appState.drinks.find(d => d.id === drinkId);
            if (!drink) return;
            const volumeOptions = getDrinkVolumeOptions(drink);
            const vol = volumeOptions[volIndex] || volumeOptions[0];
            if (!vol || drink.stopped || isVolumeStopped(drink, vol.label)) {
                showToast(`«${drink.title}» (${vol ? vol.label : 'этот объём'}) сейчас нет в наличии`);
                return;
            }
            const milk = appState.milks[milkIndex];
            const syrup = appState.syrups[syrupIndex];

            const addPrice = drink.isLeafTea ? 0 : milk.addPrice + syrup.addPrice;
            const optionsSummary = drink.isLeafTea
                ? `Сорт: ${teaVariety}`
                : `Молоко: ${milk.label} • ${syrup.label}`;

            cart.push({
                uid: Date.now() + Math.random(),
                drinkId: drink.id,
                title: drink.title,
                volumeLabel: vol.label,
                milkLabel: drink.isLeafTea ? teaVariety : milk.label,
                syrupLabel: drink.isLeafTea ? 'Листовой' : syrup.label,
                optionsSummary,
                basePrice: vol.price,
                addPrice,
                qty: 1
            });

            closeModal('drinkModal');
            updateCartUI();
            showToast(`«${drink.title}» добавлен в предзаказ`);
        }

        // ================= ПЛАВАЮЩАЯ КОРЗИНА И ПРЕДЗАКАЗ =================
        function updateCartUI() {
            const totalCount = cart.reduce((sum, i) => sum + i.qty, 0);
            const floatingBar = document.getElementById('floatingCartBar');

            let totalFinal = 0;
            cart.forEach(item => {
                const p = calculatePrice(item.basePrice, item.addPrice);
                totalFinal += p.finalPrice * item.qty;
            });

            if (totalCount > 0) {
                floatingBar.classList.remove('hidden');
                document.getElementById('floatingCartCount').textContent = totalCount;
                document.getElementById('floatingCartTotal').textContent = `${totalFinal} ₽`;
            } else {
                floatingBar.classList.add('hidden');
            }

            const container = document.getElementById('cartItemsContainer');
            if (cart.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 px-4 rounded-2xl bg-white border border-smysl-green/15">
                        <i class="ph-duotone ph-coffee text-3xl text-smysl-green mb-1"></i>
                        <div class="font-display font-bold text-xs text-smysl-greenDeep">Корзина пуста</div>
                        <p class="text-[11px] text-smysl-greenDeep/65 mt-0.5">Выберите напитки в меню</p>
                    </div>
                `;
                document.getElementById('cartTotalAmount').textContent = '0 ₽';
                return;
            }

            container.innerHTML = cart.map((item, idx) => {
                const p = calculatePrice(item.basePrice, item.addPrice);
                const lineTotal = p.finalPrice * item.qty;
                return `
                    <div class="p-3 rounded-2xl bg-white border border-smysl-green/15 flex items-center justify-between gap-2">
                        <div>
                            <div class="font-display font-bold text-xs text-smysl-greenDeep">
                                ${item.title} <span class="text-smysl-greenDark">(${item.volumeLabel})</span>
                            </div>
                            <div class="text-[11px] text-smysl-greenDeep/65">${item.optionsSummary}</div>
                            <div class="flex items-baseline gap-1.5 mt-1">
                                <span class="font-extrabold text-xs text-smysl-greenDeep">${lineTotal} ₽</span>
                                ${p.isDiscounted ? `<span class="text-[10px] text-smysl-greenDeep/40 line-through">${p.regularPrice * item.qty} ₽</span>` : ''}
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="changeCartQty(${idx}, -1)" class="w-7 h-7 rounded-xl bg-smysl-cream text-smysl-greenDeep font-bold">-</button>
                            <span class="text-xs font-extrabold w-4 text-center">${item.qty}</span>
                            <button onclick="changeCartQty(${idx}, 1)" class="w-7 h-7 rounded-xl bg-smysl-green text-smysl-cream font-bold">+</button>
                        </div>
                    </div>
                `;
            }).join('');

            document.getElementById('cartTotalAmount').textContent = `${totalFinal} ₽`;

            const savedBadge = document.getElementById('cartSavedBadge');
            savedBadge.classList.toggle('hidden', !appState.happyHourActive);
        }

        function changeCartQty(idx, delta) {
            if (!cart[idx]) return;
            cart[idx].qty += delta;
            if (cart[idx].qty <= 0) cart.splice(idx, 1);
            updateCartUI();
        }

        function selectPickupTime(timeStr, btnEl) {
            appState.pickupTime = timeStr;
            document.querySelectorAll('.pickup-time-btn').forEach(btn => {
                btn.className = 'pickup-time-btn py-2 px-2.5 rounded-xl text-xs font-semibold bg-white border border-smysl-green/20 text-smysl-greenDeep';
            });
            btnEl.className = 'pickup-time-btn py-2 px-2.5 rounded-xl text-xs font-bold bg-smysl-green text-smysl-cream';
        }

        function selectOrderType(type) {
            selectedOrderType = type === 'IN' ? 'IN' : 'TOGO';
            const inBtn = document.getElementById('orderTypeInBtn');
            const togoBtn = document.getElementById('orderTypeTogoBtn');
            const activeClass = 'py-2 px-3 rounded-xl text-xs font-bold border transition bg-smysl-green text-smysl-cream border-smysl-green';
            const inactiveClass = 'py-2 px-3 rounded-xl text-xs font-bold border transition bg-white text-smysl-greenDeep border-smysl-green/20';
            if (inBtn) inBtn.className = selectedOrderType === 'IN' ? activeClass : inactiveClass;
            if (togoBtn) togoBtn.className = selectedOrderType === 'TOGO' ? activeClass : inactiveClass;
        }

        // ================= ЛОКАЦИИ («РОЖДА» И «ГОРЬКОГО») =================
        function renderLocations() {
            const currentShop = appState.locations.find(l => l.id === appState.selectedLocationId) || appState.locations[0];
            const coverBadge = document.getElementById('coverLocationBadge');
            const cartSubtitle = document.getElementById('cartLocationSubtitle');
            if (coverBadge) coverBadge.textContent = currentShop.shortName || currentShop.address;
            if (cartSubtitle) cartSubtitle.textContent = `Кофейня: ${currentShop.address} (${appState.workingHours})`;

            // Кнопки в модалке выбора точки
            document.getElementById('modalLocationsContainer').innerHTML = appState.locations.map(loc => {
                const isSelected = loc.id === currentShop.id;
                return `
                    <div onclick="selectLocation(${loc.id})" class="cursor-pointer p-3.5 rounded-2xl border transition flex items-center justify-between ${
                        isSelected ? 'bg-white border-smysl-green shadow-xs' : 'bg-white/60 border-smysl-green/15'
                    }">
                        <div class="flex items-center gap-3">
                            <div class="w-9 h-9 rounded-xl ${isSelected ? 'bg-smysl-green text-smysl-cream' : 'bg-smysl-greenSoft text-smysl-greenDark'} flex items-center justify-center">
                                <i class="ph-fill ph-map-pin"></i>
                            </div>
                            <div>
                                <div class="font-bold text-xs sm:text-sm text-smysl-greenDeep">${loc.address}</div>
                                <div class="text-[11px] text-smysl-greenDeep/65">Ежедневно ${loc.hours}</div>
                            </div>
                        </div>
                        ${isSelected ? '<span class="px-2 py-0.5 rounded-full bg-smysl-greenSoft text-smysl-greenDark text-[10px] font-extrabold">Выбрана</span>' : ''}
                    </div>
                `;
            }).join('');

            // Быстрый переключатель точки внутри корзины
            const cartLocSwitch = document.getElementById('cartLocationsSwitch');
            if (cartLocSwitch) {
                cartLocSwitch.innerHTML = appState.locations.map(loc => {
                    const isSelected = loc.id === currentShop.id;
                    return `
                        <button type="button" onclick="selectLocation(${loc.id}, true)"
                            class="py-2 px-3 rounded-xl text-xs font-bold border transition ${
                                isSelected
                                    ? 'bg-smysl-green text-smysl-cream border-smysl-green'
                                    : 'bg-white text-smysl-greenDeep border-smysl-green/20'
                            }">
                            📍 ${loc.shortName || loc.address}
                        </button>
                    `;
                }).join('');
            }
        }

        function selectLocation(id, keepModalOpen = false) {
            appState.selectedLocationId = id;
            renderLocations();
            if (!keepModalOpen) closeModal('locationModal');
            const loc = appState.locations.find(l => l.id === id);
            if (loc) showToast(`Выбрана точка: ${loc.shortName || loc.address}`);
        }

        // ================= ОТПРАВКА ЗАКАЗА В SUPABASE EDGE FUNCTION =================
        let orderSubmitting = false;
        let pendingOrderGuid = null;
        let pendingOrderSignature = '';
        let orderStatusTimer = null;
        let orderStatusTimeout = null;
        let activeOrderGuid = null;
        let lastOrderStatus = '';
        let orderRealtimeChannel = null;
        const LAST_ORDER_KEY = 'smysl_last_order_v1';
        const LAST_ORDER_TTL_MS = 2 * 60 * 60 * 1000;
        // Публичный VAPID-ключ web-push. Заполняется после генерации ключей.
        const WEB_PUSH_PUBLIC_KEY = 'BEF60gaQfwclJ_cSeLozfaPmbyVm2fuUGC_miuAzbH0QmHo-jy4KQo5EpeP92qYJYF51dyvCoxk9gAQAX65i2dk';

        function createOrderGuid() {
            if (window.crypto && typeof window.crypto.randomUUID === 'function') {
                return window.crypto.randomUUID();
            }
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        function stopOrderRealtime() {
            if (orderRealtimeChannel) {
                try {
                    orderRealtimeChannel.unsubscribe();
                } catch (error) {
                    // Подписка уже могла быть закрыта.
                }
                orderRealtimeChannel = null;
            }
        }

        function subscribeOrderStatusRealtime(guid) {
            stopOrderRealtime();
            const client = getSupabaseClient();
            if (!client || !guid) return;
            try {
                // Канал содержит секретный GUID заказа: чужие его не знают.
                const channel = client.channel(`order:${guid}`, {
                    config: { broadcast: { self: false } }
                });
                channel.on('broadcast', { event: 'status' }, message => {
                    const payload = message && message.payload ? message.payload : null;
                    if (payload) updateOrderStatusUI(payload);
                });
                channel.subscribe();
                orderRealtimeChannel = channel;
            } catch (error) {
                console.warn('Realtime subscribe failed:', error);
            }
        }

        function stopOrderStatusPolling() {
            if (orderStatusTimer) clearInterval(orderStatusTimer);
            if (orderStatusTimeout) clearTimeout(orderStatusTimeout);
            orderStatusTimer = null;
            orderStatusTimeout = null;
            activeOrderGuid = null;
            lastOrderStatus = '';
            stopOrderRealtime();
        }

        function setOrderStatusText(message, tone) {
            const element = document.getElementById('orderSuccessStatus');
            if (!element) return;
            element.textContent = message;
            const toneClass = tone === 'accepted'
                ? 'bg-smysl-greenSoft text-smysl-greenDark'
                : tone === 'cancelled'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-smysl-caramel/15 text-smysl-caramel';
            element.className = `mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${toneClass}`;
        }

        function updateOrderStatusUI(data) {
            const status = String((data && data.status) || '');
            if (!status || status === lastOrderStatus) return;
            lastOrderStatus = status;
            if (status === 'accepted') {
                setOrderStatusText('Заказ принят кассиром. Можно оплачивать.', 'accepted');
            } else if (status === 'cancelled') {
                setOrderStatusText(`Заказ отклонён кассиром${data.message ? ': ' + data.message : ''}`, 'cancelled');
            } else if (status === 'failed') {
                setOrderStatusText('Не удалось отправить заказ. Обратитесь к баристе.', 'cancelled');
            } else {
                setOrderStatusText('Ожидает принятия кассиром', 'pending');
            }
            if (status === 'accepted' || status === 'cancelled' || status === 'failed') {
                const modal = document.getElementById('orderSuccessModal');
                if (!modal || modal.classList.contains('hidden')) {
                    showToast(status === 'accepted'
                        ? 'Заказ принят кассиром'
                        : status === 'cancelled'
                            ? 'Заказ отклонён кассиром'
                            : 'Ошибка заказа');
                }
            }
        }

        function urlBase64ToUint8Array(base64String) {
            const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
            const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
            const raw = atob(base64);
            return Uint8Array.from([...raw].map(char => char.charCodeAt(0)));
        }

        function isWebPushSupported() {
            return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
        }

        function getSavedOrderGuid() {
            try {
                const saved = JSON.parse(localStorage.getItem(LAST_ORDER_KEY) || 'null');
                return saved && saved.guid ? saved.guid : null;
            } catch (error) {
                return null;
            }
        }

        async function updateOrderPushButton() {
            const button = document.getElementById('orderPushBtn');
            const label = document.getElementById('orderPushBtnText');
            const hint = document.getElementById('orderPushHint');
            if (!button || !label) return;

            if (!isWebPushSupported() || !WEB_PUSH_PUBLIC_KEY) {
                button.classList.add('hidden');
                if (hint) hint.classList.add('hidden');
                return;
            }

            button.classList.remove('hidden');
            button.disabled = false;
            button.classList.remove('opacity-60');
            if (hint) hint.classList.add('hidden');

            if (Notification.permission === 'denied') {
                button.disabled = true;
                button.classList.add('opacity-60');
                label.textContent = 'Уведомления запрещены в браузере';
                return;
            }

            if (Notification.permission === 'granted') {
                try {
                    const registration = await navigator.serviceWorker.getRegistration();
                    const subscription = registration ? await registration.pushManager.getSubscription() : null;
                    if (subscription) {
                        button.disabled = true;
                        button.classList.add('opacity-60');
                        label.textContent = 'Уведомления включены';
                        return;
                    }
                } catch (error) {
                    // Покажем кнопку включения.
                }
            }

            label.textContent = 'Уведомить, когда заказ примут';
        }

        async function ensureOrderPushSubscription(guid, interactive) {
            if (!guid || !isWebPushSupported() || !WEB_PUSH_PUBLIC_KEY) {
                return { ok: false, reason: 'unsupported' };
            }
            try {
                if (Notification.permission !== 'granted') {
                    if (!interactive) return { ok: false, reason: 'permission' };
                    const permission = await Notification.requestPermission();
                    if (permission !== 'granted') return { ok: false, reason: 'denied' };
                }

                const registration = await navigator.serviceWorker.register('sw.js');
                await navigator.serviceWorker.ready;

                let subscription = await registration.pushManager.getSubscription();
                if (!subscription) {
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(WEB_PUSH_PUBLIC_KEY)
                    });
                }

                const response = await fetch(`${getSupabaseBaseUrl(appState.supabase.url)}/functions/v1/push-subscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': appState.supabase.anonKey,
                        'Authorization': `Bearer ${appState.supabase.anonKey}`
                    },
                    body: JSON.stringify({ orderGuid: guid, subscription: subscription.toJSON() })
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Не удалось включить уведомления');
                }
                return { ok: true };
            } catch (error) {
                console.warn('Push subscribe failed:', error);
                return { ok: false, reason: 'error', error };
            }
        }

        async function enableOrderPush() {
            const guid = activeOrderGuid || getSavedOrderGuid();
            if (!guid) {
                showToast('Сначала оформите заказ');
                return;
            }
            const button = document.getElementById('orderPushBtn');
            const label = document.getElementById('orderPushBtnText');
            if (button) button.disabled = true;
            if (label) label.textContent = 'Подключаем…';

            const result = await ensureOrderPushSubscription(guid, true);
            if (result.ok) {
                showToast('Уведомления включены');
            } else if (result.reason === 'denied') {
                showToast('Разрешение на уведомления не выдано');
            } else if (result.reason === 'unsupported') {
                showToast('Браузер не поддерживает уведомления');
            } else {
                showToast('Не удалось включить уведомления');
            }
            updateOrderPushButton();
        }

        async function pollOrderStatus(guid) {
            if (!guid) return;
            try {
                const response = await fetch(`${getSupabaseBaseUrl(appState.supabase.url)}/functions/v1/order-status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': appState.supabase.anonKey,
                        'Authorization': `Bearer ${appState.supabase.anonKey}`
                    },
                    body: JSON.stringify({ orderGuid: guid })
                });
                const data = await response.json();
                if (data && data.success && data.found) updateOrderStatusUI(data);
            } catch (error) {
                // Статус не должен ломать страницу.
            }
        }

        function startOrderStatusPolling(guid) {
            stopOrderStatusPolling();
            if (!guid) return;
            activeOrderGuid = guid;
            setOrderStatusText('Проверяем статус…', 'pending');
            // Мгновенные обновления через Supabase Realtime.
            subscribeOrderStatusRealtime(guid);
            // Кнопка push и автопривязка подписки к новому заказу.
            updateOrderPushButton();
            ensureOrderPushSubscription(guid, false);
            // Резервный опрос на случай, если Realtime недоступен.
            pollOrderStatus(guid);
            orderStatusTimer = setInterval(() => {
                if (activeOrderGuid) pollOrderStatus(activeOrderGuid);
            }, 30000);
            orderStatusTimeout = setTimeout(stopOrderStatusPolling, 30 * 60 * 1000);
        }

        function saveLastOrder(result, shop) {
            try {
                if (!result || !result.orderGuid) return;
                localStorage.setItem(LAST_ORDER_KEY, JSON.stringify({
                    guid: result.orderGuid,
                    orderNumber: result.orderNumber || '',
                    total: Number(result.total) || 0,
                    location: shop ? (shop.shortName || shop.address) : '',
                    orderType: selectedOrderType,
                    createdAt: Date.now()
                }));
            } catch (error) {
                // localStorage может быть недоступен — это не критично.
            }
        }

        function clearLastOrder() {
            try {
                localStorage.removeItem(LAST_ORDER_KEY);
            } catch (error) {}
        }

        function restoreLastOrder() {
            let saved = null;
            try {
                saved = JSON.parse(localStorage.getItem(LAST_ORDER_KEY) || 'null');
            } catch (error) {
                saved = null;
            }
            if (!saved || !saved.guid) return;
            if (!saved.createdAt || Date.now() - saved.createdAt > LAST_ORDER_TTL_MS) {
                clearLastOrder();
                return;
            }
            const modal = document.getElementById('orderSuccessModal');
            if (modal && !modal.classList.contains('hidden')) return;
            document.getElementById('orderSuccessNumber').textContent = saved.orderNumber || '—';
            document.getElementById('orderSuccessTotal').textContent = `${Number(saved.total) || 0} ₽`;
            document.getElementById('orderSuccessLocation').textContent = saved.location || '';
            document.getElementById('orderSuccessType').textContent = saved.orderType === 'IN' ? 'Здесь, в зале' : 'С собой';
            openModal('orderSuccessModal');
            startOrderStatusPolling(saved.guid);
        }

        function showOrderSuccess(result, shop) {
            const number = String((result && result.orderNumber) || '').trim() || '—';
            document.getElementById('orderSuccessNumber').textContent = number;
            document.getElementById('orderSuccessTotal').textContent = `${Number(result && result.total) || 0} ₽`;
            document.getElementById('orderSuccessLocation').textContent = shop.shortName || shop.address;
            document.getElementById('orderSuccessType').textContent = selectedOrderType === 'IN' ? 'Здесь, в зале' : 'С собой';
            saveLastOrder(result, shop);
            openModal('orderSuccessModal');
            startOrderStatusPolling(result && result.orderGuid);
        }

        function isOrderingOpenNow() {
            const msk = new Date(Date.now() + 3 * 60 * 60 * 1000);
            const hour = msk.getUTCHours();
            return hour >= 8 && hour < 20;
        }

        function showOrderClosedNotice() {
            const mskHour = new Date(Date.now() + 3 * 60 * 60 * 1000).getUTCHours();
            const text = mskHour < 8
                ? 'Онлайн-заказы принимаются с <strong>08:00 по МСК</strong>.<br>Пожалуйста, оформите заказ на кассе.'
                : 'После <strong>20:00 по МСК</strong> онлайн-заказы не принимаются.<br>Пожалуйста, оформите заказ на кассе.';
            const textEl = document.getElementById('orderClosedText');
            if (textEl) textEl.innerHTML = text;
            openModal('orderClosedModal');
        }

        async function submitQuickOrder() {
            if (orderSubmitting) return;
            if (cart.length === 0) {
                showToast('Добавьте хотя бы один напиток в заказ');
                return;
            }
            if (!isOrderingOpenNow()) {
                showOrderClosedNotice();
                return;
            }
            const consentInput = document.getElementById('personalDataConsent');
            if (!consentInput || !consentInput.checked) {
                showToast('Подтвердите согласие на обработку персональных данных');
                return;
            }

            const name = document.getElementById('guestNameInput').value.trim() || 'Гость';
            const phone = document.getElementById('guestPhoneInput').value.trim() || '';
            const orderComment = document.getElementById('orderCommentInput')?.value.trim() || '';
            const shop = appState.locations.find(l => l.id === appState.selectedLocationId) || appState.locations[0];

            let totalFinal = 0;
            cart.forEach(item => {
                const p = calculatePrice(item.basePrice, item.addPrice);
                totalFinal += p.finalPrice * item.qty;
            });

            const submitBtn = document.querySelector('#cartModal button[onclick="submitQuickOrder()"]');
            const submitLabel = submitBtn ? submitBtn.querySelector('span') : null;
            const originalLabel = submitLabel ? submitLabel.textContent : '';

            orderSubmitting = true;
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('opacity-60', 'cursor-wait');
            }
            const orderItems = cart.map(item => ({
                drinkId: item.drinkId,
                title: item.title,
                volumeLabel: item.volumeLabel,
                milkLabel: item.milkLabel,
                syrupLabel: item.syrupLabel,
                qty: item.qty
            }));
            const orderSignature = JSON.stringify({
                locationId: shop.id,
                guestName: name,
                guestPhone: phone,
                orderType: selectedOrderType,
                comment: orderComment,
                consent: true,
                pickupTime: appState.pickupTime,
                total: totalFinal,
                items: orderItems
            });
            if (!pendingOrderGuid || pendingOrderSignature !== orderSignature) {
                pendingOrderGuid = createOrderGuid();
                pendingOrderSignature = orderSignature;
            }

            if (submitLabel) submitLabel.textContent = 'Отправляем на кассу…';

            const endpoint = `${getSupabaseBaseUrl(appState.supabase.url)}/functions/v1/create-order`;
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': appState.supabase.anonKey,
                        'Authorization': `Bearer ${appState.supabase.anonKey}`
                    },
                    body: JSON.stringify({
                        orderGuid: pendingOrderGuid,
                        guestName: name,
                        guestPhone: phone,
                        locationId: shop.id,
                        orderType: selectedOrderType,
                        comment: orderComment,
                        consent: true,
                        pickupTime: appState.pickupTime,
                        total: totalFinal,
                        items: orderItems
                    })
                });

                let result = null;
                try {
                    result = await response.json();
                } catch (e) {}

                if (!response.ok || !result || result.success === false) {
                    const orderError = new Error((result && result.message) || `Не удалось отправить заказ (${response.status}).`);
                    orderError.code = result && result.code;
                    throw orderError;
                }

                pendingOrderGuid = null;
                pendingOrderSignature = '';
                cart = [];
                const commentInput = document.getElementById('orderCommentInput');
                if (commentInput) commentInput.value = '';
                if (consentInput) consentInput.checked = false;
                saveStateToStorageAndCloud(true);
                updateCartUI();
                closeModal('cartModal');
                showOrderSuccess(result, shop);
            } catch (error) {
                console.warn('Order sending failed:', error);
                if (error && error.code === 'ORDER_CLOSED') {
                    showOrderClosedNotice();
                } else {
                    showToast(error && error.message ? error.message : 'Не удалось отправить заказ. Попробуйте ещё раз или обратитесь к баристе.');
                }
            } finally {
                orderSubmitting = false;
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('opacity-60', 'cursor-wait');
                }
                if (submitLabel) submitLabel.textContent = originalLabel || 'Отправить на кассу';
            }
        }

        // ================= СЧАСТЛИВЫЕ ЧАСЫ (-20%) =================
        function toggleHappyHourDemo() {
            if (!isAdminMode) {
                requestAdminLogin();
                return;
            }
            appState.happyHourActive = !appState.happyHourActive;
            updateHappyHourUI();
            renderMenuSections();
            updateCartUI();
            showToast(appState.happyHourActive
                ? `Счастливые часы включены: цены в меню снижены на ${appState.discountPercent}%`
                : 'Включены стандартные цены меню');
        }

        function updateHappyHourUI() {
            const pct = appState.discountPercent;
            const topBtn = document.getElementById('topHappyHourBtn');
            const topText = document.getElementById('topHappyHourText');
            const bannerText = document.getElementById('happyHourBannerText');

            if (topText) topText.textContent = appState.happyHourActive ? `-${pct}%: ВКЛ` : `-${pct}%: ВЫКЛ`;
            if (topBtn) {
                topBtn.className = appState.happyHourActive
                    ? 'px-2.5 py-1 rounded-xl font-bold transition flex items-center gap-1 bg-smysl-caramel text-white shadow-sm'
                    : 'px-2.5 py-1 rounded-xl font-semibold transition flex items-center gap-1 bg-white/15 text-smysl-cream';
            }
            if (bannerText) {
                bannerText.innerHTML = appState.happyHourActive
                    ? `Будни 12:00–16:00: цены указаны со <strong>скидкой -${pct}%</strong>`
                    : `В будни 12:00–16:00 действует <strong>скидка -${pct}%</strong> на напитки`;
            }
        }

        // ================= АДМИН-РЕЖИМ И СТОП-ЛИСТ =================
        function setAdminMode(enabled) {
            isAdminMode = !!enabled;
            document.body.classList.toggle('admin-active', isAdminMode);
            document.body.classList.toggle('admin-mode', isAdminMode);

            const strip = document.getElementById('previewControlStrip');
            if (strip) strip.classList.toggle('hidden', !isAdminMode);

            renderMenuSections();
            renderStories();
            updateHappyHourUI();
        }

        function setAdminAccountEmail(email) {
            const label = document.getElementById('adminAccountEmail');
            if (label) label.textContent = email || 'admin@smysl.coffee';
        }

        async function restoreAdminSession() {
            const client = getSupabaseClient();
            if (!client) return;
            try {
                const { data } = await client.auth.getSession();
                const user = data && data.session ? data.session.user : null;
                if (user && user.app_metadata && user.app_metadata.role === 'admin') {
                    setAdminMode(true);
                    setAdminAccountEmail(user.email);
                }
            } catch (e) {
                console.warn('Supabase session restore failed:', e);
            }
        }

        function requestAdminLogin() {
            if (isAdminMode) {
                openAdminPanel();
                return;
            }
            openModal('adminLoginModal');
            const passwordInput = document.getElementById('adminLoginPassword');
            const emailInput = document.getElementById('adminLoginEmail');
            if (passwordInput) {
                delete passwordInput.dataset.keyboardFixApplied;
                passwordInput.value = '';
            }
            setTimeout(() => {
                const field = emailInput && !emailInput.value ? emailInput : passwordInput;
                if (field) field.focus();
            }, 120);
        }

        function promptAdminLogin() {
            requestAdminLogin();
        }

        function handleAdminPasswordInput(input) {
            if (!input || input.value.length !== 1) return;
            if (input.dataset.keyboardFixApplied === '1') return;
            input.dataset.keyboardFixApplied = '1';

            // Если WebView всё-таки потерял фокус, возвращаем его без принудительного
            // скрытия клавиатуры — иначе она начинает мигать на каждом первом символе.
            setTimeout(() => {
                const modal = document.getElementById('adminLoginModal');
                if (!modal || modal.classList.contains('hidden')) return;
                if (document.activeElement === input) return;

                const position = input.value.length;
                input.focus({ preventScroll: true });
                try { input.setSelectionRange(position, position); } catch (e) {}
            }, 140);
        }

        async function handleAdminLoginSubmit(event) {
            event.preventDefault();
            const client = getSupabaseClient();
            const emailInput = document.getElementById('adminLoginEmail');
            const passwordInput = document.getElementById('adminLoginPassword');
            const submitButton = document.getElementById('adminLoginSubmitBtn');
            const submitText = document.getElementById('adminLoginSubmitText');
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!client || !window.supabase) {
                showToast('Не удалось загрузить Supabase. Проверьте интернет.');
                return;
            }
            if (!email || !password) {
                showToast('Введите email и пароль');
                return;
            }

            if (submitButton) submitButton.disabled = true;
            if (submitText) submitText.textContent = 'Вход…';

            try {
                const { data, error } = await client.auth.signInWithPassword({ email, password });
                if (error) throw error;

                const user = data && data.user;
                if (!user || !user.app_metadata || user.app_metadata.role !== 'admin') {
                    await client.auth.signOut();
                    throw new Error('У этой учётной записи нет прав администратора');
                }

                if (passwordInput) passwordInput.value = '';
                closeModal('adminLoginModal');
                setAdminMode(true);
                setAdminAccountEmail(user.email);
                showToast('Добро пожаловать в конструктор «Смысл»');
                setTimeout(() => openModal('adminModal'), 140);
            } catch (error) {
                const message = error && error.message === 'Invalid login credentials'
                    ? 'Неверный email или пароль'
                    : (error && error.message ? error.message : 'Не удалось войти');
                showToast(message);
                if (passwordInput) passwordInput.select();
            } finally {
                if (submitButton) submitButton.disabled = false;
                if (submitText) submitText.textContent = 'Войти в конструктор';
            }
        }

        function openAdminPanel() {
            if (!isAdminMode) {
                requestAdminLogin();
                return;
            }
            openModal('adminModal');
        }

        async function exitAdminMode() {
            const client = getSupabaseClient();
            if (client) {
                try { await client.auth.signOut(); } catch (e) {}
            }
            closeModal('adminModal');
            setAdminMode(false);
            showToast('Вы вышли из аккаунта владельца');
        }

        function toggleDrinkStopStatus(drinkId) {
            const drink = appState.drinks.find(d => d.id === drinkId);
            if (!drink) return;
            drink.stopped = !drink.stopped;
            renderMenuSections();
            saveStateToStorageAndCloud(true);
            showToast(drink.stopped ? `«${drink.title}» переведён в СТОП-лист` : `«${drink.title}» снова в наличии`);
        }

        function openAdminTab(tabName) {
            if (!isAdminMode) {
                requestAdminLogin();
                return;
            }
            openModal('adminModal');
            switchAdminTab(tabName);
        }

        function switchAdminTab(tabName) {
            ['drinks', 'locations', 'stories', 'orders', 'cloud'].forEach(t => {
                document.getElementById(`adminTab-${t}`).classList.toggle('hidden', t !== tabName);
                const btn = document.getElementById(`tabBtn-${t}`);
                btn.className = t === tabName
                    ? 'admin-tab-btn pb-2.5 px-3 border-b-2 border-smysl-green text-smysl-greenDeep whitespace-nowrap'
                    : 'admin-tab-btn pb-2.5 px-3 border-b-2 border-transparent text-smysl-greenDeep/60 whitespace-nowrap';
            });
            if (tabName === 'orders') {
                loadAdminOrders();
                startAdminOrdersAutoRefresh();
            } else {
                stopAdminOrdersAutoRefresh();
            }
        }

        // ================= ЗАКАЗЫ В АДМИНКЕ =================
        let adminOrdersTimer = null;

        function startAdminOrdersAutoRefresh() {
            stopAdminOrdersAutoRefresh();
            adminOrdersTimer = setInterval(() => {
                const modal = document.getElementById('adminModal');
                if (isAdminMode && modal && !modal.classList.contains('hidden')) {
                    loadAdminOrders();
                } else {
                    stopAdminOrdersAutoRefresh();
                }
            }, 20000);
        }

        function stopAdminOrdersAutoRefresh() {
            if (adminOrdersTimer) clearInterval(adminOrdersTimer);
            adminOrdersTimer = null;
        }

        function getOrderNumber(order) {
            const stored = String((order && order.order_number) || '').trim();
            if (stored) return stored;
            const match = String((order && order.comment) || '').match(/Номер заказа:\s*([0-9]+)/i);
            return match ? match[1] : String((order && order.id) || 0).padStart(4, '0');
        }

        function getOrderStatusMeta(status) {
            switch (status) {
                case 'accepted': return { label: 'Принят', cls: 'bg-smysl-greenSoft text-smysl-greenDark' };
                case 'cancelled': return { label: 'Отклонён', cls: 'bg-red-50 text-red-700' };
                case 'failed': return { label: 'Ошибка', cls: 'bg-red-50 text-red-700' };
                case 'sending': return { label: 'Отправляется', cls: 'bg-amber-50 text-amber-700' };
                case 'updated': return { label: 'Обновлён', cls: 'bg-blue-50 text-blue-700' };
                default: return { label: 'Ожидает кассира', cls: 'bg-amber-50 text-amber-700' };
            }
        }

        function formatOrderTime(value) {
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return '';
            return date.toLocaleString('ru-RU', {
                timeZone: 'Europe/Moscow',
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function renderAdminOrders(orders) {
            const list = document.getElementById('adminOrdersList');
            if (!list) return;
            if (!orders.length) {
                list.innerHTML = '<div class="p-4 rounded-2xl bg-white border border-smysl-green/20 text-xs text-smysl-greenDeep/60">Заказов пока нет.</div>';
                return;
            }
            list.innerHTML = orders.map(order => {
                const number = getOrderNumber(order);
                const meta = getOrderStatusMeta(order.status);
                const parts = String(order.comment || '').split(' • ');
                const readPart = prefix => {
                    const row = parts.find(part => part.startsWith(prefix));
                    return row ? row.slice(prefix.length).trim() : '';
                };
                const guestComment = readPart('Комментарий гостя:');
                const composition = readPart('Состав:');
                const pickup = readPart('Время:');
                return `
                    <div class="p-3.5 rounded-2xl bg-white border border-smysl-green/20 space-y-2">
                        <div class="flex items-start justify-between gap-2">
                            <div>
                                <div class="font-display font-extrabold text-lg text-smysl-greenDeep">№${escapeHtml(number)}</div>
                                <div class="text-[10px] text-smysl-greenDeep/50">${escapeHtml(formatOrderTime(order.created_at))} МСК</div>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold ${meta.cls}">${meta.label}</span>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5 text-[11px]">
                            <div><span class="text-smysl-greenDeep/50">Гость:</span> <span class="font-bold text-smysl-greenDeep">${escapeHtml(order.customer_name || '—')}</span></div>
                            <div><span class="text-smysl-greenDeep/50">Телефон:</span> <span class="font-bold text-smysl-greenDeep">${escapeHtml(order.customer_phone || '—')}</span></div>
                            <div><span class="text-smysl-greenDeep/50">Сумма:</span> <span class="font-bold text-smysl-greenDeep">${Number(order.total) || 0} ₽</span></div>
                            <div><span class="text-smysl-greenDeep/50">Готовность:</span> <span class="font-bold text-smysl-greenDeep">${escapeHtml(pickup || '—')}</span></div>
                        </div>
                        ${guestComment ? `<div class="text-[11px] text-smysl-greenDeep/75"><span class="text-smysl-greenDeep/50">Комментарий гостя:</span> ${escapeHtml(guestComment)}</div>` : ''}
                        ${composition ? `<div class="text-[10px] text-smysl-greenDeep/60 leading-relaxed">${escapeHtml(composition)}</div>` : ''}
                        ${order.status_message ? `<div class="text-[10px] font-bold text-red-600">${escapeHtml(order.status_message)}</div>` : ''}
                    </div>
                `;
            }).join('');
        }

        async function loadAdminOrders() {
            const list = document.getElementById('adminOrdersList');
            const statusEl = document.getElementById('adminOrdersStatus');
            if (!list) return;
            const client = getSupabaseClient();
            if (!client) {
                list.innerHTML = '<div class="p-4 rounded-2xl bg-white border border-smysl-green/20 text-xs text-red-600">Supabase не настроен.</div>';
                return;
            }
            try {
                const { data: sessionData } = await client.auth.getSession();
                if (!sessionData.session) {
                    list.innerHTML = '<div class="p-4 rounded-2xl bg-white border border-smysl-green/20 text-xs text-red-600">Войдите в аккаунт владельца, чтобы видеть заказы.</div>';
                    return;
                }
                const { data, error } = await client
                    .from('orders')
                    .select('id,created_at,customer_name,customer_phone,status,ytimes_status,status_message,total,order_number,comment')
                    .order('created_at', { ascending: false })
                    .limit(50);
                if (error) throw error;
                renderAdminOrders(Array.isArray(data) ? data : []);
                if (statusEl) {
                    statusEl.textContent = `Заказов: ${Array.isArray(data) ? data.length : 0}. Обновлено в ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
                }
            } catch (error) {
                console.error('Admin orders failed', error);
                if (statusEl) statusEl.textContent = 'Не удалось загрузить заказы';
                list.innerHTML = `<div class="p-4 rounded-2xl bg-white border border-smysl-green/20 text-xs text-red-600">${escapeHtml(error && error.message ? error.message : 'Ошибка загрузки заказов')}</div>`;
            }
        }

        function renderAdminCategoryOrder() {
            const container = document.getElementById('adminCategoryOrderList');
            if (!container) return;

            const categories = getOrderedCategories();
            container.innerHTML = categories.map((category, index) => `
                <div data-category-row-id="${category.id}" class="flex items-center gap-2 p-2 rounded-xl bg-smysl-creamLight border border-smysl-green/15 transition-shadow duration-200 cursor-grab">
                    <span class="w-6 text-center">${category.icon}</span>
                    <span class="flex-1 text-xs font-bold text-smysl-greenDeep">${category.title}</span>
                    <span data-drag-handle tabindex="0" role="button" aria-label="Перетащить категорию ${category.title}"
                        onkeydown="handleCategoryHandleKeydown(event, ${index})"
                        class="category-drag-handle w-7 h-7 rounded-lg flex items-center justify-center text-smysl-greenDark/55 hover:text-smysl-greenDark hover:bg-white transition">
                        <span class="category-grip" aria-hidden="true"><span></span><span></span><span></span></span>
                    </span>
                </div>
            `).join('');
        }

        function captureCategoryPositions(selector, dataKey) {
            const positions = new Map();
            document.querySelectorAll(selector).forEach(element => {
                positions.set(element.dataset[dataKey], element.getBoundingClientRect());
            });
            return positions;
        }

        function animateCategoryPositions(previousPositions, selector, dataKey, axis, highlightedId) {
            if (!previousPositions.size || !Element.prototype.animate) return;
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            document.querySelectorAll(selector).forEach(element => {
                const previous = previousPositions.get(element.dataset[dataKey]);
                if (!previous) return;

                const current = element.getBoundingClientRect();
                const offsetX = axis === 'x' ? previous.left - current.left : 0;
                const offsetY = axis === 'y' ? previous.top - current.top : 0;
                if (Math.abs(offsetX) < 0.5 && Math.abs(offsetY) < 0.5) return;

                const startTransform = `translate(${offsetX}px, ${offsetY}px)`;
                const isHighlighted = element.dataset[dataKey] === highlightedId;
                const frames = isHighlighted
                    ? [
                        { transform: startTransform, boxShadow: '0 0 0 rgba(123, 146, 68, 0)' },
                        { transform: 'translate(0px, 0px) scale(1.018)', boxShadow: '0 10px 24px rgba(123, 146, 68, 0.22)', offset: 0.7 },
                        { transform: 'translate(0px, 0px) scale(1)', boxShadow: '0 0 0 rgba(123, 146, 68, 0)' }
                    ]
                    : [
                        { transform: startTransform },
                        { transform: 'translate(0px, 0px)' }
                    ];

                element.animate(frames, {
                    duration: isHighlighted ? 420 : 340,
                    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
                });
            });
        }

        function reorderCategory(sourceIndex, targetIndex) {
            const order = getOrderedCategories().map(category => category.id);
            if (sourceIndex < 0 || sourceIndex >= order.length) return false;
            if (targetIndex < 0 || targetIndex >= order.length) return false;
            if (sourceIndex === targetIndex) return false;

            const rowPositions = captureCategoryPositions('#adminCategoryOrderList [data-category-row-id]', 'categoryRowId');
            const pillPositions = captureCategoryPositions('#categoryPillsContainer [data-category-id]', 'categoryId');
            const pillsContainer = document.getElementById('categoryPillsContainer');
            const pillsScrollLeft = pillsContainer ? pillsContainer.scrollLeft : 0;

            const moved = order.splice(sourceIndex, 1)[0];
            order.splice(targetIndex, 0, moved);
            appState.categoryOrder = order;

            renderAdminCategoryOrder();
            renderCategoryPills();
            if (pillsContainer) pillsContainer.scrollLeft = pillsScrollLeft;
            renderMenuSections();

            animateCategoryPositions(rowPositions, '#adminCategoryOrderList [data-category-row-id]', 'categoryRowId', 'y', moved);
            animateCategoryPositions(pillPositions, '#categoryPillsContainer [data-category-id]', 'categoryId', 'x', moved);

            saveStateToStorageAndCloud(true);
            const movedCategory = MENU_CATEGORIES.find(category => category.id === moved) || {};
            showToast(`«${movedCategory.title || 'Категория'}» перемещена`);
            return true;
        }

        function handleCategoryHandleKeydown(event, index) {
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                reorderCategory(index, index - 1);
            } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                reorderCategory(index, index + 1);
            }
        }

        let categoryDragState = null;

        function initCategoryDragAndDrop() {
            const list = document.getElementById('adminCategoryOrderList');
            if (!list || list.dataset.dragBound === '1') return;
            list.dataset.dragBound = '1';
            list.addEventListener('pointerdown', handleCategoryPointerDown);
        }

        function handleCategoryPointerDown(event) {
            if (categoryDragState) return;
            if (event.pointerType === 'mouse' && event.button !== 0) return;

            const list = document.getElementById('adminCategoryOrderList');
            const row = event.target.closest('[data-category-row-id]');
            if (!list || !row || !list.contains(row)) return;

            const isMouse = event.pointerType === 'mouse' || !event.pointerType;
            const isHandle = !!event.target.closest('[data-drag-handle]');
            if (!isMouse && !isHandle) return;
            if (event.target.closest('button')) return;

            event.preventDefault();
            startCategoryDrag(row, event);
        }

        function startCategoryDrag(row, event) {
            const index = getOrderedCategories().findIndex(category => category.id === row.dataset.categoryRowId);
            if (index < 0) return;

            const rect = row.getBoundingClientRect();
            const clone = row.cloneNode(true);
            clone.removeAttribute('data-category-row-id');
            clone.style.cssText = [
                'position: fixed',
                `left: ${rect.left}px`,
                `top: ${rect.top}px`,
                `width: ${rect.width}px`,
                `height: ${rect.height}px`,
                'margin: 0',
                'z-index: 10000',
                'pointer-events: none',
                'border-radius: 12px',
                'background: #FFFFFF',
                'box-shadow: 0 18px 38px rgba(37, 46, 19, 0.24)',
                'transform: translateY(0)',
                'opacity: 1'
            ].join(';');
            document.body.appendChild(clone);

            row.classList.add('opacity-30', 'ring-2', 'ring-smysl-green/25');
            document.body.classList.add('category-dragging');

            const list = document.getElementById('adminCategoryOrderList');
            const listRect = list.getBoundingClientRect();
            categoryDragState = {
                row,
                clone,
                startY: event.clientY,
                sourceIndex: index,
                dropIndex: index,
                rowTop: rect.top,
                rowHeight: rect.height,
                listTop: listRect.top,
                listBottom: listRect.bottom
            };

            updateCategoryDropIndicator(index);
            window.addEventListener('pointermove', handleCategoryPointerMove, { passive: false });
            window.addEventListener('pointerup', handleCategoryPointerUp);
            window.addEventListener('pointercancel', handleCategoryPointerCancel);
        }

        function getCategoryRowsWithoutDragged() {
            const list = document.getElementById('adminCategoryOrderList');
            if (!list || !categoryDragState) return [];
            return [...list.querySelectorAll('[data-category-row-id]')]
                .filter(row => row !== categoryDragState.row);
        }

        function updateCategoryDropIndicator(targetIndex) {
            const rows = getCategoryRowsWithoutDragged();
            document.querySelectorAll('#adminCategoryOrderList [data-category-row-id]').forEach(row => {
                row.classList.remove('category-drop-before', 'category-drop-after');
            });
            if (!rows.length) return;
            if (targetIndex < rows.length) {
                rows[targetIndex].classList.add('category-drop-before');
            } else {
                rows[rows.length - 1].classList.add('category-drop-after');
            }
        }

        function handleCategoryPointerMove(event) {
            if (!categoryDragState) return;
            event.preventDefault();

            const state = categoryDragState;
            const list = document.getElementById('adminCategoryOrderList');
            if (!list) return;
            const listRect = list.getBoundingClientRect();

            // Держим копию строки строго внутри блока «Порядок категорий».
            const minTop = listRect.top;
            const maxTop = Math.max(minTop, listRect.bottom - state.rowHeight);
            const desiredTop = state.rowTop + (event.clientY - state.startY);
            const clampedTop = Math.min(maxTop, Math.max(minTop, desiredTop));
            state.clone.style.transform = `translateY(${clampedTop - state.rowTop}px)`;

            const insideList = event.clientY >= listRect.top && event.clientY <= listRect.bottom;
            if (!insideList) {
                state.dropIndex = null;
                document.querySelectorAll('#adminCategoryOrderList [data-category-row-id]').forEach(row => {
                    row.classList.remove('category-drop-before', 'category-drop-after');
                });
                return;
            }

            const rows = getCategoryRowsWithoutDragged();
            let targetIndex = rows.length;
            for (let index = 0; index < rows.length; index++) {
                const rect = rows[index].getBoundingClientRect();
                if (event.clientY < rect.top + rect.height / 2) {
                    targetIndex = index;
                    break;
                }
            }

            state.dropIndex = targetIndex;
            updateCategoryDropIndicator(targetIndex);
        }

        function handleCategoryPointerUp() {
            if (!categoryDragState) return;
            const sourceIndex = categoryDragState.sourceIndex;
            const targetIndex = categoryDragState.dropIndex;
            cleanupCategoryDrag();
            if (targetIndex !== sourceIndex && targetIndex !== null) {
                reorderCategory(sourceIndex, targetIndex);
            }
        }

        function handleCategoryPointerCancel() {
            cleanupCategoryDrag();
        }

        function cleanupCategoryDrag() {
            if (!categoryDragState) return;
            categoryDragState.clone.remove();
            categoryDragState.row.classList.remove('opacity-30', 'ring-2', 'ring-smysl-green/25');
            document.querySelectorAll('#adminCategoryOrderList [data-category-row-id]').forEach(row => {
                row.classList.remove('category-drop-before', 'category-drop-after');
            });
            document.body.classList.remove('category-dragging');
            window.removeEventListener('pointermove', handleCategoryPointerMove);
            window.removeEventListener('pointerup', handleCategoryPointerUp);
            window.removeEventListener('pointercancel', handleCategoryPointerCancel);
            categoryDragState = null;
        }

        async function syncYTimesMenu() {
            if (!isAdminMode) {
                requestAdminLogin();
                return;
            }
            const client = getSupabaseClient();
            if (!client) {
                showToast('Supabase не настроен');
                return;
            }
            const btn = document.getElementById('ytimesSyncBtn');
            const statusEl = document.getElementById('ytimesSyncStatus');
            const original = btn ? btn.innerHTML : '';
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = 'Синхронизация...';
            }
            if (statusEl) statusEl.textContent = 'Запрашиваю меню и стоп-лист YTimes...';
            try {
                const { data: { session } } = await client.auth.getSession();
                if (!session) throw new Error('Сессия истекла, войдите заново.');
                const endpoint = `${getSupabaseBaseUrl(appState.supabase.url)}/functions/v1/sync-ytimes-menu`;
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': appState.supabase.anonKey,
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({})
                });
                const result = await response.json().catch(() => ({}));
                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Ошибка синхронизации');
                }
                await fetchCloudStateIfConfigured();
                applyAllStateToDOM();
                renderAdminModalInputs();
                const added = Number(result.addedDrinks) || 0;
                const msg = `Синхронизировано: ${result.updatedDrinks ?? 0} позиций${added ? `, добавлено новых: ${added}` : ''}, стоп: ${result.stoppedDrinks ?? 0}, частично: ${result.partialStops ?? 0}`;
                if (statusEl) {
                    statusEl.textContent = result.syncedAt
                        ? `${msg}. ${new Date(result.syncedAt).toLocaleString('ru-RU')}`
                        : msg;
                }
                showToast(msg);
            } catch (error) {
                console.error('YTimes sync failed', error);
                if (statusEl) statusEl.textContent = error && error.message ? error.message : 'Ошибка синхронизации';
                showToast(error && error.message ? error.message : 'Ошибка синхронизации');
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = original || 'Синхронизировать с YTimes';
                }
            }
        }

        function updateDrinkVolumePrice(drinkIdx, volIdx, value) {
            const drink = appState.drinks[drinkIdx];
            if (!drink) return;
            const volumeOptions = getDrinkVolumeOptions(drink);
            const option = volumeOptions[volIdx];
            if (!option) return;
            option.price = Math.max(0, parseInt(value, 10) || 0);
            if (volIdx === 0) {
                drink.basePrice = option.price;
                drink.defaultVol = option.label;
            }
        }

        function renderAdminModalInputs() {
            const drinksContainer = document.getElementById('adminDrinksList');
            renderAdminCategoryOrder();
            drinksContainer.innerHTML = appState.drinks.map((d, idx) => {
                const volumeOptions = getDrinkVolumeOptions(d);
                return `
                <div class="p-3 rounded-2xl bg-white border border-smysl-green/20 flex flex-col gap-2.5">
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                        <div class="flex items-center gap-2 w-full sm:w-auto shrink-0">
                            <div class="w-14 h-14 rounded-xl overflow-hidden bg-smysl-greenSoft/40 border border-smysl-green/10 shrink-0">
                                ${d.image
                                    ? `<img src="${escapeHtml(d.image)}" alt="${escapeHtml(d.title)}" class="w-full h-full object-cover">`
                                    : `<div class="w-full h-full flex items-center justify-center text-smysl-greenDark/50"><i class="ph-duotone ph-image text-xl"></i></div>`}
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="cursor-pointer px-2.5 py-1.5 rounded-lg bg-smysl-green hover:bg-smysl-greenDark text-smysl-cream text-[10px] font-bold text-center transition">
                                    ${d.image ? 'Заменить фото' : 'Добавить фото'}
                                    <input type="file" accept="image/*" onchange="handleDrinkImageUpload(event, ${idx})" class="hidden">
                                </label>
                                ${d.image ? `<button onclick="removeDrinkImage(${idx})" class="px-2.5 py-1 rounded-lg bg-smysl-cream text-smysl-greenDeep border border-smysl-green/20 text-[10px] font-bold">Убрать фото</button>` : ''}
                            </div>
                        </div>
                        <div class="flex-1 w-full grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <input type="text" value="${escapeHtml(d.title)}" oninput="appState.drinks[${idx}].title = this.value" class="sm:col-span-2 px-2.5 py-1.5 rounded-xl bg-smysl-creamLight border border-smysl-green/20 text-xs font-bold">
                            <select onchange="appState.drinks[${idx}].category = this.value" class="px-2.5 py-1.5 rounded-xl bg-smysl-creamLight border border-smysl-green/20 text-xs">
                                ${MENU_CATEGORIES.map(c => `<option value="${c.id}" ${d.category === c.id ? 'selected' : ''}>${c.icon} ${c.title}</option>`).join('')}
                            </select>
                            <input type="number" value="${volumeOptions[0].price}" oninput="updateDrinkVolumePrice(${idx}, 0, this.value)" class="px-2.5 py-1.5 rounded-xl bg-smysl-creamLight border border-smysl-green/20 text-xs font-extrabold" placeholder="Цена ₽" title="Цена базового объёма">
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <button onclick="appState.drinks[${idx}].stopped = !appState.drinks[${idx}].stopped; renderAdminModalInputs(); renderMenuSections();"
                                class="px-2.5 py-1.5 rounded-xl text-[11px] font-bold ${d.stopped ? 'bg-red-100 text-red-700' : 'bg-smysl-greenSoft text-smysl-greenDark'}">
                                ${d.stopped ? 'В стопе' : 'Активен'}
                            </button>
                            <button onclick="removeDrinkAdmin(${idx})" class="px-2 py-1.5 rounded-xl bg-gray-100 hover:bg-red-50 text-red-600 text-xs font-bold">✕</button>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        ${volumeOptions.map((v, vi) => `
                            <label class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-smysl-creamLight border border-smysl-green/20">
                                <span class="text-[10px] font-bold text-smysl-greenDeep/70 whitespace-nowrap">${v.label}</span>
                                <input type="number" value="${v.price}" oninput="updateDrinkVolumePrice(${idx}, ${vi}, this.value)" class="w-full min-w-0 bg-transparent text-xs font-extrabold outline-none" placeholder="₽">
                            </label>
                        `).join('')}
                    </div>
                    ${Array.isArray(d.stoppedVolumes) && d.stoppedVolumes.length ? `<div class="text-[10px] font-bold text-amber-700">Стоп по объёмам: ${d.stoppedVolumes.join(', ')}</div>` : ''}
                </div>
            `;
            }).join('');

            document.getElementById('adminWorkingHoursInput').value = appState.workingHours;

            document.getElementById('adminLocationsList').innerHTML = appState.locations.map((loc, idx) => `
                <div class="p-3 rounded-2xl bg-white border border-smysl-green/20 flex flex-col sm:flex-row gap-2">
                    <input type="text" value="${loc.shortName || ''}" oninput="appState.locations[${idx}].shortName = this.value" placeholder="Коротко (Рожда)" class="sm:w-36 px-3 py-1.5 rounded-xl bg-smysl-creamLight border border-smysl-green/20 text-xs font-bold">
                    <input type="text" value="${loc.address}" oninput="appState.locations[${idx}].address = this.value" placeholder="Полный адрес" class="flex-1 px-3 py-1.5 rounded-xl bg-smysl-creamLight border border-smysl-green/20 text-xs">
                    <button onclick="removeLocationAdmin(${idx})" class="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold">Удалить</button>
                </div>
            `).join('');

            document.getElementById('adminSupabaseUrl').value = getSupabaseBaseUrl(appState.supabase.url);
            document.getElementById('adminSupabaseKey').value = appState.supabase.anonKey || '';
            const syncStatus = document.getElementById('ytimesSyncStatus');
            if (syncStatus) {
                syncStatus.textContent = appState.menuSyncedAt
                    ? `Последняя синхронизация с YTimes: ${new Date(appState.menuSyncedAt).toLocaleString('ru-RU')}`
                    : 'Синхронизация с YTimes ещё не выполнялась';
            }
            renderAdminStories();
        }

        function addNewDrinkAdmin(defaultCat = 'seasonal') {
            const basePrice = 250;
            const fallbackVolumes = (Array.isArray(appState.volumes) && appState.volumes.length)
                ? appState.volumes
                : defaultAppState.volumes;
            const volumeOptions = fallbackVolumes.map(v => ({
                label: v.label,
                price: basePrice + (Number(v.addPrice) || 0)
            }));
            appState.drinks.unshift({
                id: 'd_' + Date.now(),
                category: defaultCat,
                title: 'Новый напиток «Смысл»',
                desc: 'Описание вкуса и ингредиентов напитка',
                basePrice,
                defaultVol: volumeOptions[0].label,
                volumeOptions,
                kbzhu: '180 ккал',
                art: 'latte',
                image: '',
                stopped: false,
                stoppedVolumes: []
            });
            renderAdminModalInputs();
            renderMenuSections();
            openAdminTab('drinks');
            showToast('Позиция добавлена в начало списка');
        }

        function removeDrinkAdmin(idx) {
            if (appState.drinks.length <= 1) return;
            const removed = appState.drinks[idx];
            if (!removed) return;
            const mapping = appState.ytimesMap ? appState.ytimesMap[removed.id] : null;
            if (mapping && mapping.item) {
                if (!Array.isArray(appState.ytimesIgnored)) appState.ytimesIgnored = [];
                if (!appState.ytimesIgnored.includes(mapping.item)) {
                    appState.ytimesIgnored.push(mapping.item);
                }
                try {
                    delete appState.ytimesMap[removed.id];
                } catch (error) {
                    // Маппинг мог быть уже удалён.
                }
            }
            appState.drinks.splice(idx, 1);
            renderAdminModalInputs();
            renderMenuSections();
            saveStateToStorageAndCloud(true);
            showToast('Позиция удалена и не вернётся при синхронизации');
        }

        async function restoreIgnoredYTimesDrinks() {
            if (!isAdminMode) {
                requestAdminLogin();
                return;
            }
            const ignored = Array.isArray(appState.ytimesIgnored) ? appState.ytimesIgnored : [];
            if (!ignored.length) {
                showToast('Скрытых позиций YTimes нет');
                return;
            }
            appState.ytimesIgnored = [];
            await saveStateToStorageAndCloud(true);
            showToast('Возвращаю позиции из YTimes…');
            await syncYTimesMenu();
        }

        function addNewLocationAdmin() {
            appState.locations.push({
                id: Date.now(),
                shortName: 'Новая точка',
                address: 'Кофейня «Смысл» — Новый адрес',
                hours: appState.workingHours
            });
            renderAdminModalInputs();
            renderLocations();
        }

        function removeLocationAdmin(idx) {
            if (appState.locations.length <= 1) return;
            appState.locations.splice(idx, 1);
            renderAdminModalInputs();
            renderLocations();
        }

        async function saveAdminSettings() {
            appState.workingHours = document.getElementById('adminWorkingHoursInput').value.trim() || '08:00 – 22:00';
            appState.happyHourActive = false;
            appState.discountPercent = 0;
            appState.supabase.url = getSupabaseBaseUrl(document.getElementById('adminSupabaseUrl').value) || defaultAppState.supabase.url;
            appState.supabase.anonKey = document.getElementById('adminSupabaseKey').value.trim() || defaultAppState.supabase.anonKey;

            updateHappyHourUI();
            renderLocations();
            renderMenuSections();
            renderStories();
            updateCartUI();
            await saveStateToStorageAndCloud();
            closeModal('adminModal');
        }

        // ================= SUPABASE СИНХРОНИЗАЦИЯ =================
        function setCloudStatus(message, isError = false) {
            const status = document.getElementById('adminCloudStatus');
            if (!status) return;
            status.textContent = message;
            status.className = isError
                ? 'text-[11px] font-bold text-red-600'
                : 'text-[11px] font-bold text-smysl-greenDark';
        }

        async function saveStateToStorageAndCloud(silent = false) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
            } catch (e) {
                if (!silent) showToast('Не удалось сохранить данные в браузере');
            }

            const client = getSupabaseClient();
            if (!client) {
                setCloudStatus('Supabase не настроен', true);
                if (!silent) showToast('Изменения сохранены локально');
                return false;
            }

            try {
                const { data: sessionData } = await client.auth.getSession();
                if (!sessionData.session) {
                    setCloudStatus('Нужен вход владельца', true);
                    if (!silent) showToast('Войдите в аккаунт владельца, чтобы сохранить изменения');
                    return false;
                }

                // Карту YTimes и время синхронизации обновляет только серверная
                // функция. Подхватываем их из облака, чтобы сохранение настроек
                // из админки не стирало интеграцию.
                let configToSave = appState;
                try {
                    const { data: currentRow } = await client
                        .from('site_settings')
                        .select('config')
                        .eq('id', 1)
                        .maybeSingle();
                    const currentConfig = currentRow && currentRow.config ? currentRow.config : null;
                    if (currentConfig) {
                        const localMap = appState.ytimesMap && typeof appState.ytimesMap === 'object'
                            ? appState.ytimesMap
                            : null;
                        let mergedMap = localMap ? Object.assign({}, localMap) : (currentConfig.ytimesMap || null);

                        if (localMap && currentConfig.ytimesMap && typeof currentConfig.ytimesMap === 'object') {
                            const drinkIds = new Set(appState.drinks.map(drink => String(drink.id)));
                            Object.keys(currentConfig.ytimesMap).forEach(id => {
                                // Не возвращаем маппинг удалённых позиций, но
                                // подхватываем новые позиции, добавленные синхронизацией.
                                if (!mergedMap[id] && drinkIds.has(String(id))) {
                                    mergedMap[id] = currentConfig.ytimesMap[id];
                                }
                            });
                        }

                        configToSave = Object.assign({}, appState, {
                            ytimesMap: mergedMap,
                            ytimesIgnored: Array.isArray(appState.ytimesIgnored)
                                ? appState.ytimesIgnored
                                : (Array.isArray(currentConfig.ytimesIgnored) ? currentConfig.ytimesIgnored : []),
                            menuSyncedAt: currentConfig.menuSyncedAt || appState.menuSyncedAt || null,
                            menuSyncSource: currentConfig.menuSyncSource || appState.menuSyncSource || null
                        });
                        appState.ytimesMap = configToSave.ytimesMap;
                        appState.ytimesIgnored = configToSave.ytimesIgnored;
                        appState.menuSyncedAt = configToSave.menuSyncedAt;
                        appState.menuSyncSource = configToSave.menuSyncSource;
                    }
                } catch (mergeError) {
                    console.warn('Supabase merge failed:', mergeError);
                }

                const { error } = await client
                    .from('site_settings')
                    .upsert({ id: 1, config: configToSave, updated_at: new Date().toISOString() }, { onConflict: 'id' });

                if (error) throw error;
                setCloudStatus('Синхронизировано с Supabase');
                if (!silent) showToast('Сохранено и синхронизировано с Supabase!');
                return true;
            } catch (error) {
                console.warn('Supabase save failed:', error);
                setCloudStatus('Ошибка записи в Supabase', true);
                if (!silent) showToast('Сохранено локально. Не удалось записать в Supabase');
                return false;
            }
        }

        async function fetchCloudStateIfConfigured() {
            const client = getSupabaseClient();
            if (!client) {
                setCloudStatus('Supabase не настроен', true);
                return;
            }

            try {
                const { data, error } = await client
                    .from('site_settings')
                    .select('config')
                    .eq('id', 1)
                    .maybeSingle();

                if (error) throw error;
                if (data && data.config) {
                    appState = normalizeCloudConfig(data.config);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
                    applyAllStateToDOM();
                    setCloudStatus('Данные получены из Supabase');
                } else {
                    setCloudStatus('В Supabase ещё нет сохранённых настроек', true);
                }
            } catch (error) {
                console.warn('Supabase load failed:', error);
                setCloudStatus('Ошибка чтения из Supabase', true);
            }
        }

        function resetToFactoryDefaults() {
            localStorage.removeItem(STORAGE_KEY);
            appState = JSON.parse(JSON.stringify(defaultAppState));
            applyAllStateToDOM();
            closeModal('adminModal');
            showToast('Меню и настройки сброшены к исходным');
        }

        // ================= УТИЛИТЫ, ШИРИНА ЭКРАНА, WI-FI И МОДАЛКИ =================
        function setShellWidth(mode) {
            const shell = document.getElementById('qrbAppShell');
            const btnMob = document.getElementById('btnLayoutMobile');
            const btnWide = document.getElementById('btnLayoutWide');
            if (mode === 'wide') {
                shell.classList.add('wide-mode');
                btnWide.className = 'px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 bg-smysl-cream text-smysl-greenDeep';
                btnMob.className = 'px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 text-smysl-cream/80 hover:text-white';
            } else {
                shell.classList.remove('wide-mode');
                btnMob.className = 'px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 bg-smysl-cream text-smysl-greenDeep';
                btnWide.className = 'px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 text-smysl-cream/80 hover:text-white';
            }
        }

        function copyWifiPassword() {
            const pass = document.getElementById('wifiPassDisplay').innerText;
            const tempInput = document.createElement('textarea');
            tempInput.value = pass;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            showToast(`Пароль Wi-Fi (${pass}) скопирован!`);
        }

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPwaPrompt = e;
        });

        async function triggerPwaInstall() {
            if (IS_ANDROID_APP) {
                showToast('Вы уже в приложении «Смысл»');
                return;
            }
            if (deferredPwaPrompt) {
                deferredPwaPrompt.prompt();
                await deferredPwaPrompt.userChoice;
                deferredPwaPrompt = null;
            } else {
                openModal('pwaModal');
            }
        }

        function openModal(id) {
            if (id === 'adminModal') {
                if (!isAdminMode) {
                    requestAdminLogin();
                    return;
                }
                renderAdminModalInputs();
            }
            document.getElementById(id).classList.remove('hidden');
        }

        function closeModal(id) {
            document.getElementById(id).classList.add('hidden');
        }

        function handleBackdropClick(event, modalId) {
            if (event.target.id === modalId) {
                closeModal(modalId);
            }
        }

        let toastTimeout;
        function showToast(message) {
            const toast = document.getElementById('toastNotification');
            document.getElementById('toastMessage').textContent = message;
            toast.classList.remove('opacity-0', '-translate-y-3');
            toast.classList.add('opacity-100', 'translate-y-0');
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                toast.classList.add('opacity-0', '-translate-y-3');
                toast.classList.remove('opacity-100', 'translate-y-0');
            }, 3000);
        }

        function applyAppModeUI() {
            if (!IS_ANDROID_APP) return;
            document.documentElement.classList.add('android-app');
            ['coverInstallBtn', 'footerInstallAppBtn'].forEach(id => {
                const element = document.getElementById(id);
                if (element) element.classList.add('hidden');
            });
        }

        function applyAllStateToDOM() {
            updateHappyHourUI();
            renderCategoryPills();
            renderLocations();
            renderMenuSections();
            renderStories();
            updateCartUI();
        }

        let clientErrorCount = 0;
        function reportClientError(message, stack) {
            try {
                if (clientErrorCount >= 5) return;
                const client = getSupabaseClient();
                if (!client || !appState.supabase.url || !appState.supabase.anonKey) return;
                clientErrorCount++;
                const payload = {
                    message: String(message || 'Ошибка без текста').slice(0, 1000),
                    stack: String(stack || '').slice(0, 4000),
                    url: String(window.location.href).slice(0, 1000),
                    user_agent: String(navigator.userAgent || '').slice(0, 500)
                };
                fetch(`${getSupabaseBaseUrl(appState.supabase.url)}/rest/v1/client_errors`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': appState.supabase.anonKey,
                        'Authorization': `Bearer ${appState.supabase.anonKey}`,
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(payload)
                }).catch(() => {});
            } catch (error) {
                // Мониторинг не должен ломать сайт.
            }
        }

        window.addEventListener('error', event => {
            if (event && event.error) {
                reportClientError(event.error.message, event.error.stack);
            } else if (event && event.message) {
                reportClientError(event.message, '');
            }
        });

        window.addEventListener('unhandledrejection', event => {
            const reason = event ? event.reason : null;
            reportClientError(reason && reason.message ? reason.message : String(reason || 'Unhandled rejection'), reason && reason.stack ? reason.stack : '');
        });

        function initGlowGarland() {
            const path = document.getElementById('glowGarlandWire');
            const layer = document.getElementById('glowGarlandBulbs');
            if (!path || !layer) return;
            layer.innerHTML = '';

            const colors = ['#57E1E6', '#FF4B4B', '#FFA23A', '#B45CFF', '#61E28C', '#FF3D3D', '#FF9A3C', '#56D6DB', '#50DEB2', '#FF9A2E', '#FF4B4B'];
            const isMobile = window.innerWidth < 640;
            const count = isMobile ? 8 : colors.length;
            const duration = 2.5;
            const delayStep = isMobile ? 0.2 : 0.15;
            const total = path.getTotalLength();
            const box = path.getBBox();
            const viewBox = path.ownerSVGElement.viewBox.baseVal;
            const viewWidth = viewBox.width || 100;
            const viewHeight = viewBox.height || 100;
            const samples = [];
            for (let step = 0; step <= 600; step += 1) {
                samples.push(path.getPointAtLength(total * (step / 600)));
            }

            for (let index = 0; index < count; index += 1) {
                const targetX = box.x + box.width * (0.08 + (index / (count - 1)) * 0.84);
                let best = samples[0];
                samples.forEach(point => {
                    if (Math.abs(point.x - targetX) < Math.abs(best.x - targetX)) best = point;
                });

                const bulb = document.createElement('div');
                bulb.className = 'glow-bulb';
                bulb.style.left = `${(best.x / viewWidth) * 100}%`;
                bulb.style.top = `${(best.y / viewHeight) * 100}%`;
                bulb.style.setProperty('--color', colors[index]);
                bulb.style.setProperty('--duration', `${duration}s`);
                bulb.style.setProperty('--delay', `${(index * delayStep).toFixed(2)}s`);
                layer.appendChild(bulb);
            }
        }

        function initSnow() {
            const layer = document.getElementById('snowLayer');
            if (!layer) return;
            layer.innerHTML = '';
            const count = window.innerWidth < 640 ? 18 : 28;
            for (let index = 0; index < count; index += 1) {
                const flake = document.createElement('span');
                flake.className = 'snowflake';
                flake.style.left = `${(Math.random() * 100).toFixed(2)}%`;
                const size = 2 + Math.floor(Math.random() * 3);
                flake.style.setProperty('--size', `${size}px`);
                flake.style.setProperty('--opacity', (0.35 + Math.random() * 0.5).toFixed(2));
                flake.style.setProperty('--duration', `${(4 + Math.random() * 5).toFixed(2)}s`);
                flake.style.setProperty('--delay', `${(-Math.random() * 8).toFixed(2)}s`);
                flake.style.setProperty('--drift', `${(Math.random() * 36 - 18).toFixed(1)}px`);
                layer.appendChild(flake);
            }
        }

        window.addEventListener('DOMContentLoaded', () => {
            initGlowGarland();
            initSnow();
            applyAppModeUI();
            applyAllStateToDOM();

            const storiesTrack = document.getElementById('storiesTrack');
            if (storiesTrack) {
                storiesTrack.addEventListener('click', event => {
                    const edit = event.target.closest('[data-story-edit]');
                    if (edit) {
                        event.stopPropagation();
                        editStoryFromFeed(edit.dataset.storyEdit);
                        return;
                    }
                    const card = event.target.closest('[data-story-id]');
                    if (card) openStoryViewer(card.dataset.storyId);
                });
                storiesTrack.addEventListener('keydown', event => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    if (event.target.closest('[data-story-edit]')) return;
                    const card = event.target.closest('[data-story-id]');
                    if (!card) return;
                    event.preventDefault();
                    openStoryViewer(card.dataset.storyId);
                });
                storiesTrack.addEventListener('scroll', updateStoriesProgress, { passive: true });
            }
            window.addEventListener('resize', updateStoriesProgress);

            initCategoryDragAndDrop();
            restoreAdminSession();
            fetchCloudStateIfConfigured();

            // Вернуть окно последнего заказа, если страницу перезагрузили.
            setTimeout(() => {
                try {
                    restoreLastOrder();
                } catch (error) {
                    console.warn('Restore last order failed:', error);
                }
            }, 700);

            // Клик по push-уведомлению открывает окно последнего заказа.
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.addEventListener('message', event => {
                    if (event.data && event.data.type === 'order-push-click') {
                        restoreLastOrder();
                    }
                });
            }

            const authClient = getSupabaseClient();
            if (authClient) {
                authClient.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_OUT') {
                        setAdminMode(false);
                    } else if (session && session.user && session.user.app_metadata && session.user.app_metadata.role === 'admin') {
                        setAdminAccountEmail(session.user.email);
                    }
                });
            }

            const params = new URLSearchParams(window.location.search);
            if (params.get('admin') === '1' && !isAdminMode) {
                setTimeout(requestAdminLogin, 300);
            }

            document.addEventListener('keydown', event => {
                if (event.key !== 'Escape') return;
                const viewer = document.getElementById('storyViewer');
                if (viewer && !viewer.classList.contains('hidden')) {
                    closeStoryViewer();
                    return;
                }
                const login = document.getElementById('adminLoginModal');
                if (login && !login.classList.contains('hidden')) closeModal('adminLoginModal');
            });
        });