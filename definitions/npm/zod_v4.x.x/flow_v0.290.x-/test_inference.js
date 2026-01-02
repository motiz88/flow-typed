// @flow
import { describe, it } from 'flow-typed-test';
import { z } from 'zod';
import type { infer as Infer, input, output } from 'zod';

describe('type inference with z.infer', () => {
  it('should infer output type with z.infer', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number().optional(),
    });

    type Schema = Infer<typeof schema>;
    const obj: Schema = { name: 'test' };
    const obj2: Schema = { name: 'test', age: 30 };
  });

  it('should work with nested objects', () => {
    const addressSchema = z.object({
      street: z.string(),
      city: z.string(),
    });

    const userSchema = z.object({
      name: z.string(),
      address: addressSchema,
    });

    type User = Infer<typeof userSchema>;
    const user: User = {
      name: 'John',
      address: { street: '123 Main', city: 'NYC' },
    };
  });

  it('should work with arrays', () => {
    const schema = z.array(z.string());
    type StringArray = Infer<typeof schema>;
    const arr: StringArray = ['a', 'b', 'c'];

    // $FlowExpectedError[incompatible-type] - array of strings, not numbers
    const wrong: Array<number> = arr;
  });

  it('should work with unions', () => {
    const schema = z.union([z.string(), z.number()]);
    type StringOrNumber = Infer<typeof schema>;
    const val: StringOrNumber = 'hello';
    const val2: StringOrNumber = 42;
  });

  it('should work with literals', () => {
    const schema = z.literal('hello');
    type Hello = Infer<typeof schema>;
    const val: Hello = 'hello';

    // Literal type is specific
    const result: 'hello' = schema.parse('hello');
  });

  it('should work with enums', () => {
    const schema = z.enum(['a', 'b', 'c']);
    type ABC = Infer<typeof schema>;
    const val: ABC = 'a';
  });

  it('should work with nullable and optional', () => {
    const optionalSchema = z.string().optional();
    type OptionalString = Infer<typeof optionalSchema>;
    const val: OptionalString = undefined;
    const val2: OptionalString = 'hello';

    const nullableSchema = z.string().nullable();
    type NullableString = Infer<typeof nullableSchema>;
    const val3: NullableString = null;
    const val4: NullableString = 'hello';
  });

  it('should work with transforms', () => {
    const schema = z.string().transform((val) => val.length);
    type NumberFromString = Infer<typeof schema>;
    const val: NumberFromString = 5;

    // $FlowExpectedError[incompatible-type] - transformed to number
    const wrong: string = val;
  });
});

describe('input type inference', () => {
  it('should infer input type for transforms', () => {
    const schema = z.string().transform((val) => val.length);

    type InputType = input<typeof schema>;
    const inputVal: InputType = 'hello';

    // $FlowExpectedError[incompatible-type] - input is string
    const wrongInput: number = inputVal;
  });

  it('should infer input type for default', () => {
    const schema = z.string().default('fallback');

    type InputType = input<typeof schema>;

    // Input can be string or undefined
    const input1: InputType = 'value';
    const input2: InputType = undefined;
  });

  it('should infer input type for objects with transforms', () => {
    const schema = z.object({
      count: z.string().transform((s) => parseInt(s, 10)),
    });

    type InputType = input<typeof schema>;

    // Input expects string for count
    const inputObj: InputType = { count: '42' };
  });
});

describe('output type inference', () => {
  it('should infer output type for transforms', () => {
    const schema = z.string().transform((val) => val.length);

    type OutputType = output<typeof schema>;
    const outputVal: OutputType = 5;

    // $FlowExpectedError[incompatible-type] - output is number
    const wrongOutput: string = outputVal;
  });

  it('should infer output type for default', () => {
    const schema = z.string().default('fallback');

    type OutputType = output<typeof schema>;

    // Output is always string
    const output1: OutputType = 'value';

    // $FlowExpectedError[incompatible-type] - output cannot be undefined
    const wrongOutput: void = output1;
  });
});

describe('special types', () => {
  it('should handle literal types with correct inference', () => {
    const schema = z.literal('test');
    const result: 'test' = schema.parse('test');
    const value: 'test' = schema.value;

    // $FlowExpectedError[incompatible-type] - literal is 'test', not 'other'
    const wrong: 'other' = schema.parse('test');
  });

  it('should handle enum types with options', () => {
    const schema = z.enum(['a', 'b', 'c']);
    const options: $ReadOnlyArray<string> = schema.options;
    const enumObj = schema.enum;

    // Access enum object properties
    const aVal: string = enumObj.a;

    // $FlowExpectedError[incompatible-type] - options is array of strings
    const wrongOptions: $ReadOnlyArray<number> = schema.options;
  });

  it('should handle nativeEnum', () => {
    const MyEnum = { A: 'a', B: 'b' };
    const schema = z.nativeEnum(MyEnum);
    const enumObj = schema.enum;

    // enumObj has same shape as MyEnum
    const aVal: string = enumObj.A;
    const bVal: string = enumObj.B;

    // $FlowExpectedError[incompatible-type] - values are strings, not numbers
    const wrong: number = enumObj.A;
  });

  it('should handle promise with correct inner type', () => {
    const schema = z.promise(z.string());
    const result: Promise<string> = schema.parse(Promise.resolve('hello'));

    // $FlowExpectedError[incompatible-type] - promise of string, not number
    const wrong: Promise<number> = schema.parse(Promise.resolve('hello'));
  });

  it('should handle lazy for recursive types', () => {
    type Category = {
      name: string,
      subcategories: Category[],
    };
    const categorySchema: z.ZodType<Category> = z.lazy(() =>
      z.object({
        name: z.string(),
        subcategories: z.array(categorySchema),
      })
    );

    const result: Category = categorySchema.parse({
      name: 'Root',
      subcategories: [{ name: 'Child', subcategories: [] }],
    });
  });

  it('should handle function with args and returns', () => {
    const schema = z.function()
      .args(z.string(), z.number())
      .returns(z.boolean());

    // implement returns a typed function
    const fn = schema.implement((str, num) => str.length > num);
    const result: boolean = fn('hello', 3);
  });

  it('should handle custom with type parameter', () => {
    const schema = z.custom<string>((val) => typeof val === 'string');
    const result: string = schema.parse('hello');

    // $FlowExpectedError[incompatible-type] - custom returns string
    const wrong: number = schema.parse('hello');
  });

  it('should handle instanceof', () => {
    class MyClass {
      value: number;
      constructor(v: number) { this.value = v; }
    }
    const schema = z.instanceof(MyClass);
    const result: MyClass = schema.parse(new MyClass(42));
    const value: number = result.value;

    // $FlowExpectedError[incompatible-type] - result is MyClass, not string
    const wrong: string = result;
  });
});

describe('coercion types', () => {
  it('should coerce string with correct output', () => {
    const schema = z.coerce.string();
    const result: string = schema.parse(123);

    // $FlowExpectedError[incompatible-type] - coerces to string
    const wrong: number = schema.parse(123);
  });

  it('should coerce number with correct output', () => {
    const schema = z.coerce.number();
    const result: number = schema.parse('123');

    // $FlowExpectedError[incompatible-type] - coerces to number
    const wrong: string = schema.parse('123');
  });

  it('should coerce boolean with correct output', () => {
    const schema = z.coerce.boolean();
    const result: boolean = schema.parse(1);

    // $FlowExpectedError[incompatible-type] - coerces to boolean
    const wrong: number = schema.parse(1);
  });

  it('should coerce bigint with correct output', () => {
    const schema = z.coerce.bigint();
    const result: bigint = schema.parse('123');

    // $FlowExpectedError[incompatible-type] - coerces to bigint
    const wrong: number = schema.parse('123');
  });

  it('should coerce date with correct output', () => {
    const schema = z.coerce.date();
    const result: Date = schema.parse('2023-01-01');

    // $FlowExpectedError[incompatible-type] - coerces to Date
    const wrong: string = schema.parse('2023-01-01');
  });
});

describe('generic functions with ZodType constraint', () => {
  it('should work with generic schema parameter', () => {
    function parseWith<T: z.ZodType<mixed, mixed>>(
      schema: T,
      data: mixed
    ): output<T> {
      return schema.parse(data);
    }

    const stringSchema = z.string();
    const result: string = parseWith(stringSchema, 'hello');

    const numberSchema = z.number();
    const numResult: number = parseWith(numberSchema, 42);
  });

  it('should work with nested inference in generics', () => {
    function createParser<T: z.ZodType<mixed, mixed>>(
      schema: T
    ): (data: mixed) => output<T> {
      return (data) => schema.parse(data);
    }

    const parser = createParser(z.string());
    const result: string = parser('hello');
  });

  it('should work with generic schema wrapper', () => {
    function wrapSchema<T: z.ZodType<mixed, mixed>>(
      schema: T
    ): { schema: T, parse: (data: mixed) => output<T> } {
      return {
        schema,
        parse: (data) => schema.parse(data),
      };
    }

    const wrapped = wrapSchema(z.number());
    const result: number = wrapped.parse(42);
  });
});

describe('recursive types', () => {
  it('should support recursive types with z.lazy', () => {
    type Category = {
      name: string,
      subcategories: Category[],
    };

    const categorySchema: z.ZodType<Category, Category> = z.lazy(() =>
      z.object({
        name: z.string(),
        subcategories: z.array(categorySchema),
      })
    );

    const result: Category = categorySchema.parse({
      name: 'Root',
      subcategories: [{ name: 'Child', subcategories: [] }],
    });

    // Can access nested properties
    const name: string = result.name;
    const subName: string = result.subcategories[0].name;
  });

  it('should support mutually recursive types', () => {
    type Person = {
      name: string,
      friends: Person[],
    };

    const personSchema: z.ZodType<Person, Person> = z.lazy(() =>
      z.object({
        name: z.string(),
        friends: z.array(personSchema),
      })
    );

    const person: Person = personSchema.parse({
      name: 'Alice',
      friends: [{ name: 'Bob', friends: [] }],
    });
  });

  it('should support tree-like recursive types', () => {
    type TreeNode = {
      value: number,
      children: TreeNode[],
    };

    const treeSchema: z.ZodType<TreeNode, TreeNode> = z.lazy(() =>
      z.object({
        value: z.number(),
        children: z.array(treeSchema),
      })
    );

    const tree: TreeNode = treeSchema.parse({
      value: 1,
      children: [
        { value: 2, children: [] },
        { value: 3, children: [{ value: 4, children: [] }] },
      ],
    });
  });
});

describe('complex input/output type scenarios', () => {
  it('should handle chained transforms with correct types', () => {
    const schema = z.string()
      .transform((s) => s.trim())
      .transform((s) => s.toUpperCase())
      .transform((s) => s.length);

    type InputType = input<typeof schema>;
    type OutputType = output<typeof schema>;

    const inputVal: InputType = '  hello  ';
    const outputVal: OutputType = 5;

    // $FlowExpectedError[incompatible-type] - output is number
    const wrongOutput: string = outputVal;
  });

  it('should handle pipe with correct input/output types', () => {
    const schema = z.string().pipe(z.string().transform((s) => s.length));

    type InputType = input<typeof schema>;
    type OutputType = output<typeof schema>;

    const inputVal: InputType = 'hello';
    const outputVal: OutputType = 5;
  });

  it('should handle default with transform', () => {
    const schema = z.string()
      .default('fallback')
      .transform((s) => s.length);

    type InputType = input<typeof schema>;
    type OutputType = output<typeof schema>;

    // Input can be string or undefined
    const input1: InputType = 'value';
    const input2: InputType = undefined;

    // Output is always number
    const output1: OutputType = 5;
  });
});
