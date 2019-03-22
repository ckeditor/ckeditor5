/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/ui/colortableview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ColorTile from './colortile';
import ColorGrid from './colorgrid';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import removeButtonIcon from '@ckeditor/ckeditor5-core/theme/icons/eraser.svg';
import '../../theme/fontcolor.css';

/**
 * Class which represents view with {@link module:font/ui/colorgrid~ColorGrid}
 * and remove buttons inside {@link module:ui/dropdown/dropdownview~DropdownView}.
 *
 * @extends module:ui/view~View
 */
export default class ColorTableView extends View {
	/**
	 * Construct view which will be inserted as child of {@link module:ui/dropdown/dropdownview~DropdownView}
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 * @param {Object} config Configuration object
	 * @param {Array.<Object>} config.colors Array with objects drawn as static set of available colors in color table.
	 * @param {Number} config.colorColumns Number of columns in color grid. Determines how many recent color will be displayed.
	 * @param {String} config.removeButtonTooltip Description of button responsible for removing color attributes.
	 */
	constructor( locale, { colors, colorColumns, removeButtonTooltip } ) {
		super( locale );

		/**
		 * Collection of the child list views.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.items = this.createCollection();

		/**
		 * Array with objects representing color to be drawn in color grid.
		 * @type {Arrray.<Object>}
		 */
		this.colorsDefinition = colors;

		/**
		 * Tracks information about DOM focus in the list.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * Keeps value of command for current selection.
		 * @type {String}
		 */
		this.set( 'selectedColor' );

		/**
		 * Description of button responsible for removing color attributes.
		 * @type {String}
		 */
		this.removeButtonTooltip = removeButtonTooltip;

		/**
		 * Number of columns in color grid. Determines how many recent color will be displayed.
		 * @type {Number}
		 */
		this.colorColumns = colorColumns;

		/**
		 * Collection kept model of colors used for Recent Colors section.
		 *
		 * @readonly
		 * @member {module:utils/collection~Collection}
		 */
		this.recentlyUsedColors = new Collection();

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
				// Navigate list items backwards using the arrowup key.
				focusPrevious: 'arrowup',

				// Navigate toolbar items forwards using the arrowdown key.
				focusNext: 'arrowdown',
			}
		} );

		this.initRecentCollection();
		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck-color-table' ]
			},
			children: this.items
		} );

		this.items.add( this.removeColorButton() );
		this.items.add( this.createStaticColorTable() );
		this.items.add( this.recentlyUsed() );
	}

	/**
	 * Adds remove color button as child for current view.
	 *
	 * @private
	 */
	removeColorButton() {
		const btnView = new ButtonView();
		btnView.set( {
			withText: true,
			icon: removeButtonIcon,
			tooltip: true,
			label: this.removeButtonTooltip
		} );
		btnView.class = 'ck-color-table__remove-color';
		btnView.on( 'execute', () => {
			this.fire( 'execute', { value: null } );
		} );
		return btnView;
	}

	/**
	 * Creates static color table grid based on editor config.
	 * @private
	 */
	createStaticColorTable() {
		const colorGrid = new ColorGrid( this.locale, { colorsDefinition: this.colorsDefinition } );
		colorGrid.delegate( 'execute' ).to( this );
		return colorGrid;
	}

	/**
	 * Adds recently used color section view and bind it to {@link #recentlyUsedColors}.
	 * @private
	 */
	recentlyUsed() {
		const recentViews = new ColorGrid( this.locale );

		recentViews.items.bindTo( this.recentlyUsedColors ).using(
			colorObj => {
				const colorTile = new ColorTile();
				colorTile.set( {
					color: colorObj.color,
					hasBorder: colorObj.hasBorder
				} );
				if ( colorObj.label ) {
					colorTile.set( {
						label: colorObj.label,
						tooltip: true
					} );
				}
				if ( colorObj.isEnabled === false ) {
					colorTile.set( 'isEnabled', false );
				}
				colorTile.on( 'execute', () => {
					this.fire( 'execute', { value: colorObj.color, hasBorder: colorObj.hasBorder, label: colorObj.label } );
				} );
				return colorTile;
			}
		);

		this.recentlyUsedColors.on( 'add', ( evt, item ) => {
			const duplicates = this.recentlyUsedColors.filter( element => element.color === item.color, this );
			if ( duplicates.length === 2 ) {
				this.recentlyUsedColors.remove( duplicates[ 1 ] );
			}
			if ( this.recentlyUsedColors.length > this.colorColumns ) {
				this.recentlyUsedColors.remove( this.recentlyUsedColors.length - 1 );
			}
		} );

		recentViews.delegate( 'execute' ).to( this );
		return recentViews;
	}

	/**
	 * Populate {@link #recentlyUsedColors} with empty non-clickable buttons, which represents space for colors.
	 * @private
	 */
	initRecentCollection() {
		for ( let i = 0; i < this.colorColumns; i++ ) {
			this.recentlyUsedColors.add( {
				color: 'hsla( 0, 0%, 0%, 0 )',
				isEnabled: false,
				hasBorder: true
			} );
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

		this.items.on( 'add', ( evt, item ) => {
			this.focusTracker.add( item.element );
		} );

		this.items.on( 'remove', ( evt, item ) => {
			this.focusTracker.remove( item.element );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element );
	}

	/**
	 * Focuses the first focusable in {@link #items}.
	 */
	focus() {
		this._focusCycler.focusFirst();
	}

	/**
	 * Focuses the last focusable in {@link #items}.
	 */
	focusLast() {
		this._focusCycler.focusLast();
	}
}
