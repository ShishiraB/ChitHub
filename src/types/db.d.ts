import type { Post, Subchittie, User, Vote, Comment } from '@prisma/client'

export type ExtendedPost = Post & {
  subchittie: Subchittie
  votes: Vote[]
  author: User
  comments: Comment[]
}
