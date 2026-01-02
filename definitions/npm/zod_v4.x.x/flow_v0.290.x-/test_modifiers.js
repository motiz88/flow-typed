// @flow
import { describe, it } from 'flow-typed-test';
import { z } from 'zod';
import type { infer as Infer, input, output } from 'zod';

describe('optional modifier', () => {
  it('should infer optional type correctly', () => {
    const schema = z.string().optional();

    type Result = Infer<typeof schema>;

    // Result can be string or undefined
    const str: Result = 'hello';
    const undef: Result = undefined;

    // $FlowExpectedError[incompatible-type] - null is not valid for optional
    const wrongNull: Result = null;
  });

  it('should parse both string and undefined', () => {
    const schema = z.string().optional();
    const result1: string | void = schema.parse(undefined);
    const result2: string | void = schema.parse('hello');
  });

  it('should support unwrap returning inner schema', () => {
    const schema = z.string().optional();
    const unwrapped = schema.unwrap();

    // unwrapped is ZodString, parses to string
    const result: string = unwrapped.parse('hello');

    // $FlowExpectedError[incompatible-type] - unwrapped parses to string, not number
    const wrong: number = unwrapped.parse('hello');
  });

  it('should work with objects having optional properties', () => {
    const schema = z.object({
      required: z.string(),
      optional: z.string().optional(),
    });

    type Result = Infer<typeof schema>;

    // optional property can be omitted
    const obj1: Result = { required: 'test' };
    const obj2: Result = { required: 'test', optional: 'value' };
    const obj3: Result = { required: 'test', optional: undefined };
  });
});

describe('nullable modifier', () => {
  it('should infer nullable type correctly', () => {
    const schema = z.string().nullable();

    type Result = Infer<typeof schema>;

    // Result can be string or null
    const str: Result = 'hello';
    const nullVal: Result = null;

    // $FlowExpectedError[incompatible-type] - undefined is not valid for nullable
    const wrongUndef: Result = undefined;
  });

  it('should parse both string and null', () => {
    const schema = z.string().nullable();
    const result1: string | null = schema.parse(null);
    const result2: string | null = schema.parse('hello');

    // $FlowExpectedError[incompatible-type] - result is string | null, not just string
    const wrong: string = schema.parse(null);
  });

  it('should support unwrap returning inner schema', () => {
    const schema = z.string().nullable();
    const unwrapped = schema.unwrap();

    // unwrapped is ZodString
    const result: string = unwrapped.parse('hello');

    // $FlowExpectedError[incompatible-type] - unwrapped parses to string, not number
    const wrong: number = unwrapped.parse('hello');
  });
});

describe('nullish modifier', () => {
  it('should infer nullish type correctly', () => {
    const schema = z.string().nullish();

    type Result = Infer<typeof schema>;

    // Result can be string, null, or undefined
    const result1: Result = undefined;
    const result2: Result = null;
    const result3: Result = 'hello';

    // Verify parsing returns correct types
    const parsed: string | null | void = schema.parse('hello');

    // $FlowExpectedError[incompatible-type] - number is not valid for nullish
    const wrong: Result = 42;
  });

  it('should work with objects having nullish properties', () => {
    const schema = z.object({
      required: z.string(),
      nullish: z.string().nullish(),
    });

    type Result = Infer<typeof schema>;

    const obj1: Result = { required: 'test' };
    const obj2: Result = { required: 'test', nullish: null };
    const obj3: Result = { required: 'test', nullish: 'value' };
  });
});

describe('default modifier', () => {
  it('should infer default output type as non-optional', () => {
    const schema = z.string().default('fallback');

    type OutputType = output<typeof schema>;

    // Output is always string (never undefined)
    const result: OutputType = 'value';

    // parse returns string even for undefined input
    const parsed: string = schema.parse(undefined);

    // $FlowExpectedError[incompatible-type] - output is string, not string | void
    const wrong: string | void = parsed;
  });

  it('should infer input type as optional', () => {
    const schema = z.string().default('fallback');

    type InputType = input<typeof schema>;

    // Input can be string or undefined
    const input1: InputType = 'value';
    const input2: InputType = undefined;
  });

  it('should handle default with function', () => {
    const schema = z.string().default(() => 'fallback');
    const result: string = schema.parse(undefined);
  });

  it('should support removeDefault returning inner schema', () => {
    const schema = z.string().default('fallback');
    const unwrapped = schema.removeDefault();

    // unwrapped is ZodString
    const result: string = unwrapped.parse('hello');

    // $FlowExpectedError[incompatible-type] - unwrapped parses to string
    const wrong: number = unwrapped.parse('hello');
  });

  it('should work with objects having default properties', () => {
    const schema = z.object({
      name: z.string(),
      count: z.number().default(0),
    });

    type InputType = input<typeof schema>;
    type OutputType = output<typeof schema>;

    // Input: count is optional
    const inputObj: InputType = { name: 'test' };

    // Output: count is always number
    const outputObj: OutputType = { name: 'test', count: 5 };
    const count: number = outputObj.count;
  });
});

describe('catch modifier', () => {
  it('should infer catch output type as always the inner type', () => {
    const schema = z.string().catch('fallback');

    type OutputType = output<typeof schema>;

    // Output is always string
    const result: OutputType = 'value';
    const parsed: string = schema.parse(123); // invalid input returns fallback
  });

  it('should infer input type as mixed', () => {
    const schema = z.string().catch('fallback');

    type InputType = input<typeof schema>;

    // Input can be anything
    const input1: mixed = 'value';
    const input2: mixed = 123;
    const input3: mixed = null;
  });

  it('should handle catch with function', () => {
    const schema = z.string().catch((ctx) => {
      // ctx has error and input properties
      return 'fallback';
    });
    const result: string = schema.parse(123);
  });

  it('should support removeCatch returning inner schema', () => {
    const schema = z.string().catch('fallback');
    const unwrapped = schema.removeCatch();

    // unwrapped is ZodString
    const result: string = unwrapped.parse('hello');

    // $FlowExpectedError[incompatible-type] - unwrapped parses to string
    const wrong: number = unwrapped.parse('hello');
  });
});

describe('readonly modifier', () => {
  it('should infer readonly object type', () => {
    const schema = z.object({ name: z.string(), age: z.number() }).readonly();

    type Result = Infer<typeof schema>;
    const result: Result = schema.parse({ name: 'test', age: 30 });

    // Properties are readonly
    const name: string = result.name;
    const age: number = result.age;
  });

  it('should infer readonly array type', () => {
    const schema = z.array(z.string()).readonly();

    type Result = Infer<typeof schema>;
    const result: Result = schema.parse(['a', 'b', 'c']);

    // Array is readonly
    const first: string = result[0];
  });

  it('should support standalone readonly function', () => {
    const schema = z.readonly(z.object({ name: z.string() }));

    type Result = Infer<typeof schema>;
    const result: Result = schema.parse({ name: 'test' });
    const name: string = result.name;
  });

  it('should work with nested objects', () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
      }).readonly(),
    }).readonly();

    type Result = Infer<typeof schema>;
    const result: Result = schema.parse({ user: { name: 'test' } });
  });
});

describe('describe modifier', () => {
  it('should return same type after describe', () => {
    const schema = z.string().describe('A description');
    const result: string = schema.parse('hello');

    // $FlowExpectedError[incompatible-type] - still string, not number
    const wrong: number = schema.parse('hello');
  });

  it('should work with complex types', () => {
    const schema = z.object({
      name: z.string().describe('User name'),
      age: z.number().describe('User age'),
    }).describe('User object');

    type Result = Infer<typeof schema>;
    const result: Result = schema.parse({ name: 'John', age: 30 });
  });
});

describe('introspection methods', () => {
  it('should return boolean from isOptional', () => {
    const optionalSchema = z.string().optional();
    const isOptional: boolean = optionalSchema.isOptional();

    const requiredSchema = z.string();
    const isNotOptional: boolean = requiredSchema.isOptional();
  });

  it('should return boolean from isNullable', () => {
    const nullableSchema = z.string().nullable();
    const isNullable: boolean = nullableSchema.isNullable();

    const nonNullableSchema = z.string();
    const isNotNullable: boolean = nonNullableSchema.isNullable();
  });
});
