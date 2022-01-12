/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontcolor/fontcolorediting
 */

import { Plugin } from 'ckeditor5/src/core';
import FontColorCommand from './fontcolorcommand';
import { FONT_COLOR, renderDowncastElement, renderUpcastAttribute } from '../utils';

/**
 * The font color editing feature.
 *
 * It introduces the {@link module:font/fontcolor/fontcolorcommand~FontColorCommand command} and
 * the `fontColor` attribute in the {@link module:engine/model/model~Model model} which renders
 * in the {@link module:engine/view/view view} as a `<span>` element (`<span style="color: ...">`),
 * depending on the {@link module:font/fontcolor~FontColorConfig configuration}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontColorEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FontColorEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( FONT_COLOR, {
			colors: [
				{
					color: 'hsl(0, 0%, 0%)',
					label: 'Black'
				},
				{
					color: 'hsl(0, 0%, 30%)',
					label: 'Dim grey'
				},
				{
					color: 'hsl(0, 0%, 60%)',
					label: 'Grey'
				},
				{
					color: 'hsl(0, 0%, 90%)',
					label: 'Light grey'
				},
				{
					color: 'hsl(0, 0%, 100%)',
					label: 'White',
					hasBorder: true
				},
				{
					color: 'hsl(0, 75%, 60%)',
					label: 'Red'
				},
				{
					color: 'hsl(30, 75%, 60%)',
					label: 'Orange'
				},
				{
					color: 'hsl(60, 75%, 60%)',
					label: 'Yellow'
				},
				{
					color: 'hsl(90, 75%, 60%)',
					label: 'Light green'
				},
				{
					color: 'hsl(120, 75%, 60%)',
					label: 'Green'
				},
				{
					color: 'hsl(150, 75%, 60%)',
					label: 'Aquamarine'
				},
				{
					color: 'hsl(180, 75%, 60%)',
					label: 'Turquoise'
				},
				{
					color: 'hsl(210, 75%, 60%)',
					label: 'Light blue'
				},
				{
					color: 'hsl(240, 75%, 60%)',
					label: 'Blue'
				},
				{
					color: 'hsl(270, 75%, 60%)',
					label: 'Purple'
				}
			],
			columns: 5
		} );

		editor.conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'span',
				styles: {
					'color': /[\s\S]+/
				}
			},
			model: {
				key: FONT_COLOR,
				value: renderUpcastAttribute( 'color' )
			}
		} );

		// Support legacy `<font color="..">` formatting.
		editor.conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'font',
				attributes: {
					'color': /^#?\w+$/
				}
			},
			model: {
				key: FONT_COLOR,
				value: viewElement => viewElement.getAttribute( 'color' )
			}
		} );

		editor.conversion.for( 'downcast' ).attributeToElement( {
			model: FONT_COLOR,
			view: renderDowncastElement( 'color' )
		} );

		editor.commands.add( FONT_COLOR, new FontColorCommand( editor ) );

		// Allow the font color attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: FONT_COLOR } );

		editor.model.schema.setAttributeProperties( FONT_COLOR, {
			isFormatting: true,
			copyOnEnter: true
		} );
	}
}
