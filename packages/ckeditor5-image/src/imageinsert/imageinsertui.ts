/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinsert/imageinsertui
 */

import { Plugin, icons } from 'ckeditor5/src/core';
import type { Locale } from 'ckeditor5/src/utils';
import {
	SplitButtonView,
	createDropdown,
	CollapsibleView,
	type DropdownView,
	type View,
	type ButtonView
} from 'ckeditor5/src/ui';

import ImageInsertPanelView from './ui/imageinsertpanelview';
import type ReplaceImageSourceCommand from '../image/replaceimagesourcecommand';
import type UploadImageCommand from '../imageupload/uploadimagecommand';
import type InsertImageCommand from '../image/insertimagecommand';
import ImageInsertUrlView from './ui/imageinserturlview';

/**
 * The image insert dropdown plugin.
 *
 * For a detailed overview, check the {@glink features/images/image-upload/image-upload Image upload feature}
 * and {@glink features/images/images-inserting Insert images via source URL} documentation.
 *
 * Adds the `'insertImage'` dropdown to the {@link module:ui/componentfactory~ComponentFactory UI component factory}
 * and also the `imageInsert` dropdown as an alias for backward compatibility.
 */
export default class ImageInsertUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageInsertUI' as const;
	}

	/**
	 * The dropdown view responsible for displaying the image insert UI.
	 */
	public dropdownView?: DropdownView;

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const componentCreator = ( locale: Locale ) => {
			return this._createDropdownView( locale );
		};

		// Register `insertImage` dropdown and add `imageInsert` dropdown as an alias for backward compatibility.
		editor.ui.componentFactory.add( 'insertImage', componentCreator );
		editor.ui.componentFactory.add( 'imageInsert', componentCreator );

		editor.ui.componentFactory.add( 'insertImageView', locale => {
			const imageInsertView = new ImageInsertPanelView( locale, this._prepareIntegrations() );
			const collapsibleView = new CollapsibleView( locale, [ imageInsertView ] );
			const t = locale.t;

			collapsibleView.set( {
				label: t( 'Insert with link' ),
				isCollapsed: true
			} );

			return collapsibleView;
		} );
	}

	/**
	 * Creates the dropdown view.
	 *
	 * @param locale The localization services instance.
	 */
	private _createDropdownView( locale: Locale ): DropdownView {
		const editor = this.editor;
		const t = locale.t;

		const uploadImageCommand: UploadImageCommand | undefined = editor.commands.get( 'uploadImage' );
		const insertImageCommand: InsertImageCommand = editor.commands.get( 'insertImage' )!;

		let dropdownButton;

		if ( uploadImageCommand ) {
			const uploadImageButton = editor.ui.componentFactory.create( 'uploadImage' ) as ButtonView;

			uploadImageButton.extendTemplate( {
				attributes: {
					class: 'ck ck-button'
				}
			} );

			dropdownButton = new SplitButtonView( locale, uploadImageButton );
		}

		const dropdownView = createDropdown( locale, dropdownButton );

		if ( !uploadImageCommand ) {
			dropdownView.buttonView.set( {
				label: t( 'Insert image' ),
				icon: icons.image,
				tooltip: true
			} );
		}

		dropdownView.panelView.extendTemplate( {
			attributes: {
				class: 'ck-image-insert__panel'
			}
		} );

		this.dropdownView = dropdownView;

		dropdownView.bind( 'isEnabled' ).to( uploadImageCommand || insertImageCommand );

		dropdownView.once( 'change:isOpen', () => {
			const imageInsertPanelView = new ImageInsertPanelView( editor.locale, this._prepareIntegrations() );

			imageInsertPanelView.delegate( 'submit', 'cancel' ).to( dropdownView );
			dropdownView.panelView.children.add( imageInsertPanelView );
		} );

		dropdownView.on( 'submit', () => {
			closePanel();
		} );

		dropdownView.on( 'cancel', () => {
			closePanel();
		} );

		function closePanel() {
			editor.editing.view.focus();
			dropdownView.isOpen = false;
		}

		return dropdownView;
	}

	/**
	 * TODO
	 */
	private _prepareIntegrations(): Array<View> {
		const editor = this.editor;
		const items = editor.config.get( 'image.insert.integrations' ) || [ 'insertImageViaUrl' ];

		return items.map( item => {
			if ( item == 'insertImageViaUrl' ) {
				return this._createInsertUrlView();
			}
			else if ( item == 'openCKFinder' && editor.ui.componentFactory.has( 'ckfinder' ) ) {
				return this._createCKFinderView();
			}
			else {
				return this._createGenericIntegration( item );
			}
		} );
	}

	/**
	 * TODO
	 */
	private _createInsertUrlView() {
		const replaceImageSourceCommand: ReplaceImageSourceCommand = this.editor.commands.get( 'replaceImageSource' )!;
		const imageInsertUrlView = new ImageInsertUrlView( this.editor.locale );

		imageInsertUrlView.delegate( 'submit', 'cancel' ).to( this.dropdownView! );
		imageInsertUrlView.bind( 'isImageSelected' ).to( replaceImageSourceCommand, 'isEnabled' );

		// Set initial value because integrations are created on first dropdown open.
		imageInsertUrlView.imageURLInputValue = replaceImageSourceCommand.value || '';

		this.dropdownView!.on( 'change:isOpen', () => {
			if ( this.dropdownView!.isOpen ) {
				// Make sure that each time the panel shows up, the URL field remains in sync with the value of
				// the command. If the user typed in the input, then canceled and re-opened it without changing
				// the value of the media command (e.g. because they didn't change the selection), they would see
				// the old value instead of the actual value of the command.
				imageInsertUrlView.imageURLInputValue = replaceImageSourceCommand.value || '';
			}

			// Note: Use the low priority to make sure the following listener starts working after the
			// default action of the drop-down is executed (i.e. the panel showed up). Otherwise, the
			// invisible form/input cannot be focused/selected.
		}, { priority: 'low' } );

		this.dropdownView!.on( 'submit', () => {
			if ( replaceImageSourceCommand.isEnabled ) {
				this.editor.execute( 'replaceImageSource', { source: imageInsertUrlView.imageURLInputValue } );
			} else {
				this.editor.execute( 'insertImage', { source: imageInsertUrlView.imageURLInputValue } );
			}
		} );

		return imageInsertUrlView;
	}

	/**
	 * TODO
	 */
	private _createCKFinderView() {
		const ckFinderButton = this._createGenericIntegration( 'ckfinder' );

		ckFinderButton.set( 'class', 'ck-image-insert__ck-finder-button' );

		return ckFinderButton;
	}

	/**
	 * TODO
	 */
	private _createGenericIntegration( name: string ) {
		const button = this.editor.ui.componentFactory.create( name ) as ButtonView;

		button.set( 'withText', true );

		// We want to close the dropdown panel view when user clicks the ckFinderButton.
		button.delegate( 'execute' ).to( this.dropdownView!, 'cancel' );

		return button;
	}
}
