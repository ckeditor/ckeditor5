/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module font/fontcolor/fontcolorediting
 */

import { Plugin, type Editor } from '@ckeditor/ckeditor5-core';
import { FontColorCommand } from './fontcolorcommand.js';
import type { ViewElement } from '@ckeditor/ckeditor5-engine';
import { _DEFAULT_COLORS as defaultColors, _DEFAULT_COLOR_GRID_COLUMNS as defaultColorGridColumns } from '@ckeditor/ckeditor5-ui';
import { FONT_COLOR, renderDowncastElement, renderUpcastAttribute } from '../utils.js';

/**
 * The font color editing feature.
 *
 * It introduces the {@link module:font/fontcolor/fontcolorcommand~FontColorCommand command} and
 * the `fontColor` attribute in the {@link module:engine/model/model~Model model} which renders
 * in the {@link module:engine/view/view view} as a `<span>` element (`<span style="color: ...">`),
 * depending on the {@link module:font/fontconfig~FontColorConfig configuration}.
 */
export class FontColorEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FontColorEditing' as const;
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

		editor.config.define( FONT_COLOR, {
			colors: defaultColors,
			columns: defaultColorGridColumns
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
				value: ( viewElement: ViewElement ) => viewElement.getAttribute( 'color' )
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
