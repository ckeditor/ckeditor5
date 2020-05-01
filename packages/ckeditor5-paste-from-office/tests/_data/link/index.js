/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// Default.
import withinText from './within-text/input.word2016.html';
import combined from './combined/input.word2016.html';
import twoLine from './two-line/input.word2016.html';

import withinTextNormalized from './within-text/normalized.word2016.html';
import combinedNormalized from './combined/normalized.word2016.html';
import twoLineNormalized from './two-line/normalized.word2016.html';

import withinTextModel from './within-text/model.word2016.html';
import combinedModel from './combined/model.word2016.html';
import twoLineModel from './two-line/model.word2016.html';

export const fixtures = {
	input: {
		withinText,
		combined,
		twoLine
	},
	normalized: {
		withinText: withinTextNormalized,
		combined: combinedNormalized,
		twoLine: twoLineNormalized
	},
	model: {
		withinText: withinTextModel,
		combined: combinedModel,
		twoLine: twoLineModel
	}
};

// Safari.
import withinTextSafari from './within-text/input.safari.word2016.html';
import combinedSafari from './combined/input.safari.word2016.html';
import twoLineSafari from './two-line/input.safari.word2016.html';

import withinTextNormalizedSafari from './within-text/normalized.safari.word2016.html';
import combinedNormalizedSafari from './combined/normalized.safari.word2016.html';
import twoLineNormalizedSafari from './two-line/normalized.safari.word2016.html';

export const browserFixtures = {
	safari: {
		input: {
			withinText: withinTextSafari,
			combined: combinedSafari,
			twoLine: twoLineSafari
		},
		normalized: {
			withinText: withinTextNormalizedSafari,
			combined: combinedNormalizedSafari,
			twoLine: twoLineNormalizedSafari
		},
		model: {
			withinText: withinTextModel,
			combined: combinedModel,
			twoLine: twoLineModel
		}
	}
};
