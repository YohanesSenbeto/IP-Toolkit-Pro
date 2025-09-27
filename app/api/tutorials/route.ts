import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Tutorial Videos API
 * 
 * This endpoint manages tutorial videos for router configuration support.
 * It provides videos based on router models, service types, and regions.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const routerModel = searchParams.get('routerModel');
    const serviceType = searchParams.get('serviceType');
    const region = searchParams.get('region');
    const category = searchParams.get('category');

    // Build query conditions
    const whereConditions: any = {
      published: true
    };

    if (routerModel) {
      whereConditions.routerModels = {
        has: routerModel
      };
    }

    if (category) {
      whereConditions.category = {
        contains: category,
        mode: 'insensitive'
      };
    }

    // Get tutorial videos from knowledge base
    const tutorials = await prisma.knowledgeBaseArticle.findMany({
      where: whereConditions,
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        videoUrl: true,
        category: true,
        routerModels: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter by service type and region if provided
    let filteredTutorials = tutorials;

    if (serviceType || region) {
      filteredTutorials = tutorials.filter(tutorial => {
        const content = tutorial.content?.toLowerCase() || '';
        const title = tutorial.title.toLowerCase();
        
        let matches = true;

        if (serviceType) {
          const serviceTypeLower = serviceType.toLowerCase();
          matches = matches && (
            content.includes(serviceTypeLower) ||
            title.includes(serviceTypeLower) ||
            content.includes('pppoe') && serviceTypeLower === 'pppoe' ||
            content.includes('wan ip') && serviceTypeLower === 'wan_ip'
          );
        }

        if (region) {
          const regionLower = region.toLowerCase();
          matches = matches && (
            content.includes(regionLower) ||
            title.includes(regionLower)
          );
        }

        return matches;
      });
    }

    // Get router model recommendations
    const routerRecommendations = await getRouterRecommendations(serviceType, region);

    return NextResponse.json({
      success: true,
      tutorials: filteredTutorials.map(tutorial => ({
        id: tutorial.id,
        title: tutorial.title,
        slug: tutorial.slug,
        videoUrl: tutorial.videoUrl,
        category: tutorial.category,
        routerModels: tutorial.routerModels,
        description: tutorial.content?.substring(0, 200) + '...',
        createdAt: tutorial.createdAt,
        updatedAt: tutorial.updatedAt
      })),
      routerRecommendations,
      total: filteredTutorials.length
    });

  } catch (error) {
    console.error('Tutorial videos API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Create or update tutorial video
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      content,
      videoUrl,
      category,
      routerModels,
      published = true
    } = body;

    // Validate required fields
    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: 'Title and video URL are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create tutorial
    const tutorial = await prisma.knowledgeBaseArticle.create({
      data: {
        title,
        slug,
        content,
        videoUrl,
        category: category || 'Tutorial',
        routerModels: routerModels || [],
        published,
        authorId: 'system' // You might want to get this from session
      }
    });

    return NextResponse.json({
      success: true,
      tutorial: {
        id: tutorial.id,
        title: tutorial.title,
        slug: tutorial.slug,
        videoUrl: tutorial.videoUrl,
        category: tutorial.category,
        routerModels: tutorial.routerModels
      }
    });

  } catch (error) {
    console.error('Create tutorial error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get router recommendations based on service type and region
 */
async function getRouterRecommendations(serviceType?: string | null, region?: string | null) {
  const recommendations = {
    pppoe: [
      {
        model: 'TP-Link Archer C6',
        description: 'Best for residential PPPOE connections',
        price: 'ETB 2,500',
        features: ['AC1200', 'Dual Band', '4 LAN Ports'],
        tutorialUrl: 'https://youtube.com/tp-link-archer-c6-pppoe'
      },
      {
        model: 'Huawei HG8245H',
        description: 'Fiber modem with PPPOE support',
        price: 'ETB 3,000',
        features: ['GPON', 'WiFi 5', '4 LAN Ports'],
        tutorialUrl: 'https://youtube.com/huawei-hg8245h-pppoe'
      }
    ],
    wan_ip: [
      {
        model: 'D-Link DIR-825',
        description: 'Ideal for WAN IP static configurations',
        price: 'ETB 3,500',
        features: ['AC1200', 'Static IP', 'VPN Support'],
        tutorialUrl: 'https://youtube.com/d-link-dir-825-wan-ip'
      },
      {
        model: 'Netgear Nighthawk',
        description: 'High-performance router for business WAN IP',
        price: 'ETB 8,000',
        features: ['AC1900', 'Static IP', 'Advanced QoS'],
        tutorialUrl: 'https://youtube.com/netgear-nighthawk-wan-ip'
      }
    ],
    default: [
      {
        model: 'TP-Link Archer C6',
        description: 'Versatile router for all connection types',
        price: 'ETB 2,500',
        features: ['AC1200', 'Dual Band', 'Easy Setup'],
        tutorialUrl: 'https://youtube.com/tp-link-archer-c6-setup'
      }
    ]
  };

  if (serviceType?.toLowerCase() === 'pppoe') {
    return recommendations.pppoe;
  } else if (serviceType?.toLowerCase() === 'wan_ip') {
    return recommendations.wan_ip;
  }

  return recommendations.default;
}

