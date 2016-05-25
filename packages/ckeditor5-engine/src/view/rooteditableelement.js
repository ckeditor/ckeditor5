/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditableElement from './editableelement.js';

export default class RootEditableElement extends EditableElement {
	/**
	 * Creates an root editable element.
	 */
	constructor( document, name, rootName ) {
		super( name );

		/**
		 * {@link engine.view.Document} that is an owner of this root.
		 *
		 * @private
		 * @member {engine.view.Document} engine.view.RootEditableElement#_document
		 */
		this._document = document;

		/**
		 * Name of this root inside {@link engine.view.Document} that is an owner of this root.
		 *
		 * @readonly
		 * @member {String} engine.view.RootEditableElement#rootName
		 */
		this.rootName = rootName;

		/**
		 * Whether the editable is focused.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} engine.view.RootEditableElement#isFocused
		 */
		this.set( 'isFocused', false );
	}

	/**
	 * Gets {@link engine.view.Document} reference.
	 *
	 * @returns {engine.view.Document|null} View Document of the node or null.
	 */
	getDocument() {
		return this._document;
	}
}
