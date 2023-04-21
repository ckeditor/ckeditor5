/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/imagestyleui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView, createDropdown, addToolbarToDropdown, SplitButtonView } from 'ckeditor5/src/ui';
import { isObject, identity } from 'lodash-es';
import ImageStyleEditing from './imagestyleediting';
import utils from './utils';
import type { ImageStyleDropdownDefinition, ImageStyleOptionDefinition } from '../imageconfig';
import type ImageStyleCommand from './imagestylecommand';

import '../../theme/imagestyle.css';

/**
 * The image style UI plugin.
 *
 * It registers buttons corresponding to the {@link module:image/imageconfig~ImageConfig#styles} configuration.
 * It also registers the {@link module:image/imagestyle/utils#DEFAULT_DROPDOWN_DEFINITIONS default drop-downs} and the
 * custom drop-downs defined by the developer in the {@link module:image/imageconfig~ImageConfig#toolbar} configuration.
 */
export default class ImageStyleUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ImageStyleEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ImageStyleUI' {
		return 'ImageStyleUI';
	}

	/**
	 * Returns the default localized style titles provided by the plugin.
	 *
	 * The following localized titles corresponding with
	 * {@link module:image/imagestyle/utils#DEFAULT_OPTIONS} are available:
	 *
	 * * `'Wrap text'`,
	 * * `'Break text'`,
	 * * `'In line'`,
	 * * `'Full size image'`,
	 * * `'Side image'`,
	 * * `'Left aligned image'`,
	 * * `'Centered image'`,
	 * * `'Right aligned image'`
	 */
	public get localizedDefaultStylesTitles(): Record<string, string> {
		const t = this.editor.t;

		return {
			'Wrap text': t( 'Wrap text' ),
			'Break text': t( 'Break text' ),
			'In line': t( 'In line' ),
			'Full size image': t( 'Full size image' ),
			'Side image': t( 'Side image' ),
			'Left aligned image': t( 'Left aligned image' ),
			'Centered image': t( 'Centered image' ),
			'Right aligned image': t( 'Right aligned image' )
		};
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const plugins = this.editor.plugins;
		const toolbarConfig = this.editor.config.get( 'image.toolbar' ) || [];
		const imageStyleEditing: ImageStyleEditing = plugins.get( 'ImageStyleEditing' );

		const definedStyles = translateStyles(
			imageStyleEditing.normalizedStyles!,
			this.localizedDefaultStylesTitles
		);

		for ( const styleConfig of definedStyles ) {
			this._createButton( styleConfig );
		}

		const definedDropdowns = translateStyles(
			[
				...toolbarConfig.filter( isObject ) as Array<ImageStyleDropdownDefinition>,
				...utils.getDefaultDropdownDefinitions( plugins )
			],
			this.localizedDefaultStylesTitles
		);

		for ( const dropdownConfig of definedDropdowns ) {
			this._createDropdown( dropdownConfig, definedStyles );
		}
	}

	/**
	 * Creates a dropdown and stores it in the editor {@link module:ui/componentfactory~ComponentFactory}.
	 */
	private _createDropdown( dropdownConfig: ImageStyleDropdownDefinition, definedStyles: Array<ImageStyleOptionDefinition> ): void {
		const factory = this.editor.ui.componentFactory;

		factory.add( dropdownConfig.name, locale => {
			let defaultButton: ButtonView | undefined;

			const { defaultItem, items, title } = dropdownConfig;
			const buttonViews = items
				.filter( itemName => definedStyles.find( ( { name } ) => getUIComponentName( name ) === itemName ) )
				.map( buttonName => {
					const button = factory.create( buttonName ) as ButtonView;

					if ( buttonName === defaultItem ) {
						defaultButton = button;
					}

					return button;
				} );

			if ( items.length !== buttonViews.length ) {
				utils.warnInvalidStyle( { dropdown: dropdownConfig } );
			}

			const dropdownView = createDropdown( locale, SplitButtonView );
			const splitButtonView = dropdownView.buttonView as SplitButtonView;
			const splitButtonViewArrow = splitButtonView.arrowView;

			addToolbarToDropdown( dropdownView, buttonViews, { enableActiveItemFocusOnDropdownOpen: true } );

			splitButtonView.set( {
				label: getDropdownButtonTitle( title, defaultButton!.label! ),
				class: null,
				tooltip: true
			} );

			splitButtonViewArrow.unbind( 'label' );
			splitButtonViewArrow.set( {
				label: title
			} );

			splitButtonView.bind( 'icon' ).toMany( buttonViews, 'isOn', ( ...areOn ) => {
				const index = areOn.findIndex( identity );

				return ( index < 0 ) ? defaultButton!.icon : buttonViews[ index ].icon;
			} );

			splitButtonView.bind( 'label' ).toMany( buttonViews, 'isOn', ( ...areOn ) => {
				const index = areOn.findIndex( identity );

				return getDropdownButtonTitle( title, ( index < 0 ) ? defaultButton!.label! : buttonViews[ index ].label! );
			} );

			splitButtonView.bind( 'isOn' ).toMany( buttonViews, 'isOn', ( ...areOn ) => areOn.some( identity ) );

			splitButtonView.bind( 'class' )
				.toMany( buttonViews, 'isOn', ( ...areOn ) => areOn.some( identity ) ? 'ck-splitbutton_flatten' : undefined );

			splitButtonView.on( 'execute', () => {
				if ( !buttonViews.some( ( { isOn } ) => isOn ) ) {
					defaultButton!.fire( 'execute' );
				} else {
					dropdownView.isOpen = !dropdownView.isOpen;
				}
			} );

			dropdownView.bind( 'isEnabled' )
				.toMany( buttonViews, 'isEnabled', ( ...areEnabled ) => areEnabled.some( identity ) );

			// Focus the editable after executing the command.
			// Overrides a default behaviour where the focus is moved to the dropdown button (#12125).
			this.listenTo( dropdownView, 'execute', () => {
				this.editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}

	/**
	 * Creates a button and stores it in the editor {@link module:ui/componentfactory~ComponentFactory}.
	 */
	private _createButton( buttonConfig: ImageStyleOptionDefinition ): void {
		const buttonName = buttonConfig.name;

		this.editor.ui.componentFactory.add( getUIComponentName( buttonName ), locale => {
			const command: ImageStyleCommand = this.editor.commands.get( 'imageStyle' )!;
			const view = new ButtonView( locale );

			view.set( {
				label: buttonConfig.title,
				icon: buttonConfig.icon,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );
			view.bind( 'isOn' ).to( command, 'value', value => value === buttonName );
			view.on( 'execute', this._executeCommand.bind( this, buttonName ) );

			return view;
		} );
	}

	private _executeCommand( name: string ): void {
		this.editor.execute( 'imageStyle', { value: name } );
		this.editor.editing.view.focus();
	}
}

/**
 * Returns the translated `title` from the passed styles array.
 */
function translateStyles<T extends ImageStyleOptionDefinition | ImageStyleDropdownDefinition>(
	styles: Array<T>,
	titles: Record<string, string>
): Array<T> {
	for ( const style of styles ) {
		// Localize the titles of the styles, if a title corresponds with
		// a localized default provided by the plugin.
		if ( titles[ style.title! ] ) {
			style.title = titles[ style.title! ];
		}
	}

	return styles;
}

/**
 * Returns the image style component name with the "imageStyle:" prefix.
 */
function getUIComponentName( name: string ): string {
	return `imageStyle:${ name }`;
}

/**
 * Returns title for the splitbutton containing the dropdown title and default action item title.
 */
function getDropdownButtonTitle( dropdownTitle: string | undefined, buttonTitle: string ): string {
	return ( dropdownTitle ? dropdownTitle + ': ' : '' ) + buttonTitle;
}
