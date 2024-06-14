import { applyDecorators } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { ArrayMaxSize, IsEnum, IsNotEmpty, IsObject, IsOptional, MaxLength, MinLength, ValidateNested } from 'class-validator'

import { ReturnTypeFunc } from '../interfaces/return-type-func'

export type FieldOptions = ApiPropertyOptions & {
  // prevents the IsEnum decorator from being added
  skipIsEnum?: boolean
  forceArray?: boolean
}

/**
 * Decorator for Fields that should be filterable through a [[FilterType]]
 *
 * @example
 *
 * In the following DTO `id`, `title` and `completed` are filterable.
 *
 * ```ts
 * import { FilterableField } from '@ptc-org/nestjs-query-graphql';
 * import { ObjectType, ID, GraphQLISODateTime, Field } from '@nestjs/graphql';
 *
 * @ObjectType('TodoItem')
 * export class TodoItemDTO {
 *   @FilterableField(() => ID)
 *   id!: string;
 *
 *   @FilterableField()
 *   title!: string;
 *
 *   @FilterableField()
 *   completed!: boolean;
 *
 *   @Field(() => GraphQLISODateTime)
 *   created!: Date;
 *
 *   @Field(() => GraphQLISODateTime)
 *   updated!: Date;
 * }
 * ```
 */
export function Field(): PropertyDecorator & MethodDecorator
export function Field(options: FieldOptions): PropertyDecorator & MethodDecorator
export function Field(returnTypeFunction?: ReturnTypeFunc, options?: FieldOptions): PropertyDecorator & MethodDecorator
export function Field(
  returnTypeFuncOrOptions?: ReturnTypeFunc | FieldOptions,
  maybeOptions?: FieldOptions
): MethodDecorator | PropertyDecorator {
  let returnTypeFunc: ReturnTypeFunc | undefined
  let advancedOptions: FieldOptions | undefined
  if (typeof returnTypeFuncOrOptions === 'function') {
    returnTypeFunc = returnTypeFuncOrOptions
    advancedOptions = maybeOptions
  } else if (typeof returnTypeFuncOrOptions === 'object') {
    advancedOptions = returnTypeFuncOrOptions
  } else if (typeof maybeOptions === 'object') {
    advancedOptions = maybeOptions
  }

  const returnedType = returnTypeFunc?.()
  const isArray = returnedType && Array.isArray(returnedType)
  const type = isArray ? returnedType[0] : returnedType

  const options = {
    required: !advancedOptions?.nullable && advancedOptions?.default === undefined,
    example: advancedOptions?.default,
    ...advancedOptions
  }

  // Remove non-valid options
  delete options.forceArray
  delete options.skipIsEnum

  const decorators = [
    Expose(),
    ApiProperty({
      type,
      isArray,
      ...options
    })
  ]

  if (isArray && options.maxItems !== undefined) {
    decorators.push(ArrayMaxSize(options.maxItems))
  }

  if (isArray && options.forceArray) {
    decorators.push(Transform(({ value }) => (Array.isArray(value) ? value : [value])))
  }

  if (options.minLength) {
    decorators.push(MinLength(options.minLength))
  }

  if (options.maxLength) {
    decorators.push(MaxLength(options.maxLength))
  }

  if (options.required) {
    decorators.push(IsNotEmpty())
  } else {
    decorators.push(IsOptional())
  }

  if (type) {
    decorators.push(Type(() => type as never))

    if (typeof type === 'function') {
      decorators.push(ValidateNested())

      if (!isArray) {
        decorators.push(IsObject())
      }
    }
  }

  if (options.enum && !options.skipIsEnum) {
    decorators.push(IsEnum(options.enum))
  }

  return applyDecorators(...decorators)
}
