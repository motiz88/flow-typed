// @flow
import { describe, it } from 'flow-typed-test';
import { z } from 'zod';
import type { infer as Infer, SafeParseResult, SafeParseSuccess, SafeParseError, ZodError, ZodIssue } from 'zod';

describe('parse method', () => {
  it('should return typed result from parse', () => {
    const schema = z.string();
    const result: string = schema.parse('hello');

    // $FlowExpectedError[incompatible-type] - parse returns string
    const wrong: number = schema.parse('hello');
  });

  it('should return typed result from object schema parse', () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const result = schema.parse({ name: 'John', age: 30 });

    const name: string = result.name;
    const age: number = result.age;

    // $FlowExpectedError[incompatible-type] - name is string
    const wrongName: number = result.name;

    // $FlowExpectedError[incompatible-type] - age is number
    const wrongAge: string = result.age;
  });
});

describe('safeParse method', () => {
  it('should return SafeParseResult with discriminated union', () => {
    const schema = z.string();
    const result = schema.safeParse('hello');

    if (result.success) {
      // In success branch, data is available and typed
      const data: string = result.data;

      // $FlowExpectedError[incompatible-type] - data is string
      const wrongData: number = result.data;

      // error should not exist in success branch
    } else {
      // In error branch, error is available
      const error: ZodError = result.error;
      const issues = error.issues;

      // data should not exist in error branch
    }
  });

  it('should narrow types for object schema', () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const result = schema.safeParse({ name: 'John', age: 30 });

    if (result.success) {
      const name: string = result.data.name;
      const age: number = result.data.age;

      // $FlowExpectedError[incompatible-type] - name is string
      const wrongName: number = result.data.name;
    } else {
      const issues = result.error.issues;
      const firstIssue = issues[0];
      const code: string = firstIssue.code;
      const message: string = firstIssue.message;
      const path = firstIssue.path;
    }
  });

  it('should narrow types for union schema', () => {
    const schema = z.union([z.string(), z.number()]);
    const result = schema.safeParse('hello');

    if (result.success) {
      // data is string | number
      const data = result.data;
    }
  });

  it('should work with array schema', () => {
    const schema = z.array(z.string());
    const result = schema.safeParse(['a', 'b', 'c']);

    if (result.success) {
      const arr: string[] = result.data;
      const first: string = result.data[0];

      // $FlowExpectedError[incompatible-type] - elements are strings
      const wrong: number = result.data[0];
    }
  });
});

describe('parseAsync method', () => {
  it('should return Promise of typed result', async () => {
    const schema = z.string();
    const result: Promise<string> = schema.parseAsync('hello');
    const value: string = await result;

    // $FlowExpectedError[incompatible-type] - returns Promise<string>
    const wrong: Promise<number> = schema.parseAsync('hello');
  });

  it('should return Promise of object type', async () => {
    const schema = z.object({ name: z.string() });
    const result = await schema.parseAsync({ name: 'test' });
    const name: string = result.name;
  });
});

describe('safeParseAsync method', () => {
  it('should return Promise of SafeParseResult', async () => {
    const schema = z.string();
    const result = await schema.safeParseAsync('hello');

    if (result.success) {
      const data: string = result.data;
    } else {
      const error = result.error;
    }
  });

  it('should narrow types correctly for async', async () => {
    const schema = z.object({ count: z.number() });
    const result = await schema.safeParseAsync({ count: 42 });

    if (result.success) {
      const count: number = result.data.count;

      // $FlowExpectedError[incompatible-type] - count is number
      const wrong: string = result.data.count;
    }
  });
});

describe('ZodError', () => {
  it('should have issues array with correct types', () => {
    const schema = z.string();
    const result = schema.safeParse(123);

    if (!result.success) {
      const issues = result.error.issues;

      issues.forEach((issue) => {
        const code: string = issue.code;
        const path = issue.path;
        const message: string = issue.message;

        // Each path element is string | number
        path.forEach((segment) => {
          // segment is string | number
        });
      });
    }
  });

  it('should support format method', () => {
    const schema = z.object({ name: z.string() });
    const result = schema.safeParse({ name: 123 });

    if (!result.success) {
      const formatted = result.error.format();
      const errors = formatted._errors;
    }
  });

  it('should support flatten method', () => {
    const schema = z.object({ name: z.string() });
    const result = schema.safeParse({ name: 123 });

    if (!result.success) {
      const flattened = result.error.flatten();
      const formErrors = flattened.formErrors;
      const fieldErrors = flattened.fieldErrors;

      // formErrors is array of strings
      formErrors.forEach((err) => {
        // err is inferred type
      });
    }
  });

  it('should support flatten with mapper function', () => {
    const schema = z.string();
    const result = schema.safeParse(123);

    if (!result.success) {
      const flattened = result.error.flatten((issue) => ({
        message: issue.message,
        code: issue.code,
      }));
    }
  });

  it('should have errors alias for issues', () => {
    const schema = z.string();
    const result = schema.safeParse(123);

    if (!result.success) {
      // errors is alias for issues
      const errors = result.error.errors;
      const issues = result.error.issues;
    }
  });

  it('should support addIssue and addIssues methods', () => {
    const schema = z.string();
    const result = schema.safeParse(123);

    if (!result.success) {
      result.error.addIssue({
        code: 'custom',
        path: ['field'],
        message: 'Custom error',
      });

      result.error.addIssues([
        { code: 'custom', path: ['field1'], message: 'Error 1' },
        { code: 'custom', path: ['field2'], message: 'Error 2' },
      ]);
    }
  });

  it('should support static create method', () => {
    const error = z.ZodError.create([
      { code: 'custom', path: ['field'], message: 'Custom error' },
    ]);

    const issues = error.issues;
    const name: string = error.name;
  });

  it('should have isEmpty property', () => {
    const schema = z.string();
    const result = schema.safeParse(123);

    if (!result.success) {
      const isEmpty: boolean = result.error.isEmpty;
    }
  });
});

describe('complex type narrowing', () => {
  it('should narrow nested object types', () => {
    const schema = z.object({
      user: z.object({
        profile: z.object({
          name: z.string(),
          age: z.number(),
        }),
      }),
    });

    const result = schema.safeParse({
      user: { profile: { name: 'John', age: 30 } },
    });

    if (result.success) {
      const name: string = result.data.user.profile.name;
      const age: number = result.data.user.profile.age;

      // $FlowExpectedError[incompatible-type] - name is string
      const wrongName: number = result.data.user.profile.name;
    }
  });

  it('should narrow array of objects type', () => {
    const schema = z.array(z.object({ id: z.number(), name: z.string() }));

    const result = schema.safeParse([{ id: 1, name: 'test' }]);

    if (result.success) {
      const first = result.data[0];
      const id: number = first.id;
      const name: string = first.name;
    }
  });

  it('should narrow transformed types', () => {
    const schema = z.string().transform((val) => val.length);

    const result = schema.safeParse('hello');

    if (result.success) {
      // After transform, data is number
      const len: number = result.data;

      // $FlowExpectedError[incompatible-type] - data is number after transform
      const wrong: string = result.data;
    }
  });
});
