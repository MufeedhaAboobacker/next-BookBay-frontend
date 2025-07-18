'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import Link from 'next/link';

interface BookCardProps {
  _id: string;
  title: string;
  author: string;
}

const BookCard = ({ _id, title, author }: BookCardProps) => {
  return (
    <Link href={`/books/${_id}`} passHref>
      <Box
        component="div"
        className="transition-transform hover:scale-105 duration-200"
      >
        <Card
          className="cursor-pointer rounded-2xl shadow-sm hover:shadow-xl bg-white border border-gray-200"
          sx={{
            padding: 2,
            minHeight: 160,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={600}
              gutterBottom
              sx={{ color: '#1e293b' }} // slate-800
            >
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              by {author}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Link>
  );
};

export default BookCard;
