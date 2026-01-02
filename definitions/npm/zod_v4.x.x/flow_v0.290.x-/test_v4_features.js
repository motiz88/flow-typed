// @flow
import { describe, it } from 'flow-typed-test';
import { z } from 'zod';

describe('z.templateLiteral()', () => {
  it('should create template literal schema with prefix', () => {
    const schema = z.templateLiteral(['hello-', z.number()]);
    const result: StringPrefix<'hello-'> = schema.parse('hello-123');

    // $FlowExpectedError[incompatible-type] - result has StringPrefix type, not plain string
    const wrongString: 'random' = schema.parse('hello-123');
  });

  it('should create template literal schema with suffix', () => {
    const schema = z.templateLiteral([z.number(), '-suffix']);
    const result: StringSuffix<'-suffix'> = schema.parse('123-suffix');

    // $FlowExpectedError[incompatible-type] - result has StringSuffix type, not plain string
    const wrongString: 'random' = schema.parse('123-suffix');
  });

  it('should create template literal schema with prefix and suffix', () => {
    const schema = z.templateLiteral(['pre-', z.string(), '-suf']);
    const result: StringPrefix<'pre-'> & StringSuffix<'-suf'> = schema.parse('pre-test-suf');
  });

  it('should work with various interpolation types', () => {
    const s1 = z.templateLiteral(['prefix-', z.string()]);
    const s2 = z.templateLiteral([z.number(), '-suffix']);
    const s3 = z.templateLiteral(['a', z.boolean(), 'b']);
    const s4 = z.templateLiteral([z.enum(['foo', 'bar'])]);
    const s5 = z.templateLiteral([z.literal('exact')]);
  });

  it('should fall back to string for complex patterns', () => {
    // More than 3 parts - falls back to general ZodTemplateLiteral with string output
    const schema = z.templateLiteral(['a', z.string(), 'b', z.number()]);
    const result: string = schema.parse('aXb123');
  });
});

describe('z.int() and z.int32()', () => {
  it('should infer number type', () => {
    const intSchema = z.int();
    const result: number = intSchema.parse(42);

    // $FlowExpectedError[incompatible-type] - result is number, not string
    const wrong: string = intSchema.parse(42);
  });

  it('should support validation methods', () => {
    const n1: number = z.int().gt(0).parse(1);
    const n2: number = z.int().gte(0).parse(0);
    const n3: number = z.int().lt(100).parse(50);
    const n4: number = z.int().lte(100).parse(100);
    const n5: number = z.int().min(0).parse(0);
    const n6: number = z.int().max(100).parse(100);
    const n7: number = z.int().positive().parse(1);
    const n8: number = z.int().negative().parse(-1);
    const n9: number = z.int().nonnegative().parse(0);
    const n10: number = z.int().nonpositive().parse(0);
    const n11: number = z.int().safe().parse(42);
  });

  it('z.int32() should also work', () => {
    const schema = z.int32();
    const result: number = schema.parse(42);
  });
});

describe('z.file()', () => {
  it('should infer File type', () => {
    const schema = z.file();
    const result: File = schema.parse(new File([''], 'test.txt'));

    // $FlowExpectedError[incompatible-type] - result is File, not string
    const wrong: string = schema.parse(new File([''], 'test.txt'));
  });

  it('should support validation methods', () => {
    z.file().type('image/png');
    z.file().type(['image/png', 'image/jpeg']);
    z.file().min(100);
    z.file().max(1000000);
  });
});

describe('z.json()', () => {
  it('should accept JSON-encodable values', () => {
    const schema = z.json();

    // All of these should be valid JSON values
    schema.parse(null);
    schema.parse('string');
    schema.parse(123);
    schema.parse(true);
    schema.parse({ key: 'value' });
    schema.parse([1, 2, 3]);
  });
});

describe('z.stringbool()', () => {
  it('should infer boolean output from string input', () => {
    const schema = z.stringbool();
    const result: boolean = schema.parse('true');

    // $FlowExpectedError[incompatible-type] - result is boolean, not string
    const wrong: string = schema.parse('true');
  });

  it('should support custom truthy/falsy options', () => {
    const schema = z.stringbool({
      truthy: ['yes', 'on', '1'],
      falsy: ['no', 'off', '0'],
    });
    const result: boolean = schema.parse('yes');
  });
});

describe('z.xor()', () => {
  it('should create exclusive union', () => {
    const a = z.object({ type: z.literal('a'), aValue: z.string() });
    const b = z.object({ type: z.literal('b'), bValue: z.number() });

    const schema = z.xor(a, b);
    const result = schema.parse({ type: 'a', aValue: 'test' });
  });
});

describe('z.strictObject() and z.looseObject()', () => {
  it('z.strictObject() should work like object with strict mode', () => {
    const schema = z.strictObject({ name: z.string() });
    const result = schema.parse({ name: 'test' });
    const name: string = result.name;
  });

  it('z.looseObject() should preserve extra keys', () => {
    const schema = z.looseObject({ name: z.string() });
    const result = schema.parse({ name: 'test', extra: true });
    const name: string = result.name;
  });
});

describe('z.partialRecord() and z.looseRecord()', () => {
  it('z.partialRecord() should have optional values', () => {
    const schema = z.partialRecord(z.number());
    const result = schema.parse({ a: 1, b: undefined });

    // Values can be undefined
    const val: number | void = result['a'];
  });

  it('z.looseRecord() should work like record', () => {
    const schema = z.looseRecord(z.number());
    const result = schema.parse({ a: 1, b: 2 });
  });
});

describe('z.iso namespace', () => {
  it('z.iso.date() should validate ISO date strings', () => {
    const schema = z.iso.date();
    const result: string = schema.parse('2024-01-15');

    // $FlowExpectedError[incompatible-type] - result is string, not Date
    const wrong: Date = schema.parse('2024-01-15');
  });

  it('z.iso.time() should validate ISO time strings', () => {
    const schema = z.iso.time();
    const result: string = schema.parse('12:30:00');
  });

  it('z.iso.time() should accept precision option', () => {
    const schema = z.iso.time({ precision: 3 });
    const result: string = schema.parse('12:30:00.123');
  });

  it('z.iso.datetime() should validate ISO datetime strings', () => {
    const schema = z.iso.datetime();
    const result: string = schema.parse('2024-01-15T12:30:00Z');
  });

  it('z.iso.datetime() should accept options', () => {
    const s1 = z.iso.datetime({ offset: true });
    const s2 = z.iso.datetime({ precision: 3 });
    const s3 = z.iso.datetime({ local: true });
    const s4 = z.iso.datetime({ offset: true, precision: 3, local: false });
  });

  it('z.iso.duration() should validate ISO duration strings', () => {
    const schema = z.iso.duration();
    const result: string = schema.parse('P1D');
  });
});

describe('standalone string format functions', () => {
  it('z.email() should return ZodString', () => {
    const schema = z.email();
    const result: string = schema.parse('test@example.com');
  });

  it('z.uuid() and variants should work', () => {
    const s1: string = z.uuid().parse('123e4567-e89b-12d3-a456-426614174000');
    const s2: string = z.uuidv4().parse('123e4567-e89b-12d3-a456-426614174000');
    const s3: string = z.uuidv6().parse('123e4567-e89b-12d3-a456-426614174000');
    const s4: string = z.uuidv7().parse('123e4567-e89b-12d3-a456-426614174000');
    const s5: string = z.guid().parse('123e4567-e89b-12d3-a456-426614174000');
  });

  it('z.url() and z.httpUrl() should work', () => {
    const s1: string = z.url().parse('https://example.com');
    const s2: string = z.httpUrl().parse('https://example.com');
  });

  it('z.cuid(), z.cuid2(), z.ulid(), z.nanoid() should work', () => {
    const s1: string = z.cuid().parse('cjld2cjxh0000qzrmn831i7rn');
    const s2: string = z.cuid2().parse('tz4a98xxat96iws9zmbrgj3a');
    const s3: string = z.ulid().parse('01ARZ3NDEKTSV4RRFFQ69G5FAV');
    const s4: string = z.nanoid().parse('V1StGXR8_Z5jdHi6B-myT');
  });

  it('IP address formats should work', () => {
    const s1: string = z.ip().parse('192.168.1.1');
    const s2: string = z.ipv4().parse('192.168.1.1');
    const s3: string = z.ipv6().parse('::1');
    const s4: string = z.cidr().parse('192.168.1.0/24');
    const s5: string = z.cidrv4().parse('192.168.1.0/24');
    const s6: string = z.cidrv6().parse('::1/128');
  });

  it('other format functions should work', () => {
    const s1: string = z.emoji().parse('😀');
    const s2: string = z.hostname().parse('example.com');
    const s3: string = z.base64().parse('aGVsbG8=');
    const s4: string = z.base64url().parse('aGVsbG8');
    const s5: string = z.hex().parse('deadbeef');
    const s6: string = z.mac().parse('00:00:00:00:00:00');
    const s7: string = z.jwt().parse('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.test');
    const s8: string = z.hash('sha256').parse('abc123');
  });
});

describe('z.nullish()', () => {
  it('should accept null or undefined', () => {
    const schema = z.nullish();
    schema.parse(null);
    schema.parse(undefined);
  });
});
