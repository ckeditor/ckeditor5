/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module horizontal-line/horizontallineediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import HorizontalLineCommand from './horizontallinecommand';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

import '../theme/horizontalline.css';

/**
 * The horizontal line editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HorizontalLineEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'HorizontalLineEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const t = editor.t;
		const conversion = editor.conversion;

		schema.register( 'horizontalLine', {
			isObject: true,
			allowWhere: '$block'
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'horizontalLine',
			view: ( modelElement, viewWriter ) => {
				return viewWriter.createEmptyElement( 'hr' );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'horizontalLine',
			view: ( modelElement, viewWriter ) => {
				const label = t( 'Horizontal line' );
				const viewWrapper = viewWriter.createContainerElement( 'div' );
				const viewHrElement = viewWriter.createEmptyElement( 'hr' );

				viewWriter.addClass( 'ck-horizontal-line', viewWrapper );
				viewWriter.setCustomProperty( 'hr', true, viewWrapper );

				viewWriter.insert( viewWriter.createPositionAt( viewWrapper, 0 ), viewHrElement );

				return toHorizontalLineWidget( viewWrapper, viewWriter, label );
			}
		} );

		conversion.for( 'upcast' ).elementToElement( { view: 'hr', model: 'horizontalLine' } );

		editor.commands.add( 'horizontalLine', new HorizontalLineCommand( editor ) );
	}
}

// Converts a given {@link module:engine/view/element~Element} to a horizontal line widget:
// * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to
//   recognize the horizontal line widget element.
// * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
//
//  @param {module:engine/view/element~Element} viewElement
//  @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
//  @param {String} label The element's label.
//  @returns {module:engine/view/element~Element}
function toHorizontalLineWidget( viewElement, writer, label ) {
	writer.setCustomProperty( 'horizontalLine', true, viewElement );

	return toWidget( viewElement, writer, { label } );
}
