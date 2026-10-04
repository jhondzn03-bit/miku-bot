function pickFirstString(values = []) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function extractResult(data = {}) {
  return data?.result || data?.data || data || {};
}

function extractMediaUrl(result = {}) {
  return pickFirstString([
    result?.url,
    result?.download,
    result?.audio,
    result?.video,
    result?.dl,
    result?.link,
    result?.media,
    result?.nowm,
    result?.nowatermark,
    result?.hd,
    result?.sd,
  ]);
}

function extractTitle(result = {}, fallback = 'archivo') {
  return pickFirstString([
    result?.title,
    result?.name,
    result?.filename,
    result?.fileName,
    fallback,
  ]);
}

function toAbsoluteUrl(rawUrl = '', baseUrl = 'https://dv-yer-api.online') {
  const value = String(rawUrl || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `${String(baseUrl).replace(/\/$/, '')}${value}`;
  return value;
}

function extractMediaCandidates(result = {}, baseUrl = 'https://dv-yer-api.online') {
  const raw = [
    result?.download_url_full,
    result?.stream_url_full,
    result?.provider_direct_url,
    result?.direct_url,
    result?.download_url,
    result?.stream_url,
    result?.url,
    result?.download,
    result?.audio,
    result?.video,
    result?.dl,
    result?.link,
    result?.media,
    result?.nowm,
    result?.nowatermark,
    result?.hd,
    result?.sd,
  ];
  const out = [];
  const seen = new Set();
  for (const item of raw) {
    const abs = toAbsoluteUrl(item, baseUrl);
    if (!abs || seen.has(abs)) continue;
    seen.add(abs);
    out.push(abs);
  }
  return out;
}

async function callApi(ctx = {}, endpoint = '', params = {}) {
  const axios = ctx?.axios;
  const settings = ctx?.settings || {};
  const apiBaseUrl = String(settings.apiBaseUrl || 'https://dv-yer-api.online').trim();
  const apiKey = String(settings.apiKey || 'dvyer985747404183').trim();

  if (!axios) {
    throw new Error('Axios no disponible en contexto.');
  }

  const url = `${apiBaseUrl.replace(/\/$/, '')}/${String(endpoint || '').replace(/^\//, '')}`;
  const response = await axios.get(url, {
    params: { ...params, apikey: apiKey },
    timeout: 60000,
  });

  return extractResult(response?.data || {});
}

module.exports = {
  callApi,
  extractMediaUrl,
  extractMediaCandidates,
  extractTitle,
  toAbsoluteUrl,
};
