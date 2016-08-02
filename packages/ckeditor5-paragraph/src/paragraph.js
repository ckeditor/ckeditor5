/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import buildModelConverter from '../engine/conversion/buildmodelconverter.js';
import buildViewConverter from '../engine/conversion/buildviewconverter.js';

/**
 * The paragraph feature for the editor.
 * Introduces the `<paragraph>` element in the model which renders as a `<p>` element in the DOM and data.
 *
 * @memberOf paragraph
 * @extends core.Feature
 */
export default class Paragraph extends Feature {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const data = editor.data;
		const editing = editor.editing;

		// Schema.
		editor.document.schema.registerItem( 'paragraph', '$block' );

		// Build converter from model to view for data and editing pipelines.
		buildModelConverter().for( data.modelToView, editing.modelToView )
			.fromElement( 'paragraph' )
			.toElement( 'p' );

		// Build converter from view to model for data pipeline.
		buildViewConverter().for( data.viewToModel )
			.fromElement( 'p' )
			.toElement( 'paragraph' );
	}
}
