export const isInAllowedList = <T>(arr: T[] | undefined, val: T): boolean => arr?.includes(val) ?? true

export const isExplicitlyInAllowedList = <T>(arr: T[] | undefined, val: T): boolean => arr?.includes(val) ?? false
