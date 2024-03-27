import type { Post, Subchitties, User, Vote, Comment } from '@prisma/client'

export type ExtendedPost = Post & {
  subchitties: Subchitties
  votes: Vote[]
  author: User
  comments: Comment[]
}
