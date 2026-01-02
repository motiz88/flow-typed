declare module 'zod' {
  /*
    Zod v4.x.x Flow Type Definitions

    Output = The type that comes out after parsing (validated type)
    Input = The type that goes in before parsing (typically same as Output for primitives)

    This definition uses Flow's modern type features:
    - Mapped types: {[K in keyof T]: ...}
    - Indexed access types: T[K]
    - Conditional types
  */

  // ============================================================================
  // Type Inference Utilities
  // ============================================================================

  declare export type output<T: ZodType<mixed, mixed>> = T['_output'];
  declare export type input<T: ZodType<mixed, mixed>> = T['_input'];
  declare export type infer<T: ZodType<mixed, mixed>> = output<T>;

  // ============================================================================
  // Parse Result Types
  // ============================================================================

  declare export type SafeParseSuccess<T> = Readonly<{
    success: true,
    data: T,
  }>;

  declare export type SafeParseError = Readonly<{
    success: false,
    error: ZodError,
  }>;

  declare export type SafeParseResult<T> =
    | SafeParseSuccess<T>
    | SafeParseError;

  // ============================================================================
  // Error Types
  // ============================================================================

  declare export type ZodIssueCode =
    | 'invalid_type'
    | 'invalid_literal'
    | 'custom'
    | 'invalid_union'
    | 'invalid_union_discriminator'
    | 'invalid_enum_value'
    | 'unrecognized_keys'
    | 'invalid_arguments'
    | 'invalid_return_type'
    | 'invalid_date'
    | 'invalid_string'
    | 'too_small'
    | 'too_big'
    | 'not_multiple_of'
    | 'not_finite';

  declare export type ZodIssue = Readonly<{
    code: ZodIssueCode,
    path: $ReadOnlyArray<string | number>,
    message: string,
    fatal?: boolean,
  }>;

  declare export type ZodFormattedError<T> = Readonly<{
    _errors: $ReadOnlyArray<string>,
  }>;

  declare export type FlattenedError<T> = Readonly<{
    formErrors: $ReadOnlyArray<T>,
    fieldErrors: Readonly<{ [key: string]: $ReadOnlyArray<T>, ... }>,
  }>;

  declare export type RefinementCtx = {
    addIssue(issue: ZodIssue): void,
    +path: $ReadOnlyArray<string | number>,
  };

  declare export class ZodError extends Error {
    issues: $ReadOnlyArray<ZodIssue>;
    errors: $ReadOnlyArray<ZodIssue>;
    name: 'ZodError';
    format<T>(): ZodFormattedError<T>;
    flatten<T>(mapperFn?: (issue: ZodIssue) => T): FlattenedError<T>;
    isEmpty: boolean;
    addIssue(issue: ZodIssue): void;
    addIssues(issues: $ReadOnlyArray<ZodIssue>): void;
    static create(issues: $ReadOnlyArray<ZodIssue>): ZodError;
  }

  // ============================================================================
  // Base ZodType Class
  // ============================================================================

  declare export class ZodType<+Output, +Input = Output> {
    _output: Output;
    _input: Input;

    // Parsing methods
    parse(data: mixed): Output;
    safeParse(data: mixed): SafeParseResult<Output>;
    parseAsync(data: mixed): Promise<Output>;
    safeParseAsync(data: mixed): Promise<SafeParseResult<Output>>;

    // Modifiers (return new schema types)
    optional(): ZodOptional<this>;
    nullable(): ZodNullable<this>;
    nullish(): ZodNullable<ZodOptional<this>>;
    default(defaultValue: Output | (() => Output)): ZodDefault<this>;
    catch(
      catchValue:
        | Output
        | ((ctx: Readonly<{ error: ZodError, input: mixed }>) => Output),
    ): ZodCatch<this>;
    transform<NewOutput>(
      fn: (arg: Output, ctx: RefinementCtx) => NewOutput,
    ): ZodEffects<this, NewOutput, Input>;
    refine(
      check: (arg: Output) => mixed,
      message?:
        | string
        | Readonly<{ message?: string, path?: $ReadOnlyArray<string | number> }>,
    ): ZodEffects<this, Output, Input>;
    superRefine(
      refinement: (arg: Output, ctx: RefinementCtx) => void,
    ): ZodEffects<this, Output, Input>;
    pipe<T: ZodType<mixed, mixed>>(schema: T): ZodPipeline<this, T>;
    readonly(): ZodReadonly<this>;
    brand<B: string>(): ZodBranded<this, B>;

    // Logical operators
    and<T: ZodType<mixed, mixed>>(schema: T): ZodIntersection<this, T>;
    or<T: ZodType<mixed, mixed>>(schema: T): ZodUnion<[this, T]>;

    // Introspection
    isOptional(): boolean;
    isNullable(): boolean;
    describe(description: string): this;
  }

  // ============================================================================
  // Primitive Schema Types
  // ============================================================================

  declare export class ZodString extends ZodType<string, string> {
    min(length: number, message?: string): ZodString;
    max(length: number, message?: string): ZodString;
    length(length: number, message?: string): ZodString;
    email(message?: string): ZodString;
    url(message?: string): ZodString;
    uuid(message?: string): ZodString;
    cuid(message?: string): ZodString;
    cuid2(message?: string): ZodString;
    ulid(message?: string): ZodString;
    regex(regex: RegExp, message?: string): ZodString;
    includes(
      value: string,
      options?: Readonly<{ message?: string, position?: number }>,
    ): ZodString;
    startsWith(value: string, message?: string): ZodString;
    endsWith(value: string, message?: string): ZodString;
    datetime(options?: Readonly<{ offset?: boolean, precision?: number }>): ZodString;
    ip(options?: Readonly<{ version?: 'v4' | 'v6' }>): ZodString;
    trim(): ZodString;
    toLowerCase(): ZodString;
    toUpperCase(): ZodString;
    nonempty(message?: string): ZodString;
    // Normalization transform
    normalize(form?: 'NFC' | 'NFD' | 'NFKC' | 'NFKD'): ZodString;
  }
  declare export function string(): ZodString;

  declare export class ZodNumber extends ZodType<number, number> {
    gt(value: number, message?: string): ZodNumber;
    gte(value: number, message?: string): ZodNumber;
    min(value: number, message?: string): ZodNumber;
    lt(value: number, message?: string): ZodNumber;
    lte(value: number, message?: string): ZodNumber;
    max(value: number, message?: string): ZodNumber;
    int(message?: string): ZodNumber;
    positive(message?: string): ZodNumber;
    nonnegative(message?: string): ZodNumber;
    negative(message?: string): ZodNumber;
    nonpositive(message?: string): ZodNumber;
    multipleOf(value: number, message?: string): ZodNumber;
    finite(message?: string): ZodNumber;
    safe(message?: string): ZodNumber;
  }
  declare export function number(): ZodNumber;

  declare export class ZodBoolean extends ZodType<boolean, boolean> {}
  declare export function boolean(): ZodBoolean;

  declare export class ZodBigInt extends ZodType<bigint, bigint> {
    gt(value: bigint, message?: string): ZodBigInt;
    gte(value: bigint, message?: string): ZodBigInt;
    min(value: bigint, message?: string): ZodBigInt;
    lt(value: bigint, message?: string): ZodBigInt;
    lte(value: bigint, message?: string): ZodBigInt;
    max(value: bigint, message?: string): ZodBigInt;
    positive(message?: string): ZodBigInt;
    nonnegative(message?: string): ZodBigInt;
    negative(message?: string): ZodBigInt;
    nonpositive(message?: string): ZodBigInt;
    multipleOf(value: bigint, message?: string): ZodBigInt;
  }
  declare export function bigint(): ZodBigInt;

  declare export class ZodDate extends ZodType<Date, Date> {
    min(minDate: Date, message?: string): ZodDate;
    max(maxDate: Date, message?: string): ZodDate;
  }
  declare export function date(): ZodDate;

  declare export class ZodSymbol extends ZodType<symbol, symbol> {}
  declare export function symbol(): ZodSymbol;

  declare export class ZodUndefined extends ZodType<void, void> {}
  declare function undefined_(): ZodUndefined;
  declare export { undefined_ as undefined };

  declare export class ZodNull extends ZodType<null, null> {}
  declare function null_(): ZodNull;
  declare export { null_ as null };

  declare export class ZodVoid extends ZodType<void, void> {}
  declare function void_(): ZodVoid;
  declare export { void_ as void };

  declare export class ZodAny extends ZodType<any, any> {}
  declare function any_(): ZodAny;
  declare export { any_ as any };

  declare export class ZodUnknown extends ZodType<mixed, mixed> {}
  declare function unknown_(): ZodUnknown;
  declare export { unknown_ as unknown };

  declare export class ZodNever extends ZodType<empty, empty> {}
  declare function never_(): ZodNever;
  declare export { never_ as never };

  declare export class ZodNaN extends ZodType<number, number> {}
  declare export function nan(): ZodNaN;

  // ============================================================================
  // Composite Schema Types
  // ============================================================================

  declare export type ZodRawShape = Readonly<{ [key: string]: ZodType<mixed, mixed>, ... }>;

  // Mapped type for extracting output types from object shape
  declare export type ObjectOutput<T: ZodRawShape> = Readonly<{
    [K in keyof T]: T[K]['_output']
  }>;

  // Mapped type for extracting input types from object shape
  declare export type ObjectInput<T: ZodRawShape> = Readonly<{
    [K in keyof T]: T[K]['_input']
  }>;

  declare export class ZodObject<T: ZodRawShape> extends ZodType<
    ObjectOutput<T>,
    ObjectInput<T>,
  > {
    +shape: T;
    keyof(): ZodEnum<$ReadOnlyArray<$Keys<T>>>;
    extend<U: ZodRawShape>(shape: U): ZodObject<{ ...T, ...U }>;
    merge<U: ZodRawShape>(other: ZodObject<U>): ZodObject<{ ...T, ...U }>;
    pick<K: $Keys<T>>(keys: { +[K]: true, ... }): ZodObject<Pick<T, K>>;
    omit<K: $Keys<T>>(keys: { +[K]: true, ... }): ZodObject<Omit<T, K>>;
    partial(): ZodObject<{[K in keyof T]: ZodOptional<T[K]>}>;
    deepPartial(): ZodObject<T>;
    required(): ZodObject<{[K in keyof T]: ZodNonOptional<T[K]>}>;
    passthrough(): ZodObject<T>;
    strict(): ZodObject<T>;
    strip(): ZodObject<T>;
    catchall<C: ZodType<mixed, mixed>>(type: C): ZodObject<T>;
  }
  declare export function object<T: ZodRawShape>(shape: T): ZodObject<T>;

  // Helper for required() - unwrap optional
  declare type ZodNonOptional<T: ZodType<mixed, mixed>> = T;

  declare export class ZodArray<T: ZodType<mixed, mixed>> extends ZodType<
    Array<T['_output']>,
    Array<T['_input']>,
  > {
    +element: T;
    min(minLength: number, message?: string): ZodArray<T>;
    max(maxLength: number, message?: string): ZodArray<T>;
    length(len: number, message?: string): ZodArray<T>;
    nonempty(message?: string): ZodArray<T>;
  }
  declare export function array<T: ZodType<mixed, mixed>>(
    schema: T,
  ): ZodArray<T>;

  // Mapped tuple type for extracting output types
  declare export type TupleOutput<T: $ReadOnlyArray<ZodType<mixed, mixed>>> = {
    [K in keyof T]: T[K]['_output']
  };

  // Mapped tuple type for extracting input types
  declare export type TupleInput<T: $ReadOnlyArray<ZodType<mixed, mixed>>> = {
    [K in keyof T]: T[K]['_input']
  };

  declare export class ZodTuple<
    T: $ReadOnlyArray<ZodType<mixed, mixed>>,
    Rest: ZodType<mixed, mixed> | null = null,
  > extends ZodType<TupleOutput<T>, TupleInput<T>> {
    +items: T;
    rest<R: ZodType<mixed, mixed>>(rest: R): ZodTuple<T, R>;
  }
  declare export function tuple<T: $ReadOnlyArray<ZodType<mixed, mixed>>>(
    items: T,
  ): ZodTuple<T, null>;

  declare export class ZodRecord<
    K: ZodType<string, string>,
    V: ZodType<mixed, mixed>,
  > extends ZodType<
    { +[key: string]: V['_output'], ... },
    { +[key: string]: V['_input'], ... },
  > {
    +keySchema: K;
    +valueSchema: V;
  }
  declare export function record<V: ZodType<mixed, mixed>>(
    valueSchema: V,
  ): ZodRecord<ZodString, V>;
  declare export function record<
    K: ZodType<string, string>,
    V: ZodType<mixed, mixed>,
  >(keySchema: K, valueSchema: V): ZodRecord<K, V>;

  declare export class ZodMap<
    K: ZodType<mixed, mixed>,
    V: ZodType<mixed, mixed>,
  > extends ZodType<Map<K['_output'], V['_output']>, Map<K['_input'], V['_input']>> {}
  declare export function map<
    K: ZodType<mixed, mixed>,
    V: ZodType<mixed, mixed>,
  >(keySchema: K, valueSchema: V): ZodMap<K, V>;

  declare export class ZodSet<T: ZodType<mixed, mixed>> extends ZodType<
    Set<T['_output']>,
    Set<T['_input']>,
  > {
    min(minSize: number, message?: string): ZodSet<T>;
    max(maxSize: number, message?: string): ZodSet<T>;
    size(size: number, message?: string): ZodSet<T>;
    nonempty(message?: string): ZodSet<T>;
  }
  declare export function set<T: ZodType<mixed, mixed>>(
    schema: T,
  ): ZodSet<T>;

  // ============================================================================
  // Union & Intersection Types
  // ============================================================================

  // Union output type: extract output from array element type
  declare export type UnionOutput<T: $ReadOnlyArray<ZodType<mixed, mixed>>> =
    T[number]['_output'];

  declare export class ZodUnion<
    T: $ReadOnlyArray<ZodType<mixed, mixed>>,
  > extends ZodType<UnionOutput<T>, UnionOutput<T>> {
    +options: T;
  }
  declare export function union<T: $ReadOnlyArray<ZodType<mixed, mixed>>>(
    options: T,
  ): ZodUnion<T>;

  declare export class ZodDiscriminatedUnion<
    Discriminator: string,
    Options: $ReadOnlyArray<ZodObject<{ ... }>>,
  > extends ZodType<UnionOutput<Options>, UnionOutput<Options>> {
    +discriminator: Discriminator;
    +options: Options;
  }
  declare export function discriminatedUnion<
    Discriminator: string,
    Options: $ReadOnlyArray<ZodObject<{ ... }>>,
  >(
    discriminator: Discriminator,
    options: Options,
  ): ZodDiscriminatedUnion<Discriminator, Options>;

  declare export class ZodIntersection<
    A: ZodType<mixed, mixed>,
    B: ZodType<mixed, mixed>,
  > extends ZodType<A['_output'] & B['_output'], A['_input'] & B['_input']> {
    +left: A;
    +right: B;
  }
  declare export function intersection<
    A: ZodType<mixed, mixed>,
    B: ZodType<mixed, mixed>,
  >(left: A, right: B): ZodIntersection<A, B>;

  // ============================================================================
  // Modifier Types
  // ============================================================================

  declare export class ZodOptional<
    T: ZodType<mixed, mixed>,
  > extends ZodType<T['_output'] | void, T['_input'] | void> {
    unwrap(): T;
  }
  declare export function optional<T: ZodType<mixed, mixed>>(
    schema: T,
  ): ZodOptional<T>;

  declare export class ZodNullable<
    T: ZodType<mixed, mixed>,
  > extends ZodType<T['_output'] | null, T['_input'] | null> {
    unwrap(): T;
  }
  declare export function nullable<T: ZodType<mixed, mixed>>(
    schema: T,
  ): ZodNullable<T>;

  declare export class ZodDefault<
    T: ZodType<mixed, mixed>,
  > extends ZodType<T['_output'], T['_input'] | void> {
    removeDefault(): T;
  }

  declare export class ZodCatch<T: ZodType<mixed, mixed>> extends ZodType<
    T['_output'],
    mixed,
  > {
    removeCatch(): T;
  }

  declare export class ZodReadonly<T: ZodType<mixed, mixed>> extends ZodType<
    Readonly<T['_output']>,
    T['_input'],
  > {}
  declare export function readonly<T: ZodType<mixed, mixed>>(
    schema: T,
  ): ZodReadonly<T>;

  // ============================================================================
  // Special Schema Types
  // ============================================================================

  declare export class ZodLiteral<
    T: string | number | boolean | null | void,
  > extends ZodType<T, T> {
    +value: T;
  }
  declare export function literal<T: string | number | boolean | null | void>(
    value: T,
  ): ZodLiteral<T>;

  declare export class ZodEnum<
    T: $ReadOnlyArray<string>,
  > extends ZodType<T[number], T[number]> {
    +options: T;
    +enum: { +[key: T[number]]: T[number], ... };
    extract<U: $ReadOnlyArray<T[number]>>(values: U): ZodEnum<U>;
    exclude<U: $ReadOnlyArray<T[number]>>(values: U): ZodEnum<T>;
  }
  declare function enum_<T: $ReadOnlyArray<string>>(values: T): ZodEnum<T>;
  declare export { enum_ as enum };

  declare export class ZodNativeEnum<
    T: { +[key: string]: string | number, ... },
  > extends ZodType<$Values<T>, $Values<T>> {
    +enum: T;
  }
  declare export function nativeEnum<
    T: { +[key: string]: string | number, ... },
  >(enumObj: T): ZodNativeEnum<T>;

  declare export class ZodPromise<T: ZodType<mixed, mixed>> extends ZodType<
    Promise<T['_output']>,
    Promise<T['_input']>,
  > {}
  declare export function promise<T: ZodType<mixed, mixed>>(
    schema: T,
  ): ZodPromise<T>;

  declare export class ZodFunction<
    Args: ZodTuple<$ReadOnlyArray<ZodType<mixed, mixed>>, mixed>,
    Returns: ZodType<mixed, mixed>,
  > extends ZodType<(...args: Args['_output']) => Returns['_output'], mixed> {
    args<T: $ReadOnlyArray<ZodType<mixed, mixed>>>(
      ...items: T
    ): ZodFunction<ZodTuple<T, null>, Returns>;
    returns<T: ZodType<mixed, mixed>>(returnType: T): ZodFunction<Args, T>;
    implement<F: (...args: Args['_output']) => Returns['_output']>(fn: F): F;
  }
  declare function function_(): ZodFunction<
    ZodTuple<$ReadOnlyArray<ZodUnknown>, ZodUnknown>,
    ZodUnknown,
  >;
  declare export { function_ as function };

  declare export class ZodLazy<T: ZodType<mixed, mixed>> extends ZodType<
    T['_output'],
    T['_input'],
  > {
    +schema: T;
  }
  declare export function lazy<T: ZodType<mixed, mixed>>(
    getter: () => T,
  ): ZodLazy<T>;

  declare export class ZodEffects<
    T: ZodType<mixed, mixed>,
    Output,
    Input = T['_input'],
  > extends ZodType<Output, Input> {
    innerType(): T;
  }
  declare export function preprocess<T: ZodType<mixed, mixed>>(
    preprocessor: (arg: mixed) => mixed,
    schema: T,
  ): ZodEffects<T, T['_output'], mixed>;

  declare export class ZodPipeline<
    A: ZodType<mixed, mixed>,
    B: ZodType<mixed, mixed>,
  > extends ZodType<B['_output'], A['_input']> {}
  declare export function pipe<
    A: ZodType<mixed, mixed>,
    B: ZodType<mixed, mixed>,
  >(a: A, b: B): ZodPipeline<A, B>;

  declare export opaque type Brand<+B>: { +__brand: B, ... };
  declare export class ZodBranded<
    T: ZodType<mixed, mixed>,
    B: string,
  > extends ZodType<T['_output'] & Brand<B>, T['_input']> {}

  // ============================================================================
  // Template Literal Types
  // ============================================================================

  // Template literal parts can be string literals or Zod schemas
  declare export type TemplateLiteralPart =
    | string
    | ZodString
    | ZodNumber
    | ZodBoolean
    | ZodBigInt
    | ZodLiteral<string | number | boolean>
    | ZodEnum<$ReadOnlyArray<string>>
    | ZodUnion<$ReadOnlyArray<ZodType<mixed, mixed>>>;

  // Template literal output types using Flow's StringPrefix/StringSuffix
  // For z.templateLiteral(["prefix-", z.string()]) → StringPrefix<"prefix-">
  // For z.templateLiteral([z.string(), "-suffix"]) → StringSuffix<"-suffix">
  // For z.templateLiteral(["pre-", z.string(), "-suf"]) → StringPrefix<"pre-"> & StringSuffix<"-suf">
  //
  // Note: Flow's StringPrefix/StringSuffix available since v0.242
  // When the template has only a prefix literal, output is StringPrefix<Prefix>
  // When only suffix literal, output is StringSuffix<Suffix>
  // When both, output is the intersection
  // For more complex patterns, falls back to string

  // Single-part template literals with string prefix
  declare export class ZodTemplateLiteralPrefix<
    Prefix: string,
  > extends ZodType<StringPrefix<Prefix>, string> {
    +parts: $ReadOnlyArray<TemplateLiteralPart>;
  }

  // Single-part template literals with string suffix
  declare export class ZodTemplateLiteralSuffix<
    Suffix: string,
  > extends ZodType<StringSuffix<Suffix>, string> {
    +parts: $ReadOnlyArray<TemplateLiteralPart>;
  }

  // Template literals with both prefix and suffix
  declare export class ZodTemplateLiteralPrefixSuffix<
    Prefix: string,
    Suffix: string,
  > extends ZodType<StringPrefix<Prefix> & StringSuffix<Suffix>, string> {
    +parts: $ReadOnlyArray<TemplateLiteralPart>;
  }

  // General template literal (for complex patterns)
  declare export class ZodTemplateLiteral<
    Parts: $ReadOnlyArray<TemplateLiteralPart>,
  > extends ZodType<string, string> {
    +parts: Parts;
  }

  // Overloaded templateLiteral function for common patterns
  // Pattern: ["prefix", schema] → StringPrefix<"prefix">
  declare export function templateLiteral<Prefix: string>(
    parts: [Prefix, ZodType<mixed, mixed>],
  ): ZodTemplateLiteralPrefix<Prefix>;

  // Pattern: [schema, "suffix"] → StringSuffix<"suffix">
  declare export function templateLiteral<Suffix: string>(
    parts: [ZodType<mixed, mixed>, Suffix],
  ): ZodTemplateLiteralSuffix<Suffix>;

  // Pattern: ["prefix", schema, "suffix"] → StringPrefix & StringSuffix
  declare export function templateLiteral<Prefix: string, Suffix: string>(
    parts: [Prefix, ZodType<mixed, mixed>, Suffix],
  ): ZodTemplateLiteralPrefixSuffix<Prefix, Suffix>;

  // General pattern (fallback to string)
  declare export function templateLiteral<
    Parts: $ReadOnlyArray<TemplateLiteralPart>,
  >(parts: Parts): ZodTemplateLiteral<Parts>;

  // ============================================================================
  // Integer Schemas
  // ============================================================================

  // z.int() - 32-bit signed integer
  declare export class ZodInt extends ZodType<number, number> {
    gt(value: number, message?: string): ZodInt;
    gte(value: number, message?: string): ZodInt;
    min(value: number, message?: string): ZodInt;
    lt(value: number, message?: string): ZodInt;
    lte(value: number, message?: string): ZodInt;
    max(value: number, message?: string): ZodInt;
    positive(message?: string): ZodInt;
    nonnegative(message?: string): ZodInt;
    negative(message?: string): ZodInt;
    nonpositive(message?: string): ZodInt;
    safe(message?: string): ZodInt;
  }
  declare export function int(): ZodInt;
  declare export function int32(): ZodInt;

  // ============================================================================
  // File Schema
  // ============================================================================

  declare export class ZodFile extends ZodType<File, File> {
    type(mimeType: string | $ReadOnlyArray<string>, message?: string): ZodFile;
    min(minSize: number, message?: string): ZodFile;
    max(maxSize: number, message?: string): ZodFile;
  }
  declare export function file(): ZodFile;

  // ============================================================================
  // JSON Schema
  // ============================================================================

  // JSON-encodable primitive
  declare export type JsonPrimitive = string | number | boolean | null;
  declare export type JsonValue =
    | JsonPrimitive
    | $ReadOnlyArray<JsonValue>
    | { +[key: string]: JsonValue, ... };

  declare export class ZodJson extends ZodType<JsonValue, JsonValue> {}
  declare export function json(): ZodJson;

  // ============================================================================
  // Coercion & Utilities
  // ============================================================================

  declare export var coerce: Readonly<{
    string: () => ZodString,
    number: () => ZodNumber,
    boolean: () => ZodBoolean,
    bigint: () => ZodBigInt,
    date: () => ZodDate,
  }>;

  declare export function custom<T>(
    check?: (data: mixed) => boolean,
    params?:
      | string
      | Readonly<{
          message?: string,
          path?: $ReadOnlyArray<string | number>,
          fatal?: boolean,
        }>,
  ): ZodType<T, mixed>;

  declare function instanceof_<T>(cls: Class<T>): ZodType<T, mixed>;
  declare export { instanceof_ as instanceof };

  // ============================================================================
  // Standalone String Format Functions
  // ============================================================================

  // These return ZodString with built-in validation
  declare export function email(): ZodString;
  declare export function uuid(): ZodString;
  declare export function uuidv4(): ZodString;
  declare export function uuidv6(): ZodString;
  declare export function uuidv7(): ZodString;
  declare export function url(): ZodString;
  declare export function httpUrl(): ZodString;
  declare export function emoji(): ZodString;
  declare export function guid(): ZodString;
  declare export function cuid(): ZodString;
  declare export function cuid2(): ZodString;
  declare export function ulid(): ZodString;
  declare export function nanoid(): ZodString;
  declare export function ipv4(): ZodString;
  declare export function ipv6(): ZodString;
  declare export function ip(): ZodString;
  declare export function cidrv4(): ZodString;
  declare export function cidrv6(): ZodString;
  declare export function cidr(): ZodString;
  declare export function hostname(): ZodString;
  declare export function base64(): ZodString;
  declare export function base64url(): ZodString;
  declare export function hex(): ZodString;
  declare export function mac(): ZodString;
  declare export function jwt(): ZodString;
  declare export function hash(algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512'): ZodString;

  // ============================================================================
  // Object Variants
  // ============================================================================

  // strictObject: extra keys cause parse errors
  declare export function strictObject<T: ZodRawShape>(shape: T): ZodObject<T>;

  // looseObject: extra keys preserved in output
  declare export function looseObject<T: ZodRawShape>(shape: T): ZodObject<T>;

  // ============================================================================
  // Record Variants
  // ============================================================================

  // partialRecord: values are optional
  declare export class ZodPartialRecord<
    K: ZodType<string, string>,
    V: ZodType<mixed, mixed>,
  > extends ZodType<
    { +[key: string]: V['_output'] | void, ... },
    { +[key: string]: V['_input'] | void, ... },
  > {}
  declare export function partialRecord<V: ZodType<mixed, mixed>>(
    valueSchema: V,
  ): ZodPartialRecord<ZodString, V>;
  declare export function partialRecord<
    K: ZodType<string, string>,
    V: ZodType<mixed, mixed>,
  >(keySchema: K, valueSchema: V): ZodPartialRecord<K, V>;

  // looseRecord: preserves extra keys
  declare export function looseRecord<V: ZodType<mixed, mixed>>(
    valueSchema: V,
  ): ZodRecord<ZodString, V>;
  declare export function looseRecord<
    K: ZodType<string, string>,
    V: ZodType<mixed, mixed>,
  >(keySchema: K, valueSchema: V): ZodRecord<K, V>;

  // ============================================================================
  // Exclusive Union (XOR)
  // ============================================================================

  // z.xor - exactly one of the schemas must match
  declare export function xor<
    A: ZodType<mixed, mixed>,
    B: ZodType<mixed, mixed>,
  >(a: A, b: B): ZodType<A['_output'] | B['_output'], A['_input'] | B['_input']>;

  // ============================================================================
  // String Boolean Coercion
  // ============================================================================

  // z.stringbool() - coerces string representations to boolean
  declare export class ZodStringBool extends ZodType<boolean, string> {}
  declare export function stringbool(options?: Readonly<{
    truthy?: $ReadOnlyArray<string>,
    falsy?: $ReadOnlyArray<string>,
  }>): ZodStringBool;

  // ============================================================================
  // Nullish Helper
  // ============================================================================

  // z.nullish() returns a schema that accepts null or undefined
  declare export function nullish(): ZodNullable<ZodOptional<ZodUnknown>>;

  // ============================================================================
  // ISO String Schemas
  // ============================================================================

  // z.iso namespace for ISO 8601 formats
  declare export var iso: Readonly<{
    date: () => ZodString,
    time: (options?: Readonly<{ precision?: number }>) => ZodString,
    datetime: (options?: Readonly<{ offset?: boolean, precision?: number, local?: boolean }>) => ZodString,
    duration: () => ZodString,
  }>;

  // ============================================================================
  // Default z Namespace Export
  // ============================================================================

  declare export var z: Readonly<{
    // Primitives
    +string: typeof string,
    +number: typeof number,
    +boolean: typeof boolean,
    +bigint: typeof bigint,
    +date: typeof date,
    +symbol: typeof symbol,
    +undefined: typeof undefined_,
    +null: typeof null_,
    +void: typeof void_,
    +any: typeof any_,
    +unknown: typeof unknown_,
    +never: typeof never_,
    +nan: typeof nan,

    // Integer schemas
    +int: typeof int,
    +int32: typeof int32,

    // File & JSON
    +file: typeof file,
    +json: typeof json,

    // Composite
    +array: typeof array,
    +object: typeof object,
    +strictObject: typeof strictObject,
    +looseObject: typeof looseObject,
    +tuple: typeof tuple,
    +record: typeof record,
    +partialRecord: typeof partialRecord,
    +looseRecord: typeof looseRecord,
    +map: typeof map,
    +set: typeof set,

    // Unions
    +union: typeof union,
    +discriminatedUnion: typeof discriminatedUnion,
    +intersection: typeof intersection,
    +xor: typeof xor,

    // Special
    +literal: typeof literal,
    +enum: typeof enum_,
    +nativeEnum: typeof nativeEnum,
    +promise: typeof promise,
    +function: typeof function_,
    +lazy: typeof lazy,
    +preprocess: typeof preprocess,
    +pipe: typeof pipe,
    +custom: typeof custom,
    +instanceof: typeof instanceof_,
    +templateLiteral: typeof templateLiteral,

    // Modifiers
    +optional: typeof optional,
    +nullable: typeof nullable,
    +nullish: typeof nullish,
    +readonly: typeof readonly,

    // Coercion
    +coerce: typeof coerce,
    +stringbool: typeof stringbool,

    // Standalone string format functions
    +email: typeof email,
    +uuid: typeof uuid,
    +uuidv4: typeof uuidv4,
    +uuidv6: typeof uuidv6,
    +uuidv7: typeof uuidv7,
    +url: typeof url,
    +httpUrl: typeof httpUrl,
    +emoji: typeof emoji,
    +guid: typeof guid,
    +cuid: typeof cuid,
    +cuid2: typeof cuid2,
    +ulid: typeof ulid,
    +nanoid: typeof nanoid,
    +ipv4: typeof ipv4,
    +ipv6: typeof ipv6,
    +ip: typeof ip,
    +cidrv4: typeof cidrv4,
    +cidrv6: typeof cidrv6,
    +cidr: typeof cidr,
    +hostname: typeof hostname,
    +base64: typeof base64,
    +base64url: typeof base64url,
    +hex: typeof hex,
    +mac: typeof mac,
    +jwt: typeof jwt,
    +hash: typeof hash,

    // ISO string schemas
    +iso: typeof iso,

    // Classes
    +ZodType: typeof ZodType,
    +ZodError: typeof ZodError,

    // Schemas (for direct access)
    +ZodString: typeof ZodString,
    +ZodNumber: typeof ZodNumber,
    +ZodBoolean: typeof ZodBoolean,
    +ZodBigInt: typeof ZodBigInt,
    +ZodDate: typeof ZodDate,
    +ZodSymbol: typeof ZodSymbol,
    +ZodUndefined: typeof ZodUndefined,
    +ZodNull: typeof ZodNull,
    +ZodVoid: typeof ZodVoid,
    +ZodAny: typeof ZodAny,
    +ZodUnknown: typeof ZodUnknown,
    +ZodNever: typeof ZodNever,
    +ZodNaN: typeof ZodNaN,
    +ZodObject: typeof ZodObject,
    +ZodArray: typeof ZodArray,
    +ZodTuple: typeof ZodTuple,
    +ZodRecord: typeof ZodRecord,
    +ZodMap: typeof ZodMap,
    +ZodSet: typeof ZodSet,
    +ZodUnion: typeof ZodUnion,
    +ZodDiscriminatedUnion: typeof ZodDiscriminatedUnion,
    +ZodIntersection: typeof ZodIntersection,
    +ZodOptional: typeof ZodOptional,
    +ZodNullable: typeof ZodNullable,
    +ZodDefault: typeof ZodDefault,
    +ZodCatch: typeof ZodCatch,
    +ZodReadonly: typeof ZodReadonly,
    +ZodLiteral: typeof ZodLiteral,
    +ZodEnum: typeof ZodEnum,
    +ZodNativeEnum: typeof ZodNativeEnum,
    +ZodPromise: typeof ZodPromise,
    +ZodFunction: typeof ZodFunction,
    +ZodLazy: typeof ZodLazy,
    +ZodEffects: typeof ZodEffects,
    +ZodPipeline: typeof ZodPipeline,
    +ZodBranded: typeof ZodBranded,
    +ZodTemplateLiteral: typeof ZodTemplateLiteral,
    +ZodInt: typeof ZodInt,
    +ZodFile: typeof ZodFile,
    +ZodJson: typeof ZodJson,
    +ZodStringBool: typeof ZodStringBool,
    ZodPartialRecord: typeof ZodPartialRecord,
  }>;

  declare export default typeof z;
}
