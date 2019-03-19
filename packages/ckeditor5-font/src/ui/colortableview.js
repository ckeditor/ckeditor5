/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import Template from '@ckeditor/ckeditor5-ui/src/template';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ColorTile from './colortile';

import removeButtonIcon from '../../theme/icons/eraser.svg';

import '../../theme/fontcolor.css';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';

export default class ColorTableView extends View {
	constructor( locale, { colors } ) {
		super( locale );

		this.colorsDefinition = colors;

		this.set( 'selectedColor' );
		this.set( 'hoveredColor' );
		this.set( 'removeButtonTooltip' );
		this.set( 'colorColumns', 5 );
		this.set( 'recentlyUsedColors', new Collection() );
		this.initRecentCollection();

		this.recentlyUsedColors.on( 'add', ( evt, item ) => {
			const duplicates = this.recentlyUsedColors.filter( element => element.color === item.color, this );
			if ( duplicates.length === 2 ) {
				this.recentlyUsedColors.remove( duplicates[ 1 ] );
			}
			if ( this.recentlyUsedColors.length > this.colorColumns ) {
				this.recentlyUsedColors.remove( this.recentlyUsedColors.length - 1 );
			}
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck-color-table' ]
			},
			children: [
				this.removeColorButton(),
				this.createColorTableTemplate(),
				this.recentlyUsed()
			]
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
		const colorCollection = this.createCollection();
		this.colorsDefinition.forEach( item => {
			const colorTile = new ColorTile();
			colorTile.set( {
				color: item.color,
				hasBorder: item.options.hasBorder
			} );
			colorTile.delegate( 'execute' ).to( this );
			colorCollection.add( colorTile );
		} );

		return new Template( {
			tag: 'div',
			children: colorCollection,
			attributes: {
				class: 'ck-color-table__grid-container'
			}
		} );
	}

	recentlyUsed() {
		this.recentlyUsedViews = this.createCollection();

		this.recentlyUsedViews.bindTo( this.recentlyUsedColors ).using(
			colorObj => {
				const colorTile = new ColorTile();
				colorTile.set( {
					color: colorObj.color,
					hasBorder: true
				} );
				colorTile.delegate( 'execute' ).to( this );
				return colorTile;
			}
		);
		return new Template( {
			tag: 'div',
			children: this.recentlyUsedViews,
			attributes: {
				class: [ 'ck-color-table__grid-container' ]
			}
		} );
	}

	initRecentCollection() {
		for ( let i = 0; i < this.colorColumns; i++ ) {
			this.recentlyUsedColors.add( {
				color: 'hsla( 0, 0%, 0%, 0 )'
			} );
		}
	}
}
