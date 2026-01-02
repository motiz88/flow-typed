// @flow
import { describe, it } from 'flow-typed-test';
import { z } from 'zod';
import type { infer as Infer } from 'zod';

describe('array schemas', () => {
  it('should infer array element type', () => {
    const schema = z.array(z.string());
    const result: Array<string> = schema.parse(['a', 'b']);

    // Verify element types
    const first: string = result[0];

    // $FlowExpectedError[incompatible-type] - elements are strings, not numbers
    const wrong: Array<number> = schema.parse(['a']);

    // $FlowExpectedError[incompatible-type] - element is string, not number
    const wrongElement: number = result[0];
  });

  it('should infer nested array types', () => {
    const schema = z.array(z.array(z.number()));
    const result: Array<Array<number>> = schema.parse([[1, 2], [3, 4]]);

    const inner: Array<number> = result[0];
    const value: number = result[0][0];

    // $FlowExpectedError[incompatible-type] - nested element is number, not string
    const wrongInner: string = result[0][0];
  });

  it('should infer array of objects', () => {
    const schema = z.array(z.object({ name: z.string(), age: z.number() }));
    type Item = Infer<typeof schema>[number];

    const result = schema.parse([{ name: 'John', age: 30 }]);
    const name: string = result[0].name;
    const age: number = result[0].age;

    // $FlowExpectedError[incompatible-type] - name is string, not number
    const wrongName: number = result[0].name;
  });

  it('should support array methods and maintain type', () => {
    const schema = z.array(z.number()).min(1).max(10).nonempty();
    const result: Array<number> = schema.parse([1, 2, 3]);

    // $FlowExpectedError[incompatible-type] - still numbers after validation
    const wrong: Array<string> = schema.parse([1, 2, 3]);
  });

  it('should access element property with correct type', () => {
    const schema = z.array(z.string());
    const element = schema.element;

    // element is ZodString, so parse returns string
    const str: string = element.parse('test');

    // $FlowExpectedError[incompatible-type] - element parses to string, not number
    const wrong: number = element.parse('test');
  });
});

describe('tuple schemas', () => {
  it('should infer tuple element types correctly', () => {
    const schema = z.tuple([z.string(), z.number(), z.boolean()]);
    const result = schema.parse(['hello', 42, true]);

    // With TupleOutput<T>, Flow should infer the element types
    // Result is [string, number, boolean]
    const first: string = result[0];
    const second: number = result[1];
    const third: boolean = result[2];

    // $FlowExpectedError[incompatible-type] - first element is string, not number
    const wrongFirst: number = result[0];

    // $FlowExpectedError[incompatible-type] - second element is number, not string
    const wrongSecond: string = result[1];
  });

  it('should access items property with correct schema types', () => {
    const schema = z.tuple([z.string(), z.number()]);
    const items = schema.items;

    // items[0] is ZodString, items[1] is ZodNumber
    // We can verify individual element schemas work correctly
    const strSchema = items[0];
    const numSchema = items[1];

    // Individual schemas parse to their correct types
    const str: string = strSchema.parse('hello');
    const num: number = numSchema.parse(42);

    // $FlowExpectedError[incompatible-type] - strSchema parses to string
    const wrongStr: number = strSchema.parse('hello');

    // $FlowExpectedError[incompatible-type] - numSchema parses to number
    const wrongNum: string = numSchema.parse(42);
  });

  it('should support rest elements', () => {
    const schema = z.tuple([z.string(), z.number()]).rest(z.boolean());
    const result = schema.parse(['hello', 42, true, false, true]);

    // Verify rest method returns ZodTuple
    const restSchema = schema.rest(z.string());
    const restResult = restSchema.parse(['hello', 42, 'a', 'b']);
  });
});

describe('record schemas', () => {
  it('should infer record value type', () => {
    const schema = z.record(z.number());
    const result = schema.parse({ a: 1, b: 2, c: 3 });

    // Values are numbers
    const aVal: number = result.a;

    // $FlowExpectedError[incompatible-type] - values are numbers, not strings
    const wrong: string = result.a;
  });

  it('should infer record with key and value type', () => {
    const schema = z.record(z.string(), z.boolean());
    const result = schema.parse({ active: true, enabled: false });

    const activeVal: boolean = result.active;

    // $FlowExpectedError[incompatible-type] - values are booleans, not strings
    const wrong: string = result.active;
  });

  it('should access keySchema and valueSchema with correct types', () => {
    const schema = z.record(z.string(), z.number());
    const keySchema = schema.keySchema;
    const valueSchema = schema.valueSchema;

    // keySchema parses to string
    const key: string = keySchema.parse('test');

    // valueSchema parses to number
    const value: number = valueSchema.parse(42);

    // $FlowExpectedError[incompatible-type] - keySchema returns string
    const wrongKey: number = keySchema.parse('test');

    // $FlowExpectedError[incompatible-type] - valueSchema returns number
    const wrongValue: string = valueSchema.parse(42);
  });
});

describe('map schemas', () => {
  it('should infer map key and value types', () => {
    const schema = z.map(z.string(), z.number());
    const result: Map<string, number> = schema.parse(new Map([['a', 1], ['b', 2]]));

    // Get returns number | void
    const value = result.get('a');

    // $FlowExpectedError[incompatible-type] - value types are numbers
    const wrong: Map<string, string> = schema.parse(new Map([['a', 1]]));
  });

  it('should infer map with object values', () => {
    const schema = z.map(z.string(), z.object({ count: z.number() }));
    const result = schema.parse(new Map([['item', { count: 5 }]]));

    const item = result.get('item');
    if (item) {
      const count: number = item.count;

      // $FlowExpectedError[incompatible-type] - count is number, not string
      const wrong: string = item.count;
    }
  });
});

describe('set schemas', () => {
  it('should infer set element type', () => {
    const schema = z.set(z.string());
    const result: Set<string> = schema.parse(new Set(['a', 'b', 'c']));

    // Iterating gives strings
    for (const item of result) {
      const str: string = item;
    }

    // $FlowExpectedError[incompatible-type] - elements are strings, not numbers
    const wrong: Set<number> = schema.parse(new Set(['a']));
  });

  it('should infer set of objects', () => {
    const schema = z.set(z.object({ id: z.number() }));
    const result = schema.parse(new Set([{ id: 1 }, { id: 2 }]));

    for (const item of result) {
      const id: number = item.id;

      // $FlowExpectedError[incompatible-type] - id is number, not string
      const wrong: string = item.id;
    }
  });

  it('should support set methods and maintain type', () => {
    const schema = z.set(z.number()).min(1).max(10).size(5).nonempty();
    const result: Set<number> = schema.parse(new Set([1, 2, 3, 4, 5]));

    // $FlowExpectedError[incompatible-type] - still numbers after validation
    const wrong: Set<string> = schema.parse(new Set([1, 2]));
  });
});
