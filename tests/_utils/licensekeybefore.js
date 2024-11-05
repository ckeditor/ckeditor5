/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { beforeAll } from 'vitest';

/* global window */

// eslint-disable-next-line mocha/no-top-level-hooks
beforeAll( function() {
	window.CKEDITOR_GLOBAL_LICENSE_KEY = 'GPL';
} );
