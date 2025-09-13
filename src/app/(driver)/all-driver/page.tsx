"use client"

import { useQuery, useMutation } from "@tanstack/react-query"
import axios from "axios"
import { useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "react-toastify"

const AllDriverPage = () => {
  const [editingDriver, setEditingDriver] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    driver_name: "",
    driver_phone_number: "",
  })

  // fetch drivers
  const { data: drivers = [], refetch, isLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const res = await axios.get(
        "https://api.apnifarming.com/user/admin/getalldriverlist.php"
      )
      return res.data
    },
  })

  // edit mutation
  const editMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post(
        "https://api.apnifarming.com/user/admin/editdriver.php",
        data
      )
      return res.data
    },
    onSuccess: () => {
      toast.success("Driver updated successfully!")
      setEditingDriver(null)
      refetch()
    },
    onError: (err: any) => {
      toast.error("Failed: " + (err.response?.data?.message || err.message))
    },
  })

  if (isLoading) {
    return <p className="text-center py-6">Loading drivers...</p>
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            All Drivers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {drivers.length === 0 ? (
            <p>No drivers found.</p>
          ) : (
            drivers.map((driver: any) => (
              <div
                key={driver.driver_id}
                className="flex justify-between items-center border p-3 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{driver.driver_name}</p>
                  <p className="text-sm text-gray-500">
                    {driver.driver_phone_number}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingDriver(driver)
                    setFormData({
                      driver_name: driver.driver_name,
                      driver_phone_number: driver.driver_phone_number,
                    })
                  }}
                >
                  Edit
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog
        open={!!editingDriver}
        onOpenChange={() => setEditingDriver(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <label>Name</label>
            <Input
              value={formData.driver_name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  driver_name: e.target.value,
                })
              }
            />

            <label>Phone Number</label>
            <Input
              value={formData.driver_phone_number}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  driver_phone_number: e.target.value,
                })
              }
            />
          </div>

          <DialogFooter>
            <Button
              onClick={() =>
                editMutation.mutate({
                  driver_id: editingDriver.driver_id,
                  driver_name: formData.driver_name,
                  driver_phone_number: formData.driver_phone_number,
                })
              }
              disabled={editMutation.isPending}
            >
              {editMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default AllDriverPage
