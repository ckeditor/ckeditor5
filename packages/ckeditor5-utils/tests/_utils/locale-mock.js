/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * A replacement for the {@link module:utils/locale~Locale} class.
 *
 * @memberOf tests.utils._utils
 */
export default class Locale {
	constructor() {
		this.t = str => `t( ${ str } )`;
	}
}
