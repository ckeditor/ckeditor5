/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/imagestyleui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView, createDropdown, addToolbarToDropdown } from 'ckeditor5/src/ui';
import { logWarning } from 'ckeditor5/src/utils';

import { normalizeImageStyles } from './utils';

import '../../theme/imagestyle.css';

/**
 * The image style UI plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageStyleUI extends Plugin {
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
	 * {@link module:image/imagestyle/utils~defaultStyles} are available:
	 *
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
			'Image in paragraph': t( 'Image in paragraph' ),
			'Image between paragraphs': t( 'Image between paragraphs' ),
			'Image in text line': t( 'Image in text line' ),
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
		const editor = this.editor;
		const configuredStyles = editor.config.get( 'image.styles' );
		const configuredToolbar = editor.config.get( 'image.toolbar' )
			.filter( item => item.split( ':' )[ 0 ] === 'imageStyle' );

		this._definedArrangements = translateStyles(
			normalizeImageStyles( configuredStyles, 'arrangements' ),
			this.localizedDefaultStylesTitles );

		this._definedGroups = translateStyles(
			normalizeImageStyles( configuredStyles, 'groups' ),
			this.localizedDefaultStylesTitles );

		this._createUIElements( this._getToolbarStructure( configuredToolbar ) );
	}

	_createUIElements( UIStructure ) {
		for ( const itemKey in UIStructure ) {
			const itemValue = UIStructure[ itemKey ];

			if ( typeof itemValue === 'object' ) {
				this._createDropdown( this._getDropdownConfig( itemKey ), itemValue );
			} else {
				this._createButton( this._getButtonConfig( itemKey ) );
			}
		}
	}

	/**
	 * Creates a dropdown and stores it in the editor {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
	 *
	 * @private
	 * @param {module:image/imagestyle/imagestyleediting~ImageStyleFormat} dropdownConfig uwaga! tutaj format będzie się trochę róznił
	 * @param {Array<String>} buttonNames
	 */
	_createDropdown( dropdownConfig, buttonNames ) {
		if ( !dropdownConfig ) {
			return;
		}

		const dropdownName = dropdownConfig.name;
		const componentName = getUIComponentName( dropdownName );

		this.editor.ui.componentFactory.add( componentName, locale => {
			const dropdownView = createDropdown( locale );
			const buttonComponents = [];

			dropdownView.buttonView.set( {
				label: dropdownConfig.title,
				icon: dropdownConfig.icon,
				tooltip: true
			} );

			for ( const buttonName of buttonNames ) {
				const buttonComponentName = getUIComponentName( dropdownName, buttonName );

				this._createButton( this._getButtonConfig( buttonName ), dropdownName );
				buttonComponents.push( this.editor.ui.componentFactory.create( buttonComponentName ) );
			}

			addToolbarToDropdown( dropdownView, buttonComponents );

			dropdownView.buttonView
				.bind( 'icon' )
				.toMany(
					buttonComponents,
					'isOn',
					( ...areOn ) => {
						const index = areOn.findIndex( isOn => isOn );
						if ( index < 0 ) {
							return dropdownConfig.icon;
						}
						return buttonComponents[ index ].icon;
					}
				);

			dropdownView.buttonView
				.bind( 'isSelected' )
				.toMany(
					buttonComponents,
					'isOn',
					( ...areOn ) => areOn.find( isOn => isOn )
				);

			// dropdownView.buttonView
			// 	.bind( 'isEnabled' )
			// 	.toMany(
			// 		buttonComponents,
			// 		'isEnabled',
			// 		( ...areEnabled ) => areEnabled.find( isEnabled => isEnabled )
			// 	);

			return dropdownView;
		} );
	}

	/**
	 * Creates a button and stores it in the editor {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
	 *
	 * @private
	 * @param {module:image/imagestyle/imagestyleediting~ImageStyleFormat} buttonConfig
	 * @param {String} parentDropDownName
	 */
	_createButton( buttonConfig, parentDropdownName ) {
		if ( !buttonConfig ) {
			return;
		}

		const editor = this.editor;
		const buttonName = buttonConfig.name;
		const componentName = getUIComponentName( parentDropdownName, buttonName );

		editor.ui.componentFactory.add( componentName, locale => {
			const command = editor.commands.get( 'imageStyle' );
			const view = new ButtonView( locale );

			view.set( {
				label: buttonConfig.title,
				icon: buttonConfig.icon,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );
			view.bind( 'isOn' ).to( command, 'value', value => value === buttonConfig.name );

			view.on( 'execute', () => {
				editor.execute( 'imageTypeSwitch', buttonConfig.modelElement );
				editor.execute( 'imageStyle', { value: buttonConfig.name } );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}

	/**
	 * Returns requested image style group configuration
	 * provided in the {@link module:image/image~ImageConfig#styles image plugin configuration}.
	 *
	 * @private
	 * @param {String} dropDownName
	 * @returns {module:image/imagestyle/imagestyleediting~ImageStyleFormat}
	 */
	_getDropdownConfig( dropdownName ) {
		const config = this._definedGroups.find( group => group.name === dropdownName );

		if ( !config ) {
			// describe the warning
			logWarning( 'image-style-toolbarview-item-unavailable', { dropdownName } );
		}

		return config;
	}

	/**
	 * Returns requested image style arrangement configuration
	 * provided in the {@link module:image/image~ImageConfig#styles image plugin configuration}.
	 *
	 * @private
	 * @param {String} dropDownName
	 * @returns {module:image/imagestyle/imagestyleediting~ImageStyleFormat}
	 */
	_getButtonConfig( buttonName ) {
		const config = this._definedArrangements.find( arrangement => arrangement.name === buttonName );

		if ( !config ) {
			// describe the warning
			logWarning( 'image-style-toolbarview-item-unavailable', { buttonName } );
		}

		return config;
	}

	_getToolbarStructure( toolbar ) {
		const toolbarStructure = {};

		for ( const item of toolbar ) {
			const itemContents = item.split( ':' );
			const isDropdown = itemContents.length === 3;

			if ( isDropdown ) {
				const dropdownName = itemContents[ 1 ];
				const itemName = itemContents[ 2 ];

				toolbarStructure[ dropdownName ] = [
					...toolbarStructure[ dropdownName ] || [],
					itemName
				];
			} else {
				const itemName = itemContents[ 1 ];

				toolbarStructure[ itemName ] = itemName;
			}
		}

		return toolbarStructure;
	}
}

/**
 * Returns the translated `title` from the passed styles array.
 *
 * @param {Array.<module:image/imagestyle/imagestyleediting~ImageStyleFormat>} styles
 * @param titles
 * @returns {Array.<module:image/imagestyle/imagestyleediting~ImageStyleFormat>}
 */
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

function getUIComponentName( dropdownName, buttonName ) {
	return 'imageStyle' +
		( dropdownName ? ':' + dropdownName : '' ) +
		( buttonName ? ':' + buttonName : '' );
}
