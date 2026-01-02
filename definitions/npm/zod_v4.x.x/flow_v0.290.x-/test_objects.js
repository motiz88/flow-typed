// @flow
import { describe, it } from 'flow-typed-test';
import { z } from 'zod';
import type { infer as Infer, input, output } from 'zod';

describe('object schemas', () => {
  it('should infer object shape', () => {
    const userSchema = z.object({
      name: z.string(),
      age: z.number(),
    });

    type User = Infer<typeof userSchema>;
    const user: User = userSchema.parse({ name: 'John', age: 30 });

    // Verify inferred properties have correct types
    const name: string = user.name;
    const age: number = user.age;

    // $FlowExpectedError[incompatible-type] - name is string, not number
    const wrongName: number = user.name;

    // $FlowExpectedError[incompatible-type] - age is number, not string
    const wrongAge: string = user.age;
  });

  it('should support extend with correct type inference', () => {
    const baseSchema = z.object({ id: z.string() });
    const extendedSchema = baseSchema.extend({ name: z.string(), count: z.number() });

    type Extended = Infer<typeof extendedSchema>;
    const result: Extended = extendedSchema.parse({ id: '1', name: 'test', count: 5 });

    // Extended type has all properties
    const id: string = result.id;
    const name: string = result.name;
    const count: number = result.count;

    // $FlowExpectedError[incompatible-type] - id is string, not number
    const wrongId: number = result.id;
  });

  it('should support merge with correct type inference', () => {
    const a = z.object({ a: z.string() });
    const b = z.object({ b: z.number() });
    const merged = a.merge(b);

    type Merged = Infer<typeof merged>;
    const result: Merged = merged.parse({ a: 'hello', b: 42 });

    // Merged type has properties from both
    const aVal: string = result.a;
    const bVal: number = result.b;

    // $FlowExpectedError[incompatible-type] - a is string, not number
    const wrongA: number = result.a;
  });

  it('should support partial with optional properties', () => {
    const schema = z.object({ name: z.string(), age: z.number() }).partial();

    type Partial = Infer<typeof schema>;

    // All properties are now optional
    const empty: Partial = {};
    const withName: Partial = { name: 'test' };
    const withAge: Partial = { age: 30 };
    const full: Partial = { name: 'test', age: 30 };
  });

  it('should support pick with correct type inference', () => {
    const schema = z.object({ a: z.string(), b: z.number(), c: z.boolean() });
    const picked = schema.pick({ a: true, b: true });

    type Picked = Infer<typeof picked>;
    const result: Picked = picked.parse({ a: 'test', b: 42 });

    // Picked type only has a and b
    const aVal: string = result.a;
    const bVal: number = result.b;
  });

  it('should support omit with correct type inference', () => {
    const schema = z.object({ a: z.string(), b: z.number(), c: z.boolean() });
    const omitted = schema.omit({ c: true });

    type Omitted = Infer<typeof omitted>;
    const result: Omitted = omitted.parse({ a: 'test', b: 42 });

    // Omitted type has a and b but not c
    const aVal: string = result.a;
    const bVal: number = result.b;
  });

  it('should support strict with same type inference', () => {
    const schema = z.object({ name: z.string() });
    const strictSchema = schema.strict();

    type StrictType = Infer<typeof strictSchema>;
    const result: StrictType = strictSchema.parse({ name: 'test' });

    // Type is the same as non-strict
    const name: string = result.name;

    // $FlowExpectedError[incompatible-type] - name is string, not number
    const wrongName: number = result.name;
  });

  it('should support passthrough with same type inference', () => {
    const schema = z.object({ name: z.string() });
    const passthroughSchema = schema.passthrough();

    type PassthroughType = Infer<typeof passthroughSchema>;
    const result: PassthroughType = passthroughSchema.parse({ name: 'test' });

    // Type includes known properties
    const name: string = result.name;

    // $FlowExpectedError[incompatible-type] - name is string, not number
    const wrongName: number = result.name;
  });

  it('should support strip with same type inference', () => {
    const schema = z.object({ name: z.string() });
    const stripSchema = schema.strip();

    type StripType = Infer<typeof stripSchema>;
    const result: StripType = stripSchema.parse({ name: 'test' });

    // Type is the same as non-strip
    const name: string = result.name;

    // $FlowExpectedError[incompatible-type] - name is string, not number
    const wrongName: number = result.name;
  });

  it('should support catchall', () => {
    const schema = z.object({ name: z.string() }).catchall(z.string());

    type CatchallType = Infer<typeof schema>;
    const result: CatchallType = schema.parse({ name: 'test' });

    // Known property is typed
    const name: string = result.name;
  });

  it('should support deepPartial', () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        address: z.object({
          city: z.string(),
        }),
      }),
    }).deepPartial();

    type DeepPartialType = Infer<typeof schema>;

    // All nested properties are optional
    const empty: DeepPartialType = {};
  });

  it('should support required converting optional to required', () => {
    const schema = z.object({
      name: z.string().optional(),
      age: z.number().optional(),
    }).required();

    type RequiredType = Infer<typeof schema>;
    const result: RequiredType = schema.parse({ name: 'test', age: 30 });

    // Required makes all properties required
    const name: string = result.name;
    const age: number = result.age;
  });

  it('should support keyof with correct type', () => {
    const schema = z.object({ a: z.string(), b: z.number() });
    const keyofSchema = schema.keyof();

    // keyofSchema validates 'a' | 'b' - returns an enum schema
    const key: string = keyofSchema.parse('a');

    // keyofSchema.options contains the keys
    const options = keyofSchema.options;

    // $FlowExpectedError[incompatible-type] - key is string, not number
    const wrongKey: number = keyofSchema.parse('a');
  });

  it('should access shape property with correct types', () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const shape = schema.shape;

    // shape.name is ZodString, shape.age is ZodNumber
    const nameResult: string = shape.name.parse('test');
    const ageResult: number = shape.age.parse(42);
  });
});

describe('object type inference', () => {
  it('should infer optional properties correctly', () => {
    const schema = z.object({
      required: z.string(),
      optional: z.string().optional(),
      nullable: z.string().nullable(),
      nullish: z.string().nullish(),
      withDefault: z.string().default('default'),
    });

    type Schema = Infer<typeof schema>;
    const obj: Schema = {
      required: 'test',
      nullable: null,
    };
  });

  it('should infer nested object types', () => {
    const schema = z.object({
      user: z.object({
        profile: z.object({
          name: z.string(),
          age: z.number(),
        }),
      }),
    });

    type Schema = Infer<typeof schema>;
    const obj: Schema = {
      user: {
        profile: {
          name: 'John',
          age: 30,
        },
      },
    };
  });

  it('should infer merged object types', () => {
    const baseSchema = z.object({ id: z.string() });
    const userSchema = baseSchema.extend({
      name: z.string(),
      email: z.string(),
    });

    type User = Infer<typeof userSchema>;
    const user: User = { id: '1', name: 'John', email: 'john@example.com' };
  });
});

describe('object operations', () => {
  it('should pick specific keys', () => {
    const schema = z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      age: z.number(),
    });

    const picked = schema.pick({ id: true, name: true });
    type Picked = Infer<typeof picked>;
    const obj: Picked = { id: '1', name: 'John' };
  });

  it('should omit specific keys', () => {
    const schema = z.object({
      id: z.string(),
      name: z.string(),
      password: z.string(),
    });

    const omitted = schema.omit({ password: true });
    type Omitted = Infer<typeof omitted>;
    const obj: Omitted = { id: '1', name: 'John' };
  });

  it('should make all properties partial', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    }).partial();

    type Partial = Infer<typeof schema>;
    const empty: Partial = {};
    const partial: Partial = { name: 'John' };
    const full: Partial = { name: 'John', age: 30 };
  });
});
