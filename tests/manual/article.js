/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { LivePosition } from '@ckeditor/ckeditor5-engine';
import { toWidget } from '@ckeditor/ckeditor5-widget';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, SourceEditing, Section ],
		toolbar: [
			'sourceEditing',
			'heading',
			'|',
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
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
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
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function Section( editor ) {
	editor.model.schema.register( 'section', {
		inheritAllFrom: '$blockObject',
		allowAttributes: 'sectionId'
	} );

	editor.conversion.for( 'upcast' ).elementToElement( {
		view: 'section',
		model: 'section'
	} );

	editor.conversion.for( 'dataDowncast' ).elementToElement( {
		model: 'section',
		view: 'section'
	} );

	editor.conversion.for( 'editingDowncast' ).elementToElement( {
		model: 'section',
		view: ( modelElement, { writer } ) => {
			return toWidget( writer.createContainerElement( 'section', { id: modelElement.getAttribute( 'sectionId' ) } ), writer );
		}
	} );

	editor.conversion.attributeToAttribute( {
		view: {
			name: 'section',
			key: 'id'
		},
		model: 'sectionId'
	} );

	const removedSections = [];

	// Collect all removed section elements and their positions.
	editor.model.on( 'applyOperation', ( evt, [ operation ] ) => {
		if ( !operation.isDocumentOperation || operation.type !== 'remove' || !operation.batch.isLocal ) {
			return;
		}

		const range = editor.model.createRange(
			operation.sourcePosition,
			operation.sourcePosition.getShiftedBy( operation.howMany )
		);

		for ( const item of range.getItems() ) {
			if ( item.is( 'element', 'section' ) ) {
				removedSections.push( {
					sectionId: item.getAttribute( 'sectionId' ),
					livePosition: LivePosition.fromPosition( operation.sourcePosition, 'toPrevious' ),
					originalPosition: editor.model.createPositionBefore( item )
				} );
			}

			// In case of nested remove operation, adjust the already collected sections.
			for ( const section of removedSections ) {
				if ( range.containsPosition( section.livePosition.toPosition() ) ) {
					section.livePosition.detach();
					section.livePosition = LivePosition.fromPosition( range.start, 'toPrevious' );
				}
			}
		}
	}, { priority: 'high' } );

	// Reinsert removed sections after the document has been modified.
	editor.model.document.registerPostFixer( writer => {
		if ( !removedSections.length ) {
			return false;
		}

		let wasFixed = false;
		const reinsertedSections = [];

		// Collect all reinserted section elements so we can later skip reinserting them.
		for ( const change of editor.model.document.differ.getChanges() ) {
			if ( change.type !== 'insert' || change.name === '$text' ) {
				continue;
			}

			for ( const item of writer.createRangeOn( change.position.nodeAfter ).getItems() ) {
				if ( item.is( 'element', 'section' ) ) {
					reinsertedSections.push( item.getAttribute( 'sectionId' ) );
				}
			}
		}

		// Sort removed sections by their original position in the document to preserve the order.
		removedSections.sort( ( a, b ) => a.originalPosition.isAfter( b.originalPosition ) ? -1 : 1 );

		const root = editor.model.document.getRoot();

		if ( removedSections.length && !editor.model.hasContent( root ) && !root.isEmpty ) {
			writer.remove( writer.createRangeIn( root ) );
		}

		// Reinsert removed sections.
		for ( const section of removedSections ) {
			// Only when already not reinserted (for example drag-drop or undo).
			if ( reinsertedSections.find( sectionId => sectionId === section.sectionId ) ) {
				continue;
			}

			// Create new section with the same ID to reinsert.
			const newElement = writer.createElement( 'section', { sectionId: section.sectionId } );

			editor.model.insertContent( newElement, section.livePosition.toPosition() );
			section.livePosition.detach();

			wasFixed = true;
		}

		removedSections.length = 0;

		return wasFixed;
	} );

	// Make sure that removed section element is not replaced with an empty paragraph.
	editor.model.on( 'deleteContent', ( evt, args ) => {
		const selection = args[ 0 ];
		const options = args[ 1 ] || {};

		// options.doNotResetEntireContent = true;

		const selectedElement = selection.getSelectedElement();

		if ( selectedElement && selectedElement.is( 'element', 'section' ) ) {
			options.doNotAutoparagraph = true;

			if ( args[ 1 ] !== options ) {
				args[ 1 ] = options;
			}
		}
	}, { priority: 'high' } );
}
