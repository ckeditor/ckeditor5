/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import Input from './input';
import Delete from './delete';

/**
 * The typing feature. Handles typing.
 *
 * @memberOf typing
 * @extends core.Feature
 */
export default class Typing extends Feature {
	static get requires() {
		return [ Input, Delete ];
	}
}
