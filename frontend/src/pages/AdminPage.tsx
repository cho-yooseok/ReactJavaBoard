import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: number;
  username: string;
  role: string;
  createdAt: string;
}

interface Post {
  id: number;
  title: string;
  authorUsername: string;
  createdAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

interface Comment {
  id: number;
  content: string;
  authorUsername: string;
  postTitle: string;
  createdAt: string;
  likeCount: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'user' | 'post' | 'comment';
    id: number;
    title: string;
  }>({
    open: false,
    type: 'user',
    id: 0,
    title: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersResponse, postsResponse, commentsResponse] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/posts'),
        api.get('/admin/comments'),
      ]);

      setUsers(usersResponse.data.content);
      setPosts(postsResponse.data.content);
      setComments(commentsResponse.data.content);
    } catch (err: any) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDelete = async () => {
    try {
      if (deleteDialog.type === 'user') {
        await api.delete(`/admin/users/${deleteDialog.id}`);
        setUsers(prev => prev.filter(user => user.id !== deleteDialog.id));
      } else if (deleteDialog.type === 'post') {
        await api.delete(`/admin/posts/${deleteDialog.id}/hard-delete`);
        setPosts(prev => prev.filter(post => post.id !== deleteDialog.id));
      } else if (deleteDialog.type === 'comment') {
        await api.delete(`/admin/comments/${deleteDialog.id}`);
        setComments(prev => prev.filter(comment => comment.id !== deleteDialog.id));
      }
      setDeleteDialog({ open: false, type: 'user', id: 0, title: '' });
    } catch (err: any) {
      setError('삭제에 실패했습니다.');
      console.error('Error deleting:', err);
    }
  };

  const openDeleteDialog = (type: 'user' | 'post' | 'comment', id: number, title: string) => {
    setDeleteDialog({ open: true, type, id, title });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, type: 'user', id: 0, title: '' });
  };

  const userColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'username', headerName: '사용자명', width: 150 },
    {
      field: 'role',
      headerName: '역할',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'ADMIN' ? 'error' : 'default'}
          size="small"
        />
      )
    },
    { field: 'createdAt', headerName: '가입일', width: 180 },
    {
      field: 'actions',
      type: 'actions',
      headerName: '작업',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="삭제"
          onClick={() => openDeleteDialog('user', params.row.id, params.row.username)}
          disabled={params.row.id === user?.id}
        />,
      ],
    },
  ];

  const postColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'title', headerName: '제목', width: 300 },
    { field: 'authorUsername', headerName: '작성자', width: 120 },
    { field: 'viewCount', headerName: '조회수', width: 100 },
    { field: 'likeCount', headerName: '좋아요', width: 100 },
    { field: 'commentCount', headerName: '댓글수', width: 100 },
    { field: 'createdAt', headerName: '작성일', width: 180 },
    {
      field: 'actions',
      type: 'actions',
      headerName: '작업',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="삭제"
          onClick={() => openDeleteDialog('post', params.row.id, params.row.title)}
        />,
      ],
    },
  ];

  const commentColumns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'content', headerName: '내용', width: 300 },
    { field: 'authorUsername', headerName: '작성자', width: 120 },
    { field: 'postTitle', headerName: '게시글', width: 200 },
    { field: 'likeCount', headerName: '좋아요', width: 100 },
    { field: 'createdAt', headerName: '작성일', width: 180 },
    {
      field: 'actions',
      type: 'actions',
      headerName: '작업',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="삭제"
          onClick={() => openDeleteDialog('comment', params.row.id, params.row.content)}
        />,
      ],
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>관리자 페이지</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography>로딩 중...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        관리자 페이지
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        사용자, 게시글, 댓글을 관리할 수 있습니다.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={`사용자 (${users.length})`} />
            <Tab label={`게시글 (${posts.length})`} />
            <Tab label={`댓글 (${comments.length})`} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={users}
              columns={userColumns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={posts}
              columns={postColumns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={comments}
              columns={commentColumns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
            />
          </Box>
        </TabPanel>
      </Card>

      <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
        <DialogTitle>삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>
            정말로 "{deleteDialog.title}"을(를) 삭제하시겠습니까?
            <br />
            이 작업은 되돌릴 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>취소</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
