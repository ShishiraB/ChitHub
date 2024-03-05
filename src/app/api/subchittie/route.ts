import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { SubchittieValidator } from '@/lib/validators/subchittie'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { name } = SubchittieValidator.parse(body)

    // check if subchittie already exists
    const subchittieExists = await db.subchittie.findFirst({
      where: {
        name,
      },
    })

    if (subchittieExists) {
      return new Response('subchittie already exists', { status: 409 })
    }

    // create subchittie and associate it with the user
    const subchittie = await db.subchittie.create({
      data: {
        name,
        creatorId: session.user.id,
      },
    })

    // creator also has to be subscribed
    await db.subscription.create({
      data: {
        userId: session.user.id,
        subchittieId: subchittie.id,
      },
    })

    return new Response(subchittie.name)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 })
    }

    return new Response('Could not create subchittie', { status: 500 })
  }
}
