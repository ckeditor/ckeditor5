/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import Template from '@ckeditor/ckeditor5-ui/src/template';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import removeButtonIcon from '../../theme/icons/eraser.svg';

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
				this.removeColorButton(),
				this.createColorTableTemplate()
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
		return new Template( {
			tag: 'div',
			children: this._colorElements( this.colorsDefinition ),
			attributes: {
				class: 'ck-color-table__main-container'
			}
		} );
	}

	_colorElements( colorArr ) {
		const bind = this.bindTemplate;
		return colorArr.map( element => {
			const classNames = [ 'ck-color-table__color-item' ];
			if ( element.options.hasBorder ) {
				classNames.push( 'ck-color-table__color-item_bordered' );
			}
			return new Template( {
				tag: 'span',
				attributes: {
					style: {
						backgroundColor: element.color
					},
					class: classNames
				},
				on: {
					click: bind.to( () => {
						this.fire( 'execute', { value: element.color } );
					} )
				}
			} );
		} );
	}
}
