/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module font/fontbackgroundcolor/fontbackgroundcolorediting
 */

import { Plugin, type Editor } from '@ckeditor/ckeditor5-core';
import { addBackgroundStylesRules } from '@ckeditor/ckeditor5-engine';
import { _DEFAULT_COLORS as defaultColors, _DEFAULT_COLOR_GRID_COLUMNS as defaultColorGridColumns } from '@ckeditor/ckeditor5-ui';

import { FontBackgroundColorCommand } from './fontbackgroundcolorcommand.js';
import { FONT_BACKGROUND_COLOR, renderDowncastElement, renderUpcastAttribute } from '../utils.js';

/**
 * The font background color editing feature.
 *
 * It introduces the {@link module:font/fontbackgroundcolor/fontbackgroundcolorcommand~FontBackgroundColorCommand command} and
 * the `fontBackgroundColor` attribute in the {@link module:engine/model/model~Model model} which renders
 * in the {@link module:engine/view/view view} as a `<span>` element (`<span style="background-color: ...">`),
 * depending on the {@link module:font/fontconfig~FontColorConfig configuration}.
 */
export class FontBackgroundColorEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FontBackgroundColorEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( FONT_BACKGROUND_COLOR, {
			colors: defaultColors,
			columns: defaultColorGridColumns
		} );

		editor.data.addStyleProcessorRules( addBackgroundStylesRules );
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

		// Allow the font backgroundColor attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: FONT_BACKGROUND_COLOR } );

		editor.model.schema.setAttributeProperties( FONT_BACKGROUND_COLOR, {
			isFormatting: true,
			copyOnEnter: true
		} );
	}
}
