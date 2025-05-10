import instance from "../api/api";

export const getNewAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await instance.post(
      `/api/v1/refresh-token/${refreshToken}`
    );

    const token = response.data.data.accessToken;
    return token;
  } catch (error) {
    throw new Error("Unable to refresh token");
  }
};
