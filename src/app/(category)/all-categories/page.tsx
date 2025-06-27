'use client'

import { useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'react-toastify'
import Image from 'next/image'

interface Category {
  id: number
  name: string
  image: string
  product_count: number
  sort_order?: number
}

interface Product {
  id: number
  name: string
  tagline: string
  sizes: {
    size: string
    sellPrice: number
    costPrice: number
  }[]
}

interface EditFormInput {
  name: string
  image: string
  sort_order: number | null
}

export default function AllCategoriesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)
  const [productsByCategory, setProductsByCategory] = useState<Record<number, Product[]>>({})
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting }
  } = useForm<EditFormInput>()

  const { data: categories = [], isLoading, isError } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND}/api/admin/categories`)
      return res.data
    },
  })

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EditFormInput }) =>
      axios.put(`${process.env.NEXT_PUBLIC_BACKEND}/api/admin/categories/${id}`, data),
    onSuccess: () => {
      toast.success('Category updated')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setEditCategory(null)
    },
    onError: () => {
      toast.error('Failed to update category')
    }
  })

  const deleteCategory = useMutation({
    mutationFn: (id: number) =>
      axios.delete(`${process.env.NEXT_PUBLIC_BACKEND}/api/admin/categories/${id}`),
    onSuccess: () => {
      toast.success('Category deleted')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: () => {
      toast.error('Failed to delete category')
    }
  })

  const fetchProducts = async (categoryId: number) => {
    if (!productsByCategory[categoryId]) {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND}/api/admin/categories/${categoryId}/products`
        )
        setProductsByCategory(prev => ({ ...prev, [categoryId]: res.data }))
      } catch {
        toast.error('Failed to fetch products')
      }
    }
  }

  const toggleProducts = async (categoryId: number) => {
    if (expandedCategory === categoryId) return setExpandedCategory(null)
    await fetchProducts(categoryId)
    setExpandedCategory(categoryId)
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategory.mutate(id)
    }
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  )

  const onEditClick = (cat: Category) => {
    setEditCategory(cat)
    setValue('name', cat.name)
    setValue('image', cat.image)
    setValue('sort_order', cat.sort_order ?? null)
    setImagePreview(cat.image)
  }

  const onSubmit = (data: EditFormInput) => {
    if (!editCategory) return
    updateCategory.mutate({ id: editCategory.id, data })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setValue('image', base64)
        setImagePreview(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">All Categories</h1>
        <Link href="/add-category">
          <Button className="bg-green-600 hover:bg-green-700">+ Add Category</Button>
        </Link>
      </div>

      <Input
        type="text"
        placeholder="Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-24 w-24 rounded-full mx-auto mb-3" />
                <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-4 w-1/2 mx-auto mb-3" />
                <Skeleton className="h-8 w-24 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Failed to load categories</p>
          <Button onClick={() => queryClient.refetchQueries({ queryKey: ['categories'] })}>
            Retry
          </Button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No categories found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredCategories.map(cat => (
            <Card key={cat.id}>
              <CardHeader className="relative">
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-3 rounded-full overflow-hidden">
    <Image
      src={cat.image || "/placeholder.svg"}
      alt={cat.name}
      fill
      className="object-cover rounded-full"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = "/placeholder.svg";
      }}
    />
  </div>
                  <CardTitle className="text-center">{cat.name}</CardTitle>
                  <CardDescription className="text-center">
                    {cat.product_count} products
                  </CardDescription>
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEditClick(cat)}
                      >
                        ✏️
                      </Button>
                    </DialogTrigger>
                    {editCategory?.id === cat.id && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Category</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                          <div>
                            <Label>Name</Label>
                            <Input {...register('name')} />
                          </div>

                          <div>
                            <Label>Sort Order</Label>
                            <Input type="number" {...register('sort_order')} />
                          </div>

                          <div>
                            <Label>Image</Label>
                            <Input type="file" accept="image/*" onChange={handleImageChange} />
                            {imagePreview && (
                              <div className="relative w-20 h-20 rounded mt-2 overflow-hidden border">
                                <Image
                                  src={imagePreview}
                                  alt="Preview"
                                  fill
                                  className="object-cover"
                                  unoptimized // ✅ Use this if `imagePreview` is a base64 string or local blob
                                />
                              </div>
                            )}
                          </div>

                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Update'}
                          </Button>
                        </form>
                      </DialogContent>
                    )}
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500"
                    onClick={() => handleDelete(cat.id)}
                  >
                    🗑️
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleProducts(cat.id)}
                  className="mb-2"
                >
                  {expandedCategory === cat.id ? 'Hide Products' : 'View Products'}
                </Button>

                {expandedCategory === cat.id && (
                  <ScrollArea className="w-full h-64 rounded-md border p-2">
                    {productsByCategory[cat.id]?.length === 0 ? (
                      <p className="text-sm text-center py-4">No products in this category</p>
                    ) : (
                      <ul className="space-y-2">
                        {productsByCategory[cat.id]?.map(product => (
                          <li key={product.id} className="border p-2 rounded text-sm">
                            <strong>{product.name}</strong> – {product.tagline}
                            <ul className="mt-1 pl-4 list-disc text-xs text-muted-foreground">
                              {product.sizes.map(s => (
                                <li key={s.size}>
                                  {s.size}: ₹{s.sellPrice} (Cost ₹{s.costPrice})
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    )}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
