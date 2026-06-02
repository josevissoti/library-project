import { JSONBIN_CONFIG } from '../config';

const { BIN_ID, MASTER_KEY, BASE_URL } = JSONBIN_CONFIG;

const headers = {
  'Content-Type': 'application/json',
  'X-Master-Key': MASTER_KEY,
};

const fetchBin = async () => {
  const response = await fetch(`${BASE_URL}/${BIN_ID}/latest`, { headers });
  if (!response.ok) throw new Error('Erro ao buscar dados do JSONBin');
  const data = await response.json();
  return data.record;
};

const updateBin = async (record) => {
  const response = await fetch(`${BASE_URL}/${BIN_ID}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(record),
  });
  if (!response.ok) throw new Error('Erro ao atualizar o bin no JSONBin');
  return (await response.json()).record;
};

export const booksService = {
  createBook: async (bookData, userId) => {
    const bin = await fetchBin();
    const newBook = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      price: parseFloat(bookData.price),
      image: bookData.image || '',
      stock: parseInt(bookData.stock) || 0,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    bin.books.push(newBook);
    await updateBin(bin);
    return newBook;
  },

  getAllBooks: async () => {
    const bin = await fetchBin();
    return (bin.books || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getUserBooks: async (userId) => {
    const bin = await fetchBin();
    return (bin.books || [])
      .filter(book => book.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getBook: async (bookId) => {
    const bin = await fetchBin();
    return bin.books.find(b => b.id === bookId) || null;
  },

  updateBook: async (bookId, bookData, userId) => {
    const bin = await fetchBin();
    const index = bin.books.findIndex(book => book.id === bookId);
    if (index === -1) throw new Error('Livro não encontrado');
    if (bin.books[index].userId !== userId) throw new Error('Sem permissão');
    bin.books[index] = {
      ...bin.books[index],
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      price: parseFloat(bookData.price),
      image: bookData.image || '',
      stock: parseInt(bookData.stock) || 0,
      updatedAt: new Date().toISOString(),
    };
    await updateBin(bin);
    return bin.books[index];
  },

  deleteBook: async (bookId, userId) => {
    const bin = await fetchBin();
    const index = bin.books.findIndex(book => book.id === bookId);
    if (index === -1) throw new Error('Livro não encontrado');
    if (bin.books[index].userId !== userId) throw new Error('Sem permissão');
    bin.books.splice(index, 1);
    await updateBin(bin);
    return true;
  },

  decreaseStock: async (bookId, quantity) => {
    const bin = await fetchBin();
    const book = bin.books.find(b => b.id === bookId);
    if (!book) throw new Error('Livro não encontrado');
    if (book.stock < quantity) throw new Error('Estoque insuficiente');
    book.stock -= quantity;
    await updateBin(bin);
  },
};

export const couponsService = {
  getAll: async () => {
    const bin = await fetchBin();
    return bin.coupons || [];
  },

  create: async (couponData) => {
    const bin = await fetchBin();
    const newCoupon = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      code: couponData.code.trim().toUpperCase(),
      discountPercent: parseFloat(couponData.discountPercent),
      active: true,
      validUntil: couponData.validUntil || null,
      createdAt: new Date().toISOString(),
    };
    bin.coupons.push(newCoupon);
    await updateBin(bin);
    return newCoupon;
  },

  delete: async (couponId) => {
    const bin = await fetchBin();
    const index = bin.coupons.findIndex(c => c.id === couponId);
    if (index === -1) throw new Error('Cupom não encontrado');
    bin.coupons.splice(index, 1);
    await updateBin(bin);
    return true;
  },

  validate: async (code) => {
    const bin = await fetchBin();
    const coupon = bin.coupons.find(
      c => c.code === code.trim().toUpperCase() && c.active
    );
    if (!coupon) throw new Error('Cupom inválido ou inativo');
    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      throw new Error('Cupom expirado');
    }
    return coupon;
  },
};

export const ordersService = {
  create: async (orderData) => {
    const bin = await fetchBin();
    const newOrder = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: orderData.userId,
      items: orderData.items,
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      couponCode: orderData.couponCode || null,
      freight: orderData.freight || 0,
      total: orderData.total,
      cep: orderData.cep || '',
      address: orderData.address || null,
      createdAt: new Date().toISOString(),
    };
    bin.orders.push(newOrder);
    await updateBin(bin);
    return newOrder;
  },

  getByUser: async (userId) => {
    const bin = await fetchBin();
    return (bin.orders || [])
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};