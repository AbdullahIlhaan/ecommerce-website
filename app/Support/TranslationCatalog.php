<?php

namespace App\Support;

class TranslationCatalog
{
    public static function defaults(): array
    {
        return [
            ['translation_key' => 'common.home', 'group_name' => 'common', 'english_text' => 'Home', 'bangla_text' => 'হোম', 'notes' => 'Top navigation home link.', 'is_active' => true],
            ['translation_key' => 'common.support_center', 'group_name' => 'common', 'english_text' => 'Support Center', 'bangla_text' => 'সাপোর্ট সেন্টার', 'notes' => 'Top header support link.', 'is_active' => true],
            ['translation_key' => 'common.wishlist', 'group_name' => 'common', 'english_text' => 'Wish List', 'bangla_text' => 'পছন্দের তালিকা', 'notes' => 'Wishlist label in the storefront header.', 'is_active' => true],
            ['translation_key' => 'common.language', 'group_name' => 'common', 'english_text' => 'Language', 'bangla_text' => 'ভাষা', 'notes' => 'Language picker label.', 'is_active' => true],
            ['translation_key' => 'common.search', 'group_name' => 'common', 'english_text' => 'Search', 'bangla_text' => 'খুঁজুন', 'notes' => 'Generic search button label.', 'is_active' => true],
            ['translation_key' => 'common.categories', 'group_name' => 'common', 'english_text' => 'Categories', 'bangla_text' => 'ক্যাটাগরি', 'notes' => 'Shared categories heading.', 'is_active' => true],
            ['translation_key' => 'common.view_all', 'group_name' => 'common', 'english_text' => 'View All', 'bangla_text' => 'সব দেখুন', 'notes' => 'Generic view all call-to-action.', 'is_active' => true],
            ['translation_key' => 'common.sign_in', 'group_name' => 'common', 'english_text' => 'Sign In', 'bangla_text' => 'সাইন ইন', 'notes' => 'Login call-to-action.', 'is_active' => true],
            ['translation_key' => 'common.dashboard', 'group_name' => 'common', 'english_text' => 'Dashboard', 'bangla_text' => 'ড্যাশবোর্ড', 'notes' => 'Dashboard label.', 'is_active' => true],
            ['translation_key' => 'common.my_account', 'group_name' => 'common', 'english_text' => 'My Account', 'bangla_text' => 'আমার অ্যাকাউন্ট', 'notes' => 'Account call-to-action.', 'is_active' => true],
            ['translation_key' => 'common.company', 'group_name' => 'common', 'english_text' => 'Company', 'bangla_text' => 'কোম্পানি', 'notes' => 'Footer company section heading.', 'is_active' => true],
            ['translation_key' => 'common.support', 'group_name' => 'common', 'english_text' => 'Support', 'bangla_text' => 'সহায়তা', 'notes' => 'Footer support section heading.', 'is_active' => true],
            ['translation_key' => 'common.follow_us', 'group_name' => 'common', 'english_text' => 'Follow Us', 'bangla_text' => 'আমাদের অনুসরণ করুন', 'notes' => 'Footer social section heading.', 'is_active' => true],
            ['translation_key' => 'common.payment', 'group_name' => 'common', 'english_text' => 'Payment', 'bangla_text' => 'পেমেন্ট', 'notes' => 'Footer payment section heading.', 'is_active' => true],
            ['translation_key' => 'common.about_us', 'group_name' => 'common', 'english_text' => 'About Us', 'bangla_text' => 'আমাদের সম্পর্কে', 'notes' => 'Footer about link.', 'is_active' => true],
            ['translation_key' => 'common.help_center', 'group_name' => 'common', 'english_text' => 'Help Center', 'bangla_text' => 'হেল্প সেন্টার', 'notes' => 'Footer help center link.', 'is_active' => true],
            ['translation_key' => 'common.refund_policy', 'group_name' => 'common', 'english_text' => 'Refund Policy', 'bangla_text' => 'রিফান্ড নীতি', 'notes' => 'Footer refund policy link.', 'is_active' => true],
            ['translation_key' => 'common.privacy_policy', 'group_name' => 'common', 'english_text' => 'Privacy Policy', 'bangla_text' => 'গোপনীয়তা নীতি', 'notes' => 'Footer privacy link.', 'is_active' => true],
            ['translation_key' => 'common.terms_conditions', 'group_name' => 'common', 'english_text' => 'Terms & Conditions', 'bangla_text' => 'শর্তাবলি', 'notes' => 'Footer terms link.', 'is_active' => true],
            ['translation_key' => 'common.no_categories', 'group_name' => 'common', 'english_text' => 'No categories available.', 'bangla_text' => 'কোনো ক্যাটাগরি পাওয়া যায়নি।', 'notes' => 'Fallback category empty state.', 'is_active' => true],
            ['translation_key' => 'common.limited_offer', 'group_name' => 'common', 'english_text' => 'Limited Offer', 'bangla_text' => 'সীমিত অফার', 'notes' => 'Small promo badge copy.', 'is_active' => true],

            ['translation_key' => 'storefront.browse_futurebd', 'group_name' => 'storefront', 'english_text' => 'Browse FutureBD', 'bangla_text' => 'ফিউচারবিডি ব্রাউজ করুন', 'notes' => 'Mobile drawer title.', 'is_active' => true],
            ['translation_key' => 'storefront.admin_dashboard', 'group_name' => 'storefront', 'english_text' => 'Admin Dashboard', 'bangla_text' => 'অ্যাডমিন ড্যাশবোর্ড', 'notes' => 'Account dropdown entry.', 'is_active' => true],
            ['translation_key' => 'storefront.my_orders', 'group_name' => 'storefront', 'english_text' => 'My Orders', 'bangla_text' => 'আমার অর্ডার', 'notes' => 'Account dropdown entry.', 'is_active' => true],
            ['translation_key' => 'storefront.account_settings', 'group_name' => 'storefront', 'english_text' => 'Account Settings', 'bangla_text' => 'অ্যাকাউন্ট সেটিংস', 'notes' => 'Account dropdown entry.', 'is_active' => true],
            ['translation_key' => 'storefront.log_out', 'group_name' => 'storefront', 'english_text' => 'Log Out', 'bangla_text' => 'লগ আউট', 'notes' => 'Account dropdown entry.', 'is_active' => true],
            ['translation_key' => 'storefront.all_countries', 'group_name' => 'storefront', 'english_text' => 'All Countries', 'bangla_text' => 'সব দেশ', 'notes' => 'Search country selector option.', 'is_active' => true],
            ['translation_key' => 'storefront.country_china', 'group_name' => 'storefront', 'english_text' => 'China', 'bangla_text' => 'চীন', 'notes' => 'Search country selector option.', 'is_active' => true],
            ['translation_key' => 'storefront.country_bangladesh', 'group_name' => 'storefront', 'english_text' => 'Bangladesh', 'bangla_text' => 'বাংলাদেশ', 'notes' => 'Search country selector option.', 'is_active' => true],
            ['translation_key' => 'storefront.explore_all', 'group_name' => 'storefront', 'english_text' => 'Explore All', 'bangla_text' => 'সব দেখুন', 'notes' => 'Mega menu category link.', 'is_active' => true],

            ['translation_key' => 'search.placeholder', 'group_name' => 'search', 'english_text' => 'Search for products, brands and more...', 'bangla_text' => 'পণ্য, ব্র্যান্ড এবং আরও অনেক কিছু খুঁজুন...', 'notes' => 'Storefront search placeholder.', 'is_active' => true],
            ['translation_key' => 'search.smart_title', 'group_name' => 'search', 'english_text' => 'Smart Search', 'bangla_text' => 'স্মার্ট সার্চ', 'notes' => 'Search suggestion dropdown heading.', 'is_active' => true],
            ['translation_key' => 'search.searching', 'group_name' => 'search', 'english_text' => 'Looking for the best matches...', 'bangla_text' => 'সেরা মিলগুলো খোঁজা হচ্ছে...', 'notes' => 'Search loading state.', 'is_active' => true],
            ['translation_key' => 'search.results_for', 'group_name' => 'search', 'english_text' => 'Results for ":query"', 'bangla_text' => '":query" এর ফলাফল', 'notes' => 'Search results intro. Supports :query.', 'is_active' => true],
            ['translation_key' => 'search.see_all', 'group_name' => 'search', 'english_text' => 'See all', 'bangla_text' => 'সব দেখুন', 'notes' => 'Search dropdown full results button.', 'is_active' => true],
            ['translation_key' => 'search.in_stock', 'group_name' => 'search', 'english_text' => 'In stock', 'bangla_text' => 'স্টকে আছে', 'notes' => 'Search result stock badge.', 'is_active' => true],
            ['translation_key' => 'search.out_of_stock', 'group_name' => 'search', 'english_text' => 'Out of stock', 'bangla_text' => 'স্টক নেই', 'notes' => 'Search result stock badge.', 'is_active' => true],
            ['translation_key' => 'search.no_matches_title', 'group_name' => 'search', 'english_text' => 'No direct matches found', 'bangla_text' => 'সরাসরি কোনো মিল পাওয়া যায়নি', 'notes' => 'Search dropdown empty title.', 'is_active' => true],
            ['translation_key' => 'search.no_matches_description', 'group_name' => 'search', 'english_text' => 'Try a different keyword, brand name, SKU, or continue to the full results page.', 'bangla_text' => 'অন্য কীওয়ার্ড, ব্র্যান্ড নাম বা SKU দিয়ে চেষ্টা করুন, অথবা পুরো ফলাফলের পাতায় যান।', 'notes' => 'Search dropdown empty description.', 'is_active' => true],

            ['translation_key' => 'home.highlight_easy_title', 'group_name' => 'home', 'english_text' => 'Easy to Use', 'bangla_text' => 'ব্যবহার করা খুবই সহজ', 'notes' => 'Home page highlight card title.', 'is_active' => true],
            ['translation_key' => 'home.highlight_easy_description', 'group_name' => 'home', 'english_text' => 'Surf, select, and purchase. It\'s that easy to do cross border shopping now.', 'bangla_text' => 'ব্রাউজ করুন, পছন্দ করুন, কিনুন। এখন সীমান্তপারের কেনাকাটা এতটাই সহজ।', 'notes' => 'Home page highlight card description.', 'is_active' => true],
            ['translation_key' => 'home.highlight_delivery_title', 'group_name' => 'home', 'english_text' => 'Fastest Delivery', 'bangla_text' => 'দ্রুততম ডেলিভারি', 'notes' => 'Home page highlight card title.', 'is_active' => true],
            ['translation_key' => 'home.highlight_delivery_description', 'group_name' => 'home', 'english_text' => 'Doorstep delivery of cross border trade products in 25 days.', 'bangla_text' => 'সীমান্তপারের পণ্য ২৫ দিনের মধ্যে আপনার দরজায় পৌঁছে যায়।', 'notes' => 'Home page highlight card description.', 'is_active' => true],
            ['translation_key' => 'home.highlight_support_title', 'group_name' => 'home', 'english_text' => 'Best Support', 'bangla_text' => 'সেরা সাপোর্ট', 'notes' => 'Home page highlight card title.', 'is_active' => true],
            ['translation_key' => 'home.highlight_support_description', 'group_name' => 'home', 'english_text' => 'Feel free to contact us via call, live chat, and Facebook.', 'bangla_text' => 'কল, লাইভ চ্যাট এবং ফেসবুকের মাধ্যমে যেকোনো সময় যোগাযোগ করুন।', 'notes' => 'Home page highlight card description.', 'is_active' => true],
            ['translation_key' => 'home.highlight_refund_title', 'group_name' => 'home', 'english_text' => 'Trusted Refund Policy', 'bangla_text' => 'নির্ভরযোগ্য রিফান্ড নীতি', 'notes' => 'Home page highlight card title.', 'is_active' => true],
            ['translation_key' => 'home.highlight_refund_description', 'group_name' => 'home', 'english_text' => 'Shop without hesitation as you are covered by refund policy.', 'bangla_text' => 'নিশ্চিন্তে কেনাকাটা করুন, কারণ আপনি রিফান্ড নীতির আওতায় আছেন।', 'notes' => 'Home page highlight card description.', 'is_active' => true],
            ['translation_key' => 'home.top_brands', 'group_name' => 'home', 'english_text' => 'Top Brands', 'bangla_text' => 'সেরা ব্র্যান্ড', 'notes' => 'Home page brands section title.', 'is_active' => true],
            ['translation_key' => 'home.see_all', 'group_name' => 'home', 'english_text' => 'See All', 'bangla_text' => 'সব দেখুন', 'notes' => 'Home page generic see all link.', 'is_active' => true],
            ['translation_key' => 'home.flash_sale_badge', 'group_name' => 'home', 'english_text' => 'Flash Sale', 'bangla_text' => 'ফ্ল্যাশ সেল', 'notes' => 'Home page flash sale badge.', 'is_active' => true],
            ['translation_key' => 'home.limited_time_deals', 'group_name' => 'home', 'english_text' => 'Limited Time Deals', 'bangla_text' => 'সীমিত সময়ের অফার', 'notes' => 'Home page flash sale heading.', 'is_active' => true],
            ['translation_key' => 'home.flash_sale_description', 'group_name' => 'home', 'english_text' => 'Grab your favorites before they\'re gone!', 'bangla_text' => 'আপনার পছন্দের পণ্য শেষ হওয়ার আগেই নিয়ে নিন!', 'notes' => 'Home page flash sale subheading.', 'is_active' => true],
            ['translation_key' => 'home.countdown_hours', 'group_name' => 'home', 'english_text' => 'H', 'bangla_text' => 'ঘ', 'notes' => 'Flash sale countdown label.', 'is_active' => true],
            ['translation_key' => 'home.countdown_minutes', 'group_name' => 'home', 'english_text' => 'M', 'bangla_text' => 'মি', 'notes' => 'Flash sale countdown label.', 'is_active' => true],
            ['translation_key' => 'home.countdown_seconds', 'group_name' => 'home', 'english_text' => 'S', 'bangla_text' => 'সে', 'notes' => 'Flash sale countdown label.', 'is_active' => true],
            ['translation_key' => 'home.trending_now', 'group_name' => 'home', 'english_text' => 'Trending Now', 'bangla_text' => 'এখন ট্রেন্ডিং', 'notes' => 'Home page trending section title.', 'is_active' => true],
            ['translation_key' => 'home.trending_description', 'group_name' => 'home', 'english_text' => 'The most popular picks from our community', 'bangla_text' => 'আমাদের গ্রাহকদের সবচেয়ে জনপ্রিয় পছন্দগুলো', 'notes' => 'Home page trending section description.', 'is_active' => true],
            ['translation_key' => 'home.discover_more', 'group_name' => 'home', 'english_text' => 'Discover More', 'bangla_text' => 'আরও দেখুন', 'notes' => 'Home page trending section link.', 'is_active' => true],
            ['translation_key' => 'home.new_arrivals', 'group_name' => 'home', 'english_text' => 'New Arrivals', 'bangla_text' => 'নতুন এসেছে', 'notes' => 'Home page latest products heading.', 'is_active' => true],
            ['translation_key' => 'home.new_arrivals_description', 'group_name' => 'home', 'english_text' => 'Explore our latest products from global brands', 'bangla_text' => 'গ্লোবাল ব্র্যান্ডের নতুন পণ্যগুলো ঘুরে দেখুন', 'notes' => 'Home page latest products description.', 'is_active' => true],
            ['translation_key' => 'home.no_products', 'group_name' => 'home', 'english_text' => 'No products found.', 'bangla_text' => 'কোনো পণ্য পাওয়া যায়নি।', 'notes' => 'Home page empty product state.', 'is_active' => true],
            ['translation_key' => 'home.chat_whatsapp', 'group_name' => 'home', 'english_text' => 'Chat on WhatsApp', 'bangla_text' => 'হোয়াটসঅ্যাপে চ্যাট করুন', 'notes' => 'WhatsApp floating button label.', 'is_active' => true],
            ['translation_key' => 'home.up_to_off', 'group_name' => 'home', 'english_text' => 'Up to 40% off on :category', 'bangla_text' => ':category এ সর্বোচ্চ ৪০% ছাড়', 'notes' => 'Mega menu promo line. Supports :category.', 'is_active' => true],
        ];
    }
}
