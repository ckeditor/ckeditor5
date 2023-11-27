/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinsert/imageinsertui
 */

import { Plugin, type Editor } from 'ckeditor5/src/core';
import { logWarning, CKEditorError, type Locale, type Observable } from 'ckeditor5/src/utils';
import {
	createDropdown,
	SplitButtonView,
	type ButtonView,
	type DropdownButtonView,
	type DropdownView,
	type FocusableView
} from 'ckeditor5/src/ui';

import ImageInsertFormView from './ui/imageinsertformview';
import type ImageUtils from '../imageutils';

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
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'image.insert.integrations', [
			'upload',
			'assetManager',
			'url'
		] );
	}

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

		this.listenTo( editor.model.document, 'change', () => {
			const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );
			const element = this.editor.model.document.selection.getSelectedElement();

			this.isImageSelected = imageUtils.isImage( element );
		} );
	}

	/**
	 * TODO
	 */
	public registerIntegration( {
		name,
		observable,
		buttonViewCreator,
		formViewCreator,
		requiresForm
	}: {
		name: string;
		observable: Observable & { isEnabled: boolean };
		buttonViewCreator: IntegrationCallback;
		formViewCreator: IntegrationCallback;
		requiresForm?: boolean;
} ): void {
		if ( this._integrations.has( name ) ) {
			/**
			 * TODO
			 */
			logWarning( 'image-insert-zzzzz', { name } );
		}

		this._integrations.set( name, {
			observable,
			buttonViewCreator,
			formViewCreator,
			requiresForm
		} );
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
				return firstIntegration.buttonViewCreator( true );
			}

			dropdownButton = firstIntegration.buttonViewCreator( true ) as DropdownButtonView;
		} else {
			const actionButton = firstIntegration.buttonViewCreator( false ) as ButtonView & FocusableView;

			dropdownButton = new SplitButtonView( locale, actionButton );
			dropdownButton.tooltip = true;

			dropdownButton.bind( 'label' ).to( this, 'isImageSelected', isImageSelected => isImageSelected ?
				t( 'Replace image' ) :
				t( 'Insert image' )
			);
		}

		const dropdownView = this.dropdownView = createDropdown( locale, dropdownButton );
		const observables = integrations.map( ( { observable } ) => observable );

		dropdownView.bind( 'isEnabled' ).toMany( observables, 'isEnabled', ( ...isEnabled ) => (
			isEnabled.some( isEnabled => isEnabled )
		) );

		dropdownView.once( 'change:isOpen', () => {
			const integrationViews = integrations.map( ( { formViewCreator } ) => formViewCreator( integrations.length == 1 ) );
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
			/**
			 * TODO
			 * @error image-insert-aaaa
			 */
			throw new CKEditorError( 'image-insert-aaaa' );
		}

		return result;
	}
}

/**
 * TODO
 */
export type IntegrationCallback = ( isOnlyOne: boolean ) => FocusableView;

type IntegrationData = {
	observable: Observable & { isEnabled: boolean };
	buttonViewCreator: IntegrationCallback;
	formViewCreator: IntegrationCallback;
	requiresForm?: boolean;
};
