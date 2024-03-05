import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { SubchittieSubscriptionValidator } from '@/lib/validators/subchittie'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { subchittieId } = SubchittieSubscriptionValidator.parse(body)

    // check if user has already subscribed or not
    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subchittieId,
        userId: session.user.id,
      },
    })

    if (!subscriptionExists) {
      return new Response(
        "You've not been subscribed to this subchittie, yet.",
        {
          status: 400,
        }
      )
    }

    // create subchittie and associate it with the user
    await db.subscription.delete({
      where: {
        userId_subchittieId: {
          subchittieId,
          userId: session.user.id,
        },
      },
    })

    return new Response(subchittieId)
  } catch (error) {
    (error)
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 })
    }

    return new Response(
      'Could not unsubscribe from subchittie at this time. Please try later',
      { status: 500 }
    )
  }
}
