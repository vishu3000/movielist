import { userService } from "../../../services/userService";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Create user
    const user = await userService.createUser({
      name,
      email,
      password,
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.message === "User already exists") {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
}
