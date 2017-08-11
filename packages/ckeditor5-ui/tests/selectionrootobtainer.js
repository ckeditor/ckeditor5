/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import selectionRootObtainer from '../src/selectionrootobtainer.js';
import ViewContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import ViewEditableElement from '@ckeditor/ckeditor5-engine/src/view/editableelement';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'selectionRootObtainer()', () => {
	let editor, editorElement, doc, root, viewDocument;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, Widget ]
			} )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;
				viewDocument = editor.editing.view;
				root = viewDocument.getRoot();
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'obtains the root of the selection', () => {
		setModelData( doc, '<paragraph>[]bar</paragraph>' );

		const obtainer = selectionRootObtainer( editor );

		expect( obtainer() ).to.equal( viewDocument.domConverter.mapViewToDom( root ) );
	} );

	it( 'does not fail if selection has no #editableElement', () => {
		const obtainer = selectionRootObtainer( editor );

		sinon.stub( viewDocument.selection, 'editableElement' ).value( null );
		expect( obtainer() ).to.equal( null );
	} );

	it( 'obtains the farthest root of the selection (nested editable)', () => {
		doc.schema.registerItem( 'widget' );
		doc.schema.registerItem( 'nestededitable' );

		doc.schema.objects.add( 'widget' );

		doc.schema.allow( { name: 'widget', inside: '$root' } );
		doc.schema.allow( { name: 'nestededitable', inside: 'widget' } );
		doc.schema.allow( { name: '$inline', inside: 'nestededitable' } );

		buildModelConverter().for( editor.data.modelToView, editor.editing.modelToView )
			.fromElement( 'widget' )
			.toElement( () => new ViewContainerElement( 'figure', { contenteditable: 'false' } ) );

		buildModelConverter().for( editor.data.modelToView, editor.editing.modelToView )
			.fromElement( 'nestededitable' )
			.toElement( () => new ViewEditableElement( 'figcaption', { contenteditable: 'true' } ) );

		setModelData( doc, '<widget><nestededitable>[]foo</nestededitable></widget>' );

		const obtainer = selectionRootObtainer( editor );

		expect( obtainer() ).to.equal( viewDocument.domConverter.mapViewToDom( root ) );
	} );
} );
