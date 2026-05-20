import {
  MOCK_OPENID,
  mockUsers,
  allPosts,
  mockComments,
  mockNotices,
  mockReports,
  mockSensitiveWords,
  mockAuditLogs,
} from './data'
import { generateId } from '@/utils/util'

let currentOpenid = MOCK_OPENID

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

function getCurrentUser() {
  return mockUsers.find((u) => u._openid === currentOpenid) || null
}

// 登录
export function login(): Promise<any> {
  const user = getCurrentUser()
  if (!user) {
    const newUser = {
      _id: generateId(),
      _openid: currentOpenid,
      nickName: '',
      avatarUrl: '',
      realName: '',
      studentId: '',
      college: '',
      cardImage: '',
      isVerified: false,
      isAdmin: false,
      isBanned: false,
      canPublishContact: false,
      agreedDisclaimer: false,
      anonymousSeed: Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    }
    mockUsers.push(newUser)
    return delay({ code: 0, message: '注册成功', data: { ...newUser, isNew: true } })
  }
  return delay({ code: 0, message: '登录成功', data: { ...user, isNew: false } })
}

export function setMockOpenid(openid: string) {
  currentOpenid = openid
}

export function getUserInfo(): Promise<any> {
  const user = getCurrentUser()
  if (!user) return delay({ code: 401, message: '未登录' })
  return delay({ code: 0, data: user })
}

export function updateUserInfo(data: { avatarUrl?: string; nickName?: string }): Promise<any> {
  const user = getCurrentUser()
  if (!user) return delay({ code: 401, message: '未登录' })
  if (data.avatarUrl) user.avatarUrl = data.avatarUrl
  if (data.nickName) user.nickName = data.nickName
  return delay({ code: 0, message: '更新成功' })
}

export function verifyStudent(data: { realName: string; studentId: string; college: string; cardImage?: string }): Promise<any> {
  const user = getCurrentUser()
  if (!user) return delay({ code: 401, message: '未登录' })
  user.realName = data.realName
  user.studentId = data.studentId
  user.college = data.college
  user.cardImage = data.cardImage || ''
  user.verifyStatus = 'pending'
  return delay({ code: 0, message: '提交成功，等待审核' })
}

export function agreeDisclaimer(): Promise<any> {
  const user = getCurrentUser()
  if (!user) return delay({ code: 401, message: '未登录' })
  user.agreedDisclaimer = true
  return delay({ code: 0, message: '已同意' })
}

// 帖子
export function getPosts(data: { type: string; category?: string; page?: number; pageSize?: number }): Promise<any> {
  let list = allPosts.filter((p) => p.type === data.type && p.status === 'approved')
  if (data.category) {
    list = list.filter((p) => p.category === data.category)
  }
  list = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return delay({ code: 0, data: { list, total: list.length } })
}

export function getPostDetail(postId: string): Promise<any> {
  const post = allPosts.find((p) => p._id === postId)
  if (!post) return delay({ code: 404, message: '帖子不存在' })
  post.viewCount = (post.viewCount || 0) + 1
  return delay({ code: 0, data: post })
}

export function createPost(data: any): Promise<any> {
  const user = getCurrentUser()
  if (!user) return delay({ code: 401, message: '未登录' })
  const newPost = {
    _id: generateId(),
    _openid: user._openid,
    authorNickName: data.isAnonymous ? '' : user.nickName,
    authorAvatar: data.isAnonymous ? '' : user.avatarUrl,
    ...data,
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    likedBy: [],
    status: 'approved',
    createdAt: new Date().toISOString(),
  }
  allPosts.unshift(newPost)
  return delay({ code: 0, message: '发布成功', data: newPost })
}

export function deletePost(postId: string): Promise<any> {
  const idx = allPosts.findIndex((p) => p._id === postId)
  if (idx === -1) return delay({ code: 404, message: '帖子不存在' })
  const user = getCurrentUser()
  const post = allPosts[idx]
  if (!user || (post._openid !== user._openid && !user.isAdmin)) {
    return delay({ code: 403, message: '无权删除' })
  }
  allPosts.splice(idx, 1)
  return delay({ code: 0, message: '删除成功' })
}

export function likePost(postId: string): Promise<any> {
  const post = allPosts.find((p) => p._id === postId)
  if (!post) return delay({ code: 404, message: '帖子不存在' })
  const user = getCurrentUser()
  if (!user) return delay({ code: 401, message: '未登录' })
  const hasLiked = post.likedBy?.includes(user._openid)
  if (hasLiked) {
    post.likedBy = post.likedBy?.filter((id: string) => id !== user._openid)
    post.likeCount = Math.max(0, (post.likeCount || 0) - 1)
  } else {
    post.likedBy = [...(post.likedBy || []), user._openid]
    post.likeCount = (post.likeCount || 0) + 1
  }
  return delay({ code: 0, message: hasLiked ? '取消点赞' : '点赞成功', data: { likeCount: post.likeCount, liked: !hasLiked } })
}

// 评论
export function getComments(postId: string): Promise<any> {
  const list = mockComments
    .filter((c) => c.postId === postId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  return delay({ code: 0, data: list })
}

export function createComment(data: { postId: string; content: string; isAnonymous?: boolean }): Promise<any> {
  const user = getCurrentUser()
  if (!user) return delay({ code: 401, message: '未登录' })
  const newComment = {
    _id: generateId(),
    postId: data.postId,
    _openid: user._openid,
    authorNickName: data.isAnonymous ? '' : user.nickName,
    content: data.content,
    isAnonymous: data.isAnonymous || false,
    createdAt: new Date().toISOString(),
  }
  mockComments.push(newComment)
  const post = allPosts.find((p) => p._id === data.postId)
  if (post) post.commentCount = (post.commentCount || 0) + 1
  return delay({ code: 0, message: '评论成功', data: newComment })
}

export function deleteComment(commentId: string): Promise<any> {
  const idx = mockComments.findIndex((c) => c._id === commentId)
  if (idx === -1) return delay({ code: 404, message: '评论不存在' })
  const user = getCurrentUser()
  const comment = mockComments[idx]
  if (!user || comment._openid !== user._openid) {
    return delay({ code: 403, message: '无权删除' })
  }
  mockComments.splice(idx, 1)
  const post = allPosts.find((p) => p._id === comment.postId)
  if (post) post.commentCount = Math.max(0, (post.commentCount || 0) - 1)
  return delay({ code: 0, message: '删除成功' })
}

// 举报
export function createReport(data: { targetType: string; targetId: string; reason: string; detail?: string }): Promise<any> {
  const user = getCurrentUser()
  if (!user) return delay({ code: 401, message: '未登录' })
  const existing = mockReports.find((r) => r.targetId === data.targetId && r.reporterId === user._id)
  if (existing) return delay({ code: 400, message: '已举报过该内容' })
  mockReports.push({
    _id: generateId(),
    ...data,
    reporterId: user._id,
    status: 'pending',
    createdAt: new Date().toISOString(),
  })
  return delay({ code: 0, message: '举报成功' })
}

// 审核
export function auditContent(data: { targetType: string; targetId: string; action: string; reason?: string }): Promise<any> {
  const user = getCurrentUser()
  if (!user || !user.isAdmin) return delay({ code: 403, message: '无权操作' })
  if (data.targetType === 'post') {
    const post = allPosts.find((p) => p._id === data.targetId)
    if (!post) return delay({ code: 404, message: '帖子不存在' })
    if (data.action === 'delete') {
      const idx = allPosts.findIndex((p) => p._id === data.targetId)
      allPosts.splice(idx, 1)
    } else {
      post.status = data.action === 'approve' ? 'approved' : 'rejected'
    }
  }
  mockAuditLogs.push({
    _id: generateId(),
    targetType: data.targetType,
    targetId: data.targetId,
    action: data.action,
    operatorId: user._id,
    reason: data.reason || '',
    createdAt: new Date().toISOString(),
  })
  return delay({ code: 0, message: '操作成功' })
}

// 管理员
export function adminGetUsers(data?: any): Promise<any> {
  const user = getCurrentUser()
  if (!user || !user.isAdmin) return delay({ code: 403, message: '无权访问' })
  let list = [...mockUsers]
  if (data?.keyword) {
    list = list.filter((u) => u.nickName?.includes(data.keyword) || u.realName?.includes(data.keyword))
  }
  return delay({ code: 0, data: { list, total: list.length } })
}

export function adminBanUser(userId: string, ban: boolean): Promise<any> {
  const admin = getCurrentUser()
  if (!admin || !admin.isAdmin) return delay({ code: 403, message: '无权访问' })
  const target = mockUsers.find((u) => u._id === userId)
  if (!target) return delay({ code: 404, message: '用户不存在' })
  target.isBanned = ban
  return delay({ code: 0, message: ban ? '已封禁' : '已解封' })
}

export function adminSetAdmin(userId: string, isAdmin: boolean): Promise<any> {
  const admin = getCurrentUser()
  if (!admin || !admin.isAdmin) return delay({ code: 403, message: '无权访问' })
  const target = mockUsers.find((u) => u._id === userId)
  if (!target) return delay({ code: 404, message: '用户不存在' })
  target.isAdmin = isAdmin
  return delay({ code: 0, message: '设置成功' })
}

export function adminGetPosts(data?: any): Promise<any> {
  const user = getCurrentUser()
  if (!user || !user.isAdmin) return delay({ code: 403, message: '无权访问' })
  let list = [...allPosts]
  if (data?.status) list = list.filter((p) => p.status === data.status)
  if (data?.keyword) list = list.filter((p) => p.content?.includes(data.keyword) || p.title?.includes(data.keyword))
  return delay({ code: 0, data: { list, total: list.length } })
}

export function adminGetReports(data?: any): Promise<any> {
  const user = getCurrentUser()
  if (!user || !user.isAdmin) return delay({ code: 403, message: '无权访问' })
  let list = [...mockReports]
  if (data?.status) list = list.filter((r) => r.status === data.status)
  return delay({ code: 0, data: { list, total: list.length } })
}

export function adminHandleReport(reportId: string, result: string): Promise<any> {
  const user = getCurrentUser()
  if (!user || !user.isAdmin) return delay({ code: 403, message: '无权访问' })
  const report = mockReports.find((r) => r._id === reportId)
  if (!report) return delay({ code: 404, message: '举报不存在' })
  report.status = 'resolved'
  report.result = result
  return delay({ code: 0, message: '处理成功' })
}

export function adminGetSensitiveWords(): Promise<any> {
  const user = getCurrentUser()
  if (!user || !user.isAdmin) return delay({ code: 403, message: '无权访问' })
  return delay({ code: 0, data: mockSensitiveWords })
}

export function adminAddSensitiveWord(word: string, level: number = 1): Promise<any> {
  const user = getCurrentUser()
  if (!user || !user.isAdmin) return delay({ code: 403, message: '无权访问' })
  if (mockSensitiveWords.some((w) => w.word === word)) {
    return delay({ code: 400, message: '敏感词已存在' })
  }
  mockSensitiveWords.push({ _id: generateId(), word, level })
  return delay({ code: 0, message: '添加成功' })
}

export function adminDeleteSensitiveWord(wordId: string): Promise<any> {
  const user = getCurrentUser()
  if (!user || !user.isAdmin) return delay({ code: 403, message: '无权访问' })
  const idx = mockSensitiveWords.findIndex((w) => w._id === wordId)
  if (idx === -1) return delay({ code: 404, message: '敏感词不存在' })
  mockSensitiveWords.splice(idx, 1)
  return delay({ code: 0, message: '删除成功' })
}

export function adminGetPendingVerifications(data?: any): Promise<any> {
  const user = getCurrentUser()
  if (!user || !user.isAdmin) return delay({ code: 403, message: '无权访问' })
  const list = mockUsers.filter((u) => u.verifyStatus === 'pending')
  return delay({ code: 0, data: { list, total: list.length } })
}

export function adminVerifyUser(userId: string): Promise<any> {
  const admin = getCurrentUser()
  if (!admin || !admin.isAdmin) return delay({ code: 403, message: '无权访问' })
  const target = mockUsers.find((u) => u._id === userId)
  if (!target) return delay({ code: 404, message: '用户不存在' })
  target.isVerified = true
  target.verifyStatus = 'approved'
  return delay({ code: 0, message: '认证通过' })
}

export function adminGrantPublishContact(userId: string, grant: boolean): Promise<any> {
  const admin = getCurrentUser()
  if (!admin || !admin.isAdmin) return delay({ code: 403, message: '无权访问' })
  const target = mockUsers.find((u) => u._id === userId)
  if (!target) return delay({ code: 404, message: '用户不存在' })
  target.canPublishContact = grant
  return delay({ code: 0, message: '设置成功' })
}

// 上传图片（前端本地预览）
export function uploadImage(filePath: string): Promise<string> {
  return delay(filePath)
}

export function uploadAvatar(filePath: string): Promise<string> {
  return delay(filePath)
}
