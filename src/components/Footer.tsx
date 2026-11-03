const SOCIALS = ["ফেসবুক", "ইনস্টাগ্রাম", "ইউটিউব"]
const LINKS = [
  { label: "মেনু", href: "#menu" },
  { label: "কীভাবে অর্ডার করবেন", href: "#how-to-order" },
  { label: "ডেলিভারি এলাকা", href: "#delivery-zones" },
  { label: "মিল প্ল্যান", href: "#meal" },
]

export function Footer() {
  return (
    <footer className="relative bg-brand text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(#fff 1.5px, transparent 1.5px)",
          backgroundSize: "18px 18px",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-4 rounded-3xl border-2 border-white bg-gold p-5 text-charcoal shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm">খিদে পেয়েছে?</p>
            <p className="text-xl font-extrabold sm:text-2xl">আজ রাতে শাহী কিছু খেতে চান?</p>
          </div>
          <a
            href="#menu"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-7 text-sm font-semibold text-white transition hover:bg-brand-hover sm:w-auto"
          >
            অর্ডার করুন
          </a>
        </div>

        <div className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-2xl font-extrabold">বাংলার বিরিয়ানি</p>
            <p className="mt-3 max-w-xs text-sm text-white/85">
              পুরোনো ঢাকার ধাঁচের বিরিয়ানি, সিল করা হাঁড়িতে ধীরে রান্না, ড্যাফোডিল স্মার্ট সিটি ও
              সাভারের সবখানে গরম গরম ডেলিভারি।
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-gold">এক্সপ্লোর</p>
            <ul className="mt-3 space-y-2 text-sm">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-white/90 hover:text-white hover:underline">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold text-gold">যোগাযোগ</p>
            <ul className="mt-3 space-y-2 text-sm text-white/90">
              <li>ড্যাফোডিল স্মার্ট সিটির পাশে, বিরুলিয়া, সাভার, ঢাকা-১২১৬</li>
              <li>
                <a href="tel:+8809612000000" className="hover:text-white">
                  +880 9612-000000
                </a>
              </li>
              <li className="break-all">
                <a href="mailto:hello@banglarbiriyani.com" className="hover:text-white">
                  hello@banglarbiriyani.com
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold text-gold">খোলার সময়</p>
            <p className="mt-3 text-sm text-white/90">শনি – বৃহস্পতিবার: সকাল ১১টা – রাত ১১টা</p>
            <p className="text-sm text-white/90">শুক্রবার: দুপুর ২টা – রাত ১১টা</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {SOCIALS.map((s) => (
                <li key={s}>
                  <a
                    href="#"
                    className="inline-flex h-10 items-center rounded-full border border-white/40 px-4 text-sm transition hover:bg-white hover:text-brand"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/25 py-5 text-xs text-white/85">
          © ২০২৬ বাংলার বিরিয়ানি। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  )
}
