/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

module.exports = {
	appendPeriodIfMissing( text ) {
		text = text.trim();

		if ( text.length > 0 && !text.endsWith( '.' ) ) {
			text += '.';
		}

		return text;
	}
};
