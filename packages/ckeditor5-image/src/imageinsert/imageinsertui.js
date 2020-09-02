/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinsert/imageinsertui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageInsertPanelView from './ui/imageinsertpanelview';
import { prepareIntegrations } from './utils';

import { isImage } from '../image/utils';

/**
 * The image upload button plugin.
 *
 * For a detailed overview, check the {@glink features/image-upload/image-upload Image upload feature} documentation.
 *
 * Adds the `'imageUpload'` dropdown to the {@link module:ui/componentfactory~ComponentFactory UI component factory}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageInsertUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageInsertUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'imageInsert', locale => {
			return this._createDropdownView( locale );
		} );
	}

	/**
	 * Sets up the dropdown view.
	 *
	 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView A dropdownView.
	 * @param {module:image/imageinsert/ui/imageinsertpanelview~ImageInsertPanelView} imageInsertView An imageInsertView.
	 * @param {module:core/command~Command} command An imageInsert command
	 *
	 * @private
	 * @returns {module:ui/dropdown/dropdownview~DropdownView}
	 */
	_setUpDropdown( dropdownView, imageInsertView, command ) {
		const editor = this.editor;
		const t = editor.t;
		const insertButtonView = imageInsertView.insertButtonView;
		const insertImageViaUrlForm = imageInsertView.getIntegration( 'insertImageViaUrl' );

		dropdownView.bind( 'isEnabled' ).to( command );

		dropdownView.on( 'change:isOpen', () => {
			const selectedElement = editor.model.document.selection.getSelectedElement();

			if ( dropdownView.isOpen ) {
				imageInsertView.focus();

				if ( isImage( selectedElement ) ) {
					imageInsertView.imageURLInputValue = selectedElement.getAttribute( 'src' );
					insertButtonView.label = t( 'Update' );
					insertImageViaUrlForm.label = t( 'Update image URL' );
				} else {
					imageInsertView.imageURLInputValue = '';
					insertButtonView.label = t( 'Insert' );
					insertImageViaUrlForm.label = t( 'Insert image via URL' );
				}
			}
		} );

		imageInsertView.delegate( 'submit', 'cancel' ).to( dropdownView );
		this.delegate( 'cancel' ).to( dropdownView );

		dropdownView.on( 'submit', () => {
			closePanel();
			onSubmit();
		} );

		dropdownView.on( 'cancel', () => {
			closePanel();
		} );

		function onSubmit() {
			const selectedElement = editor.model.document.selection.getSelectedElement();

			if ( isImage( selectedElement ) ) {
				editor.model.change( writer => {
					writer.setAttribute( 'src', imageInsertView.imageURLInputValue, selectedElement );
					writer.removeAttribute( 'srcset', selectedElement );
					writer.removeAttribute( 'sizes', selectedElement );
				} );
			} else {
				editor.execute( 'imageInsert', { source: imageInsertView.imageURLInputValue } );
			}
		}

		function closePanel() {
			editor.editing.view.focus();
			dropdownView.isOpen = false;
		}

		return dropdownView;
	}

	/**
	 * Creates the dropdown view.
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
	 *
	 * @private
	 * @returns {module:ui/dropdown/dropdownview~DropdownView}
	 */
	_createDropdownView( locale ) {
		const editor = this.editor;
		const imageInsertView = new ImageInsertPanelView( locale, prepareIntegrations( editor ) );
		const command = editor.commands.get( 'imageUpload' );

		const dropdownView = imageInsertView.dropdownView;
		const panelView = dropdownView.panelView;
		const splitButtonView = dropdownView.buttonView;

		splitButtonView.actionView = editor.ui.componentFactory.create( 'imageUpload' );

		panelView.children.add( imageInsertView );

		return this._setUpDropdown( dropdownView, imageInsertView, command );
	}
}
