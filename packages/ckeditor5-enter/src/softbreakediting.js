/**
 * @module enter/softbreakediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';

/**
 * The soft-break enter plugin.
 * It registers `<br>` as an element in the document schema.
 * It also registers converters for editing and data pipelines.
 *
 * @extends module:core/plugin~Plugin
 */
export default class SoftBreakEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const conversion = editor.conversion;

		// Configure schema.
		schema.register( 'br', {
			isObject: false,
			isBlock: false,
			allowWhere: '$text'
		} );

		conversion.elementToElement( { model: 'br', view: 'br' } );

		conversion.for( 'downcast' )
			.add( downcastElementToElement( {
				model: 'br',
				view: ( modelElement, viewWriter ) => viewWriter.createEmptyElement( 'br' )
			} ) );
	}
}
