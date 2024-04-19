### A few quick notes about dialogs:

* Only one dialog can be open at the same time. Opening a second one closes the previous one.
* There are actually two types of dialog windows: “ordinary” dialogs and modals. The difference is, while modal is open, user can’t interact with the editor - and dialog allows it. By default modals have a grey overlay, so you’ll notice it.
* Dialogs are draggable. The drag handle is dialog’s header. But dialog can be configured to not have a header - it’s not draggable then.
* Dialogs have configured default position. Besides the Screen center one, they are relative to the editor, meaning that the dialog will dynamically adjust its position during e.g. page scrolling. This binding is always broken once the user drags the dialog - it will be stuck in this place until reopening.
* Dialogs are hidden when entering the source mode. In the manual test the dialog buttons are still active, but that’s because we didn’t bother with configuring their state. Nothing happens when you press them.
* Removing all the roots in the multiroot editor should not throw errors or break the dialog.
