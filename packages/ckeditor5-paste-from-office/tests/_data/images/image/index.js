/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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
	}
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

export const browserFixtures = {
	chrome: Object.assign( {}, genericFixtures, {
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
	} ),

	firefox: Object.assign( {}, genericFixtures, {
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
	} ),

	edge: Object.assign( {}, genericFixtures, {
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
	} )
};
