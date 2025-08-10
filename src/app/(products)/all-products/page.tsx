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
import { Loader } from "@/components/Loader"
import { toast } from "react-toastify"

const BACKEND = process.env.NEXT_PUBLIC_BACKEND

const fetchProducts = async () => {
  const res = await axios.get(`${BACKEND}/api/admin/products`)
  return res.data
}

const deleteProduct = async (id: string) => {
  await axios.delete(`${BACKEND}/api/admin/products/${id}`)
}

const updateProduct = async (updatedProduct: any) => {
  const res = await axios.put(`${BACKEND}/api/admin/products/${updatedProduct.id}`, updatedProduct)
  return res.data
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
    onSuccess: () =>{ queryClient.invalidateQueries({ queryKey: ["products"] })
  toast.success("Product deleted successfully !!!")},
  })

  const updateMutation = useMutation({
    mutationFn: updateProduct,
   onSuccess: () =>{ queryClient.invalidateQueries({ queryKey: ["products"] })
  toast.success("Product Updated successfully !!!")},
    onError: (error) => console.error(error),
  })

  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      title: "",
      tagline: "",
      description: "",
      sizes: [{ size: "", option: "", costPrice: 0, sellPrice: 0, maxOrder: null }],
      categoryId: "",
    },
  })

  const { fields, append } = useFieldArray({
    control,
    name: "sizes",
  })

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
    })

  const onSubmit = async (data: any) => {
    if (imageFile) {
      data.image = await toBase64(imageFile)
    }
    data.id = selectedProduct?.id
    data.categoryId = selectedProduct?.categoryId
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
    .filter((p: any) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: any, b: any) =>
      sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    )

  if (deleteMutation.isPending || updateMutation.isPending) {
    return <Loader />
  }

  return (
    <main className="p-6 max-w-[1600px] min-h-screen mx-auto">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Search by name or tagline..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
              Sort by Name ({sortOrder === "asc" ? "A-Z" : "Z-A"})
            </Button>
          </div>

          {isLoading ? (
            <Loader />
          ) : filteredProducts.length === 0 ? (
            <p className="text-gray-500">No products found.</p>
          ) : (
            <ScrollArea className="min-h-screen">
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product: any) => (
                  <div key={product.id} className="relative">
                    <Card className="p-4 rounded-xl border border-muted shadow hover:shadow-lg transition duration-300 flex flex-col justify-between gap-3.5 min-h-[400px]">
                      <Image
                        src={product.image || "/fallback.png"}
                        width={300}
                        height={300}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg mb-3"
                      />
                      <CardTitle className="text-xl font-semibold mb-1 truncate">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.tagline}</p>
                      <div className="text-sm space-y-1">
                        {product.sizes?.length ? (
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
                                description: product.description || "",
                                sizes: (product.sizes || []).map((s: any) => ({
                                  size: s.size || "",
                                  option: s.option?.toLowerCase() || "",
                                  costPrice: s.costPrice ?? 0,
                                  sellPrice: s.sellPrice ?? 0,
                                  maxOrder: s.maxOrder || null,
                                })),
                                categoryId: product.categoryId,
                              })
                            }}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[650px] rounded-xl">
                          <DialogHeader>
                            <DialogTitle>Edit Product</DialogTitle>
                          </DialogHeader>

                          <ScrollArea className="max-h-[80vh] pr-2">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
                              <div>
                                <Label>Title</Label>
                                <Input {...register("title", { required: true })} />
                              </div>
                              <div>
                                <Label>Tagline</Label>
                                <Input {...register("tagline", { required: true })} />
                              </div>
                              <div>
                                <Label>Description</Label>
                                <textarea
                                  {...register("description")}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  rows={3}
                                />
                              </div>

                              {previewUrl ? (
                                <div>
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
                                <div>
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

                              <div>
                                <Label>Upload New Image</Label>
                                <Input type="file" accept="image/*" onChange={handleImageChange} />
                              </div>

                              <div className="space-y-2">
                                <Label>Sizes</Label>
                                {fields.map((field, index) => (
                                  <div key={field.id} className="flex flex-wrap gap-2">
                                    <div className="flex-1 min-w-[80px]">
                                      <Label htmlFor={`sizes.${index}.size`}>Size</Label>
                                      <Input
                                        id={`sizes.${index}.size`}
                                        placeholder="Size"
                                        {...register(`sizes.${index}.size`, { required: true })}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-[80px]">
                                      <Label htmlFor={`sizes.${index}.option`}>Unit</Label>
                                      <select
                                        id={`sizes.${index}.option`}
                                        {...register(`sizes.${index}.option`, { required: true })}
                                        className="p-2 border border-gray-300 bg-slate-100 text-black rounded-md w-full"
                                      >
                                        <option value="">Select Unit</option>
                                        <option value="kg">kg</option>
                                        <option value="gram">gram</option>
                                        <option value="litre">litre</option>
                                        <option value="ml">ml</option>
                                        <option value="pcs">pcs</option>
                                      </select>
                                    </div>
                                    <div className="flex-1 min-w-[100px]">
                                      <Label htmlFor={`sizes.${index}.costPrice`}>Cost Price</Label>
                                      <Input
                                        id={`sizes.${index}.costPrice`}
                                        placeholder="Cost Price"
                                        type="number"
                                        {...register(`sizes.${index}.costPrice`, { required: true })}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-[100px]">
                                      <Label htmlFor={`sizes.${index}.sellPrice`}>Sell Price</Label>
                                      <Input
                                        id={`sizes.${index}.sellPrice`}
                                        placeholder="Sell Price"
                                        type="number"
                                        {...register(`sizes.${index}.sellPrice`, { required: true })}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-[100px]">
                                      <Label htmlFor={`sizes.${index}.maxOrder`}>Max Order</Label>
                                      <Input
                                        id={`sizes.${index}.maxOrder`}
                                        placeholder="Max Order"
                                        type="number"
                                        {...register(`sizes.${index}.maxOrder`)}
                                      />
                                    </div>
                                  </div>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => append({ size: "", option: "", costPrice: 0, sellPrice: 0, maxOrder: null })}
                                >
                                  Add Size
                                </Button>
                              </div>

                              <Button type="submit" className="w-full mt-4" disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? "Updating..." : "Update Product"}
                              </Button>
                            </form>
                          </ScrollArea>
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
