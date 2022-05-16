const TOKEN_SECRET = process.env.TOKEN_SECRET || 'supersecrettoken';
const GOOGLE_MAPS_API_URL = 'https://maps.googleapis.com/maps/api';
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

module.exports = { TOKEN_SECRET, GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_API_URL };