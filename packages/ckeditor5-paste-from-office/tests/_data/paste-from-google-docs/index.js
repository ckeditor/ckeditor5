/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import simpleText from './simple-text/input.html';
import simpleTextFromFirefox from './simple-text-from-firefox/input.html';

import simpleTextNormalized from './simple-text/normalized.html';
import simpleTextFromFirefoxNormalized from './simple-text-from-firefox/normalized.html';

import simpleTextModel from './simple-text/model.html';
import simpleTextFromFirefoxModel from './simple-text-from-firefox/model.html';

export const fixtures = {
	input: {
		simpleText,
		simpleTextFromFirefox
	},
	normalized: {
		simpleText: simpleTextNormalized,
		simpleTextFromFirefox: simpleTextFromFirefoxNormalized
	},
	model: {
		simpleText: simpleTextModel,
		simpleTextFromFirefox: simpleTextFromFirefoxModel
	}
};

export const browserFixtures = {};
