// src/redux/slices/bookSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

interface Book {
  _id: string;
  title: string;
  author: string;
  price: number;
  description: string;
  category: string;
  rating: number;
  stock: number;
  image?: string;
  seller?: { name: string };
}

interface BookState {
  books: Book[];
  book: Book | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: BookState = {
  books: [],
  book: null,
  loading: false,
  error: null,
  success: false,
};

// List Books
export const listBooks = createAsyncThunk('books/list', async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem('bookbay_token');
    const response = await api.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/books/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch seller books');
  }
});

// Get Book
export const getBook = createAsyncThunk(
  'books/get',
  async (
    { id, token }: { id: string; token: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.get(`/books/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch book');
    }
  }
);



// Add Book
export const addBook = createAsyncThunk(
  'books/add',
  async ({ formData, token }: { formData: FormData; token: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/books/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add book');
    }
  }
);

// Edit Book


export const editBook = createAsyncThunk(
  'books/edit',
  async (
    {
      id,
      bookData,
      token,
    }: { id: string; bookData: FormData; token: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.patch(`/books/${id}`, bookData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update book');
    }
  }
);


// Delete Book
export const deleteBook = createAsyncThunk('books/delete', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/books/delete/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete book');
  }
});

const bookSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    resetBookState: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(listBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(listBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get
      .addCase(getBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBook.fulfilled, (state, action) => {
        state.loading = false;
        state.book = action.payload;
      })
      .addCase(getBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Add
      .addCase(addBook.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.books.push(action.payload);
      })
      .addCase(addBook.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      })

      // Edit
      .addCase(editBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books = state.books.map((book) =>
          book._id === action.payload._id ? action.payload : book
        );
      })
      .addCase(editBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete
      .addCase(deleteBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.loading = false;
        state.books = state.books.filter((book) => book._id !== action.payload);
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetBookState } = bookSlice.actions;
export default bookSlice.reducer;
