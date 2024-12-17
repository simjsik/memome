export async function login(email: string, password: string) {
    try {
        const response = await fetch("/api/auth/loginApi", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error("Login failed");
        }

        return { success: true };
    } catch (error) {
        console.error("Error logging in:", error);
        return { success: false, message: error };
    }
}
