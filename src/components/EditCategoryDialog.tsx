// components/EditCategoryDialog.tsx
'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Props {
  open: boolean
  onClose: () => void
  category: {
    id: number
    name: string
    image: string
    sort_order?: number | null
  }
  onSave: (data: FormData) => void
}

export default function EditCategoryDialog({ open, onClose, category, onSave }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [preview, setPreview] = useState(category.image)

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        sort_order: category.sort_order ?? '',
      })
      setPreview(category.image)
    }
  }, [category, reset])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = (data: any) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('sort_order', data.sort_order || '')

    if (data.image[0]) {
      formData.append('image', data.image[0])
    }

    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input {...register('name', { required: true })} />
            {errors.name && <p className="text-red-500 text-sm">Name is required</p>}
          </div>

          <div>
            <Label>Sort Order</Label>
            <Input type="number" {...register('sort_order')} />
          </div>

          <div>
            <Label>Image</Label>
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 rounded object-cover mb-2 border"
              />
            )}
            <Input type="file" accept="image/*" {...register('image')} onChange={handleImageChange} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
