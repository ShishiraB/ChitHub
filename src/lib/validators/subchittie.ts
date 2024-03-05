import { z } from 'zod'

export const SubchittieValidator = z.object({
  name: z.string().min(3).max(21),
})

export const SubchittieSubscriptionValidator = z.object({
  subchittieId: z.string(),
})

export type CreateSubchittiePayload = z.infer<typeof SubchittieValidator>
export type SubscribeToSubchittiePayload = z.infer<
  typeof SubchittieSubscriptionValidator
>
