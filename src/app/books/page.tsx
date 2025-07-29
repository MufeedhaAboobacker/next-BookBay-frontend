// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//   Box,
//   Card,
//   CardContent,
//   CardMedia,
//   Typography,
//   Button,
//   Grid,
//   TextField,
// } from '@mui/material';
// import api from '@/lib/api';

// interface Book {
//   _id: string;
//   title: string;
//   author: string;
//   price: number;
//   image?: string;
// }

// const BooksPage = () => {
//   const [books, setBooks] = useState<Book[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const router = useRouter();

//   useEffect(() => {
//     const fetchBooks = async () => {
//       try {
//         const res = await api.get('/books');
//         setBooks(res.data);
//       } catch (err) {
//         console.error('Error fetching books:', err);
//       }
//     };

//     fetchBooks();
//   }, []);

//   const handleView = (id: string) => {
//     router.push(`/books/${id}`);
//   };

//   const filteredBooks = books.filter(book =>
//     book.title.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <Box sx={{ padding: 4 }}>
//       <TextField
//         fullWidth
//         label="Search by title"
//         variant="outlined"
//         value={searchTerm}
//         onChange={e => setSearchTerm(e.target.value)}
//         sx={{ marginBottom: 4 }}
//       />
//       <Grid container spacing={4}>
//         {filteredBooks.map(book => (
//           <Grid item xs={12} sm={6} md={4} key={book._id}>
//             <Card>
//               {book.image && (
//                 <CardMedia
//                   component="img"
//                   height="200"
//                   image={book.image}
//                   alt={book.title}
//                 />
//               )}
//               <CardContent>
//                 <Typography variant="h6">{book.title}</Typography>
//                 <Typography variant="body2">Author: {book.author}</Typography>
//                 <Typography variant="body2">Price: ₹{book.price}</Typography>
//                 <Button
//                   variant="contained"
//                   onClick={() => handleView(book._id)}
//                   sx={{ marginTop: 2 }}
//                 >
//                   View Details
//                 </Button>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </Box>
//   );
// };

// export default BooksPage;


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  TextField,
  CircularProgress,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store'; // Update path as needed
import { listBooks } from '@/redux/slices/bookSlice'; // Update path as needed

const BooksPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');

  const { books, loading, error } = useSelector((state: RootState) => state.books);

  useEffect(() => {
    dispatch(listBooks());
  }, [dispatch]);

  const handleView = (id: string) => {
    router.push(`/books/${id}`);
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ padding: 4 }}>
      <TextField
        fullWidth
        label="Search by title"
        variant="outlined"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        sx={{ marginBottom: 4 }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={4}>
          {filteredBooks.map(book => (
            <Grid item xs={12} sm={6} md={4} key={book._id}>
              <Card>
                {book.image && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={book.image}
                    alt={book.title}
                  />
                )}
                <CardContent>
                  <Typography variant="h6">{book.title}</Typography>
                  <Typography variant="body2">Author: {book.author}</Typography>
                  <Typography variant="body2">Price: ₹{book.price}</Typography>
                  <Button
                    variant="contained"
                    onClick={() => handleView(book._id)}
                    sx={{ marginTop: 2 }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default BooksPage;
