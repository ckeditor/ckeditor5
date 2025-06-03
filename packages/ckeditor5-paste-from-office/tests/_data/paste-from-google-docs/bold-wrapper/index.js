/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import simpleText from './simple-text/input.html';
import simpleTextWindows from './simple-text-windows/input.html';

import simpleTextNormalized from './simple-text/normalized.html';
import simpleTextWindowsNormalized from './simple-text-windows/normalized.html';

import simpleTextModel from './simple-text/model.html';
import simpleTextWindowsModel from './simple-text-windows/model.html';

export const fixtures = {
	input: {
		simpleText,
		simpleTextWindows
	},
	normalized: {
		simpleText: simpleTextNormalized,
		simpleTextWindows: simpleTextWindowsNormalized
	},
	model: {
		simpleText: simpleTextModel,
		simpleTextWindows: simpleTextWindowsModel
	}
};

import simpleTextFirefox from './simple-text/input.firefox.html';
import simpleTextWindowsFirefox from './simple-text-windows/input.firefox.html';

import simpleTextNormalizedFirefox from './simple-text/normalized.firefox.html';
import simpleTextWindowsNormalizedFirefox from './simple-text-windows/normalized.firefox.html';

export const browserFixtures = {
	firefox: {
		input: {
			simpleText: simpleTextFirefox,
			simpleTextWindows: simpleTextWindowsFirefox
		},
		normalized: {
			simpleText: simpleTextNormalizedFirefox,
			simpleTextWindows: simpleTextWindowsNormalizedFirefox
		},
		model: {
			simpleText: simpleTextModel,
			simpleTextWindows: simpleTextWindowsModel
		}
	}
};
