/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
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
