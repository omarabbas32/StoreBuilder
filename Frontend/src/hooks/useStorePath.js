import { useParams } from 'react-router-dom';
import { getSubdomain } from '../utils/subdomain';

export const useStorePath = () => {
    const { slug } = useParams();
    const subdomain = getSubdomain();

    // If it's a subdomain, the base path is just empty (root of subdomain)
    if (subdomain) {
        return '';
    }

    // If it's not a subdomain, we use the slug from the URL
    if (slug) {
        return `/${slug}`;
    }

    return '';
};
