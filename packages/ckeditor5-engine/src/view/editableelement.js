/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/editableelement
 */

import ContainerElement from './containerelement';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';

/**
 * Editable element which can be a {@link module:engine/view/rooteditableelement~RootEditableElement root}
 * or nested editable area in the editor.
 *
 * Editable is automatically read-only when its {@link module:engine/view/document~Document Document} is read-only.
 *
 * The constructor of this class shouldn't be used directly. To create new `EditableElement` use the
 * {@link module:engine/view/downcastwriter~DowncastWriter#createEditableElement `downcastWriter#createEditableElement()`} method.
 *
 * @extends module:engine/view/containerelement~ContainerElement
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class EditableElement extends ContainerElement {
	/**
	 * Creates an editable element.
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#createEditableElement
	 * @protected
	 */
	constructor( document, name, attrs, children ) {
		super( document, name, attrs, children );

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
		 * This property updates when {@link module:engine/view/document~Document#isFocused document.isFocused} or view
		 * selection is changed.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} module:engine/view/editableelement~EditableElement#isFocused
		 */
		this.set( 'isFocused', false );

		this.bind( 'isReadOnly' ).to( document );

		this.bind( 'isFocused' ).to(
			document,
			'isFocused',
			isFocused => isFocused && document.selection.editableElement == this
		);

		// Update focus state based on selection changes.
		this.listenTo( document.selection, 'change', () => {
			this.isFocused = document.isFocused && document.selection.editableElement == this;
		} );
	}

	/**
	 * Checks whether this object is of the given.
	 *
	 *		editableElement.is( 'editableElement' ); // -> true
	 *		editableElement.is( 'element' ); // -> true
	 *		editableElement.is( 'node' ); // -> true
	 *		editableElement.is( 'view:editableElement' ); // -> true
	 *		editableElement.is( 'view:element' ); // -> true
	 *		editableElement.is( 'view:node' ); // -> true
	 *
	 *		editableElement.is( 'model:element' ); // -> false
	 *		editableElement.is( 'documentFragment' ); // -> false
	 *
	 * Assuming that the object being checked is an editbale element, you can also check its
	 * {@link module:engine/view/editableelement~EditableElement#name name}:
	 *
	 *		editableElement.is( 'div' ); // -> true if this is a div element
	 *		editableElement.is( 'editableElement', 'div' ); // -> same as above
	 *		text.is( 'div' ); -> false
	 *
	 * {@link module:engine/view/node~Node#is Check the entire list of view objects} which implement the `is()` method.
	 *
	 * @param {String} type Type to check when `name` parameter is present.
	 * Otherwise, it acts like the `name` parameter.
	 * @param {String} [name] Element name.
	 * @returns {Boolean}
	 */
	is( type, name = null ) {
		if ( !name ) {
			return type == 'editableElement' || type == 'containerElement' || type == 'element' || type == this.name || type == 'node';
		} else {
			return name == this.name && ( type == 'editableElement' || type == 'containerElement' || type == 'element' );
		}
	}

	destroy() {
		this.stopListening();
	}
}

mix( EditableElement, ObservableMixin );
