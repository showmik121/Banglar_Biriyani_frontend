// All site photos in one place. Swap any of these for your own restaurant photos
// (put files in /public and use e.g. "/photos/kacchi.jpg").
// Current images are free Unsplash photos of biryani.

export const unsplash = (id: string, w = 800, h = 600) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=${w}&h=${h}`

export const PHOTO_IDS = {
  platterRedCloth: "photo-1633945274405-b6c8069047b0",
  plateRedCloth: "photo-1633945274309-2c16c9682a8c",
  bowlRiceMeat: "photo-1631515243349-e0cb75fb8d3a",
  plateWhite: "photo-1589302168068-964664d93dc0",
  servingChicken: "photo-1782541370275-6761522e39d1",
  panDum: "photo-1697155406055-2db32d47ca07",
  spooning: "photo-1705174299330-939dd03cc864",
  twoPlates: "photo-1563379091339-03b21ab4a4f8",
  pilafMeat: "photo-1774669063671-1f34847a661d",
  plateMeat: "photo-1716550781939-beb7d7247aae",
  plateMeat2: "photo-1719239885399-f87d992e0f18",
  twoBowls: "photo-1771796992969-05bb88a0516a",
  spices: "photo-1716816211590-c15a328a5ff0",
} as const

export const PHOTOS = {
  hero: unsplash(PHOTO_IDS.platterRedCloth, 1000, 1000),
  promise: {
    dum: unsplash(PHOTO_IDS.panDum, 200, 200),
    fresh: unsplash(PHOTO_IDS.servingChicken, 200, 200),
    spices: unsplash(PHOTO_IDS.spices, 200, 200),
    delivery: unsplash(PHOTO_IDS.twoPlates, 200, 200),
  },
  about: unsplash(PHOTO_IDS.plateMeat, 900, 1050),
  aboutInset: unsplash(PHOTO_IDS.spices, 400, 400),
  steps: [
    unsplash(PHOTO_IDS.twoBowls, 700, 420),
    unsplash(PHOTO_IDS.plateMeat2, 700, 420),
    unsplash(PHOTO_IDS.spooning, 700, 420),
  ],
  cta: unsplash(PHOTO_IDS.bowlRiceMeat, 500, 500),
}
