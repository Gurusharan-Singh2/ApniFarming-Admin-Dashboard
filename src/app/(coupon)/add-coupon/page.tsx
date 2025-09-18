'use client'

import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

type FormInput = {
  code: string
  start_date: string
  end_date: string
  type: 'percentage' | 'fixed'
  value: number
  minorder: number
  maxdiscout: number
  no_use_per_customer: number
  total_avialable_qty: number
  status: 0 | 1
}

export default function AddCouponPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormInput>({
    defaultValues: {
      type: 'percentage',
      status: 1,
    }
  })

  const mutation = useMutation({
    mutationFn: async (data: FormInput) => 
      axios.post('https://api.apnifarming.com/user/admin/addcoupon.php', data),
    onSuccess: () => {
      toast.success('Coupon added successfully!')
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      reset()
      router.push('/all-coupons')
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Failed to add coupon.'
      toast.error(message)
    }
  })

  const onSubmit = (data: FormInput) => mutation.mutate(data)

  return (
    <main className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Add New Coupon</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Coupon Code</Label>
              <Input type="text" placeholder="e.g. SAVE20" {...register('code', { required: true })} />
            </div>

            <div>
              <Label>Start Date</Label>
              <Input type="date" {...register('start_date', { required: true })} />
            </div>

            <div>
              <Label>End Date</Label>
              <Input type="date" {...register('end_date', { required: true })} />
            </div>

            <div>
              <Label>Type</Label>
              <select {...register('type', { required: true })} className="w-full p-2 border rounded">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>

            <div>
              <Label>Value</Label>
              <Input type="number" {...register('value', { required: true, min: 1 })} />
            </div>

            <div>
              <Label>Minimum Order Value</Label>
              <Input type="number" {...register('minorder', { required: true, min: 0 })} />
            </div>

            <div>
              <Label>Maximum Discount</Label>
              <Input type="number" {...register('maxdiscout', { required: true, min: 0 })} />
            </div>

            <div>
              <Label>No. of Uses per Customer</Label>
              <Input type="number" {...register('no_use_per_customer', { required: true, min: 1 })} />
            </div>

            <div>
              <Label>Total Available Quantity</Label>
              <Input type="number" {...register('total_avialable_qty', { required: true, min: 1 })} />
            </div>

            <div>
              <Label>Status</Label>
              <select {...register('status', { required: true })} className="w-full p-2 border rounded">
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Add Coupon'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
