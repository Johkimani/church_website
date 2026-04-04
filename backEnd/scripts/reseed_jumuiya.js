import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
});

const jumuiyas = [
    { 
        slug: 'st-anthony', 
        name: 'St. Anthony', 
        category: 'scc', 
        color: '#8b5cf6', 
        description: 'A vibrant community dedicated to faith, service, and the spiritual nourishment of all members.',
        about: 'Born in Lisbon, St. Anthony of Padua (1195–1231) was a Franciscan friar known for his eloquent preaching and deep theological knowledge. He is popularly venerated as the patron saint of lost items and a tireless advocate for the poor. As a "Doctor of the Church," his teachings continue to inspire millions world-wide.',
        saint_image: '/assets/images/Anthony.png',
        history_pdf: '/assets/files/SAINT_ANTHONY.pdf'
    },
    { 
        slug: 'st-augustine', 
        name: 'St. Augustine', 
        category: 'scc', 
        color: '#3b82f6', 
        description: 'Centered on seeking truth and wisdom together through fellowship, prayer, and intellectual growth.',
        about: 'St. Augustine of Hippo (354–430) was a seminal figure in Western Christianity. Born in North Africa, he underwent a profound conversion after years of searching, guided by the prayers of his mother, St. Monica. As the Bishop of Hippo, he authored "Confessions" and "The City of God," shaping Christian theology for centuries.',
        saint_image: '/assets/images/Augustine.png',
        history_pdf: null // PDF missing in assets
    },
    { 
        slug: 'st-catherine', 
        name: 'St. Catherine', 
        category: 'scc', 
        color: '#800000', 
        description: 'A community embodying compassion and strength, focusing on service to the vulnerable and social justice.',
        about: 'St. Catherine of Siena (1347–1380) was a Dominican tertiary and mystic. Despite her lack of formal education, her profound spiritual insights and courageous letters to Popes and leaders gained her immense influence. She is a Doctor of the Church, remembered for her dedication to prayer, penance, and service to the sick during the plague.',
        saint_image: '/assets/images/Catherine.jpg',
        history_pdf: '/assets/files/SAINT_CATHERINE.pdf'
    },
    { 
        slug: 'st-dominic', 
        name: 'St. Dominic', 
        category: 'scc', 
        color: '#979695ff', 
        description: 'A community committed to preaching the Gospel through study, community life, and apostolic action.',
        about: 'St. Dominic de Guzmán (c. 1170–1221) founded the Order of Preachers (Dominicans). He saw the urgent need for an order dedicated to itinerant preaching and rigorous intellectual study to combat heresy. His commitment to poverty and education became a cornerstone for theological growth throughout Church history.',
        saint_image: '/assets/images/Dominic.png',
        history_pdf: '/assets/files/SAINT_DOMINIC.pdf'
    },
    { 
        slug: 'st-elizabeth', 
        name: 'St. Elizabeth', 
        category: 'scc', 
        color: '#07a414d1', 
        description: 'Reflecting the grace and joy of the Gospel through acts of charity and a deep commitment to family life.',
        about: 'St. Elizabeth of Hungary (1207–1231) was a princess celebrated for her extraordinary charity. Despite her noble status, she lived a life of extreme simplicity, personally tending to the sick and founding hospitals. A member of the Third Order of St. Francis, she dedicated her life to the poor, embodying true Christian service.',
        saint_image: '/assets/images/Elizabeth.png',
        history_pdf: '/assets/files/SAINT_ELIZABETH.pdf'
    },
    { 
        slug: 'st-maria-goretti', 
        name: 'St. Maria Goretti', 
        category: 'scc', 
        color: '#0ea5e9', 
        description: 'Fostering purity of heart and soul, and the transformative power of forgiveness among our youth.',
        about: 'St. Maria Goretti (1890–1902) was a young Italian girl who died as a martyr defending her purity. Her most powerful legacy is her extraordinary act of mercy: while dying, she forgave her attacker. She stands as a testament to the power of faith and the grace of forgiveness in even the most difficult circumstances.',
        saint_image: '/assets/images/MariaGoretti.png',
        history_pdf: '/assets/files/SAINT_MARIA_GORETTI.pdf'
    },
    { 
        slug: 'st-monica', 
        name: 'St. Monica', 
        category: 'scc', 
        color: '#ef4444', 
        description: 'A community inspired by patient prayer and persistent faith in supporting our families and Church.',
        about: 'St. Monica (c. 332–387) was the mother of St. Augustine. She is the patron saint of mothers, honored for her immense patience and faith. Through decades of constant prayers and tears, she witnessed the conversion of her pagan husband and her wayward son, proving that persistent prayer can move mountains.',
        saint_image: '/assets/images/Monica.png',
        history_pdf: '/assets/files/SAINT_MONICAH.pdf'
    }
];

async function run() {
    try {
        await client.connect();
        
        console.log("Reseeding sub_groups with detailed history, descriptions, and PDFs...");
        await client.query("DELETE FROM sub_groups");
        
        for (const j of jumuiyas) {
            await client.query(
                `INSERT INTO sub_groups (slug, name, category, color, description, about, saint_image, history_pdf) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [j.slug, j.name, j.category, j.color, j.description, j.about, j.saint_image, j.history_pdf]
            );
        }

        console.log(`Successfully updated ${jumuiyas.length} Jumuiyas with histories.`);
    } catch (err) {
        console.error("Reseeding failed:", err);
    } finally {
        await client.end();
    }
}

run();
