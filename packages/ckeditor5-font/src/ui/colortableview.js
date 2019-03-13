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
		const bind = this.bindTemplate;

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
				this.removeColorButton(),
				{
					text: bind.to( 'hoveredColor' )
				}
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
			children: this._colorRows(),
			attributes: {
				class: 'ck-color-table__table'
			}
		} );
	}

	_colorRows() {
		const rows = [];
		for ( let i = 0; i < Math.ceil( this.colorsDefinition.length / this.COLUMNS ); i++ ) {
			rows.push( new Template( {
				tag: 'tr',
				children: this._colorElements( i )
			} ) );
		}
		return rows;
	}

	_colorElements( index ) {
		const elements = [];
		const bind = this.bindTemplate;
		for ( let i = 0; i < this.COLUMNS; i++ ) {
			elements.push( new Template( {
				tag: 'td',
				attributes: {
					style: {
						backgroundColor: `${ this.colorsDefinition[ index * this.COLUMNS + i ].color }`
					},
					class: [
						'ck-color-table__cell-color',
						bind.if(
							'selectedColor',
							'ck-color-table__cell-color_active',
							value => {
								return value === this.colorsDefinition[ index * this.COLUMNS + i ].color;
							}
						)
					]
				},
				on: {
					click: bind.to( () => {
						this.fire( 'execute', { value: this.colorsDefinition[ index * this.COLUMNS + i ].color } );
					} ),
					mouseover: bind.to( () => {
						this.set( 'hoveredColor', this.colorsDefinition[ index * this.COLUMNS + i ].name );
					} ),
					mouseout: bind.to( () => {
						this.set( 'hoveredColor', undefined );
					} )
				}
			} ) );
		}
		return elements;
	}
}
