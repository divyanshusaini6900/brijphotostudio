# Brij Photo Studio & Jan Seva Kendra — Website

Live: https://brijphotostudio.tech (GitHub Pages)

## Files
- `index.html` — poori website (ek hi page)
- `assets/css/style.css` — design aur colours
- `assets/js/main.js` — animations, WhatsApp form, documents list
- `assets/img/` — favicon aur share image
- `logo/` — logo files: `brij-logo.svg` / `.png` (light background), `brij-logo-dark-bg.png` (dark background), `brij-mark.svg` / `brij-mark-512.png` (sirf lens wala nishaan), `index.html` (logo sheet)

## Bhasha (Hindi / English)
- Website pehle **Hindi** mein khulti hai. Header mein **हिंदी / English** button se bhasha badal sakte hain; chuni hui bhasha agli baar yaad rehti hai.
- Seedha English kholne ka link: `index.html?lang=en`
- Hindi text `index.html` mein likha hai. Har line ka English roop usi tag ke `data-en="..."` mein hai. Text badalna ho to dono jagah badaliye.
- Kaagazon ki list (PAN, aay, janm, niwas) `assets/js/main.js` mein `DOCS` ke andar Hindi + English dono mein hai.

## Apni jaankari kaise daalein
`assets/js/main.js` ke sabse upar `SHOP` mein:

```js
const SHOP = {
  whatsapp: '919758580623',
  phone: '919758580623',
  phoneDisplay: '+91 97585 80623',
  address: {
    hi: 'ग्राम पठेड़, नथमलपुर रोड, ज़िला सहारनपुर, उत्तर प्रदेश – 247231',
    en: 'Village Pather, Nathmalpur Road, District Saharanpur, Uttar Pradesh – 247231'
  },
  hours: { hi: 'रोज़ सुबह 8 से रात 8 बजे तक', en: 'Open daily, 8 AM to 8 PM' },
  mapUrl: 'https://maps.app.goo.gl/TCuKijWRTwXKrL349'
};
```

Number badalte hi har WhatsApp button, Call button aur order form us number par chalne lagenge.

## Computer par chalakar dekhein

```bash
python -m http.server 5600
```

Phir browser mein `http://localhost:5600` kholiye.

## Website ke hisse
1. Loader — lens ke andar zoom, camera flash
2. Hero — photo, frame, PAN card, bill — sab tairte hue
3. Sevayein — 4 group (Photo Studio, Jan Seva, Print, Bill Payment)
4. Scroll animation — 6 kahaniyan: Passport Photo, Designing Photo, Photo Frame, Jan Seva Kendra, Print/Copy/Lamination, Bill Payment
5. Kaagaz ki list — PAN, aay, janm, niwas praman patra ke documents
6. Film strip — kaam kaise hota hai
7. Sampark + WhatsApp order form
