/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/imagestyleui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { createDropdown, addToolbarToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import SplitButtonView from '@ckeditor/ckeditor5-ui/src/dropdown/button/splitbuttonview';

import { normalizeImageStyles, structurizeStyleToolbar } from './utils';

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
		const configuredToolbar = editor.config.get( 'image.toolbar' );

		this._definedArrangements = translateStyles(
			normalizeImageStyles( configuredStyles, 'arrangements' ),
			this.localizedDefaultStylesTitles );

		this._definedGroups = translateStyles(
			normalizeImageStyles( configuredStyles, 'groups' ),
			this.localizedDefaultStylesTitles );

		const UIModel = structurizeStyleToolbar( configuredToolbar );

		for ( const itemKey in UIModel ) {
			const itemValue = UIModel[ itemKey ];

			if ( typeof itemValue === 'object' ) {
				this._createDropdown( itemKey, itemValue );
			} else {
				this._createButton( itemKey );
			}
		}
	}

	_createDropdown( dropdownName, buttons ) {
		const groupConfig = this._definedGroups.find( group => group.name === dropdownName );
		const componentName = getUIComponentName( { dropdownName } );

		this.editor.ui.componentFactory.add( componentName, locale => {
			const dropdownView = createDropdown( locale, SplitButtonView );
			const buttonComponents = [];

			dropdownView.buttonView.set( {
				label: groupConfig.title,
				icon: groupConfig.icon,
				tooltip: true,
				isToggleable: true,
				isSelectable: true
			} );

			for ( const button of buttons ) {
				const buttonName = this._createButton( button, dropdownName );
				buttonComponents.push( this.editor.ui.componentFactory.create( buttonName ) );
			}

			addToolbarToDropdown( dropdownView, buttonComponents );

			dropdownView.buttonView.bind( 'isSelected' ).toMany( buttonComponents, 'isOn', ( ...areActive ) => {
				for ( const isActive of areActive ) {
					if ( isActive ) {
						return true;
					}
				}

				return false;
			} );

			return dropdownView;
		} );
	}

	/**
	 * Creates a button for each style and stores it in the editor {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
	 *
	 * @private
	 * @param {module:image/imagestyle/imagestyleediting~ImageStyleFormat} style
	 */
	_createButton( buttonName, dropdownName ) {
		const editor = this.editor;
		const buttonConfig = this._definedArrangements.find( arrangment => arrangment.name === buttonName );
		const componentName = getUIComponentName( { buttonName, dropdownName } );

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

		return componentName;
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

function getUIComponentName( { buttonName, dropdownName } ) {
	return 'imageStyle' +
		( dropdownName ? ':' + dropdownName : '' ) +
		( buttonName ? ':' + buttonName : '' );
}
