/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// Default.
import simple from './simple/input.word2016.html';
import singleLine from './single-line/input.word2016.html';
import multiLine from './multi-line/input.word2016.html';

import simpleNormalized from './simple/normalized.word2016.html';
import singleLineNormalized from './single-line/normalized.word2016.html';
import multiLineNormalized from './multi-line/normalized.word2016.html';

import simpleModel from './simple/model.word2016.html';
import singleLineModel from './single-line/model.word2016.html';
import multiLineModel from './multi-line/model.word2016.html';

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
	},
	model: {
		simple: simpleModel,
		singleLine: singleLineModel,
		multiLine: multiLineModel
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
		},
		model: {
			simple: simpleModel,
			singleLine: singleLineModel,
			multiLine: multiLineModel
		}
	}
};
