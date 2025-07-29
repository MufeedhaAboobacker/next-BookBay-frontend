'use client';

import React, { useEffect, useState, ChangeEvent } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { getBook, editBook, resetBookState } from '@/redux/slices/bookSlice';
import useAuthToken from '@/hooks/useAuthToken';
import Image from 'next/image';
import toast from 'react-hot-toast';

type BookFormFields = {
  title: string;
  author: string;
  price: number;
  description: string;
  category: string;
  rating: number;
  stock: number;
};

const categories = ['Fiction', 'Non-fiction', 'Education', 'Comics'];

const EditBookPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const id = useParams()?.id as string;


  const { book, loading } = useSelector((state: RootState) => state.books);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookFormFields>();

  const { token, isAuthorized, isLoading: authLoading } = useAuthToken('seller');

  useEffect(() => {
    if (!isAuthorized || !token) return;

    dispatch(getBook({ id, token }))

      .unwrap()
      .then((book) => {
        reset({
          title: book.title,
          author: book.author,
          price: book.price,
          description: book.description,
          category: book.category,
          rating: book.rating,
          stock: book.stock,
        });

        if (book.image) {
          setImagePreview(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${book.image}`);
        }
      })
      .catch((err) => {
        console.error('Fetch book error:', err);
        ('Failed to fetch book');
        router.push('/seller');
      });

    return () => {
      dispatch(resetBookState());
    };
  }, [id, dispatch, reset, router, isAuthorized, token]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
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
      await dispatch(editBook({ id, bookData: formData, token })).unwrap();
      toast.success('Book updated successfully');
      router.push('/seller');
    } catch (err) {
      toast.error('Failed to update book');
    }
  };

  if (authLoading || loading || !book) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
        <Typography mt={2}>Loading book details...</Typography>
      </Box>
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
                      rules={{ required: `${label} is required` }}
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
                      rules={{ required: 'Category is required' }}
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
                    rules={{ required: 'Description is required' }}
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
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={160}
                        height={160}
                        style={{
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
