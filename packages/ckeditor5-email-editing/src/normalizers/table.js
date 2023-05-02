/*
 * Converter for preserving .table class on the <table> element
 * to prevent losing table styles applied to the <figure>
 */
export function addClassToTableElement( conversion ) {
	conversion.for( 'dataDowncast' ).add( dispatcher => {
		dispatcher.on( 'insert:table', ( evt, data, { writer, mapper } ) => {
			const modelElement = data.item;
			const viewElement = mapper.toViewElement( modelElement );

			writer.addClass( 'table', viewElement );
		} );
	} );
}

/*
 * Converter for
 */
export function addBgColorAttributeToElement( conversion ) {
	conversion.for( 'dataDowncast' ).attributeToAttribute( {
		model: 'tableCellBackgroundColor',
		view: 'bgColor',
		converterPriority: 'high'
	} );

	conversion.for( 'dataDowncast' ).attributeToAttribute( {
		model: 'tableBackgroundColor',
		view: 'bgColor',
		converterPriority: 'highest'
	} );
}

