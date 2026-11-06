// All page copy lives here. Product claims: PRD sections 4 and 6. Review every diff.
export const site = {
  title: 'HushCast: Your Android screen in a browser, on your WiFi',
  description: 'HushCast shows your Android screen and sound in a browser on the same WiFi. No account, no cloud, no upload, no ads.',
  playSoon: 'Coming soon to Google Play',
  // The ONE place for the Google Play listing. Leave '' until the listing is live: every
  // acquisition link then shows release status instead of a link. Set the full https URL to switch
  // all of them on (hero, nav, availability section, mobile bar) at once.
  playUrl: '' as string,
  playCta: 'Get it on Google Play',
  address: '192.168.1.24:8080', // sample address, illustration only
  mdns: 'hushcast.local:8080',
  // TODO(Q1): final domain and support email. Placeholders until the owner answers.
  url: 'https://hushcast.example',
  email: 'TODO-support-email@hushcast.example',
  ogImage: '/og.png', // the final hero frame (tools/render-posters.mjs), 1200 x 630
};

export const nav = {
  logoLabel: 'HushCast, back to top',
  skip: 'Skip to content',
  links: [
    { href: '#film', label: 'Film' },
    { href: '#how', label: 'How it works' },
    { href: '#modes', label: 'Modes' },
    { href: '#privacy', label: 'Privacy' },
  ],
  get: { href: '#get-app', label: 'Availability' },
  mobileFilm: 'Watch the film',
};

export const hero = {
  brand: 'HushCast',
  descriptor: 'Android screen casting on your own WiFi',
  h1: ['Cast without', 'the cloud.'],
  lede: 'Your Android screen and sound, in a browser on the same WiFi. Nothing to install on the other screen.',
  perks: ['No account', 'No cloud', 'No ads', 'Works on WiFi without internet'],
  cta: 'Watch the film',
  ctaLabel: 'Watch the film, 1 minute 57 seconds',
  status: 'Coming soon to Google Play',
  statusLink: 'Availability',
  stageLabel: "A tablet's screen lifts off, travels over the local WiFi past a router and lands in a laptop browser. The badge on the tablet reads Casting, 1 viewer. A crossed-out cloud stays outside.",
  badgeReady: 'Ready',
  badgeCasting: 'Casting · 1 viewer',
  stop: 'Stop',
  wait: 'Waiting for the cast',
};

export const how = {
  idx: '01', eyebrow: 'Simple',
  h2: 'Start. Open. Watch.',
  lede: 'Nothing to install on the other screen. No sign-in anywhere.',
  steps: [
    { n: '01', title: 'Start', text: 'Tap Start casting and allow screen sharing.' },
    { n: '02', title: 'Open', text: 'On a computer or phone on the same WiFi, scan the QR code or type the address.' },
    { n: '03', title: 'Watch', text: 'It starts by itself. Tap Stop whenever you like.' },
  ],
  shots: {
    start: "HushCast on a tablet with Android's own prompt open: Share your screen with HushCast?",
    open: 'The tablet while casting: Casting now, a QR code and the address hushcast.local:8080, with a Stop casting button.',
    watch: "A laptop browser at hushcast.local showing the tablet's screen.",
  },
};

export const useCases = {
  label: 'What people use it for',
  items: [
    { mode: 'Live', accent: 'cyan', title: 'Sketch or teach on a bigger screen', text: 'Draw on your tablet and show it on a laptop the room can see, about 0.2 s behind your pen.' },
    { mode: 'Live', accent: 'cyan', title: 'Present an Android app', text: 'Walk people through an app, a document or a game from your phone, with its sound.' },
    { mode: 'Cinema', accent: 'amber', title: 'Share your own videos', text: 'Play videos you made or saved to a bigger screen, up to the 4K setting. Protected streaming apps stay black.' },
  ],
};

export const modes = {
  idx: '02', eyebrow: 'Three modes',
  h2: ['Draw something.', 'Watch it arrive.'],
  lede: 'Pick a mode, then draw on the tablet. The screen beside it shows what the person watching would get.',
  tabsLabel: 'Choose a mode',
  padLabel: 'Drawing area. Draw here and watch it arrive on the other screen.',
  hint: 'Draw here', yourTablet: 'Your tablet', theirScreen: 'Their browser',
  palette: 'Pen colour',
  pens: [['cyan', 'Cyan'], ['blue', 'Blue'], ['violet', 'Violet'], ['pink', 'Pink'], ['amber', 'Amber']],
  signal: 'Sent over your WiFi',
  mirrorHint: 'Draw on the tablet. It shows up here.',
  live: { name: 'Live', tag: 'Draw and present', text: 'Your screen and sound with almost no delay, about 0.2 s. Made for drawing and presenting. Up to 1080p.',
    chip: 'about 0.2 s behind', cap: 'Live supports one viewer at a time.',
    moreQ: 'What if a second person opens the link?',
    moreA: 'They see "This cast is full" until the first viewer leaves. You see the viewer count on your device and can tap Stop at any moment.' },
  listen: { name: 'Listen', tag: 'Sound only', text: 'Just the sound that apps play. No screen is captured or sent. Up to 10 listeners, 2 on the free plan.',
    playing: 'Playing on your tablet', note: 'No picture is captured or sent.',
    listeners: 'Listeners', free: '2 listening, free', unlock: 'up to 10 with Unlock',
    label: 'Two of ten listener places in use. Two are free; up to ten with Unlock.', eq: 'The sound arriving in the browser (illustration)' },
  cinema: { name: 'Cinema', tag: 'Watch', text: 'The sharpest picture, up to the 4K setting, about 10 s behind. Made for watching films and videos, not for presenting.',
    chip: 'about 10 s behind',
    idle: 'Draw on the tablet. It shows up here about 10 s later.',
    buffering: 'Buffering. Your drawing arrives in about', seconds: 's',
    caught: 'Caught up. Cinema trades delay for picture quality.' },
  illustration: 'Illustration: the delay is simulated in your browser. Real delay depends on your WiFi.',
  demo: 'Draw for me', clear: 'Clear',
};

export const privacy = {
  idx: '03', eyebrow: 'Private',
  h2: ['The line never', 'leaves the house.'],
  lede: 'Your stream goes from your device to a browser on the same WiFi. There is no server in the middle, so there is nothing to upload.',
  svgTitle: 'Your home WiFi',
  svgDesc: 'Inside a house outline: a tablet, a WiFi router and a laptop, joined by one line. Outside, a grey cloud that the line never reaches.',
  labels: { internet: 'The internet', notUsed: 'Not used', tablet: 'Your tablet', router: 'Your WiFi router', browser: 'A browser' },
  toggle: 'Unplug the internet',
  toggleNote: 'Illustration: this switch only changes the drawing above. It does not touch your network or any real cast.',
  legend: [['1', 'Your tablet', 'casts the screen'], ['2', 'Your WiFi router', 'carries it inside your home'], ['3', 'A browser', 'on the same WiFi watches it'], ['', 'The internet', 'not used']],
  stateOn: 'Internet connected. The cast doesn\'t use it.',
  stateOff: 'Internet unplugged. The cast keeps going on your WiFi.',
  toastOffline: 'You just went offline. This page kept working, and HushCast keeps casting on a WiFi with no internet.',
  toastOnline: "You're back online. The cast never needed it.",
  truths: [
    { tag: "What's true", h: 'No account. No cloud. No upload.', p: 'The app has no ads and no analytics. It keeps working on a WiFi with no internet at all.' },
    { tag: 'You can always see it', h: 'The dot turns green.', p: 'Android shows its own screen-capture notice, a small badge floats on screen, and the icon dot turns green. Stop is one tap.' },
    { tag: 'Plain truth', h: 'There is no password yet.', p: 'Anyone on the same WiFi who has the address can open the page. In Live, the first viewer takes the only seat. Cast on a network you trust.' },
    { tag: 'Plain truth', h: 'It is not encrypted.', p: "The stream stays on your WiFi, and we don't claim more than that. Use a network you trust." },
  ],
};

export const pricing = {
  idx: '04', eyebrow: 'Pricing',
  h2: ['Try everything.', 'Pay once.'],
  lede: 'Your first 5 casts are fully unlocked. After that, Listen stays free forever. One purchase unlocks the rest. No subscription. No ads.',
  caption: 'What you get free and with Unlock',
  head: { mode: 'Mode', free: 'Free forever', unlock: 'Unlock' },
  rows: [
    ['Listen', 'Unlimited time, 2 listeners', 'Up to 10 listeners'],
    ['Live', 'Up to 720p, 7 minutes per cast', 'Up to 1080p, no time limit'],
    ['Cinema', 'Not included', 'Included, up to 4K'],
    ['Cost', 'Free', 'One purchase'],
  ],
  // Prices are set in Google Play at launch and are deliberately not on the site.
  note: "A cast counts after 2 minutes with a viewer connected. Refunds follow Google Play's policy.",
};

export const limits = {
  idx: '05', eyebrow: 'Good to know',
  h2: 'A few honest limits.',
  items: [
    ['Protected video stays private.', "Apps that protect their video show black and silence. That is Android's rule, and HushCast does not get around it."],
    ['Rotation is set when you start.', 'Turn your device the way you want it before you tap Start.'],
    ['Some WiFi keeps devices apart.', 'Some routers block devices from talking to each other. If that happens, try another network or a phone hotspot.'],
    ['The number address always works.', 'hushcast.local:8080 works on some devices. The QR code and the number address always do.'],
    ['A phone stays tall.', "On a phone, the picture keeps the phone's tall shape in the browser."],
  ],
};

export const faqSec = { idx: '06', eyebrow: 'Questions', h2: 'Straight answers.' };

export const getApp = {
  idx: '07', eyebrow: 'Availability',
  h2: ['Your screen. Your WiFi.', 'A bigger possibility.'],
  status: 'Coming soon to Google Play',
  statusNote: 'Release information. There is no download yet, and no sign-up.',
  name: 'HushCast',
  facts: ['Android 10 or newer, phones and tablets', 'First 5 casts fully unlocked', 'No account, no cloud, no ads'],
  benefit: 'Your screen and sound go straight to a browser on the same WiFi. Nothing to install on the other screen.',
  watch: 'Watch the film', demo: 'Try the demo',
  iconLabel: 'HushCast icon. Turn casting on or off, demo only.',
  idle: 'Idle: red dot', casting: 'Casting: green dot', tap: 'Tap the icon. The dot is how the app shows its state.',
};

export const footer = {
  noTrackers: 'No trackers on this site.',
  legal: [
    { href: '/privacy/', label: 'Privacy policy' },
    { href: '/terms/', label: 'Terms of service' },
    { href: '/support/', label: 'Support' },
  ],
  proofA: 'Requests from this page to other websites:',
  proofB: 'Counted live in your browser.',
};
