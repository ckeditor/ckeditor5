/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/typings
 */

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type NonEmptyArray<A> = Array<A> & {
	0: A;
  };

export type HexColor<S extends string = string> = `#${ S }`;

export type Increment<N extends number> = [
	1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
	17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
	31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
	45, 46, 47, 48, 49, 50, 51, 52, 53, 54,
	...Array<number>
  ][N];

export type DeepReadonly<T, Level extends number = 0> = 6 extends Level ? T
	: Readonly<{
		[K in keyof T]:
			T[K] extends string ? Readonly<T[K]>
				: T[K] extends Array<infer A> ? Readonly<Array<DeepReadonly<A, Increment<Level>>>>
					: DeepReadonly<T[K], Increment<Level>>;
	}>;
