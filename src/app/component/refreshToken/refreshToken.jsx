import axios from "axios";

export const getNewAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/refresh-token/${refreshToken}`
    );

    const token = response.data.AccessToken;
    localStorage.setItem("token", token);
    return accessToken;
  } catch (error) {
    throw new Error("Unable to refresh token");
  }
};
