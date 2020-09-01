/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinsert/imageinsertui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageInsertPanelView from './ui/imageinsertpanelview';

import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview';
import { createImageTypeRegExp, prepareIntegrations } from './utils';

import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';

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

		splitButtonView.actionView = this._createFileDialogButtonView( locale );

		panelView.children.add( imageInsertView );

		return this._setUpDropdown( dropdownView, imageInsertView, command );
	}

	/**
	 * Creates and sets up file dialog button view.
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
	 *
	 * @private
	 * @returns {module:upload/ui/filedialogbuttonview~FileDialogButtonView}
	 */
	_createFileDialogButtonView( locale ) {
		const editor = this.editor;
		const t = locale.t;
		const imageTypes = editor.config.get( 'image.upload.types' );
		const fileDialogButtonView = new FileDialogButtonView( locale );
		const imageTypesRegExp = createImageTypeRegExp( imageTypes );
		const command = editor.commands.get( 'imageUpload' );

		fileDialogButtonView.set( {
			acceptedType: imageTypes.map( type => `image/${ type }` ).join( ',' ),
			allowMultipleFiles: true
		} );

		fileDialogButtonView.buttonView.set( {
			label: t( 'Upload image' ),
			icon: imageIcon,
			tooltip: true
		} );

		fileDialogButtonView.buttonView.bind( 'isEnabled' ).to( command );

		fileDialogButtonView.on( 'done', ( evt, files ) => {
			const imagesToUpload = Array.from( files ).filter( file => imageTypesRegExp.test( file.type ) );

			if ( imagesToUpload.length ) {
				editor.execute( 'imageUpload', { file: imagesToUpload } );
			}
		} );

		return fileDialogButtonView;
	}
}
