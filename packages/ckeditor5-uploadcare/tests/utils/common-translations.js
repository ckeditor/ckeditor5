/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Locale } from '@ckeditor/ckeditor5-utils';
import { getTranslation } from '../../src/utils/common-translations.js';

// It is needed for 100% cc.
describe( 'Common translations', () => {
	it( 'should return ID when no translation is defined', () => {
		const locale = new Locale();
		const undefinedId = 'Some ID';

		expect( getTranslation( locale, undefinedId ) ).to.be.equal( undefinedId );
	} );
} );
