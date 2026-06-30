import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

export function validateSchema<T>(schema: object, data: unknown): data is T {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    const errors = validate.errors?.map((e) => `${e.instancePath} ${e.message}`).join('; ');
    throw new Error(`Schema validation failed: ${errors}`);
  }
  return true;
}

export function assertSchema<T>(schema: object, data: unknown): asserts data is T {
  validateSchema<T>(schema, data);
}
