#!/usr/bin/env node

/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* eslint-env node */

import buildApiDocs from './buildapi.mjs';

buildApiDocs()
	.catch( () => {
		process.exitCode = 1;
	} );
