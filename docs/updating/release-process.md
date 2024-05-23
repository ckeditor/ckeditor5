---
category: updating
order: 40
meta-title: Release process | CKEditor 5 Documentation
meta-description: What CKEditor 5 versions are published and how is it done? What is the difference between stable, nighly, alpha and RC versions?
---

# Release process

The following guide describes the various ways CKEditor&nbsp;5 code is released.

## Code releases

### Stable releases

Regular code releases (there are usually 10 of these a year) bring different changes and new features. They are often divided into major and minor changes, along the lines of our {@link updating/versioning-policy versioning policy}.

Each code release is noted in the [changelog](https://github.com/ckeditor/ckeditor5/blob/stable/CHANGELOG.md) and enumerates all changes, additions, and bug fixes that took place, also highlighting if there are any breaking changes (changes that make the latest release incompatible with the previous ones code-wise). The code packages are released on the [CKEditor&nbsp;5 npm site](https://www.npmjs.com/package/ckeditor5), as well as updated in the Builder and are ready to download.

It is good to follow npm release messages about new packages being published as well as periodically check the changelog.

### Nightly releases

The `nightly` releases are published daily and are built upon the current codebase's `master` branch. It means they may contain new features and bug fixes but also mistakes and errors. Because of that, `nightly` versions are not fit for production environments. They should be seen more as an experimental approach or testing grounds.

The releases are created daily, so integration tests using `nightly` packages might fail. Please [create an issue in the CKEditor&nbsp;5 issue tracker](https://github.com/ckeditor/ckeditor5/issues) in such a case. We may have merged a regression, and our tests did not catch it.

### Alpha and RC releases

Sometimes, to test specific new features or other changes important in the upcoming stable release, `alpha` versions are released, too. While they would typically be based on a tested code, they are still not `stable`, and hence the same caution is advised when trying these out.

The release candidate (`rc`) versions are often the ones that will become `stable` during the upcoming release.

The `rc` and `alpha` versions are named by appending a numbered type denominator to the previous stable version. The `nightly` ones are marked with a daily date.

## Update guides

If any breaking or important changes would affect your editor integration and require special attention, these will also be published in the CKEditor&nbsp;5 documentation in the **Updating CKEditor&nbsp;5** section. These guides provide more technical, code-oriented information directed at integrators, administrators, and developers and offer solutions and necessary steps to take while updating.

Administrators and developers should always refer to update guides after each release and make sure to implement all the introduced changes properly to ensure stable and uninterrupted operation. Newly added guides are marked with a&nbsp;<span class="tree__item__badge tree__item__badge_new">NEW</span>&nbsp;icon for easy spotting.

It is good to follow [CKEditor Ecosystem Blog](https://ckeditor.com/blog/) as it also brings other important articles and news about features, changes, and planned development. You can also [sign up for the monthly newsletter](https://ckeditor.com/newsletter/) to be notified about the latest releases.
