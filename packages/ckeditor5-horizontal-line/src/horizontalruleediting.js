/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module horizontal-rule/horizontalruleediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

import '../theme/horizontalrule.css';

/**
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
			isBlock: true,
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
				const viewElement = viewWriter.createContainerElement( 'div' );

				viewWriter.addClass( 'ck-horizontal-rule', viewElement );
				viewWriter.setCustomProperty( 'hr', true, viewElement );

				return toWidget( viewElement, viewWriter, {
					label,
					hasSelectionHandler: true
				} );
			}
		} );

		conversion.for( 'upcast' )
			.elementToElement( {
				view: 'hr',
				model: ( viewElement, modelWriter ) => {
					return modelWriter.createElement( 'horizontalRule' );
				}
			} );
	}
}
