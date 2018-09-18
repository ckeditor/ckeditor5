/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

// Default.
import boldWithinText from './bold-within-text/input.word2016.html';
import italicStartingText from './italic-starting-text/input.word2016.html';
import underlinedText from './underlined-text/input.word2016.html';
import strikethroughEndingText from './strikethrough-ending-text/input.word2016.html';
import multipleStylesSingleLine from './multiple-styles-single-line/input.word2016.html';
import multipleStylesMultiline from './multiple-styles-multiline/input.word2016.html';

import boldWithinTextNormalized from './bold-within-text/normalized.word2016.html';
import italicStartingTextNormalized from './italic-starting-text/normalized.word2016.html';
import underlinedTextNormalized from './underlined-text/normalized.word2016.html';
import strikethroughEndingTextNormalized from './strikethrough-ending-text/normalized.word2016.html';
import multipleStylesSingleLineNormalized from './multiple-styles-single-line/normalized.word2016.html';
import multipleStylesMultilineNormalized from './multiple-styles-multiline/normalized.word2016.html';

export const fixtures = {
	input: {
		boldWithinText,
		italicStartingText,
		underlinedText,
		strikethroughEndingText,
		multipleStylesSingleLine,
		multipleStylesMultiline
	},
	normalized: {
		boldWithinText: boldWithinTextNormalized,
		italicStartingText: italicStartingTextNormalized,
		underlinedText: underlinedTextNormalized,
		strikethroughEndingText: strikethroughEndingTextNormalized,
		multipleStylesSingleLine: multipleStylesSingleLineNormalized,
		multipleStylesMultiline: multipleStylesMultilineNormalized
	}
};

// Safari.
import boldWithinTextSafari from './bold-within-text/input.safari.word2016.html';
import italicStartingTextSafari from './italic-starting-text/input.safari.word2016.html';
import underlinedTextSafari from './underlined-text/input.safari.word2016.html';
import strikethroughEndingTextSafari from './strikethrough-ending-text/input.safari.word2016.html';
import multipleStylesSingleLineSafari from './multiple-styles-single-line/input.safari.word2016.html';
import multipleStylesMultilineSafari from './multiple-styles-multiline/input.safari.word2016.html';

import boldWithinTextNormalizedSafari from './bold-within-text/normalized.safari.word2016.html';
import italicStartingTextNormalizedSafari from './italic-starting-text/normalized.safari.word2016.html';
import underlinedTextNormalizedSafari from './underlined-text/normalized.safari.word2016.html';
import strikethroughEndingTextNormalizedSafari from './strikethrough-ending-text/normalized.safari.word2016.html';
import multipleStylesSingleLineNormalizedSafari from './multiple-styles-single-line/normalized.safari.word2016.html';
import multipleStylesMultilineNormalizedSafari from './multiple-styles-multiline/normalized.safari.word2016.html';

export const browserFixtures = {
	safari: {
		input: {
			boldWithinText: boldWithinTextSafari,
			italicStartingText: italicStartingTextSafari,
			underlinedText: underlinedTextSafari,
			strikethroughEndingText: strikethroughEndingTextSafari,
			multipleStylesSingleLine: multipleStylesSingleLineSafari,
			multipleStylesMultiline: multipleStylesMultilineSafari
		},
		normalized: {
			boldWithinText: boldWithinTextNormalizedSafari,
			italicStartingText: italicStartingTextNormalizedSafari,
			underlinedText: underlinedTextNormalizedSafari,
			strikethroughEndingText: strikethroughEndingTextNormalizedSafari,
			multipleStylesSingleLine: multipleStylesSingleLineNormalizedSafari,
			multipleStylesMultiline: multipleStylesMultilineNormalizedSafari
		}
	}
};
