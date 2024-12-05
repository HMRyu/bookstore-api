import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// GET: 책 목록 조회 (필터 및 페이지네이션 지원)
app.get('/api/books', async (req, res) => {
  const { title, author } = req.query;

  const filters: {
    title?: { contains: string; mode: 'insensitive' };
    author?: { contains: string; mode: 'insensitive' };
  } = {};

  if (title) {
    filters.title = { contains: title as string, mode: 'insensitive' };
  }
  if (author) {
    filters.author = { contains: author as string, mode: 'insensitive' };
  }

  try {
    const books = await prisma.book.findMany({
      where: filters,
    });

    res.json({
      success: true,
      data: {
        books,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch books',
    });
  }
});

// GET: 특정 책 상세 정보
app.get('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const book = await prisma.book.findUnique({
      where: { id },
    });
    if (book) {
      res.json({
        success: true,
        data: book,
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Book not found',
      });
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'Invalid ID format',
    });
  }
});

// POST: 책 추가
app.post('/api/books', async (req, res) => {
  const { title, author, subject, quantity } = req.body;
  try {
    const newBook = await prisma.book.create({
      data: { title, author, subject, quantity },
    });
    res.status(201).json({
      success: true,
      data: newBook,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'Failed to create book',
    });
  }
});

// PATCH: 책 정보 수정
app.patch('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updatedBook = await prisma.book.update({
      where: { id },
      data,
    });
    res.json({
      success: true,
      data: updatedBook,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      error: 'Book not found or invalid data',
    });
  }
});

// DELETE: 책 삭제
app.delete('/api/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.book.delete({ where: { id } });
    res.status(204).json({
      success: true,
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      error: 'Book not found',
    });
  }
});

// 서버 실행
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
