/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageupload/imageuploadui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageUploadPanelView from './ui/imageuploadpanelview';

import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview';
import { createImageTypeRegExp } from './utils';

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
export default class ImageUploadUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageUploadUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const command = editor.commands.get( 'imageUpload' );

		editor.ui.componentFactory.add( 'imageUpload', locale => {
			const imageUploadView = new ImageUploadPanelView( locale );
			const dropdownView = imageUploadView.dropdownView;
			const panelView = dropdownView.panelView;
			const splitButtonView = dropdownView.buttonView;

			const fileDialogButtonView = this._createFileDialogButtonView( locale );

			panelView.children.add( imageUploadView );

			splitButtonView.on( 'execute', () => {
				fileDialogButtonView.buttonView.fire( 'execute' );
			} );

			return this._setUpDropdown( dropdownView, imageUploadView, command );
		} );
	}

	/**
	 * Sets up the dropdown view.
	 *
	 * @private
	 * @returns {module:ui/dropdown/dropdownview~DropdownView}
	 */
	_setUpDropdown( dropdownView, imageUploadView, command ) {
		const editor = this.editor;
		const t = editor.t;
		const insertButtonView = imageUploadView.insertButtonView;

		dropdownView.bind( 'isEnabled' ).to( command );

		dropdownView.on( 'change:isOpen', evtInfo => {
			const selectedElement = editor.model.document.selection.getSelectedElement();

			if ( evtInfo.source.isOpen ) {
				imageUploadView.focus();

				if ( isImage( selectedElement ) && selectedElement.getAttribute( 'src' ) ) {
					imageUploadView.imageURLInputValue = selectedElement.getAttribute( 'src' );
					insertButtonView.label = t( 'Update' );
				} else {
					imageUploadView.imageURLInputValue = null;
					insertButtonView.label = t( 'Insert' );
				}
			}
		} );

		imageUploadView.delegate( 'submit', 'cancel' ).to( dropdownView );

		dropdownView.on( 'submit', () => {
			closePanel();
			onSubmit();
		} );

		dropdownView.on( 'cancel', () => {
			closePanel();
		} );

		function onSubmit() {
			const selectedElement = editor.model.document.selection.getSelectedElement();

			if ( selectedElement && isImage( selectedElement ) ) {
				editor.model.enqueueChange( writer => {
					writer.setAttribute( 'src', imageUploadView.imageURLInputValue, selectedElement );
				} );
			} else {
				editor.execute( 'imageInsert', { source: this.imageURLInputValue } );
			}
		}

		function closePanel() {
			editor.editing.view.focus();
			dropdownView.isOpen = false;
		}

		return dropdownView;
	}

	/**
	 * Creates and sets up file dialog button view.
	 *
	 * @private
	 * @returns {module:upload/ui/filedialogbuttonview~FileDialogButtonView}
	 */
	_createFileDialogButtonView( locale ) {
		const editor = this.editor;
		const imageTypes = editor.config.get( 'image.upload.types' );
		const fileDialogButtonView = new FileDialogButtonView( locale );
		const imageTypesRegExp = createImageTypeRegExp( imageTypes );

		fileDialogButtonView.set( {
			acceptedType: imageTypes.map( type => `image/${ type }` ).join( ',' ),
			allowMultipleFiles: true
		} );

		fileDialogButtonView.render();
		fileDialogButtonView.on( 'done', ( evt, files ) => {
			const imagesToUpload = Array.from( files ).filter( file => imageTypesRegExp.test( file.type ) );

			if ( imagesToUpload.length ) {
				editor.execute( 'imageUpload', { file: imagesToUpload } );
			}
		} );

		return fileDialogButtonView;
	}
}
