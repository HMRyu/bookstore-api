# bookstore api

bookstore 과제 수행을 위한 api 서버입니다.
mock data가 아닌 api 서버를 직접 만들어서 사용했습니다.

## 🛠 사용 기술
- express
  - 서버 구현을 위해 설치
- prisma
  - ORM을 사용하여 db를 편리하게 핸들링
- mongodb
  - nosql을 사용하여 유연하게 데이터 사용 가능

## 🔨 구현
- GET
  - /api/books => 모든 책 목록 조회
  - /api/books/:id => 특정 책 상세 정보
- POST
  - /api/books => 책 추가
- PATCH
  - /api/books/:id => 책 정보 수정
- DELTE
  - /api/books/:id => 책 삭제

