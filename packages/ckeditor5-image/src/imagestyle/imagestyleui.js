/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/imagestyleui
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView, createDropdown, addToolbarToDropdown } from 'ckeditor5/src/ui';

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
		// const configuredToolbar = editor.config.get( 'image.toolbar' )
		// 	.filter( item => item.split( ':' )[ 0 ] === 'imageStyle' );

		const definedArrangements = translateStyles(
			normalizeImageStyles( configuredStyles, 'arrangements' ),
			this.localizedDefaultStylesTitles );

		for ( const arrangement of definedArrangements ) {
			this._createButton( arrangement );
		}

		const definedGroups = translateStyles(
			normalizeImageStyles( configuredStyles, 'groups' ),
			this.localizedDefaultStylesTitles );

		for ( const group of definedGroups ) {
			this._createDropdown( group );
		}
	}

	/**
	 * Creates a dropdown and stores it in the editor {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
	 *
	 * @private
	 * @param {module:image/imagestyle/imagestyleediting~ImageStyleFormat} dropdownConfig uwaga! tutaj format będzie się trochę róznił
	 * @param {Array<String>} buttonNames
	 */
	_createDropdown( dropdownConfig ) {
		if ( !dropdownConfig ) {
			return;
		}

		const dropdownName = dropdownConfig.name;
		const componentName = getUIComponentName( dropdownName );

		this.editor.ui.componentFactory.add( componentName, locale => {
			const dropdownView = createDropdown( locale );
			const factory = this.editor.ui.componentFactory;

			// Configuring the toolbarView.
			const buttons = dropdownConfig.items.map(
				name => factory.create( getUIComponentName( name ) )
			);

			addToolbarToDropdown( dropdownView, buttons );

			// Configuring the buttonView.
			dropdownView.buttonView.set( {
				label: dropdownConfig.title,
				icon: dropdownConfig.icon,
				tooltip: true
			} );

			dropdownView.buttonView
				.bind( 'icon' )
				.toMany(
					buttons,
					'isOn',
					( ...areOn ) => {
						const index = areOn.findIndex( isOn => isOn );

						if ( index < 0 ) {
							return dropdownConfig.defaultIcon;
						}

						return buttons[ index ].icon;
					}
				);

			dropdownView.buttonView
				.bind( 'isSelected' )
				.toMany(
					buttons,
					'isOn',
					( ...areOn ) => areOn.find( isOn => isOn )
				);

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
	_createButton( buttonConfig ) {
		if ( !buttonConfig ) {
			return;
		}

		const editor = this.editor;
		const buttonName = buttonConfig.name;
		const componentName = getUIComponentName( buttonName );

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

			view.on( 'execute', this._executeCommand.bind( this, buttonConfig ) );

			return view;
		} );
	}

	_executeCommand( config ) {
		const editor = this.editor;

		if ( config.modelElement ) {
			editor.execute( 'imageTypeSwitch', config.modelElement );
			// ASK: nie ma zadnego warna kiedy próbujemy wykonać zablokowaną komandę,
			// to jest ok? Czy ikonka powinna być disabled, jeśli tylko jedna z komend jest zablokowana?
		}

		editor.execute( 'imageStyle', { value: config.name } );
		editor.editing.view.focus();
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

function getUIComponentName( name ) {
	return 'imageStyle:' + name;
}
