import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthTokenFromRequest, verifyToken } from '@/lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const category = await prisma.category.findUnique({ where: { id: params.id } });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const productCount = await prisma.product.count({ where: { categoryId: params.id } });
    if (productCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete: ' + productCount + ' product(s) are in this category. Delete those products first.' },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Failed to delete category', detail: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const category = await prisma.category.findUnique({ where: { id: params.id } });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, description, image } = body;

    const updated = await prisma.category.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        description: description !== undefined ? description : category.description,
        image: image !== undefined ? image : category.image,
      },
    });

    return NextResponse.json({ category: updated, message: 'Category updated' });
  } catch (error: any) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}
