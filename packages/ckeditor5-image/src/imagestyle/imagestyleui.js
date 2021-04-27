/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/imagestyleui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView, createDropdown, addToolbarToDropdown, SplitButtonView } from 'ckeditor5/src/ui';
import ImageStyleEditing from './imagestyleediting';
import utils from './utils';
import { isObject, identity } from 'lodash-es';

import '../../theme/imagestyle.css';

/**
 * The image style UI plugin.
 *
 * It creates buttons and drop-downs corresponding to the {@link module:image/image~ImageConfig#styles configuration} of the
 * {@link module:image/imagestyle~ImageStyle} plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageStyleUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageStyleEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageStyleUI';
	}

	/**
	 * Returns the default localized style titles provided by the plugin.
	 *
	 * The following localized titles corresponding with
	 * {@link module:image/imagestyle/utils~DEFAULT_OPTIONS} are available:
	 *
	 * * `'Wrap text'`,
	 * * `'Break text'`,
	 * * `'In line'`,
	 * * `'Full size image'`,
	 * * `'Side image'`,
	 * * `'Left aligned image'`,
	 * * `'Centered image'`,
	 * * `'Right aligned image'`
	 *
	 * @returns {Object.<String,String>}
	 */
	get localizedDefaultStylesTitles() {
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
	init() {
		const plugins = this.editor.plugins;
		const toolbarConfig = this.editor.config.get( 'image.toolbar' ) || [];

		const definedStyles = translateStyles(
			plugins.get( 'ImageStyleEditing' ).normalizedStyles,
			this.localizedDefaultStylesTitles
		);

		for ( const styleConfig of definedStyles ) {
			this._createButton( styleConfig );
		}

		const definedDropdowns = translateStyles(
			toolbarConfig.filter( isObject ).concat( utils.getDefaultDropdowns( plugins ) || [] ),
			this.localizedDefaultStylesTitles
		);

		for ( const dropdownConfig of definedDropdowns ) {
			this._createDropdown( dropdownConfig, definedStyles );
		}
	}

	/**
	 * Creates a dropdown and stores it in the editor {@link module:ui/componentfactory~ComponentFactory}.
	 *
	 * @private
	 * @param {module:image/imagestyle~ImageStyleGroupDefinition} dropdownConfig
	 * @param {Array.<module:image/imagestyle~ImageStyleOptionDefinition>} definedStyles
	 */
	_createDropdown( dropdownConfig, definedStyles ) {
		const factory = this.editor.ui.componentFactory;

		factory.add( dropdownConfig.name, locale => {
			let defaultButton;

			const { defaultItem, items, title } = dropdownConfig;
			const buttonViews = items
				.filter( itemName => definedStyles.find( ( { name } ) => getUIComponentName( name ) === itemName ) )
				.map( buttonName => {
					const button = factory.create( buttonName );

					if ( buttonName === defaultItem ) {
						defaultButton = button;
					}

					return button;
				} );

			if ( !buttonViews.length || items.length !== buttonViews.length ) {
				utils.warnInvalidStyle( { group: dropdownConfig } );
			}

			const dropdownView = createDropdown( locale, SplitButtonView );
			const splitButtonView = dropdownView.buttonView;

			addToolbarToDropdown( dropdownView, buttonViews );

			splitButtonView.set( {
				label: `${ title }: ${ defaultButton.label }`,
				class: null,
				tooltip: true
			} );

			splitButtonView.bind( 'icon' ).toMany( buttonViews, 'isOn', ( ...areOn ) => {
				const index = areOn.findIndex( identity );

				return ( index < 0 ) ? defaultButton.icon : buttonViews[ index ].icon;
			} );

			splitButtonView.bind( 'label' ).toMany( buttonViews, 'isOn', ( ...areOn ) => {
				const index = areOn.findIndex( identity );

				return `${ title }: ` + ( ( index < 0 ) ? defaultButton.label : buttonViews[ index ].label );
			} );

			splitButtonView.bind( 'isOn' ).toMany( buttonViews, 'isOn', ( ...areOn ) => areOn.some( identity ) );

			splitButtonView.bind( 'class' )
				.toMany( buttonViews, 'isOn', ( ...areOn ) => areOn.some( identity ) ? 'ck-splitbutton_flatten' : null );

			splitButtonView.on( 'execute', () => {
				if ( !buttonViews.some( ( { isOn } ) => isOn ) ) {
					defaultButton.fire( 'execute' );
				} else {
					dropdownView.isOpen = !dropdownView.isOpen;
				}
			} );

			dropdownView.bind( 'isEnabled' )
				.toMany( buttonViews, 'isEnabled', ( ...areEnabled ) => areEnabled.some( identity ) );

			return dropdownView;
		} );
	}

	/**
	 * Creates a button and stores it in the editor {@link module:ui/componentfactory~ComponentFactory}.
	 *
	 * @private
	 * @param {module:image/imagestyle~ImageStyleOptionDefinition} buttonConfig
	 */
	_createButton( buttonConfig ) {
		const buttonName = buttonConfig.name;

		this.editor.ui.componentFactory.add( getUIComponentName( buttonName ), locale => {
			const command = this.editor.commands.get( 'imageStyle' );
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

	_executeCommand( name ) {
		this.editor.execute( 'imageStyle', { value: name } );
		this.editor.editing.view.focus();
	}
}

// Returns the translated `title` from the passed styles array.
//
// @param {Array.<module:image/imagestyle~ImageStyleOptionDefinition|module:image/imagestyle~ImageStyleGroupDefinition>} styles
// @param {Object.<String,String>} titles
//
// @returns {Array.<module:image/imagestyle~ImageStyleOptionDefinition|module:image/imagestyle~ImageStyleGroupDefinition>}
function translateStyles( styles, titles ) {
	for ( const style of styles ) {
		// Localize the titles of the styles, if a title corresponds with
		// a localized default provided by the plugin.
		if ( titles[ style.title ] ) {
			style.title = titles[ style.title ];
		}
	}

	return styles;
}

// Returns the image style component name with the "imageStyle:" prefix.
//
// @param {String} name
// @returns {String}
function getUIComponentName( name ) {
	return `imageStyle:${ name }`;
}
