// Legal and support copy. PRD section 10.4. A lawyer's review is the owner's decision.
// TODO markers are listed by `npm run check` so none ship by accident.
export interface Block { h: string; p?: string[]; ul?: string[] }
export interface Doc { title: string; description: string; h1: string; updated: string; intro: string; toc?: boolean; tocLabel?: string; blocks: Block[] }

export const privacyDoc: Doc = {
  title: 'Privacy policy | HushCast',
  description: 'HushCast collects nothing. No account, no cloud, no upload, no ads. This site uses no cookies and no trackers.',
  h1: 'Privacy policy',
  updated: 'Last updated 3 November 2026',
  intro: 'HushCast collects nothing about you. This page says what that means, in plain words.',
  blocks: [
    { h: 'The app', ul: [
      'There is no account and no sign-in.',
      'Nothing is uploaded. Your screen and sound go from your device to a browser on the same WiFi, with no server in the middle.',
      'There are no ads and no analytics.',
      'The app stores two small values on your device: how many free casts you have used, and whether you have unlocked it.',
    ] },
    { h: 'What the app does not do', p: [
      'The stream is not encrypted. It stays on your local network. There is no password in this version, so anyone on the same WiFi who has the address can open the page. Cast on a network you trust.',
      'On Android, the audio engine opens the microphone only to keep time. Microphone sound is never sent.',
    ] },
    { h: 'Buying the unlock', p: ['The purchase is handled by Google Play. HushCast does not see your payment details. Google Play\'s own privacy policy covers the purchase.'] },
    { h: 'This website', ul: [
      'No cookies.',
      'No trackers, no analytics, no ads.',
      'No requests to other websites: no CDNs, no web fonts, no embeds. The counter in the footer shows this live.',
      'The only thing this site may save on your device is a reduced-motion preference, and only if you set one.',
    ] },
    { h: 'Contact', p: ['Questions about privacy: TODO(Q1) support email.'] },
  ],
};

// Full terms of service. Owner's decisions (6 Nov 2026): provided by Nikhil Bajpai as an individual,
// governed by the laws of India. Product facts only from PRD section 4. Not legal advice: a lawyer's
// review before launch is the owner's call.
export const termsDoc: Doc = {
  title: 'Terms of service | HushCast',
  description: 'The terms for using the HushCast Android app and this website: your licence, fair use, free casts and Unlock, and the legal basics.',
  h1: 'Terms of service',
  updated: 'Last updated 6 November 2026',
  intro: 'These are the terms for the HushCast Android app and this website. We have kept them as plain as we can.',
  toc: true,
  tocLabel: 'On this page',
  blocks: [
    { h: 'Who we are', p: [
      'HushCast is made by Nikhil Bajpai, an individual based in India ("we", "us"). These terms are an agreement between you and us.',
      'By installing or using the HushCast app, or using this website, you agree to these terms. If you do not agree, please do not use HushCast.',
    ] },
    { h: 'Who can use HushCast', p: [
      'You must be old enough to agree to these terms where you live. If you are not, a parent or guardian must agree to them for you and supervise your use.',
    ] },
    { h: 'Your licence', p: [
      'We give you a personal, non-exclusive, non-transferable licence to install and use the app on Android devices you own or control, under these terms and the Google Play terms. The licence ends if you break these terms.',
      'You may not copy, sell, rent or redistribute the app, or reverse engineer it, except where the law allows this regardless of these terms.',
    ] },
    { h: 'How HushCast works', ul: [
      'HushCast shows your Android screen and sound in a browser on the same WiFi. There is no account and no server in the middle.',
      'The stream is not encrypted and there is no password in this version. Anyone on the same WiFi who has the address can open the page. Use it only on a network you trust.',
      'You are responsible for what you share and for who is on your network.',
    ] },
    { h: 'Fair use', p: ['When you use HushCast, you agree not to:'], ul: [
      'share content you do not have the right to share, or show it to people who may not see it;',
      'show or record other people without their permission, or break any law that applies to you;',
      'try to get around the protection that apps put on their video. Protected video shows black and silence, and HushCast does not get around that;',
      'use a network you are not allowed to use, or interfere with other people on it;',
      'use the HushCast name or icon to suggest that something is ours when it is not.',
    ] },
    { h: 'Free casts and Unlock', ul: [
      'Your first 5 casts have everything unlocked. A cast counts after 2 minutes with a viewer connected.',
      'After that, Listen stays free forever, with unlimited time and 2 listeners. Live is free up to 720p, 7 minutes per cast.',
      'Unlock is a single purchase, not a subscription. It adds Cinema, Live without a time limit and up to 1080p, and up to 10 listeners in Listen.',
      'The price is shown in Google Play before you buy. The purchase is made through Google Play, under its terms. We do not see your payment details.',
      'Refunds follow Google Play\'s policy.',
    ] },
    { h: 'What you cast stays yours', p: [
      'We never receive what you cast: it goes from your device to a browser on your WiFi. You keep every right you have in it.',
    ] },
    { h: 'Our property', p: [
      'The HushCast app, name, icon and this website belong to us. These terms do not give you any right to them beyond the licence above.',
    ] },
    { h: 'Changes to HushCast', p: [
      'We may update HushCast, change or remove features, or stop offering it. If you have bought Unlock, we will not take away the features it included in a version you already have installed.',
    ] },
    { h: 'No warranty', p: [
      'HushCast is provided as it is and as available. How well it works depends on your devices and your WiFi. We do not promise that it will work on every device or network, without delay or without interruption.',
      'This does not affect any rights you have under consumer law that cannot be excluded.',
    ] },
    { h: 'Limits on our liability', p: [
      'As far as the law allows, we are not liable for indirect or consequential loss, for loss of data, or for what other people on your network see. Our total liability to you for anything to do with HushCast is limited to the amount you paid for Unlock.',
      'Nothing in these terms limits liability that the law does not allow us to limit.',
    ] },
    { h: 'Ending', p: [
      'You can stop using HushCast at any time by uninstalling the app. If you break these terms, your licence ends. The sections on our property, no warranty, limits on our liability and the law that applies continue after that.',
    ] },
    { h: 'The law that applies', p: [
      'These terms are governed by the laws of India, and the courts of India have jurisdiction over any dispute about them. If you are a consumer, you also keep any protection that the law of the country where you live gives you.',
    ] },
    { h: 'Changes to these terms', p: [
      'We may update these terms. The date at the top shows the latest version. If a change matters, we will say so on this page before it applies. Using HushCast after a change means you accept it.',
    ] },
    { h: 'Contact', p: ['Questions about these terms: TODO(Q1) support email.'] },
  ],
};

export const supportDoc: Doc = {
  title: 'Support | HushCast',
  description: 'Help with HushCast: what to try when a cast does not connect, and how to reach us.',
  h1: 'Support',
  updated: '',
  intro: 'Most problems come down to the network. Start here.',
  blocks: [
    { h: 'It does not connect', ul: [
      'Make sure both devices are on the same WiFi.',
      'Type the number address the app shows under the QR code, like 192.168.1.24:8080. It always works. hushcast.local:8080 works on some devices.',
      'Some routers block devices from talking to each other. Try another network or a phone hotspot.',
    ] },
    { h: 'The picture is black', p: ['Android blocks screen capture for protected video, such as some streaming apps. HushCast cannot and does not get around it.'] },
    { h: 'Rotation looks wrong', p: ['Rotation is set when you start. Turn your device the way you want it, then tap Start.'] },
    { h: 'Contact', p: ['Write to TODO(Q1) support email. Please do not send screenshots that show personal data.'] },
  ],
};
