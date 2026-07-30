const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

async function request(path, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...extraHeaders },
    ...rest,
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body (e.g. 204)
  }

  if (!res.ok) {
    const message =
      (body && (body.detail || flattenErrors(body))) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body;
}

function flattenErrors(errors) {
  if (typeof errors === "string") return errors;
  return Object.values(errors)
    .flat()
    .join(" ");
}

function withAuth(token) {
  return token ? { headers: { Authorization: `Token ${token}` } } : {};
}

export const api = {
  getLocations: () => request("/locations/"),
  getRoutes: () => request("/routes/"),
  getSchedules: (routeId) => request(`/schedules/?route=${encodeURIComponent(routeId)}`),
  getSeatMap: (scheduleId, date) => request(`/schedules/${scheduleId}/seats/?date=${date}`),
  createBooking: (payload) =>
    request("/bookings/", { method: "POST", body: JSON.stringify(payload) }),
  getBooking: (reference) => request(`/bookings/${reference}/`),

  login: (username, password) =>
    request("/auth/login/", { method: "POST", body: JSON.stringify({ username, password }) }),
  register: (payload) =>
    request("/auth/register/", { method: "POST", body: JSON.stringify(payload) }),
  getMe: (token) => request("/auth/me/", withAuth(token)),

  createHold: (scheduleId, date, seats) =>
    request("/holds/", { method: "POST", body: JSON.stringify({ scheduleId, travelDate: date, seats }) }),
  releaseHold: (holdId) =>
    request(`/holds/${holdId}/`, { method: "DELETE" }),

  getMyBookings: (token) => request("/bookings/my/", withAuth(token)),
};

