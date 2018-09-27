/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

// Import fixtures.
import { fixtures as basicStyles, browserFixtures as basicStylesBrowser } from '../_data/basic-styles/index.js';
import { fixtures as link, browserFixtures as linkBrowser } from '../_data/link/index.js';
import { fixtures as list, browserFixtures as listBrowser } from '../_data/list/index.js';
import { fixtures as spacing, browserFixtures as spacingBrowser } from '../_data/spacing/index.js';

// Generic fixtures.
export const fixtures = {
	'basic-styles': basicStyles,
	link,
	list,
	spacing
};

// Browser specific fixtures.
export const browserFixtures = {
	'basic-styles': basicStylesBrowser,
	link: linkBrowser,
	list: listBrowser,
	spacing: spacingBrowser
};
