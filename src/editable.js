/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import utils from './utils/utils.js';
import ObservableMixin from './utils/observablemixin.js';
import FocusObserver from './core/treeview/observer/focusobserver.js';

/**
 * Class representing a single editable element. It combines the {@link ckeditor5.Editable#viewElement editable view}
 * with the {@link ckeditor5.Editable#domElement editable DOM element} to which the view is rendering.
 *
 * @memberOf ckeditor5
 * @mixes utils.ObservaleMixin
 */
export default class Editable {
	/**
	 * Creates a new instance of the Editable class.
	 *
	 * @param {ckeditor5.Editor} editor The editor instance.
	 * @param {String} name The name of the editable.
	 */
	constructor( editor, name ) {
		/**
		 * The editor instance.
		 *
		 * @readonly
		 * @member {ckeditor5.Editor} ckeditor5.Editable#editor
		 */
		this.editor = editor;

		/**
		 * The name of the editable.
		 *
		 * @readonly
		 * @member {String} ckeditor5.Editable#name
		 */
		this.name = name;

		/**
		 * Whether the editable is in read-write or read-only mode.
		 *
		 * @observable
		 * @member {Boolean} ckeditor5.Editable#isEditable
		 */
		this.set( 'isEditable', true );

		/**
		 * Whether the editable is focused.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} ckeditor5.Editable#isFocused
		 */
		this.set( 'isFocused', false );

		/**
		 * The editable DOM element.
		 *
		 * @readonly
		 * @member {HTMLElement} ckeditor5.Editable#domElement
		 */

		/**
		 * The view element which holds this editable.
		 *
		 * @readonly
		 * @member {core.treeView.Element} ckeditor5.Editable#viewElement
		 */
	}

	/**
	 * Binds the {@link ckeditor5.Editable#viewElement editable's view} to a concrete DOM element.
	 *
	 * @param {HTMLElement} domElement The DOM element which holds the editable.
	 */
	bindTo( domElement ) {
		const editingView = this.editor.editing.view;
		const viewElement = editingView.createRoot( domElement, this.name );

		this.domElement = domElement;
		this.viewElement = viewElement;

		// Move to EditingController constructor.
		editingView.addObserver( FocusObserver );

		this.listenTo( editingView, 'focus', ( evt, data ) => {
			if ( data.target === this.viewElement ) {
				this.isFocused = true;
			}
		} );

		this.listenTo( editingView, 'blur', ( evt, data ) => {
			if ( data.target === this.viewElement ) {
				this.isFocused = false;
			}
		} );
	}

	/**
	 * Destroys the editable.
	 */
	destroy() {
		this.stopListening();
		this.domElement = this.viewElement = null;
	}
}

utils.mix( Editable, ObservableMixin );
