// --- Type Definitions ---
export type SectionType = 'sacramentals' | 'chairs' | 'instruments' | 'tshirts' | 'other';

export interface CartItem {
    id?: string;
    type?: 'rental' | 'purchase';
    category?: SectionType;
    item: any; // Keep `item` object flexible to accept the whole product object
    price: number;
    quantity?: number | string;
    date?: string;
    location?: string;
    img?: string;
    variant?: string;
    rentalDays?: number;
    size?: string;
}

export const MESSAGES: Record<SectionType, string[]> = {
    sacramentals: [
        "Strengthen your faith with sacramentals.",
        "The sacraments are visible signs of God's invisible grace.",
        "The Rosary helps meditate on Jesus and Mary.",
        "Holy water reminds us of baptism and God's protection.",
        "Statues of saints inspire devotion."
    ],
    chairs: [
        "Premium seating for every occasion.",
        "Our chairs are meticulously maintained and event-ready.",
        "Perfect for weddings, banquets, and church gatherings.",
        "Hiring chairs supports the CSA mission."
    ],
    instruments: [
        "Elevate your worship with professional audio.",
        "Our instruments support choir and praise sessions.",
        "Experience clarity and harmony."
    ],
    tshirts: [
        "Wear your faith proudly.",
        "High-quality CSA branded merchandise.",
        "Supporting the community with every purchase."
    ],
    other: [
        "Discover new initiatives.",
        "CSA continues growing through community projects."
    ]
};

export const SELLER_NUMBERS = {
    sacramentals: "254112051739",
    chairs: "254112051739",
    instruments: "254112051740",
    tshirts: "254112051739" // Assuming same seller for now
};

// HIGH-QUALITY HERO IMAGES for Sacramentals
export const SLIDE_IMAGES = [
    {
        url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1200&fit=crop",
        message: "Guided by Faith, Strengthened by Prayer"
    },
    {
        url: "https://images.unsplash.com/photo-1584446549557-ca5e7baf3cc1?w=1200&fit=crop",
        message: "Sacred Symbols for Your Spiritual Journey"
    },
    {
        url: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1200&fit=crop",
        message: "Experience the Grace of the Sacramentals"
    },
    {
        url: "https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?w=1200&fit=crop",
        message: "Faith is the Light that Guides Your Path"
    }
];

// SACRAMENTAL CATEGORIES
export type SacramentalCategory = 'all' | 'rosaries' | 'bibles' | 'chains' | 'crucifixes' | 'statues' | 'candles';

export const SACRAMENTAL_CATEGORIES: { id: SacramentalCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'All Items', icon: '✦' },
    { id: 'rosaries', label: 'Rosaries', icon: '📿' },
    { id: 'bibles', label: 'Bibles & Books', icon: '📖' },
    { id: 'chains', label: 'Chains & Medals', icon: '⛓️' },
    { id: 'crucifixes', label: 'Crucifixes', icon: '✝️' },
    { id: 'statues', label: 'Statues', icon: '🗿' },
    { id: 'candles', label: 'Candles & More', icon: '🕯️' },
];

export interface SacramentalProduct {
    name: string;
    price: number;
    desc: string;
    img: string;
    category: SacramentalCategory;
}

// HIGH-QUALITY SACRAMENTALS IMAGES — organized by category
export const SACRAMENTALS_PRODUCTS: SacramentalProduct[] = [
    // --- Rosaries ---
    {
        name: "Handcrafted Wood Rosary",
        price: 150,
        desc: "Durable, beautiful wooden beads for daily meditation.",
        img: "",
        category: "rosaries"
    },
    {
        name: "Crystal Rosary – Blue",
        price: 250,
        desc: "Sparkling crystal beads with a silver-plated crucifix.",
        img: "https://images.unsplash.com/photo-1584446549557-ca5e7baf3cc1?w=600&fit=crop",
        category: "rosaries"
    },
    {
        name: "Pearl Rosary – White",
        price: 200,
        desc: "Elegant pearl finish, perfect gift for First Communion.",
        img: "https://images.unsplash.com/photo-1609170846962-a8024f8e69d2?w=600&fit=crop",
        category: "rosaries"
    },

    // --- Bibles & Books ---
    {
        name: "Prayer Book & Bible Set",
        price: 1200,
        desc: "Comprehensive guide for morning and evening prayers.",
        img: "https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?w=600&fit=crop",
        category: "bibles"
    },
    {
        name: "Holy Bible – Leather Bound",
        price: 1800,
        desc: "Premium leather-bound Bible with gold-edge pages.",
        img: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&fit=crop",
        category: "bibles"
    },
    {
        name: "Children's Illustrated Bible",
        price: 650,
        desc: "Colorful stories that bring Scripture alive for young readers.",
        img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&fit=crop",
        category: "bibles"
    },

    // --- Chains & Medals ---
    {
        name: "St. Benedict Medal",
        price: 300,
        desc: "Wearable protection and blessing.",
        img: "https://images.unsplash.com/photo-1627582531065-bcffbfbd65e5?w=600&fit=crop",
        category: "chains"
    },
    {
        name: "Miraculous Medal Chain",
        price: 350,
        desc: "Silver-plated chain featuring the Miraculous Medal of Our Lady.",
        img: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&fit=crop",
        category: "chains"
    },
    {
        name: "Gold Cross Pendant Chain",
        price: 500,
        desc: "Elegant gold-tone cross pendant on a sturdy chain.",
        img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&fit=crop",
        category: "chains"
    },

    // --- Crucifixes ---
    {
        name: "Wall Crucifix",
        price: 700,
        desc: "Detailed resin and wood finish for your home altar.",
        img: "https://images.unsplash.com/photo-1574016024951-404323afba98?w=600&fit=crop",
        category: "crucifixes"
    },
    {
        name: "Standing Desk Crucifix",
        price: 450,
        desc: "Compact crucifix for office or bedside devotion.",
        img: "https://images.unsplash.com/photo-1445445290350-18a3b86e0b5a?w=600&fit=crop",
        category: "crucifixes"
    },

    // --- Statues ---
    {
        name: "Marian Statue (Our Lady)",
        price: 850,
        desc: "Delicate features painted with care.",
        img: "https://images.unsplash.com/photo-1582294157833-287515dbe3ba?w=600&fit=crop",
        category: "statues"
    },
    {
        name: "Sacred Heart of Jesus Statue",
        price: 950,
        desc: "Hand-painted, inspired by classic Catholic imagery.",
        img: "https://images.unsplash.com/photo-1577083552431-6e5ea573543e?w=600&fit=crop",
        category: "statues"
    },

    // --- Candles & Accessories ---
    {
        name: "Beeswax Altar Candles",
        price: 450,
        desc: "Set of 2 pure beeswax candles, slow-burning.",
        img: "https://images.unsplash.com/photo-1528695027588-ac0fb8a9b2b0?w=600&fit=crop",
        category: "candles"
    },
    {
        name: "Scented Devotional Candles",
        price: 200,
        desc: "Lavender & frankincense blend to enhance prayer.",
        img: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=600&fit=crop",
        category: "candles"
    },
    {
        name: "Holy Water Font",
        price: 380,
        desc: "Ceramic wall-mount font for home blessing.",
        img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&fit=crop",
        category: "candles"
    }
];

// **UPDATED:** CSA POLO SHIRT - Pure grey with black collar
export const TSHIRT_PRODUCTS = [
    {
        name: "CSA Polo Shirt",
        price: 650,
        desc: "Official CSA polo shirt — pure grey with a smart black collar. Premium fabric, comfortable fit. Show your community pride in style.",
        img: "",
        sizes: ["S", "M", "L", "XL", "XXL"]
    }
];

// ADVANCED RENTAL PRODUCTS
export const CHAIR_PRODUCTS = [
    {
        name: "White Event Chair",
        desc: "Elegant, sturdy, and classic for indoor or marquee events.",
        img: "https://images.unsplash.com/photo-1549615555-5dc63920dcbc?w=600&fit=crop",
        features: ["Padded Seat", "Stackable", "Pristine White Finish"]
    },
    {
        name: "Garden/Outdoor Chair",
        desc: "Durable, weather-resistant seating perfect for open-air functions.",
        img: "https://images.unsplash.com/photo-1560965380-48e02ea2ea1b?w=600&fit=crop",
        features: ["All-Weather Use", "Stable on Grass", "Rustic Appeal"]
    }
];

export const INSTRUMENT_PRODUCTS = [
    {
        name: "Speakers and Microphones",
        desc: "Crystal clear vocal projection and deep bass for large spaces.",
        img: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=600&fit=crop",
        features: ["High-power Speakers", "Wireless Microphones", "Clear Audio"]
    },
    {
        name: "Piano",
        desc: "Rich acoustics and beautiful melodies for any event.",
        img: "https://images.unsplash.com/photo-1552422535-c45813c61732?w=600&fit=crop",
        features: ["Weighted Keys", "Includes Stand", "Professional Sound"]
    },
    {
        name: "Organ",
        desc: "Traditional, powerful sound for solemn mass settings.",
        img: "https://images.unsplash.com/photo-1541819665672-132d7ed161ec?w=600&fit=crop",
        features: ["Dual Manual", "Bass Pedals", "Authentic Church Reverb"]
    }
];

// --- SECTION BANNERS ---
export const SECTION_BANNERS: Record<SectionType, { img: string; title: string; subtitle: string; icon: string }> = {
    sacramentals: {
        img: "",
        title: "Devotion & Faith",
        subtitle: "A curated collection of sacred items to support your spiritual journey.",
        icon: "✦"
    },
    tshirts: {
        img: "",
        title: "CSA Merchandise & Apparel",
        subtitle: "Wear your faith with pride — official CSA polo shirts crafted for comfort and community.",
        icon: "👕"
    },
    chairs: {
        img: "",
        title: "Event Seating Rentals",
        subtitle: "Impeccable quality chairs for weddings, banquets, and large gatherings — pickup available, delivery at customer cost.",
        icon: "🪑"
    },
    instruments: {
        img: "",
        title: "Professional Audio & Instruments",
        subtitle: "High-fidelity sound equipment and instruments for pristine worship experiences.",
        icon: "🎵"
    },
    other: {
        img: "",
        title: "Other Community Projects",
        subtitle: "Exploring new horizons and supporting the community through diverse initiatives.",
        icon: "✨"
    }
};

// --- TRUST BADGES ---
export const TRUST_BADGES: Record<SectionType, { icon: string; text: string }[]> = {
    sacramentals: [
        { icon: "✨", text: "Blessed Items" },
        { icon: "🛡️", text: "Authentic" },
        { icon: "🌍", text: "Global Faith" },
        { icon: "📦", text: "Careful Packing" }
    ],
    tshirts: [
        { icon: "🧵", text: "Premium Fabric" },
        { icon: "📏", text: "All Sizes (S–XXL)" },
        { icon: "🚚", text: "Nationwide Delivery" },
        { icon: "✨", text: "Official CSA Brand" }
    ],
    chairs: [
        { icon: "🪑", text: "200+ Chairs Available" },
        { icon: "📍", text: "Pickup Only (No Delivery)" },
        { icon: "✅", text: "Spotlessly Cleaned" },
        { icon: "📞", text: "24/7 Support" }
    ],
    instruments: [
        { icon: "🎵", text: "Professional Grade" },
        { icon: "🔧", text: "Setup Included" },
        { icon: "🎧", text: "Sound Engineer Support" },
        { icon: "🛡️", text: "Insured Equipment" }
    ],
    other: [
        { icon: "🌟", text: "New Initiatives" },
        { icon: "🤝", text: "Community Focus" },
        { icon: "📈", text: "Growth Driven" },
        { icon: "💡", text: "Innovative Ideas" }
    ]
};

// --- RENTAL PROCESS STEPS ---
export const RENTAL_PROCESS_STEPS = [
    { step: 1, icon: "🔍", title: "Browse", desc: "Explore our curated collection" },
    { step: 2, icon: "💬", title: "Contact", desc: "Reach our manager via WhatsApp" },
    { step: 3, icon: "📍", title: "Pickup", desc: "Collect from us — delivery available at your cost" }
];
