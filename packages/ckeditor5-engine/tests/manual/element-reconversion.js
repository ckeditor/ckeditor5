/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

const thresholds = new Map();

thresholds.set( 15, 'huge' );
thresholds.set( 10, 'high' );
thresholds.set( 7, 'reasonable' );
thresholds.set( 4, 'few' );
thresholds.set( 2, 'little' );
thresholds.set( 1, 'single' );

const getThreshold = value => {
	for ( const [ thresholdValue, name ] of thresholds ) {
		if ( value >= thresholdValue ) {
			return name;
		}
	}
};

function Items( editor ) {
	editor.model.schema.register( 'items', {
		allowIn: '$root',
		allowAttributes: [ 'mode' ],
		allowChildren: [ 'item' ]
	} );

	editor.model.schema.register( 'item', {
		allowChildren: [ '$text' ]
	} );

	editor.conversion.for( 'downcast' ).elementToElement( {
		model: {
			name: 'items',
			attributes: [ 'mode' ]
		},
		view: ( modelElement, { writer } ) => {
			const mode = modelElement.getAttribute( 'mode' );
			const attributes = { class: 'items ' };

			if ( mode === 'threshold' ) {
				return writer.createContainerElement( 'div', {
					'data-amount': getThreshold( modelElement.childCount ),
					...attributes
				} );
			}

			if ( mode === 'hsl' ) {
				return writer.createContainerElement( 'div', {
					style: `background-color: hsl(${ modelElement.childCount * 5 }, 100%, 50%)`,
					...attributes
				} );
			}

			return writer.createContainerElement( 'div', attributes );
		}
	} );

	editor.conversion.for( 'upcast' ).elementToElement( {
		view: { name: 'div', classes: 'items' },
		model: ( viewElement, { writer } ) => {
			return writer.createElement( 'items', {
				mode: viewElement.getAttribute( 'data-mode' )
			} );
		}
	} );

	editor.conversion.elementToElement( {
		view: { name: 'div', classes: 'item' },
		model: 'item'
	} );
}

function AddRenderCount( editor ) {
	let insertCount = 0;

	const nextInsert = () => insertCount++;

	editor.conversion.for( 'downcast' ).add( dispatcher => dispatcher.on( 'insert', ( event, data, conversionApi ) => {
		const view = conversionApi.mapper.toViewElement( data.item );

		if ( view ) {
			const insertCount = nextInsert();

			conversionApi.writer.setAttribute( 'data-insert-count', `${ insertCount }`, view );
			conversionApi.writer.setAttribute( 'title', `Insertion counter: ${ insertCount }`, view );
		}
	}, { priority: 'lowest' } ) );
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Items, AddRenderCount ],
		toolbar: [
			'heading',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		image: {
			toolbar: [ 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		for ( const option of document.querySelectorAll( 'input[name=mode]' ) ) {
			option.addEventListener( 'change', event => {
				editor.model.change( writer => {
					writer.setAttribute(
						'mode',
						event.target.value,
						editor.model.document.getRoot().getChild( 0 )
					);
				} );
			} );
		}
	} )
	.catch( err => {
		console.error( err.stack );
	} );
