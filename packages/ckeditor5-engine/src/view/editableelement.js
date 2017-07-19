/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/editableelement
 */

import ContainerElement from './containerelement';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';

const documentSymbol = Symbol( 'document' );

/**
 * Editable element which can be a {@link module:engine/view/rooteditableelement~RootEditableElement root}
 * or nested editable area in the editor.
 *
 * Editable is automatically read-only when its {module:engine/view/document~Document Document} is read-only.
 *
 * @extends module:engine/view/containerelement~ContainerElement
 * @mixes module:utils/observablemixin~ObservableMixin
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

		/**
		 * The {@link module:engine/view/document~Document} which is an owner of this root.
		 * Can only by set once.
		 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-editableelement-document-already-set`
		 * when document is already set.
		 *
		 * @member {module:engine/view/document~Document} #document
		 */
	}

	get document() {
		return this.getCustomProperty( documentSymbol );
	}

	set document( document ) {
		if ( this.getCustomProperty( documentSymbol ) ) {
			/**
			 * View document is already set. It can only be set once.
			 *
			 * @error view-editableelement-document-already-set
			 */
			throw new CKEditorError( 'view-editableelement-document-already-set: View document is already set.' );
		}

		this.setCustomProperty( documentSymbol, document );

		this.bind( 'isReadOnly' ).to( document );

		this.bind( 'isFocused' ).to(
			document,
			'isFocused',
			isFocused => isFocused && document.selection.editableElement == this
		);

		// Update focus state before each rendering. Rendering should not change neither the selection nor the value of
		// document.isFocused property.
		this.listenTo( document, 'render', () => {
			this.isFocused = document.isFocused && document.selection.editableElement == this;
		}, { priority: 'high' } );
	}
}

mix( EditableElement, ObservableMixin );
