/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import EditableElement from './editableelement.js';

/**
 * Roots of nodes trees in data view. They are editable element binded to editable DOM element, which are the base for
 * the editable areas.
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
		 * This property is updated by the {@link engine.view.obsever.FocusObserver}.
		 * If the {@link engine.view.obsever.FocusObserver} is disabled this property will not change.
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
