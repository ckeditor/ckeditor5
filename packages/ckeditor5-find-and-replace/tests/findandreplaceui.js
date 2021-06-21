import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import FindAndReplaceUI from '../src/findandreplaceui';
import FindAndReplace from '../src/findandreplace';
import DropdownView from '@ckeditor/ckeditor5-ui/src/dropdown/dropdownview';

describe( 'FindAndReplaceUI', () => {
	let editorElement;
	let editor;
	let dropdown;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ FindAndReplace ]
			} )
			.then( newEditor => {
				editor = newEditor;
				dropdown = editor.ui.componentFactory.create( 'findAndReplace' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be named', () => {
		expect( FindAndReplaceUI.pluginName ).to.equal( 'FindAndReplaceUI' );
	} );

	it( 'should add the "findAndReplace" component to the factory', () => {
		expect( dropdown ).to.be.instanceOf( DropdownView );
	} );

	it( 'should allow creating two instances', () => {
		let secondInstance;

		expect( function createSecondInstance() {
			secondInstance = editor.ui.componentFactory.create( 'findAndReplace' );
		} ).not.to.throw();
		expect( dropdown ).to.not.equal( secondInstance );
	} );

	it( 'should delegate dropdown:closed event', () => {
		const plugin = editor.plugins.get( 'FindAndReplaceUI' );
		const spy = sinon.spy();

		plugin.on( 'dropdown:closed', spy );

		dropdown.fire( 'change:isOpen', 'isClosed', false );

		expect( spy.calledOnce ).to.be.true;
	} );

	it( 'should not delegate dropdown:closed event when the UI is opened', () => {
		const plugin = editor.plugins.get( 'FindAndReplaceUI' );
		const spy = sinon.spy();

		plugin.on( 'dropdown:closed', spy );

		dropdown.fire( 'change:isOpen', 'isClosed', true );

		expect( spy.calledOnce ).to.be.false;
	} );
} );
