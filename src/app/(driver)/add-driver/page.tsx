"use client"

import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "react-toastify"

const AddDriverPage = () => {
  const router = useRouter()

  const { register, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      driver_name: "",
      driver_phone_number: "",
      driver_password: "",
      status: "1",
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post("https://api.apnifarming.com/user/admin/adddriver.php", data)
      return res.data
    },
    onSuccess: () => {
      toast.success("Driver added successfully!")
      reset()
      router.replace("/all-driver")
    },
    onError: (err: any) => {
      toast.error("Failed to add driver: " + (err.response?.data?.message || err.message))
    },
  })

  return (
    <main className="p-6 max-w-lg mx-auto">
      <Card className="rounded-2xl shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Add Driver</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div>
              <label>Driver Name</label>
              <Input {...register("driver_name", { required: true })} placeholder="Enter driver name" />
            </div>

            <div>
              <label>Phone Number</label>
              <Input {...register("driver_phone_number", { required: true })} placeholder="Enter phone number" />
            </div>

            <div>
              <label>Password</label>
              <Input type="password" {...register("driver_password", { required: true })} placeholder="Enter password" />
            </div>

            <div>
              <label>Status</label>
              <Select onValueChange={(val) => setValue("status", val)} defaultValue="1">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" {...register("status")} />
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

export default AddDriverPage
