/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ContainerElement from './containerelement.js';

import mix from '../../utils/mix.js';
import ObservableMixin from '../../utils/observablemixin.js';

/**
 * Editable element which can be a {@link view.engine.RootEditableElement root} or nested editable area in the editor.
 *
 * @memberOf engine.view
 * @extends engine.view.ContainerElement
 * @mixes utils.ObservaleMixin
 */
export default class EditableElement extends ContainerElement {
	/**
	 * Creates an editable element.
	 */
	constructor( document, name, attrs, children ) {
		super( name, attrs, children );

		/**
		 * {@link engine.view.Document} that is an owner of this root.
		 *
		 * @private
		 * @member {engine.view.Document} engine.view.RootEditableElement#_document
		 */
		this._document = document;

		/**
		 * Whether the editable is in read-write or read-only mode.
		 *
		 * @observable
		 * @member {Boolean} engine.view.EditableElement#isReadOnly
		 */
		this.set( 'isReadOnly', false );

		/**
		 * Whether the editable is focused.
		 *
		 * This property updates when {@link engine.view.Document#isFocused} or {@link engine.view.Document#selectedEditable}
		 * change.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} engine.view.RootEditableElement#isFocused
		 */
		this.bind( 'isFocused' ).to(
			document,
			'isFocused',
			document,
			'selectedEditable',
			( isFocused, selectedEditable ) => isFocused && selectedEditable == this
		);
	}

	/**
	 * Gets the {@link engine.view.Document} reference.
	 *
	 * @returns {engine.view.Document|null} View Document of the node or `null`.
	 */
	getDocument() {
		return this._document;
	}
}

mix( EditableElement, ObservableMixin );
