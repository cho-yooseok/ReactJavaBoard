import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  IconButton,
  Alert,
  Skeleton,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { CommentSection } from '../components/CommentSection';

interface Post {
  id: number;
  title: string;
  content: string;
  authorUsername: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  likedByCurrentUser: boolean;
  isAuthor: boolean;
}

export const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/posts/${id}`);
      setPost(response.data);
    } catch (err: any) {
      setError('게시글을 불러오는데 실패했습니다.');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const handleLike = async () => {
    if (!user || !post) return;

    try {
      setLikeLoading(true);
      const response = await api.post(`/posts/${post.id}/like`);
      setPost(response.data);
      setSnackbarMessage(response.data.likedByCurrentUser ? '추천 하였습니다' : '추천이 취소되었습니다');
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error('Error toggling like:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post || !user) return;

    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await api.delete(`/posts/${post.id}`);
      navigate('/');
    } catch (err: any) {
      console.error('Error deleting post:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} />
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || '게시글을 찾을 수 없습니다.'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          목록으로 돌아가기
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          목록으로
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', flex: 1 }}>
              {post.title}
            </Typography>
            {post.isAuthor && user && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/edit/${post.id}`)}
                >
                  수정
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                >
                  삭제
                </Button>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Chip label={post.authorUsername} color="primary" variant="outlined" />
            <Typography variant="body2" color="text.secondary">
              조회 {post.viewCount}회
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(post.createdAt)}
            </Typography>
            {post.updatedAt !== post.createdAt && (
              <Typography variant="body2" color="text.secondary">
                (수정됨: {formatDate(post.updatedAt)})
              </Typography>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {post.content}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant={post.likedByCurrentUser ? 'contained' : 'outlined'}
              color="primary"
              startIcon={<ThumbUpIcon />}
              onClick={handleLike}
              disabled={!user || likeLoading}
              sx={{ minWidth: 120 }}
            >
              {post.likedByCurrentUser ? '좋아요' : '좋아요'} ({post.likeCount})
            </Button>
          </Box>
        </CardContent>
      </Card>

      <CommentSection postId={post.id} />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};
