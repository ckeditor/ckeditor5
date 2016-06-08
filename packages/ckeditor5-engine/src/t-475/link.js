/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import BuildModelConverterFor from '../engine/conversion/model-converter-builder.js';
import BuildViewConverterFor from '../engine/conversion/view-converter-builder.js';
import AttributeElement from '../engine/view/attributeelement.js';

export default class Bold extends Feature {
	init() {
		const editor = this.editor;
		const data = editor.data;
		const editing = editor.editing;

		// Allow bold attribute on all inline nodes.
		editor.document.schema.allow( { name: '$inline', attributes: [ 'link' ] } );

		// Build converter from model to view for data and editing pipelines.
		BuildModelConverterFor( data.modelToView, editing.modelToView )
			.fromAttribute( 'link' )
			.toElement( ( href ) => new AttributeElement( 'a', { href } ) );

		// Build converter from view to model for data pipeline.
		BuildViewConverterFor( data.viewToModel )
			.fromElement( 'a' )
			.toAttribute( ( viewElement ) => ( { key: 'link', value: viewElement.getAttribute( 'href' ) } ) );
	}
}
