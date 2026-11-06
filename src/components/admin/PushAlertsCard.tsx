import { useLang } from "../../context/LanguageContext"
import { btnPrimary, btnSecondary } from "./adminApi"
import { usePushNotifications } from "./usePushNotifications"

const isIphone = () => typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent)

/** Lets the owner turn on phone notifications for new orders (works with the admin page closed). */
export function PushAlertsCard({ embedded = false }: { embedded?: boolean }) {
  const { tr } = useLang()
  const { state, busy, error, testResult, enable, disable, sendTest } = usePushNotifications()

  const box = embedded ? "rounded-xl bg-alabaster p-3 ring-1 ring-line" : "mb-4 rounded-xl border border-line bg-white p-3"
  const wide = embedded ? "w-full" : "w-full sm:w-auto"
  if (state === "checking") return null
  if (state === "unsupported") {
    // iPhones only allow notifications for a site added to the Home Screen
    return isIphone() ? (
      <section className={`${box} text-sm text-slate`}>
        {tr(
          "To get notifications on iPhone: in Safari tap Share → Add to Home Screen, then open Admin from the Home Screen icon.",
          "iPhone-এ নোটিফিকেশন পেতে: Safari-তে Share → Add to Home Screen চাপুন, তারপর হোম স্ক্রিনের আইকন থেকে অ্যাডমিন খুলুন।",
        )}
      </section>
    ) : null
  }

  return (
    <section aria-label={tr("Phone notifications", "ফোন নোটিফিকেশন")} className={box}>
      <div className="flex flex-wrap items-center gap-3">
        <p className="min-w-0 flex-1 text-sm text-charcoal">
          {state === "on" && (
            <>
              {tr("Phone notifications are on. New orders ring this phone even when the page is closed.", "ফোন নোটিফিকেশন চালু আছে। পেজ বন্ধ থাকলেও নতুন অর্ডারে এই ফোন বাজবে।")}
            </>
          )}
          {state === "off" && (
            <>
              {tr("Get a notification on this phone for every new order, even when the page is closed.", "পেজ বন্ধ থাকলেও প্রতিটি নতুন অর্ডারে এই ফোনে নোটিফিকেশন পান।")}
            </>
          )}
          {state === "blocked" &&
            tr(
              "Notifications are blocked for this site. Allow them in the browser's site settings, then come back.",
              "এই সাইটের নোটিফিকেশন বন্ধ করা আছে। ব্রাউজারের সাইট সেটিংসে অনুমতি দিয়ে ফিরে আসুন।",
            )}
        </p>
        {state === "off" && (
          <button type="button" onClick={enable} disabled={busy} className={`${btnPrimary} ${wide}`}>
            {busy ? tr("Turning on…", "চালু হচ্ছে…") : tr("Turn on phone notifications", "ফোনে নোটিফিকেশন চালু করুন")}
          </button>
        )}
        {state === "on" && (
          <div className={`flex gap-2 ${wide}`}>
            <button type="button" onClick={sendTest} disabled={busy} className={`${btnSecondary} flex-1 ${embedded ? "" : "sm:flex-none"}`}>
              {tr("Send a test", "টেস্ট পাঠান")}
            </button>
            <button type="button" onClick={disable} disabled={busy} className={`${btnSecondary} flex-1 ${embedded ? "" : "sm:flex-none"}`}>
              {tr("Turn off", "বন্ধ করুন")}
            </button>
          </div>
        )}
      </div>
      {testResult && (
        <p role="status" className="mt-2 text-sm text-slate">
          {testResult}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </section>
  )
}
