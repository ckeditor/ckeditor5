/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import Generator from './git-commit-message-generator/generator.svelte';

// eslint-disable-next-line no-new
new Generator( {
	target: document.querySelector( '#snippet-git-commit-message-generator' )
} );
