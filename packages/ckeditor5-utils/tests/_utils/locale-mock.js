/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * A replacement for the {@link utils.Locale} class.
 *
 * @memberOf tests.utils._utils
 */
export default class Locale {
	constructor() {
		this.t = str => `t( ${ str } )`;
	}
}
