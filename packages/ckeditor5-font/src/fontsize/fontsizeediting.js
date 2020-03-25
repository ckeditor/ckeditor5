/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontsize/fontsizeediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import FontSizeCommand from './fontsizecommand';
import { normalizeOptions } from './utils';
import { buildDefinition, FONT_SIZE } from '../utils';

/**
 * The font size editing feature.
 *
 * It introduces the {@link module:font/fontsize/fontsizecommand~FontSizeCommand command} and the `fontSize`
 * attribute in the {@link module:engine/model/model~Model model} which renders in the {@link module:engine/view/view view}
 * as a `<span>` element with either:
 * * a style attribute (`<span style="font-size:12px">...</span>`),
 * * or a class attribute (`<span class="text-small">...</span>`)
 *
 * depending on the {@link module:font/fontsize~FontSizeConfig configuration}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontSizeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FontSizeEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		// Define default configuration using named presets.
		editor.config.define( FONT_SIZE, {
			options: [
				'tiny',
				'small',
				'default',
				'big',
				'huge'
			],
			disableValueMatching: false
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow fontSize attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: FONT_SIZE } );
		editor.model.schema.setAttributeProperties( FONT_SIZE, {
			isFormatting: true,
			copyOnEnter: true
		} );

		const disableValueMatching = editor.config.get( 'fontSize.disableValueMatching' );

		// Define view to model conversion.
		const options = normalizeOptions( this.editor.config.get( 'fontSize.options' ), { disableValueMatching } )
			.filter( item => item.model );
		const definition = buildDefinition( FONT_SIZE, options );

		// Set-up the two-way conversion.
		if ( disableValueMatching ) {
			this._prepareAnyValueConverters();
		} else {
			editor.conversion.attributeToElement( definition );
		}

		// Add FontSize command.
		editor.commands.add( FONT_SIZE, new FontSizeCommand( editor ) );
	}

	/**
	 * Those converters enable keeping any value found as `style="font-size: *"` as a value of an attribute on a text even
	 * if it isn't defined in the plugin configuration.
	 *
	 * @private
	 */
	_prepareAnyValueConverters() {
		const editor = this.editor;

		editor.conversion.for( 'downcast' ).attributeToElement( {
			model: FONT_SIZE,
			view: ( attributeValue, writer ) => {
				if ( !attributeValue ) {
					return;
				}

				return writer.createAttributeElement( 'span', { style: 'font-size:' + attributeValue }, { priority: 7 } );
			}
		} );

		editor.conversion.for( 'upcast' ).attributeToAttribute( {
			model: {
				key: FONT_SIZE,
				value: viewElement => viewElement.getStyle( 'font-size' )
			},
			view: {
				name: 'span'
			}
		} );
	}
}
