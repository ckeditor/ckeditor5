/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/emptyiterableiterator
 */

/**
 * TODO
 */
export const emptyIterableIterator: IterableIterator<any> = {
	next() {
		return {
			done: true,
			value: undefined
		};
	},

	[ Symbol.iterator ]() {
		return this;
	}
};
