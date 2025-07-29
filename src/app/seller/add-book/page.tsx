'use client';

import {
  useState,
  useEffect,
  ChangeEvent,
} from 'react';
import {
  Container,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { addBook } from '@/redux/slices/bookSlice';
import toast from 'react-hot-toast';

const categories = [
  'fiction', 'non-fiction', 'educational', 'biography', 'fantasy', 'science-fiction',
  'romance', 'mystery', 'thriller', 'self-help', 'history', 'philosophy', 'children',
  'young-adult', 'comics', 'graphic-novels', 'religion', 'health', 'business',
  'technology', 'travel', 'poetry', 'cookbooks', 'art', 'sports', 'language', 'other',
];

interface FormValues {
  title: string;
  author: string;
  price: number;
  category: string;
  rating: number;
  stock: number;
  description: string;
  image: FileList;
}

const schema: yup.ObjectSchema<FormValues> = yup.object({
  title: yup.string().required('Title is required'),
  author: yup.string().required('Author is required'),
  price: yup.number().typeError('Price must be a number').positive().required('Price is required'),
  category: yup.string().required('Category is required'),
  rating: yup.number().typeError('Rating must be a number').min(0).max(5).required('Rating is required'),
  stock: yup.number().typeError('Stock must be a number').min(1).required('Stock is required'),
  description: yup.string().required('Description is required'),
  image: yup
    .mixed<FileList>()
    .required('Image is required')
    .test('fileType', 'Only image files are allowed', (value) =>
      value instanceof FileList && value.length > 0 && value[0].type.startsWith('image/')
    ),
});

const AddBookPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { success, error } = useSelector((state: RootState) => state.books);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('bookbay_user') || '{}');
    if (user?.role !== 'seller') {
      toast.error('Only sellers can add books');
      router.push('/seller');
    }
  }, [router]);

  useEffect(() => {
    if (success) {
      toast.success('Book added successfully!');
      router.push('/seller');
    }
    if (error) {
      toast.error(`Error: ${error}`);
    }
  }, [success, error, router]);

  const onSubmit = async (data: FormValues) => {
    const token = localStorage.getItem('bookbay_token');
    if (!token) return toast.error('User not authenticated');

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'image') {
        formData.append('image', (value as FileList)[0]);
      } else {
        formData.append(key, String(value));
      }
    });

    dispatch(addBook({ formData, token }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setValue('image', files, { shouldValidate: true });
      setImagePreview(URL.createObjectURL(files[0]));
    }
  };

  const handleRemoveImage = () => {
    const emptyFiles = new DataTransfer().files;
    setValue('image', emptyFiles, { shouldValidate: true });
    setImagePreview(null);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundImage: "url('/bg2.avif')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      py: 6, px: 2,
    }}>
      <Container maxWidth="md">
        <Card sx={{
          borderRadius: 3,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 20px rgba(0,0,0,0.8)',
          px: 3,
        }}>
          <CardHeader title="Add New Book" sx={{ textAlign: 'center', color: '#307d1aff', fontWeight: 'bold', fontSize: '1.8rem' }} />
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 2 }} />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
              <Grid container spacing={3}>
                {/* Form fields */}
                {[
                  { label: 'Title', name: 'title' },
                  { label: 'Author', name: 'author' },
                  { label: 'Price', name: 'price', type: 'number' },
                  { label: 'Rating', name: 'rating', type: 'number', props: { inputProps: { min: 0, max: 5, step: 0.1 } } },
                  { label: 'Stock', name: 'stock', type: 'number' },
                ].map((field, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <TextField
                      label={field.label}
                      type={field.type || 'text'}
                      fullWidth
                      variant="filled"
                      {...register(field.name as keyof FormValues)}
                      error={!!errors[field.name as keyof FormValues]}
                      helperText={errors[field.name as keyof FormValues]?.message}
                      InputProps={{ style: { color: 'white' }, ...(field.props?.inputProps ? { inputProps: field.props.inputProps } : {}) }}
                      InputLabelProps={{ style: { color: '#aaa' } }}
                    />
                  </Grid>
                ))}

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="filled" error={!!errors.category}>
                    <InputLabel sx={{ color: '#aaa' }}>Category</InputLabel>
                    <Controller
                      name="category"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Select {...field} sx={{ color: 'white' }}>
                          {categories.map((cat) => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                    <Typography variant="caption" color="error">
                      {errors.category?.message}
                    </Typography>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    multiline rows={3}
                    fullWidth
                    variant="filled"
                    {...register('description')}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    InputProps={{ style: { color: 'white' } }}
                    InputLabelProps={{ style: { color: '#aaa' } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    component="label"
                    fullWidth
                    sx={{
                      bgcolor: '#307d1aff', color: 'white', fontWeight: 600,
                      '&:hover': { bgcolor: '#1f4d13ff' },
                    }}
                  >
                    Upload Book Image
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  </Button>
                  {errors.image && (
                    <Typography variant="caption" color="error">
                      {errors.image.message}
                    </Typography>
                  )}
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
                      '&:hover': {
                        bgcolor: '#1f4d13ff',
                      },
                    }}
                  >
                    Add Book
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button
                    type="button"
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

export default AddBookPage;
