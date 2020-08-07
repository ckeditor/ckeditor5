/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, setInterval */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';

import { setData, getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { insertElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcasthelpers';

class Container extends Plugin {
	init() {
		const editor = this.editor;

		editor.model.schema.register( 'container', {
			allowIn: '$root',
			isObject: true
		} );

		editor.model.schema.extend( '$block', {
			allowIn: 'container'
		} );

		// # Step 1.
		//
		// Our starting point – simple converter which creates a phantom <div.slot> which is not bound to
		// anything in the model. What we need to do now is to teach the mapper that the inside of
		// <container> is mapped with the inside of <div.slot>. And that's where the fun starts...
		// editor.conversion.for( 'editingDowncast' ).add(
		// 	downcastElementToElement( {
		// 		model: 'container',
		// 		view: ( modelElement, { writer } ) => {
		// 			const viewContainer = writer.createContainerElement( 'div', { class: 'container' } );
		// 			const viewSlot = writer.createContainerElement( 'div', { class: 'slot' } );

		// 			writer.insert( ViewPosition.createAt( viewContainer, 0 ), viewSlot );

		// 			return viewContainer;
		// 		}
		// 	} )
		// );

		// # Step 2.
		//
		// Let's try to bind <container> with <div.slot> directly. This will leave one part of the old mapping
		// (div.container -> container). So, in total, we'll have this:
		//
		// * container -> div.slot (new)
		// * div.slot -> container (new)
		// * div.container -> container (old)
		// editor.conversion.for( 'editingDowncast' ).add(
		// 	dispatcher => {
		// 		const insertViewElement = insertElement( ( modelElement, { writer } ) => {
		// 			const viewContainer = writer.createContainerElement( 'div', { class: 'container' } );
		// 			const viewSlot = writer.createContainerElement( 'div', { class: 'slot' } );

		// 			writer.insert( ViewPosition.createAt( viewContainer, 0 ), viewSlot );

		// 			return viewContainer;
		// 		} );

		// 		dispatcher.on( 'insert:container', ( evt, data, conversionApi ) => {
		// 			insertViewElement( evt, data, conversionApi );

		// 			// Use the existing "old" mapping created by `insertViewElement()`.
		// 			const viewContainer = conversionApi.mapper.toViewElement( data.item );
		// 			const viewSlot = viewContainer.getChild( 0 );

		// 			conversionApi.mapper.bindElements( data.item, viewSlot );
		// 		} );
		// 	}
		// );

		// # Step 3.
		//
		// Actually, an alternative solution could be to try controlling only positions, without
		// controlling element binding. To that, you can listen to Mapper#modelToViewPosition and
		// Mapper#viewToModelPosition events and override the default behaviour. This approach
		// may also be used as a complementary solution to the one used in "Step 2." –
		// it will allow fixing some remaining position mapping issues if some are found.
		// For now, I haven't found anything that would break.

		// # Step 4.
		//
		// Make it a widget.
		//
		// At this point it doesn't work very well. `toWidget()` alone does work, but `toWidgetEditable()` does not.
		// Clicking in a nested editable (in the slot) does not put the selection there. Probably because it's
		// mapped to a selection in a <container> element which is then non-editable in the view, so
		// some mechanism makes it a widget selection. May be related to https://github.com/ckeditor/ckeditor5/issues/1331.
		editor.conversion.for( 'editingDowncast' ).add(
			dispatcher => {
				const insertViewElement = insertElement( ( modelElement, { writer } ) => {
					const viewContainer = toWidget( writer.createContainerElement( 'div', { class: 'container' } ), writer );
					const viewSlot = toWidgetEditable( writer.createContainerElement( 'div', { class: 'slot' } ), writer );

					writer.insert( writer.createPositionAt( viewContainer, 0 ), viewSlot );

					return viewContainer;
				} );

				dispatcher.on( 'insert:container', ( evt, data, conversionApi ) => {
					insertViewElement( evt, data, conversionApi );

					// Use the existing "old" mapping created by `insertViewElement()`.
					const viewContainer = conversionApi.mapper.toViewElement( data.item );
					const viewSlot = viewContainer.getChild( 0 );

					conversionApi.mapper.bindElements( data.item, viewSlot );
				} );
			}
		);
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Container ],
		toolbar: [
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
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
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

		setData(
			editor.model,
			'<paragraph>A</paragraph>' +
			'<container><paragraph>1</paragraph><paragraph>2</paragraph><paragraph>3</paragraph></container>' +
			'<paragraph>B</paragraph>'
		);

		setInterval( () => {
			console.log( getData( editor.model ) );
		}, 3000 );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
