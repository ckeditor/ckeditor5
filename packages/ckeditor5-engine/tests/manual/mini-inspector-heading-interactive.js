/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
// TODO: import from @ckeditor/ckeditor5-inspector once this PR is merged: https://github.com/ckeditor/ckeditor5-inspector/pull/142/files
import MiniCKEditorInspector from '../../docs/framework/guides/mini-inspector/miniinspector.js';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/* globals console, window, document */

class HorizontalLine extends Plugin {
	init() {
		// this.editor.model.schema.register( 'horizontalLine', {
		// 	allowWhere: '$block',
		// 	isObject: true,
		// 	isBlock: true
		// } );

		// this.editor.conversion.for( 'downcast' ).elementToStructure( {
		// 	model: 'horizontalLine',
		// 	view: ( modelElement, { writer } ) => {
		// 		return writer.createContainerElement(
		// 			'div',
		// 			{ class: 'horizontal-line' },
		// 			[ writer.createEmptyElement( 'hr' ) ]
		// 		);
		// 	}
		// } );

		// this.editor.conversion.for( 'upcast' ).elementToElement( {
		// 	view: {
		// 		name: 'div',
		// 		classes: 'horizontal-line'
		// 	},
		// 	model: ( viewElement, { writer, consumable } ) => {
		// 		if ( viewElement.childCount !== 1 ) {
		// 			return;
		// 		}

		// 		const firstChild = viewElement.getChild( 0 );

		// 		if ( !firstChild.is( 'element', 'hr' ) ) {
		// 			return;
		// 		}

		// 		if ( !consumable.consume( firstChild, { name: true } ) ) {
		// 			return;
		// 		}

		// 		return writer.createElement( 'horizontalLine' );
		// 	}
		// } );

		// this.editor.conversion.for( 'upcast' ).add( dispatcher => {
		// 	dispatcher.on( 'element:div', ( evt, data, conversionApi ) => {
		// 		const viewElement = data.viewItem;
		// 		const foo = { name: true, classes: 'horizontal-line' };

		// 		if ( !conversionApi.consumable.test( viewElement, foo ) ) {
		// 			return;
		// 		}

		// 		if ( viewElement.childCount !== 1 ) {
		// 			return;
		// 		}

		// 		const firstChild = viewElement.getChild( 0 );

		// 		if ( !firstChild.is( 'element', 'hr' ) ) {
		// 			return;
		// 		}

		// 		if ( !conversionApi.consumable.test( firstChild, { name: true } ) ) {
		// 			return;
		// 		}

		// 		const modelElement = conversionApi.writer.createElement( 'horizontalLine' );

		// 		if ( !conversionApi.safeInsert( modelElement, data.modelCursor ) ) {
		// 			return;
		// 		}

		// 		conversionApi.consumable.consume( viewElement, foo );
		// 		conversionApi.consumable.consume( firstChild, { name: true } );
		// 		conversionApi.updateConversionResult( modelElement, data );
		// 	} );
		// } );

		this.editor.model.schema.register( 'box', {
			allowWhere: '$block',
			isObject: true,
			isBlock: true,
			allowContentOf: '$root'
		} );

		// this.editor.model.schema.addChildCheck( ( context, childDefinition ) => {
		// 	if (
		// 		context.endsWith( 'blockQuote' ) &&
		// 		childDefinition.name == 'box'
		// 	) {
		// 		return false;
		// 	}
		// } );

		this.editor.conversion.for( 'downcast' ).elementToStructure( {
			model: 'box',
			view: ( modelElement, { writer, slotFor } ) => {
				return writer.createContainerElement( 'div', { class: 'box' }, [
					writer.createContainerElement(
						'div',
						{ class: 'box-content' },
						[ slotFor( 'children' ) ]
					)
				] );
			}
		} );

		// upcast

		this.editor.conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on( 'element:div', ( evt, data, conversionApi ) => {
				const viewElement = data.viewItem;
				const outer = { name: true, classes: 'box' };
				const inner = { name: true, classes: 'box-content' };

				if ( !conversionApi.consumable.test( viewElement, outer ) ) {
					return;
				}

				if ( viewElement.childCount !== 1 ) {
					return;
				}

				const firstChild = viewElement.getChild( 0 );

				if ( !firstChild.is( 'element', 'div' ) ) {
					return;
				}

				if ( !conversionApi.consumable.test( firstChild, inner ) ) {
					return;
				}

				const modelElement = conversionApi.writer.createElement( 'box' );

				if ( !conversionApi.safeInsert( modelElement, data.modelCursor ) ) {
					return;
				}

				conversionApi.consumable.consume( viewElement, outer );
				conversionApi.consumable.consume( firstChild, inner );
				conversionApi.convertChildren( firstChild, modelElement );
				conversionApi.updateConversionResult( modelElement, data );
			} );
		} );
	}
}

function CustomHeading( editor ) {
	editor.model.schema.register( 'heading', {
		allowAttributes: [ 'level' ],
		inheritAllFrom: '$block'
	} );

	editor.conversion.for( 'upcast' ).elementToElement( {
		view: 'h1',
		model: ( viewElement, { writer } ) => {
			return writer.createElement( 'heading', { level: '1' } );
		}
	} );

	editor.conversion.for( 'downcast' ).elementToElement( {
		model: {
			name: 'heading',
			attributes: [ 'level' ]
		},
		view: ( modelElement, { writer } ) => {
			return writer.createContainerElement(
				'h' + modelElement.getAttribute( 'level' )
			);
		}
	} );

	const dropdown = document.getElementById( 'mini-inspector-heading-interactive-dropdown' );

	dropdown.addEventListener( 'change', event => {
		editor.model.change( writer => {
			writer.setAttribute(
				'level',
				event.target.value,
				editor.model.document.getRoot().getChild( 0 )
			);
		} );
	} );
}

function Example( editor ) {
	editor.model.schema.register( 'example', {
		inheritAllFrom: '$block'
	} );

	editor.conversion.elementToElement( {
		view: {
			name: 'div',
			classes: [ 'example' ]
		},
		model: 'example'
	} );
}

DecoupledEditor.create(
	document.querySelector( '#mini-inspector-heading-interactive' ),
	{
		plugins: [ Essentials, Example ]
	}
)
	.then( editor => {
		MiniCKEditorInspector.attach(
			editor,
			document.querySelector(
				'#mini-inspector-heading-interactive-container'
			)
		);

		// editor.model.change( writer => {
		// 	const modelElement = writer.createElement( 'box' );

		// 	writer.insertElement( 'paragraph', modelElement, 0 );

		// 	writer.insert(
		// 		modelElement,
		// 		editor.model.document.getRoot(),
		// 		0
		// 	);
		// } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
