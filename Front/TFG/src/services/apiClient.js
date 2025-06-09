const baseUrl = import.meta.env.VITE_API_URL;

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorBody = await response.json();
    throw errorBody;
  }
  return response.json();
};

const apiClient = {
  async get(url) {
    const response = await fetch(`${baseUrl}${url}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return handleResponse(response);
  },

  async post(url, data) {
    const response = await fetch(`${baseUrl}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  async patch(url, data) {
    const response = await fetch(`${baseUrl}${url}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

async delete(url) {
  const response = await fetch(`${baseUrl}${url}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });


  if (response.status === 204) {
    return null;
  }

  return handleResponse(response);
},

async put(url, data) {
  const response = await fetch(`${baseUrl}${url}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

};

export default apiClient;


