// app/api/orders/pdf/route.js
import { NextResponse } from "next/server";
import PdfPrinter from "pdfmake";
import path from "path";

export async function POST(req) {
  try {
    const { orders } = await req.json();

    const fonts = {
      Roboto: {
        normal: path.join(process.cwd(), "public/fonts/Roboto-Regular.ttf"),
        bold: path.join(process.cwd(), "public/fonts/Roboto-Bold.ttf"),
      },
    };

    const printer = new PdfPrinter(fonts);

    const body = [
      ["Order ID", "Customer", "Phone", "Total"],
      ...orders.map((o) => [
        o.id,
        o.firstName || "-",
        o.phone || "-",
        `₹${o.totalPrice || 0}`,
      ]),
    ];

    const docDefinition = {
      content: [
        { text: "Orders Report", style: "header" },
        { table: { headerRows: 1, body } },
        {
          text: `Total Orders: ${orders.length}`,
          margin: [0, 20, 0, 0],
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: "center", margin: [0, 0, 0, 10] },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    pdfDoc.on("data", (c) => chunks.push(c));
    pdfDoc.end();

    const buffer = await new Promise((r) => pdfDoc.on("end", () => r(Buffer.concat(chunks))));

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="orders.pdf"',
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
