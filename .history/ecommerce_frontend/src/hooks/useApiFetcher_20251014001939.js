import { parseJwt, API_BASE_URL } from '../utils/config'; import { ... } from '@mui/icons-material'; 
const useApiFetcher = (accessToken, setAccessToken, setRefreshToken) => {

Export to Sheets


    const refreshAccessToken = useCallback(async (refreshToken) => {
        if (!refreshToken) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (!response.ok) {
                setAccessToken(null);
                setRefreshToken(null);
                return null;
            }

            const data = await response.json();
            setAccessToken(data.access);
            return data.access;

        } catch (error) {
            console.error('Token refresh failed:', error);
            setAccessToken(null);
            setRefreshToken(null);
            return null;
        }
    }, [setAccessToken, setRefreshToken]);


    const apiFetch = useCallback(async (endpoint, options = {}) => {
        let currentToken = accessToken;

        // 1. Token Expiry Check and Refresh Attempt
        if (currentToken) {
            const payload = parseJwt(currentToken);
            // Check if expired by more than 1 minute (to avoid clock drift issues)
            const isExpired = payload && (payload.exp * 1000 < Date.now() - (60000)); 

            if (isExpired && setRefreshToken) {
                const newAccessToken = await refreshAccessToken(localStorage.getItem('refreshToken'));
                if (newAccessToken) {
                    currentToken = newAccessToken;
                }
            }
        }
        
        // 2. Set authorization header
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        
        if (currentToken) {
            headers['Authorization'] = `Bearer ${currentToken}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });

            // 3. Handle 401 Unauthorized
            if (response.status === 401 && currentToken) {
                 setAccessToken(null);
                 setRefreshToken(null);
            }
            
            return response;

        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }, [accessToken, refreshAccessToken]);

    return apiFetch;
};


export default useApiFetcher;
