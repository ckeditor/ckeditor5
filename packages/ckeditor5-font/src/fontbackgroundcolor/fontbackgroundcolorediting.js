/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontfamily/fontfamilyediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import FontBackgroundColorCommand from './fontbackgroundcolorcommand';

import { FONT_BACKGROUND_COLOR, renderDowncastElement, renderUpcastAttribute } from '../utils';

export default class FontBackgroundColorEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( FONT_BACKGROUND_COLOR, {
			options: [
				{
					label: 'Strong Cyan',
					color: '#1ABC9C'
				},
				{
					label: 'Emerald',
					color: '#2ECC71'
				},
				{
					label: 'Bright Blue',
					color: '#3498DB'
				},
				{
					label: 'Amethyst',
					color: '#9B59B6'
				},
				{
					label: 'Grayish Blue',
					color: '#4E5F70'
				},
				{
					label: 'Vivid Yellow',
					color: '#F1C40F'
				},
				{
					label: 'Dark Cyan',
					color: '#16A085'
				},
				{
					label: 'Dark Emerald',
					color: '#27AE60'
				},
				{
					label: 'Strong Blue',
					color: '#2980B9'
				},
				{
					label: 'Dark Violet',
					color: '#8E44AD'
				},
				{
					label: 'Desaturated Blue',
					color: '#2C3E50'
				},
				{
					label: 'Orange',
					color: '#F39C12'
				},
				{
					label: 'Carrot',
					color: '#E67E22'
				},
				{
					label: 'Pale Red',
					color: '#E74C3C'
				},
				{
					label: 'Bright Silver',
					color: '#ECF0F1'
				},
				{
					label: 'Light Grayish Cyan',
					color: '#95A5A6'
				},
				{
					label: 'Light Gray',
					color: '#DDD'
				},
				{
					label: 'White',
					color: '#FFF'
				},
				{
					label: 'Pumpkin',
					color: '#D35400'
				},
				{
					label: 'Strong Red',
					color: '#C0392B'
				},
				{
					label: 'Silver',
					color: '#BDC3C7'
				},
				{
					label: 'Grayish Cyan',
					color: '#7F8C8D'
				},
				{
					label: 'Dark Gray',
					color: '#999'
				},
				{
					label: 'Black',
					color: '#000'
				}
			]
		} );

		editor.conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'span',
				styles: {
					'background-color': /[\s\S]+/
				}
			},
			model: {
				key: FONT_BACKGROUND_COLOR,
				value: renderUpcastAttribute( 'background-color' )
			}
		} );

		editor.conversion.for( 'downcast' ).attributeToElement( {
			model: FONT_BACKGROUND_COLOR,
			view: renderDowncastElement( 'background-color' )
		} );

		editor.commands.add( FONT_BACKGROUND_COLOR, new FontBackgroundColorCommand( editor ) );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow fontBackgroundColor attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: FONT_BACKGROUND_COLOR } );
	}
}
