/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// Default.
import withinText from './within-text/input.word2016.html?raw';
import combined from './combined/input.word2016.html?raw';
import twoLine from './two-line/input.word2016.html?raw';

import withinTextNormalized from './within-text/normalized.word2016.html?raw';
import combinedNormalized from './combined/normalized.word2016.html?raw';
import twoLineNormalized from './two-line/normalized.word2016.html?raw';

import withinTextModel from './within-text/model.word2016.html?raw';
import combinedModel from './combined/model.word2016.html?raw';
import twoLineModel from './two-line/model.word2016.html?raw';

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
import withinTextSafari from './within-text/input.safari.word2016.html?raw';
import combinedSafari from './combined/input.safari.word2016.html?raw';
import twoLineSafari from './two-line/input.safari.word2016.html?raw';

import withinTextNormalizedSafari from './within-text/normalized.safari.word2016.html?raw';
import combinedNormalizedSafari from './combined/normalized.safari.word2016.html?raw';
import twoLineNormalizedSafari from './two-line/normalized.safari.word2016.html?raw';

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
