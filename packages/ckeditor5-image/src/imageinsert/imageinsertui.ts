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
	CollapsibleView,
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
		const componentCreator = ( locale: Locale ) => this._createToolbarComponent( locale );

		// Register `insertImage` dropdown and add `imageInsert` dropdown as an alias for backward compatibility.
		editor.ui.componentFactory.add( 'insertImage', componentCreator );
		editor.ui.componentFactory.add( 'imageInsert', componentCreator );

		const insertImageCommand: InsertImageCommand = this.editor.commands.get( 'insertImage' )!;

		this.registerIntegration(
			'url',
			insertImageCommand,
			( type, isOnlyOne ) => type == 'formView' ? this._createInsertUrlView( isOnlyOne ) : this._createInsertUrlButton(),
			{ requiresForm: true }
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
	public registerIntegration(
		name: string,
		observable: Observable & { isEnabled: boolean },
		callback: IntegrationCallback,
		options: { requiresForm?: boolean } = {}
	): void {
		if ( this._integrations.has( name ) ) {
			/**
			 * TODO
			 */
			logWarning( 'image-insert-zzzzz', { name } );
		}

		this._integrations.set( name, { ...options, observable, callback } );
	}

	/**
	 * Creates the toolbar component.
	 */
	private _createToolbarComponent( locale: Locale ): DropdownView | FocusableView {
		const editor = this.editor;
		const t = locale.t;

		const integrations = this._prepareIntegrations();

		let dropdownButton: SplitButtonView | DropdownButtonView | undefined;
		const firstIntegration = integrations[ 0 ];

		if ( integrations.length == 1 ) {
			// Do not use dropdown for a single integration button (integration that does not require form view).
			if ( !firstIntegration.requiresForm ) {
				return firstIntegration.callback( 'toolbarButton', true );
			}

			dropdownButton = this._createInsertUrlButton( DropdownButtonView );
		} else {
			const actionButton = firstIntegration.callback( 'toolbarButton', false ) as ButtonView & FocusableView;

			dropdownButton = new SplitButtonView( locale, actionButton );
			dropdownButton.tooltip = true;
			dropdownButton.bind( 'label' ).to( this, 'isImageSelected', isImageSelected => isImageSelected ?
				t( 'Replace image' ) : // TODO context
				t( 'Insert image' ) // TODO context
			);
		}

		const dropdownView = this.dropdownView = createDropdown( locale, dropdownButton );
		const observables = integrations.map( ( { observable } ) => observable );

		dropdownView.bind( 'isEnabled' ).toMany( observables, 'isEnabled', ( ...isEnabled ) => (
			isEnabled.some( isEnabled => isEnabled )
		) );

		dropdownView.once( 'change:isOpen', () => {
			const integrationViews = integrations.map( ( { callback } ) => callback( 'formView', integrations.length == 1 ) );
			const imageInsertFormView = new ImageInsertFormView( editor.locale, integrationViews );

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

		if ( !result.length ) {
			result.push( this._integrations.get( 'url' )! );

			/**
			 * TODO
			 */
			logWarning( 'image-insert-aaaa' );
		}

		return result;
	}

	/**
	 * TODO
	 */
	private _createInsertUrlView( isOnlyOne: boolean ): FocusableView {
		const editor = this.editor;
		const locale = editor.locale;
		const t = locale.t;

		const replaceImageSourceCommand: ReplaceImageSourceCommand = editor.commands.get( 'replaceImageSource' )!;
		const insertImageCommand: InsertImageCommand = editor.commands.get( 'insertImage' )!;

		const imageInsertUrlView = new ImageInsertUrlView( locale );
		const collapsibleView = isOnlyOne ? null : new CollapsibleView( locale, [ imageInsertUrlView ] );

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

				if ( collapsibleView ) {
					collapsibleView.isCollapsed = true;
				}
			}

			// Note: Use the low priority to make sure the following listener starts working after the
			// default action of the drop-down is executed (i.e. the panel showed up). Otherwise, the
			// invisible form/input cannot be focused/selected.
		}, { priority: 'low' } );

		imageInsertUrlView.on<ImageInsertUrlViewSubmitEvent>( 'submit', () => {
			if ( replaceImageSourceCommand.isEnabled ) {
				editor.execute( 'replaceImageSource', { source: imageInsertUrlView.imageURLInputValue } );
			} else {
				editor.execute( 'insertImage', { source: imageInsertUrlView.imageURLInputValue } );
			}

			this._closePanel();
		} );

		imageInsertUrlView.on<ImageInsertUrlViewCancelEvent>( 'cancel', () => this._closePanel() );

		if ( collapsibleView ) {
			collapsibleView.set( {
				isCollapsed: true
			} );

			collapsibleView.bind( 'label' ).to( this, 'isImageSelected', isImageSelected => isImageSelected ?
				t( 'Replace with link' ) : // TODO context
				t( 'Insert with link' ) // TODO context
			);

			return collapsibleView;
		}

		return imageInsertUrlView;
	}

	private _createInsertUrlButton<T extends ButtonView | DropdownButtonView>(
		ButtonClass: new ( locale?: Locale ) => T
	): T;
	private _createInsertUrlButton(): ButtonView;

	/**
	 * TODO
	 */
	private _createInsertUrlButton(
		ButtonClass: new ( locale?: Locale ) => ButtonView = ButtonView
	): ButtonView {
		const editor = this.editor;
		const button = new ButtonClass( editor.locale );
		const t = editor.locale.t;

		button.set( {
			icon: icons.imageUrl,
			tooltip: true
		} );

		// TODO add 'Update image URL' and 'Insert image via URL' to context
		button.bind( 'label' ).to( this, 'isImageSelected', isImageSelected => isImageSelected ?
			t( 'Update image URL' ) : t( 'Insert image via URL' )
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
export type IntegrationCallback = ( type: 'toolbarButton' | 'formView', isOnlyOne: boolean ) => FocusableView;

type IntegrationData = {
	observable: Observable & { isEnabled: boolean };
	callback: IntegrationCallback;
	requiresForm?: boolean;
};
