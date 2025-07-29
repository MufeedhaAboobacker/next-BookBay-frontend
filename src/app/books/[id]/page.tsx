'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Dialog,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '@/lib/api';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  price?: number;
  rating?: number;
  category?: string;
  stock?: number;
  image?: string;
}

const BookDetail = () => {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  const [openImage, setOpenImage] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('bookbay_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setIsSeller(parsedUser?.role === 'seller');
    }
  }, []);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('bookbay_token');
        const res = await api.get(`/books/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setBook(res.data.data);
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('bookbay_token');
      await api.patch(`/books/delete/${id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Book deleted successfully');
      router.push('/seller');
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete book');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleEdit = () => router.push(`/seller/edit/${id}`);

  const goBack = () => {
    const userData = JSON.parse(localStorage.getItem('bookbay_user') || '{}');
    if (userData.role === 'seller') {
      router.push('/seller');
    } else if (userData.role === 'buyer') {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!book) {
    return (
      <Typography variant="h6" align="center" sx={{ mt: 6 }}>
        Book not found.
      </Typography>
    );
  }

  const imageUrl = book.image
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${book.image}`
    : '/images/book.png';

  return (
    <Container
        disableGutters
        maxWidth={false}
        sx={{
          minHeight: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.9)', 
          backgroundImage: 'url("/bg6.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          py: 6,
          position: 'relative',
        }}
      >
      {/* Overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 0,
        }}
      />

      {/* Centered Main Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          px: 2,
          maxWidth: 900,
          mx: 'auto',
        }}
      >

      <Card
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          boxShadow: 6,
          borderRadius: 3,
          p: 2,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', 
          color: '#fff', 
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >

    <Box sx={{ flex: 1, pr: 3 }}>
      <CardContent>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {book.title}
        </Typography>
        <Typography variant="subtitle1" color="text.light" gutterBottom>
          by {book.author}
        </Typography>
        {book.price && (
          <Typography variant="h6" color="green" gutterBottom>
            ₹{book.price}
          </Typography>
        )}
        {book.rating && (
          <Typography variant="body1" gutterBottom>
            <b>Rating:</b> {book.rating} / 5
          </Typography>
        )}
        {book.category && (
          <Typography variant="body1" gutterBottom>
            <b> Category:</b> {book.category}
          </Typography>
        )}
        <Box mt={3}>
          <Typography variant="h6"><b>Description</b></Typography>
          <Typography variant="body2" color="text.light">
            {book.description}
          </Typography>
        </Box>

        {isSeller && (
          <Box mt={4} display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              color="primary"
              onClick={handleEdit}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Delete
            </Button>
          </Box>
            )}
          </CardContent>
        </Box>

          <Box sx={{ width: 300, flexShrink: 0 }}>
            <CardMedia
              component="img"
              height="100%"
              image={imageUrl}
              alt={book.title}
              sx={{
                objectFit: 'contain',
                cursor: 'pointer',
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }}
              onClick={() => setOpenImage(true)}
              onError={(e) =>
                ((e.target as HTMLImageElement).src = '/images/book.png')
              }
            />
          </Box>
        </Card>
      </Box>

      {/* Full Image Dialog */}
      <Dialog open={openImage} onClose={() => setOpenImage(false)} maxWidth="md">
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setOpenImage(false)}
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, color: '#fff' }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={imageUrl}
            alt={book.title}
            style={{ width: '100%', height: 'auto', borderRadius: 8 }}
            onError={(e) =>
              ((e.target as HTMLImageElement).src = '/images/book.png')
            }
          />
        </Box>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <Box sx={{ p: 4, width: 320 }}>
          <Typography variant="h6" gutterBottom>
            Confirm Deletion
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Are you sure you want to delete this book?
          </Typography>
          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outlined"
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Container>
  );
};

export default BookDetail;
