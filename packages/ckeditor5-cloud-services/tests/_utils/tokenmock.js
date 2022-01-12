/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Token from '../../src/token/token';

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
