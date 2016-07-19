/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Plugin from './plugin.js';

/**
 * The base class for CKEditor feature classes. Features are main way to enhance CKEditor abilities with tools,
 * utilities, services and components.
 *
 * The main responsibilities for Feature are:
 * * setting required dependencies (see {@link ckeditor5.Plugin#requires},
 * * configuring, instantiating and registering commands to editor,
 * * registering converters to editor (if the feature operates on Tree Model),
 * * setting and registering UI components (if the feature uses it).
 *
 * @memberOf ckeditor5
 */
export default class Feature extends Plugin {}
