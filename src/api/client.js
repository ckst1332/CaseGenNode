const API_BASE_URL = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const apiClient = {
  request,
  integrations: {
    Core: {
      InvokeLLM: (payload) => request('/integrations/invoke-llm', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
      SendEmail: (payload) => request('/integrations/send-email', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
      UploadFile: (payload) => request('/integrations/upload-file', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
      GenerateImage: (payload) => request('/integrations/generate-image', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
      ExtractDataFromUploadedFile: (payload) => request('/integrations/extract-data', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    }
  },
  entities: {
    Case: {
      list: (order) => request(`/cases?order=${encodeURIComponent(order || '')}`),
      create: (data) => request('/cases', {
        method: 'POST',
        body: JSON.stringify(data)
      })
    }
  },
  auth: {
    me: () => request('/users/me'),
    updateMyUserData: (data) => request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }
};
