---
category: updating
order: 20
meta-title: CKEditor 5 updating documentation
menu-title: CKEditor 5 release process
meta-description: Learn how to maintain and keep your CKEditor 5 up-to-date at all times.
---

# CKEditor 5 release process

Regular code releases (there are usually 10-12 of these a year) bring different changes and new features. They are often divided into major and minor changes, along the lines of {@link updating/versioning-policy Versioning policy}.

## Code release

Each code release is noted in the [changelog](https://github.com/ckeditor/ckeditor5/blob/stable/CHANGELOG.md) and enumerates all changes, additions and bug fixes that took place, also highlighting if there are any breaking changes (i.e. changes that make the latest release incompatible with the previous ones code-wise). The code packages are released on the [CKEditor 5 npm site](https://www.npmjs.com/package/ckeditor5), as well as updated in the {@link installation/getting-started/predefined-builds#download-options predefined builds} and {@link installation/getting-started/quick-start-other#creating-custom-builds-with-online-builder online builder} and are ready to download.

It is good to follow npm release messages about new packages being published as well as periodically check the changelog.

## Public release

Soon after the code release, a more user-oriented information is published. In a [release blog post](https://ckeditor.com/blog/?category=releases&tags=CKEditor-5) the latest release version is presented in more details, with examples, screencasts, screenshots and links to the new or updated documentation if it brings important information about the release. The release blog post would also provide additional information and context for the changes if needed and direct the user toward migration guides if these were created for the release.

It is good to follow [CKEditor Ecosystem Blog](https://ckeditor.com/blog/) as it also brings other important articles and news about features, changes and planned development. You can also [sign up to the monthly newsletter](https://ckeditor.com/newsletter/) in order to be notified about the latest releases.

## Update guides

Should there be any breaking or important changes that affect your editor integration and require special attention, these will also be published in the CKEditor 5 documentation in the **Updating CKEditor 5** section. These guides provide a more technical, code-oriented information directed at integrators, administrators and developers and offer solutions and necessary steps to take while updating.

Administrators and developers should always refer to update guides after each release and make sure to implement all the introduced changes properly to ensure stable and uninterrupted operation. Newly added guides are marked with a <span class="tree__item__badge tree__item__badge_new">NEW</span> icon for easy spotting.
