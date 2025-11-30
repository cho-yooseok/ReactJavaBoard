import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Chip,
  Alert,
  Skeleton,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

interface Comment {
  id: number;
  content: string;
  authorUsername: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  likedByCurrentUser: boolean;
  isAuthor: boolean;
}

interface CommentSectionProps {
  postId: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/posts/${postId}/comments`);
      setComments(response.data);
    } catch (err: any) {
      setError('댓글을 불러오는데 실패했습니다.');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      setSubmitting(true);
      await api.post(`/posts/${postId}/comments`, {
        content: newComment.trim(),
      });
      setNewComment('');
      fetchComments();
    } catch (err: any) {
      setError('댓글 작성에 실패했습니다.');
      console.error('Error creating comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    if (!user) return;

    try {
      const response = await api.post(`/posts/${postId}/comments/${commentId}/like`);
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? { ...comment, likedByCurrentUser: response.data.likedByCurrentUser, likeCount: response.data.likeCount }
            : comment
        )
      );
      setSnackbarMessage(response.data.likedByCurrentUser ? '추천 하였습니다' : '추천이 취소되었습니다');
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error('Error toggling comment like:', err);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      await api.put(`/posts/${postId}/comments/${commentId}`, {
        content: editContent.trim(),
      });
      setEditingComment(null);
      setEditContent('');
      fetchComments();
    } catch (err: any) {
      setError('댓글 수정에 실패했습니다.');
      console.error('Error updating comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await api.delete(`/posts/${postId}/comments/${commentId}`);
      fetchComments();
    } catch (err: any) {
      setError('댓글 삭제에 실패했습니다.');
      console.error('Error deleting comment:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return '방금 전';
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          댓글 ({comments.length})
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 댓글 작성 폼 */}
        {user && (
          <Box component="form" onSubmit={handleSubmitComment} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="댓글을 작성해주세요..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SendIcon />}
                disabled={!newComment.trim() || submitting}
              >
                {submitting ? '작성 중...' : '댓글 작성'}
              </Button>
            </Box>
          </Box>
        )}

        {!user && (
          <Alert severity="info" sx={{ mb: 2 }}>
            댓글을 작성하려면 로그인이 필요합니다.
          </Alert>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* 댓글 목록 */}
        {loading ? (
          <Box>
            {[...Array(3)].map((_, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Skeleton variant="rectangular" height={80} />
              </Box>
            ))}
          </Box>
        ) : comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
          </Typography>
        ) : (
          <Box>
            {comments.map((comment) => (
              <Box key={comment.id} sx={{ mb: 2 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={comment.authorUsername} size="small" color="primary" variant="outlined" />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(comment.createdAt)}
                        </Typography>
                        {comment.updatedAt !== comment.createdAt && (
                          <Typography variant="caption" color="text.secondary">
                            (수정됨)
                          </Typography>
                        )}
                      </Box>
                      {comment.isAuthor && user && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditComment(comment)}
                            disabled={editingComment === comment.id}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>

                    {editingComment === comment.id ? (
                      <Box>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          sx={{ mb: 1 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            onClick={() => {
                              setEditingComment(null);
                              setEditContent('');
                            }}
                          >
                            취소
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleSaveEdit(comment.id)}
                          >
                            저장
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                        {comment.content}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleLikeComment(comment.id)}
                        disabled={!user}
                        color={comment.likedByCurrentUser ? 'primary' : 'default'}
                      >
                        {<ThumbUpIcon fontSize="small" />}
                      </IconButton>
                      <Typography variant="caption" color="text.secondary">
                        {comment.likeCount}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Card>
  );
};
