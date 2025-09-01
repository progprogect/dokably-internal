import { BASE_API } from '../constants/endpoints';

const customFetch = async (url: string, params: object = {}) => {
  const tokenStorage = localStorage.getItem('tokens');

  if (tokenStorage) {
    let tokens = JSON.parse(tokenStorage);
    Object(params).headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens.token}`,
      ...Object(params).headers,
    };

    let response = await fetch(url, params);
    if (response.status === 401) {
      const refreshResult = await fetch(
        `${BASE_API}/frontend/auth/refresh-token`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: tokens.refresh_token,
          }),
        }
      );

      if (refreshResult.ok) {
        tokens = await refreshResult.json();
        localStorage.setItem('tokens', JSON.stringify(tokens));
        Object(params).headers.Authorization = `Bearer ${tokens.token}`;
        response = await fetch(url, params);
      } else if (refreshResult.status === 500) {
        // window.location.href = '/500';
      } else {
        localStorage.clear();
      }
    } else if (response.status === 500) {
      // window.location.href = '/500';
    }
    return response;
  } else {
    return await fetch(url, params);
  }
};

export default customFetch;
