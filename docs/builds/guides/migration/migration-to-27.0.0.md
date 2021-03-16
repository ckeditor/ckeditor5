---
category: builds-migration
order: 20
---

# Migration to CKEditor 5 v27.0.0

For the entire list of changes introduced in version 27.0.0, see the [changelog for CKEditor 5 v27.0.0](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md). **TODO** update link to the exact version anchor.

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v27.0.0.

## Clipboard input pipeline integration

Starting from v27.0.0, the {@link module:clipboard/clipboard~Clipboard `Clipboard` plugin} is no longer firing the `inputTransformation` events. The code of this feature was refactored and split into:

* {@link module:clipboard/clipboardpipeline~ClipboardPipeline `ClipboardPipeline` plugin}, 
* {@link module:clipboard/pasteplaintext~PastePlainText `PastePlainText` plugin}, 
* {@link module:clipboard/dragdrop~DragDrop `DragDrop` plugin}. 
  
The {@link module:clipboard/clipboard~Clipboard `Clipboard` plugin} became a "glue" plugin that loads ones listed above. 

From v27.0.0 the {@link module:clipboard/clipboardpipeline~ClipboardPipeline `ClipboardPipeline` plugin} is responsible for firing the {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:inputTransformation `ClipboardPipeline#inputTransformation`} event and also the new {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:contentInsertion `ClipboardPipeline#contentInsertion`} event.

The {@link module:engine/view/document~Document#event:clipboardInput `view.Document#clipboardInput`} and {@link module:clipboard/clipboardpipeline~ClipboardPipeline#event:inputTransformation `ClipboardPipeline#inputTransformation`} events should not be fired or stopped in your feature code. The `data.content` property should be assigned to override the default content instead. You can stop this event only if you want to completely disable pasting/dropping of some specific content.

You can read about the whole input pipeline in details in {@link framework/guides/deep-dive/clipboard#input-pipeline clipboard pipeline guide}.
