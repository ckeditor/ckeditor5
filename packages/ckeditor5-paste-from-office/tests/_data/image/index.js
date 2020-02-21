/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// Generic.
import offline from './offline/input.word2016.html';
import linked from './linked/input.word2016.html';
import rotated from './rotated/input.word2016.html';
import wrapped from './wrapped/input.word2016.html';
import alternativeText from './alternative-text/input.word2016.html';
import reflection from './reflection/input.word2016.html';
import adjacentGroups from './adjacent-groups/input.word2016.html';
import onlineOffline from './online-offline/input.word2016.html';
import shapesOnlineOffline from './shapes-online-offline/input.word2016.html';

import offlineNormalized from './offline/normalized.word2016.html';
import linkedNormalized from './linked/normalized.word2016.html';
import rotatedNormalized from './rotated/normalized.word2016.html';
import wrappedNormalized from './wrapped/normalized.word2016.html';
import alternativeTextNormalized from './alternative-text/normalized.word2016.html';
import reflectionNormalized from './reflection/normalized.word2016.html';
import adjacentGroupsNormalized from './adjacent-groups/normalized.word2016.html';
import onlineOfflineNormalized from './online-offline/normalized.word2016.html';
import shapesOnlineOfflineNormalized from './shapes-online-offline/normalized.word2016.html';

import offlineModel from './offline/model.word2016.html';
import linkedModel from './linked/model.word2016.html';
import rotatedModel from './rotated/model.word2016.html';
import wrappedModel from './wrapped/model.word2016.html';
import alternativeTextModel from './alternative-text/model.word2016.html';
import reflectionModel from './reflection/model.word2016.html';
import adjacentGroupsModel from './adjacent-groups/model.word2016.html';
import onlineOfflineModel from './online-offline/model.word2016.html';
import shapesOnlineOfflineModel from './shapes-online-offline/model.word2016.html';

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
		shapesOnlineOffline
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
		shapesOnlineOffline: shapesOnlineOfflineNormalized
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
		shapesOnlineOffline: shapesOnlineOfflineModel
	},
	inputBlob: {}
};

export const fixtures = genericFixtures;

// Browser specific.

// Chrome
import offlineRtfChrome from './offline/input.chrome.word2016.rtf';
import linkedRtfChrome from './linked/input.chrome.word2016.rtf';
import rotatedRtfChrome from './rotated/input.chrome.word2016.rtf';
import wrappedRtfChrome from './wrapped/input.chrome.word2016.rtf';
import alternativeTextRtfChrome from './alternative-text/input.chrome.word2016.rtf';
import reflectionRtfChrome from './reflection/input.chrome.word2016.rtf';
import adjacentGroupsRtfChrome from './adjacent-groups/input.chrome.word2016.rtf';
import onlineOfflineRtfChrome from './online-offline/input.chrome.word2016.rtf';
import shapesOnlineOfflineRtfChrome from './shapes-online-offline/input.chrome.word2016.rtf';

// Firefox
import offlineRtfFirefox from './offline/input.firefox.word2016.rtf';
import linkedRtfFirefox from './linked/input.firefox.word2016.rtf';
import rotatedRtfFirefox from './rotated/input.firefox.word2016.rtf';
import wrappedRtfFirefox from './wrapped/input.firefox.word2016.rtf';
import alternativeTextRtfFirefox from './alternative-text/input.firefox.word2016.rtf';
import reflectionRtfFirefox from './reflection/input.firefox.word2016.rtf';
import adjacentGroupsRtfFirefox from './adjacent-groups/input.firefox.word2016.rtf';
import onlineOfflineRtfFirefox from './online-offline/input.firefox.word2016.rtf';
import shapesOnlineOfflineRtfFirefox from './shapes-online-offline/input.firefox.word2016.rtf';

// Edge
import offlineRtfEdge from './offline/input.edge.word2016.rtf';
import linkedRtfEdge from './linked/input.edge.word2016.rtf';
import rotatedRtfEdge from './rotated/input.edge.word2016.rtf';
import wrappedRtfEdge from './wrapped/input.edge.word2016.rtf';
import alternativeTextRtfEdge from './alternative-text/input.edge.word2016.rtf';
import reflectionRtfEdge from './reflection/input.edge.word2016.rtf';
import adjacentGroupsRtfEdge from './adjacent-groups/input.edge.word2016.rtf';
import onlineOfflineRtfEdge from './online-offline/input.edge.word2016.rtf';
import shapesOnlineOfflineRtfEdge from './shapes-online-offline/input.edge.word2016.rtf';

import adjacentGroupsModelEdge from './adjacent-groups/model.edge.word2016.html';

// Safari
import offlineSafari from './offline/input.safari.word2016.html';
import linkedSafari from './linked/input.safari.word2016.html';
import rotatedSafari from './rotated/input.safari.word2016.html';
import wrappedSafari from './wrapped/input.safari.word2016.html';
import alternativeTextSafari from './alternative-text/input.safari.word2016.html';
import reflectionSafari from './reflection/input.safari.word2016.html';
import adjacentGroupsSafari from './adjacent-groups/input.safari.word2016.html';
import onlineOfflineSafari from './online-offline/input.safari.word2016.html';
import shapesOnlineOfflineSafari from './shapes-online-offline/input.safari.word2016.html';

import offlineNormalizedSafari from './offline/normalized.safari.word2016.html';
import linkedNormalizedSafari from './linked/normalized.safari.word2016.html';
import rotatedNormalizedSafari from './rotated/normalized.safari.word2016.html';
import wrappedNormalizedSafari from './wrapped/normalized.safari.word2016.html';
import alternativeTextNormalizedSafari from './alternative-text/normalized.safari.word2016.html';
import reflectionNormalizedSafari from './reflection/normalized.safari.word2016.html';
import adjacentGroupsNormalizedSafari from './adjacent-groups/normalized.safari.word2016.html';
import onlineOfflineNormalizedSafari from './online-offline/normalized.safari.word2016.html';
import shapesOnlineOfflineNormalizedSafari from './shapes-online-offline/normalized.safari.word2016.html';

import offlineModelSafari from './offline/model.safari.word2016.html';
import linkedModelSafari from './linked/model.safari.word2016.html';
import rotatedModelSafari from './rotated/model.safari.word2016.html';
import wrappedModelSafari from './wrapped/model.safari.word2016.html';
import alternativeTextModelSafari from './alternative-text/model.safari.word2016.html';
import reflectionModelSafari from './reflection/model.safari.word2016.html';
import adjacentGroupsModelSafari from './adjacent-groups/model.safari.word2016.html';
import onlineOfflineModelSafari from './online-offline/model.safari.word2016.html';
import shapesOnlineOfflineModelSafari from './shapes-online-offline/model.safari.word2016.html';

export const browserFixtures = {
	chrome: {
		input: Object.assign( {}, genericFixtures.input ),
		normalized: Object.assign( {}, genericFixtures.normalized ),
		model: Object.assign( {}, genericFixtures.model ),
		inputRtf: {
			offline: offlineRtfChrome,
			linked: linkedRtfChrome,
			rotated: rotatedRtfChrome,
			wrapped: wrappedRtfChrome,
			alternativeText: alternativeTextRtfChrome,
			reflection: reflectionRtfChrome,
			adjacentGroups: adjacentGroupsRtfChrome,
			onlineOffline: onlineOfflineRtfChrome,
			shapesOnlineOffline: shapesOnlineOfflineRtfChrome
		}

	},

	firefox: {
		input: Object.assign( {}, genericFixtures.input ),
		normalized: Object.assign( {}, genericFixtures.normalized ),
		model: Object.assign( {}, genericFixtures.model ),
		inputRtf: {
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
