import fetcher from './fetcher';

export const getTotalRegistrations = () => fetcher.get('total-registrations');

export const getPackageCount = () => fetcher.get('package-count');

export const submitFormValues = (body) => fetcher.post('send-values', body);
