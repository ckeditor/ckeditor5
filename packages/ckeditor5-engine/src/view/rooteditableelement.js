/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditableElement from './editableelement.js';

/**
 * Class representing a single root in the data view. A root can be either {@link #isReadOnly editable or read-only}, but
 * in both cases it is called "an editable". Roots can contain other {@link engine.view.EditableElement editable elements}
 * making them "nested editables".
 *
 * @memberOf engine.view
 * @extends engine.view.EditableElement
 */
export default class RootEditableElement extends EditableElement {
	/**
	 * Creates root editable element.
	 *
	 * @param {engine.view.Document} document {@link engine.view.Document} that is an owner of the root.
	 * @param {String} name Node name.
	 * @param {String} [rootName='main'] Root name inside parent {@link engine.view.Document}.
	 */
	constructor( document, name, rootName = 'main' ) {
		super( document, name );

		/**
		 * Name of this root inside {@link engine.view.Document} that is an owner of this root.
		 *
		 * @readonly
		 * @member {String} engine.view.RootEditableElement#rootName
		 */
		this.rootName = rootName;
	}
}
