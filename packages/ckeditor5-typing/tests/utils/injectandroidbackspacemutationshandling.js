/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Input from '../../src/input';
import Delete from '../../src/delete';

import ViewText from '@ckeditor/ckeditor5-engine/src/view/text';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';

import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

/* global document */

describe( 'injectAndroidBackspaceMutationsHandling', () => {
	let editor, model, modelRoot, view, viewDocument, viewRoot, mutationsSpy, dateNowStub;

	testUtils.createSinonSandbox();

	before( () => {
		mutationsSpy = sinon.spy();
	} );

	beforeEach( () => {
		const domElement = document.createElement( 'div' );
		document.body.appendChild( domElement );

		return ClassicTestEditor.create( domElement, { plugins: [ Input, Delete, Paragraph, Heading, Italic, Undo ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				modelRoot = model.document.getRoot();
				view = editor.editing.view;
				viewDocument = view.document;
				viewRoot = viewDocument.getRoot();

				editor.setData( '<h2>Heading 1</h2><p>Paragraph</p><h3>Heading 2</h3>' );
			} );
	} );

	afterEach( () => {
		if ( dateNowStub ) {
			dateNowStub.restore();
			dateNowStub = null;
		}

		mutationsSpy.resetHistory();

		return editor.destroy();
	} );

	it( 'should handle block merging', () => {
		// 1. Set selection to '<h2>Heading 1</h2><p>{}Paragraph</p><h3>Heading 2</h3>'.
		model.change( writer => {
			writer.setSelection( modelRoot.getChild( 1 ), 0 );
		} );

		const modelContent = '<heading1>Heading 1</heading1><paragraph>[]Paragraph</paragraph><heading2>Heading 2</heading2>';
		const viewContent = '<h2>Heading 1</h2><p>{}Paragraph</p><h3>Heading 2</h3>';

		expect( getModelData( model ) ).to.equal( modelContent );
		expect( getViewData( view ) ).to.equal( viewContent );

		// 2. Create mutations which are result of changing HTML to '<h2>Heading 1{}Paragraph</h2><h3>Heading 2</h3>'.
		const mutations = [ {
			// `heading1` new text mutation
			type: 'children',
			newChildren: [ viewRoot.getChild( 0 ).getChild( 0 ) ],
			oldChildren: [ viewRoot.getChild( 0 ).getChild( 0 ) ],
			node: viewRoot.getChild( 0 )
		}, {
			// `paragraph` text removal mutation
			type: 'children',
			newChildren: [],
			oldChildren: [ viewRoot.getChild( 1 ).getChild( 0 ) ],
			node: viewRoot.getChild( 1 )
		}, {
			// `paragraph` removal mutation
			type: 'children',
			newChildren: [ viewRoot.getChild( 0 ) ],
			oldChildren: [ viewRoot.getChild( 0 ), viewRoot.getChild( 1 ) ],
			node: viewRoot
		} ];

		// 3. Simulate 'Backspace' flow on Android.
		simulateBackspace( mutations );

		expect( mutationsSpy.callCount ).to.equal( 0 );
		expect( getModelData( model ) ).to.equal( '<heading1>Heading 1[]Paragraph</heading1><heading2>Heading 2</heading2>' );
		expect( getViewData( view ) ).to.equal( '<h2>Heading 1{}Paragraph</h2><h3>Heading 2</h3>' );

		// Due ot `Undo` issue the selection is after paragraph after undoing changes (ckeditor5-undo/issues/64).
		expectContentAfterUndo(
			'<heading1>Heading 1[]</heading1><paragraph>Paragraph</paragraph><heading2>Heading 2</heading2>',
			'<h2>Heading 1{}</h2><p>Paragraph</p><h3>Heading 2</h3>' );
	} );

	it( 'should handle two entire blocks removal', () => {
		// 1. Set selection to '<h2>{Heading 1</h2><p>Paragraph}</p><h3>Heading 2</h3>'.
		model.change( writer => {
			writer.setSelection( writer.createRange(
				writer.createPositionAt( modelRoot.getChild( 0 ), 0 ), writer.createPositionAt( modelRoot.getChild( 1 ), 9 )
			) );
		} );

		const modelContent = '<heading1>[Heading 1</heading1><paragraph>Paragraph]</paragraph><heading2>Heading 2</heading2>';
		const viewContent = '<h2>{Heading 1</h2><p>Paragraph}</p><h3>Heading 2</h3>';

		expect( getModelData( model ) ).to.equal( modelContent );
		expect( getViewData( view ) ).to.equal( viewContent );

		// 2. Create mutations which are result of changing HTML to '<h2>[]</h2><h3>Heading 2</h3>'.
		const mutations = [ {
			// `heading1` text removal mutation
			type: 'children',
			newChildren: [ new ViewElement( 'br' ) ],
			oldChildren: [ viewRoot.getChild( 0 ).getChild( 0 ) ],
			node: viewRoot.getChild( 0 )
		}, {
			// `paragraph` removal mutation
			type: 'children',
			newChildren: [ viewRoot.getChild( 0 ), viewRoot.getChild( 2 ) ],
			oldChildren: [ viewRoot.getChild( 0 ), viewRoot.getChild( 1 ), viewRoot.getChild( 2 ) ],
			node: viewRoot
		} ];

		// 3. Create selection which simulate Android behaviour where upon pressing `Backspace`
		// selection is changed to `<h2>Heading 1</h2><p>Paragraph{}</p><h3>Heading 2</h3>`.
		const newSelection = model.createRange( model.createPositionAt( modelRoot.getChild( 1 ), 9 ) );

		// 4. Simulate 'Backspace' flow on Android.
		simulateBackspace( mutations, newSelection );

		expect( mutationsSpy.callCount ).to.equal( 0 );
		expect( getModelData( model ) ).to.equal( '<heading1>[]</heading1><heading2>Heading 2</heading2>' );
		expect( getViewData( view ) ).to.equal( '<h2>[]</h2><h3>Heading 2</h3>' );

		expectContentAfterUndo(
			'<heading1>[Heading 1</heading1><paragraph>Paragraph]</paragraph><heading2>Heading 2</heading2>',
			'<h2>{Heading 1</h2><p>Paragraph}</p><h3>Heading 2</h3>' );
	} );

	it( 'should handle two partially selected blocks removal', () => {
		// 1. Set selection to '<h2>Hea{ding 1</h2><p>Paragraph}</p><h3>Heading 2</h3>'.
		model.change( writer => {
			writer.setSelection( writer.createRange(
				writer.createPositionAt( modelRoot.getChild( 0 ), 3 ), writer.createPositionAt( modelRoot.getChild( 1 ), 9 )
			) );
		} );

		const modelContent = '<heading1>Hea[ding 1</heading1><paragraph>Paragraph]</paragraph><heading2>Heading 2</heading2>';
		const viewContent = '<h2>Hea{ding 1</h2><p>Paragraph}</p><h3>Heading 2</h3>';

		expect( getModelData( model ) ).to.equal( modelContent );
		expect( getViewData( view ) ).to.equal( viewContent );

		// 2. Create mutations which are result of changing HTML to '<h2>Hea{}</h2><h3>Heading 2</h3>'.
		const mutations = [ {
			// `heading1` text partial removal mutation
			type: 'text',
			newText: 'Hea',
			oldText: 'Heading 1',
			node: viewRoot.getChild( 0 ).getChild( 0 )
		}, {
			// `paragraph` removal mutation
			type: 'children',
			newChildren: [ viewRoot.getChild( 0 ), viewRoot.getChild( 2 ) ],
			oldChildren: [ viewRoot.getChild( 0 ), viewRoot.getChild( 1 ), viewRoot.getChild( 2 ) ],
			node: viewRoot
		} ];

		// 3. Create selection which simulate Android behaviour where upon pressing `Backspace`
		// selection is changed to `<h2>Heading 1</h2><p>Paragraph{}</p><h3>Heading 2</h3>`.
		const newSelection = model.createRange( model.createPositionAt( modelRoot.getChild( 1 ), 9 ) );

		// 4. Simulate 'Backspace' flow on Android.
		simulateBackspace( mutations, newSelection );

		expect( mutationsSpy.callCount ).to.equal( 0 );
		expect( getModelData( model ) ).to.equal( '<heading1>Hea[]</heading1><heading2>Heading 2</heading2>' );
		expect( getViewData( view ) ).to.equal( '<h2>Hea{}</h2><h3>Heading 2</h3>' );

		expectContentAfterUndo( modelContent, viewContent );
	} );

	it( 'should handle blocks removal if selection ends on the boundary of inline element', () => {
		editor.setData( '<h2>Heading 1</h2><p>Paragraph</p><h3><em>Heading</em> 2</h3>' );

		// 1. Set selection to '<h2>{Heading 1</h2><p>Paragraph</p><h3>]<i>Heading</i> 2</h3>'.
		model.change( writer => {
			writer.setSelection( writer.createRange(
				writer.createPositionAt( modelRoot.getChild( 0 ), 0 ), writer.createPositionAt( modelRoot.getChild( 2 ), 0 )
			) );
		} );

		const modelContent = '<heading1>[Heading 1</heading1><paragraph>Paragraph</paragraph>' +
			'<heading2>]<$text italic="true">Heading</$text> 2</heading2>';
		const viewContent = '<h2>{Heading 1</h2><p>Paragraph</p><h3>]<i>Heading</i> 2</h3>';

		expect( getModelData( model ) ).to.equal( modelContent );
		expect( getViewData( view ) ).to.equal( viewContent );

		// 2. Create mutations which are result of changing HTML to '<h2><i>{}Heading</i> 2</h2>'.
		const mutations = [ {
			// `heading1` text to children mutation
			type: 'children',
			newChildren: Array.from( viewRoot.getChild( 2 ).getChildren() ),
			oldChildren: [ viewRoot.getChild( 0 ).getChild( 0 ) ],
			node: viewRoot.getChild( 0 )
		}, {
			// `heading2` children removal mutation
			type: 'children',
			newChildren: [],
			oldChildren: Array.from( viewRoot.getChild( 2 ).getChildren() ),
			node: viewRoot.getChild( 2 )
		}, { // `paragraph` and `heading2` removal mutation
			type: 'children',
			newChildren: [ viewRoot.getChild( 0 ) ],
			oldChildren: Array.from( viewRoot.getChildren() ),
			node: viewRoot
		} ];

		// 3. Create selection which simulate Android behaviour where upon pressing `Backspace`
		// selection is changed to `<h2>Heading 1</h2><p>Paragraph</p><h3><em>{}Heading</em> 2</h3>`.
		const newSelection = model.createRange( model.createPositionAt( modelRoot.getChild( 2 ), 0 ) );

		// 4. Simulate 'Backspace' flow on Android.
		simulateBackspace( mutations, newSelection );

		expect( mutationsSpy.callCount ).to.equal( 0 );
		expect( getModelData( model ) ).to.equal( '<heading1><$text italic="true">[]Heading</$text> 2</heading1>' );
		expect( getViewData( view ) ).to.equal( '<h2><i>{}Heading</i> 2</h2>' );

		// https://github.com/ckeditor/ckeditor5-undo/issues/89
		expectContentAfterUndo(
			'<heading1>[Heading 1</heading1><paragraph>Paragraph]</paragraph><heading2><$text italic="true">Heading</$text> 2</heading2>',
			'<h2>{Heading 1</h2><p>Paragraph}</p><h3><i>Heading</i> 2</h3>'
		);
	} );

	it( 'should handle selection changed by the user before `backspace` on block merging', () => {
		// 1. Stub `Date.now` so we can simulate user selection change timing.
		let dateNowValue = 0;
		dateNowStub = sinon.stub( Date, 'now' ).callsFake( () => {
			dateNowValue += 500;
			return dateNowValue;
		} );

		editor.setData( '<h2>Heading 1</h2><p>Paragraph</p><h3><em>Heading</em> 2</h3>' );

		// 2. Set selection to '<h2>{Heading 1</h2><p>Paragraph</p><h3>]<i>Heading</i> 2</h3>'.
		model.change( writer => {
			writer.setSelection( writer.createRange(
				writer.createPositionAt( modelRoot.getChild( 0 ), 0 ), writer.createPositionAt( modelRoot.getChild( 2 ), 0 )
			) );
		} );

		const modelContent = '<heading1>[Heading 1</heading1><paragraph>Paragraph</paragraph>' +
			'<heading2>]<$text italic="true">Heading</$text> 2</heading2>';
		const viewContent = '<h2>{Heading 1</h2><p>Paragraph</p><h3>]<i>Heading</i> 2</h3>';

		expect( getModelData( model ) ).to.equal( modelContent );
		expect( getViewData( view ) ).to.equal( viewContent );

		// 3. Create mutations which are result of changing HTML to '<h2>Heading 1</h2><p>Paragraph{}<i>Heading</i> 2</p>'.
		// This is still a block container removal so 'injectAndroidBackspaceMutationsHandling' will get triggered.
		const mutations = [ {
			// `paragraph` children added mutation
			type: 'children',
			newChildren: [ viewRoot.getChild( 1 ).getChild( 0 ) ].concat( Array.from( viewRoot.getChild( 2 ).getChildren() ) ),
			oldChildren: Array.from( viewRoot.getChild( 1 ).getChildren() ),
			node: viewRoot.getChild( 1 )
		}, {
			// `heading2` children removal mutation
			type: 'children',
			newChildren: [],
			oldChildren: Array.from( viewRoot.getChild( 2 ).getChildren() ),
			node: viewRoot.getChild( 2 )
		}, { // `heading2` removal mutation
			type: 'children',
			newChildren: [ viewRoot.getChild( 0 ), viewRoot.getChild( 1 ) ],
			oldChildren: Array.from( viewRoot.getChildren() ),
			node: viewRoot
		} ];

		// 4. Simulate user selection change which is identical as Android native change on 'Backspace'.
		model.change( writer => {
			writer.setSelection( modelRoot.getChild( 2 ), 0 );
		} );

		// 5. Simulate 'Backspace' flow on Android.
		simulateBackspace( mutations );

		expect( mutationsSpy.callCount ).to.equal( 0 );
		expect( getModelData( model ) ).to.equal( '<heading1>Heading 1</heading1><paragraph>Paragraph[]' +
			'<$text italic="true">Heading</$text> 2</paragraph>' );
		expect( getViewData( view ) ).to.equal( '<h2>Heading 1</h2><p>Paragraph{}<i>Heading</i> 2</p>' );

		// Due ot `Undo` issue the selection is after paragraph after undoing changes (ckeditor5-undo/issues/64).
		expectContentAfterUndo( '<heading1>Heading 1</heading1><paragraph>Paragraph[]</paragraph>' +
			'<heading2><$text italic="true">Heading</$text> 2</heading2>',
		'<h2>Heading 1</h2><p>Paragraph{}</p><h3><i>Heading</i> 2</h3>' );
	} );

	it( 'should not be triggered for container insertion mutations', () => {
		// 1. Set selection to '<h2>Heading 1</h2><p>Paragraph{}</p><h3>Heading 2</h3>'.
		model.change( writer => {
			writer.setSelection( modelRoot.getChild( 1 ), 9 );
		} );

		const modelContent = '<heading1>Heading 1</heading1><paragraph>Paragraph[]</paragraph><heading2>Heading 2</heading2>';
		const viewContent = '<h2>Heading 1</h2><p>Paragraph{}</p><h3>Heading 2</h3>';

		expect( getModelData( model ) ).to.equal( modelContent );
		expect( getViewData( view ) ).to.equal( viewContent );

		const viewFoo = new ViewText( 'foo' );
		const viewP = new ViewElement( 'p', null, viewFoo );

		// 2. Create mutations which are result of changing HTML to '<h2>Heading 1</h2><p>Paragraph{}</p><p>Foo</p><h3>Heading 2</h3>'.
		const mutations = [ {
			// new paragraph insertion mutation
			type: 'children',
			newChildren: [ viewRoot.getChild( 0 ), viewRoot.getChild( 1 ), viewP, viewRoot.getChild( 2 ) ],
			oldChildren: Array.from( viewRoot.getChildren() ),
			node: viewRoot.getChild( 0 )
		} ];

		// 3. Spy mutations listener calls. It should be called ones
		// as it was not stopped by 'injectAndroidBackspaceMutationsHandling' handler.
		viewDocument.on( 'mutations', mutationsSpy, { priority: 'lowest' } );

		// 4. Fire mutations event.
		viewDocument.fire( 'mutations', mutations );

		expect( mutationsSpy.callCount ).to.equal( 1 );
		expect( getModelData( model ) ).to.equal( modelContent );
		expect( getViewData( view ) ).to.equal( viewContent );
	} );

	function simulateBackspace( mutations, newSelection ) {
		// Spy mutations listener calls. If Android handler was triggered it should prevent further calls.
		viewDocument.on( 'mutations', mutationsSpy, { priority: 'lowest' } );

		// Simulate selection change on Android devices before `keydown` event.
		if ( newSelection ) {
			model.change( writer => {
				writer.setSelection( newSelection );
			} );
		}

		// Fire `keydown` event with `229` key code so it is consistent with what happens on Android devices.
		viewDocument.fire( 'keydown', { keyCode: 229 } );

		// Fire mutations event.
		viewDocument.fire( 'mutations', mutations );
	}

	function expectContentAfterUndo( modelContent, viewContent ) {
		editor.execute( 'undo' );

		expect( getModelData( model ) ).to.equal( modelContent );
		expect( getViewData( view ) ).to.equal( viewContent );
	}
} );
