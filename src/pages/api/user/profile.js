import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { name, image } = req.body ?? {};

  // Validate name
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ message: "Name cannot be empty" });
  }
  if (name.trim().length > 60) {
    return res.status(400).json({ message: "Name must be 60 characters or fewer" });
  }

  // Validate image (if provided)
  if (image !== undefined && image !== null) {
    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      return res.status(400).json({ message: "Invalid image format" });
    }
    // base64 length * 0.75 ≈ bytes — reject anything over 5 MB
    if (image.length * 0.75 > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "Image too large" });
    }
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        ...(image !== undefined ? { image: image ?? null } : {}),
      },
      select: { name: true, image: true },
    });

    return res.status(200).json(updated);
  } catch (e) {
    console.error("Profile update error:", e);
    return res.status(500).json({ message: "Failed to save changes, please try again." });
  }
}
