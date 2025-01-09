/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/toarray
 */

/**
 * Transforms any value to an array. If the provided value is already an array, it is returned unchanged.
 *
 * @label MUTABLE
 * @param data The value to transform to an array.
 * @returns An array created from data.
 */
export default function toArray<T>( data: ArrayOrItem<T> ): Array<T>;

/**
 * Transforms any value to an array. If the provided value is already an array, it is returned unchanged.
 *
 * @label IMMUTABLE
 * @param data The value to transform to an array.
 * @returns An array created from data.
 */
export default function toArray<T>( data: ReadonlyArrayOrItem<T> ): ReadonlyArray<T>;

export default function toArray<T>( data: ArrayOrItem<T> ): Array<T> {
	return Array.isArray( data ) ? data : [ data ];
}

export type ArrayOrItem<T> = T | Array<T>;
export type ReadonlyArrayOrItem<T> = T | ReadonlyArray<T>;
