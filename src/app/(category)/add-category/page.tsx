'use client'

import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'
import {
  
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'react-toastify'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type FormInput = {
  name: string
  sort_order: number
  image: FileList
}

export default function AddCategoryPage() {
  const queryClient = useQueryClient()
  const [preview, setPreview] = useState<string>('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormInput>()

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND}/api/admin/categories`,
        data
      )
    },
    onSuccess: () => {
      toast.success('Category added successfully!')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      reset()
      setPreview('')
    },
    onError: (err: any) => {
      const message =
        err.response?.data?.message || 'Failed to add category.'
      toast.error(message)
    },
  })

  const onSubmit = async (formData: FormInput) => {
    if (!formData.image?.[0]) {
      toast.error('Image is required.')
      return
    }

    const file = formData.image[0]
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64Image = reader.result as string
      mutation.mutate({
        name: formData.name,
        image: base64Image,
        sort_order: formData.sort_order || 0,
      })
    }
    reader.readAsDataURL(file)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <main className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input
                type="text"
                placeholder="Enter category name"
                {...register('name', { required: true })}
              />
            </div>

            <div>
              <Label>Sort Order</Label>
              <Input
                type="number"
                placeholder="Enter sort order"
                {...register('sort_order')}
              />
            </div>

            <div>
              <Label>Category Image</Label>
              <Input
                type="file"
                accept="image/*"
                {...register('image', { required: true })}
                onChange={handleImageChange}
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-2 w-32 h-32 rounded object-cover border"
                />
              )}
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Add Category'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
