/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/ui/colortableview
 */

import { icons } from 'ckeditor5/src/core';
import { ButtonView, ColorGridView, ColorTileView, FocusCycler, LabelView, Template, View } from 'ckeditor5/src/ui';
import { FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils';

import DocumentColorCollection from '../documentcolorcollection';

import '../../theme/fontcolor.css';

/**
 * A class which represents a view with the following sub–components:
 *
 * * A remove color button,
 * * A static {@link module:ui/colorgrid/colorgrid~ColorGridView} of colors defined in the configuration,
 * * A dynamic {@link module:ui/colorgrid/colorgrid~ColorGridView} of colors used in the document.
 *
 * @extends module:ui/view~View
 */
export default class ColorTableView extends View {
	/**
	 * Creates a view to be inserted as a child of {@link module:ui/dropdown/dropdownview~DropdownView}.
	 *
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 * @param {Object} config The configuration object.
	 * @param {Array.<module:ui/colorgrid/colorgrid~ColorDefinition>} config.colors An array with definitions of colors to
	 * be displayed in the table.
	 * @param {Number} config.columns The number of columns in the color grid.
	 * @param {String} config.removeButtonLabel The label of the button responsible for removing the color.
	 * @param {String} config.documentColorsLabel The label for the section with the document colors.
	 * @param {Number} config.documentColorsCount The number of colors in the document colors section inside the color dropdown.
	 */
	constructor( locale, { colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount } ) {
		super( locale );

		/**
		 * A collection of the children of the table.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.items = this.createCollection();

		/**
		 * An array with objects representing colors to be displayed in the grid.
		 *
		 * @type {Array.<module:ui/colorgrid/colorgrid~ColorDefinition>}
		 */
		this.colorDefinitions = colors;

		/**
		 * Tracks information about the DOM focus in the list.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * Keeps the value of the command associated with the table for the current selection.
		 *
		 * @type {String}
		 */
		this.set( 'selectedColor' );

		/**
		 * The label of the button responsible for removing color attributes.
		 *
		 * @type {String}
		 */
		this.removeButtonLabel = removeButtonLabel;

		/**
		 * The number of columns in the color grid.
		 *
		 * @type {Number}
		 */
		this.columns = columns;

		/**
		 * A collection of definitions that store the document colors.
		 *
		 * @readonly
		 * @member {module:font/documentcolorcollection~DocumentColorCollection}
		 */
		this.documentColors = new DocumentColorCollection();

		/**
		 * The maximum number of colors in the document colors section.
		 * If it equals 0, the document colors section is not added.
		 *
		 * @readonly
		 * @type {Number}
		 */
		this.documentColorsCount = documentColorsCount;

		/**
		 * Preserves the reference to {@link module:ui/colorgrid/colorgrid~ColorGridView} used to create
		 * the default (static) color set.
		 *
		 * The property is loaded once the the parent dropdown is opened the first time.
		 *
		 * @readonly
		 * @member {module:ui/colorgrid/colorgrid~ColorGridView|undefined} #staticColorsGrid
		 */

		/**
		 * Preserves the reference to {@link module:ui/colorgrid/colorgrid~ColorGridView} used to create
		 * the document colors. It remains undefined if the document colors feature is disabled.
		 *
		 * The property is loaded once the the parent dropdown is opened the first time.
		 *
		 * @readonly
		 * @member {module:ui/colorgrid/colorgrid~ColorGridView|undefined} #documentColorsGrid
		 */

		/**
		 * Helps cycling over focusable {@link #items} in the list.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/focuscycler~FocusCycler}
		 */
		this._focusCycler = new FocusCycler( {
			focusables: this.items,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate list items backwards using the Arrow Up key.
				focusPrevious: 'arrowup',

				// Navigate list items forwards using the Arrow Down key.
				focusNext: 'arrowdown'
			}
		} );

		/**
		 * Document color section's label.
		 *
		 * @private
		 * @readonly
		 * @type {String}
		 */
		this._documentColorsLabel = documentColorsLabel;

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-color-table'
				]
			},
			children: this.items
		} );

		this.items.add( this._removeColorButton() );
	}

	/**
	 * Scans through the editor model and searches for text node attributes with the given attribute name.
	 * Found entries are set as document colors.
	 *
	 * All the previously stored document colors will be lost in the process.
	 *
	 * @param {module:engine/model/model~Model} model The model used as a source to obtain the document colors.
	 * @param {String} attributeName Determines the name of the related model's attribute for a given dropdown.
	 */
	updateDocumentColors( model, attributeName ) {
		const document = model.document;
		const maxCount = this.documentColorsCount;

		this.documentColors.clear();

		for ( const rootName of document.getRootNames() ) {
			const root = document.getRoot( rootName );
			const range = model.createRangeIn( root );

			for ( const node of range.getItems() ) {
				if ( node.is( '$textProxy' ) && node.hasAttribute( attributeName ) ) {
					this._addColorToDocumentColors( node.getAttribute( attributeName ) );

					if ( this.documentColors.length >= maxCount ) {
						return;
					}
				}
			}
		}
	}

	/**
	 * Refreshes the state of the selected color in one or both {@link module:ui/colorgrid/colorgrid~ColorGridView}s
	 * available in the {@link module:font/ui/colortableview~ColorTableView}. It guarantees that the selection will occur only in one
	 * of them.
	 */
	updateSelectedColors() {
		const documentColorsGrid = this.documentColorsGrid;
		const staticColorsGrid = this.staticColorsGrid;
		const selectedColor = this.selectedColor;

		staticColorsGrid.selectedColor = selectedColor;

		if ( documentColorsGrid ) {
			documentColorsGrid.selectedColor = selectedColor;
		}
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		// Items added before rendering should be known to the #focusTracker.
		for ( const item of this.items ) {
			this.focusTracker.add( item.element );
		}

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	/**
	 * Appends {@link #staticColorsGrid} and {@link #documentColorsGrid} views.
	 */
	appendGrids() {
		if ( this.staticColorsGrid ) {
			return;
		}

		this.staticColorsGrid = this._createStaticColorsGrid();

		this.items.add( this.staticColorsGrid );

		if ( this.documentColorsCount ) {
			// Create a label for document colors.
			const bind = Template.bind( this.documentColors, this.documentColors );
			const label = new LabelView( this.locale );
			label.text = this._documentColorsLabel;
			label.extendTemplate( {
				attributes: {
					class: [
						'ck',
						'ck-color-grid__label',
						bind.if( 'isEmpty', 'ck-hidden' )
					]
				}
			} );
			this.items.add( label );
			this.documentColorsGrid = this._createDocumentColorsGrid();
			this.items.add( this.documentColorsGrid );
		}
	}

	/**
	 * Focuses the first focusable element in {@link #items}.
	 */
	focus() {
		this._focusCycler.focusFirst();
	}

	/**
	 * Focuses the last focusable element in {@link #items}.
	 */
	focusLast() {
		this._focusCycler.focusLast();
	}

	/**
	 * Adds the remove color button as a child of the current view.
	 *
	 * @private
	 * @returns {module:ui/button/buttonview~ButtonView}
	 */
	_removeColorButton() {
		const buttonView = new ButtonView();

		buttonView.set( {
			withText: true,
			icon: icons.eraser,
			tooltip: true,
			label: this.removeButtonLabel
		} );

		buttonView.class = 'ck-color-table__remove-color';
		buttonView.on( 'execute', () => {
			this.fire( 'execute', { value: null } );
		} );

		return buttonView;
	}

	/**
	 * Creates a static color table grid based on the editor configuration.
	 *
	 * @private
	 * @returns {module:ui/colorgrid/colorgrid~ColorGridView}
	 */
	_createStaticColorsGrid() {
		const colorGrid = new ColorGridView( this.locale, {
			colorDefinitions: this.colorDefinitions,
			columns: this.columns
		} );

		colorGrid.delegate( 'execute' ).to( this );

		return colorGrid;
	}

	/**
	 * Creates the document colors section view and binds it to {@link #documentColors}.
	 *
	 * @private
	 * @returns {module:ui/colorgrid/colorgrid~ColorGridView}
	 */
	_createDocumentColorsGrid() {
		const bind = Template.bind( this.documentColors, this.documentColors );
		const documentColorsGrid = new ColorGridView( this.locale, {
			columns: this.columns
		} );

		documentColorsGrid.delegate( 'execute' ).to( this );

		documentColorsGrid.extendTemplate( {
			attributes: {
				class: bind.if( 'isEmpty', 'ck-hidden' )
			}
		} );

		documentColorsGrid.items.bindTo( this.documentColors ).using(
			colorObj => {
				const colorTile = new ColorTileView();

				colorTile.set( {
					color: colorObj.color,
					hasBorder: colorObj.options && colorObj.options.hasBorder
				} );

				if ( colorObj.label ) {
					colorTile.set( {
						label: colorObj.label,
						tooltip: true
					} );
				}

				colorTile.on( 'execute', () => {
					this.fire( 'execute', {
						value: colorObj.color
					} );
				} );

				return colorTile;
			}
		);

		// Selected color should be cleared when document colors became empty.
		this.documentColors.on( 'change:isEmpty', ( evt, name, val ) => {
			if ( val ) {
				documentColorsGrid.selectedColor = null;
			}
		} );

		return documentColorsGrid;
	}

	/**
	 * Adds a given color to the document colors list. If possible, the method will attempt to use
	 * data from the {@link #colorDefinitions} (label, color options).
	 *
	 * @private
	 * @param {String} color A string that stores the value of the recently applied color.
	 */
	_addColorToDocumentColors( color ) {
		const predefinedColor = this.colorDefinitions
			.find( definition => definition.color === color );

		if ( !predefinedColor ) {
			this.documentColors.add( {
				color,
				label: color,
				options: {
					hasBorder: false
				}
			} );
		} else {
			this.documentColors.add( Object.assign( {}, predefinedColor ) );
		}
	}
}
