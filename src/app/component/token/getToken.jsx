import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { getNewAccessToken } from "./refreshToken";

export const CekToken = async (router) => {
  const refreshToken = localStorage.getItem("refreshToken");
  const token = localStorage.getItem("token");
  if (refreshToken) {
    const decoded = jwtDecode(refreshToken);
    const outlet_id = decoded.id;

    const handleErrorGetOutlet = async (error) => {
      if (error.response?.status === 401) {
        try {
          const newToken = await getNewAccessToken();
          console.log(newToken, "peeeeeee");

          localStorage.setItem("token", newToken);
          await CekToken(router);
        } catch (err) {
          console.error("Failed to refresh token:", err);
          alert("Session Anda telah berakhir. Silakan login ulang.");
          localStorage.clear();
          router.push("/login");
        }
      } else {
        console.error("Error deleting contact:", error);
      }
    };

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/v1/outlet/show/${outlet_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data.data;

      return data;
    } catch (error) {
      console.log("pooooooooooooooooo");

      await handleErrorGetOutlet(error);
    }
  } else {
    router.push(`/login`);
  }
};
