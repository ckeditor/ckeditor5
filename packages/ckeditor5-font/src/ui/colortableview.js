/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ColorTile from './colortile';
import ColorGrid from './colorgrid';

import removeButtonIcon from '../../theme/icons/eraser.svg';

import '../../theme/fontcolor.css';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

export default class ColorTableView extends View {
	constructor( locale, { colors } ) {
		super( locale );
		this.locale = locale;
		this.items = this.createCollection();

		this.colorsDefinition = colors;
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		this.set( 'selectedColor' );
		this.set( 'hoveredColor' );
		this.set( 'removeButtonTooltip' );
		this.set( 'colorColumns', 5 );
		this.set( 'recentlyUsedColors', new Collection() );

		this.initRecentCollection();

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck-color-table' ]
			},
			children: this.items
		} );

		this.items.add( this.createColorTableTemplate() );
		this.items.add( this.recentlyUsed() );
		this.items.add( this.removeColorButton() );

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
	}

	removeColorButton() {
		const btnView = new ButtonView();
		btnView.set( {
			withText: true,
			icon: removeButtonIcon,
			tooltip: true
		} );
		btnView.bind( 'label' ).to( this, 'removeButtonTooltip' );
		btnView.class = 'ck-color-table__remove-color';
		btnView.on( 'execute', () => {
			this.fire( 'execute', { value: null } );
		} );
		return btnView;
	}

	createColorTableTemplate() {
		const colorGrid = new ColorGrid( this.locale, { colorsDefinition: this.colorsDefinition } );
		colorGrid.delegate( 'execute' ).to( this );
		return colorGrid;
	}

	recentlyUsed() {
		const recentViews = new ColorGrid( this.locale );

		recentViews.items.bindTo( this.recentlyUsedColors ).using(
			colorObj => {
				const colorTile = new ColorTile();
				colorTile.set( {
					color: colorObj.color,
					hasBorder: true
				} );
				if ( colorObj.isEnabled === false ) {
					colorTile.set( 'isEnabled', false );
				}
				colorTile.delegate( 'execute' ).to( this );
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

	initRecentCollection() {
		for ( let i = 0; i < this.colorColumns; i++ ) {
			this.recentlyUsedColors.add( {
				color: 'hsla( 0, 0%, 0%, 0 )',
				isEnabled: false
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

	focus() {
		this._focusCycler.focusFirst();
	}

	focusLast() {
		this._focusCycler.focusLast();
	}
}
