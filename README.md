# Banglar Biriyani — Frontend

React 19 + Vite + Tailwind CSS v4. "Dhakai Red" theme: bold chili red on clean white,
torn-paper edges, turmeric-yellow accents and big Bangla headlines.

## চালানোর নিয়ম

```bash
npm install
npm run dev
```

ব্রাউজারে খুলুন: http://localhost:5173

মেনু, অর্ডার আর লগইনের জন্য backend (`D:\Banglar_Biriyani_backend`) পোর্ট 3001-এ চালু থাকতে হবে।
`/api` দিয়ে শুরু হওয়া সব request স্বয়ংক্রিয়ভাবে সেখানে যায় (`vite.config.ts` দেখুন)।
Backend বন্ধ থাকলেও হোমপেজ নমুনা মেনু দিয়ে দেখা যাবে।

Production build:

```bash
npm run build
```

## থিম কোথায় বদলাবেন

সব রঙ, ফন্ট আর shadow আছে `src/index.css`-এর `@theme` ব্লকে:

| টোকেন | রঙ | কাজ |
| --- | --- | --- |
| `brand` | `#d6131e` | মূল লাল: বোতাম, দাম, লাল প্যানেল |
| `maroon` | `#8c0a12` | গাঢ় লাল: active ট্যাব, ব্যাজ |
| `saffron` | `#ffc21a` | হলুদ accent: স্টিকার, CTA ব্যান্ড |
| `chili` | `#e0590b` | সতর্কতা, কম স্টক |
| `alabaster` | `#fffaf7` | পেজের পটভূমি |

ফন্ট: Anek Bangla (শিরোনাম), Galada (হাতে লেখা বাংলা), Manrope ও Hind Siliguri (লেখা)।

ছেঁড়া কাগজের ধার: `src/components/TornEdge.tsx`।

লোগো: `public/logo.png` (পূর্ণ) এবং `public/logo-mark.png` (গোল, header ও favicon)।

## টেস্ট ও GitHub Actions

| কমান্ড | কী করে |
| --- | --- |
| `npm test` | Cart-এর হিসাব, মেনু কার্ড, Hero আর `.env` সুরক্ষার টেস্ট |
| `npm run typecheck` | TypeScript-এ ভুল আছে কিনা |
| `npm run build` | production build তৈরি হয় কিনা |

`verify.bat`-এ ডাবল-ক্লিক করলে তিনটাই একসাথে আপনার কম্পিউটারে চলে।
GitHub-এ প্রতিটা push-এ একই চেক চলে (`.github/workflows/ci.yml`), ফলাফল রিপোর `Actions` ট্যাবে দেখা যায়।
