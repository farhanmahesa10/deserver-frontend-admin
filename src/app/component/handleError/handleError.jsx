import { getNewAccessToken } from "../token/refreshToken";

export const handleApiError = async (error, retryFunction, router) => {
  if (error.response?.status === 401) {
    try {
      const newToken = await getNewAccessToken();
      localStorage.setItem("token", newToken);
      await retryFunction();
    } catch (err) {
      alert("Session Anda telah berakhir. Silakan login ulangggggggg.");
      localStorage.clear();
      router.push("/login");
    }
  } else {
    console.error("API Request Error:", error);
  }
};
