'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

export default function AllBannersPage() {
  const qc = useQueryClient()

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: () =>
      axios.get(`${process.env.NEXT_PUBLIC_BACKEND}/api/admin/banner`)
        .then((res) => res.data),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () =>
      axios.get(`${process.env.NEXT_PUBLIC_BACKEND}/api/admin/categories`)
        .then((res) => res.data),
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () =>
      axios.get(`${process.env.NEXT_PUBLIC_BACKEND}/api/admin/products`)
        .then((res) => res.data),
  })

  const deleteBanner = useMutation({
    mutationFn: (id: number) =>
      axios.delete(`${process.env.NEXT_PUBLIC_BACKEND}/api/admin/banner/${id}`),
    onSuccess: () => {
      toast.success('Banner deleted')
      qc.invalidateQueries({ queryKey: ['banners'] })
    },
    onError: () => toast.error('Failed to delete banner'),
  })

  const updateBanner = useMutation({
    mutationFn: (data: any) =>
      axios.put(`${process.env.NEXT_PUBLIC_BACKEND}/api/admin/banner/${data.id}`, data),
    onSuccess: () => {
      toast.success('Banner updated successfully')
      qc.invalidateQueries({ queryKey: ['banners'] })
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || 'Failed to update banner'),
  })

  const [editData, setEditData] = useState<any | null>(null)
  const [preview, setPreview] = useState('')

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setEditData({ ...editData, image: base64 })
      setPreview(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleEdit = () => {
    if (!editData.title?.trim()) return toast.error('Title is required')
    if (!editData.image) return toast.error('Image is required')
    if (!editData.sort_order && editData.sort_order !== 0)
      return toast.error('Sort order is required')

    const payload: any = {
      id: editData.id,
      title: editData.title,
      image: editData.image,
      linkType: editData.linkType,
      sort_order: Number(editData.sort_order),
    }

    if (editData.linkType === 'general') {
      if (!editData.link?.trim()) return toast.error('URL is required for general link')
      payload.link = editData.link
    } else if (editData.linkType === 'category') {
      if (!editData.categoryId) return toast.error('Category is required')
      payload.categoryId = editData.categoryId
    } else if (editData.linkType === 'product') {
      if (!editData.productId) return toast.error('Product is required')
      payload.productId = editData.productId
    }

    console.log('Submitting payload:', payload)
    updateBanner.mutate(payload)
    setEditData(null)
  }

  if (isLoading) return <p className="text-center mt-10">Loading banners...</p>

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">All Banners</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((b: any) => (
          <div key={b.id} className="border rounded shadow p-4 space-y-3">
            
<div className="relative w-full h-40 rounded overflow-hidden">
  <Image
    src={b.image_path}
    alt={b.title}
    fill
    className="object-cover"
    sizes="100vw"
    priority // optional: improve LCP if above-the-fold
  />
</div>
            <div>
              <h2 className="font-bold text-lg">{b.title}</h2>
              {b.url && <p className="text-sm text-gray-500">Link: {b.url}</p>}
              {b.category_id && <p className="text-sm text-gray-500">Category ID: {b.category_id}</p>}
              {b.pid && <p className="text-sm text-gray-500">Product ID: {b.pid}</p>}
              {b.linkType && <p className="text-sm text-gray-500">Link Type: {b.linkType}</p>}
              <p className="text-sm">Sort: {b.sort_order}</p>
            </div>

            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditData({
                        ...b,
                        link: b.url || '',
                        image: b.image_path,
                        categoryId: b.category_id ? String(b.category_id) : '',
                        productId: b.pid ? String(b.pid) : '',
                      })
                      setPreview(b.image_path)
                    }}
                  >
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Edit Banner</DialogTitle>
                  </DialogHeader>

                  {editData && (
                    <div className="space-y-4">
                      <Input
                        value={editData.title}
                        onChange={(e) =>
                          setEditData({ ...editData, title: e.target.value })
                        }
                        placeholder="Title"
                      />

                      <Input
                        type="number"
                        value={editData.sort_order}
                        onChange={(e) =>
                          setEditData({ ...editData, sort_order: Number(e.target.value) })
                        }
                        placeholder="Sort Order"
                      />

                      <Select
                        value={editData.linkType}
                        onValueChange={(v) =>
                          setEditData({ ...editData, linkType: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Link Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="category">Category</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                        </SelectContent>
                      </Select>

                      {editData.linkType === 'general' && (
                        <Input
                          value={editData.link}
                          onChange={(e) =>
                            setEditData({ ...editData, link: e.target.value })
                          }
                          placeholder="https://example.com"
                        />
                      )}

                      {editData.linkType === 'category' && (
                        <Select
                          value={editData.categoryId}
                          onValueChange={(v) =>
                            setEditData({ ...editData, categoryId: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c: any) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {editData.linkType === 'product' && (
                        <Select
                          value={editData.productId}
                          onValueChange={(v) =>
                            setEditData({ ...editData, productId: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p: any) => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      <Input type="file" accept="image/*" onChange={handleImageUpload} />
                      {preview && (
                        <div className="relative w-full h-40 rounded overflow-hidden">
                          <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover"
                            sizes="100vw"
                            priority // optional: improve LCP if above-the-fold
                          />
                        </div>
                      )}

                      <Button onClick={handleEdit} className="w-full">Update</Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Button
                variant="destructive"
                onClick={() => deleteBanner.mutate(b.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
