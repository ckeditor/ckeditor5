---
# Scope:
# Support migration from CKEditor 4 to CKEditor 5.

category: ckeditor4-migration
order: 10
modified_at: 2022-11-09
---

# Migration from CKEditor 4

<info-box hint>
This is a guide for users who would like to switch from CKEditor 4 to CKEditor 5. It assumes you already have some basic knowledge about CKEditor 5, as this is necessary to follow this guide. If that is not the case, please roam around the {@link installation/index Getting started} section to make youself familiar with the concepts and ideas behing this new, modern installment of our WYSIWYG editor. For example, feel free to explore our {@link features/index features page} to compare the available plugins with your needs.

Before starting, decide what kind of installation to use for your new editor. Refer to the {@link installation/index Getting started with CKEditor 5} overview guide for more information on available installation methods.
</info-box>

When compared to its predecessor, CKEditor 5 should be considered **a totally new editor**. Every single aspect of it was redesigned &mdash; from installation, to integration, to features, to its data model, and finally to its API. Therefore, moving applications using a previous CKEditor version to version 5 cannot be simply called an "upgrade". It is something bigger, so the "migration" term fits better.

There is no "drop in" solution for migrating. In this guide we hope to summarize the most important aspects you need to consider before you proceed with installing CKEditor 5.

## Installation and integration

The very first aspect that changed with CKEditor 5 is its installation procedure. It became much more modern with the introduction of modular patterns, UMD, npm, etc. Refer to {@link installation/getting-started/quick-start Installation} for more details.

The API for integrating CKEditor with your pages also changed. It is worth checking {@link installation/getting-started/editor-lifecycle Editor Lifecycle} and {@link installation/getting-started/getting-and-setting-data Getting and setting data} for an introduction.

## Features

When it comes to {@link features/index features}, there are two aspects that need to be taken into consideration:

* CKEditor 5 may still not have the same features available as CKEditor 4.
* Existing features may behave differently.

Therefore, it is worth spending some time analyzing required features.

CKEditor 5 was designed with focus on creating quality content. There are thus good reasons for it to not support some old features. You should take this chance to rethink the features available in your application and perhaps switch the approach towards a more modern reasoning.

## Image upload

CKEditor 5 supports several different image upload strategies. Check out the {@link features/image-upload comprehensive "Image upload" guide} to find out the best option for your project.

## Plugins

The trickiest migration challenge to be faced may be related to custom plugins you have developed for CKEditor 4. Although their concept may stay the same, their implementation will certainly be different and will require rewriting them from scratch.

The same may apply for third-party plugins which may not have been ported to CKEditor 5 yet.

Check the {@link installation/plugins/plugins#creating-plugins Creating plugins} section for more information on the development of plugins.

When it comes to official plugins compatibility between CKEditor 4 and CKEditor 5, please see the {@link updating/ckeditor4-plugin-compatibility plugin compatibility table} to learn more.

## Themes (skins)

In CKEditor 5, the previous concept of "skins" was reviewed and is now called "themes".

If you have custom skins for CKEditor 4, these skins need to be recreated for CKEditor 5. Fortunately, {@link framework/theme-customization custom theming} in CKEditor 5 is much more powerful and simpler than before.

For more information, check how to {@link framework/theme-customization customize the themes} in the CKEditor 5 Framework documentation.

## Existing data

An extremely important aspect to be remembered is that &mdash; because of the difference in features &mdash; the **data produced with CKEditor 4 may not be compatible with CKEditor 5 (which may lead to data loss)**.

Extensive analysis, data verification and tests should be performed on existing data. If necessary, you will need to develop conversion procedures to avoid data loss. The {@link features/general-html-support General HTML Support} feature may be used to introduce HTML markup that is present in the legacy content but is not yet fully covered by CKEditor 5 features.

A relatively simple yet efficient strategy of adopting CKEditor 5 into existing systems might be using CKEditor 5 for creating new content and the old editor for editing legacy content.

If you are missing any particular features or settings, feel free to {@link support/reporting-issues#reporting-issues-2 report an issue}. Search the [issues section in the repository](https://github.com/ckeditor/ckeditor5/issues) first, as the feature you are after may have already been reported &mdash; you can support it by upvoting the issue with &nbsp;👍&nbsp;. Please be as precise as possible, explaining the exact use case, the context where the editor is used, and the expected behavior.
