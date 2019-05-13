/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/ui/colortableview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ColorTileView from '@ckeditor/ckeditor5-ui/src/colorgrid/colortileview';
import ColorGridView from '@ckeditor/ckeditor5-ui/src/colorgrid/colorgridview';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import removeButtonIcon from '@ckeditor/ckeditor5-core/theme/icons/eraser.svg';
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
	 * @param {String} config.documentColorsCount The number of colors in document colors section inside dropdown.
	 */
	constructor( locale, { colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount } ) {
		super( locale );

		/**
		 * Collection of the children of the table.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.items = this.createCollection();

		/**
		 * An array with objects representing colors to be displayed in the grid.
		 *
		 * @type {Arrray.<module:ui/colorgrid/colorgrid~ColorDefinition>}
		 */
		this.colorDefinitions = colors;

		/**
		 * Tracks information about DOM focus in the list.
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
		 * Keeps value of the command associated with the table for the current selection.
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
		 * The label for the section with document colors.
		 *
		 * @type {String}
		 */
		this.documentColorsLabel = documentColorsLabel;

		/**
		 * The number of columns in the color grid.
		 *
		 * @type {Number}
		 */
		this.columns = columns;

		/**
		 * A collection of definitions stores document colors.
		 *
		 * @readonly
		 * @member {module:utils/collection~Collection}
		 */
		this.documentColors = new Collection();

		/**
		 * Maximum number of colors in document colors section.
		 * If equals 0, then document colors section is not added.
		 *
		 * @readonly
		 * @type {Number}
		 */
		this.documentColorsCount = documentColorsCount;

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
				focusNext: 'arrowdown',
			}
		} );

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
		this.items.add( this._createStaticColorsGrid() );

		if ( documentColorsCount ) {
			this.items.add( this._createDocumentColorsGrid() );
		}
	}

	/**
	 * Adds the remove color button as a child of the current view.
	 *
	 * @private
	 * @returns {module:ui/src/button/buttonview~ButtonView}
	 */
	_removeColorButton() {
		const buttonView = new ButtonView();

		buttonView.set( {
			withText: true,
			icon: removeButtonIcon,
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
	 * @returns {module:ui/src/colorgrid/colorgridview~ColorGridView}
	 */
	_createStaticColorsGrid() {
		const colorGrid = new ColorGridView( this.locale, {
			colorDefinitions: this.colorDefinitions,
			columns: this.columns
		} );

		colorGrid.delegate( 'execute' ).to( this );
		colorGrid.bind( 'selectedColor' ).to( this );

		return colorGrid;
	}

	/**
	 * Creates document colors section view and binds it to {@link #documentColors}.
	 *
	 * @private
	 * @returns {module:ui/src/colorgrid/colorgridview~ColorGridView}
	 */
	_createDocumentColorsGrid() {
		const documentColors = new ColorGridView( this.locale, {
			columns: this.columns,
			gridLabel: this.documentColorsLabel
		} );

		documentColors.delegate( 'execute' ).to( this );
		documentColors.bind( 'selectedColor' ).to( this );

		documentColors.items.bindTo( this.documentColors ).using(
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
						value: colorObj.color,
						label: colorObj.label,
						options: Object.assign( {}, colorObj.options )
					} );
				} );

				return colorTile;
			}
		);

		this.documentColors.on( 'add', ( evt, item ) => {
			const duplicates = this.documentColors.filter( element => element.color === item.color, this );

			if ( duplicates.length === 2 ) {
				this.documentColors.remove( duplicates[ 1 ] );
			}
		} );

		return documentColors;
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
}
