'use client';

import React, { useEffect, useState, ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '@/lib/api';

const categories = [
  'fiction', 'non-fiction', 'educational', 'biography', 'fantasy', 'science-fiction',
  'romance', 'mystery', 'thriller', 'self-help', 'history', 'philosophy', 'children',
  'young-adult', 'comics', 'graphic-novels', 'religion', 'health', 'business',
  'technology', 'travel', 'poetry', 'cookbooks', 'art', 'sports', 'language', 'other',
];

type BookFormFields = {
  title: string;
  author: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  stock: number;
};

const schema: yup.ObjectSchema<BookFormFields> = yup.object({
  title: yup.string().required('Title is required'),
  author: yup.string().required('Author is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().typeError('Price must be a number').positive().required('Price is required'),
  category: yup.string().required('Category is required'),
  rating: yup.number().typeError('Rating must be a number').min(0).max(5).required('Rating is required'),
  stock: yup.number().typeError('Stock must be a number').min(1).required('Stock is required'),
}).required();

const EditBookPage = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BookFormFields>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('bookbay_token');
    const userData = localStorage.getItem('bookbay_user');

    if (!storedToken || !userData) {
      alert('You must be logged in');
      router.push('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'seller') {
      alert('Access denied. Only sellers can update books.');
      router.push('/login');
      return;
    }

    setToken(storedToken);

    (async () => {
      try {
        const res = await api.get(`/books/${id}`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        const book = res.data.data;
        reset({
          title: book.title,
          author: book.author,
          description: book.description,
          price: book.price,
          category: book.category,
          rating: book.rating,
          stock: book.stock,
        });
        setImagePreview(book.image ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${book.image}` : null);
      } catch (err) {
        alert('Failed to fetch book');
        router.push('/seller');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router, reset]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: BookFormFields) => {
    if (!token) return;

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await api.patch(`/books/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Book updated successfully');
      router.push('/seller');
    } catch (error) {
      alert('Failed to update book');
    }
  };

  if (loading) {
    return (
      <Typography align="center" sx={{ mt: 6 }}>
        <CircularProgress />
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: "url('/bg2.avif')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Card
          sx={{
            borderRadius: 3,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 20px rgba(0,0,0,0.8)',
            px: 3,
          }}
        >
          <CardHeader
            title="Edit Book"
            sx={{
              textAlign: 'center',
              color: '#307d1aff',
              fontWeight: 'bold',
              fontSize: '1.8rem',
            }}
          />
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 2 }} />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
              <Grid container spacing={3}>
                {[
                  { name: 'title', label: 'Title' },
                  { name: 'author', label: 'Author' },
                  { name: 'price', label: 'Price', type: 'number' },
                  { name: 'rating', label: 'Rating', type: 'number' },
                  { name: 'stock', label: 'Stock', type: 'number' },
                ].map(({ name, label, type }) => (
                  <Grid item xs={12} md={6} key={name}>
                    <Controller
                      name={name as keyof BookFormFields}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label={label}
                          type={type || 'text'}
                          fullWidth
                          variant="filled"
                          error={!!errors[name as keyof BookFormFields]}
                          helperText={errors[name as keyof BookFormFields]?.message}
                          InputProps={{ style: { color: 'white' } }}
                          InputLabelProps={{ style: { color: '#aaa' } }}
                        />
                      )}
                    />
                  </Grid>
                  
                ))}

                 <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="filled" error={!!errors.category}>
                    <InputLabel sx={{ color: '#aaa' }}>Category</InputLabel>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} sx={{ color: 'white' }}>
                          {categories.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                              {cat}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.category && (
                      <Typography variant="caption" color="error">
                        {errors.category.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        variant="filled"
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        InputProps={{ style: { color: 'white' } }}
                        InputLabelProps={{ style: { color: '#aaa' } }}
                      />
                    )}
                  />
                </Grid>

                {/* <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="filled" error={!!errors.category}>
                    <InputLabel sx={{ color: '#aaa' }}>Category</InputLabel>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} sx={{ color: 'white' }}>
                          {categories.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                              {cat}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    {errors.category && (
                      <Typography variant="caption" color="error">
                        {errors.category.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid> */}

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    component="label"
                    fullWidth
                    sx={{
                      bgcolor: '#307d1aff',
                      color: 'white',
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#1f4d13ff' },
                    }}
                  >
                    Upload New Image
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                </Grid>

                {imagePreview && (
                  <Grid item xs={12} textAlign="center">
                    <Box mt={2}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          width: 160,
                          height: 160,
                          objectFit: 'cover',
                          borderRadius: 8,
                          border: '2px solid #307d1aff',
                        }}
                      />
                      <Button
                        variant="text"
                        color="error"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={handleRemoveImage}
                      >
                        Remove Image
                      </Button>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: '#307d1aff',
                      color: 'white',
                      fontWeight: 'bold',
                      '&:hover': { bgcolor: '#1f4d13ff' },
                    }}
                  >
                    Update Book
                  </Button>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ borderColor: '#888', color: 'white' }}
                    onClick={() => router.push('/seller')}
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default EditBookPage;
