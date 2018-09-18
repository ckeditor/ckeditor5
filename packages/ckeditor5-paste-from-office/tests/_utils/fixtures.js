/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { getBrowserName } from './browser';

import { fixtures as basicStyles, browserFixtures as basicStylesBrowser } from '../_data/basic-styles/index.js';

const fixtures = {
	'basic-styles': basicStyles
};

const browserFixtures = {
	'basic-styles': basicStylesBrowser
};

export function getFixtures( group ) {
	if ( !fixtures[ group ] ) {
		return {};
	}

	const browser = getBrowserName();

	if ( browser && browserFixtures[ group ] && browserFixtures[ group ][ browser ] ) {
		const browserGroup = browserFixtures[ group ][ browser ];

		for ( const fixtureGroup in browserGroup ) {
			for ( const fixtureName in browserGroup[ fixtureGroup ] ) {
				fixtures[ group ][ fixtureGroup ][ fixtureName ] = browserGroup[ fixtureGroup ][ fixtureName ];
			}
		}
	}

	return fixtures[ group ];
}
