import SubscribeLeaveToggle from '@/components/SubscribeLeaveToggle'
import ToFeedButton from '@/components/ToFeedButton'
import { buttonVariants } from '@/components/ui/Button'
import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'ChitHub',
  description: 'ChitHub: Your Next.js-powered community hub for discussions and content sharing.',
}

const Layout = async ({
  children,
  params: { slug },
}: {
  children: ReactNode
  params: { slug: string }
}) => {
  const session = await getAuthSession()

  const subchitties = await db.subchitties.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  })

  const subscription = !session?.user
    ? undefined
    : await db.subscription.findFirst({
        where: {
          subchitties: {
            name: slug,
          },
          user: {
            id: session.user.id,
          },
        },
      })

  const isSubscribed = !!subscription

  if (!subchitties) return notFound()

  const memberCount = await db.subscription.count({
    where: {
      subchitties: {
        name: slug,
      },
    },
  })

  // Retrieve the usernames of the joined members
  const joinedMembers = await db.subscription.findMany({
    where: {
      subchitties: {
        name: slug,
      },
    },
    include: {
      user: true,
    },
  })

  const isCreator = subchitties.creatorId === session?.user?.id

  return (
    <div className='sm:container max-w-7xl mx-auto h-full pt-12'>
      <div>
        <ToFeedButton />

        <div className='grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6'>
          <ul className='flex flex-col col-span-2 space-y-6'>{children}</ul>

          {/* info sidebar */}
          <div className='overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last'>
            <div className='px-6 py-4'>
              <p className='font-semibold py-3'>About c/{subchitties.name}</p>
            </div>
            <dl className='divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white'>
              <div className='flex justify-between gap-x-4 py-3'>
                <dt className='text-gray-500'>Created</dt>
                <dd className='text-gray-700'>
                  <time dateTime={subchitties.createdAt.toDateString()}>
                    {format(subchitties.createdAt, 'MMMM d, yyyy')}
                  </time>
                </dd>
              </div>
              <div className='flex justify-between gap-x-4 py-3'>
                <dt className='text-gray-500'>Members</dt>
                <dd className='flex items-start gap-x-2'>
                  <div className='text-gray-900'>{memberCount}</div>
                </dd>
              </div>
              {subchitties.creatorId === session?.user?.id ? (
                <div className='flex justify-between gap-x-4 py-3'>
                  <dt className='text-gray-500'>You created this community</dt>
                </div>
              ) : null}

              {isCreator && joinedMembers.length > 0 && (
                <div className='py-3'>
                  <p className='font-semibold'>Joined Members:</p>
                  <ul>
                    {joinedMembers.map((membership) => (
                      <li key={membership.user.id}>{membership.user.username}</li>
                    ))}
                  </ul>
                </div>
              )}

              {subchitties.creatorId !== session?.user?.id ? (
                <SubscribeLeaveToggle
                  isSubscribed={isSubscribed}
                  subchittiesId={subchitties.id}
                  subredditName={subchitties.name}
                />
              ) : null}

              <Link
                className={buttonVariants({
                  variant: 'outline',
                  className: 'w-full mb-6',
                })}
                href={`/c/${slug}/submit`}>
                Create Post
              </Link>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout
