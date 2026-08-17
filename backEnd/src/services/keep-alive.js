import axios from 'axios';
import logger from '../logger/winston.js';

const PING_URLS = [
    // Self-ping to keep the Render instance warm while it is awake
    'https://church-website-q8z9.onrender.com/health',
    // Frontend alive check
    'https://csakyu.com/',
];
const INTERVAL_MS = 13 * 60 * 1000; // 13 minutes

export const startKeepAliveWorker = () => {
    logger.info(`Keep-alive worker started. Pinging ${PING_URLS.join(', ')} every 13 minutes.`);

    // Initial ping after 30 seconds to allow server to fully settle
    setTimeout(() => {
        pingServers();
    }, 30000);

    setInterval(() => {
        pingServers();
    }, INTERVAL_MS);
};

const pingServers = async () => {
    for (const url of PING_URLS) {
        try {
            const response = await axios.get(url);
            logger.debug(`Keep-alive ping successful: ${response.status} ${response.statusText} -> ${url}`);
        } catch (error) {
            logger.warn(`Keep-alive ping failed for ${url}: ${error.message}`);
        }
    }
};
