import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import CodeBlock from '../src/codeblock';
import CodeblockToolbar from '../src/codeblocktoolbar';
import CodeblockCaption from '../src/codeblockcaption';

describe( 'CodeblockToolbar', () => {
    let editor, model, doc, toolbar, balloon, widgetToolbarRepository, editorElement;
    
    testUtils.createSinonSandbox();

    beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, {
				plugins: [ Paragraph, CodeBlock, CodeblockToolbar, CodeblockCaption, ],
				codeblock: {
					toolbar: [ 'toggleCodeblockCaption' ]
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = newEditor.model;
				doc = model.document;
				widgetToolbarRepository = editor.plugins.get( 'WidgetToolbarRepository' );
				toolbar = widgetToolbarRepository._toolbarDefinitions.get( 'codeblock' ).view;
				balloon = editor.plugins.get( 'ContextualBalloon' );
			} );
	} );

    afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

    it( 'should be loaded', () => {
		expect( editor.plugins.get( CodeblockToolbar ) ).to.be.instanceOf( CodeblockToolbar );
	} );

    it( 'should not initialize if there is no configuration', () => {
		const consoleWarnStub = sinon.stub( console, 'warn' );
		const editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor.create( editorElement, {
			plugins: [ CodeblockToolbar ]
		} )
			.then( editor => {
				expect( editor.plugins.get( CodeblockToolbar )._toolbar ).to.be.undefined;
				expect( consoleWarnStub.calledOnce ).to.equal( true );
				expect( consoleWarnStub.firstCall.args[ 0 ] ).to.match( /widget-toolbar-no-items/ );

				editorElement.remove();
				return editor.destroy();
			} );
	} );

    describe( 'integration with the editor focus', () => {
		it( 'should show the toolbar when the editor gains focus and the code is selected', () => {
			editor.ui.focusTracker.isFocused = true;

			setData( model, '[<codeBlock></codeBlock>]' );

			editor.ui.focusTracker.isFocused = false;
			expect( balloon.visibleView ).to.be.null;

			editor.ui.focusTracker.isFocused = true;
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should hide the toolbar when the editor loses focus and the code is selected', () => {
			editor.ui.focusTracker.isFocused = false;

			setData( model, '[<codeBlock></codeBlock>]' );

			editor.ui.focusTracker.isFocused = true;
			expect( balloon.visibleView ).to.equal( toolbar );

			editor.ui.focusTracker.isFocused = false;
			expect( balloon.visibleView ).to.be.null;
		} );

		it( 'should show the toolbar when the editor gains focus and the selection is in a caption', () => {
			editor.ui.focusTracker.isFocused = true;

			setData( model, '<codeBlock><caption>[foo]</caption></codeBlock>' );

			editor.ui.focusTracker.isFocused = false;
			expect( balloon.visibleView ).to.be.null;

			editor.ui.focusTracker.isFocused = true;
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should hide the toolbar when the editor loses focus and the selection is in a caption', () => {
			editor.ui.focusTracker.isFocused = false;

			setData( model, '<codeBlock><caption>[]foo</caption></codeBlock>' );

			editor.ui.focusTracker.isFocused = true;
			expect( balloon.visibleView ).to.equal( toolbar );

			editor.ui.focusTracker.isFocused = false;
			expect( balloon.visibleView ).to.be.null;
		} );
	} );

    describe( 'integration with the editor selection', () => {
		beforeEach( () => {
			editor.ui.focusTracker.isFocused = true;
		} );

		it( 'should show the toolbar on ui#update when the code is selected', () => {
			setData( model, '<paragraph>[foo]</paragraph><codeBlock></codeBlock>' );

			expect( balloon.visibleView ).to.be.null;

			editor.ui.fire( 'update' );

			expect( balloon.visibleView ).to.be.null;

			model.change( writer => {
				// Select the [<codeBlock></codeBlock>]
				writer.setSelection(
					writer.createRangeOn( doc.getRoot().getChild( 1 ) )
				);
			} );

			expect( balloon.visibleView ).to.equal( toolbar );

			// Make sure successive change does not throw, e.g. attempting
			// to insert the toolbar twice.
			editor.ui.fire( 'update' );
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should show the toolbar on ui#update when the selection is in a caption', () => {
			setData( model, '<paragraph>[foo]</paragraph><codeBlock><caption>bar</caption></codeBlock>' );

			expect( balloon.visibleView ).to.be.null;

			editor.ui.fire( 'update' );

			expect( balloon.visibleView ).to.be.null;

			model.change( writer => {
				// Select the <codeBlock><caption>[bar]</caption></codeBlock>
				writer.setSelection(
					writer.createRangeIn( doc.getRoot().getChild( 1 ).getChild( 0 ) )
				);
			} );

			expect( balloon.visibleView ).to.equal( toolbar );

			// Make sure successive change does not throw, e.g. attempting
			// to insert the toolbar twice.
			editor.ui.fire( 'update' );
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should not engage when the toolbar is in the balloon yet invisible', () => {
			setData( model, '[<codeBlock></codeBlock>]' );

			expect( balloon.visibleView ).to.equal( toolbar );

			const lastView = new View();
			lastView.element = document.createElement( 'div' );

			balloon.add( {
				view: lastView,
				position: {
					target: document.body
				}
			} );

			expect( balloon.visibleView ).to.equal( lastView );

			editor.ui.fire( 'update' );

			expect( balloon.visibleView ).to.equal( lastView );
		} );

		it( 'should hide the toolbar on ui#update if the code is de–selected', () => {
			setData( model, '<paragraph>foo</paragraph>[<codeBlock></codeBlock>]' );

			expect( balloon.visibleView ).to.equal( toolbar );

			model.change( writer => {
				// Select the <paragraph>[...]</paragraph>
				writer.setSelection(
					writer.createRangeIn( doc.getRoot().getChild( 0 ) )
				);
			} );

			expect( balloon.visibleView ).to.be.null;

			// Make sure successive change does not throw, e.g. attempting
			// to remove the toolbar twice.
			editor.ui.fire( 'update' );
			expect( balloon.visibleView ).to.be.null;
		} );

		it( 'should hide the toolbar on ui#update if the selection is being moved outside of a caption', () => {
			setData( model, '<paragraph>foo</paragraph><codeBlock><caption>[]</caption></codeBlock>' );

			expect( balloon.visibleView ).to.equal( toolbar );

			model.change( writer => {
				// Select the <paragraph>[...]</paragraph>
				writer.setSelection(
					writer.createRangeIn( doc.getRoot().getChild( 0 ) )
				);
			} );

			expect( balloon.visibleView ).to.be.null;

			// Make sure successive change does not throw, e.g. attempting
			// to remove the toolbar twice.
			editor.ui.fire( 'update' );
			expect( balloon.visibleView ).to.be.null;
		} );

		it( 'should not hide the toolbar on ui#update if the selection is being moved from an code to a caption', () => {
			setData( model, '[<codeBlock><caption>bar</caption></codeBlock>]' );

			expect( balloon.visibleView ).to.equal( toolbar );

			model.change( writer => {
				// Select the <codeBlock><caption>[bar]</caption></codeBlock>
				writer.setSelection(
					writer.createRangeIn( doc.getRoot().getChild( 0 ).getChild( 0 ) )
				);
			} );

			expect( balloon.visibleView ).to.equal( toolbar );

			// Make sure successive change does not throw, e.g. attempting
			// to insert the toolbar twice.
			editor.ui.fire( 'update' );
			expect( balloon.visibleView ).to.equal( toolbar );
		} );

		it( 'should not hide the toolbar on ui#update if the selection is being moved from a caption to an code', () => {
			setData( model, '<codeBlock><caption>[b]ar</caption></codeBlock>' );

			expect( balloon.visibleView ).to.equal( toolbar );

			model.change( writer => {
				// Select the <codeBlock><caption>[bar]</caption></codeBlock>
				writer.setSelection(
					writer.createRangeIn( doc.getRoot().getChild( 0 ) )
				);
			} );

			expect( balloon.visibleView ).to.equal( toolbar );

			// Make sure successive change does not throw, e.g. attempting
			// to insert the toolbar twice.
			editor.ui.fire( 'update' );
			expect( balloon.visibleView ).to.equal( toolbar );
		} );
	} );

} );