import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Sync YouTube router/modem/configuration videos into TutorialVideos table.
 * This endpoint fetches all relevant videos from YouTube and inserts any missing ones.
 * Only accessible to admins (add auth as needed).
 */

export async function POST(request: NextRequest) {
  try {
    // Fetch filtered videos from your YouTube API route
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/youtube/videos`);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch YouTube videos' }, { status: 500 });
    }
    const { videos } = await res.json();
    if (!Array.isArray(videos)) {
      return NextResponse.json({ error: 'No videos found' }, { status: 404 });
    }

    let added = 0;
    for (const video of videos) {
      // Check if already exists by slug or videoUrl
      const slug = video.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const exists = await prisma.tutorialVideos.findFirst({
        where: {
          OR: [
            { slug },
            { videoUrl: video.url },
          ],
        },
      });
      if (!exists) {
        await prisma.tutorialVideos.create({
          data: {
            title: video.title,
            slug,
            content: video.description,
            videoUrl: video.url,
            category: video.modemModel || 'Tutorial',
            routerModels: video.modemModel ? [video.modemModel] : [],
            published: true,
            authorId: 'system',
            views: video.viewCount || 0,
          },
        });
        added++;
      }
    }
    return NextResponse.json({ success: true, added, total: videos.length });
  } catch (error) {
    console.error('YouTube sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
