"use client"
import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import { useAddProduct, useAllcategories } from "./hooks"
import LoadingOverlay from "./componets/ProductLoading"


export default function AddProductPage() {
  const [preview, setPreview] = useState<string | null>(null)
 

  const variantOptions = ["Kg", "Gram", "Litre", "ml", "Piece", "Dozen"]

  const { data: categories = [] } = useAllcategories();

  const { register, handleSubmit, setValue, getValues, control} = useForm({
    defaultValues: {
      title: "",
      tagline: "",
      description: "",
      image: "",
      categoryId: "",
      in_Stock: "true",
      Sort_order: 0,
      maxOrder: null,
      sizes: [
        {
          option: "",
          value: "",
          costPrice: 0,
          sellPrice: 0,
          in_Stock: "true",
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sizes",
  })


  const {mutate,isPending}=useAddProduct()

  const handleImageUpload = async (e: any) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64 = (reader.result as string).split(",")[1];

    // Send base64 image to /api/upload
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base64Data: base64,
        fileName: file.name,
        contentType: file.type,
      }),
    });

    const data = await res.json();

    if (data.url) {
      setPreview(data.url);
      setValue("image", data.url); 
    } else {
      alert("Image upload failed.");
    }
  };
  reader.readAsDataURL(file);
};


  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Card className="rounded-2xl shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Upload Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
            <div>
              <label>Title</label>
              <Input {...register("title", { required: true })} placeholder="Product Title" />
            </div>

            <div>
              <label>Tagline</label>
              <Input {...register("tagline")} placeholder="Short Description" />
            </div>

            <div>
              <label>Description</label>
              <Textarea {...register("description", { required: false })} placeholder="Full product description" />
            </div>

            <div>
              <label>Image</label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {preview && (
                <Image
                  src={preview}
                  alt="Preview"
                  width={160}
                  height={160}
                  className="mt-2 rounded object-cover"
                  unoptimized
                />
              )}
              <input type="hidden" {...register("image", { required: true })} />
            </div>

            <div>
              <label>Category</label>
              <Select onValueChange={(val) => setValue("categoryId", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register("categoryId", { required: true })} />
            </div>

            <div>
              <label>In Stock</label>
              <Select onValueChange={(val) => setValue("in_Stock", val)} defaultValue="true">
                <SelectTrigger>
                  <SelectValue placeholder="Select Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" {...register("in_Stock")} />
            </div>

            <div>
              <label>Sort Order</label>
              <Input type="number" {...register("Sort_order")} />
            </div>

            <div>
              <label>Max Order Quantity</label>
              <Input type="number" {...register("maxOrder", { required: false})} />
            </div>

            <div className="space-y-4">
              <label className="text-md font-semibold">Product Variants</label>
              <ScrollArea className="max-h-[300px] space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-end flex-wrap border-b pb-4">
                    <div className="flex flex-col">
                      <label>Option</label>
                      <Select
                        onValueChange={(val) => setValue(`sizes.${index}.option`, val)}
                        defaultValue={getValues(`sizes.${index}.option`)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue placeholder="Option" />
                        </SelectTrigger>
                        <SelectContent>
                          {variantOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <input type="hidden" {...register(`sizes.${index}.option`, { required: true })} />
                    </div>

                    <div className="flex flex-col">
                      <label>Value</label>
                      <Input {...register(`sizes.${index}.value`, { required: true })} className="w-20" />
                    </div>

                    <div className="flex flex-col">
                      <label>Cost Price</label>
                      <Input type="number" {...register(`sizes.${index}.costPrice`, { required: true })} className="w-28" />
                    </div>

                    <div className="flex flex-col">
                      <label>Sell Price</label>
                      <Input type="number" {...register(`sizes.${index}.sellPrice`, { required: true })} className="w-28" />
                    </div>

                    <div className="flex flex-col">
                      <label>Stock</label>
                      <Select
                        onValueChange={(val) => setValue(`sizes.${index}.in_Stock`, val)}
                        defaultValue="true"
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">In</SelectItem>
                          <SelectItem value="false">Out</SelectItem>
                        </SelectContent>
                      </Select>
                      <input type="hidden" {...register(`sizes.${index}.in_Stock`)} />
                    </div>

                    {index > 0 && (
                      <Button type="button" variant="destructive" onClick={() => remove(index)}>
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </ScrollArea>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    option: "",
                    value: "",
                    costPrice: 0,
                    sellPrice: 0,
                    in_Stock: "true",
                  })
                }
              >
                + Add Variant
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>

       <LoadingOverlay isVisible={isPending} />
    </main>
  )
}
