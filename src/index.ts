import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// GET: 책 목록 조회 (필터 및 페이지네이션 지원)
app.get('/api/books', async (req, res) => {
  // 쿼리 파라미터에서 page와 pageSize를 받아옵니다. 기본값을 설정합니다.
  const { page = '1', pageSize = '10' } = req.query;

  // 페이지네이션을 위한 skip과 take 값을 계산합니다.
  const skip = (Number(page) - 1) * Number(pageSize); // 이전 페이지에 해당하는 책의 개수를 skip
  const take = Number(pageSize); // 한 페이지에 표시할 책의 개수

  try {
    // Prisma에서 책 목록을 조회합니다.
    const books = await prisma.book.findMany({
      skip, // 페이지네이션을 위해 skip 설정
      take, // 한 페이지에 표시할 책의 수
    });

    // 전체 책 수를 조회하여 페이지네이션 정보 제공
    const totalBooks = await prisma.book.count();

    res.json({
      books, // 책 목록
      pagination: {
        currentPage: Number(page), // 현재 페이지 번호
        pageSize: Number(pageSize), // 한 페이지에 표시할 책의 수
        totalPages: Math.ceil(totalBooks / Number(pageSize)), // 전체 페이지 수
        totalBooks, // 전체 책 수
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// GET: 특정 책 상세 정보
app.get('/api/books/:id', async (req, res) => {
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
app.post('/api/books', async (req, res) => {
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
app.patch('/api/books/:id', async (req, res) => {
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
app.delete('/api/books/:id', async (req, res) => {
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
