import { z } from "zod";

export { z };

export const Zod = {
  parse<Out, In>(schema: z.ZodType<Out, z.ZodTypeDef, In>, value: In): Out {
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
