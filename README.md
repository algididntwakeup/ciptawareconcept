# Ciptaware — Company Profile

Situs profil perusahaan satu halaman dengan parallax berlapis. Statis: tanpa build step, tanpa dependency, tanpa backend.

Visual mengikuti `DESIGN (1).md` (referensi gaya Integrated Biosciences): kanvas hijau-gelap, satu bobot huruf display, label mono, aksen lime yang dijatah, permukaan flat dengan garis rambut 1px.

## Isi

```
index.html            seluruh markup + hook terjemahan
css/style.css         token, layout, tiap section, motion, responsive
js/i18n.js            kamus copy ID/EN (78 kunci per bahasa)
js/main.js            bahasa, parallax, reveal, pin proses, canvas, nav, scrollspy
assets/*.svg          7 aset vektor (imagery + favicon)
DESIGN (1).md         referensi gaya sumber (tidak dipakai runtime)
```

## Menjalankan

Butuh server statis karena font diambil dari Google Fonts.

```bash
cd C:/Werk/ciptaware-id
python -m http.server 8080
```

Buka `http://localhost:8080`. Membuka `index.html` langsung (`file://`) juga jalan — sudah diuji — tapi server lebih dekat ke kondisi produksi.

## Struktur halaman

| Anchor | Section | Latar | Parallax |
|---|---|---|---|
| `#hero` | Judul utama, CTA, canvas node-network | Abyssal Ink | canvas `0.08`, ghost `0.25`, judul `-0.05` |
| `#about` | Tentang + 3 kartu kapabilitas | Bone White | — |
| `#services` | 3 baris layanan | Abyssal Ink | — |
| `#process` | 4 fase, **pinned** 360vh | Abyssal Ink | progres `--p` |
| `.band-section` | Marquee + band gambar penuh | Abyssal Ink | gambar `0.18` |
| `#notes` | 1 catatan unggulan + 3 kartu | Bone White | gambar kartu `0.05` |
| `#contact` | Ajakan kontak | Abyssal Ink | ghost `TALK` `0.2` |
| `footer` | Penutup | Void | — |

## Mengubah copy

Semua teks ada di `js/i18n.js`, bukan di HTML. HTML hanya membawa penanda:

| Atribut | Dipakai untuk |
|---|---|
| `data-i18n="kunci"` | teks biasa (`textContent`) |
| `data-i18n-html="kunci"` | teks ber-markup — hanya `about.title` (punya `<span class="muted">`) |
| `data-i18n-aria="kunci"` | `aria-label` tombol/link ikon |

Alur edit:

1. Cari kunci di `js/i18n.js` (mis. `hero.title`).
2. Ubah nilai di blok `id` **dan** `en`. Kedua blok wajib punya kunci yang sama.
3. Reload. Tidak ada langkah build.

Menambah teks baru: tambahkan elemen dengan `data-i18n="kunci.baru"` di `index.html`, lalu tambahkan kunci itu di kedua bahasa. Kunci yang hilang hanya memunculkan `console.warn`, teks lama dibiarkan — jadi cek konsol setelah menambah.

Yang **tidak** diterjemahkan: `ciptaware`, `CIPTAWARE`, `TALK`, alamat email, tahun, angka `01`–`05`, label tag `AI`/`PRODUCT`/`DESIGN`/`ENGINEERING`.

## Mengganti aset

| File | Dipakai di | Rasio |
|---|---|---|
| `assets/cells.svg` | band penuh | 3:2 (1200×800) |
| `assets/molecule.svg` | visual section proses | 1:1 (800×800) |
| `assets/note-feature.svg` | kartu catatan unggulan | 4:3 (800×600) |
| `assets/note-1..3.svg` | kartu catatan | 8:5 (600×375) |
| `assets/favicon.svg` | ikon tab | 1:1 |

Ganti isi file dengan nama sama, atau timpa `src` di `index.html`. Pertahankan atribut `width`/`height` agar tidak ada layout shift. Untuk foto raster, ekspor ke ukuran rasio di atas dan perbarui `width`/`height` sesuai piksel asli.

Semua gambar dekoratif memakai `alt=""` + `aria-hidden` pada pembungkusnya. Jika suatu gambar mulai menyampaikan informasi, isi `alt` yang menjelaskan dan lepaskan `aria-hidden`.

## Menyesuaikan gerak

| Yang diubah | Di mana |
|---|---|
| Kekuatan parallax | `data-parallax="0.08"` — angka dikali 400px; `0.25` ≈ ±100px, `0.05` ≈ ±20px |
| Tinggi scroll section pinned | `.process { height: 360vh }` di `css/style.css` |
| Kecepatan marquee | `animation: marquee 32s linear infinite` |
| Jeda reveal | `transition-delay: calc(var(--i) * 80ms)` + `style="--i:N"` |
| Kerapatan node canvas | `Math.min(70, Math.max(24, Math.round(width / 24)))` di `js/main.js` |

Parallax hanya aktif di `≥900px` dan mati total saat `prefers-reduced-motion: reduce`. Section proses kehilangan pin pada kondisi yang sama; semua langkah tetap terbaca.

## Navigasi

Link nav memakai `data-nav="services|process|notes|contact"`. Scrollspy menyalakan `.is-active` pada **semua** link dengan nilai itu (desktop dan overlay mobile sekaligus). Menambah section baru yang ingin disorot: beri `id` pada section, tambahkan `data-nav` di link, dan daftarkan id-nya di `spySections` pada `js/main.js`.

## Mengganti warna & tipografi

Token ada di blok `:root` paling atas `css/style.css`. Yang aman diubah:

- `--color-bioluminescent-lime` — aksen. Hanya untuk permukaan mikro: tombol panah 40×40, titik 6px, pill nav aktif. Jangan untuk latar teks atau bidang besar.
- `--color-abyssal-ink`, `--color-bone-white`, `--color-graphite`, `--color-lichen` — pasangan kanvas/teks.
- `--page-max-width`, `--section-gap`, radius.

Huruf: `--font-aspekta` memakai **Inter Tight 400** karena Aspekta tidak bebas didistribusikan. Jika punya lisensi Aspekta, tambahkan `@font-face` dan letakkan `'Aspekta'` di depan stack. Jangan menambah bobot kedua — hierarki dibangun dari ukuran dan tracking, bukan ketebalan.

Aturan yang membentuk tampilan (jangan dilanggar tanpa alasan): tanpa `box-shadow`, tanpa gradien di permukaan UI, garis maksimal 1px, satu aksen saja, teks lime di atas gelap tidak dipakai.

## Deploy

Salin seluruh folder ke hosting statis apa pun (Netlify, Vercel, GitHub Pages, Nginx, S3). Tidak ada konfigurasi khusus. `index.html` di root.

Karena kontak memakai `mailto:hello@ciptaware.id`, ganti alamat itu di tiga tempat bila domain berbeda: CTA kontak, link email kontak, dan kolom footer.

## Aksesibilitas

- Satu `h1`, `h2` per section, `h3` untuk kartu/langkah.
- Skip link, fokus `:focus-visible` 2px, overlay mobile mengunci scroll, memindahkan fokus, dan mengembalikannya ke tombol menu saat ditutup.
- Esc menutup overlay; Tab berputar di dalamnya.
- Kontras: teks sekunder `#c9cbbe` di kanvas gelap dan `#4d5757` di kanvas terang (keduanya ±7:1).
- `prefers-reduced-motion: reduce`: tanpa parallax, tanpa pin, tanpa marquee, tanpa animasi masuk.

## Batasan yang disengaja

- Tanpa backend dan tanpa form — kontak lewat `mailto:`. Jangan menambah form yang tidak mengirim ke mana pun.
- Kartu catatan adalah pratinjau editorial, bukan artikel. Tidak ada `href="#"` di mana pun.
- Logo berupa wordmark teks + titik lime. Jika ada berkas logo, ganti isi `.nav__logo` dan `.footer__wordmark` dengan `<img>` setinggi ±24px dan pertahankan tautan `#top`.

## Troubleshooting

| Gejala | Sebab |
|---|---|
| Teks tidak berubah setelah edit | Kunci salah, atau hanya satu bahasa yang diubah; cek `console.warn('Missing i18n key')` |
| Parallax diam | Lebar `<900px`, atau emulasi reduced motion aktif |
| Section proses tidak menempel | Sama seperti di atas; pin hanya di desktop tanpa reduced motion |
| Font jatuh ke system-ui | Google Fonts tidak terjangkau; situs tetap terbaca dengan stack cadangan |
| Preferensi bahasa tidak tersimpan | `localStorage` diblokir (mode privat); bahasa kembali ke `id` tiap reload |
