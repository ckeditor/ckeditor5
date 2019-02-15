/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// Default.
import simple from './simple/input.word2016.html';
import styled from './styled/input.word2016.html';
import multiple from './multiple/input.word2016.html';
import multipleCombined from './multiple-combined/input.word2016.html';
import manyOneItem from './many-one-item/input.word2016.html';
import heading1 from './heading1/input.word2016.html';
import heading3Styled from './heading3-styled/input.word2016.html';
import heading7 from './heading7/input.word2016.html';
import resumeTemplate from './resume-template/input.word2016.html';
import nested from './nested/input.word2016.html';
import nestedMixed from './nested-mixed/input.word2016.html';
import nestedMultiple from './nested-multiple/input.word2016.html';

import simpleNormalized from './simple/normalized.word2016.html';
import styledNormalized from './styled/normalized.word2016.html';
import multipleNormalized from './multiple/normalized.word2016.html';
import multipleCombinedNormalized from './multiple-combined/normalized.word2016.html';
import manyOneItemNormalized from './many-one-item/normalized.word2016.html';
import heading1Normalized from './heading1/normalized.word2016.html';
import heading3StyledNormalized from './heading3-styled/normalized.word2016.html';
import heading7Normalized from './heading7/normalized.word2016.html';
import resumeTemplateNormalized from './resume-template/normalized.word2016.html';
import nestedNormalized from './nested/normalized.word2016.html';
import nestedMixedNormalized from './nested-mixed/normalized.word2016.html';
import nestedMultipleNormalized from './nested-multiple/normalized.word2016.html';

import simpleModel from './simple/model.word2016.html';
import styledModel from './styled/model.word2016.html';
import multipleModel from './multiple/model.word2016.html';
import multipleCombinedModel from './multiple-combined/model.word2016.html';
import manyOneItemModel from './many-one-item/model.word2016.html';
import heading1Model from './heading1/model.word2016.html';
import heading3StyledModel from './heading3-styled/model.word2016.html';
import heading7Model from './heading7/model.word2016.html';
import resumeTemplateModel from './resume-template/model.word2016.html';
import nestedModel from './nested/model.word2016.html';
import nestedMixedModel from './nested-mixed/model.word2016.html';
import nestedMultipleModel from './nested-multiple/model.word2016.html';

export const fixtures = {
	input: {
		simple,
		styled,
		multiple,
		multipleCombined,
		manyOneItem,
		heading1,
		heading3Styled,
		heading7,
		resumeTemplate,
		nested,
		nestedMixed,
		nestedMultiple
	},
	normalized: {
		simple: simpleNormalized,
		styled: styledNormalized,
		multiple: multipleNormalized,
		multipleCombined: multipleCombinedNormalized,
		manyOneItem: manyOneItemNormalized,
		heading1: heading1Normalized,
		heading3Styled: heading3StyledNormalized,
		heading7: heading7Normalized,
		resumeTemplate: resumeTemplateNormalized,
		nested: nestedNormalized,
		nestedMixed: nestedMixedNormalized,
		nestedMultiple: nestedMultipleNormalized
	},
	model: {
		simple: simpleModel,
		styled: styledModel,
		multiple: multipleModel,
		multipleCombined: multipleCombinedModel,
		manyOneItem: manyOneItemModel,
		heading1: heading1Model,
		heading3Styled: heading3StyledModel,
		heading7: heading7Model,
		resumeTemplate: resumeTemplateModel,
		nested: nestedModel,
		nestedMixed: nestedMixedModel,
		nestedMultiple: nestedMultipleModel
	}
};

// Safari.
import simpleSafari from './simple/input.safari.word2016.html';
import styledSafari from './styled/input.safari.word2016.html';
import multipleSafari from './multiple/input.safari.word2016.html';
import multipleCombinedSafari from './multiple-combined/input.safari.word2016.html';
import manyOneItemSafari from './many-one-item/input.safari.word2016.html';
import heading1Safari from './heading1/input.safari.word2016.html';
import heading3StyledSafari from './heading3-styled/input.safari.word2016.html';
import heading7Safari from './heading7/input.safari.word2016.html';
import resumeTemplateSafari from './resume-template/input.safari.word2016.html';

import simpleNormalizedSafari from './simple/normalized.safari.word2016.html';
import styledNormalizedSafari from './styled/normalized.safari.word2016.html';
import multipleNormalizedSafari from './multiple/normalized.safari.word2016.html';
import multipleCombinedNormalizedSafari from './multiple-combined/normalized.safari.word2016.html';
import manyOneItemNormalizedSafari from './many-one-item/normalized.safari.word2016.html';
import heading1NormalizedSafari from './heading1/normalized.safari.word2016.html';
import heading3StyledNormalizedSafari from './heading3-styled/normalized.safari.word2016.html';
import heading7NormalizedSafari from './heading7/normalized.safari.word2016.html';
import resumeTemplateNormalizedSafari from './resume-template/normalized.safari.word2016.html';

import styledSafariModel from './styled/model.safari.word2016.html';
import resumeTemplateSafariModel from './resume-template/model.safari.word2016.html';

export const browserFixtures = {
	safari: {
		input: {
			simple: simpleSafari,
			styled: styledSafari,
			multiple: multipleSafari,
			multipleCombined: multipleCombinedSafari,
			manyOneItem: manyOneItemSafari,
			heading1: heading1Safari,
			heading3Styled: heading3StyledSafari,
			heading7: heading7Safari,
			resumeTemplate: resumeTemplateSafari
		},
		normalized: {
			simple: simpleNormalizedSafari,
			styled: styledNormalizedSafari,
			multiple: multipleNormalizedSafari,
			multipleCombined: multipleCombinedNormalizedSafari,
			manyOneItem: manyOneItemNormalizedSafari,
			heading1: heading1NormalizedSafari,
			heading3Styled: heading3StyledNormalizedSafari,
			heading7: heading7NormalizedSafari,
			resumeTemplate: resumeTemplateNormalizedSafari
		},
		model: {
			simple: simpleModel,
			styled: styledSafariModel,
			multiple: multipleModel,
			multipleCombined: multipleCombinedModel,
			manyOneItem: manyOneItemModel,
			heading1: heading1Model,
			heading3Styled: heading3StyledModel,
			heading7: heading7Model,
			resumeTemplate: resumeTemplateSafariModel
		}
	}
};
