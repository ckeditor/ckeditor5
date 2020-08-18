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
	afterInit() {
		const editor = this.editor;
		const command = editor.commands.get( 'imageUpload' );

		editor.ui.componentFactory.add( 'imageUpload', locale => {
			const imageUploadView = new ImageUploadPanelView( locale, prepareIntegrations( editor ) );

			const dropdownView = imageUploadView.dropdownView;
			const panelView = dropdownView.panelView;
			const splitButtonView = dropdownView.buttonView;

			splitButtonView.actionView = this._createFileDialogButtonView( locale );

			panelView.children.add( imageUploadView );

			return this._setUpDropdown( dropdownView, imageUploadView, command );
		} );
	}

	/**
	 * Sets up the dropdown view.
	 *
	 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdownView A dropdownView.
	 * @param {module:image/imageupload/ui/imageuploadpanelview~ImageUploadPanelView} imageUploadView An imageUploadView.
	 * @param {module:core/command~Command} command An imageUpload command
	 *
	 * @private
	 * @returns {module:ui/dropdown/dropdownview~DropdownView}
	 */
	_setUpDropdown( dropdownView, imageUploadView, command ) {
		const editor = this.editor;
		const t = editor.t;
		const insertButtonView = imageUploadView.insertButtonView;

		dropdownView.bind( 'isEnabled' ).to( command );

		dropdownView.on( 'change:isOpen', () => {
			const selectedElement = editor.model.document.selection.getSelectedElement();

			if ( dropdownView.isOpen ) {
				imageUploadView.focus();

				if ( isImage( selectedElement ) ) {
					imageUploadView.imageURLInputValue = selectedElement.getAttribute( 'src' );
					insertButtonView.label = t( 'Update' );
				} else {
					imageUploadView.imageURLInputValue = '';
					insertButtonView.label = t( 'Insert' );
				}
			}
		} );

		imageUploadView.delegate( 'submit', 'cancel' ).to( dropdownView );
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

			if ( selectedElement && isImage( selectedElement ) ) {
				editor.model.change( writer => {
					writer.setAttribute( 'src', imageUploadView.imageURLInputValue, selectedElement );
					writer.removeAttribute( 'srcset', selectedElement );
					writer.removeAttribute( 'sizes', selectedElement );
				} );
			} else {
				editor.execute( 'imageInsert', { source: imageUploadView.imageURLInputValue } );
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

		fileDialogButtonView.set( {
			acceptedType: imageTypes.map( type => `image/${ type }` ).join( ',' ),
			allowMultipleFiles: true
		} );

		fileDialogButtonView.buttonView.set( {
			label: t( 'Insert image' ),
			icon: imageIcon,
			tooltip: true
		} );

		fileDialogButtonView.on( 'done', ( evt, files ) => {
			const imagesToUpload = Array.from( files ).filter( file => imageTypesRegExp.test( file.type ) );

			if ( imagesToUpload.length ) {
				editor.execute( 'imageUpload', { file: imagesToUpload } );
			}
		} );

		return fileDialogButtonView;
	}
}
