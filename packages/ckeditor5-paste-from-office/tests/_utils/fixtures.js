/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// Import fixtures.
import { fixtures as basicStyles, browserFixtures as basicStylesBrowser } from '../_data/basic-styles/index.js';
import { fixtures as image, browserFixtures as imageBrowser } from '../_data/image/index.js';
import { fixtures as link, browserFixtures as linkBrowser } from '../_data/link/index.js';
import { fixtures as list, browserFixtures as listBrowser } from '../_data/list/index.js';
import { fixtures as spacing, browserFixtures as spacingBrowser } from '../_data/spacing/index.js';
import { fixtures as googleDocsBoldWrapper, browserFixtures as googleDocsBoldWrapperBrowser }
	from '../_data/paste-from-google-docs/bold-wrapper/index';
import { fixtures as googleDocsList, browserFixtures as googleDocsListBrowser } from '../_data/paste-from-google-docs/lists/index.js';

// Generic fixtures.
export const fixtures = {
	'basic-styles': basicStyles,
	image,
	link,
	list,
	spacing,
	'google-docs-bold-wrapper': googleDocsBoldWrapper,
	'google-docs-list': googleDocsList
};

// Browser specific fixtures.
export const browserFixtures = {
	'basic-styles': basicStylesBrowser,
	image: imageBrowser,
	link: linkBrowser,
	list: listBrowser,
	spacing: spacingBrowser,
	'google-docs-bold-wrapper': googleDocsBoldWrapperBrowser,
	'google-docs-list': googleDocsListBrowser
};
