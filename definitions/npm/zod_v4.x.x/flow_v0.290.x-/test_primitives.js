// @flow
import { describe, it } from 'flow-typed-test';
import { z } from 'zod';
import type { infer as Infer } from 'zod';

describe('string schema', () => {
  it('should infer string type', () => {
    const schema = z.string();
    const result: string = schema.parse('hello');

    // $FlowExpectedError[incompatible-type] - result is string, not number
    const wrong: number = schema.parse('hello');
  });

  it('should chain validation methods and maintain string type', () => {
    const schema = z.string().min(1).max(10).email();
    const result: string = schema.parse('test@example.com');

    // $FlowExpectedError[incompatible-type] - still string after validations
    const wrong: number = schema.parse('test@example.com');
  });

  it('should maintain string type through all string methods', () => {
    const s1: string = z.string().min(1).parse('a');
    const s2: string = z.string().max(10).parse('a');
    const s3: string = z.string().length(5).parse('hello');
    const s4: string = z.string().email().parse('a@b.com');
    const s5: string = z.string().url().parse('http://test.com');
    const s6: string = z.string().uuid().parse('123e4567-e89b-12d3-a456-426614174000');
    const s7: string = z.string().cuid().parse('clg...');
    const s8: string = z.string().cuid2().parse('clg...');
    const s9: string = z.string().ulid().parse('01ARZ3NDEKTSV4RRFFQ69G5FAV');
    const s10: string = z.string().regex(/test/).parse('test');
    const s11: string = z.string().includes('test').parse('test');
    const s12: string = z.string().startsWith('test').parse('test');
    const s13: string = z.string().endsWith('test').parse('test');
    const s14: string = z.string().datetime().parse('2021-01-01T00:00:00Z');
    const s15: string = z.string().ip().parse('192.168.1.1');
    const s16: string = z.string().trim().parse('  hello  ');
    const s17: string = z.string().toLowerCase().parse('HELLO');
    const s18: string = z.string().toUpperCase().parse('hello');
    const s19: string = z.string().nonempty().parse('a');
  });
});

describe('number schema', () => {
  it('should infer number type', () => {
    const schema = z.number();
    const result: number = schema.parse(42);

    // $FlowExpectedError[incompatible-type] - result is number, not string
    const wrong: string = schema.parse(42);
  });

  it('should chain validation methods and maintain number type', () => {
    const schema = z.number().int().positive().max(100);
    const result: number = schema.parse(50);

    // $FlowExpectedError[incompatible-type] - still number after validations
    const wrong: string = schema.parse(50);
  });

  it('should maintain number type through all number methods', () => {
    const n1: number = z.number().gt(0).parse(1);
    const n2: number = z.number().gte(0).parse(0);
    const n3: number = z.number().lt(100).parse(50);
    const n4: number = z.number().lte(100).parse(100);
    const n5: number = z.number().min(0).parse(0);
    const n6: number = z.number().max(100).parse(100);
    const n7: number = z.number().int().parse(42);
    const n8: number = z.number().positive().parse(1);
    const n9: number = z.number().negative().parse(-1);
    const n10: number = z.number().nonnegative().parse(0);
    const n11: number = z.number().nonpositive().parse(0);
    const n12: number = z.number().multipleOf(5).parse(10);
    const n13: number = z.number().finite().parse(42);
    const n14: number = z.number().safe().parse(42);
  });
});

describe('boolean schema', () => {
  it('should infer boolean type', () => {
    const schema = z.boolean();
    const result: boolean = schema.parse(true);

    // $FlowExpectedError[incompatible-type] - result is boolean, not string
    const wrong: string = schema.parse(true);
  });
});

describe('bigint schema', () => {
  it('should infer bigint type', () => {
    const schema = z.bigint();
    const result: bigint = schema.parse(BigInt(42));

    // $FlowExpectedError[incompatible-type] - result is bigint, not number
    const wrong: number = schema.parse(BigInt(42));
  });

  it('should maintain bigint type through all bigint methods', () => {
    const b1: bigint = z.bigint().gt(BigInt(0)).parse(BigInt(1));
    const b2: bigint = z.bigint().gte(BigInt(0)).parse(BigInt(0));
    const b3: bigint = z.bigint().lt(BigInt(100)).parse(BigInt(50));
    const b4: bigint = z.bigint().lte(BigInt(100)).parse(BigInt(100));
    const b5: bigint = z.bigint().min(BigInt(0)).parse(BigInt(0));
    const b6: bigint = z.bigint().max(BigInt(100)).parse(BigInt(100));
    const b7: bigint = z.bigint().positive().parse(BigInt(1));
    const b8: bigint = z.bigint().negative().parse(BigInt(-1));
    const b9: bigint = z.bigint().nonnegative().parse(BigInt(0));
    const b10: bigint = z.bigint().nonpositive().parse(BigInt(0));
    const b11: bigint = z.bigint().multipleOf(BigInt(5)).parse(BigInt(10));
  });
});

describe('date schema', () => {
  it('should infer Date type', () => {
    const schema = z.date();
    const result: Date = schema.parse(new Date());

    // $FlowExpectedError[incompatible-type] - result is Date, not string
    const wrong: string = schema.parse(new Date());
  });

  it('should maintain Date type through date methods', () => {
    const d1: Date = z.date().min(new Date('2020-01-01')).parse(new Date());
    const d2: Date = z.date().max(new Date('2025-01-01')).parse(new Date());
  });
});

describe('symbol schema', () => {
  it('should infer symbol type', () => {
    const schema = z.symbol();
    const result: symbol = schema.parse(Symbol('test'));

    // $FlowExpectedError[incompatible-type] - result is symbol, not string
    const wrong: string = schema.parse(Symbol('test'));
  });
});

describe('undefined schema', () => {
  it('should infer void type', () => {
    const schema = z.undefined();
    const result: void = schema.parse(undefined);

    // $FlowExpectedError[incompatible-type] - result is void, not string
    const wrong: string = schema.parse(undefined);
  });
});

describe('null schema', () => {
  it('should infer null type', () => {
    const schema = z.null();
    const result: null = schema.parse(null);

    // $FlowExpectedError[incompatible-type] - result is null, not string
    const wrong: string = schema.parse(null);
  });
});

describe('nan schema', () => {
  it('should infer number type', () => {
    const schema = z.nan();
    const result: number = schema.parse(NaN);

    // $FlowExpectedError[incompatible-type] - result is number, not string
    const wrong: string = schema.parse(NaN);
  });
});

describe('any schema', () => {
  it('should infer any type', () => {
    const schema = z.any();
    const result: any = schema.parse('anything');

    // any allows any assignment
    const str: string = result;
    const num: number = result;
  });
});

describe('unknown schema', () => {
  it('should infer mixed type', () => {
    const schema = z.unknown();
    const result: mixed = schema.parse('anything');
  });
});

describe('never schema', () => {
  it('should infer empty type', () => {
    const schema = z.never();
    // never schema always throws, so we just test it exists
  });
});

describe('void schema', () => {
  it('should infer void type', () => {
    const schema = z.void();
    const result: void = schema.parse(undefined);
  });
});
