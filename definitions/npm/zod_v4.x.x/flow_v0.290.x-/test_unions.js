// @flow
import { describe, it } from 'flow-typed-test';
import { z } from 'zod';
import type { infer as Infer, input, output } from 'zod';

describe('union schemas', () => {
  it('should infer union type correctly', () => {
    const schema = z.union([z.string(), z.number()]);
    type UnionType = Infer<typeof schema>;

    const strResult: UnionType = 'hello';
    const numResult: UnionType = 42;

    // Both string and number are valid
    const result1 = schema.parse('hello');
    const result2 = schema.parse(42);
  });

  it('should access options property with correct types', () => {
    const schema = z.union([z.string(), z.number()]);
    const options = schema.options;

    // options[0] is ZodString, options[1] is ZodNumber
    const strResult: string = options[0].parse('hello');
    const numResult: number = options[1].parse(42);

    // $FlowExpectedError[incompatible-type] - options[0] parses to string
    const wrongStr: number = options[0].parse('hello');
  });

  it('should infer three-way union', () => {
    const schema = z.union([z.string(), z.number(), z.boolean()]);
    type UnionType = Infer<typeof schema>;

    const val1: UnionType = 'hello';
    const val2: UnionType = 42;
    const val3: UnionType = true;
  });
});

describe('discriminated union schemas', () => {
  it('should infer discriminated union type', () => {
    const schema = z.discriminatedUnion('type', [
      z.object({ type: z.literal('a'), value: z.string() }),
      z.object({ type: z.literal('b'), count: z.number() }),
    ]);

    type Result = Infer<typeof schema>;

    // Both variants are valid
    const variantA: Result = { type: 'a', value: 'hello' };
    const variantB: Result = { type: 'b', count: 42 };
  });

  it('should access discriminator and options properties with correct types', () => {
    const schema = z.discriminatedUnion('type', [
      z.object({ type: z.literal('a'), a: z.string() }),
      z.object({ type: z.literal('b'), b: z.number() }),
    ]);

    const discriminator: string = schema.discriminator;
    const options = schema.options;

    // $FlowExpectedError[incompatible-type] - discriminator is string, not number
    const wrongDiscriminator: number = schema.discriminator;

    // options[0] is the first object schema
    const firstOption = options[0].parse({ type: 'a', a: 'test' });
  });

  it('should handle discriminated union with enum discriminator', () => {
    const schema = z.discriminatedUnion('status', [
      z.object({ status: z.literal('active'), data: z.string() }),
      z.object({ status: z.literal('inactive'), reason: z.string() }),
      z.object({ status: z.literal('pending'), eta: z.number() }),
    ]);

    type Result = Infer<typeof schema>;

    const active: Result = { status: 'active', data: 'test' };
    const inactive: Result = { status: 'inactive', reason: 'closed' };
    const pending: Result = { status: 'pending', eta: 100 };
  });

  it('should handle complex discriminated union', () => {
    const schema = z.discriminatedUnion('kind', [
      z.object({
        kind: z.literal('circle'),
        radius: z.number(),
      }),
      z.object({
        kind: z.literal('rectangle'),
        width: z.number(),
        height: z.number(),
      }),
      z.object({
        kind: z.literal('triangle'),
        base: z.number(),
        height: z.number(),
      }),
    ]);

    type Shape = Infer<typeof schema>;

    const circle: Shape = { kind: 'circle', radius: 10 };
    const rect: Shape = { kind: 'rectangle', width: 10, height: 20 };
    const tri: Shape = { kind: 'triangle', base: 10, height: 15 };
  });
});

describe('intersection schemas', () => {
  it('should infer intersection type correctly', () => {
    const a = z.object({ a: z.string() });
    const b = z.object({ b: z.number() });
    const schema = z.intersection(a, b);

    type Result = Infer<typeof schema>;

    // Result has both a and b properties
    const result: Result = { a: 'hello', b: 42 };

    // Verify property types
    const aVal: string = result.a;
    const bVal: number = result.b;

    // $FlowExpectedError[incompatible-type] - a is string, not number
    const wrongA: number = result.a;

    // $FlowExpectedError[incompatible-type] - b is number, not string
    const wrongB: string = result.b;
  });

  it('should access left and right properties', () => {
    const a = z.object({ a: z.string() });
    const b = z.object({ b: z.number() });
    const schema = z.intersection(a, b);

    const left = schema.left;
    const right = schema.right;

    // left and right can parse their respective shapes
    const leftResult: { a: string, ... } = left.parse({ a: 'test' });
    const rightResult: { b: number, ... } = right.parse({ b: 42 });
  });

  it('should support and() method with correct type inference', () => {
    const schema = z.object({ a: z.string() }).and(z.object({ b: z.number() }));

    type Result = Infer<typeof schema>;
    const result: Result = { a: 'hello', b: 42 };

    // Verify property types
    const aVal: string = result.a;
    const bVal: number = result.b;
  });

  it('should support or() method with correct type inference', () => {
    const schema = z.string().or(z.number());

    // Result can be string or number
    const strResult = schema.parse('hello');
    const numResult = schema.parse(42);

    // Verify options can be accessed on resulting union
    const options = schema.options;
    const firstOption: string = options[0].parse('test');
    const secondOption: number = options[1].parse(42);
  });

  it('should infer deeply nested intersection', () => {
    const Animal = z.object({
      properties: z.object({
        isAnimal: z.boolean(),
      }),
    });
    const Cat = z.intersection(
      z.object({
        properties: z.object({
          meows: z.boolean(),
        }),
      }),
      Animal
    );

    type CatType = Infer<typeof Cat>;
    const cat: CatType = {
      properties: { isAnimal: true, meows: true },
    };
  });

  it('should handle multiple intersections', () => {
    const A = z.object({ a: z.string() });
    const B = z.object({ b: z.number() });
    const C = z.object({ c: z.boolean() });

    const ABC = A.and(B).and(C);

    type Result = Infer<typeof ABC>;
    const result: Result = { a: 'hello', b: 42, c: true };
  });
});

describe('union type narrowing', () => {
  it('should support type narrowing with safeParse', () => {
    const schema = z.union([z.string(), z.number()]);
    const result = schema.safeParse('hello');

    if (result.success) {
      // data is string | number
      const data = result.data;
    } else {
      // error is ZodError
      const error = result.error;
      const issues = error.issues;
    }
  });

  it('should narrow types after successful parse', () => {
    const schema = z.object({ name: z.string() });
    const result = schema.safeParse({ name: 'test' });

    if (result.success) {
      const name: string = result.data.name;

      // $FlowExpectedError[incompatible-type] - name is string, not number
      const wrongName: number = result.data.name;
    }
  });
});
