/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/editableelement
 */

import ContainerElement from './containerelement';

import mix from 'ckeditor5-utils/src/mix';
import ObservableMixin from 'ckeditor5-utils/src/observablemixin';

const documentSymbol = Symbol( 'document' );

/**
 * Editable element which can be a {@link module:engine/view/rooteditableelement~RootEditableElement root}
 * or nested editable area in the editor.
 *
 * @extends module:engine/view/containerelement~ContainerElement
 * @mixes module:utils/observablemixin~ObservaleMixin
 */
export default class EditableElement extends ContainerElement {
	/**
	 * Creates an editable element.
	 */
	constructor( name, attrs, children ) {
		super( name, attrs, children );

		/**
		 * Whether the editable is in read-write or read-only mode.
		 *
		 * @observable
		 * @member {Boolean} module:engine/view/editableelement~EditableElement#isReadOnly
		 */
		this.set( 'isReadOnly', false );

		/**
		 * Whether the editable is focused.
		 *
		 * This property updates when {@link module:engine/view/document~Document#isFocused document.isFocused} is changed and after each
		 * {@link module:engine/view/document~Document#render render} method call.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} module:engine/view/editableelement~EditableElement#isFocused
		 */
		this.set( 'isFocused', false );
	}

	/**
	 * Gets {@link module:engine/view/document~Document View document} reference that owns this editable element.
	 *
	 * @type {module:engine/view/document~Document}
	 */
	get document() {
		return this.getCustomProperty( documentSymbol );
	}

	/**
	 * Sets {@link module:engine/view/document~Document} that is an owner of this root.
	 *
	 * @type {module:engine/view/document~Document}
	 */
	set document( document ) {
		this.setCustomProperty( documentSymbol, document );

		this.bind( 'isFocused' ).to(
			document,
			'isFocused',
			( isFocused ) => isFocused && document.selection.editableElement == this
		);

		// Update focus state after each rendering. Selection might be moved to different editable before rendering,
		// but this does not mean that editable has focus - it will be placed there after rendering.
		this.listenTo( document, 'render', () => {
			this.isFocused = document.isFocused && document.selection.editableElement == this;
		}, { priority: 'low' } );
	}
}

mix( EditableElement, ObservableMixin );
