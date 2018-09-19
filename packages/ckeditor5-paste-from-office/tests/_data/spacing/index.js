/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

// Default.
import simple from './simple/input.word2016.html';
import singleLine from './single-line/input.word2016.html';
import multiLine from './multi-line/input.word2016.html';

import simpleNormalized from './simple/normalized.word2016.html';
import singleLineNormalized from './single-line/normalized.word2016.html';
import multiLineNormalized from './multi-line/normalized.word2016.html';

export const fixtures = {
	input: {
		simple,
		singleLine,
		multiLine
	},
	normalized: {
		simple: simpleNormalized,
		singleLine: singleLineNormalized,
		multiLine: multiLineNormalized
	}
};

// Safari.
import simpleSafari from './simple/input.safari.word2016.html';
import singleLineSafari from './single-line/input.safari.word2016.html';
import multiLineSafari from './multi-line/input.safari.word2016.html';

import simpleNormalizedSafari from './simple/normalized.safari.word2016.html';
import singleLineNormalizedSafari from './single-line/normalized.safari.word2016.html';
import multiLineNormalizedSafari from './multi-line/normalized.safari.word2016.html';

export const browserFixtures = {
	safari: {
		input: {
			simple: simpleSafari,
			singleLine: singleLineSafari,
			multiLine: multiLineSafari
		},
		normalized: {
			simple: simpleNormalizedSafari,
			singleLine: singleLineNormalizedSafari,
			multiLine: multiLineNormalizedSafari
		}
	}
};
