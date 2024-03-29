import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { SubchittiesValidator } from '@/lib/validators/subchitties'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { name } = SubchittiesValidator.parse(body)

    // check if subchitties already exists
    const subchittiesExists = await db.subchitties.findFirst({
      where: {
        name,
      },
    })

    if (subchittiesExists) {
      return new Response('subchitties already exists', { status: 409 })
    }

    // create subchitties and associate it with the user
    const subchitties = await db.subchitties.create({
      data: {
        name,
        creatorId: session.user.id,
      },
    })

    // creator also has to be subscribed
    await db.subscription.create({
      data: {
        userId: session.user.id,
        subchittiesId: subchitties.id,
      },
    })

    return new Response(subchitties.name)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 })
    }

    return new Response('Could not create subchitties', { status: 500 })
  }
}
