/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/ui/colorui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import {
	addColorTableToDropdown,
	normalizeColorOptions,
	getLocalizedColorOptions
} from '../utils';

/**
 * The color UI plugin which isolates the common logic responsible for displaying dropdowns with color grids.
 *
 * In case that `documentColors` for given plugins are not defined in the configuration,
 * then by default its value equals to its `column` value. This results with
 * displaying one row of document colors.
 *
 * It is used to create the `'fontBackgroundColor'` and `'fontColor'` dropdowns, each hosting
 * a {@link module:font/ui/colortableview~ColorTableView}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ColorUI extends Plugin {
	/**
	 * Creates a plugin which introduces a dropdown with a pre–configured {@link module:font/ui/colortableview~ColorTableView}.
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {Object} config The configuration object.
	 * @param {String} config.commandName The name of the command which will be executed when a color tile is clicked.
	 * @param {String} config.componentName The name of the dropdown in the {@link module:ui/componentfactory~ComponentFactory}
	 * and the configuration scope name in `editor.config`.
	 * @param {String} config.icon SVG icon used by the dropdown.
	 * @param {String} config.dropdownLabel Label used by the dropdown.
	 */
	constructor( editor, { commandName, icon, componentName, dropdownLabel } ) {
		super( editor );

		/**
		 * The name of the command which will be executed when a color tile is clicked.
		 *
		 * @type {String}
		 */
		this.commandName = commandName;

		/**
		 * The name of this component in the {@link module:ui/componentfactory~ComponentFactory}.
		 * Also the configuration scope name in `editor.config`.
		 *
		 * @type {String}
		 */
		this.componentName = componentName;

		/**
		 * SVG icon used by the dropdown.
		 * @type {String}
		 */
		this.icon = icon;

		/**
		 * Label used by the dropdown.
		 *
		 * @type {String}
		 */
		this.dropdownLabel = dropdownLabel;

		/**
		 * The number of columns in the color grid.
		 *
		 * @type {Number}
		 */
		this.columns = editor.config.get( `${ this.componentName }.columns` );

		/**
		 * Keeps reference to {@link module:font/ui/colortableview~ColorTableView}.
		 *
		 * @type {module:font/ui/colortableview~ColorTableView}
		 */
		this.colorTableView;
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const command = editor.commands.get( this.commandName );
		const colorsConfig = normalizeColorOptions( editor.config.get( this.componentName ).colors );
		const localizedColors = getLocalizedColorOptions( editor, colorsConfig );
		const documentColorsCount = editor.config.get( `${ this.componentName }.documentColors` );

		// Register the UI component.
		editor.ui.componentFactory.add( this.componentName, locale => {
			const dropdownView = createDropdown( locale );
			this.colorTableView = addColorTableToDropdown( {
				dropdownView,
				colors: localizedColors.map( option => ( {
					label: option.label,
					color: option.model,
					options: {
						hasBorder: option.hasBorder
					}
				} ) ),
				columns: this.columns,
				removeButtonLabel: t( 'Remove color' ),
				documentColorsLabel: documentColorsCount !== 0 ? t( 'Document colors' ) : undefined,
				documentColorsCount: documentColorsCount === undefined ? this.columns : documentColorsCount
			} );

			this.colorTableView.bind( 'selectedColor' ).to( command, 'value' );

			dropdownView.buttonView.set( {
				label: this.dropdownLabel,
				icon: this.icon,
				tooltip: true
			} );

			dropdownView.extendTemplate( {
				attributes: {
					class: 'ck-color-ui-dropdown'
				}
			} );

			dropdownView.bind( 'isEnabled' ).to( command );

			dropdownView.on( 'execute', ( evt, data ) => {
				editor.execute( this.commandName, data );
				editor.editing.view.focus();
			} );

			if ( documentColorsCount !== 0 ) {
				dropdownView.on( 'change:isOpen', ( evt, name, val ) => {
					if ( val ) {
						this.findAndSetDocumentColors();
					}
				} );
			}

			return dropdownView;
		} );
	}

	/**
	 * Method scans through editor's content and search for text node attributes with name defined in {@link #commandName}.
	 * Found entries are set as document colors.
	 *
	 * All the previously stored document colors will be lost in the process.
	 *
	 * Method is used to determines document colors when UI dropdown is opened.
	 *
	 * @private
	 */
	findAndSetDocumentColors() {
		const model = this.editor.model;
		const document = model.document;
		const maxCount = this.colorTableView.documentColorsCount;
		const documentColors = this.colorTableView.documentColors;

		documentColors.clear();

		for ( const rootName of document.getRootNames() ) {
			const root = document.getRoot( rootName );
			const range = model.createRangeIn( root );
			for ( const node of range.getItems() ) {
				if ( node.is( 'textProxy' ) && node.hasAttribute( this.componentName ) ) {
					this.addColorToDocumentColors( node.getAttribute( this.componentName ) );
					if ( documentColors.length >= maxCount ) {
						return;
					}
				}
			}
		}
	}

	/**
	 * Method adds the `color` to document colors list. If possible, it will attempt to use data from the {@link #colorDefinitions} (label, color options).
	 * If color is found, then it is added to the {@link module:font/ui/colortableview~ColorTableView#documentColors} model.
	 * In other case it's created custom color, which is added to {@link module:font/ui/colortableview~ColorTableView#documentColors} model.
	 *
	 * @private
	 * @param {String} color String which stores value of recently applied color
	 */
	addColorToDocumentColors( color ) {
		const predefinedColor = this.colorTableView.colorDefinitions
			.find( definition => definition.color === color );

		if ( !predefinedColor ) {
			this.colorTableView.documentColors.add( {
				color,
				label: color,
				options: {
					hasBorder: false
				}
			} );
		} else {
			this.colorTableView.documentColors.add( Object.assign( {}, predefinedColor ) );
		}
	}
}
