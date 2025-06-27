'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { toast } from 'react-toastify'

export default function AddBannerPage() {
  const qc = useQueryClient()

  const [title, setTitle] = useState('')
  const [linkType, setLinkType] = useState<'general' | 'category' | 'product'>('general')
  const [customLink, setCustomLink] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [image, setImage] = useState('')
  const [preview, setPreview] = useState('')
  const [sortOrder, setSortOrder] = useState<number | null>(null)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => axios.get(`${process.env.NEXT_PUBLIC_BACKEND}/api/admin/categories`).then(r => r.data)
  })

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => axios.get(`${process.env.NEXT_PUBLIC_BACKEND}/api/admin/products`).then(r => r.data)
  })

  const mutation = useMutation({
    mutationFn: () => {
      let link = ''
      let productId: number | null = null
      let categoryId: number | null = null

      if (linkType === 'general') {
        link = customLink
      } else if (linkType === 'category') {
        categoryId = Number(selectedCategory)
      } else if (linkType === 'product') {
        productId = Number(selectedProduct)
      }

      return axios.post(`${process.env.NEXT_PUBLIC_BACKEND}/api/admin/banner`, {
        title,
        image,
        linkType,
        link,
        productId,
        categoryId,
        sort_order: sortOrder
      })
    },
    onSuccess: () => {
      toast.success("Banner added successfully")
      setTitle('')
      setCustomLink('')
      setSelectedCategory('')
      setSelectedProduct('')
      setImage('')
      setPreview('')
      setSortOrder(0)
      qc.invalidateQueries({ queryKey: ['banners'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add banner')
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setImage(base64)
      setPreview(base64)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !image) return toast.error("Title and image are required")
    if (linkType === 'general' && !customLink) return toast.error("Provide URL")
    if (linkType === 'category' && !selectedCategory) return toast.error("Pick a category")
    if (linkType === 'product' && !selectedProduct) return toast.error("Pick a product")
    mutation.mutate()
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Add New Banner</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Sort Order</label>
          <Input
            type="number"
            value={sortOrder ?? ''}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            min={0}
            
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Link Type</label>
          <Select value={linkType} onValueChange={v => setLinkType(v as any)}>
            <SelectTrigger><SelectValue placeholder="Select link type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General URL</SelectItem>
              <SelectItem value="category">Category Link</SelectItem>
              <SelectItem value="product">Product Link</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {linkType === 'general' && (
          <div>
            <label className="block mb-1 font-semibold">URL</label>
            <Input
              value={customLink}
              onChange={e => setCustomLink(e.target.value)}
              type="url"
              required
            />
          </div>
        )}

        {linkType === 'category' && (
          <div>
            <label className="block mb-1 font-semibold">Select Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
              <SelectContent>
                {categories?.map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {linkType === 'product' && (
          <div>
            <label className="block mb-1 font-semibold">Select Product</label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger><SelectValue placeholder="Choose product" /></SelectTrigger>
              <SelectContent>
                {products?.map((p: any) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className="block mb-1 font-semibold">Banner Image</label>
          <Input type="file" accept="image/*" onChange={handleImageUpload} required />
          {preview && (
            <img src={preview} alt="Preview" className="mt-2 rounded w-full max-h-60 object-cover" />
          )}
        </div>

      <Button
  type="submit"
  className="bg-green-600 hover:bg-green-700 text-white w-full"
  disabled={mutation.isPending}
>
  {mutation.isPending ? 'Adding...' : 'Add Banner'}
</Button>

      </form>
    </main>
  )
}
