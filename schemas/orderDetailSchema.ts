// We create schema because we want to validate the data coming from the client before we save it to the database. We can use zod to create a schema for the order detail content. We can also use zod to create a schema for the order detail content when we update the order detail content. This way we can ensure that the data is valid before we save it to the database.

import { z } from "zod";

export const orderDetailSchema = z.object({
  content: z.string().min(10, "Order detail content cannot be empty")
  .max(300, "Order detail content cannot exceed 300 characters"),
});