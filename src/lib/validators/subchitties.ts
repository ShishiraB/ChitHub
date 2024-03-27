import { z } from 'zod'

export const SubchittiesValidator = z.object({
  name: z.string().min(3).max(21),
})

export const SubchittiesSubscriptionValidator = z.object({
  subchittiesId: z.string(),
})

export type CreateSubchittiesPayload = z.infer<typeof SubchittiesValidator>
export type SubscribeToSubchittiesPayload = z.infer<
  typeof SubchittiesSubscriptionValidator
>
