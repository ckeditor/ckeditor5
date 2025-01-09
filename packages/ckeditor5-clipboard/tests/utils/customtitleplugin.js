/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

export function CustomTitle( editor ) {
	const model = editor.model;

	model.schema.register( 'title', { isBlock: true, allowIn: '$root' } );
	model.schema.register( 'title-content', { isBlock: true, allowIn: 'title', allowAttributes: [ 'alignment' ] } );
	model.schema.extend( '$text', { allowIn: 'title-content' } );

	editor.editing.mapper.on( 'modelToViewPosition', mapModelPositionToView( editor.editing.view ) );
	editor.data.mapper.on( 'modelToViewPosition', mapModelPositionToView( editor.editing.view ) );

	editor.conversion.for( 'downcast' ).elementToElement( { model: 'title-content', view: 'h1' } );
	editor.conversion.for( 'downcast' ).add( dispatcher => dispatcher.on(
		'insert:title',
		( evt, data, conversionApi ) => {
			conversionApi.consumable.consume( data.item, evt.name );
		}
	) );
}

function mapModelPositionToView( editingView ) {
	return ( evt, data ) => {
		const positionParent = data.modelPosition.parent;

		if ( !positionParent.is( 'element', 'title' ) ) {
			return;
		}

		const modelTitleElement = positionParent.parent;
		const viewElement = data.mapper.toViewElement( modelTitleElement );

		data.viewPosition = editingView.createPositionAt( viewElement, 0 );
		evt.stop();
	};
}
