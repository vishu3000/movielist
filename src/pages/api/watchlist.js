import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const items = await prisma.watchlistItem.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ items });
    } catch (e) {
      console.error("Fetch watchlist error:", e);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { tmdbId, mediaType = "movie", title, poster, backdrop } = req.body || {};

      if (!tmdbId || !title) {
        return res.status(400).json({ message: "tmdbId and title are required" });
      }

      console.log(tmdbId, mediaType, title, poster, backdrop);

      const created = await prisma.watchlistItem.upsert({
        where: {
          userId_tmdbId_mediaType: {
            userId: session.user.id,
            tmdbId: String(tmdbId),
            mediaType: mediaType,
          },
        },
        update: {}, // already exists, no change
        create: {
          userId: session.user.id,
          tmdbId: String(tmdbId),
          mediaType,
          title,
          poster: poster || null,
          backdrop: backdrop || null,
        },
      });

      return res.status(201).json({ success: true, item: created });
    } catch (e) {
      console.error("Add to watchlist error:", e);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const { tmdbId, mediaType } = req.query || {};
      if (!tmdbId || !mediaType) {
        return res.status(400).json({ message: "tmdbId and mediaType are required" });
      }

      const result = await prisma.watchlistItem.deleteMany({
        where: {
          userId: session.user.id,
          tmdbId: String(tmdbId),
          mediaType: String(mediaType),
        },
      });

      return res.status(200).json({ success: true, deleted: result.count });
    } catch (e) {
      console.error("Remove from watchlist error:", e);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}