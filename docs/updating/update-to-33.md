---
category: update-guides
menu-title: Update to v33.x
order: 91
modified_at: 2022-02-01
---

# Update to CKEditor 5 v33.0.0

<info-box>
	When updating your CKEditor 5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

For the entire list of changes introduced in version 33.0.0, see the [release notes for CKEditor 5 v33.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v33.0.0).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v33.0.0.

## Important changes

### New import paths in the `ckeditor5-list` package

Starting with v33.0.0, some import paths have changed in the [`ckeditor5-list`](https://www.npmjs.com/package/@ckeditor/ckeditor5-list) package. If your application {@link installation/plugins/installing-plugins imports individual plugins} to integrate or build CKEditor 5, you should update the paths accordingly:

```js
// ❌ Old import paths:
import ListEditing from '@ckeditor/ckeditor5-list/src/listediting';
import ListUI from '@ckeditor/ckeditor5-list/src/listui';
import TodoListEditing from '@ckeditor/ckeditor5-list/src/todolistediting';
import ListPropertiesEditing from '@ckeditor/ckeditor5-list/src/listpropertiesediting';

// ✅ New import paths (with subdirectories):
import ListEditing from '@ckeditor/ckeditor5-list/src/list/listediting';
import ListUI from '@ckeditor/ckeditor5-list/src/list/listui';
import TodoListEditing from '@ckeditor/ckeditor5-list/src/todolist/todolistediting';
import ListPropertiesEditing from '@ckeditor/ckeditor5-list/src/listproperties/listpropertiesediting';
```

<info-box>
	Please note that **import paths for top-level plugins such as {@link module:list/list~List}, {@link module:list/listproperties~ListProperties}, {@link module:list/todolist~TodoList}, etc. remain the same**. If you are not sure which import path you should use, you can always [browse the GitHub source code](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-list/src) that corresponds to the contents of the package on npm.
</info-box>

### Additional dependencies in CKEditor 5 collaboration features

The {@link installation/advanced/dll-builds DLL builds} support was introduced for collaboration features. As a result, some imports, plugin requirements and cross-package dependencies have changed to allow for the new building process.

From now on, additional plugins will be required when the following CKEditor 5 collaboration features are added to the editor:

* **{@link module:track-changes/trackchanges~TrackChanges}** will also require adding {@link module:comments/comments~Comments} to the list of the editor plugins:

	```js
	// ❌ Old imports:
	import TrackChanges from '@ckeditor/ckeditor5-track-changes/src/trackchanges';
	// ✅ New imports:
	import TrackChanges from '@ckeditor/ckeditor5-track-changes/src/trackchanges';
	import Comments from '@ckeditor/ckeditor5-comments/src/comments';
	```

* **{@link module:real-time-collaboration/realtimecollaborativeediting~RealTimeCollaborativeEditing}** will also require {@link module:cloud-services/cloudservices~CloudServices}:

	```js
	// ❌ Old imports:
	import RealTimeCollaborativeEditing from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativeediting';
	// ✅ New imports:
	import RealTimeCollaborativeEditing from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativeediting';
	import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
	```

* **{@link module:real-time-collaboration/realtimecollaborativecomments~RealTimeCollaborativeComments}** will also require {@link module:cloud-services/cloudservices~CloudServices} and {@link module:comments/comments~Comments}:

	```js
	// ❌ Old imports:
	import RealTimeCollaborativeComments from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativecomments';
	// ✅ New imports:
	import RealTimeCollaborativeComments from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativecomments';
	import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
	import Comments from '@ckeditor/ckeditor5-comments/src/comments';
	```

* **{@link module:real-time-collaboration/realtimecollaborativetrackchanges~RealTimeCollaborativeTrackChanges}** will also require {@link module:cloud-services/cloudservices~CloudServices}, {@link module:comments/comments~Comments}, and {@link module:track-changes/trackchanges~TrackChanges}:

	```js
	// ❌ Old imports:
	import RealTimeCollaborativeTrackChanges from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativetrackchanges';
	// ✅ New imports:
	import RealTimeCollaborativeTrackChanges from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativetrackchanges';
	import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
	import Comments from '@ckeditor/ckeditor5-comments/src/comments';
	import TrackChanges from '@ckeditor/ckeditor5-track-changes/src/trackchanges';
	```

* **{@link module:real-time-collaboration/realtimecollaborativerevisionhistory~RealTimeCollaborativeRevisionHistory}** will also require {@link module:cloud-services/cloudservices~CloudServices}:

	```js
	// ❌ Old imports:
	import RealTimeCollaborativeRevisionHistory from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativerevisionhistory';
	// ✅ New imports:
	import RealTimeCollaborativeRevisionHistory from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativerevisionhistory';
	import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
	```

* **{@link module:real-time-collaboration/realtimecollaborativecomments/cloudservicescommentsadapter~CloudServicesCommentsAdapter}** will also require {@link module:cloud-services/cloudservices~CloudServices} and {@link module:comments/comments/commentsrepository~CommentsRepository}:

	```js
	// ❌ Old imports:
	import CloudServicesCommentsAdapter from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativecomments/cloudservicescommentsadapter';
	// ✅ New imports:
	import CloudServicesCommentsAdapter from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativecomments/cloudservicescommentsadapter';
	import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
	import CommentsRepository from '@ckeditor/ckeditor5-comments/src/comments/commentsrepository';
	```

* **{@link module:real-time-collaboration/realtimecollaborativetrackchanges/cloudservicestrackchangesadapter~CloudServicesTrackChangesAdapter}** will also require {@link module:cloud-services/cloudservices~CloudServices}, {@link module:comments/comments/commentsrepository~CommentsRepository}, and {@link module:track-changes/trackchangesediting~TrackChangesEditing}:

	```js
	// ❌ Old imports:
	import CloudServicesTrackChangesAdapter from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativetrackchanges/cloudservicestrackchangesadapter';

	// ✅ New imports:
	import CloudServicesTrackChangesAdapter from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativetrackchanges/cloudservicestrackchangesadapter';
	import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
	import CommentsRepository from '@ckeditor/ckeditor5-comments/src/comments/commentsrepository';
	import TrackChangesEditing from '@ckeditor/ckeditor5-track-changes/src/trackchangesediting';
	```

* **{@link module:real-time-collaboration/realtimecollaborativerevisionhistory/cloudservicesrevisionhistoryadapter~CloudServicesRevisionHistoryAdapter}** will also require {@link module:cloud-services/cloudservices~CloudServices}:

	```js
	// ❌ Old imports:
	import CloudServicesRevisionHistoryAdapter from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativerevisionhistory/cloudservicesrevisionhistoryadapter';

	// ✅ New imports:
	import CloudServicesRevisionHistoryAdapter from '@ckeditor/ckeditor5-real-time-collaboration/src/realtimecollaborativerevisionhistory/cloudservicesrevisionhistoryadapter';
	import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
	```

### Mandatory consumption of all model items in the downcast conversion pipeline

Starting with v33.0.0, all {@link module:engine/model/item~Item items} in the {@link framework/architecture/editing-engine#model model} must be consumed in the {@link framework/deep-dive/conversion/downcast downcast conversion} pipeline to prevent errors and unpredictable behavior of the editor features. If a model item is not consumed, the `conversion-model-consumable-not-consumed` error will be thrown. To learn more about the causes of this error and about possible solutions, please refer to the {@link support/error-codes#error-conversion-model-consumable-not-consumed API documentation}.

### The `triggerBy` option in the downcast pipeline is now obsolete

<info-box>
	The v33.0.0 release introduces a massive upgrade to the conversion system. You can find a detailed summary of all these changes in the [developer notes on GitHub](https://github.com/ckeditor/ckeditor5/issues/11268#issuecomment-1061655977).
</info-box>

If some of your downcast pipeline converters took advantage of the experimental `triggerBy` property to trigger (re)conversion upon changes of attributes or children, they need to be updated. For instance:

```js
// ❌ The old conversion using obsolete "triggerBy":
editor.conversion.for( 'downcast' ).elementToElement( {
	model: 'myElement',
	view: ( modelElement, { writer } ) => {
		return writer.createContainerElement( 'div', {
			'data-owner-id': modelElement.getAttribute( 'ownerId' ),
			class: `my-element my-element-${ modelElement.getAttribute( 'type' ) }`
		} );
	},
	triggerBy: {
		attributes: [ 'ownerId', 'type' ],
		children: 'childModelElement'
	}
} );

// ✅ The new conversion syntax:
editor.conversion.for( 'downcast' ).elementToElement( {
	model: {
		name: 'myElement',
		attributes: [ 'ownerId', 'type' ],
		children: true
	},
	view: ( modelElement, { writer } ) => {
		// The same converter code.
	}
} );
```

<info-box>
	Please note that the new syntax is available both in {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement} and {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure} helpers.
</info-box>

### New downcast converters for the {@link features/tables table feature}

The conversion brought by the {@link module:table/tableediting~TableEditing} plugin has been refined in this version and now relies heavily on the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure} downcast conversion helper.

If your integration extends or overwrites that conversion (the `table`, `tableRow`, `tableCell` model elements and/or their attributes), you might need to undertake some actions to align your custom features with the latest editor API. Please note that the extent of necessary changes may vary depending on how advanced your customizations are.

### Responsibility shift in the low–level downcast converters

{@link module:engine/conversion/downcastdispatcher~DowncastDispatcher Downcast dispatcher} will now fire events for model items no matter if they were {@link module:engine/conversion/modelconsumable~ModelConsumable#consume consumed} or not. This means that the low–level (event–driven) downcast converters listening to these events must first {@link module:engine/conversion/viewconsumable~ViewConsumable#test test} whether the item has already been consumed to prevent double conversion and errors:

```js
editor.conversion.for( 'downcast' ).add( dispatcher => {
	dispatcher.on( '...', ( evt, data, conversionApi ) => {
		// Before converting, check whether the change has not been consumed yet.
		if ( !conversionApi.consumable.test( data.item, evt.name ) ) {
			return;
		}

		// Converter code...
	} );
} );
```

Also, please keep in mind that starting with CKEditor 5 v33.0.0, all model items [must be consumed](#mandatory-consumption-of-all-model-items-in-the-downcast-conversion-pipeline) by your custom converters to prevent further errors.

### The `Differ#refreshItem()` method is now obsolete

Please note that `Differ#refreshItem()` is obsolete and was replaced by {@link module:engine/controller/editingcontroller~EditingController#reconvertItem}:

```js
// ❌ Old API:
editor.model.document.differ.refreshItem( ... );

// ✅ New API:
editor.editing.reconvertItem( ... );
```

### Comments editor configuration is now required

Since the cross-package dependencies inside the project were removed, the configuration for the comments editor became required. Keep in mind that the editor used in the comments section is also a CKEditor 5 instance and is configured the same way as the regular editor.

After the update, you should configure the comments editor using the `config.comments.editorConfig` option:

```js
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import List from '@ckeditor/ckeditor5-list/src/list';

ClassicEditor.create( document.querySelector( '#editor' ), {
	// ...

	comments: {
		editorConfig: {
			extraPlugins: [ Autoformat, Bold, Italic, List ]
		}
	}
} );
```

<info-box>
	Before the change, the comments editor included the `Bold`, `Italic`, `Autoformat` and `List` plugins.

	If you want to keep the same user experience after updating the editor, you need to configure the comments editor as shown in the example above.
</info-box>

If this configuration is not provided, a warning will be logged in the console and the the comments editor will be initialized with the most basic features, that is just typing, paragraph and undo features.

To hide the warning (and use the basic configuration), provide an empty configuration for the comments editor:

```js
ClassicEditor.create( document.querySelector( '#editor' ), {
	// ...

	comments: {
		editorConfig: {}
	}
} );
```

## New API

### New `elementToStructure()` downcast helper

The new {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure} helper was introduced to streamline downcast conversion to complex view structures. Unlike {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement}, it allows placing children of an element in configurable slots in the view structure without the need to develop complex converters using low–level event–driven API.

To learn more about this new helper, please refer to the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure API documentation} or check out the {@link framework/deep-dive/conversion/downcast#converting-element-to-structure official conversion guide} with plenty of examples and details.

### New API to trigger downcast (re)conversion

The [`triggerBy` property is obsolete](#the-triggerby-option-in-the-downcast-pipeline-is-now-obsolete) and a new API was created to trigger downcast conversion of a model element upon changes to its attributes or children (also known as *reconversion*):

```js
editor.conversion.for( 'downcast' ).elementToElement( {
	model: {
		name: 'myElement',

		// Changes to these attributes will (re)convert myElement.
		attributes: [ 'ownerId', 'type' ],

		// If some children are added or removed, myElement will be (re)converted.
		children: true
	},
	view: ( modelElement, { writer } ) => {
		// ...
	}
} );
```

The new syntax of the `model` property is available in the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToElement} and {@link module:engine/conversion/downcasthelpers~DowncastHelpers#elementToStructure} helpers. Please refer to the respective API documentation for more details.

### Improved API of `DowncastWriter#createContainerElement()`

Starting from v33.0.0, you can specify the children of a container element directly in the {@link module:engine/view/downcastwriter~DowncastWriter#createContainerElement} method:

```js
// ❌ Old API:
const element = writer.createContainerElement( 'p', { id: '1234' } );

writer.insert( writer.createPositionAt( element, 0 ), childElementA );
writer.insert( writer.createPositionAt( element, 1 ), childElementB );
// ...

// ✅ New API:
writer.createContainerElement( 'p', { id: '1234' }, [
	childElementA,
	childElementB,

	// ...
] );
```
