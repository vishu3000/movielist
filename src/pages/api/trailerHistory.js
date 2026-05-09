import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user.id;

  if (req.method === "GET") {
    try {
      const history = await prisma.trailerWatch.findMany({
        where: { userId },
        orderBy: { watchedAt: "desc" },
        take: 20,
      });
      return res.status(200).json({ items: history });
    } catch (e) {
      console.error("Fetch trailer history error:", e);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { tmdbId, mediaType = "movie", title, poster } = req.body || {};
      if (!tmdbId || !title) {
        return res.status(400).json({ message: "tmdbId and title are required" });
      }

      const record = await prisma.trailerWatch.upsert({
        where: {
          userId_tmdbId_mediaType: {
            userId,
            tmdbId: String(tmdbId),
            mediaType,
          },
        },
        update: { watchedAt: new Date() },
        create: {
          userId,
          tmdbId: String(tmdbId),
          mediaType,
          title,
          poster: poster || null,
        },
      });

      return res.status(200).json({ success: true, item: record });
    } catch (e) {
      console.error("Record trailer watch error:", e);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.trailerWatch.deleteMany({ where: { userId } });
      return res.status(200).json({ success: true });
    } catch (e) {
      console.error("Clear trailer history error:", e);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
