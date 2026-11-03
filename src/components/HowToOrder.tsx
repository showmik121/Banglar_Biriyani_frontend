const STEPS = [
  {
    n: "০১",
    title: "পছন্দের খাবার বেছে নিন",
    text: "মেনু ঘুরে আপনার প্রিয় আইটেম কার্টে যোগ করুন।",
    image:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=70",
  },
  {
    n: "০২",
    title: "অর্ডার করুন",
    text: "চেকআউটে ঠিকানা দিন এবং ক্যাশ বা অনলাইনে পেমেন্ট করুন।",
    image:
      "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=70",
  },
  {
    n: "০৩",
    title: "গরম গরম উপভোগ করুন",
    text: "হাঁড়ি থেকে সরাসরি প্যাক করে আপনার দরজায় পৌঁছে দিই।",
    image:
      "https://images.unsplash.com/photo-1589778655375-3e622a9fc91c?auto=format&fit=crop&w=800&q=70",
  },
]

export function HowToOrder() {
  return (
    <section id="how-to-order" className="bg-cream px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs font-bold text-brand uppercase">কীভাবে অর্ডার করবেন</p>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">অর্ডার করুন সহজে</h2>
          <p className="mt-2 text-sm text-slate">তিন ধাপেই পৌঁছে যাবে বিরিয়ানি</p>
          <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-brand" aria-hidden />
        </div>
        <ol className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              className={`overflow-hidden rounded-2xl border border-line bg-white p-3 shadow-card ${
                i === 2
                  ? "sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-md lg:col-span-1 lg:max-w-none"
                  : ""
              }`}
            >
              <img
                src={s.image}
                alt=""
                loading="lazy"
                className="h-40 w-full rounded-xl object-cover sm:h-44"
              />
              <div className="relative px-2 pt-8 pb-3">
                <span className="absolute -top-6 left-2 flex size-12 items-center justify-center rounded-full border-4 border-white bg-brand text-sm font-bold text-white">
                  {s.n}
                </span>
                <h3 className="text-base font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-slate">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
