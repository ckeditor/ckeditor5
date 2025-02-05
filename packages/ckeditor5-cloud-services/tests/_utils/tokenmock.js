/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Token from '../../src/token/token.js';

export default class TokenMock extends Token {
	/**
	 * Overrides request and set the next token
	 *
	 * @returns {Promise.<Token>}
	 */
	refreshToken() {
		this.set( 'value', TokenMock.initialToken );

		return Promise.resolve( this );
	}

	/**
	 * Overrides interval
	 *
	 * @protected
	 */
	_startRefreshing() {}
}
