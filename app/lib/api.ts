/**
 * Central Axios instance + typed auth API functions.
 * All requests go to http://localhost:5000/api
 */
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request automatically if one is stored
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("ns_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profile?: Record<string, unknown>;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export interface SignUpPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

// ── Auth API functions ────────────────────────────────────────────────────────

/** POST /api/auth/signup */
export async function signUp(payload: SignUpPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/signup", payload);
  return data;
}

/** POST /api/auth/signin */
export async function signIn(payload: SignInPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/signin", payload);
  return data;
}

/** GET /api/auth/me  — requires token in localStorage */
export async function getMe(): Promise<{ success: boolean; user: AuthUser }> {
  const { data } = await api.get<{ success: boolean; user: AuthUser }>("/auth/me");
  return data;
}

// ── Health / BMR types ────────────────────────────────────────────────────────

export interface HealthProfile {
  age: number;
  height: number;       // cm
  weight: number;       // kg
  gender: string;
  activityLevel: string;
  goal: string;
  medicalConditions?: string;
  location?: string;
  language?: string;
}

export interface BMRResult {
  bmr: number;
  tdee: number;
  maintenance: number;
  dailyCalorieTarget: number;
  goalLabel: string;
}

export interface HealthResponse {
  success: boolean;
  profileComplete?: boolean;
  profile: HealthProfile;
  bmr: BMRResult | null;
  message?: string;
}

// ── Health API functions ──────────────────────────────────────────────────────

/** GET /api/health/bmr — fetch BMR calculated from stored profile */
export async function fetchBMR(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>("/health/bmr");
  return data;
}

/** PUT /api/health/profile — save health profile and get BMR back */
export async function saveHealthProfile(
  payload: Partial<HealthProfile>
): Promise<HealthResponse> {
  const { data } = await api.put<HealthResponse>("/health/profile", payload);
  return data;
}

// ── Meal types ────────────────────────────────────────────────────────────────

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodItem {
  name: string;
  calories: number;
  servingSize: number;
  servingUnit: string;
  category: string;
}

export interface Meal {
  _id: string;
  userId: string;
  date: string;
  foodName: string;
  quantity: number;
  servingUnit: string;
  calories: number;
  mealType: MealType;
  fromDataset: boolean;
  createdAt: string;
}

export interface MealsResponse {
  success: boolean;
  date: string;
  meals: Meal[];
  totalCalories: number;
  byType: Record<MealType, number>;
}

export interface MealHistoryDay {
  date: string;
  totalCalories: number;
  mealCount: number;
}

export interface AddMealPayload {
  foodName: string;
  quantity: number;
  mealType: MealType;
  manualCalories?: number;
  date?: string;
}

// ── Meal API functions ────────────────────────────────────────────────────────

/** GET /api/meals/foods — full food dataset for autocomplete */
export async function getFoodList(): Promise<{ success: boolean; foods: FoodItem[] }> {
  const { data } = await api.get<{ success: boolean; foods: FoodItem[] }>("/meals/foods");
  return data;
}

/** GET /api/meals?date=YYYY-MM-DD — meals for a day (defaults to today) */
export async function getMeals(date?: string): Promise<MealsResponse> {
  const params = date ? { date } : {};
  const { data } = await api.get<MealsResponse>("/meals", { params });
  return data;
}

/** GET /api/meals/history?days=7 — last N days of daily totals */
export async function getMealHistory(
  days = 7
): Promise<{ success: boolean; history: MealHistoryDay[] }> {
  const { data } = await api.get<{ success: boolean; history: MealHistoryDay[] }>(
    "/meals/history",
    { params: { days } }
  );
  return data;
}

/** POST /api/meals — add a meal */
export async function addMeal(
  payload: AddMealPayload
): Promise<{ success: boolean; meal: Meal }> {
  const { data } = await api.post<{ success: boolean; meal: Meal }>("/meals", payload);
  return data;
}

/** DELETE /api/meals/:id — delete a meal */
export async function deleteMeal(id: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete<{ success: boolean; message: string }>(`/meals/${id}`);
  return data;
}

export default api;
