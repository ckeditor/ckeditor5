/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Plugin from './plugin.js';

/**
 * The base class for CKEditor feature classes. Features are main way to enhance CKEditor abilities with tools,
 * utilities, services and components.
 *
 * The main responsibilities for Feature are:
 * * setting required dependencies (see {@link core.Plugin#requires},
 * * configuring, instantiating and registering commands to editor,
 * * registering converters to editor (if the feature operates on Tree Model),
 * * setting and registering UI components (if the feature uses it).
 *
 * @memberOf core
 */
export default class Feature extends Plugin {
	/**
	 * Creates a new Plugin instance.
	 *
	 * @param {core.Editor} editor
	 */
	constructor( editor ) {
		super( editor );
	}

	/**
	 * Initializes the feature. Should be overwritten by child classes.
	 */
	init() {}
}
