'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from  'react-toastify'
import { Loader2 } from 'lucide-react'

interface Category {
  id: number
  name: string
  image: string
  sort_order?: number | null
}

export default function EditCategory({ params }: { params: { id: string } }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch category data
  const { data: category, isLoading, isError } = useQuery<Category>({
    queryKey: ['category', params.id],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND}/api/admin/categories/${params.id}`)
      return res.data
    },
  })

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: (updatedCategory: Omit<Category, 'id'>) => 
      axios.put(`${process.env.NEXT_PUBLIC_BACKEND}/api/admin/categories/${params.id}`, updatedCategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category updated successfully')
      router.push('/categories')
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to update category')
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    updateMutation.mutate({
      name: formData.get('name') as string,
      image: formData.get('image') as string,
      sort_order: formData.get('sort_order') 
        ? Number(formData.get('sort_order'))
        : null
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">Failed to load category</p>
        <Button variant="outline" onClick={() => router.push('/categories')}>
          Back to Categories
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Category</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={category?.name}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            name="image"
            defaultValue={category?.image}
            required
          />
          {category?.image && (
            <div className="mt-2">
              <img 
                src={category.image} 
                alt="Preview" 
                className="h-32 w-32 object-cover rounded-md border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg'
                }}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sort_order">Sort Order (optional)</Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={category?.sort_order || ''}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push('/categories')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Updating...
              </>
            ) : 'Update Category'}
          </Button>
        </div>
      </form>
    </div>
  )
}