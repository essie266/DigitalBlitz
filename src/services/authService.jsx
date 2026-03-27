const API_BASE = "http://localhost:3001/api/users";

// === Register a new user ===
export async function register(formData) {
  try {
    const {
      username,
      phone,
      password,
      confirmPassword,
      withdrawPassword,
      gender,
      inviteCode,
      agreed,
    } = formData;

    // Basic client-side validations
    if (!agreed) {
      return { success: false, message: "You must agree to the Terms." };
    }

    if (password !== confirmPassword) {
      return { success: false, message: "Passwords do not match." };
    }

    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        phone,
        loginPassword: password,
        withdrawalPassword: withdrawPassword,
        gender,
        inviteCode,
      }),
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("❌ Registration error:", err);
    return { success: false, message: "Registration failed. Try again later." };
  }
}

// === Login using username or phone number ===
export async function login(input, password) {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, password }),
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("❌ Login error:", err);
    return { success: false, message: "Login failed. Try again later." };
  }
}