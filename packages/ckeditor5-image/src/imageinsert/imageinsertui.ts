/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imageinsert/imageinsertui
 */

import {
	Plugin,
	type Editor,
	icons
} from 'ckeditor5/src/core.js';
import {
	logWarning,
	type Locale,
	type Observable
} from 'ckeditor5/src/utils.js';
import {
	createDropdown,
	type ButtonView,
	type DropdownButtonView,
	type DropdownView,
	type FocusableView,
	type MenuBarMenuListItemButtonView,
	MenuBarMenuListItemView,
	MenuBarMenuListView,
	MenuBarMenuView,
	SplitButtonView,
	type View
} from 'ckeditor5/src/ui.js';

import ImageInsertFormView from './ui/imageinsertformview.js';
import ImageUtils from '../imageutils.js';

/**
 * The image insert dropdown plugin.
 *
 * For a detailed overview, check the {@glink features/images/image-upload/image-upload Image upload feature}
 * and {@glink features/images/images-inserting Insert images via source URL} documentation.
 *
 * Adds the `'insertImage'` dropdown to the {@link module:ui/componentfactory~ComponentFactory UI component factory}
 * and also the `imageInsert` dropdown as an alias for backward compatibility.
 *
 * Adds the `'menuBar:insertImage'` sub-menu to the {@link module:ui/componentfactory~ComponentFactory UI component factory}, which is
 * by default added to the `'Insert'` menu.
 */
export default class ImageInsertUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ImageInsertUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageUtils ] as const;
	}

	/**
	 * The dropdown view responsible for displaying the image insert UI.
	 */
	public dropdownView?: DropdownView;

	/**
	 * Observable property used to alter labels while some image is selected and when it is not.
	 *
	 * @observable
	 */
	declare public isImageSelected: boolean;

	/**
	 * Registered integrations map.
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
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );

		this.set( 'isImageSelected', false );

		this.listenTo( editor.model.document, 'change', () => {
			this.isImageSelected = imageUtils.isImage( selection.getSelectedElement() );
		} );

		const componentCreator = ( locale: Locale ) => this._createToolbarComponent( locale );
		const menuBarComponentCreator = ( locale: Locale ) => this._createMenuBarComponent( locale );

		// Register `insertImage` dropdown and add `imageInsert` dropdown as an alias for backward compatibility.
		editor.ui.componentFactory.add( 'insertImage', componentCreator );
		editor.ui.componentFactory.add( 'imageInsert', componentCreator );

		editor.ui.componentFactory.add( 'menuBar:insertImage', menuBarComponentCreator );
	}

	/**
	 * Registers the insert image dropdown integration.
	 */
	public registerIntegration( {
		name,
		observable,
		buttonViewCreator,
		formViewCreator,
		menuBarButtonViewCreator,
		requiresForm = false
	}: {
		name: string;
		observable: Observable & { isEnabled: boolean } | ( () => Observable & { isEnabled: boolean } );
		buttonViewCreator: ( isOnlyOne: boolean ) => ButtonView;
		formViewCreator: ( isOnlyOne: boolean ) => FocusableView;
		menuBarButtonViewCreator: ( isOnlyOne: boolean ) => MenuBarMenuListItemButtonView;
		requiresForm?: boolean;
	} ): void {
		if ( this._integrations.has( name ) ) {
			/**
			 * There are two insert-image integrations registered with the same name.
			 *
			 * Make sure that you do not load multiple asset manager plugins.
			 *
			 * @error image-insert-integration-exists
			 */
			logWarning( 'image-insert-integration-exists', { name } );
		}

		this._integrations.set( name, {
			observable,
			buttonViewCreator,
			menuBarButtonViewCreator,
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

		if ( !integrations.length ) {
			return null as any;
		}

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
		const observables = integrations.map( ( { observable } ) => typeof observable == 'function' ? observable() : observable );

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
	 * Creates the menu bar component.
	 */
	private _createMenuBarComponent( locale: Locale ): View {
		const t = locale.t;

		const integrations = this._prepareIntegrations();

		if ( !integrations.length ) {
			return null as any;
		}

		let resultView: MenuBarMenuListItemButtonView | MenuBarMenuView | undefined;
		const firstIntegration = integrations[ 0 ];

		if ( integrations.length == 1 ) {
			resultView = firstIntegration.menuBarButtonViewCreator( true );
		} else {
			resultView = new MenuBarMenuView( locale );
			const listView = new MenuBarMenuListView( locale );
			resultView.panelView.children.add( listView );

			resultView.buttonView.set( {
				icon: icons.image,
				label: t( 'Image' )
			} );

			for ( const integration of integrations ) {
				const listItemView = new MenuBarMenuListItemView( locale, resultView );
				const buttonView = integration.menuBarButtonViewCreator( false );

				listItemView.children.add( buttonView );
				listView.items.add( listItemView );
			}
		}

		return resultView;
	}

	/**
	 * Validates the integrations list.
	 */
	private _prepareIntegrations(): Array<IntegrationData> {
		const editor = this.editor;
		const items = editor.config.get( 'image.insert.integrations' )!;
		const result: Array<IntegrationData> = [];

		if ( !items.length ) {
			/**
			 * The insert image feature requires a list of integrations to be provided in the editor configuration.
			 *
			 * The default list of integrations is `upload`, `assetManager`, `url`. Those integrations are included
			 * in the insert image dropdown if the given feature plugin is loaded. You should omit the `integrations`
			 * configuration key to use the default set or provide a selected list of integrations that should be used.
			 *
			 * @error image-insert-integrations-not-specified
			 */
			logWarning( 'image-insert-integrations-not-specified' );

			return result;
		}

		for ( const item of items ) {
			if ( !this._integrations.has( item ) ) {
				if ( ![ 'upload', 'assetManager', 'url' ].includes( item ) ) {
					/**
					 * The specified insert image integration name is unknown or the providing plugin is not loaded in the editor.
					 *
					 * @error image-insert-unknown-integration
					 */
					logWarning( 'image-insert-unknown-integration', { item } );
				}

				continue;
			}

			result.push( this._integrations.get( item )! );
		}

		if ( !result.length ) {
			/**
			 * The image insert feature requires integrations to be registered by separate features.
			 *
			 * The `insertImage` toolbar button requires integrations to be registered by other features.
			 * For example {@link module:image/imageupload~ImageUpload ImageUpload},
			 * {@link module:image/imageinsert~ImageInsert ImageInsert},
			 * {@link module:image/imageinsertviaurl~ImageInsertViaUrl ImageInsertViaUrl},
			 * {@link module:ckbox/ckbox~CKBox CKBox}
			 *
			 * @error image-insert-integrations-not-registered
			 */
			logWarning( 'image-insert-integrations-not-registered' );
		}

		return result;
	}
}

type IntegrationData = {
	observable: Observable & { isEnabled: boolean } | ( () => Observable & { isEnabled: boolean } );
	buttonViewCreator: ( isOnlyOne: boolean ) => ButtonView;
	menuBarButtonViewCreator: ( isOnlyOne: boolean ) => MenuBarMenuListItemButtonView;
	formViewCreator: ( isOnlyOne: boolean ) => FocusableView;
	requiresForm: boolean;
};
