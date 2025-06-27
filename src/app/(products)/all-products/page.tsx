"use client"

import axios from "axios"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm, useFieldArray } from "react-hook-form"
import { useState } from "react"
import Image from "next/image"

const BACKEND = process.env.NEXT_PUBLIC_BACKEND

const fetchProducts = async () => {
  const res = await axios.get(`${BACKEND}/api/admin/products`)
  return res.data
}

const deleteProduct = async (id: string) => {
  await axios.delete(`${BACKEND}/api/admin/products/${id}`)
}

const updateProduct = async (updatedProduct: any) => {
  await axios.put(`${BACKEND}/api/admin/products/${updatedProduct.id}`, updatedProduct)
}

export default function AllProductsPage() {
  const queryClient = useQueryClient()
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })

  const { register, handleSubmit, reset, control } = useForm()
  const { fields, append } = useFieldArray({
    control,
    name: "sizes",
  })

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })

  const onSubmit = async (data: any) => {
    if (imageFile) {
      const base64 = await toBase64(imageFile)
      data.image = base64
    }

    data.id = selectedProduct?.id
    data.categoryId = selectedProduct?.categoryId // Keep original category
    updateMutation.mutate(data)

    setSelectedProduct(null)
    reset()
    setImageFile(null)
    setPreviewUrl(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const filteredProducts = products
    .filter((product: any) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tagline.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: any, b: any) => {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    })

  return (
    <main className="p-6 max-w-[1600px] mx-auto">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search by name or tagline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              Sort by Name ({sortOrder === "asc" ? "A-Z" : "Z-A"})
            </Button>
          </div>

          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-gray-500">No products found.</p>
          ) : (
            <ScrollArea className="max-h-[80vh]">
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product: any) => (
                  <div key={product.id} className="relative">
                    <Card className="p-4 rounded-xl border border-muted shadow hover:shadow-lg transition duration-300 flex flex-col justify-between gap-3.5 min-h-[400px]">
                    <Image
  src={product.image || "/fallback.png"}
  width={300}
  height={300}
  alt={product.name}
  className="w-full h-30 object-cover rounded-lg mb-3"
/>

                      <CardTitle className="text-xl font-semibold mb-1 truncate">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.tagline}</p>
                      <div className="text-sm space-y-1">
                        {product.sizes?.length > 0 ? (
                          product.sizes.map((size: any, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="font-medium text-muted-foreground">{size.size} {size.option}</span>
                              <Badge variant="secondary">
                                ₹{size.sellPrice} <span className="text-xs text-muted-foreground ml-1">(Cost ₹{size.costPrice})</span>
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 italic">No sizes</p>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        className="mt-4 w-full"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this product?")) {
                            deleteMutation.mutate(product.id)
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </Card>

                    <div className="absolute top-2 right-2 z-10">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="bg-green-500 text-white"
                            onClick={() => {
                              setSelectedProduct(product)
                              setImageFile(null)
                              setPreviewUrl(null)
                              reset({
                                title: product.name,
                                tagline: product.tagline,
                                sizes: product.sizes || [],
                                categoryId: product.categoryId,
                              })
                            }}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] rounded-xl">
                          <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                            <div className="space-y-2">
                              <Label>Title</Label>
                              <Input {...register("title", { required: true })} />
                            </div>
                            <div className="space-y-2">
                              <Label>Tagline</Label>
                              <Input {...register("tagline", { required: true })} />
                            </div>

                            {previewUrl ? (
                              <div className="space-y-2">
                                <Label>Preview Image</Label>
                               <Image
  src={previewUrl}
  alt="Preview"
  width={128}
  height={128}
  className="w-full h-32 object-contain rounded-md border"
/>
                              </div>
                            ) : selectedProduct?.image && (
                              <div className="space-y-2">
                                <Label>Current Image</Label>
                                <Image
                                  src={selectedProduct.image}
                                  alt="Current"
                                  width={128}
                                  height={128}
                                  className="w-full h-32 object-contain rounded-md border"
                                />
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label>Upload New Image</Label>
                              <Input type="file" accept="image/*" onChange={handleImageChange} />
                            </div>

                            <div className="space-y-2">
                              <Label>Sizes</Label>
                              {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-4 gap-2">
  <Input
    placeholder="Size"
    {...register(`sizes.${index}.size`, { required: true })}
  />

  <select
    {...register(`sizes.${index}.option`, { required: true })}
    className="p-2 border border-gray-300 bg-slate-800 text-white  rounded-md"
  >
    <option className="bg-slate-800 text-white" value="">Select Unit</option>
    <option className="bg-slate-800 text-white" value="kg">kg</option>
    <option className="bg-slate-800 text-white" value="gram">gram</option>
    <option className="bg-slate-800 text-white" value="litre">litre</option>
    <option className="bg-slate-800 text-white" value="ml">ml</option>
    <option className="bg-slate-800 text-white" value="pcs">pcs</option>
  </select>

  <Input
    placeholder="Cost Price"
    type="number"
    {...register(`sizes.${index}.costPrice`, { required: true })}
  />
  <Input
    placeholder="Sell Price"
    type="number"
    {...register(`sizes.${index}.sellPrice`, { required: true })}
  />
</div>

                              ))}
                              <Button type="button" variant="outline" onClick={() => append({ size: "", option: "", costPrice: 0, sellPrice: 0 })}>
                                Add Size
                              </Button>
                            </div>

                            <Button type="submit" className="w-full mt-4" disabled={updateMutation.isPending}>
                              {updateMutation.isPending ? "Updating..." : "Update Product"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
