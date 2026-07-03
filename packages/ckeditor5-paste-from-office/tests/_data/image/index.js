/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

// Generic.
import offline from './offline/input.word2016.html?raw';
import linked from './linked/input.word2016.html?raw';
import rotated from './rotated/input.word2016.html?raw';
import wrapped from './wrapped/input.word2016.html?raw';
import alternativeText from './alternative-text/input.word2016.html?raw';
import reflection from './reflection/input.word2016.html?raw';
import adjacentGroups from './adjacent-groups/input.word2016.html?raw';
import onlineOffline from './online-offline/input.word2016.html?raw';
import shapesOnlineOffline from './shapes-online-offline/input.word2016.html?raw';
import mixedImagesFromFilesystem from './mixed-images-from-filesystem/input.word2023.html?raw';

import offlineNormalized from './offline/normalized.word2016.html?raw';
import linkedNormalized from './linked/normalized.word2016.html?raw';
import rotatedNormalized from './rotated/normalized.word2016.html?raw';
import wrappedNormalized from './wrapped/normalized.word2016.html?raw';
import alternativeTextNormalized from './alternative-text/normalized.word2016.html?raw';
import reflectionNormalized from './reflection/normalized.word2016.html?raw';
import adjacentGroupsNormalized from './adjacent-groups/normalized.word2016.html?raw';
import onlineOfflineNormalized from './online-offline/normalized.word2016.html?raw';
import shapesOnlineOfflineNormalized from './shapes-online-offline/normalized.word2016.html?raw';
import mixedImagesFromFilesystemNormalized from './mixed-images-from-filesystem/normalized.word2023.html?raw';

import offlineModel from './offline/model.word2016.html?raw';
import linkedModel from './linked/model.word2016.html?raw';
import rotatedModel from './rotated/model.word2016.html?raw';
import wrappedModel from './wrapped/model.word2016.html?raw';
import alternativeTextModel from './alternative-text/model.word2016.html?raw';
import reflectionModel from './reflection/model.word2016.html?raw';
import adjacentGroupsModel from './adjacent-groups/model.word2016.html?raw';
import onlineOfflineModel from './online-offline/model.word2016.html?raw';
import shapesOnlineOfflineModel from './shapes-online-offline/model.word2016.html?raw';
import mixedImagesFromFilesystemModel from './mixed-images-from-filesystem/model.word2023.html?raw';

import mixedImagesFromFilesystemBlob from './mixed-images-from-filesystem/input.word2023.rtf?raw';

const genericFixtures = {
	input: {
		offline,
		linked,
		rotated,
		wrapped,
		alternativeText,
		reflection,
		adjacentGroups,
		onlineOffline,
		shapesOnlineOffline,
		mixedImagesFromFilesystem
	},
	normalized: {
		offline: offlineNormalized,
		linked: linkedNormalized,
		rotated: rotatedNormalized,
		wrapped: wrappedNormalized,
		alternativeText: alternativeTextNormalized,
		reflection: reflectionNormalized,
		adjacentGroups: adjacentGroupsNormalized,
		onlineOffline: onlineOfflineNormalized,
		shapesOnlineOffline: shapesOnlineOfflineNormalized,
		mixedImagesFromFilesystem: mixedImagesFromFilesystemNormalized
	},
	model: {
		offline: offlineModel,
		linked: linkedModel,
		rotated: rotatedModel,
		wrapped: wrappedModel,
		alternativeText: alternativeTextModel,
		reflection: reflectionModel,
		adjacentGroups: adjacentGroupsModel,
		onlineOffline: onlineOfflineModel,
		shapesOnlineOffline: shapesOnlineOfflineModel,
		mixedImagesFromFilesystem: mixedImagesFromFilesystemModel
	},
	inputRtf: {
		mixedImagesFromFilesystem: mixedImagesFromFilesystemBlob
	}
};

export const fixtures = genericFixtures;

// Browser specific.

// Chrome
import offlineRtfChrome from './offline/input.chrome.word2016.rtf?raw';
import linkedRtfChrome from './linked/input.chrome.word2016.rtf?raw';
import rotatedRtfChrome from './rotated/input.chrome.word2016.rtf?raw';
import wrappedRtfChrome from './wrapped/input.chrome.word2016.rtf?raw';
import alternativeTextRtfChrome from './alternative-text/input.chrome.word2016.rtf?raw';
import reflectionRtfChrome from './reflection/input.chrome.word2016.rtf?raw';
import adjacentGroupsRtfChrome from './adjacent-groups/input.chrome.word2016.rtf?raw';
import onlineOfflineRtfChrome from './online-offline/input.chrome.word2016.rtf?raw';
import shapesOnlineOfflineRtfChrome from './shapes-online-offline/input.chrome.word2016.rtf?raw';
import noImgTagRtfChrome from './no-img-tag/input.chrome.word2016.rtf?raw';
import noImgTagRtfAltTextChrome from './no-img-tag-alt-text/input.chrome.word2016.rtf?raw';

import noImgTagChrome from './no-img-tag/input.chrome.word2016.html?raw';
import noImgTagAltTextChrome from './no-img-tag-alt-text/input.chrome.word2016.html?raw';

import noImgTagNormalizedChrome from './no-img-tag/normalized.chrome.word2016.html?raw';
import noImgTagNormalizedAltTextChrome from './no-img-tag-alt-text/normalized.chrome.word2016.html?raw';

import noImgTagModelChrome from './no-img-tag/model.chrome.word2016.html?raw';
import noImgTagModelAltTextChrome from './no-img-tag-alt-text/model.chrome.word2016.html?raw';

// Firefox
import offlineRtfFirefox from './offline/input.firefox.word2016.rtf?raw';
import linkedRtfFirefox from './linked/input.firefox.word2016.rtf?raw';
import rotatedRtfFirefox from './rotated/input.firefox.word2016.rtf?raw';
import wrappedRtfFirefox from './wrapped/input.firefox.word2016.rtf?raw';
import alternativeTextRtfFirefox from './alternative-text/input.firefox.word2016.rtf?raw';
import reflectionRtfFirefox from './reflection/input.firefox.word2016.rtf?raw';
import adjacentGroupsRtfFirefox from './adjacent-groups/input.firefox.word2016.rtf?raw';
import onlineOfflineRtfFirefox from './online-offline/input.firefox.word2016.rtf?raw';
import shapesOnlineOfflineRtfFirefox from './shapes-online-offline/input.firefox.word2016.rtf?raw';

// Edge
import offlineRtfEdge from './offline/input.edge.word2016.rtf?raw';
import linkedRtfEdge from './linked/input.edge.word2016.rtf?raw';
import rotatedRtfEdge from './rotated/input.edge.word2016.rtf?raw';
import wrappedRtfEdge from './wrapped/input.edge.word2016.rtf?raw';
import alternativeTextRtfEdge from './alternative-text/input.edge.word2016.rtf?raw';
import reflectionRtfEdge from './reflection/input.edge.word2016.rtf?raw';
import adjacentGroupsRtfEdge from './adjacent-groups/input.edge.word2016.rtf?raw';
import onlineOfflineRtfEdge from './online-offline/input.edge.word2016.rtf?raw';
import shapesOnlineOfflineRtfEdge from './shapes-online-offline/input.edge.word2016.rtf?raw';

import adjacentGroupsModelEdge from './adjacent-groups/model.edge.word2016.html?raw';

// Safari
import offlineSafari from './offline/input.safari.word2016.html?raw';
import linkedSafari from './linked/input.safari.word2016.html?raw';
import rotatedSafari from './rotated/input.safari.word2016.html?raw';
import wrappedSafari from './wrapped/input.safari.word2016.html?raw';
import alternativeTextSafari from './alternative-text/input.safari.word2016.html?raw';
import reflectionSafari from './reflection/input.safari.word2016.html?raw';
import adjacentGroupsSafari from './adjacent-groups/input.safari.word2016.html?raw';
import onlineOfflineSafari from './online-offline/input.safari.word2016.html?raw';
import shapesOnlineOfflineSafari from './shapes-online-offline/input.safari.word2016.html?raw';

import offlineNormalizedSafari from './offline/normalized.safari.word2016.html?raw';
import linkedNormalizedSafari from './linked/normalized.safari.word2016.html?raw';
import rotatedNormalizedSafari from './rotated/normalized.safari.word2016.html?raw';
import wrappedNormalizedSafari from './wrapped/normalized.safari.word2016.html?raw';
import alternativeTextNormalizedSafari from './alternative-text/normalized.safari.word2016.html?raw';
import reflectionNormalizedSafari from './reflection/normalized.safari.word2016.html?raw';
import adjacentGroupsNormalizedSafari from './adjacent-groups/normalized.safari.word2016.html?raw';
import onlineOfflineNormalizedSafari from './online-offline/normalized.safari.word2016.html?raw';
import shapesOnlineOfflineNormalizedSafari from './shapes-online-offline/normalized.safari.word2016.html?raw';

import offlineModelSafari from './offline/model.safari.word2016.html?raw';
import linkedModelSafari from './linked/model.safari.word2016.html?raw';
import rotatedModelSafari from './rotated/model.safari.word2016.html?raw';
import wrappedModelSafari from './wrapped/model.safari.word2016.html?raw';
import alternativeTextModelSafari from './alternative-text/model.safari.word2016.html?raw';
import reflectionModelSafari from './reflection/model.safari.word2016.html?raw';
import adjacentGroupsModelSafari from './adjacent-groups/model.safari.word2016.html?raw';
import onlineOfflineModelSafari from './online-offline/model.safari.word2016.html?raw';
import shapesOnlineOfflineModelSafari from './shapes-online-offline/model.safari.word2016.html?raw';

export const browserFixtures = {
	chrome: {
		input: {
			...genericFixtures.input,
			noImgTag: noImgTagChrome,
			noImgTagAltText: noImgTagAltTextChrome
		},
		normalized: {
			...genericFixtures.normalized,
			noImgTag: noImgTagNormalizedChrome,
			noImgTagAltText: noImgTagNormalizedAltTextChrome
		},
		model: {
			...genericFixtures.model,
			noImgTag: noImgTagModelChrome,
			noImgTagAltText: noImgTagModelAltTextChrome
		},
		inputRtf: {
			...genericFixtures.inputRtf,
			offline: offlineRtfChrome,
			linked: linkedRtfChrome,
			rotated: rotatedRtfChrome,
			wrapped: wrappedRtfChrome,
			alternativeText: alternativeTextRtfChrome,
			reflection: reflectionRtfChrome,
			adjacentGroups: adjacentGroupsRtfChrome,
			onlineOffline: onlineOfflineRtfChrome,
			shapesOnlineOffline: shapesOnlineOfflineRtfChrome,
			noImgTag: noImgTagRtfChrome,
			noImgTagAltText: noImgTagRtfAltTextChrome
		}
	},

	firefox: {
		input: Object.assign( {}, genericFixtures.input ),
		normalized: Object.assign( {}, genericFixtures.normalized ),
		model: Object.assign( {}, genericFixtures.model ),
		inputRtf: {
			...genericFixtures.inputRtf,
			offline: offlineRtfFirefox,
			linked: linkedRtfFirefox,
			rotated: rotatedRtfFirefox,
			wrapped: wrappedRtfFirefox,
			alternativeText: alternativeTextRtfFirefox,
			reflection: reflectionRtfFirefox,
			adjacentGroups: adjacentGroupsRtfFirefox,
			onlineOffline: onlineOfflineRtfFirefox,
			shapesOnlineOffline: shapesOnlineOfflineRtfFirefox
		}
	},

	edge: {
		input: Object.assign( {}, genericFixtures.input ),
		normalized: Object.assign( {}, genericFixtures.normalized ),
		model: Object.assign( {}, genericFixtures.model, {
			adjacentGroups: adjacentGroupsModelEdge
		} ),
		inputRtf: {
			...genericFixtures.inputRtf,
			offline: offlineRtfEdge,
			linked: linkedRtfEdge,
			rotated: rotatedRtfEdge,
			wrapped: wrappedRtfEdge,
			alternativeText: alternativeTextRtfEdge,
			reflection: reflectionRtfEdge,
			adjacentGroups: adjacentGroupsRtfEdge,
			onlineOffline: onlineOfflineRtfEdge,
			shapesOnlineOffline: shapesOnlineOfflineRtfEdge
		}
	},

	safari: {
		input: {
			offline: offlineSafari,
			linked: linkedSafari,
			rotated: rotatedSafari,
			wrapped: wrappedSafari,
			alternativeText: alternativeTextSafari,
			reflection: reflectionSafari,
			adjacentGroups: adjacentGroupsSafari,
			onlineOffline: onlineOfflineSafari,
			shapesOnlineOffline: shapesOnlineOfflineSafari
		},
		normalized: {
			offline: offlineNormalizedSafari,
			linked: linkedNormalizedSafari,
			rotated: rotatedNormalizedSafari,
			wrapped: wrappedNormalizedSafari,
			alternativeText: alternativeTextNormalizedSafari,
			reflection: reflectionNormalizedSafari,
			adjacentGroups: adjacentGroupsNormalizedSafari,
			onlineOffline: onlineOfflineNormalizedSafari,
			shapesOnlineOffline: shapesOnlineOfflineNormalizedSafari
		},
		model: {
			offline: offlineModelSafari,
			linked: linkedModelSafari,
			rotated: rotatedModelSafari,
			wrapped: wrappedModelSafari,
			alternativeText: alternativeTextModelSafari,
			reflection: reflectionModelSafari,
			adjacentGroups: adjacentGroupsModelSafari,
			onlineOffline: onlineOfflineModelSafari,
			shapesOnlineOffline: shapesOnlineOfflineModelSafari
		},
		inputRtf: {}
	}
};
