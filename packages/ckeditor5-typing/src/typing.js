/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module typing/typing
 */

import Plugin from '../core/plugin.js';
import Input from './input.js';
import Delete from './delete.js';

/**
 * The typing feature. Handles typing.
 *
 * @extends core.Plugin
 */
export default class Typing extends Plugin {
	static get requires() {
		return [ Input, Delete ];
	}
}
