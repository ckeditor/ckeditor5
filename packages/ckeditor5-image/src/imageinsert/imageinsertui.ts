/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinsert/imageinsertui
 */

import { Plugin, icons, type Command } from 'ckeditor5/src/core';
import ImageInsertPanelView from './ui/imageinsertpanelview';
import { SplitButtonView, createDropdown, type DropdownView } from 'ckeditor5/src/ui';
import { prepareIntegrations } from './utils';
import type { Locale } from 'ckeditor5/src/utils';

/**
 * The image insert dropdown plugin.
 *
 * For a detailed overview, check the {@glink features/images/image-upload/image-upload Image upload feature}
 * and {@glink features/images/image-upload/images-inserting#inserting-images-via-source-url Insert images via source URL} documentation.
 *
 * Adds the `'insertImage'` dropdown to the {@link module:ui/componentfactory~ComponentFactory UI component factory}
 * and also the `imageInsert` dropdown as an alias for backward compatibility.
 */
export default class ImageInsertUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ImageInsertUI' {
		return 'ImageInsertUI';
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
	}

	/**
	 * Creates the dropdown view.
	 *
	 * @param locale The localization services instance.
	 */
	private _createDropdownView( locale: Locale ): DropdownView {
		const editor = this.editor;
		const t = locale.t;

		const uploadImageCommand = editor.commands.get( 'uploadImage' );
		const insertImageCommand = editor.commands.get( 'insertImage' )!;

		this.dropdownView = createDropdown( locale, uploadImageCommand ? SplitButtonView : undefined );

		const buttonView = this.dropdownView.buttonView;
		const panelView = this.dropdownView.panelView;

		buttonView.set( {
			label: t( 'Insert image' ),
			icon: icons.image,
			tooltip: true
		} );

		panelView.extendTemplate( {
			attributes: {
				class: 'ck-image-insert__panel'
			}
		} );

		if ( uploadImageCommand ) {
			const splitButtonView = this.dropdownView.buttonView as SplitButtonView;

			( splitButtonView as any ).actionView = editor.ui.componentFactory.create( 'uploadImage' );
			// After we replaced action button with `uploadImage` component,
			// we have lost a proper styling and some minor visual quirks have appeared.
			// Brining back original split button classes helps fix the button styling
			// See https://github.com/ckeditor/ckeditor5/issues/7986.
			splitButtonView.actionView.extendTemplate( {
				attributes: {
					class: 'ck ck-button ck-splitbutton__action'
				}
			} );
		}

		return this._setUpDropdown( uploadImageCommand || insertImageCommand );
	}

	/**
	 * Sets up the dropdown view.
	 *
	 * @param command An uploadImage or insertImage command.
	 */
	private _setUpDropdown( command: Command ): DropdownView {
		const editor = this.editor;
		const t = editor.t;
		const dropdownView = this.dropdownView!;
		const panelView = dropdownView.panelView;
		const imageUtils = this.editor.plugins.get( 'ImageUtils' );
		const replaceImageSourceCommand = editor.commands.get( 'replaceImageSource' )!;

		let imageInsertView: ImageInsertPanelView;

		dropdownView.bind( 'isEnabled' ).to( command );

		dropdownView.once( 'change:isOpen', () => {
			imageInsertView = new ImageInsertPanelView( editor.locale, prepareIntegrations( editor ) );

			imageInsertView.delegate( 'submit', 'cancel' ).to( dropdownView );
			panelView.children.add( imageInsertView );
		} );

		dropdownView.on( 'change:isOpen', () => {
			const selectedElement = editor.model.document.selection.getSelectedElement()!;
			const insertButtonView = imageInsertView.insertButtonView;
			const insertImageViaUrlForm = imageInsertView.getIntegration( 'insertImageViaUrl' );

			if ( dropdownView.isOpen ) {
				if ( imageUtils.isImage( selectedElement ) ) {
					imageInsertView.imageURLInputValue = replaceImageSourceCommand.value as string;
					insertButtonView.label = t( 'Update' );
					( insertImageViaUrlForm as any ).label = t( 'Update image URL' );
				} else {
					imageInsertView.imageURLInputValue = '';
					insertButtonView.label = t( 'Insert' );
					( insertImageViaUrlForm as any ).label = t( 'Insert image via URL' );
				}
			}
		// Note: Use the low priority to make sure the following listener starts working after the
		// default action of the drop-down is executed (i.e. the panel showed up). Otherwise, the
		// invisible form/input cannot be focused/selected.
		}, { priority: 'low' } );

		this.delegate( 'cancel' ).to( dropdownView );

		dropdownView.on( 'submit', () => {
			closePanel();
			onSubmit();
		} );

		dropdownView.on( 'cancel', () => {
			closePanel();
		} );

		function onSubmit() {
			const selectedElement = editor.model.document.selection.getSelectedElement()!;

			if ( imageUtils.isImage( selectedElement ) ) {
				editor.execute( 'replaceImageSource', { source: imageInsertView.imageURLInputValue } );
			} else {
				editor.execute( 'insertImage', { source: imageInsertView.imageURLInputValue } );
			}
		}

		function closePanel() {
			editor.editing.view.focus();
			dropdownView.isOpen = false;
		}

		return dropdownView;
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ ImageInsertUI.pluginName ]: ImageInsertUI;
	}
}
