import { z } from "zod";

export { z };

export const Zod = {
  parse<T>(schema: z.ZodType<T, z.ZodTypeDef, T>, value: T): T {
    try {
      return schema.parse(value);
    } catch (error: unknown) {
      let cause = error;
      if (error instanceof z.ZodError) {
        cause = error.message;
      }
      const message = `Zod parse error, schema '${schema.description}'`;
      throw new Error(`${message}, ${cause}`);
    }
  },

  schema<T extends z.ZodType>(description: string, schema: T): T {
    return schema.describe(description);
  },

  object<T extends z.ZodRawShape>(description: string, shape: T): ReturnType<typeof z.object<T>> {
    return z.object(shape).describe(description);
  },
};
