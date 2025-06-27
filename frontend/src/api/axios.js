// src/api/axios.js
import axios from 'axios';

/* ------------------------------------------------------------
   Inject the Auth0 access token on every outgoing request
   ------------------------------------------------------------ */
async function attachAuth(config) {
    const getToken = window.getAuth0Token;           // set in main.jsx
    if (getToken) {
        const token = await getToken();
        config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }
    return config;
}

/* ------------------------------------------------------------
   Factory – create one Axios client per micro-service
   ------------------------------------------------------------ */
function makeClient(baseURL) {
    const client = axios.create({ baseURL });
    client.interceptors.request.use(attachAuth);
    return client;
}

/* ------------------------------------------------------------
   Export a tidy bundle (singular keys everywhere)
   ------------------------------------------------------------ */
export const userAPI         = makeClient(import.meta.env.VITE_USER_API);
export const projectAPI      = makeClient(import.meta.env.VITE_PROJECT_API);
export const analyticsAPI    = makeClient(import.meta.env.VITE_ANALYTICS_API);
export const notificationAPI = makeClient(import.meta.env.VITE_NOTIFICATION_API);
export const aiAPI           = makeClient(import.meta.env.VITE_AI_API);

export const API = {
    user:         userAPI,
    project:      projectAPI,
    analytics:    analyticsAPI,
    notification: notificationAPI,
    ai:           aiAPI,
};
