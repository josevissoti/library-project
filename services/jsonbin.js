// library-project/services/jsonbin.js
import { JSONBIN_CONFIG } from '../config';

const { BIN_ID, MASTER_KEY, BASE_URL } = JSONBIN_CONFIG;

const headers = {
  'Content-Type': 'application/json',
  'X-Master-Key': MASTER_KEY,
  // 'X-Bin-Versioning': 'false' // descomente se quiser desativar versionamento
};

// Busca o bin e retorna o array de livros
const fetchBooks = async () => {
  const response = await fetch(`${BASE_URL}/${BIN_ID}/latest`, { headers });
  if (!response.ok) throw new Error('Erro ao buscar livros do JSONBin');
  const data = await response.json();
  return data.record?.books || [];   // <-- alterado
};

// Atualiza o bin inteiro com o array de livros
const updateBin = async (booksArray) => {
  // Monta o objeto que será salvo no bin
  const binContent = { books: booksArray };
  const response = await fetch(`${BASE_URL}/${BIN_ID}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(binContent)
  });
  if (!response.ok) throw new Error('Erro ao atualizar o bin no JSONBin');
  const data = await response.json();
  return data.record?.books;
};

export const booksService = {
  createBook: async (bookData, userId) => {
    const books = await fetchBooks();
    const newBook = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      price: parseFloat(bookData.price),
      image: bookData.image || '',
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    books.push(newBook);
    await updateBin(books);
    return newBook;
  },

  getAllBooks: async () => {
    const books = await fetchBooks();
    return books.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getUserBooks: async (userId) => {
    const books = await fetchBooks();
    return books
      .filter(book => book.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getBook: async (bookId) => {
    const books = await fetchBooks();
    return books.find(book => book.id === bookId) || null;
  },

  updateBook: async (bookId, bookData, userId) => {
    const books = await fetchBooks();
    const index = books.findIndex(book => book.id === bookId);
    if (index === -1) throw new Error('Livro não encontrado');
    if (books[index].userId !== userId) throw new Error('Você não tem permissão para editar este livro');
    books[index] = {
      ...books[index],
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      price: parseFloat(bookData.price),
      image: bookData.image || '',
      updatedAt: new Date().toISOString()
    };
    await updateBin(books);
    return books[index];
  },

  deleteBook: async (bookId, userId) => {
    const books = await fetchBooks();
    const index = books.findIndex(book => book.id === bookId);
    if (index === -1) throw new Error('Livro não encontrado');
    if (books[index].userId !== userId) throw new Error('Você não tem permissão para deletar este livro');
    books.splice(index, 1);
    await updateBin(books);
    return true;
  }
};