---
# Scope:
# * Introduction to the migration problem.
# * Underline that migrating is a complex and important task.
# * List and clarify the things that need attention when migrating.

category: builds-guides
order: 260
---

# Migration from CKEditor 4

When compared to its predecessor, CKEditor 5 should be considered **a totally new editor**. Every single aspect of it was redesigned &mdash; from installation, to integration, to features, to its data model, and finally to its API. Therefore, moving applications using a previous CKEditor version to version 5 cannot be simply called an "upgrade". It is something bigger, so the "migration" term fits better.

There is no "drop in" solution for migrating. In this guide we hope to summarize the most important aspects to be taken into consideration before you proceed with installing CKEditor 5.

Before starting, be sure that migrating is your best choice. Refer to {@link builds/guides/overview#When-NOT-to-use-builds When NOT to use CKEditor 5 Builds?} for more information.

## Installation and integration

The very first aspect that changed with CKEditor 5 is its installation procedure. It became much more modern with the introduction of modular patterns, UMD, npm, etc. Check {@link builds/guides/integration/installation Installation} for more details.

The API for integrating CKEditor with your pages also changed. It is worth checking {@link builds/guides/integration/basic-api Basic API} for an introduction.

## Features

When it comes to features, there are two aspects that need to be taken into consideration:

* CKEditor 5 may still not have the same features available as CKEditor 4.
* Existing features may behave differently.

Therefore, it is worth spending some time analyzing required features.

CKEditor 5 was designed with focus on creating quality content. There are thus good reasons for it to not support some old features. You should take this chance to rethink the features available in your application and in turn perhaps switch the approach towards a more modern reasoning.

<info-box>
Features like fonts, colors and alignment will be added in the future, when new types of builds will be introduced with the purpose of satisfying document editing scenarios.
</info-box>

## Image upload

Image upload is handled differently with CKEditor 5, bringing a much better user experience. Solutions used with CKEditor 4 may not be compatible any more and therefore another solution needs to be found.

CKEditor 5 Builds come with {@link features/image#Image-upload Easy Image} available out of the box. It is a super simple to {@linkTODO enable image upload with it}.

## Plugins

The trickiest migration challenge to be faced may be related to custom plugins you have developed for CKEditor 4. Although their concept may stay the same, their implementation is certainly different and will require rewriting them from scratch.

The same may apply for third-party plugins which may not have been ported to CKEditor 5 yet.

Check the {@link builds/guides/development/plugins#Creating-plugins Creating plugins guide} for more information on the development of plugins.

## Themes (skins)

In CKEditor 5, the previous concept of "skins" was reviewed and is now called "themes".

If you have custom skins for CKEditor 4, these skins need to be recreated for CKEditor 5. Fortunately {@link framework/guides/theme-customization custom theming} in CKEditor 5 is much more powerful and simpler than before.

<!--
For more information, check how to {@linkTODO create new themes in the CKEditor 5 Framework documentation}.
-->

## Existing data

An extremely important aspect to be remembered is that &mdash; because of the difference in features &mdash; the **data produced with CKEditor 4 may not be compatible with CKEditor 5**.

Extensive analysis, data verification and tests should be performed on existing data. If necessary, you will need to develop conversion procedures to avoid data loss. A relatively simple yet efficient strategy of adopting CKEditor 5 into existing systems might be using CKEditor 5 for creating new content and the old editor for editing legacy content.
