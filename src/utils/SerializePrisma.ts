import { Decimal } from "@prisma/client/runtime/library";

export const serializePrisma = (data: any): any => {
  if (data === null || data === undefined) return data;

  // Handle BigInt
  if (typeof data === "bigint") return data.toString();

  // Handle Decimal objects
  if (data instanceof Decimal) return Number(data);

  // Handle Dates
  if (data instanceof Date) return data.toISOString();

  // Handle arrays
  if (Array.isArray(data)) return data.map(serializePrisma);

  // Handle objects
  if (typeof data === "object") {
    // Handle objects with custom toJSON
    if (typeof data.toJSON === "function") {
      return serializePrisma(data.toJSON());
    }

    const obj: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        obj[key] = serializePrisma(data[key]);
      }
    }
    return obj;
  }

  return data;
};
