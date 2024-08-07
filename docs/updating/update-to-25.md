---
category: update-guides
meta-title: Update to version 25.x | CKEditor 5 Documentation
menu-title: Update to v25.x
order: 99
---

# Update to CKEditor&nbsp;5 v25.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v25.0.0

_Released on January 27, 2021._

For the entire list of changes introduced in version 25.0.0, see the [release notes for CKEditor&nbsp;5 v25.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v25.0.0).

This migration guide enumerates the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v25.0.0 due to changes introduced in the {@link features/collaboration collaboration features} and the redesign of the annotations API.

### The redesign of the Annotations API

The entire annotations API was redesigned to support many annotation UIs at the same time. A good example of this is an idea of displaying {@link features/comments comments} in the {@link features/annotations-display-mode#wide-sidebar sidebar} while showing suggestions from {@link features/track-changes track changes} in {@link features/annotations-display-mode#inline-balloons inline balloons} when their corresponding suggestions are active. Due to that, some architectural changes were made and quite a lot of breaking changes were introduced with this release. See the migration guide below to check how to adapt to the changes.

### Conceptual and architectural changes

The new annotations API allows for activating (attaching) many annotation UIs at the same time. To allow multiple UIs at the same time, the annotation filtering function must be registered during the annotation UI activation. Though, still, one annotation can be handled only by one annotation UI at the same time.

The new annotations API allows for setting multiple active annotations at the same time (max one per each annotation UI), so at some point more than one annotation can be active for various annotation UIs.

An annotation UI is now activated with its own collection of filtered annotations and became responsible for reacting to more events. This allows for more customization possibilities, however, unfortunately, it comes with more code needed to be written for the custom annotation UI class. After the changes, an annotation UI is responsible for:
* Displaying the annotation.
* Marking the annotation as active when it should be activated and propagating this change via an observable property.
* Reacting to editor events (though this is planned to be changed and simplified in the future).
* Reacting to focus changes in the annotation collection.
* Handling newly added and removed annotations.
* Handling the annotation activation and deactivation from external places via the [`setActiveAnnotation()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_comments_annotations_annotationsuis-AnnotationsUI.html#function-setActiveAnnotation) method.

The existing `Annotations` class was split to the new [`Annotations`](https://ckeditor.com/docs/ckeditor5/latest/api/module_comments_annotations_annotations-Annotations.html) class, which is a global collection of annotations, and the new [`AnnotationsUIs`](https://ckeditor.com/docs/ckeditor5/latest/api/module_comments_annotations_annotationsuis-AnnotationsUIs.html) class, which is mainly responsible for registering and activating annotation UIs.

In place where the [`AnnotationView`](https://ckeditor.com/docs/ckeditor5/latest/api/module_comments_annotations_view_annotationview-AnnotationView.html) had been used, the new [`Annotations`](https://ckeditor.com/docs/ckeditor5/latest/api/module_comments_annotations_annotations-Annotations.html)  class instance is used and it exposes mainly the following properties:
* [`target`](https://ckeditor.com/docs/ckeditor5/latest/api/module_comments_annotations_annotation-Annotation.html#member-target) &ndash; The target element to which the annotation should be bound. It can be a [`Rect`](https://ckeditor.com/docs/ckeditor5/latest/api/module_utils_dom_rect-Rect.html) instance or an HTML Element.
* [`view`](https://ckeditor.com/docs/ckeditor5/latest/api/module_comments_annotations_annotation-Annotation.html#member-view) &ndash; The [`AnnotationView`](https://ckeditor.com/docs/ckeditor5/latest/api/module_comments_annotations_view_annotationview-AnnotationView.html) instance.
* [`type`](https://ckeditor.com/docs/ckeditor5/latest/api/module_comments_annotations_annotation-Annotation.html#member-type) &ndash; The type of the annotation.
* [`isActive`](https://ckeditor.com/docs/ckeditor5/latest/api/module_comments_annotations_annotation-Annotation.html#member-isActive) &ndash; A property that determines if the annotation view and annotation inner views are active or not. It should be changed by the annotation UI when it changes the active annotation.

The [`Sidebar`](https://ckeditor.com/docs/ckeditor5/latest/api/module_comments_annotations_sidebar-Sidebar.html) class stopped operating on the global collection of annotations. From now on, the annotation UI that is responsible for displaying the sidebar should provide the sidebar with its collection of annotations and inform about possible actions with the new [`rearrange()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_comments_annotations_sidebar-Sidebar.html#function-rearrange) and [`refresh()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_comments_annotations_sidebar-Sidebar.html#function-refresh) methods.

The [`EditorAnnotations`](https://ckeditor.com/docs/ckeditor5/latest/api/module_comments_annotations_editorannotations-EditorAnnotations.html) started firing events instead of manipulating the global collection of annotations. From now on, every annotation UI needs to create its own integration with this class. This may change in the future as it complicates the implementation of the custom UI.

### Code migration examples

#### Registering and activating annotation UIs

Before:

```js
const annotations = editor.plugins.get( 'Annotations' );

annotations.register( 'myCustomUI', myCustomUI );
annotations.switchTo( 'myCustomUI' );

// Activate and deactivate the UI.
annotations.attach( 'myCustomUI' );
annotations.detach( 'myCustomUI' );
```

After:

```js
const annotationsUIs = editor.plugins.get( 'AnnotationsUIs' );

annotationsUIs.register( 'myCustomUI', myCustomUI );
annotationsUIs.switchTo( 'myCustomUI' );

// Activate and deactivate the UI.
annotationsUIs.activate( 'myCustomUI' );
annotationsUIs.deactivate( 'myCustomUI' );

// Activate two different UIs for comments and suggestions.
annotationsUIs.activate( 'wideSidebar', annotation => annotation.type === 'comment' );
annotationsUIs.activate( 'inline', annotation => annotation.type !== 'comment' );
annotationsUIs.deactivateAll();
```

### Using  global collection of annotations and active annotations

Before:

```js
const annotations = editor.plugins.get( 'Annotations' );

// An annotation view or `null`.
const activeAnnotationView = annotations.activeView;

// A collection of annotation views.
const annotationViewCollection = annotations.items;

// Adding an annotation to the collection.
const target = new Rect( { left: 0, top: 0 } );
annotations.add( innerView, target );

// Removing an annotation based on the inner view.
annotations.remove( innerView );
```

After:

```js
const annotations = editor.plugins.get( 'Annotations' );

// A set of active annotations.
const activeAnnotations = annotations.activeAnnotations;

// An array of active annotation views.
Array.from( activeAnnotations, annotation => annotation.view );

// A collection of annotations (`Annotation` class items).
const annotationCollection = annotations.collection;

// Adding an annotation to the collection.
annotations.add( new Annotation( {
	view: new AnnotationView( innerView ),
	target: new Rect( { left: 0, top: 0 } ),
	type: 'comment' // The type is used only for the AnnotationsUIs filtering mechanism.
} ) );

// Removing an annotation based on the inner view.
const annotation = annotations.getByInnerView( innerView );
annotations.remove( annotation );
```

### Creating a custom Annotations UI

Before:

```js
class CustomAnnotationUI {
	attach() {
		const annotations = this.editor.plugins.get( 'Annotations' );

		// The code responsible for displaying annotations
		// based on the global collection of annotations.
	}

	detach() {
		// The code responsible for hiding the UI and detaching
		// listeners from the global annotation collection.
	}
}
```

After:

```js
class CustomAnnotationUI extends ContextPlugin {
	constructor() {
		this.set( 'activeAnnotation', null );
	}

	setActiveAnnotation( annotation ) {
		// The code responsible for reacting to annotation changes.
		if ( annotation === this.activeAnnotation ) {
			return;
		}

		if ( this.activeAnnotation ) {
			this.activeAnnotation.isActive = false;
		}

		if ( annotation ) {
			annotation.isActive = true;
		}

		this.activeAnnotation = annotation;
	}

	attach( annotations ) {
		// The code responsible for displaying annotations
		// based on the annotation collection passed to this UI.

		// The code responsible for setting an active and non-active annotation
		// based on the annotation focus changes.
		this.listenTo( annotations, 'focus', ( evt, annotation ) => {
			this.setActiveAnnotation( annotation );
		} );

		this.listenTo( annotations, 'blur', () => {
			this.setActiveAnnotation( null );
		} );

		// The code responsible for the integration with editor annotation markers,
		// editor events and the editor selection changes.
		// The requirement of this integration might change in the future.
		// If the plugin was initialized as an editor plugin, the integration
		// should look like the following:
		const editorAnnotations = editor.plugins.get( 'EditorAnnotations' );

		this.listenTo( editorAnnotations, 'refresh', () => refreshActiveAnnotation.bind( this ) );
		this.listenTo( editorAnnotations, 'blur' ( evt, { isAnnotationTracked } ) => {
			if ( this.activeAnnotation && isAnnotationTracked( this.activeAnnotation ) ) {
				this.setActiveAnnotation( null );
			}
		} );
		this.listenTo( editorAnnotations, 'uiUpdate' () => annotations._refreshPositioning();

		function refreshActiveAnnotation() {
			const selectedAnnotations = editorAnnotations.getOrderedSelectedAnnotations( {
				annotations: this._annotations,
				activeAnnotation: this.activeAnnotation
			} );

			this.setActiveAnnotation( selectedAnnotations[ 0 ] || null );
		}
	}

	detach() {
		// The code responsible for hiding the UI and detaching
		// listeners from the annotation collection, editor annotations and others.
	}
}
```
