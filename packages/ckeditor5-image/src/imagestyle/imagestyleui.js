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
		const editing = this.editor.plugins.get( 'ImageStyleEditing' );

		this.normalizedStyles = editing.normalizedStyles;

		const definedArrangements = translateStyles(
			this.normalizedStyles.arrangements,
			this.localizedDefaultStylesTitles );

		for ( const arrangementConfig of definedArrangements ) {
			this._createButton( arrangementConfig );
		}

		const definedGroups = translateStyles(
			this.normalizedStyles.groups,
			this.localizedDefaultStylesTitles );

		for ( const groupConfig of definedGroups ) {
			this._createDropdown( groupConfig );
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
		const factory = this.editor.ui.componentFactory;

		factory.add( getUIComponentName( dropdownConfig.name ), locale => {
			const dropdownView = createDropdown( locale, SplitButtonView );
			const splitButtonView = dropdownView.buttonView;

			const buttonViews = dropdownConfig.items
				.map( buttonName => factory.create( getUIComponentName( buttonName ) ) );

			addToolbarToDropdown( dropdownView, buttonViews );

			splitButtonView.set( {
				label: dropdownConfig.title,
				icon: dropdownConfig.icon,
				currentCommand: false,
				class: null,
				tooltip: true
			} );

			splitButtonView.bind( 'icon' )
				.toMany( buttonViews, 'isOn', ( ...areOn ) => {
					const index = areOn.findIndex( isOn => isOn );

					if ( index < 0 ) {
						return this._getDefaultIcon( dropdownConfig.defaultItem );
					}

					return buttonViews[ index ].icon;
				} );

			splitButtonView.bind( 'isOn' )
				.toMany( buttonViews, 'isOn', ( ...areOn ) => areOn.find( isOn => isOn ) );

			splitButtonView.bind( 'currentCommand' )
				.toMany( buttonViews, 'isOn', ( ...areOn ) => {
					if ( areOn.find( isOn => isOn ) ) {
						return false;
					} else {
						return dropdownConfig.defaultItem;
					}
				} );

			splitButtonView.bind( 'class' )
				.to( splitButtonView, 'currentCommand', command => command ? null : 'ck-splitbutton_flatten' );

			splitButtonView.on( 'execute', () => {
				if ( splitButtonView.currentCommand ) {
					this._executeCommand( splitButtonView.currentCommand );
				} else {
					splitButtonView.arrowView.fire( 'execute' );
				}
			} );

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

	_getDefaultIcon( arrangementName ) {
		const arrangements = this.normalizedStyles.arrangements;
		const configuration = arrangements.find( item => item.name === arrangementName );

		return configuration.icon;
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
