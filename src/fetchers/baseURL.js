const PRODUCTION = 'https://ipbv-camp-form-be-production-2b7d.up.railway.app/';

const QA = 'https://ipbv-camp-form-be-production.up.railway.app/';

const baseURL = import.meta.env.MODE === 'production' ? PRODUCTION : QA;

export default baseURL;
