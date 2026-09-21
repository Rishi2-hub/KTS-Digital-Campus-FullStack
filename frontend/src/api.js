const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

export function getToken() {
  return localStorage.getItem("kts_access_token");
}

export function getCurrentUser() {
  const raw = localStorage.getItem("kts_user");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error(`Cannot connect to KTS backend at ${API_BASE}. Make sure FastAPI is running.`);
  }

  if (response.status === 204 || response.status === 205) return null;

  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();
  let body = null;

  if (raw.trim()) {
    if (contentType.includes("application/json")) {
      try { body = JSON.parse(raw); } catch { body = raw; }
    } else {
      body = raw;
    }
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    if (body?.detail) {
      message = Array.isArray(body.detail)
        ? body.detail.map((x) => x?.msg || String(x)).join(", ")
        : String(body.detail);
    } else if (body?.message) {
      message = body.message;
    } else if (typeof body === "string" && body.trim()) {
      message = body;
    }

    if (response.status === 401) {
      localStorage.removeItem("kts_access_token");
      localStorage.removeItem("kts_user");
    }
    throw new Error(message);
  }

  return body;
}

export async function login(email, password) {
  const result = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("kts_access_token", result.access_token);
  localStorage.setItem("kts_user", JSON.stringify(result.user));
  return result.user;
}

export function logout() {
  localStorage.removeItem("kts_access_token");
  localStorage.removeItem("kts_user");
}

export function getFileUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function getMaterials() {
  return request("/api/materials");
}

export async function uploadMaterial({ title, course, description, published = true, file }) {
  const form = new FormData();
  form.append("title", title);
  form.append("course", course);
  form.append("description", description || "");
  form.append("published", String(Boolean(published)));
  form.append("file", file);
  return request("/api/materials", { method: "POST", body: form });
}

export async function deleteMaterial(id) {
  return request(`/api/materials/${id}`, { method: "DELETE" });
}

export async function getAssignments() {
  return request("/api/assignments");
}

export async function createAssignment(payload) {
  return request("/api/assignments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateAssignment(id, payload) {
  return request(`/api/assignments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteAssignment(id) {
  return request(`/api/assignments/${id}`, { method: "DELETE" });
}

export async function getStudents() {
  return request("/api/students");
}

export async function getGrades(assignmentId = null) {
  const query = assignmentId ? `?assignment_id=${encodeURIComponent(assignmentId)}` : "";
  return request(`/api/grades${query}`);
}

export async function saveGrade({ assignment_id, student_id, marks, feedback }) {
  return request("/api/grades", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      assignment_id: Number(assignment_id),
      student_id: Number(student_id),
      marks: Number(marks),
      feedback: feedback || null,
    }),
  });
}

export async function deleteGrade(id) {
  return request(`/api/grades/${id}`, { method: "DELETE" });
}

export const API_URL = API_BASE;
