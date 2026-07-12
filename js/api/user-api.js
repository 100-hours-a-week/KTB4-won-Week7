import { request } from "./api-client.js";
import { authenticate, terminateSession } from "./auth-session.js";

export const loginUser = (credentials) => authenticate(credentials);
export const signupUser = (userData) => request("/users/signup", { method: "POST", body: userData });
export const checkEmailAvailability = (email) => request(`/users/email/check?email=${encodeURIComponent(email)}`);
export const checkNicknameAvailability = (nickname) => request(`/users/nickname/check?nickname=${encodeURIComponent(nickname)}`);
export const getUserProfile = () => request("/users/info", { auth: true });
export const updateUserProfile = (profileData) => request("/users/info", { method: "PUT", body: profileData, auth: true });
export const updatePassword = (password) => request("/users/password", { method: "PUT", body: { password }, auth: true });
export const logoutUser = () => terminateSession();
export const withdrawUser = () => request("/users/info", { method: "DELETE", auth: true });
