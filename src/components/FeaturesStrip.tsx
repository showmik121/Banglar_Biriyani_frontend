const FEATURES = [
  { image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=160&h=160&q=75", title: "দমে রান্না", text: "সিল করা হাঁড়িতে ঘণ্টার পর ঘণ্টা ধীরে রান্না" },
  { image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=160&h=160&q=75", title: "প্রতিদিন তাজা", text: "প্রতিদিন সকালে নতুন করে রান্না" },
  { image: "https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?auto=format&fit=crop&w=160&h=160&q=75", title: "খাঁটি ঘি ও মশলা", text: "পুরোনো বাসমতি, খাঁটি ঘি ও আস্ত মশলা" },
  { image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=160&h=160&q=75", title: "ফ্রি ডেলিভারি", text: "ডিআইইউ ক্যাম্পাস, হোস্টেল ও আশুলিয়ায় গরম গরম ডেলিভারি" },
]

export function FeaturesStrip() {
  return (
    <section aria-label="আমাদের বিশেষত্ব" className="relative bg-brand text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(#fff 1.5px, transparent 1.5px)",
          backgroundSize: "18px 18px",
        }}
        aria-hidden
      />
      <ul className="relative mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-8 min-[480px]:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-8 lg:px-8 lg:py-10">
        {FEATURES.map((f) => (
          <li key={f.title} className="flex items-center gap-4">
            <img
              src={f.image}
              alt=""
              loading="lazy"
              width={80}
              height={80}
              className="size-16 shrink-0 rounded-full border-[3px] border-gold bg-white object-cover shadow-lg shadow-black/20 sm:size-20"
            />
            <div className="min-w-0">
              <p className="text-base font-bold text-white sm:text-lg">{f.title}</p>
              <p className="mt-0.5 text-sm text-white/85">{f.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
