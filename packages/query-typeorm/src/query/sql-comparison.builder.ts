import { CommonFieldComparisonBetweenType, FilterComparisonOperators } from '@ptc-org/nestjs-query-core'
import { EntityMetadata, ObjectLiteral, Repository } from 'typeorm'

import { randomString } from '../common'

/**
 * @internal
 */
type CmpSQLType = { sql: string; params: ObjectLiteral }

/**
 * @internal
 */
export type EntityComparisonField<Entity, F extends keyof Entity> =
  | Entity[F]
  | Entity[F][]
  | CommonFieldComparisonBetweenType<Entity[F]>
  | true
  | false
  | null

/**
 * @internal
 * Builder to create SQL Comparisons. (=, !=, \>, etc...)
 */
export class SQLComparisonBuilder<Entity> {
  static DEFAULT_COMPARISON_MAP: Record<string, string> = {
    eq: '=',
    neq: '!=',
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    like: 'LIKE',
    notlike: 'NOT LIKE',
    ilike: 'ILIKE',
    notilike: 'NOT ILIKE'
  }

  private entityMetadata?: EntityMetadata

  constructor(
    readonly comparisonMap: Record<string, string> = SQLComparisonBuilder.DEFAULT_COMPARISON_MAP,
    readonly repo?: Repository<Entity>
  ) {
    this.entityMetadata = repo?.metadata
  }

  private get paramName(): string {
    return `param${randomString()}`
  }

  /**
   * Creates a valid SQL fragment with parameters.
   *
   * @param field - the property in Entity to create the comparison for.
   * @param cmp - the FilterComparisonOperator (eq, neq, gt, etc...)
   * @param val - the value to compare to
   * @param alias - alias for the field.
   */
  public build<F extends keyof Entity>(
    field: F,
    cmp: FilterComparisonOperators<Entity[F]>,
    val: EntityComparisonField<Entity, F>,
    alias?: string
  ): CmpSQLType {
    const col = this.getCol(field as string, alias)
    const normalizedCmp = (cmp as string).toLowerCase()
    if (this.comparisonMap[normalizedCmp]) {
      // comparison operator (e.b. =, !=, >, <)
      return this.createComparisonSQL(normalizedCmp, col, val)
    }
    if (normalizedCmp === 'is') {
      // is comparison (IS TRUE, IS FALSE, IS NULL)
      return this.isComparisonSQL(col, val)
    }
    if (normalizedCmp === 'isnot') {
      // is comparison (IS NOT TRUE, IS NOT FALSE, IS NOT NULL, etc...)
      return this.isNotComparisonSQL(col, val)
    }
    if (normalizedCmp === 'in') {
      // in comparison (field IN (1,2,3))
      return this.inComparisonSQL(col, val)
    }
    if (normalizedCmp === 'notin') {
      // in comparison (field IN (1,2,3))
      return this.notInComparisonSQL(col, val)
    }
    if (normalizedCmp === 'between') {
      // between comparison (field BETWEEN x AND y)
      return this.betweenComparisonSQL(col, val)
    }
    if (normalizedCmp === 'notbetween') {
      // notBetween comparison (field NOT BETWEEN x AND y)
      return this.notBetweenComparisonSQL(col, val)
    }
    throw new Error(`unknown operator ${JSON.stringify(cmp)}`)
  }

  /**
   * Derives the builder used for comparisons on a relation of `Entity`.
   *
   * The derived builder is of the same class and carries the same comparison map, so custom
   * operators and SQL transforms apply to relation fields as well as root entity fields.
   *
   * It deliberately carries no repository: `repo` describes the root entity, and resolving a
   * relation's field names against root entity metadata would expand the wrong virtual columns.
   * The relation's own metadata is carried instead, so that a relation's virtual columns expand
   * into their queries while the root entity's do not leak into relation comparisons.
   *
   * Subclasses that declare a constructor signature other than `SQLComparisonBuilder`'s must
   * override this method, since the default implementation constructs the subclass with a
   * comparison map as its only argument. Such an override should pass `relationMetadata` on with
   * {@link withEntityMetadata} to keep virtual column support for the relation's fields.
   *
   * @param relationMetadata - metadata of the relation the derived builder compares fields of.
   */
  public forRelation<Relation>(relationMetadata?: EntityMetadata): SQLComparisonBuilder<Relation> {
    const BuilderClass = this.constructor as new (comparisonMap: Record<string, string>) => SQLComparisonBuilder<Relation>

    return new BuilderClass(this.comparisonMap).withEntityMetadata(relationMetadata)
  }

  /**
   * Sets the metadata that field names are resolved against when building comparisons, and returns
   * the builder for chaining.
   *
   * @param entityMetadata - metadata of the entity whose fields this builder compares.
   */
  protected withEntityMetadata(entityMetadata?: EntityMetadata): this {
    this.entityMetadata = entityMetadata

    return this
  }

  private createComparisonSQL<F extends keyof Entity>(
    cmp: string,
    col: string,
    val: EntityComparisonField<Entity, F>
  ): CmpSQLType {
    const operator = this.comparisonMap[cmp]
    const { paramName } = this
    return { sql: `${col} ${operator} :${paramName}`, params: { [paramName]: val } }
  }

  private isComparisonSQL<F extends keyof Entity>(col: string, val: EntityComparisonField<Entity, F>): CmpSQLType {
    if (val === null) {
      return { sql: `${col} IS NULL`, params: {} }
    }
    if (val === true) {
      return { sql: `${col} = TRUE`, params: {} }
    }
    if (val === false) {
      return { sql: `${col} = FALSE`, params: {} }
    }
    throw new Error(`unexpected is operator param ${JSON.stringify(val)}`)
  }

  private isNotComparisonSQL<F extends keyof Entity>(col: string, val: EntityComparisonField<Entity, F>): CmpSQLType {
    if (val === null) {
      return { sql: `${col} IS NOT NULL`, params: {} }
    }
    if (val === true) {
      return { sql: `${col} != TRUE`, params: {} }
    }
    if (val === false) {
      return { sql: `${col} != FALSE`, params: {} }
    }
    throw new Error(`unexpected isNot operator param ${JSON.stringify(val)}`)
  }

  private inComparisonSQL<F extends keyof Entity>(col: string, val: EntityComparisonField<Entity, F>): CmpSQLType {
    this.checkNonEmptyArray(val)
    const { paramName } = this
    return {
      sql: `${col} IN (:...${paramName})`,
      params: { [paramName]: val }
    }
  }

  private notInComparisonSQL<F extends keyof Entity>(col: string, val: EntityComparisonField<Entity, F>): CmpSQLType {
    this.checkNonEmptyArray(val)
    const { paramName } = this
    return {
      sql: `${col} NOT IN (:...${paramName})`,
      params: { [paramName]: val }
    }
  }

  private checkNonEmptyArray<F extends keyof Entity>(val: EntityComparisonField<Entity, F>): void {
    if (!Array.isArray(val)) {
      throw new Error(`Invalid in value expected an array got ${JSON.stringify(val)}`)
    }
    if (!val.length) {
      throw new Error(`Invalid in value expected a non-empty array got ${JSON.stringify(val)}`)
    }
  }

  private betweenComparisonSQL<F extends keyof Entity>(col: string, val: EntityComparisonField<Entity, F>): CmpSQLType {
    if (this.isBetweenVal(val)) {
      const { paramName: lowerParamName } = this
      const { paramName: upperParamName } = this
      return {
        sql: `${col} BETWEEN :${lowerParamName} AND :${upperParamName}`,
        params: {
          [lowerParamName]: val.lower,
          [upperParamName]: val.upper
        }
      }
    }
    throw new Error(`Invalid value for between expected {lower: val, upper: val} got ${JSON.stringify(val)}`)
  }

  private notBetweenComparisonSQL<F extends keyof Entity>(col: string, val: EntityComparisonField<Entity, F>): CmpSQLType {
    if (this.isBetweenVal(val)) {
      const { paramName: lowerParamName } = this
      const { paramName: upperParamName } = this
      return {
        sql: `${col} NOT BETWEEN :${lowerParamName} AND :${upperParamName}`,
        params: {
          [lowerParamName]: val.lower,
          [upperParamName]: val.upper
        }
      }
    }
    throw new Error(`Invalid value for not between expected {lower: val, upper: val} got ${JSON.stringify(val)}`)
  }

  private isBetweenVal<F extends keyof Entity>(
    val: EntityComparisonField<Entity, F>
  ): val is CommonFieldComparisonBetweenType<Entity[F]> {
    return val !== null && typeof val === 'object' && 'lower' in val && 'upper' in val
  }

  private getCol(field: string, alias?: string): string {
    const column = this.entityMetadata?.columns.find(({ databasePath }) => databasePath === field)

    if (column && column.isVirtualProperty) {
      return `(${column.query(alias)})`
    }

    return alias ? `${alias}.${field}` : `${field}`
  }
}
