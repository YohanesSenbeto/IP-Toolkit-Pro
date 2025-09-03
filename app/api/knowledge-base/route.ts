import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    let whereClause: any = { published: true };

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { routerModels: { hasSome: [search] } }
      ];
    }

    const articles = await prisma.knowledgeBaseArticle.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Get categories for filtering
    const categories = await prisma.knowledgeBaseArticle.groupBy({
      by: ['category'],
      where: { published: true },
      _count: {
        category: true,
      }
    });

    return NextResponse.json({ 
      articles, 
      categories: categories.map(cat => ({
        id: cat.category,
        name: cat.category,
        count: cat._count.category
      }))
    });

  } catch (error) {
    console.error('Error fetching knowledge base articles:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, videoUrl, routerModels, category } = body;

    if (!title || !category) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const article = await prisma.knowledgeBaseArticle.create({
      data: {
        title,
        slug,
        content,
        videoUrl,
        routerModels: routerModels || [],
        category,
        published: false, // Default to draft
        authorId: 'system', // TODO: Get from session
      },
    });

    return NextResponse.json({ article }, { status: 201 });

  } catch (error) {
    console.error('Error creating knowledge base article:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}