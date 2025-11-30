# 자유 게시판 프로젝트 (Freeboard)

Spring Boot + React로 구현한 풀스택 게시판 애플리케이션입니다.

##  프로젝트 소개

이 프로젝트는 Spring Boot 백엔드와 React 프론트엔드를 결합한 현대적인 게시판 시스템입니다. JWT 기반 인증, 관리자 기능, 좋아요 시스템 등 실무에서 요구되는 다양한 기능을 구현하였습니다.

사용자는 게시글과 댓글을 작성하고 좋아요를 통해 상호작용할 수 있으며, 관리자는 모든 콘텐츠와 사용자를 관리할 수 있습니다.

##  주요 기능

### 사용자 기능
- **회원가입 및 로그인**: JWT 토큰 기반 인증 시스템
- **게시글 관리**:
  - 게시글 작성, 조회, 수정, 삭제 (CRUD)
  - 페이징 및 검색 기능 (제목, 내용, 전체 검색)
  - 조회수 및 좋아요 기능
- **댓글 관리**:
  - 댓글 작성, 조회, 수정, 삭제
  - 댓글 좋아요 기능

### 관리자 기능
- **사용자 관리**:
  - 전체 사용자 목록 조회 (페이징)
  - 사용자 역할 변경 (USER ↔ ADMIN)
  - 사용자 계정 삭제
- **게시글 관리**:
  - 전체 게시글 목록 조회 (삭제된 글 포함)
  - 게시글 임시 삭제(Soft Delete) 및 복원
  - 게시글 영구 삭제(Hard Delete)
- **댓글 관리**:
  - 전체 댓글 목록 조회 및 검색
  - 댓글 영구 삭제

##  기술 스택

### Backend
- **Java 17**
- **Spring Boot 3.2.7**
- **Spring Data JPA**
- **Spring Security**
- **MySQL**
- **JWT (JJWT 0.11.5)**
- **Lombok**
- **Gradle**

### Frontend
- **React 18.2**
- **TypeScript 4.9**
- **Material-UI (MUI) 5.14**
- **React Router 6.20**
- **Axios 1.6**

##  시작하기

### 필수 요구사항
- Java 17 이상
- Node.js 16 이상
- MySQL 8.0 이상
- Gradle

### 데이터베이스 설정

1. MySQL에 데이터베이스 생성:
```sql
CREATE DATABASE freeboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. `src/main/resources/application.properties` 파일에서 데이터베이스 설정 확인:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/freeboard?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=0000
```

### 백엔드 실행

```bash
# 프로젝트 루트 디렉토리에서
./gradlew bootRun
```

백엔드 서버는 `http://localhost:8080`에서 실행됩니다.

### 프론트엔드 실행

```bash
# frontend 디렉토리로 이동
cd frontend

# 의존성 설치 (최초 1회)
npm install

# 개발 서버 실행
npm start
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

##  API 명세

### 인증 API
| Method | URL | 설명 | 권한 |
|--------|-----|------|------|
| POST | `/api/auth/register` | 회원가입 | Public |
| POST | `/api/auth/login` | 로그인 (JWT 발급) | Public |
| GET | `/api/auth/me` | 내 정보 조회 | Authenticated |

### 게시글 API
| Method | URL | 설명 | 권한 |
|--------|-----|------|------|
| GET | `/api/posts` | 게시글 목록 조회 | Public |
| GET | `/api/posts/{id}` | 게시글 상세 조회 | Public |
| GET | `/api/posts/{id}/edit` | 게시글 수정용 조회 | Public |
| POST | `/api/posts` | 게시글 작성 | Authenticated |
| PUT | `/api/posts/{id}` | 게시글 수정 | Owner |
| DELETE | `/api/posts/{id}` | 게시글 삭제 | Owner |
| POST | `/api/posts/{id}/like` | 게시글 좋아요 토글 | Authenticated |

### 댓글 API
| Method | URL | 설명 | 권한 |
|--------|-----|------|------|
| GET | `/api/posts/{postId}/comments` | 댓글 목록 조회 | Public |
| POST | `/api/posts/{postId}/comments` | 댓글 작성 | Authenticated |
| PUT | `/api/posts/{postId}/comments/{commentId}` | 댓글 수정 | Owner |
| DELETE | `/api/posts/{postId}/comments/{commentId}` | 댓글 삭제 | Owner |
| POST | `/api/posts/{postId}/comments/{commentId}/like` | 댓글 좋아요 토글 | Authenticated |

### 관리자 API
| Method | URL | 설명 | 권한 |
|--------|-----|------|------|
| GET | `/api/admin/users` | 모든 사용자 조회 | ADMIN |
| DELETE | `/api/admin/users/{userId}` | 사용자 삭제 | ADMIN |
| PUT | `/api/admin/users/{userId}/role` | 사용자 역할 변경 | ADMIN |
| GET | `/api/admin/posts` | 모든 게시글 조회 | ADMIN |
| DELETE | `/api/admin/posts/{postId}` | 게시글 임시 삭제 | ADMIN |
| POST | `/api/admin/posts/{postId}/restore` | 게시글 복원 | ADMIN |
| DELETE | `/api/admin/posts/{postId}/hard-delete` | 게시글 영구 삭제 | ADMIN |
| GET | `/api/admin/comments` | 모든 댓글 조회 | ADMIN |
| DELETE | `/api/admin/comments/{commentId}` | 댓글 삭제 | ADMIN |

##  프로젝트 구조

```
freeboard/
├── src/main/java/com/example/freeboard/
│   ├── config/          # 설정 클래스 (Security, CORS 등)
│   ├── controller/      # REST API 컨트롤러
│   ├── dto/             # 데이터 전송 객체
│   ├── entity/          # JPA 엔티티
│   ├── repository/      # JPA 리포지토리
│   ├── service/         # 비즈니스 로직
│   └── security/        # JWT 및 보안 관련 클래스
├── src/main/resources/
│   └── application.properties
└── frontend/
    ├── public/
    └── src/
        ├── components/  # React 컴포넌트
        ├── pages/       # 페이지 컴포넌트
        ├── services/    # API 서비스
        └── types/       # TypeScript 타입 정의
```

##  주요 기술적 특징

### 백엔드
- **JWT 기반 인증**: Stateless 인증 방식으로 확장성 확보
- **Soft Delete**: 게시글 임시 삭제 기능으로 데이터 복구 가능
- **N+1 문제 해결**: JOIN FETCH를 활용한 쿼리 최적화
- **트랜잭션 관리**: `@Transactional`을 통한 데이터 일관성 보장
- **연관관계 관리**: JPA를 활용한 효율적인 엔티티 관계 설정

### 프론트엔드
- **Material-UI**: 일관된 디자인 시스템
- **TypeScript**: 타입 안정성 확보
- **Axios Interceptor**: JWT 토큰 자동 관리
- **React Router**: SPA 라우팅
- **상태 관리**: useState, useEffect를 활용한 효율적인 상태 관리

##  트러블슈팅

### 1. 사용자 탈퇴 시 연관 데이터 처리 문제

**문제**: 사용자 삭제 시 외래 키 제약 조건으로 인한 `DataIntegrityViolationException` 발생

**해결**: 서비스 계층에서 명시적 삭제 순서 구현
1. 사용자의 좋아요 기록 삭제 (`PostLike`, `CommentLike`)
2. 사용자의 댓글 삭제 (`Comment`)
3. 사용자의 게시글 삭제 (`Post`)
4. 사용자 삭제 (`User`)

```java
@Transactional
public void deleteUser(Long userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));
    
    postLikeRepository.deleteByUser(user);
    commentLikeRepository.deleteByUser(user);
    commentRepository.deleteByAuthor(user);
    postRepository.deleteByAuthor(user);
    userRepository.delete(user);
}
```

### 2. 게시글 목록 조회 시 500 에러

**문제**: `PostLikeRepository.countByPost(Post post)` 메서드 사용 시 엔티티 관리 문제로 500 에러 발생

**해결**: ID 기반 조회로 변경하여 엔티티 프록시 문제 해결
```java
// Before
Long likeCount = postLikeRepository.countByPost(post);

// After
Long likeCount = postLikeRepository.countByPostId(post.getId());
```

##  라이선스

이 프로젝트는 개인 포트폴리오 목적으로 제작되었습니다.

## 작성자

조유석 (cho-yooseok)

##  참고사항

- 초기 관리자 계정은 직접 데이터베이스에 추가하거나 회원가입 후 역할을 변경해야 합니다.
- JWT 시크릿 키는 `application.properties`에서 변경 가능합니다.
- 프로덕션 환경에서는 보안 설정을 강화해야 합니다.
