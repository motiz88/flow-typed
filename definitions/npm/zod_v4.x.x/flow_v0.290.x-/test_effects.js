// @flow
import { describe, it } from 'flow-typed-test';
import { z } from 'zod';
import type { infer as Infer, input, output } from 'zod';

describe('transform', () => {
  it('should transform values with correct type inference', () => {
    const schema = z.string().transform((val) => val.length);

    // Output type is number (transformed)
    const result: number = schema.parse('hello');

    // $FlowExpectedError[incompatible-type] - output is number, not string
    const wrong: string = schema.parse('hello');
  });

  it('should infer input and output types differently', () => {
    const schema = z.string().transform((val) => val.length);

    type InputType = input<typeof schema>;
    type OutputType = output<typeof schema>;

    const inputVal: InputType = 'hello';
    const outputVal: OutputType = 5;

    // $FlowExpectedError[incompatible-type] - input is string
    const wrongInput: number = inputVal;

    // $FlowExpectedError[incompatible-type] - output is number
    const wrongOutput: string = outputVal;
  });

  it('should chain transforms with cumulative type changes', () => {
    const schema = z.string()
      .transform((val) => val.toUpperCase())  // string -> string
      .transform((val) => val.split(','))      // string -> string[]
      .transform((val) => val.length);         // string[] -> number

    const result: number = schema.parse('a,b,c');

    // $FlowExpectedError[incompatible-type] - final output is number
    const wrong: string[] = schema.parse('a,b,c');
  });

  it('should transform with context parameter', () => {
    const schema = z.string().transform((val, ctx) => {
      if (val.length < 3) {
        ctx.addIssue({
          code: 'custom',
          path: ctx.path,
          message: 'Too short',
        });
      }
      return val.length;
    });

    const result: number = schema.parse('hello');

    // $FlowExpectedError[incompatible-type] - output is number, not string
    const wrong: string = schema.parse('hello');
  });
});

describe('refine', () => {
  it('should maintain type after refine', () => {
    const schema = z.string().refine((val) => val.length > 0);

    // Output type is still string
    const result: string = schema.parse('hello');

    // $FlowExpectedError[incompatible-type] - output is string, not number
    const wrong: number = schema.parse('hello');
  });

  it('should refine with message string', () => {
    const schema = z.string().refine((val) => val.length > 0, 'String must not be empty');
    const result: string = schema.parse('hello');
  });

  it('should refine with options object', () => {
    const schema = z.string().refine(
      (val) => val.length > 0,
      { message: 'String must not be empty', path: ['myField'] }
    );
    const result: string = schema.parse('hello');
  });

  it('should chain refines maintaining type', () => {
    const schema = z.string()
      .refine((val) => val.length > 0, 'Not empty')
      .refine((val) => val.length < 100, 'Not too long')
      .refine((val) => val === val.trim(), 'No whitespace');

    const result: string = schema.parse('hello');
  });
});

describe('superRefine', () => {
  it('should maintain type after superRefine', () => {
    const schema = z.string().superRefine((val, ctx) => {
      if (val.length < 5) {
        ctx.addIssue({
          code: 'custom',
          path: [],
          message: 'String too short',
        });
      }
    });

    const result: string = schema.parse('hello');

    // $FlowExpectedError[incompatible-type] - output is string, not number
    const wrong: number = schema.parse('hello');
  });

  it('should add multiple issues', () => {
    const schema = z.array(z.string()).superRefine((val, ctx) => {
      if (val.length > 3) {
        ctx.addIssue({
          code: 'too_big',
          path: [],
          message: 'Too many items',
        });
      }
      if (val.length !== new Set(val).size) {
        ctx.addIssue({
          code: 'custom',
          path: [],
          message: 'No duplicates allowed',
        });
      }
    });

    const result: string[] = schema.parse(['a', 'b', 'c']);
  });

  it('should access path from context', () => {
    const schema = z.string().superRefine((val, ctx) => {
      const currentPath = ctx.path;
      if (val.length < 3) {
        ctx.addIssue({
          code: 'custom',
          path: [...currentPath, 'length'],
          message: 'Too short',
        });
      }
    });

    // Schema still returns string after superRefine
    const result: string = schema.parse('hello');
  });
});

describe('preprocess', () => {
  it('should preprocess input with type change', () => {
    const schema = z.preprocess(
      (val) => String(val),
      z.string()
    );

    // Output is string
    const result: string = schema.parse(123);

    // $FlowExpectedError[incompatible-type] - output is string, not number
    const wrong: number = schema.parse(123);
  });

  it('should preprocess with complex transformation', () => {
    const schema = z.preprocess(
      (val) => {
        if (typeof val === 'string') {
          return parseInt(val, 10);
        }
        return val;
      },
      z.number()
    );

    const result: number = schema.parse('42');
  });
});

describe('innerType', () => {
  it('should access inner type with correct type', () => {
    const schema = z.string().transform((val) => val.length);
    const inner = schema.innerType();

    // inner is ZodString
    const result: string = inner.parse('hello');

    // $FlowExpectedError[incompatible-type] - inner parses to string
    const wrong: number = inner.parse('hello');
  });

  it('should access inner type of refine', () => {
    const schema = z.number().refine((val) => val > 0);
    const inner = schema.innerType();

    const result: number = inner.parse(42);
  });
});

describe('pipe', () => {
  it('should pipe schemas with correct type inference', () => {
    const schema = z.string().pipe(z.string().transform((val) => val.length));

    // Input is string, output is number
    type InputType = input<typeof schema>;
    type OutputType = output<typeof schema>;

    const inputVal: InputType = 'hello';
    const outputVal: OutputType = 5;

    const result: number = schema.parse('hello');

    // $FlowExpectedError[incompatible-type] - output is number
    const wrong: string = schema.parse('hello');
  });

  it('should support standalone pipe function', () => {
    const schema = z.pipe(z.string(), z.string().transform((val) => val.length));

    const result: number = schema.parse('hello');
  });

  it('should pipe through validation', () => {
    const schema = z.string()
      .transform((s) => parseInt(s, 10))
      .pipe(z.number().positive());

    const result: number = schema.parse('42');
  });

  it('should pipe with array transformation', () => {
    const schema = z.string()
      .transform((s) => s.split(','))
      .pipe(z.array(z.string()).min(2));

    const result: string[] = schema.parse('a,b,c');

    // $FlowExpectedError[incompatible-type] - output is string[]
    const wrong: number[] = schema.parse('a,b,c');
  });
});

describe('brand', () => {
  it('should brand types with correct inference', () => {
    const schema = z.string().brand<'UserId'>();

    const result = schema.parse('user-123');

    // Can still use as string
    const len: number = result.length;
  });

  it('should create distinct branded types', () => {
    const UserIdSchema = z.string().brand<'UserId'>();
    const PostIdSchema = z.string().brand<'PostId'>();

    type UserId = Infer<typeof UserIdSchema>;
    type PostId = Infer<typeof PostIdSchema>;

    const userId: UserId = UserIdSchema.parse('user-123');
    const postId: PostId = PostIdSchema.parse('post-456');

    // Both can be used as strings
    const userIdLen: number = userId.length;
    const postIdLen: number = postId.length;
  });

  it('should work with object schemas', () => {
    const ValidUserSchema = z.object({
      name: z.string(),
      email: z.string().email(),
    }).brand<'ValidUser'>();

    type ValidUser = Infer<typeof ValidUserSchema>;
    const user: ValidUser = ValidUserSchema.parse({ name: 'John', email: 'john@example.com' });

    // Can access properties
    const name: string = user.name;
    const email: string = user.email;
  });
});

describe('chaining effects', () => {
  it('should chain refine with transform correctly', () => {
    const schema = z.string()
      .refine((val) => val.length > 0, 'String cannot be empty')
      .transform((val) => val.length);

    // Output is number
    const result: number = schema.parse('hello');

    // Input is string
    type InputType = input<typeof schema>;
    const inputVal: InputType = 'hello';
  });

  it('should chain transform with refine correctly', () => {
    const schema = z.string()
      .transform((val) => val.length)
      .refine((val) => val > 0, 'Length must be positive');

    // Output is still number
    const result: number = schema.parse('hello');
  });

  it('should chain multiple effects with correct types', () => {
    const schema = z.string()
      .transform((val) => val.trim())           // string -> string
      .refine((val) => val.length > 0)          // string (validated)
      .transform((val) => val.toUpperCase())    // string -> string
      .transform((val) => val.split(','))       // string -> string[]
      .refine((val) => val.length >= 2)         // string[] (validated)
      .transform((val) => val.length);          // string[] -> number

    const result: number = schema.parse(' a, b, c ');
  });
});
