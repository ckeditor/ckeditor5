/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// Default.
import lineBreakAsSpace from './line-break-as-space/input.word2016.html';
import simple from './simple/input.word2016.html';
import singleLine from './single-line/input.word2016.html';
import multiLine from './multi-line/input.word2016.html';

import lineBreakAsSpaceNormalized from './line-break-as-space/normalized.word2016.html';
import simpleNormalized from './simple/normalized.word2016.html';
import singleLineNormalized from './single-line/normalized.word2016.html';
import multiLineNormalized from './multi-line/normalized.word2016.html';

import lineBreakAsSpaceModel from './line-break-as-space/model.word2016.html';
import simpleModel from './simple/model.word2016.html';
import singleLineModel from './single-line/model.word2016.html';
import multiLineModel from './multi-line/model.word2016.html';

export const fixtures = {
	input: {
		lineBreakAsSpace,
		simple,
		singleLine,
		multiLine
	},
	normalized: {
		lineBreakAsSpace: lineBreakAsSpaceNormalized,
		simple: simpleNormalized,
		singleLine: singleLineNormalized,
		multiLine: multiLineNormalized
	},
	model: {
		lineBreakAsSpace: lineBreakAsSpaceModel,
		simple: simpleModel,
		singleLine: singleLineModel,
		multiLine: multiLineModel
	}
};

// Safari.
import lineBreakAsSpaceSafari from './line-break-as-space/input.safari.word2016.html';
import simpleSafari from './simple/input.safari.word2016.html';
import singleLineSafari from './single-line/input.safari.word2016.html';
import multiLineSafari from './multi-line/input.safari.word2016.html';

import lineBreakAsSpaceNormalizedSafari from './line-break-as-space/normalized.safari.word2016.html';
import simpleNormalizedSafari from './simple/normalized.safari.word2016.html';
import singleLineNormalizedSafari from './single-line/normalized.safari.word2016.html';
import multiLineNormalizedSafari from './multi-line/normalized.safari.word2016.html';

export const browserFixtures = {
	safari: {
		input: {
			lineBreakAsSpace: lineBreakAsSpaceSafari,
			simple: simpleSafari,
			singleLine: singleLineSafari,
			multiLine: multiLineSafari
		},
		normalized: {
			lineBreakAsSpace: lineBreakAsSpaceNormalizedSafari,
			simple: simpleNormalizedSafari,
			singleLine: singleLineNormalizedSafari,
			multiLine: multiLineNormalizedSafari
		},
		model: {
			lineBreakAsSpace: lineBreakAsSpaceModel,
			simple: simpleModel,
			singleLine: singleLineModel,
			multiLine: multiLineModel
		}
	}
};
