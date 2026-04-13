// Verify schema

import { z } from "zod";

export const signInSchema = z.object({
 identifier:z.string(),
 Password: z.string(),
});

