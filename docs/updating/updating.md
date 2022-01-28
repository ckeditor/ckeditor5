---
category: updating
menu-title: Updating your editor
order: 1
modified_at: 2022-01-27
---

# Updating your editor

Updating is an important process that should become your routine. Our team constantly introduce new features, bug fixes and improvements, so keeping the editor up-to-date will make sure that you get from CKEditor 5 its best.

Before proceeding with a real update, it is highly recommended to [read the changelog](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md) for the latest version to learn about changes introduced in the release (pay attention to {@link support/versioning-policy#major-and-minor-breaking-changes breaking changes}). This step is crucial if you develop custom features and modify the editor, as sometimes, changes in our code might affect your custom solutions. 

To help you with a smooth update, we have prepared migration guides that describe adjustments that need to be done before moving to the production environment. You can find them in the sidebar located in the left side of the page.

<info-box>
Always remember to test your editor before exposing it in the production environment to make sure that the update won't have a negative impact on your application and a user experience.
</info-box>

## Updating CKEditor 5

CKEditor 5 is delivered in a few ways, while the most flexible and 

### Example

Let's imagine that we use the editor at version 30.0.0 and we want to update to 31.0.0. 

The first step we need to do is verifying changes introduced by 31.0.0 version, so we navigate to the [changelog for version 31.0.0](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md#3100-2021-10-25). The release introduced one major breaking change:

{@img assets/img/updating-changelog.png 778 Breaking change in the changelog.}

The change affects the {@link features/html-embed HTML embed feature}, so if we used this feature's API in our project, it should be reviewed. Fortunately, our {@link updating/migration-to-31#migration-to-ckeditor-5-v3100 migration guide for version 31.0.0} explains what should be updated in our code!

<info-box>
As it is recommended to update regulary, sometimes it could happen you skip a few releases and need to update to a non-adjacent version. In such a case, remember to verify the changelog and migration guides for all missing versions, not only the one you are updating to.
</info-box>

Now, when we know what have changed and which parts of our custom code need to be adjusted, it is time to make the update. If you use a predefined build hosted on CDN or downloaded ZIP package, you can simply visit our [CKEditor 5 download section](https://ckeditor.com/ckeditor-5/download/) and get the latest version. However, the most common way for installing CKEditor 5 is using `npm` packages. 

The example `package.json` file with the editor at version 30.0.0 looks as below:

```json
"dependencies": {
    "@ckeditor/ckeditor5-adapter-ckfinder": "^30.0.0",
    "@ckeditor/ckeditor5-autoformat": "^30.0.0",
    "@ckeditor/ckeditor5-basic-styles": "^30.0.0",
    "@ckeditor/ckeditor5-block-quote": "^30.0.0",
    "@ckeditor/ckeditor5-ckfinder": "^30.0.0",
    "@ckeditor/ckeditor5-cloud-services": "^30.0.0",
    "@ckeditor/ckeditor5-easy-image": "^30.0.0",
    "@ckeditor/ckeditor5-editor-classic": "^30.0.0",
    "@ckeditor/ckeditor5-essentials": "^30.0.0",
    "@ckeditor/ckeditor5-heading": "^30.0.0",
    "@ckeditor/ckeditor5-image": "^30.0.0",
    "@ckeditor/ckeditor5-indent": "^30.0.0",
    "@ckeditor/ckeditor5-link": "^30.0.0",
    "@ckeditor/ckeditor5-list": "^30.0.0",
    "@ckeditor/ckeditor5-media-embed": "^30.0.0",
    "@ckeditor/ckeditor5-paragraph": "^30.0.0",
    "@ckeditor/ckeditor5-paste-from-office": "^30.0.0",
    "@ckeditor/ckeditor5-table": "^30.0.0",
    "@ckeditor/ckeditor5-typing": "^30.0.0"
  }
  ```

To perform the update, we can simply change the version from 30.0.0 to 31.0.0 or use some automated tool (e.g. [npm-check-updates](https://www.npmjs.com/package/npm-check-updates)):

```json
  "dependencies": {
    "@ckeditor/ckeditor5-adapter-ckfinder": "^30.1.0",
    "@ckeditor/ckeditor5-autoformat": "^30.1.0",
    "@ckeditor/ckeditor5-basic-styles": "^30.1.0",
    "@ckeditor/ckeditor5-block-quote": "^30.1.0",
    "@ckeditor/ckeditor5-ckfinder": "^30.1.0",
    "@ckeditor/ckeditor5-cloud-services": "^30.1.0",
    "@ckeditor/ckeditor5-easy-image": "^30.1.0",
    "@ckeditor/ckeditor5-editor-classic": "^30.1.0",
    "@ckeditor/ckeditor5-essentials": "^30.1.0",
    "@ckeditor/ckeditor5-heading": "^30.1.0",
    "@ckeditor/ckeditor5-image": "^30.1.0",
    "@ckeditor/ckeditor5-indent": "^30.1.0",
    "@ckeditor/ckeditor5-link": "^30.1.0",
    "@ckeditor/ckeditor5-list": "^30.1.0",
    "@ckeditor/ckeditor5-media-embed": "^30.1.0",
    "@ckeditor/ckeditor5-paragraph": "^30.1.0",
    "@ckeditor/ckeditor5-paste-from-office": "^30.1.0",
    "@ckeditor/ckeditor5-table": "^30.1.0",
    "@ckeditor/ckeditor5-typing": "^30.1.0"
  }
  ```

Finally, we can reinstall packages and rebuild the editor (sometimes it might be required to remove `package-lock.json` or `yarn.lock` files):

```sh
rm -rf node_modules && yarn install && yarn run build
```

That's it! Your editor is updated and now you can focus on adjusting your custom solutions (if needed). If you use real-time collaboration, you should check next section.

### Real-time collaboration

Bar