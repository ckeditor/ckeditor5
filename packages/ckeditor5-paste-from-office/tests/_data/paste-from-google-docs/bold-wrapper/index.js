/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import simpleText from './simple-text/input.html?raw';
import simpleTextWindows from './simple-text-windows/input.html?raw';

import simpleTextNormalized from './simple-text/normalized.html?raw';
import simpleTextWindowsNormalized from './simple-text-windows/normalized.html?raw';

import simpleTextModel from './simple-text/model.html?raw';
import simpleTextWindowsModel from './simple-text-windows/model.html?raw';

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

import simpleTextFirefox from './simple-text/input.firefox.html?raw';
import simpleTextWindowsFirefox from './simple-text-windows/input.firefox.html?raw';

import simpleTextNormalizedFirefox from './simple-text/normalized.firefox.html?raw';
import simpleTextWindowsNormalizedFirefox from './simple-text-windows/normalized.firefox.html?raw';

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
