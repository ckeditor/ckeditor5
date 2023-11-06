/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinsert/imageinsertui
 */

import { Plugin, icons } from 'ckeditor5/src/core';
import { logWarning, type Locale } from 'ckeditor5/src/utils';
import {
	ButtonView,
	SplitButtonView,
	DropdownButtonView,
	createDropdown,
	type DropdownView,
	type View,
	type FocusableView
} from 'ckeditor5/src/ui';

import ImageInsertFormView from './ui/imageinsertformview';
import type ReplaceImageSourceCommand from '../image/replaceimagesourcecommand';
import ImageInsertUrlView, {
	type ImageInsertUrlViewCancelEvent,
	type ImageInsertUrlViewSubmitEvent
} from './ui/imageinserturlview';

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
	 * TODO
	 */
	private _integrations = new Map<string, IntegrationCallback>();

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

		this.registerIntegration( 'url', type => {
			if ( type == 'formView' ) {
				return this._createInsertUrlView();
			} else {
				const button = new ButtonView( editor.locale );
				const t = editor.locale.t;

				button.set( {
					label: t( 'Insert image' ), // TODO or Update image
					icon: icons.image,
					tooltip: true
				} );

				return button;
			}
		} );
	}

	/**
	 * TODO
	 */
	public registerIntegration( name: string, callback: IntegrationCallback ): void {
		if ( this._integrations.has( name ) ) {
			/**
			 * TODO
			 */
			logWarning( 'image-insert-zzzzz', { name } );
		}

		this._integrations.set( name, callback );
	}

	/**
	 * Creates the dropdown view.
	 *
	 * @param locale The localization services instance.
	 */
	private _createDropdownView( locale: Locale ): DropdownView {
		const editor = this.editor;

		const integrations = this._prepareIntegrations();
		let dropdownButton: SplitButtonView | DropdownButtonView | undefined;

		if ( integrations.length > 1 ) {
			// TODO remove cast as ButtonView & FocusableView
			dropdownButton = new SplitButtonView( locale, integrations[ 0 ]( 'toolbarButton' ) as ButtonView & FocusableView );
		} else if ( integrations.length == 1 ) {
			dropdownButton = new DropdownButtonView( locale );

			// TODO remove cast as ButtonView
			// TODO how to make it without reference button
			const referenceButton = integrations[ 0 ]( 'toolbarButton' ) as ButtonView;

			dropdownButton.set( {
				label: referenceButton.label,
				icon: referenceButton.icon,
				tooltip: referenceButton.tooltip
			} );
		}

		const dropdownView = this.dropdownView = createDropdown( locale, dropdownButton );

		// TODO
		// dropdownView.bind( 'isEnabled' ).to( uploadImageCommand || insertImageCommand );

		dropdownView.once( 'change:isOpen', () => {
			const integrationsView = integrations.map( callback => callback( 'formView' ) );
			const imageInsertFormView = new ImageInsertFormView( editor.locale, integrationsView );
			dropdownView.panelView.children.add( imageInsertFormView );
		} );

		return dropdownView;
	}

	/**
	 * TODO
	 */
	private _prepareIntegrations(): Array<IntegrationCallback> {
		const editor = this.editor;
		const items = editor.config.get( 'image.insert.integrations' )!;
		const result: Array<IntegrationCallback> = [];

		for ( const item of items ) {
			if ( !this._integrations.has( item ) ) {
				if ( ![ 'upload', 'assetManager', 'url' ].includes( item ) ) {
					/**
					 * TODO
					 */
					logWarning( 'image-insert-zzzzzz', { item } );
				}

				continue;
			}

			result.push( this._integrations.get( item )! );
		}

		return result;
	}

	/**
	 * TODO
	 */
	private _createInsertUrlView() {
		const replaceImageSourceCommand: ReplaceImageSourceCommand = this.editor.commands.get( 'replaceImageSource' )!;
		const imageInsertUrlView = new ImageInsertUrlView( this.editor.locale );

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

		imageInsertUrlView.on<ImageInsertUrlViewSubmitEvent>( 'submit', () => {
			if ( replaceImageSourceCommand.isEnabled ) {
				this.editor.execute( 'replaceImageSource', { source: imageInsertUrlView.imageURLInputValue } );
			} else {
				this.editor.execute( 'insertImage', { source: imageInsertUrlView.imageURLInputValue } );
			}

			this._closePanel();
		} );

		imageInsertUrlView.on<ImageInsertUrlViewCancelEvent>( 'cancel', () => this._closePanel() );

		return imageInsertUrlView;
	}

	/**
	 * TODO
	 */
	private _closePanel(): void {
		this.editor.editing.view.focus();
		this.dropdownView!.isOpen = false;
	}
}

/**
 * TODO
 */
export type IntegrationCallback = ( type: 'toolbarButton' | 'formView' ) => View;
