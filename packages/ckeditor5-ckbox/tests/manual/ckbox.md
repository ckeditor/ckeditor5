### CKBox sample

## Adding assets

1. The model element representing the "_Example Link_" text node should have the `[ckboxLinkId]` attribute with the value: `example-id-for-link`.
2. The model element representing the inline image should have the `[ckboxImageId]` attribute with the value: `example-id-for-image`.
3. Click the "Open file manager" icon to open the CKBox dialog.
4. Chose assets that you want to insert into the editor, then click "Choose".
5. Selected assets should be inserted into the editor with the following rules:
    * When adding a non-embeddable asset - a text node with URL pointing to that asset should be created.
    * When adding an embeddable asset - it should be visible in the editor.
6. Inserted assets should have the `[data-ckbox-resource-id]` attribute in the data.
