import { useRouter } from "next/router";
import { getNewAccessToken } from "../refreshToken/refreshToken";

export const handleApiError = async (error, retryFunction) => {
  const router = useRouter();
  console.log(error, "pppppooo");

  if (error.response?.status === 401) {
    try {
      const newToken = await getNewAccessToken();
      localStorage.setItem("token", newToken);
      await retryFunction(); // Panggil kembali fungsi yang gagal
    } catch (err) {
      console.error("Failed to refresh token:", err);
      alert("Session Anda telah berakhir. Silakan login ulang.");
      localStorage.clear();
      router.push("/login");
    }
  } else {
    console.error("API Request Error:", error);
  }
};
