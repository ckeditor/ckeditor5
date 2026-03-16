/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { defineProject } from 'vitest/config';

export default defineProject( {
	test: {
		name: 'utils',
		// include: [ 'tests/*' ],
		// TODO - we should include all tests. Just for vitest testing purposes.
		include: [ 'tests/first.js' ],
		exclude: [ 'tests/manual/*', 'tests/_utils/*' ]
	}
} );
