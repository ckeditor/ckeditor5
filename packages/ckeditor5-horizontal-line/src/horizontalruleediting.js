/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module horizontal-rule/horizontalruleediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import HorizontalRuleCommand from './horizontalrulecommand';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

import '../theme/horizontalrule.css';

/**
 * The horizontal rule editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HorizontalRuleEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const t = editor.t;
		const conversion = editor.conversion;

		schema.register( 'horizontalRule', {
			isObject: true,
			allowWhere: '$block'
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'horizontalRule',
			view: ( modelElement, viewWriter ) => {
				return viewWriter.createEmptyElement( 'hr' );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'horizontalRule',
			view: ( modelElement, viewWriter ) => {
				const label = t( 'Horizontal rule' );
				const viewWrapper = viewWriter.createContainerElement( 'div' );
				const viewHrElement = viewWriter.createEmptyElement( 'hr' );

				viewWriter.addClass( 'ck-horizontal-rule', viewWrapper );
				viewWriter.setCustomProperty( 'hr', true, viewWrapper );

				viewWriter.insert( viewWriter.createPositionAt( viewWrapper, 0 ), viewHrElement );

				return toHorizontalRuleWidget( viewWrapper, viewWriter, label );
			}
		} );

		conversion.for( 'upcast' ).elementToElement( { view: 'hr', model: 'horizontalRule' } );

		editor.commands.add( 'horizontalRule', new HorizontalRuleCommand( editor ) );
	}
}

// Converts a given {@link module:engine/view/element~Element} to a horizontal rule widget:
// * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to
//   recognize the horizontal rule widget element.
// * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
//
//  @param {module:engine/view/element~Element} viewElement
//  @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
//  @param {String} label The element's label.
//  @returns {module:engine/view/element~Element}
function toHorizontalRuleWidget( viewElement, writer, label ) {
	writer.setCustomProperty( 'horizontalRule', true, viewElement );

	return toWidget( viewElement, writer, { label } );
}
