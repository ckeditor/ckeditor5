/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import Template from '@ckeditor/ckeditor5-ui/src/template';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import '../../theme/fontcolor.css';
export default class ColorTableView extends View {
	constructor( locale, { colors } ) {
		super( locale );

		this.COLUMNS = 6;
		this.colorsDefinition = colors;

		this.set( 'selectedColor' );
		this.set( 'hoveredColor' );
		this.set( 'removeButtonTooltip' );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck-color-table' ]
			},
			children: [
				this.createColorTableTemplate(),
				this.removeColorButton()
			]
		} );
	}

	removeColorButton() {
		const btnView = new ButtonView();
		btnView.set( {
			label: 'X',
			withText: true
		} );
		btnView.bind( 'tooltip' ).to( this, 'removeButtonTooltip' );
		btnView.class = 'ck-color-table__remove-color';
		btnView.on( 'execute', () => {
			this.fire( 'execute', { value: null } );
		} );
		return btnView;
	}

	createColorTableTemplate() {
		return new Template( {
			tag: 'table',
			children: this._colorRows( this.colorsDefinition ),
			attributes: {
				class: 'ck-color-table__table'
			}
		} );
	}

	_colorRows( colorTable ) {
		return colorTable.map( rowArr => new Template( {
			tag: 'tr',
			children: this._colorElements( rowArr )
		} ) );
	}

	_colorElements( rowArr ) {
		const bind = this.bindTemplate;
		return rowArr.map( element => new Template( {
			tag: 'td',
			attributes: {
				style: {
					backgroundColor: element.color
				},
				class: [
					'ck-color-table__cell-color',
					bind.if(
						'selectedColor',
						'ck-color-table__cell-color_active',
						value => {
							return value === element.color;
						}
					)
				]
			},
			on: {
				click: bind.to( () => {
					this.fire( 'execute', { value: element.color } );
				} )
			}
		} ) );
	}
}
