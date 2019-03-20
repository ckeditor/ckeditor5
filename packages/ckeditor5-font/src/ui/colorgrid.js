/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ColorTile from './colortile';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

export default class ColorGrid extends View {
	constructor( locale, { colorsDefinition = [] } = {} ) {
		super( locale );

		this.items = this.createCollection();
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		colorsDefinition.forEach( item => {
			const colorTile = new ColorTile();
			colorTile.set( {
				color: item.color,
				hasBorder: item.options.hasBorder
			} );
			colorTile.on( 'execute', () => {
				this.fire( 'execute', { value: item.color, hasBorder: item.options.hasBorder } );
			} );
			this.items.add( colorTile );
		} );

		this.setTemplate( {
			tag: 'div',
			children: this.items,
			attributes: {
				class: 'ck-color-table__grid-container'
			}
		} );

		this._focusCycler = new FocusCycler( {
			focusables: this.items,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate list items backwards using the arrowup key.
				focusPrevious: 'arrowleft',

				// Navigate toolbar items forwards using the arrowdown key.
				focusNext: 'arrowright',
			}
		} );
	}

	focus() {
		if ( this.items.length ) {
			this.items.first.focus();
		}
	}

	focusLast() {
		if ( this.items.length ) {
			const lastChild = this.children.last;

			if ( typeof lastChild.focusLast === 'function' ) {
				lastChild.focusLast();
			} else {
				lastChild.focus();
			}
		}
	}

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
}
