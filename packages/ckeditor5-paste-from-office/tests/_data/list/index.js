/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// Default.
import simple from './simple/input.word2016.html?raw';
import styled from './styled/input.word2016.html?raw';
import multiple from './multiple/input.word2016.html?raw';
import multipleCombined from './multiple-combined/input.word2016.html?raw';
import manyOneItem from './many-one-item/input.word2016.html?raw';
import heading1 from './heading1/input.word2016.html?raw';
import heading3Styled from './heading3-styled/input.word2016.html?raw';
import heading7 from './heading7/input.word2016.html?raw';
import resumeTemplate from './resume-template/input.word2016.html?raw';
import nested from './nested/input.word2016.html?raw';
import nestedMixed from './nested-mixed/input.word2016.html?raw';
import nestedMultiple from './nested-multiple/input.word2016.html?raw';
import nestedMixedId from './nested-mixed-id/input.word2016.html?raw';
import styledAnchor from './styled-anchor/input.word2016.html?raw';
import multiBlock from './multi-block/input.word.html?raw';
import mixedElements from './mixed-elements/input.word.html?raw';
import multiBlockBlockAfter from './multi-block-block-after/input.word.html?raw';
import listContinuation from './list-continuation/input.word2016.html?raw';
import indentBlockList from './indent-block-list/input.word.html?raw';
import nestedContinued from './nested-continued/input.word.html?raw';
import manualIndent from './manual-indent/input.word.html?raw';
import multiSkipLevelDeep from './multi-skip-level-deep/input.word.html?raw';
import continuationAfterDifferentList from './continuation-after-different-list/input.word.html?raw';

import simpleNormalized from './simple/normalized.word2016.html?raw';
import styledNormalized from './styled/normalized.word2016.html?raw';
import multipleNormalized from './multiple/normalized.word2016.html?raw';
import multipleCombinedNormalized from './multiple-combined/normalized.word2016.html?raw';
import manyOneItemNormalized from './many-one-item/normalized.word2016.html?raw';
import heading1Normalized from './heading1/normalized.word2016.html?raw';
import heading3StyledNormalized from './heading3-styled/normalized.word2016.html?raw';
import heading7Normalized from './heading7/normalized.word2016.html?raw';
import resumeTemplateNormalized from './resume-template/normalized.word2016.html?raw';
import nestedNormalized from './nested/normalized.word2016.html?raw';
import nestedMixedNormalized from './nested-mixed/normalized.word2016.html?raw';
import nestedMultipleNormalized from './nested-multiple/normalized.word2016.html?raw';
import nestedMixedIdNormalized from './nested-mixed-id/normalized.word2016.html?raw';
import styledAnchorNormalized from './styled-anchor/normalized.word2016.html?raw';
import multiBlockNormalized from './multi-block/normalized.word.html?raw';
import mixedElementsNormalized from './mixed-elements/normalized.word.html?raw';
import multiBlockBlockAfterNormalized from './multi-block-block-after/normalized.word.html?raw';
import listContinuationNormalized from './list-continuation/normalized.word2016.html?raw';
import indentBlockListNormalized from './indent-block-list/normalized.word.html?raw';
import nestedContinuedNormalized from './nested-continued/normalized.word.html?raw';
import manualIndentNormalized from './manual-indent/normalized.word.html?raw';
import multiSkipLevelDeepNormalized from './multi-skip-level-deep/normalized.word.html?raw';
import continuationAfterDifferentListNormalized from './continuation-after-different-list/normalized.word.html?raw';

import simpleModel from './simple/model.word2016.html?raw';
import styledModel from './styled/model.word2016.html?raw';
import multipleModel from './multiple/model.word2016.html?raw';
import multipleCombinedModel from './multiple-combined/model.word2016.html?raw';
import manyOneItemModel from './many-one-item/model.word2016.html?raw';
import heading1Model from './heading1/model.word2016.html?raw';
import heading3StyledModel from './heading3-styled/model.word2016.html?raw';
import heading7Model from './heading7/model.word2016.html?raw';
import resumeTemplateModel from './resume-template/model.word2016.html?raw';
import nestedModel from './nested/model.word2016.html?raw';
import nestedMixedModel from './nested-mixed/model.word2016.html?raw';
import nestedMultipleModel from './nested-multiple/model.word2016.html?raw';
import nestedMixedIdModel from './nested-mixed-id/model.word2016.html?raw';
import styledAnchorModel from './styled-anchor/model.word2016.html?raw';
import multiBlockModel from './multi-block/model.word.html?raw';
import mixedElementsModel from './mixed-elements/model.word.html?raw';
import multiBlockBlockAfterModel from './multi-block-block-after/model.word.html?raw';
import listContinuationModel from './list-continuation/model.word2016.html?raw';
import indentBlockListModel from './indent-block-list/model.word.html?raw';
import nestedContinuedModel from './nested-continued/model.word.html?raw';
import manualIndentModel from './manual-indent/model.word.html?raw';
import multiSkipLevelDeepModel from './multi-skip-level-deep/model.word.html?raw';
import continuationAfterDifferentListModel from './continuation-after-different-list/model.word.html?raw';

// Skip-level list models — same inputs as the matching default-config fixtures above, but the
// expected model differs because `enableSkipLevelLists: true` lets the post-fixer keep the indent gaps.
import nestedSkipLevelModel from './nested/model.skipLevel.word2016.html?raw';
import nestedMixedSkipLevelModel from './nested-mixed/model.skipLevel.word2016.html?raw';
import nestedMultipleSkipLevelModel from './nested-multiple/model.skipLevel.word2016.html?raw';
import indentBlockListSkipLevelModel from './indent-block-list/model.skipLevel.word.html?raw';
import multiSkipLevelDeepSkipLevelModel from './multi-skip-level-deep/model.skipLevel.word.html?raw';

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
		nestedMultiple,
		nestedMixedId,
		styledAnchor,
		multiBlock,
		mixedElements,
		multiBlockBlockAfter,
		listContinuation,
		indentBlockList,
		nestedContinued,
		manualIndent,
		multiSkipLevelDeep,
		continuationAfterDifferentList
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
		nestedMultiple: nestedMultipleNormalized,
		nestedMixedId: nestedMixedIdNormalized,
		styledAnchor: styledAnchorNormalized,
		multiBlock: multiBlockNormalized,
		mixedElements: mixedElementsNormalized,
		multiBlockBlockAfter: multiBlockBlockAfterNormalized,
		listContinuation: listContinuationNormalized,
		indentBlockList: indentBlockListNormalized,
		nestedContinued: nestedContinuedNormalized,
		manualIndent: manualIndentNormalized,
		multiSkipLevelDeep: multiSkipLevelDeepNormalized,
		continuationAfterDifferentList: continuationAfterDifferentListNormalized
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
		nestedMultiple: nestedMultipleModel,
		nestedMixedId: nestedMixedIdModel,
		styledAnchor: styledAnchorModel,
		multiBlock: multiBlockModel,
		mixedElements: mixedElementsModel,
		multiBlockBlockAfter: multiBlockBlockAfterModel,
		listContinuation: listContinuationModel,
		indentBlockList: indentBlockListModel,
		nestedContinued: nestedContinuedModel,
		manualIndent: manualIndentModel,
		multiSkipLevelDeep: multiSkipLevelDeepModel,
		continuationAfterDifferentList: continuationAfterDifferentListModel
	}
};

// Fixture group exercising the same Word inputs but in `enableSkipLevelLists: true` mode. Only the four
// inputs that contain a Word level skip are included — for them, the resulting model preserves the
// skip indent gaps instead of filling them with empty paragraph fillers.
export const skipLevelFixtures = {
	input: {
		nested,
		nestedMixed,
		nestedMultiple,
		indentBlockList,
		multiSkipLevelDeep
	},
	model: {
		nested: nestedSkipLevelModel,
		nestedMixed: nestedMixedSkipLevelModel,
		nestedMultiple: nestedMultipleSkipLevelModel,
		indentBlockList: indentBlockListSkipLevelModel,
		multiSkipLevelDeep: multiSkipLevelDeepSkipLevelModel
	}
};

// Safari.
import simpleSafari from './simple/input.safari.word2016.html?raw';
import styledSafari from './styled/input.safari.word2016.html?raw';
import multipleSafari from './multiple/input.safari.word2016.html?raw';
import multipleCombinedSafari from './multiple-combined/input.safari.word2016.html?raw';
import manyOneItemSafari from './many-one-item/input.safari.word2016.html?raw';
import heading1Safari from './heading1/input.safari.word2016.html?raw';
import heading3StyledSafari from './heading3-styled/input.safari.word2016.html?raw';
import heading7Safari from './heading7/input.safari.word2016.html?raw';
import resumeTemplateSafari from './resume-template/input.safari.word2016.html?raw';
import nestedSafari from './nested/input.safari.word2016.html?raw';
import nestedMixedSafari from './nested-mixed/input.safari.word2016.html?raw';
import nestedMultipleSafari from './nested-multiple/input.safari.word2016.html?raw';
import nestedMixedIdSafari from './nested-mixed-id/input.safari.word2016.html?raw';
import styledAnchorSafari from './styled-anchor/input.safari.word2016.html?raw';

import simpleNormalizedSafari from './simple/normalized.safari.word2016.html?raw';
import styledNormalizedSafari from './styled/normalized.safari.word2016.html?raw';
import multipleNormalizedSafari from './multiple/normalized.safari.word2016.html?raw';
import multipleCombinedNormalizedSafari from './multiple-combined/normalized.safari.word2016.html?raw';
import manyOneItemNormalizedSafari from './many-one-item/normalized.safari.word2016.html?raw';
import heading1NormalizedSafari from './heading1/normalized.safari.word2016.html?raw';
import heading3StyledNormalizedSafari from './heading3-styled/normalized.safari.word2016.html?raw';
import heading7NormalizedSafari from './heading7/normalized.safari.word2016.html?raw';
import resumeTemplateNormalizedSafari from './resume-template/normalized.safari.word2016.html?raw';
import nestedMultipleNormalizedSafari from './nested-multiple/normalized.safari.word2016.html?raw';
import nestedMixedIdNormalizedSafari from './nested-mixed-id/normalized.safari.word2016.html?raw';
import styledAnchorNormalizedSafari from './styled-anchor/normalized.safari.word2016.html?raw';

import styledSafariModel from './styled/model.safari.word2016.html?raw';
import resumeTemplateSafariModel from './resume-template/model.safari.word2016.html?raw';

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
			resumeTemplate: resumeTemplateSafari,
			nested: nestedSafari,
			nestedMixed: nestedMixedSafari,
			nestedMultiple: nestedMultipleSafari,
			nestedMixedId: nestedMixedIdSafari,
			styledAnchor: styledAnchorSafari
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
			resumeTemplate: resumeTemplateNormalizedSafari,
			nested: nestedNormalized,
			nestedMixed: nestedMixedNormalized,
			nestedMultiple: nestedMultipleNormalizedSafari,
			nestedMixedId: nestedMixedIdNormalizedSafari,
			styledAnchor: styledAnchorNormalizedSafari
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
			resumeTemplate: resumeTemplateSafariModel,
			nested: nestedModel,
			nestedMixed: nestedMixedModel,
			nestedMultiple: nestedMultipleModel,
			nestedMixedId: nestedMixedIdModel,
			styledAnchor: styledAnchorModel
		}
	}
};
