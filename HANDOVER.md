# Banglar Biriyani — হস্তান্তর নির্দেশিকা

এই ফাইলে আছে ওয়েবসাইটটা কোথায় চলে, কে কী চালায়, আর রেস্টুরেন্ট মালিকের নিয়মিত কাজগুলো কীভাবে করবেন।

## ১. সাইট কীভাবে সাজানো

| অংশ | কোথায় চলে | কোড কোথায় |
| --- | --- | --- |
| ওয়েবসাইট (ক্রেতারা যা দেখে) | Netlify, https://banglarbiriyani.netlify.app | GitHub: `Banglar_Biriyani_frontend` |
| API (অর্ডার, লগইন, মেনু) | Supabase Edge Function `api` | GitHub: `Banglar_Biriyani_backend` |
| অর্ডারের ইমেইল | Brevo (ফ্রি প্ল্যানে দিনে ৩০০টা) | — |

ক্রেতার ব্রাউজার শুধু Netlify-র ঠিকানায় যায়। `/api` দিয়ে শুরু হওয়া অনুরোধ Netlify নিজে Supabase-এ পাঠিয়ে দেয় (`public/_redirects` ফাইল)।

কোডে নতুন কিছু `main` ব্রাঞ্চে push করলে GitHub Actions নিজে টেস্ট চালায়। backend-এর টেস্ট পাস হলে Supabase-এ নিজে থেকে ডিপ্লয় হয়, আর Netlify frontend নতুন করে বানায়।

## ২. অ্যাকাউন্ট ও গোপন তথ্য (গোপন তথ্য এই ফাইলে বা কোডে কখনো লিখবেন না)

| কী | কোথায় থাকে |
| --- | --- |
| `SUPABASE_ACCESS_TOKEN` | GitHub → backend রিপো → Settings → Secrets → Actions |
| `DATABASE_URL`, `JWT_SECRET`, `BREVO_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME`, `SITE_URL`, `NODE_ENV=production` | Supabase → Edge Functions → Secrets |
| `ALLOWED_ORIGINS` (শুধু সাইটের ঠিকানা বদলালে, যেমন নিজের ডোমেইন) | Supabase → Edge Functions → Secrets |
| নিজের কম্পিউটারে চালানোর `.env` | শুধু ডেভেলপারের কম্পিউটারে। GitHub-এ যায় না |

**মালিকানা বুঝে নিন:** GitHub, Netlify, Supabase আর Brevo-র অ্যাকাউন্ট ক্লায়েন্টের নামে নিন, অথবা প্রজেক্টটা ক্লায়েন্টের অ্যাকাউন্টে স্থানান্তর (transfer) করুন। তারপর ওপরের গোপন তথ্যগুলো নতুন করে বসান আর পুরোনো key বাতিল করুন।

## ৩. মালিকের নিয়মিত কাজ

Admin প্যানেল: সাইটের ঠিকানার শেষে `/admin` লিখে লগইন করুন।

- **অর্ডার দেখা ও অবস্থা বদলানো:** Orders ট্যাব। অবস্থা বদলালে ক্রেতা (যিনি ইমেইল দিয়ে সাইন-আপ করেছেন) ইমেইল পান।
- **খাবার যোগ বা দাম বদলানো:** Menu ট্যাব।
- **৭ দিনের মেনু (দুপুর ও রাত):** Daily meals ট্যাব। দিন বাছুন, দুপুর আর রাতে প্রতিটায় ১২টা পর্যন্ত খাবার বসান, তারপর Save। প্রতি বেলার প্রথম খাবারটা "Special"।
- **অর্ডারের সময়:** আজকের জন্য দুপুরের অর্ডার নেওয়া হয় ১২টা থেকে ৪টা, রাতের অর্ডার ৬টা থেকে ১০টা (বাংলাদেশ সময়)। অন্য দিনের জন্য আগাম অর্ডার যেকোনো সময় করা যায়। সময় বদলাতে `src/i18n/mealTimes.ts`-এর `MEAL_HOURS` আর backend-এর `server/utils/mealWindows.ts`-এর `MEAL_WINDOWS` দুটোই একই রাখুন।
- **অফার ও ডেলিভারি পয়েন্ট:** Offers আর Delivery points ট্যাব।

## ৪. লাইভে যাওয়ার আগের চেকলিস্ট

- [ ] bKash/Nagad-এর আসল নম্বর `src/config/store.ts`-এ বসানো।
- [ ] Footer-এর ফোন নম্বর ও খোলার সময় ঠিক করা।
- [ ] আসল খাবারের ছবি দেওয়া।
- [ ] Admin পাসওয়ার্ড বদলানো (নিচে ৫ নম্বর)।
- [ ] নিজে একটা টেস্ট অর্ডার করে ইমেইল আসছে কি না দেখা, তারপর টেস্ট অর্ডার ও টেস্ট ইউজার মুছে ফেলা।
- [ ] Brevo-তে Sender ভেরিফাই করা আছে এবং সেখানে "API key IP blocking" বন্ধ আছে (Supabase-এর IP বদলায়)।

## ৫. Admin পাসওয়ার্ড বদলানো

1. backend ফোল্ডারের `.env` ফাইলে `NEW_ADMIN_PASSWORD=` লিখে নতুন পাসওয়ার্ড বসান (কমপক্ষে ১০ অক্ষর)। দরকার হলে `NEW_ADMIN_EMAIL` ও `NEW_ADMIN_PHONE`-ও দিতে পারেন।
2. `change-admin.bat`-এ ডাবল ক্লিক করুন। এতে অন্য সব ডেটা থাকে, শুধু admin-এর তথ্য বদলায় আর সে সব জায়গা থেকে সাইন-আউট হয়।
3. কাজ শেষে `.env` থেকে `NEW_ADMIN_PASSWORD` লাইনটা মুছে ফেলুন।

**সাবধান:** `npm run db:seed` কখনো লাইভ ডাটাবেসে চালাবেন না। এটা সব অ্যাকাউন্ট, অর্ডার আর মেনু মুছে দেয়। এখন এটা ডেটা থাকলে নিজে থেকে থেমে যায়, তবু `SEED_FORCE=true` কখনো লাইভ `.env`-এ দেবেন না।

## ৬. ডাটাবেসে ছোট আপডেট

`update-database.bat` (backend ফোল্ডার) চালালে নিরাপদ আপডেটগুলো (নতুন ইনডেক্স, মেয়াদ-শেষ সেশন মোছা ইত্যাদি) লাগে, কোনো ডেটা হারায় না। backend-এ ডাটাবেসের গঠন বদলানো হলে এই ফাইলটা একবার চালাতে হয়।

## ৭. কিছু ভেঙে গেলে

| সমস্যা | কী দেখবেন |
| --- | --- |
| সাইট খোলে না | Netlify → Deploys-এ শেষ ডিপ্লয় সফল কি না |
| মেনু বা অর্ডার লোড হয় না | https://banglarbiriyani.netlify.app/api/health খুলে `"status":"ok"` আসে কি না। না এলে Supabase → Edge Functions → api → Logs |
| ইমেইল যায় না | Supabase-এ `BREVO_API_KEY`, `EMAIL_FROM` আছে কি না; Brevo-তে Sender ভেরিফাই ও দৈনিক ৩০০ লিমিট |
| "Too many requests/attempts" | ভুল লগইন বা ভুল অর্ডার-নম্বর বারবার দিলে ১৫ মিনিট আটকে যায়। একটু পরে আবার চেষ্টা করুন |
| কোড বদলানোর পর কিছু ভেঙেছে | GitHub → Actions-এ কোন ধাপ ব্যর্থ হয়েছে দেখুন; আগের কমিটে ফিরে যাওয়া যায় |

## ৮. ফ্রি প্ল্যানের সীমা

Netlify, Supabase আর Brevo-র ফ্রি প্ল্যানে ব্যবহারের সীমা আছে (যেমন Brevo-তে দিনে ৩০০ ইমেইল)। অর্ডার অনেক বাড়লে সংশ্লিষ্ট সার্ভিসের ড্যাশবোর্ডে ব্যবহার দেখুন এবং দরকারে প্ল্যান বদলান।

## Browser tests (e2e)

`e2e.bat` runs Playwright tests in a real browser: sign up -> menu -> add to cart -> checkout -> the admin sees and confirms the order. They use a fake API (`e2e/fakeApi.ts`), so the live site and database are never touched. The result is saved to `e2e-log.txt` (`E2E_EXIT=0` = passed). They are not part of GitHub Actions.
