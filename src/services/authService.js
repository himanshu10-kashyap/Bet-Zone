export const loginUser = async (credentials) => {
    try {
      const response = await fetch('https://cg.server.dummydoma.in/api/user-login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data?.message || "Login failed.");
      }
  
      return data;  // usually contains token, user data etc.
      
    } catch (error) {
      throw new Error(error?.message || "Something went wrong.");
    }
  };
  