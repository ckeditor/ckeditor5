/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import Template from '@ckeditor/ckeditor5-ui/src/template';

export default class InsertColorView extends View {
	constructor( locale, options ) {
		super( locale );

		const bind = this.bindTemplate;

		this.items = this.createCollection();

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck' ]
			},

			children: [ new ColorTable( options.map( item => ( { name: item.label, color: item.model } ) ), bind, this ) ]
		} );
	}
}

class ColorTable {
	constructor( colorsDefinition, bind, colorViewInstance ) {
		this.bind = bind;
		this.colorsDefinition = colorsDefinition;
		this.colorViewInstance = colorViewInstance;
		this.COLUMNS = 6;
		const template = new Template( {
			tag: 'table',
			children: this.colorRows(),
			attributes: {
				style: {
					width: '150px'
				}
			}
		} );
		return template;
	}

	colorRows() {
		const rows = [];
		for ( let i = 0; i < Math.ceil( this.colorsDefinition.length / this.COLUMNS ); i++ ) {
			rows.push( new Template( {
				tag: 'tr',
				children: this.colorElements( i )
			} ) );
		}
		return rows;
	}

	colorElements( index ) {
		const elements = [];
		for ( let i = 0; i < this.COLUMNS; i++ ) {
			elements.push( new Template( {
				tag: 'td',
				attributes: {
					style: {
						backgroundColor: `#${ this.colorsDefinition[ index * this.COLUMNS + i ].color }`,
						width: '25px',
						height: '25px'
					}
				},
				on: {
					click: this.bind.to( () => {
						this.colorViewInstance.fire( 'execute', { value: this.colorsDefinition[ index * this.COLUMNS + i ].color } );
					} )
				}
			} ) );
		}
		return elements;
	}
}
