import { z } from "zod";

// ✅ Create DTO
export const CreateHotelDTO = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  image: z.string().url("Image must be a valid URL"),
  price: z.number().min(1, "Price is required"),
  description: z.string().min(1, "Description is required"),
});

// ✅ Type for Create
export type CreateHotelInput = z.infer<typeof CreateHotelDTO>;

// ✅ Update DTO (All optional for PATCH or partial update)
export const UpdateHotelDTO = CreateHotelDTO.partial();

// ✅ Type for Update
export type UpdateHotelInput = z.infer<typeof UpdateHotelDTO>;









































/*import { z } from "zod"

// DTO => Domain Transfer Object

export const CreateHotelDTO = z.object({
    name: z.string(),
    location: z.string(),
    image: z.string(),
    price: z.string(),
    description: z.string()
});*/