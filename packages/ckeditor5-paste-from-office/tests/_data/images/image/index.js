/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

// Default.
import offline from './offline/input.word2016.html';
import linked from './linked/input.word2016.html';
import rotated from './rotated/input.word2016.html';
import wrapped from './wrapped/input.word2016.html';
import alternativeText from './alternative-text/input.word2016.html';
import reflection from './reflection/input.word2016.html';
import adjacentGroups from './adjacent-groups/input.word2016.html';
import onlineOffline from './online-offline/input.word2016.html';
import shapesOnlineOffline from './shapes-online-offline/input.word2016.html';

import offlineRtf from './offline/input.word2016.rtf';
import linkedRtf from './linked/input.word2016.rtf';
import rotatedRtf from './rotated/input.word2016.rtf';
import wrappedRtf from './wrapped/input.word2016.rtf';
import alternativeTextRtf from './alternative-text/input.word2016.rtf';
import reflectionRtf from './reflection/input.word2016.rtf';
import adjacentGroupsRtf from './adjacent-groups/input.word2016.rtf';
import onlineOfflineRtf from './online-offline/input.word2016.rtf';
import shapesOnlineOfflineRtf from './shapes-online-offline/input.word2016.rtf';

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

export const fixtures = {
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
	inputRtf: {
		offline: offlineRtf,
		linked: linkedRtf,
		rotated: rotatedRtf,
		wrapped: wrappedRtf,
		alternativeText: alternativeTextRtf,
		reflection: reflectionRtf,
		adjacentGroups: adjacentGroupsRtf,
		onlineOffline: onlineOfflineRtf,
		shapesOnlineOffline: shapesOnlineOfflineRtf
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

export const browserFixtures = {};
