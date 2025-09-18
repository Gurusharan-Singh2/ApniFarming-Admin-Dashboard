'use client'

import { useState, useMemo } from 'react'
import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'react-toastify'
import { Loader } from '@/components/Loader'

interface Coupon {
  id: number
  code: string
  description: string
  value: number
  maxdiscout: number
  end_date: string
  status: 0 | 1
}

interface EditFormInput {
  value: number
  maxdiscout: number
  end_date: string
}

export default function AllCouponsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null)
  const [editCouponOpen, setEditCouponOpen] = useState(false)

  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<EditFormInput>()

  // Fetch coupons
  const { data: coupons = [], isLoading, isError } = useQuery<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: async () => {
      const res = await axios.get('https://api.apnifarming.com/user/admin/listcoupon.php')
      return res.data.data
    },
  })

  // Update coupon mutation
  const updateCoupon = useMutation({
    mutationFn: async (data: { id: number, body: EditFormInput }) =>
      axios.post('https://api.apnifarming.com/user/admin/editcoupon.php', { id: data.id, ...data.body }),
    onSuccess: () => {
      toast.success('Coupon updated')
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      setEditCoupon(null)
      setEditCouponOpen(false)
    },
    onError: () => toast.error('Failed to update coupon')
  })

  // Change status mutation
  const changeStatus = useMutation({
    mutationFn: async (data: { id: number, status: 0 | 1 }) =>
      axios.post('https://api.apnifarming.com/user/admin/changecouponstatus.php', data),
    onSuccess: () => {
      toast.success('Coupon status updated')
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
    },
    onError: () => toast.error('Failed to update status')
  })

  // Filter coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase()))
  }, [coupons, search])

  // Open edit dialog
  const onEditClick = (coupon: Coupon) => {
    setEditCoupon(coupon)
    setEditCouponOpen(true)
    setValue('value', coupon.value)
    setValue('maxdiscout', coupon.maxdiscout)
    setValue('end_date', coupon.end_date)
  }

  // Submit edit
  const onSubmit = (data: EditFormInput) => {
    if (!editCoupon) return
    updateCoupon.mutate({ id: editCoupon.id, body: data })
  }

  // Toggle status
  const toggleStatus = (coupon: Coupon) => {
    changeStatus.mutate({ id: coupon.id, status: coupon.status === 1 ? 0 : 1 })
  }

  if (isLoading || updateCoupon.isPending || changeStatus.isPending) return <Loader />

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Coupons</h1>

      <Input
        type="text"
        placeholder="Search coupons..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6"
      />

      {isError ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Failed to load coupons</p>
          <Button onClick={() => queryClient.refetchQueries({ queryKey: ['coupons'] })}>
            Retry
          </Button>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No coupons found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredCoupons.map(coupon => (
            <Card key={coupon.id}>
              <CardHeader>
                <CardTitle>{coupon.code}</CardTitle>
                <CardDescription>{coupon.description}</CardDescription>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => onEditClick(coupon)}>Edit</Button>
                  <Button
                    size="sm"
                    variant={coupon.status === 1 ? 'default' : 'destructive'}
                    onClick={() => toggleStatus(coupon)}
                  >
                    {coupon.status === 1 ? 'Active' : 'Inactive'}
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Coupon Dialog */}
<Dialog
  open={editCouponOpen}
  onOpenChange={(open) => {
    setEditCouponOpen(open); // Update open state
    if (!open) setEditCoupon(null); // Clear editCoupon when closing
  }}
>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
          </DialogHeader>
          {editCoupon && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Value</Label>
                <Input type="number" {...register('value')} />
              </div>
              <div>
                <Label>Max Discount</Label>
                <Input type="number" {...register('maxdiscout')} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" {...register('end_date')} />
              </div>
              <Button type="submit" disabled={isSubmitting || updateCoupon.isPending}>
                {isSubmitting || updateCoupon.isPending ? 'Saving...' : 'Update'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
