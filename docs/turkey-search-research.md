# Turkey Search Research — Kids Near Me

## Source and method

Date: 2026-07-18.

Because public Google Trends volume data is not available from this VPS without interactive Google access, this research uses live Google Autocomplete/Suggest (`suggestqueries.google.com`, `hl=tr`, `gl=tr`) as a demand proxy. Autocomplete is not exact search volume, but it is a useful signal for what Turkish users repeatedly search around the product intent.

## Live autocomplete signals captured

### Core query: `çocukla gidilecek yerler`
Google suggested:
- çocukla gezilecek yerler
- çocukla gezilecek yerler istanbul
- çocukla gidilecek yerler ankara
- çoçukla gidilecek yerler istanbul
- çocukla gezilecek yerler izmir
- çocukla gezilecek yerler ankara
- çocukla gezilecek yerler anadolu yakası
- çocukla gezilecek yerler avrupa yakası
- izmir çocukla gezilecek yerler
- bursa çocukla gezilecek yerler

### Istanbul query: `istanbul çocukla gidilecek yerler`
Google suggested:
- istanbul çocukla gezilecek yerler
- istanbul çocukla gezilecek yerler en çok oy alanlar
- istanbul'da cocukla gezilecek yerler
- istanbul a yakın çocukla gidilecek yerler
- istanbul avrupa yakası çocukla gezilecek yerler
- istanbul anadolu yakası çocukla gezilecek yerler
- ara tatilde çocukla gidilecek yerler istanbul

### Child-friendly venues query: `çocuk dostu mekanlar`
Google suggested:
- çocuk dostu mekanlar
- çocuk dostu mekanlar istanbul
- ankara çocuk dostu mekanlar
- çocuk dostu kahvaltı mekanları
- adana çocuk dostu mekanlar
- izmir çocuk dostu mekanlar
- bursa çocuk dostu mekanlar
- üsküdar çocuk dostu mekanlar
- eskişehir çocuk dostu mekanlar
- kadıköy çocuk dostu mekanlar

### Holiday query: `çocukla tatil yerleri`
Google suggested:
- çocukla tatil yerleri
- çocukla gidilecek tatil yerleri
- çocukla gidilecek yurtdışı tatil yerleri
- küçük çocukla gidilecek tatil yerleri
- istanbul a yakın çocukla tatil yerleri
- çocukla gidilecek en güzel tatil yerleri

## Product implications

1. **Istanbul is the strongest SEO entry point**, but users split intent by side/neighborhood: Anadolu Yakası, Avrupa Yakası, Kadıköy, Üsküdar.
2. **Other high-signal cities:** Ankara, İzmir, Bursa, Antalya. These should become launch city pages.
3. **Use Turkish demand copy even in global product:** “kids near me” for global, but Turkey pages should target “çocukla gezilecek yerler” and “çocuk dostu mekanlar.”
4. **Seasonal/holiday mode matters:** “ara tatil”, “hafta sonu”, “kapalı alan”, “tatil yerleri” are product filters, not just blog topics.
5. **Decision ranking should emphasize:** en çok oy alanlar, kapalı alan/rainy day, yakın, ücretsiz, kahvaltı/food, stroller/toilet signals.

## Prioritized Turkey launch pages

| Priority | Page/query intent | Product URL idea |
|---:|---|---|
| 1 | İstanbul çocukla gezilecek yerler | `/tr/istanbul-cocukla-gezilecek-yerler` |
| 2 | İstanbul Anadolu Yakası çocukla gezilecek yerler | `/tr/istanbul-anadolu-yakasi-cocukla` |
| 3 | İstanbul Avrupa Yakası çocukla gezilecek yerler | `/tr/istanbul-avrupa-yakasi-cocukla` |
| 4 | Ankara çocukla gidilecek yerler | `/tr/ankara-cocukla-gezilecek-yerler` |
| 5 | İzmir çocukla gezilecek yerler | `/tr/izmir-cocukla-gezilecek-yerler` |
| 6 | Bursa çocukla gezilecek yerler | `/tr/bursa-cocukla-gezilecek-yerler` |
| 7 | Antalya çocukla gezilecek yerler | `/tr/antalya-cocukla-gezilecek-yerler` |
| 8 | Çocuk dostu kahvaltı mekanları | `/tr/cocuk-dostu-kahvalti-mekanlari` |
| 9 | Ara tatilde çocukla gidilecek yerler | `/tr/ara-tatil-cocukla-gezilecek-yerler` |
| 10 | Çocukla kapalı alan / rainy day | `/tr/cocukla-kapali-alanlar` |

## MVP changes applied from research

- Add Turkey search radar chips in the app.
- Add featured Turkish city/category suggestions.
- Add fallback seed data for Ankara, İzmir, Bursa, Antalya, Cappadocia/Kapadokya.
- Design direction: not generic Vite app; use premium family-travel card UI, hand-drawn map path, bold search panel, city radar, warm coral + teal + ink palette.
