/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import BoldEngine from './boldengine.js';

export default class Bold extends Feature {
	static get requires() {
		return [ BoldEngine ];
	}

	init() {
	}
}
