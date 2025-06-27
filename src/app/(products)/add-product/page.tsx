"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { toast } from "react-toastify"

const BACKEND = process.env.NEXT_PUBLIC_BACKEND

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  tagline: z.string().optional(),
  image: z.string().min(1, "Image is required"),
  categoryId: z.coerce.number().min(1, "Category is required"),
  in_Stock: z.coerce.boolean(),
  Sort_order: z.coerce.number().optional(),
  sizes: z
    .array(
      z.object({
        option: z.string().min(1, "Option is required"),
        value: z.string().min(1, "Value is required"),
        costPrice: z.coerce.number().min(1, "Cost price is required"),
        sellPrice: z.coerce.number().min(1, "Sell price is required"),
        in_Stock: z.coerce.boolean(),
      })
    )
    .min(1),
})

export default function AddProductPage() {
  const [preview, setPreview] = useState<string | null>(null)
  const router = useRouter()

  const variantOptions = ["Kg", "Gram", "Litre", "ml", "Piece", "Dozen"]

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get(`${BACKEND}/api/categories`)
      return res.data
    },
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      tagline: "",
      image: "",
      categoryId: undefined,
      in_Stock: true,
      Sort_order: 0,
      sizes: [
        {
          option: "",
          value: "",
          costPrice: 0,
          sellPrice: 0,
          in_Stock: true,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sizes",
  })

  const addProduct = async (data: any) => {
    const res = await axios.post(`${BACKEND}/api/admin/products`, data)
    return res.data
  }

  const mutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      toast.success("Product uploaded successfully!")
      form.reset()
      setPreview(null)
      router.push("/all-products")
    },
    onError: (err: any) => {
      alert("Upload failed: " + (err.response?.data?.message || err.message))
    },
  })

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      form.setValue("image", reader.result as string)
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Card className="rounded-2xl shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">
            Upload Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Product Title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Short Description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="in_Stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>In Stock</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(val === "true")}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Stock" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel className="text-md font-semibold">
                  Product Variants
                </FormLabel>
                <ScrollArea className="max-h-[300px] space-y-4">
                  {fields.map((fieldItem, index) => (
                    <div
                      key={fieldItem.id}
                      className="flex gap-4 items-end flex-wrap border-b pb-4"
                    >
                      <div className="flex flex-col">
                        <label className="text-sm font-medium">Option</label>
                        <Select
                          defaultValue={form.getValues(`sizes.${index}.option`)}
                          onValueChange={(val) =>
                            form.setValue(`sizes.${index}.option`, val)
                          }
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
                      </div>

                      <div className="flex flex-col">
                        <label className="text-sm font-medium">Value</label>
                        <Input
                          {...form.register(`sizes.${index}.value`)}
                          className="w-20"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-sm font-medium">Cost Price</label>
                        <Input
                          type="number"
                          {...form.register(`sizes.${index}.costPrice`)}
                          className="w-28"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-sm font-medium">Sell Price</label>
                        <Input
                          type="number"
                          {...form.register(`sizes.${index}.sellPrice`)}
                          className="w-28"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-sm font-medium">Stock</label>
                        <Select
                          defaultValue={form
                            .getValues(`sizes.${index}.in_Stock`)
                            .toString()}
                          onValueChange={(val) =>
                            form.setValue(
                              `sizes.${index}.in_Stock`,
                              val === "true"
                            )
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">In</SelectItem>
                            <SelectItem value="false">Out</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {index > 0 && (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => remove(index)}
                        >
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
                      in_Stock: true,
                    })
                  }
                >
                  + Add Variant
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  )
}
