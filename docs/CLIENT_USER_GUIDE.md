# FutureBD Admin User Guide

## Purpose

This guide is for store managers, admins, and client users who will operate the FutureBD dashboard without editing code.

It explains:

- how to use the admin panel
- how to manage products, categories, banners, coupons, orders, and footer settings
- how to translate English words and sentences into Bangla from the dashboard

## 1. Login and Access

### Admin login

1. Open the website login page.
2. Enter your email or phone number and password.
3. Sign in with an account that has admin access.
4. After login, open the dashboard from the account menu or visit `/dashboard`.

### User roles

- `Super Admin`: full control, including users
- `Admin`: manages store content and operations
- `Moderator`: limited operational access
- `Customer`: storefront access only

If a menu item is missing, your account role may not have permission for that section.

## 2. Dashboard Overview

The dashboard menu is divided into major sections:

- `Dashboard`: summary and overview
- `Catalog`: products, categories, brands, hero banners
- `Commerce`: customers, orders, coupons, reviews
- `Settings`: footer settings, translations
- `Access`: users and account management

## 3. Product Management

### Add a product

1. Go to `Products`.
2. Click `Add Product`.
3. Fill in product details such as name, category, brand, price, stock, and image.
4. Save.

### Edit a product

1. Go to `Products`.
2. Find the item in the list.
3. Click the edit action.
4. Update the information.
5. Save.

### Delete a product

1. Open `Products`.
2. Click the delete action beside the product.
3. Confirm deletion.

Use deletion carefully. If the product is already referenced in orders or campaigns, review impact first.

## 4. Categories and Brands

### Categories

Use `Categories` to organize products into groups.

Typical examples:

- Electronics
- Fashion
- Home Appliances

### Brands

Use `Brands` to maintain product brand names such as Apple, Xiaomi, Samsung, or Nike.

Important:

- category and brand names can also be translated for Bangla users
- if a new category or brand is added, add its translation entry from the `Translations` page

## 5. Hero Banners

Use `Hero Banners` to control homepage promotional banners.

You can usually manage:

- banner title
- subtitle
- button text
- image
- display order

Keep banner text short and clear for better mobile display.

## 6. Orders

Use `Orders` to track customer purchases.

From this section you can:

- view order list
- inspect order details
- update order status
- open invoice pages

Recommended workflow:

1. Check for new orders daily.
2. Confirm payment method and shipping details.
3. Update status in sequence.
4. Communicate with the customer if anything is missing.

## 7. Coupons

Use `Coupons` to create promotional discounts.

Typical setup includes:

- coupon code
- discount amount or percentage
- validity period
- usage rules

Before publishing a coupon, test it once in checkout.

## 8. Reviews

Use `Reviews` to moderate customer feedback.

Typical actions:

- approve a review
- reject a review
- remove spam or abusive content

## 9. Footer Settings

Use `Footer Settings` to control the bottom section of the website.

You can manage:

- logo text
- description
- address
- phone
- email
- copyright
- payment methods
- social links

This section affects storefront trust and contact visibility, so keep it updated.

## 10. Translation Management

This is the most important section for English to Bangla content control.

Open:

- `Dashboard` -> `Settings` -> `Translations`

This page allows you to manually define what the customer sees in English and what they should see in Bangla.

### Translation fields

Each translation entry contains:

- `Key`: the unique system name for the text
- `Group`: a logical category such as `common`, `home`, or `search`
- `English Text`: the English version shown in the system
- `Bangla Text`: the Bangla version to show when Bangla is selected
- `Notes`: internal explanation for admins
- `Active`: controls whether this translation is used

### What a translation key means

Examples:

- `common.wishlist`
- `common.language`
- `search.placeholder`
- `home.top_brands`
- `content.category.electronics.name`
- `content.brand.apple.name`

The `Key` is for the system.
The `English Text` and `Bangla Text` are for the customer.

## 11. How To Translate Any English Word Into Bangla

### Example 1: Translate a simple word

Goal:

- English: `Language`
- Bangla: `ভাষা`

Steps:

1. Go to `Translations`.
2. Search for `Language` or search the key `common.language`.
3. Click edit.
4. Keep `English Text` as `Language`.
5. Enter `ভাষা` in `Bangla Text`.
6. Make sure `Active` is enabled.
7. Save.
8. Refresh the storefront and switch the language to Bangla.

### Example 2: Translate a phrase

Goal:

- English: `Wish List`
- Bangla: `পছন্দের তালিকা`

Steps:

1. Open `Translations`.
2. Search for `Wish List` or `common.wishlist`.
3. Edit the record.
4. Update `Bangla Text` to `পছন্দের তালিকা`.
5. Save.

### Example 3: Translate a homepage sentence

Goal:

- English: `Top Brands`
- Bangla: `সেরা ব্র্যান্ড`

Steps:

1. Open `Translations`.
2. Search for `Top Brands` or `home.top_brands`.
3. Edit the row.
4. Write the Bangla value.
5. Save and refresh the storefront.

## 12. How To Add a New Translation

If a text is missing from Bangla mode, create a new translation entry.

### Add a new general text

1. Open `Translations`.
2. Click `Add Translation`.
3. Fill the fields:
   - `Key`: for example `common.contact_us`
   - `Group`: for example `common`
   - `English Text`: `Contact Us`
   - `Bangla Text`: `যোগাযোগ করুন`
   - `Notes`: `Header or footer contact link`
   - `Active`: enabled
4. Save.

### Add a translation for a category

If the category slug is `electronics`, use:

- `Key`: `content.category.electronics.name`
- `Group`: `content`
- `English Text`: `Electronics`
- `Bangla Text`: `ইলেকট্রনিক্স`

### Add a translation for a brand

If the brand slug is `apple`, use:

- `Key`: `content.brand.apple.name`
- `Group`: `content`
- `English Text`: `Apple`
- `Bangla Text`: `অ্যাপল`

Important:

- the key must match the category or brand slug exactly
- do not use spaces in keys
- use lowercase and dots as shown in the examples

## 13. Translation Rules for Better Results

Follow these rules when entering Bangla text:

- keep meaning accurate, not just word-by-word
- use simple, natural Bangla
- keep brand names unchanged unless there is an accepted Bangla form
- keep product model numbers exactly the same
- keep placeholders such as `:query` or `:category` unchanged
- do not remove punctuation if it affects meaning

### Placeholder rule

If English contains:

- `Results for ":query"`

Then Bangla should also keep `:query`, for example:

- `":query" এর ফলাফল`

Do not translate `:query` itself.

## 14. Recommended Translation Workflow For Clients

Use this workflow:

1. Change the website language to Bangla.
2. Browse the page and note any English text still visible.
3. Open `Translations`.
4. Search by the visible English text.
5. If found, edit the Bangla value.
6. If not found, create a new translation entry.
7. Refresh the storefront and verify the result.

This is the safest method for non-technical users.

## 15. Suggested Group Names

Use group names to keep the translation page organized.

Recommended groups:

- `common`: shared buttons, labels, header, footer
- `home`: homepage text
- `search`: search box and search results
- `storefront`: customer-facing navigation and account items
- `content`: categories and brands

## 16. Common Mistakes To Avoid

- do not change the translation key randomly
- do not use spaces inside keys
- do not disable a translation unless you want fallback behavior
- do not delete entries unless you are sure they are unused
- do not translate placeholders like `:query`
- do not change category or brand keys if the slug is different

## 17. If the Translation Page Does Not Work

If the `Translations` section is unavailable or shows a message that the table is missing, the latest database migration has not been applied yet.

A developer should run:

```bash
php artisan migrate
```

If the page loads but changes are not visible:

1. Save the translation again.
2. Refresh the page.
3. Clear browser cache if needed.
4. If the site uses production assets, make sure the latest frontend build has been deployed.

## 18. Daily Admin Checklist

- review new orders
- verify banners and homepage content
- update stock-sensitive products
- check coupons and expiry dates
- moderate reviews
- switch to Bangla mode and verify important storefront text

## 19. Quick Translation Examples

| English | Bangla | Suggested Key |
|---|---|---|
| Home | হোম | `common.home` |
| Language | ভাষা | `common.language` |
| Wish List | পছন্দের তালিকা | `common.wishlist` |
| Search | খুঁজুন | `common.search` |
| Top Brands | সেরা ব্র্যান্ড | `home.top_brands` |
| See All | সব দেখুন | `home.see_all` |
| Support Center | সাপোর্ট সেন্টার | `common.support_center` |
| New Arrivals | নতুন এসেছে | `home.new_arrivals` |

## 20. Support Notes For Technical Team

This guide is written for client users. If the client reports one of the following, a developer should check the system:

- missing `Translations` menu
- SQL error for `translations` table
- saved translation not appearing on storefront
- outdated header UI after deployment
- English text still visible although Bangla value exists

## File Location

This guide is stored at:

- [docs/CLIENT_USER_GUIDE.md](/home/ilhaan/Downloads/dashboard/docs/CLIENT_USER_GUIDE.md)

