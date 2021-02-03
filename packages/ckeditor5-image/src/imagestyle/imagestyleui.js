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
		const configuredToolbar = editor.config.get( 'image.toolbar' );

		const normalizedArrangements = translateStyles(
			normalizeImageStyles( configuredStyles, 'arrangements' ),
			this.localizedDefaultStylesTitles );

		for ( const arrangement of normalizedArrangements ) {
			this._createButton( arrangement );
		}

		const normalizedGroups = translateStyles(
			normalizeImageStyles( configuredStyles, 'groups' ),
			this.localizedDefaultStylesTitles );

		for ( const group of normalizedGroups ) {
			this._createDropdown(
				group,
				configuredToolbar.filter( item => isInDropdown( group.name, item ) )
			);
		}
	}

	_createDropdown( group, dropdownItems ) {
		const componentName = getUIComponentName( group.name );
		const itemElements = [];

		this.editor.ui.componentFactory.add( componentName, locale => {
			const dropdownView = createDropdown( locale );

			dropdownView.buttonView.set( {
				label: group.title,
				icon: group.icon,
				tooltip: true,
				isToggleable: true
			} );

			for ( const item of dropdownItems ) {
				const itemName = getUIComponentName( item.split( ':' )[ 2 ] );
				const element = this.editor.ui.componentFactory.create( itemName );
				itemElements.push( element );
			}

			addToolbarToDropdown( dropdownView, itemElements );

			return dropdownView;
		} );
	}

	/**
	 * Creates a button for each style and stores it in the editor {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
	 *
	 * @private
	 * @param {module:image/imagestyle/imagestyleediting~ImageStyleFormat} style
	 */
	_createButton( arrangement ) {
		const editor = this.editor;

		const componentName = getUIComponentName( arrangement.name );

		editor.ui.componentFactory.add( componentName, locale => {
			const command = editor.commands.get( 'imageStyle' );
			const view = new ButtonView( locale );

			view.set( {
				label: arrangement.title,
				icon: arrangement.icon,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isEnabled' ).to( command, 'isEnabled' );
			view.bind( 'isOn' ).to( command, 'value', value => value === arrangement.name );

			view.on( 'execute', () => {
				editor.execute( 'imageTypeSwitch', arrangement.modelElement );
				editor.execute( 'imageStyle', { value: arrangement.name } );
				editor.editing.view.focus();
			} );

			return view;
		} );
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

function isInDropdown( dropDownName, configuredItem ) {
	const itemDropDown = configuredItem.split( ':' )[ 1 ];

	return itemDropDown === dropDownName;
}

function getUIComponentName( name ) {
	return `imageStyle:${ name }`;
}
