/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module horizontal-line/horizontallineediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { toWidget } from 'ckeditor5/src/widget.js';
import type { DowncastWriter, ViewElement } from 'ckeditor5/src/engine.js';

import HorizontalLineCommand from './horizontallinecommand.js';

import '../theme/horizontalline.css';

/**
 * The horizontal line editing feature.
 */
export default class HorizontalLineEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'HorizontalLineEditing' as const;
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
	public init(): void {
		const editor = this.editor;
		const schema = editor.model.schema;
		const t = editor.t;
		const conversion = editor.conversion;

		schema.register( 'horizontalLine', {
			inheritAllFrom: '$blockObject'
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'horizontalLine',
			view: ( modelElement, { writer } ) => {
				return writer.createEmptyElement( 'hr' );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToStructure( {
			model: 'horizontalLine',
			view: ( modelElement, { writer } ) => {
				const label = t( 'Horizontal line' );

				const viewWrapper = writer.createContainerElement( 'div', null,
					writer.createEmptyElement( 'hr' )
				);

				writer.addClass( 'ck-horizontal-line', viewWrapper );
				writer.setCustomProperty( 'hr', true, viewWrapper );

				return toHorizontalLineWidget( viewWrapper, writer, label );
			}
		} );

		conversion.for( 'upcast' ).elementToElement( { view: 'hr', model: 'horizontalLine' } );

		editor.commands.add( 'horizontalLine', new HorizontalLineCommand( editor ) );
	}
}

/**
 * Converts a given {@link module:engine/view/element~Element} to a horizontal line widget:
 * * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to
 *   recognize the horizontal line widget element.
 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
 *
 * @param writer An instance of the view writer.
 */
function toHorizontalLineWidget( viewElement: ViewElement, writer: DowncastWriter, label: string ): ViewElement {
	writer.setCustomProperty( 'horizontalLine', true, viewElement );

	return toWidget( viewElement, writer, { label } );
}
