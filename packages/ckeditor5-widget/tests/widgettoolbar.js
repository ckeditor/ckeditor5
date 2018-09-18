/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';
import View from '@ckeditor/ckeditor5-ui/src/view';
import { setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import env from '@ckeditor/ckeditor5-utils/src/env';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import WidgetToolbar from '../src/widgettoolbar';
import Widget from '../src/widget';
import { isWidget, toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';

describe( 'WidgetToolbar', () => {
	let editor, model, doc, toolbar, balloon, widgetToolbar, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, {
				plugins: [ Paragraph, Image, FakeButton, WidgetToolbar, FakeWidget ],
				fake: {
					toolbar: [ 'fake_button' ]
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = newEditor.model;
				doc = model.document;
				widgetToolbar = editor.plugins.get( 'WidgetToolbar' );
				balloon = editor.plugins.get( 'ContextualBalloon' );
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( WidgetToolbar ) ).to.be.instanceOf( WidgetToolbar );
	} );

	describe( 'add()', () => {
		it( 'should create a widget toolbar and add it to the collection', () => {
			widgetToolbar.add( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				isVisible: () => false,
			} );

			expect( widgetToolbar._toolbars.size ).to.equal( 1 );
			expect( widgetToolbar._toolbars.get( 'fake' ) ).to.be.an( 'object' );
		} );

		it( 'should throw when adding two times widget with the same id', () => {
			widgetToolbar.add( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				isVisible: () => false
			} );

			expect( () => {
				widgetToolbar.add( 'fake', {
					toolbarItems: editor.config.get( 'fake.toolbar' ),
					isVisible: () => false
				} );
			} ).to.throw( /duplicated-widget-toolbar/ );
		} );

		it( 'should show widget toolbar when the `isVisible` callback returns true', () => {
			widgetToolbar.add( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				isVisible: selection => {
					const el = selection.getSelectedElement();

					return el && isWidget( el );
				}
			} );

			editor.ui.focusTracker.isFocused = true;

			setData( model, '<paragraph>foo</paragraph>[<fake-widget></fake-widget>]' );

			const fakeWidgetToolbarView = widgetToolbar._toolbars.get( 'fake' ).view;

			expect( balloon.visibleView ).to.equal( fakeWidgetToolbarView );
		} );

		it( 'should hide widget toolbar when the `isVisible` callback returns false', () => {
			widgetToolbar.add( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				isVisible: selection => {
					const el = selection.getSelectedElement();

					return el && isWidget( el );
				}
			} );

			editor.ui.focusTracker.isFocused = true;

			setData( model, '[<paragraph>foo</paragraph>]<fake-widget></fake-widget>' );

			expect( balloon.visibleView ).to.equal( null );
		} );

		it( 'should hide widget toolbar when the `isVisible` callback returns false', () => {
			widgetToolbar.add( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				isVisible: selection => {
					const el = selection.getSelectedElement();

					return el && isWidget( el );
				}
			} );

			editor.ui.focusTracker.isFocused = true;

			setData( model, '[<paragraph>foo</paragraph>]<fake-widget></fake-widget>' );

			expect( balloon.visibleView ).to.equal( null );
		} );
	} );

	describe( 'remove', () => {
		it( 'should remove given widget toolbar', () => {
			widgetToolbar.add( 'fake', {
				toolbarItems: editor.config.get( 'fake.toolbar' ),
				isVisible: () => false
			} );

			widgetToolbar.remove( 'fake' );

			expect( widgetToolbar._toolbars.size ).to.equal( 0 );
		} );
	} );

	// Plugin that adds fake_button to editor's component factory.
	class FakeButton extends Plugin {
		init() {
			this.editor.ui.componentFactory.add( 'fake_button', locale => {
				const view = new ButtonView( locale );

				view.set( {
					label: 'fake button'
				} );

				return view;
			} );
		}
	}

	// Simple widget plugin
	class FakeWidget extends Plugin {
		static get requires() {
			return [ Widget ];
		}

		init() {
			const editor = this.editor;
			const schema = editor.model.schema;

			schema.register( 'fake-widget', {
				isObject: true,
				isBlock: true,
				allowWhere: '$block',
			} );

			const conversion = editor.conversion;

			conversion.for( 'dataDowncast' ).add( downcastElementToElement( {
				model: 'fake-widget',
				view: ( modelElement, viewWriter ) => {
					const fakeWidget = viewWriter.createContainerElement( 'div' );

					return fakeWidget;
				}
			} ) );

			conversion.for( 'editingDowncast' ).add( downcastElementToElement( {
				model: 'fake-widget',
				view: ( modelElement, viewWriter ) => {
					const fakeWidget = viewWriter.createContainerElement( 'div' );

					return toWidget( fakeWidget, viewWriter, { label: 'fake-widget' } );
				}
			} ) );

			conversion.for( 'upcast' )
				.add( upcastElementToElement( {
					view: {
						name: 'div'
					},
					model: ( viewMedia, modelWriter ) => {
						return modelWriter.createElement( 'fake-widget' );
					}
				} ) )
		}
	}
} );
