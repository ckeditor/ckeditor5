/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinsert/imageinsertui
 */

import { Plugin, icons } from 'ckeditor5/src/core';
import { logWarning, type Locale, type Observable } from 'ckeditor5/src/utils';
import {
	ButtonView,
	SplitButtonView,
	DropdownButtonView,
	createDropdown,
	type DropdownView,
	type FocusableView
} from 'ckeditor5/src/ui';

import ImageInsertFormView from './ui/imageinsertformview';
import type ReplaceImageSourceCommand from '../image/replaceimagesourcecommand';
import type ImageUtils from '../imageutils';
import type InsertImageCommand from '../image/insertimagecommand';
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
	 *
	 * @observable
	 */
	declare public isImageSelected: boolean;

	/**
	 * TODO
	 */
	private _integrations = new Map<string, IntegrationData>();

	/**
	 * @inheritDoc
	 */
	public init(): void {
		this.set( 'isImageSelected', false );

		const editor = this.editor;
		const componentCreator = ( locale: Locale ) => {
			return this._createDropdownView( locale );
		};

		// Register `insertImage` dropdown and add `imageInsert` dropdown as an alias for backward compatibility.
		editor.ui.componentFactory.add( 'insertImage', componentCreator );
		editor.ui.componentFactory.add( 'imageInsert', componentCreator );

		const insertImageCommand: InsertImageCommand = this.editor.commands.get( 'insertImage' )!;

		this.registerIntegration( 'url', insertImageCommand,
			type => type == 'formView' ? this._createInsertUrlView() : this._createInsertButton()
		);

		this.listenTo( editor.model.document, 'change', () => {
			const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );
			const element = this.editor.model.document.selection.getSelectedElement();

			this.isImageSelected = imageUtils.isImage( element );
		} );
	}

	/**
	 * TODO
	 */
	public registerIntegration( name: string, observable: IntegrationData[ 'observable' ], callback: IntegrationCallback ): void {
		if ( this._integrations.has( name ) ) {
			/**
			 * TODO
			 */
			logWarning( 'image-insert-zzzzz', { name } );
		}

		this._integrations.set( name, { observable, callback } );
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
			dropdownButton = new SplitButtonView( locale, integrations[ 0 ].callback( 'toolbarButton' ) as ButtonView & FocusableView );
		} else if ( integrations.length == 1 ) {
			dropdownButton = this._createInsertButton( DropdownButtonView );
		}

		const dropdownView = this.dropdownView = createDropdown( locale, dropdownButton );
		const observables = integrations.map( ( { observable } ) => observable );

		dropdownView.bind( 'isEnabled' ).toMany( observables, 'isEnabled', ( ...isEnabled ) => (
			isEnabled.some( isEnabled => isEnabled )
		) );

		dropdownView.once( 'change:isOpen', () => {
			const integrationsView = integrations.map( ( { callback } ) => callback( 'formView' ) );
			const imageInsertFormView = new ImageInsertFormView( editor.locale, integrationsView );

			dropdownView.panelView.children.add( imageInsertFormView );
		} );

		return dropdownView;
	}

	/**
	 * TODO
	 */
	private _prepareIntegrations(): Array<IntegrationData> {
		const editor = this.editor;
		const items = editor.config.get( 'image.insert.integrations' )!;
		const result: Array<IntegrationData> = [];

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
	private _createInsertUrlView(): FocusableView {
		const replaceImageSourceCommand: ReplaceImageSourceCommand = this.editor.commands.get( 'replaceImageSource' )!;
		const insertImageCommand: InsertImageCommand = this.editor.commands.get( 'insertImage' )!;
		const imageInsertUrlView = new ImageInsertUrlView( this.editor.locale );

		imageInsertUrlView.bind( 'isImageSelected' ).to( this );
		imageInsertUrlView.bind( 'isEnabled' ).toMany( [ insertImageCommand, replaceImageSourceCommand ], 'isEnabled', ( ...isEnabled ) => (
			isEnabled.some( isCommandEnabled => isCommandEnabled )
		) );

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

	private _createInsertButton<T extends ButtonView | DropdownButtonView>(
		ButtonClass: new ( locale?: Locale ) => T
	): T;
	private _createInsertButton(): ButtonView;

	/**
	 * TODO
	 */
	private _createInsertButton(
		ButtonClass: new ( locale?: Locale ) => ButtonView = ButtonView
	): ButtonView {
		const editor = this.editor;
		const button = new ButtonClass( editor.locale );
		const t = editor.locale.t;

		button.set( {
			icon: icons.image,
			tooltip: true
		} );

		// TODO add 'Replace image' to context
		button.bind( 'label' ).to( this, 'isImageSelected', isImageSelected => isImageSelected ?
			t( 'Replace image' ) : t( 'Insert image' )
		);

		return button;
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
export type IntegrationCallback = ( type: 'toolbarButton' | 'formView' ) => FocusableView;

type IntegrationData = {
	observable: Observable & { isEnabled: boolean };
	callback: IntegrationCallback;
};
