/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// Default.
import lineBreakAsSpace from './line-break-as-space/input.word2016.html?raw';
import simple from './simple/input.word2016.html?raw';
import singleLine from './single-line/input.word2016.html?raw';
import multiLine from './multi-line/input.word2016.html?raw';

import lineBreakAsSpaceNormalized from './line-break-as-space/normalized.word2016.html?raw';
import simpleNormalized from './simple/normalized.word2016.html?raw';
import singleLineNormalized from './single-line/normalized.word2016.html?raw';
import multiLineNormalized from './multi-line/normalized.word2016.html?raw';

import lineBreakAsSpaceModel from './line-break-as-space/model.word2016.html?raw';
import simpleModel from './simple/model.word2016.html?raw';
import singleLineModel from './single-line/model.word2016.html?raw';
import multiLineModel from './multi-line/model.word2016.html?raw';

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
import lineBreakAsSpaceSafari from './line-break-as-space/input.safari.word2016.html?raw';
import simpleSafari from './simple/input.safari.word2016.html?raw';
import singleLineSafari from './single-line/input.safari.word2016.html?raw';
import multiLineSafari from './multi-line/input.safari.word2016.html?raw';

import lineBreakAsSpaceNormalizedSafari from './line-break-as-space/normalized.safari.word2016.html?raw';
import simpleNormalizedSafari from './simple/normalized.safari.word2016.html?raw';
import singleLineNormalizedSafari from './single-line/normalized.safari.word2016.html?raw';
import multiLineNormalizedSafari from './multi-line/normalized.safari.word2016.html?raw';

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
