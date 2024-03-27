import MiniCreatePost from '@/components/MiniCreatePost'
import PostFeed from '@/components/PostFeed'
import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    slug: string
  }
}

const page = async ({ params }: PageProps) => {
  const { slug } = params

  const session = await getAuthSession()

  const subchitties = await db.subchitties.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          subchitties: true,
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
      },
    },
  })

  if (!subchitties || subchitties.name !== slug) {
    // If the subreddit doesn't exist or the retrieved subreddit doesn't match the requested slug, return a 404 page
    return notFound()
  }

  return (
    <>
      <h1 className='font-bold text-3xl md:text-4xl h-14'>
        c/{subchitties.name}
      </h1>
      <MiniCreatePost session={session} />
      <PostFeed initialPosts={subchitties.posts} subchittiesName={subchitties.name} />
    </>
  )
}

export default page
