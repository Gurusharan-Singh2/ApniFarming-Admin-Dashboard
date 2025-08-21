"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Trash2, Edit } from "lucide-react";
import Products from "@/components/Products";
import useCartStore from "@/Store/Cart";
import Checkout from "@/components/Checkout";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND;

interface Customer {
  id: string;
  first_name: string;
  phone: string;
}
interface Address {
  id: string;
  street_address: string;
  landmark: string;
  address: string;
  pincode: number;
  city: string;
  state: string;
  address_title: string;
}
interface NewCustomer {
  first_name: string;
  phone: string;
}
interface AddressPayload {
  street: string;
  landmark: string;
  city: string;
  state: string;
  address_title: string;
  pincode: number | string;
}

// -------------------- Hook --------------------
function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

// -------------------- API Calls --------------------
const fetchAllCustomers = async () => {
  const res = await axios.get(
    `https://api.apnifarming.com/user/admin/getalluserlist.php`
  );
  return res.data.data;
};
const searchCustomers = async (search: string) => {
  const res = await axios.post(
    `https://api.apnifarming.com/user/admin/searchuser.php`,
    {
      search: search || "",
    }
  );
  return res.data.data;
};
const createCustomer = async (newCustomer: NewCustomer) => {
  const { data } = await axios.post(
    `${BACKEND}/api/admin/create-customer`,
    newCustomer
  );
  return data;
};
const fetchAddresses = async (uid: string) => {
  if (!uid) return [];
  const { data } = await axios.post(
    `https://api.apnifarming.com/user/address/address.php`,
    { action: "get_address_list", uid }
  );
  return data?.data || [];
};
const createAddress = async ({
  uid,
  ...payload
}: AddressPayload & { uid: string }) => {
  const { data } = await axios.post(
    `https://api.apnifarming.com/user/address/address.php`,
    { action: "add_address", uid, ...payload }
  );
  return data;
};
const updateAddress = async ({
  uid,
  id,
  ...payload
}: AddressPayload & { uid: string; id: string }) => {
  const { data } = await axios.post(
    `https://api.apnifarming.com/user/address/address.php`,
    { action: "update_address", uid, id, ...payload }
  );
  return data;
};
const deleteAddress = async ({ uid, id }: { uid: string; id: string }) => {
  const { data } = await axios.post(
    `https://api.apnifarming.com/user/address/address.php`,
    { action: "delete_address", uid, id }
  );
  return data;
};

// -------------------- Component --------------------
const Page = () => {
  const queryClient = useQueryClient();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  ); // full object
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(""); // just id
const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [addressSelectOpen, setAddressSelectOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);

  const [newCustomer, setNewCustomer] = useState<NewCustomer>({
    first_name: "",
    phone: "",
  });

  const [addressForm, setAddressForm] = useState<AddressPayload>({
    street: "",
    landmark: "",
    city: "",
    state: "",
    address_title: "",
    pincode: "",
  });

  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);

  // Customers (All / Search)
  const { data: allCustomers = [], isLoading: isAllCustomersLoading } =
    useQuery<Customer[]>({
      queryKey: ["customers-all"],
      queryFn: fetchAllCustomers,
      enabled: !debouncedSearch, // only fetch if no search
    });

  const {
    data: searchedCustomers = [],
    isLoading: isSearchedCustomersLoading,
  } = useQuery<Customer[]>({
    queryKey: ["customers-search", debouncedSearch],
    queryFn: () => searchCustomers(debouncedSearch),
    enabled: !!debouncedSearch,
  });

  const customerList = debouncedSearch ? searchedCustomers : allCustomers;

  // Create Customer
  const { mutate: addCustomer, isPending: creatingCustomer } = useMutation({
    mutationFn: createCustomer,
    onSuccess: (created: Customer) => {
      queryClient.setQueryData<Customer[]>(["customers-all"], (old = []) => [
        created,
        ...old,
      ]);

      setSelectedCustomer(created);
      setSelectedCustomerId(created.id);

      setNewCustomer({ first_name: "", phone: "" });
      toast.success("Customer created!");
      setIsCreateDialogOpen(false);
      setIsAddressDialogOpen(true);
      setAddressSelectOpen(true);
    },

    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to create customer"),
  });

  // Addresses
  const { data: addresses = [], isLoading: isAddressesLoading } =
    useQuery<Address[]>({
      queryKey: ["addresses", selectedCustomerId],
      queryFn: () => fetchAddresses(selectedCustomerId),
      enabled: !!selectedCustomerId,
    });

  const { mutate: addAddress, isPending: creatingAddress } = useMutation({
    mutationFn: createAddress,
  onSuccess: (res) => {
  queryClient.invalidateQueries({
    queryKey: ["addresses", selectedCustomerId],
  });

  const newAddr = res?.data; // should include the full address object
  if (newAddr) {
    setSelectedAddress(newAddr);
  }

  resetAddressForm();
  setIsAddressDialogOpen(false);
  setAddressSelectOpen(true);
  toast.success("Address added!");
}
,
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to add address"),
  });

  const { mutate: editAddress, isPending: updatingAddress } = useMutation({
    mutationFn: updateAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["addresses", selectedCustomerId],
      });
      resetAddressForm();
      setEditingAddressId(null);
      toast.success("Address updated!");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to update address"),
  });

  const { mutate: removeAddress } = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["addresses", selectedCustomerId],
      });
      toast.success("Address deleted!");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to delete address"),
  });

  // -------------------- Handlers --------------------
  const handleCreateCustomer = () => {
    if (!newCustomer.first_name.trim() || !newCustomer.phone.trim()) {
      toast.error("First name & phone required");
      return;
    }
    addCustomer(newCustomer);
  };

  const handleAddressSave = () => {
    const { street, city, state, address_title, pincode } = addressForm;
    if (!street || !city || !state || !address_title || !pincode) {
      toast.error("Please fill all required fields");
      return;
    }
    if (editingAddressId) {
      editAddress({
        uid: selectedCustomerId,
        id: editingAddressId,
        ...addressForm,
      });
    } else {
      addAddress({ uid: selectedCustomerId, ...addressForm });
    }
  };

  const handleEditClick = (addr: Address) => {
    setAddressForm({
      street: addr.street_address || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "",
      address_title: addr.address_title || "",
      pincode: addr.pincode,
    });
    setEditingAddressId(addr.id);
    setIsAddressDialogOpen(true);
  };

  const resetAddressForm = () => {
    setAddressForm({
      street: "",
      landmark: "",
      city: "",
      state: "",
      address_title: "",
      pincode: "",
    });
    setEditingAddressId(null);
  };

  useEffect(() => {
    if (debouncedSearch) {
      setCustomerSelectOpen(true);
    } else {
      setCustomerSelectOpen(false);
    }
  }, [debouncedSearch]);

  
  // ------------------ Store ------------------
  const { finalAmount, cart } = useCartStore();

  const handleCheckoutClick = () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }
    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setCheckout(true);
  };

  // Auto-open address dialog if customer has no addresses
  useEffect(() => {
    if (
      selectedCustomerId &&
      !isAddressesLoading &&
      addresses.length === 0
    ) {
      setIsAddressDialogOpen(true);
    }
  }, [selectedCustomerId, addresses, isAddressesLoading]);

  // -------------------- UI --------------------
  if (checkout) {
    return (
      <Checkout
        setCheckout={setCheckout}
        user={selectedCustomer}
        address={selectedAddress}
      />
    );
  }

  return (
    <main className="p-6 max-w-[1600px] min-h-screen mx-auto">
      <h1 className="text-base font-semibold mb-4">Create New Order</h1>

      {/* Search + Select Customer */}
      <div className="flex items-center gap-4 mb-6">
        <Input
          placeholder="Search customer by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-[250px]"
        />

        <Select
          open={customerSelectOpen}
          onOpenChange={setCustomerSelectOpen}
          onValueChange={(val) => {
            const customer = customerList.find((c) => c.id === val) || null;
            setSelectedCustomer(customer);
            setSelectedCustomerId(val);
            setCustomerSelectOpen(true);
            setAddressSelectOpen(true);
          }}
          value={selectedCustomerId}
          disabled={isAllCustomersLoading || isSearchedCustomersLoading}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {customerList.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.first_name} ({c.phone})
              </SelectItem>
            ))}
            {customerList.length === 0 && debouncedSearch && (
              <div className="p-2 text-sm text-muted-foreground">
                No results found
              </div>
            )}
          </SelectContent>
        </Select>

        {/* Add New Customer */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Add Customer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>First Name</Label>
                <Input
                  value={newCustomer.first_name}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      first_name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <Button
                onClick={handleCreateCustomer}
                disabled={creatingCustomer}
                className="w-full"
              >
                {creatingCustomer ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Address Selector */}
      {selectedCustomerId && (
        <div className="space-y-4 mb-2.5">
          <div className="flex items-center gap-4">
            <h1>Select Address</h1>
        <Select
  open={addressSelectOpen}
  onOpenChange={setAddressSelectOpen}
  onValueChange={(val) => {
    const addr = addresses.find((a) => a.id === val) || null;
    setSelectedAddress(addr);
  }}
  value={selectedAddress?.id || ""}
  disabled={isAddressesLoading}
>
  <SelectTrigger className="w-[300px]">
    <SelectValue
      placeholder={isAddressesLoading ? "Loading..." : "Select an address"}
    />
  </SelectTrigger>
  <SelectContent>
    {addresses.map((a) => (
      <SelectItem key={a.id} value={a.id}>
        {a.pincode} - {a.street_address}, {a.city}
      </SelectItem>
    ))}
  </SelectContent>
</Select>


            {/* Manage Addresses */}
            <Dialog
              open={isAddressDialogOpen}
              onOpenChange={(open) => {
                setIsAddressDialogOpen(open);
                if (!open) resetAddressForm();
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline">Manage Addresses</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto space-y-6 pr-2">
                <DialogHeader>
                  <DialogTitle>
                    {editingAddressId ? "Edit Address" : "Add Address"}
                  </DialogTitle>
                </DialogHeader>

                {/* Address Form */}
                <div className="space-y-3">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={addressForm.address_title}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          address_title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Street</Label>
                    <Input
                      value={addressForm.street}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          street: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Landmark</Label>
                    <Input
                      value={addressForm.landmark}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          landmark: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          city: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      value={addressForm.state}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          state: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Zip</Label>
                    <Input
                      value={addressForm.pincode}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          pincode: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    onClick={handleAddressSave}
                    disabled={creatingAddress || updatingAddress}
                  >
                    {creatingAddress || updatingAddress ? "Saving..." : "Save"}
                  </Button>
                </div>

                {/* Address List */}
                <div className="space-y-2 pt-4 max-h-[300px] overflow-auto">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="border p-3 rounded flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{addr.address_title}</p>
                        <p>{addr.street_address}</p>
                        <p>{addr.landmark}</p>
                        <p>
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleEditClick(addr)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() =>
                            removeAddress({
                              uid: selectedCustomerId,
                              id: addr.id,
                            })
                          }
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      <Products />
      <div className="w-[80%] fixed bottom-0 flex justify-center items-center">
        <button
          onClick={handleCheckoutClick}
          className="w-[80%] bg-green-500 mb-5 py-3 text-white rounded-2xl flex justify-center gap-3"
        >
          <p className="text-xl">Create Order</p>
          <p className="text-xl">₹{finalAmount}</p>
        </button>
      </div>
    </main>
  );
};

export default Page;
