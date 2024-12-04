import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// GET: 책 목록 조회 (필터 및 페이지네이션 지원)
app.get('/books', async (req, res) => {
  const { title, author, page = '1', pageSize = '10' } = req.query;

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

  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);

  try {
    const books = await prisma.book.findMany({
      where: filters,
      skip,
      take,
    });
    const totalBooks = await prisma.book.count({ where: filters });

    res.json({
      books,
      pagination: {
        currentPage: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(totalBooks / Number(pageSize)),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// GET: 특정 책 상세 정보
app.get('/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const book = await prisma.book.findUnique({
      where: { id },
    });
    if (book) res.json(book);
    else res.status(404).json({ error: 'Book not found' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
});

// POST: 책 추가
app.post('/books', async (req, res) => {
  const { title, author, subject, quantity } = req.body;
  try {
    const newBook = await prisma.book.create({
      data: { title, author, subject, quantity },
    });
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create book' });
  }
});

// PATCH: 책 정보 수정
app.patch('/books/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updatedBook = await prisma.book.update({
      where: { id },
      data,
    });
    res.json(updatedBook);
  } catch (err) {
    res.status(404).json({ error: 'Book not found or invalid data' });
  }
});

// DELETE: 책 삭제
app.delete('/books/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.book.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: 'Book not found' });
  }
});

// 서버 실행
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
