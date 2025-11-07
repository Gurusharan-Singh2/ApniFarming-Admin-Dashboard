import axios from "axios";
import { OrderItem } from "../types/index"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";



export const handleDownloadPDF = async (filters:any ,limit:number,setIsPdfLoading:(open:boolean)=>void) => {
  try {
    setIsPdfLoading(true);

    // Fetch orders
    const params = new URLSearchParams({
      page: "1",
      limit: String(limit),
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.uid ? { uid: String(filters.uid) } : {}),
      ...(filters.phone ? { phone: filters.phone } : {}),
      ...(filters.orderId ? { order_id: String(filters.orderId) } : {}),
      ...(filters.dateFrom ? { date_from: filters.dateFrom } : {}),
      ...(filters.dateTo ? { date_to: filters.dateTo } : {}),
      ...(filters.slot ? { slot: filters.slot } : {}),
      ...(filters.driverId ? { driver_id: String(filters.driverId) } : {}),
      ...(filters.orderStatus ? { order_status: String(filters.orderStatus) } : {}),
      ...(filters.paymentStatus ? { payment_status: String(filters.paymentStatus) } : {}),
    });

    const response = await axios.get(
      `https://api.apnifarming.com/user/admin/orderlist.php?${params.toString()}`
    );
    const orders = response.data.orders ?? [];

    if (!orders.length) {
      alert("No orders found for selected filters");
      return;
    }

    

   
    const itemsResponses = await Promise.all(
      orders.map((order: any) =>
        axios.post("https://api.apnifarming.com/user/admin/orderdetail.php", { order_id: order.id })
      )
    );

    const allOrderItems: OrderItem[][] = itemsResponses.map((res) => res.data.items ?? []);

   
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });
    doc.setFontSize(18);
    doc.text("ApniFarming Orders Report", 40, 40);

    let startY = 80;

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const items = allOrderItems[i];

      const fromTime = dayjs(`${order.delivery_date} ${order.delivery_from_time}`, "YYYY-MM-DD HH:mm:ss").format("hh:mm A");
      const toTime = dayjs(`${order.delivery_date} ${order.delivery_to_time}`, "YYYY-MM-DD HH:mm:ss").format("hh:mm A");

      // Order summary table
      autoTable(doc, {
        startY,
        theme: "plain",
        styles: { fontSize: 8, cellPadding: 2 },
        margin: { left: 20, right: 20 },
        body: [
          [
            { content: `Order ID: ${order.id}`, styles: { fontStyle: "bold" } },
            { content: `Customer: ${order.first_name || "-"}` },
            { content: `Address: ${order.shipping_address + " " + order.shipping_city || "-"}` },
            { content: `Total Payment: ${order.total_price}` },
          ],
          [
            { content: `Phone: ${order.phone || "-"}` },
            { content: `Delivery Date: ${order.delivery_date || "-"}` },
            { content: `Payment: ${
              order.payment_status === "1" ? "Paid" : order.payment_status === "0" ? "Unpaid" : "Pending"
            }` },
          ],
          [
            { content: `Driver: ${order.driver_name || "not-assigned-yet"} (${order.driver_phone_number || "-"})` },
            { content: `Status: ${order.order_status}` },
            { content: `Delivery Time: ${fromTime} - ${toTime}` },
          ],
        ],
      });

      startY = (doc as any).lastAutoTable?.finalY + 10;

      
      const tableColumn = ["Product Name", "Qty", "Variant", "Customize", "Price"];
      const tableRows = items.map((item) => [
        item.product_name,
        item.product_qty,
        item.variant_name,
        item.customize || "-",
        `₹${item.sale_price}`,
      ]);

      autoTable(doc, {
        startY,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [67, 160, 71], textColor: 255 },
        margin: { left: 40, right: 40 },
      });

      startY = (doc as any).lastAutoTable?.finalY + 20;

      
      if (startY > doc.internal.pageSize.getHeight() - 80) {
        doc.addPage();
        startY = 40;
      }
    }

    const today = dayjs().format("YYYY-MM-DD");
    doc.save(`orders-report-${today}.pdf`);
  } catch (err) {
    console.error(err);
    alert("Failed to generate PDF");
  } finally {
    setIsPdfLoading(false);
  }
};