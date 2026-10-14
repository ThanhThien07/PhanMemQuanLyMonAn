---
name: web-performance-and-seo
description: >-
  Cẩm nang và quy chuẩn toàn diện về Tối ưu hóa hiệu năng Web (Core Web Vitals, tăng tốc tải trang)
  và Chuẩn hóa SEO (On-page, Technical SEO, Structured Data, SPA SEO) dựa trên Chuyên đề Front-End Chương 8.
  Kích hoạt khi cần tối ưu tốc độ, đo lường Lighthouse, cải thiện LCP/INP/CLS, nén dữ liệu, caching,
  tối ưu ảnh/CSS/JS, cấu hình thẻ meta, JSON-LD, robots.txt, sitemap và kiểm tra chuẩn SEO.
---

# CẨM NANG TOÀN DIỆN VỀ TỐI ƯU HÓA HIỆU NĂNG WEB VÀ SEO (CHƯƠNG 8)

Tài liệu chuẩn hóa kiến thức, phương pháp luận và kỹ thuật thực thi tối ưu hóa hiệu năng Front-End & Back-End kết hợp SEO toàn diện, kế thừa từ giáo trình **Chuyên đề Front-End - Chương 8: Tối ưu hoá và SEO** (GVHD: NCS.ThS Trần Phương Duy).

---

## MỤC LỤC
1. [Nguyên lý Cốt Lõi: Vì sao Tốc độ và SEO gắn liền mật thiết](#1-nguyen-ly-cot-loi)
2. [Quá trình Trình duyệt Tải & Render Trang](#2-qua-trinh-trinh-duyet-tai--render-trang)
3. [Bộ chỉ số Core Web Vitals & Công cụ đo lường](#3-bo-chi-so-core-web-vitals--cong-cu-do-luong)
4. [Kỹ thuật Tối ưu Hóa Tốc độ Tải Trang (Performance)](#4-ky-thuat-toi-uu-hoa-toc-do-tai-trang)
   - [4.1 Tối ưu Hình ảnh](#41-toi-uu-hinh-anh)
   - [4.2 Tối ưu CSS](#42-toi-uu-css)
   - [4.3 Tối ưu JavaScript & Resource Hints](#43-toi-uu-javascript--resource-hints)
   - [4.4 Web Fonts](#44-web-fonts)
   - [4.5 Caching & CDN](#45-caching--cdn)
   - [4.6 Nén dữ liệu & Giao thức HTTP](#46-nen-du-lieu--giao-thuc-http)
   - [4.7 Tối ưu Runtime & Framework (React)](#47-toi-uu-runtime--framework-react)
5. [Kỹ thuật Chuẩn hóa SEO (Search Engine Optimization)](#5-ky-thuat-chuan-hoa-seo)
   - [5.1 On-Page SEO Chuẩn Mực](#51-on-page-seo-chuan-muc)
   - [5.2 Semantic HTML & Heading Hierarchy](#52-semantic-html--heading-hierarchy)
   - [5.3 Meta Tags Nâng Cao & Open Graph](#53-meta-tags-nang-cao--open-graph)
   - [5.4 Dữ liệu cấu trúc Structured Data (JSON-LD & Schema.org)](#54-du-lieu-cau-truc-structured-data-json-ld--schemaorg)
   - [5.5 robots.txt và sitemap.xml](#55-robotstxt-va-sitemapxml)
   - [5.6 SEO cho ứng dụng Single Page Application (SPA)](#56-seo-cho-ung-dung-single-page-application-spa)
   - [5.7 Mobile-first, Tốc độ, HTTPS & Accessibility (A11y)](#57-mobile-first-toc-do-https--accessibility-a11y)
6. [Quy trình Thực thi: "Đo Trước – Tối Ưu – Đo Lại"](#6-quy-trinh-thuc-thi-do-truoc--toi-uu--do-lai)
7. [Bảng kiểm tra (Checklist) Trước khi Triển khai Production](#7-bang-kiem-tra-checklist-truoc-khi-trien-khai-production)

---

## 1. NGUYÊN LÝ CỐT LÕI
- **Tốc độ tải trang**:
  - Trang nhanh -> Nội dung xuất hiện sớm, phản hồi tức thì.
  - Trải nghiệm tốt -> Người dùng không phải chờ đợi.
  - Tỷ lệ thoát (Bounce Rate) giảm -> Giữ chân người dùng lâu hơn.
  - Tỷ lệ chuyển đổi (Conversion Rate) tăng -> Đặt bàn, mua hàng, đăng ký tăng vọt.
- **SEO (Search Engine Optimization)**:
  - Technical + On-page -> HTML chuẩn ngữ nghĩa, nội dung hữu ích.
  - Được lập chỉ mục (Indexed) -> Bot tìm kiếm hiểu và ghi nhận đầy đủ.
  - Xếp hạng cao (Rank) -> Hiển thị vị trí đầu khi người dùng tìm kiếm.
  - Lưu lượng tự nhiên (Organic Traffic) -> Thu hút khách hàng miễn phí, bền vững.
- **Mối liên hệ quyết định**: Google xếp hạng website dựa trên tín hiệu trải nghiệm trang (**Core Web Vitals**). Do đó, tối ưu tốc độ chính là một cấu phần cốt tử của SEO kỹ thuật!

---

## 2. QUÁ TRÌNH TRÌNH DUYỆT TẢI & RENDER TRANG
Chu trình xử lý một trang web gồm 2 giai đoạn chính:
1. **Giai đoạn Mạng (Network Phase)**:
   - `DNS Lookup`: Phân giải IP của tên miền.
   - `TCP + TLS Handshake`: Thiết lập kết nối bảo mật HTTPS.
   - `Request -> TTFB (Time to First Byte)`: Thời gian chờ nhận byte dữ liệu đầu tiên từ server.
   - `Download HTML`: Nhận tệp tài liệu và bắt đầu phân tích cú pháp (parse).
2. **Giai đoạn Render (Rendering Phase)**:
   - `DOM + CSSOM`: Trình duyệt parse HTML thành DOM Tree và parse CSS thành CSSOM Tree.
   - `Render Tree`: Kết hợp DOM và CSSOM thành cây hiển thị (chỉ chứa các phần tử nhìn thấy).
   - `Layout (Reflow)`: Tính toán kích thước hình học và tọa độ pixel từng phần tử.
   - `Paint + Composite`: Vẽ màu, viền, ảnh và ghép các lớp (layers) lên màn hình.
3. **Chiến lược can thiệp**:
   - **Gửi ít byte hơn**: Nén Gzip/Brotli, Minify mã nguồn, tối ưu kích thước ảnh.
   - **Ít request hơn**: Caching mạnh mẽ, loại bỏ thư viện thừa, gộp tài nguyên hợp lý.
   - **Không chặn render**: Sử dụng `defer`/`async` cho script, Critical CSS inline, Preload font.

---

## 3. BỘ CHỈ SỐ CORE WEB VITALS & CÔNG CỤ ĐO LƯỜNG

### 3.1 Ba chỉ số cốt lõi (Core Web Vitals)
| Chỉ số | Tên đầy đủ | Mục tiêu chuẩn | Ý nghĩa | Cách tối ưu trọng tâm |
| :--- | :--- | :--- | :--- | :--- |
| **LCP** | Largest Contentful Paint | **≤ 2.5 giây** | Đo tốc độ hiển thị: nội dung lớn nhất (ảnh hero/tiêu đề) xuất hiện nhanh thế nào | Preload ảnh hero, giảm TTFB (CDN/cache), loại bỏ CSS/JS chặn render, không lazy-load ảnh LCP, gán `fetchpriority="high"`. |
| **INP** | Interaction to Next Paint | **≤ 200 ms** | Đo độ phản hồi: trang phản ứng nhanh thế nào khi người dùng click, gõ phím | Chia nhỏ long task (> 50ms), giảm tải JavaScript trên main thread, debounce/throttle ô nhập liệu, đưa tác vụ nặng vào Web Worker. |
| **CLS** | Cumulative Layout Shift | **≤ 0.1** | Đo độ ổn định bố cục: các phần tử có bị giật, nhảy đột ngột ngoài ý muốn không | Khai báo tường minh `width`/`height` hoặc `aspect-ratio` cho ảnh & video, chừa sẵn chỗ cho banner, `font-display: swap` + preload font. |

*Chỉ số phụ bổ trợ:*
- `TTFB` (Time to First Byte) ≤ 800ms.
- `FCP` (First Contentful Paint) ≤ 1.8s.
- `TBT` (Total Blocking Time) ≤ 200ms.

### 3.2 Công cụ đo lường
- **Lighthouse**: Tích hợp sẵn trong Chrome DevTools. Đo 4 trụ cột: Performance, Accessibility, Best Practices, SEO.
- **PageSpeed Insights**: Kết hợp giữa Lighthouse (Lab data) và dữ liệu thực tế Chrome User Experience Report (CrUX - Field data).
- **Chrome DevTools (Network & Performance tab)**: Phân tích biểu đồ Waterfall, tài nguyên gây nghẽn, Long Tasks, và Flame Chart.
- **Quy tắc đo công bằng**:
  - Dùng cửa sổ ẩn danh (Incognito) để vô hiệu hóa browser extension.
  - Chạy tối thiểu 3 lần và lấy kết quả trung bình.
  - Cố định môi trường giả lập (Mobile hoặc Desktop) trước và sau khi tối ưu.

---

## 4. KỸ THUẬT TỐI ƯU HÓA TỐC ĐỘ TẢI TRANG

### 4.1 Tối ưu Hình ảnh
1. **Định dạng hiện đại**: Ưu tiên **WebP** hoặc **AVIF** cho ảnh chụp; dùng **SVG** cho icon, logo, huy hiệu vector.
2. **Kích thước phù hợp**: Tuyệt đối không dùng ảnh gốc 4000px cho khung hiển thị 400px.
3. **Responsive Images**: Khai báo `srcset` và `sizes` để trình duyệt tải đúng độ phân giải màn hình:
   ```html
   <img
     src="mon-an-800.webp"
     srcset="mon-an-400.webp 400w, mon-an-800.webp 800w, mon-an-1200.webp 1200w"
     sizes="(max-width: 640px) 100vw, 800px"
     width="800" height="500"
     alt="Bò bít tết sốt tiêu đen thượng hạng"
     loading="lazy" decoding="async"
   />
   ```
4. **Tránh giật layout (CLS)**: Bắt buộc khai báo thuộc tính `width` và `height` (hoặc CSS `aspect-ratio`).
5. **Quy tắc vàng cho ảnh Hero (LCP)**:
   - **KHÔNG** đặt `loading="lazy"` cho ảnh đầu trang.
   - Thêm `fetchpriority="high"` để trình duyệt tải ngay lập tức:
     ```html
     <link rel="preload" as="image" href="hero-banner.webp" type="image/webp" fetchpriority="high" />
     <img src="hero-banner.webp" width="1200" height="600" alt="Banner nhà hàng Royal Bistro" fetchpriority="high" />
     ```

### 4.2 Tối ưu CSS
1. **Minify & Purge**: Loại bỏ khoảng trắng thừa, chú thích, và dùng Tailwind/PurgeCSS để lọc bỏ 100% selector không sử dụng.
2. **Critical CSS**: Inline các đoạn style quan trọng của phần trên nếp gấp màn hình (above-the-fold) vào `<head><style>...</style></head>`.
3. **Tránh `@import`**: Không dùng `@import` trong CSS vì gây hiệu ứng thác nước (waterfall request nối tiếp). Dùng thẻ `<link rel="stylesheet">`.
4. **Animation mượt mà**: Luôn kích hoạt tăng tốc phần cứng GPU bằng cách chỉ animate `transform` và `opacity`, tránh animate `top`, `left`, `width`, `height`, `margin`.
5. **`content-visibility: auto`**: Bổ sung cho các danh sách dài nằm ngoài màn hình đầu tiên để trình duyệt bỏ qua render layout khi chưa cuộn tới.

### 4.3 Tối ưu JavaScript & Resource Hints
1. **Script loading: `defer` vs `async`**:
   - Mặc định: Chặn render HTML cho đến khi script được tải và thực thi xong.
   - `async`: Tải song song, thực thi ngay khi tải xong (không đảm bảo thứ tự) -> Thích hợp cho script bên thứ ba độc lập (Google Analytics, Facebook Pixel).
   - `defer`: Tải song song, chỉ thực thi sau khi hoàn tất parse toàn bộ HTML và giữ nguyên thứ tự khai báo -> Thích hợp cho toàn bộ script ứng dụng.
2. **Code Splitting trong React / Vite**:
   - Sử dụng `React.lazy` và `Suspense` để tách từng trang/module thành các chunk riêng:
     ```javascript
     import React, { Suspense, lazy } from 'react';
     const TrangQuanLy = lazy(() => import('./components/pages/TrangQuanLy'));
     const KhachHangQR = lazy(() => import('./components/pages/KhachHangQR'));

     export default function App() {
       return (
         <Suspense fallback={<div className="loading-spinner">Đang tải trang...</div>}>
           {isQR ? <KhachHangQR /> : <TrangQuanLy />}
         </Suspense>
       );
     }
     ```
3. **Tree-Shaking**:
   - Dùng `import { debounce } from 'lodash-es'` thay vì `import _ from 'lodash'`.
   - Dùng thư viện nhẹ thay thế thư viện nặng: Thay `moment.js` bằng `dayjs` hoặc native `Intl`.
4. **Resource Hints**:
   - `dns-prefetch`: Phân giải trước tên miền (`<link rel="dns-prefetch" href="//fonts.googleapis.com">`).
   - `preconnect`: Thiết lập sẵn bắt tay TCP/TLS (`<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`).
   - `preload`: Tải ưu tiên tệp quan trọng trong trang hiện tại (`as="font"`, `as="style"`, `as="image"`).
   - `prefetch`: Tải trước tài nguyên cho lần điều hướng tiếp theo (`<link rel="prefetch" href="/pos-chunk.js">`).

### 4.4 Web Fonts
1. Dùng định dạng **WOFF2** hiện đại (nhẹ hơn TTF/OTF từ 30% - 50%).
2. Khai báo thuộc tính `font-display: swap` trong `@font-face` để hiển thị ngay font hệ thống dự phòng trong lúc tải font tùy biến, loại bỏ FOIT (Flash of Invisible Text).
3. Subset font: Chỉ tải bộ ký tự tiếng Việt (`subset=vietnamese`).
4. Preload font chính có thuộc tính `crossorigin`:
   ```html
   <link rel="preload" href="/fonts/plus-jakarta-sans.woff2" as="font" type="font/woff2" crossorigin />
   ```

### 4.5 Caching & CDN
Quy tắc cấu hình tiêu đề `Cache-Control` theo chuẩn Google:
| Loại tệp | Giá trị Cache-Control | Giải thích |
| :--- | :--- | :--- |
| **HTML (`index.html`)** | `no-cache` | Lưu trong cache nhưng luôn phải gửi request hỏi lại server (304 Not Modified) trước khi dùng, tránh lỗi trang không cập nhật phiên bản mới. |
| **Tệp tĩnh có mã băm (Hashed Assets: `app.a8f3b2.js`, `style.c12d4e.css`)** | `public, max-age=31536000, immutable` | Lưu cache cứng trong 1 năm mà không cần hỏi lại server. Khi có bản build mới, tên file tự đổi (Cache Busting). |
| **API dữ liệu ít đổi** | `public, max-age=60, stale-while-revalidate=300` | Trả về dữ liệu cũ ngay lập tức cho người dùng trong lúc âm thầm tải bản mới từ server. |
| **Dữ liệu nhạy cảm / Đăng nhập** | `no-store` | Tuyệt đối không lưu vào bất kỳ bộ nhớ đệm nào. |

### 4.6 Nén Dữ Liệu & Giao Thức HTTP
1. **Nén văn bản**: Kích hoạt **Gzip** hoặc **Brotli** cho toàn bộ phản hồi dạng text: HTML, CSS, JavaScript, JSON API, SVG.
   - Trong Node.js/Express: Cài đặt và tích hợp middleware `compression`:
     ```javascript
     import compression from 'compression';
     app.use(compression({
       filter: (req, res) => {
         if (req.headers['x-no-compression']) return false;
         return compression.filter(req, res);
       },
       level: 6
     }));
     ```
2. **HTTP/2 & HTTP/3**: Hỗ trợ Multiplexing nhiều request đồng thời trên 1 kết nối duy nhất, nén tiêu đề HPACK, loại bỏ hiện tượng Head-of-Line Blocking.

### 4.7 Tối ưu Runtime & Framework (React)
1. **Debounce / Throttle ô nhập liệu & cuộn trang**:
   ```javascript
   export function debounce(fn, delay = 300) {
     let timer;
     return (...args) => {
       clearTimeout(timer);
       timer = setTimeout(() => fn(...args), delay);
     };
   }
   ```
2. **Tránh Layout Thrashing**: Đọc toàn bộ kích thước hình học (DOM Read) trước khi thực hiện ghi CSS/DOM (DOM Write).
3. **Danh sách lớn**: Sử dụng Virtual List (như `@tanstack/react-virtual`) khi danh sách món ăn, đơn hàng vượt quá 100 phần tử.
4. **Tối ưu Memo**: Chỉ dùng `React.memo`, `useMemo`, `useCallback` cho các phép tính tốn kém hoặc component render lặp lại nhiều lần đã được xác nhận qua React Profiler.

---

## 5. KỸ THUẬT CHUẨN HÓA SEO (SEARCH ENGINE OPTIMIZATION)

### 5.1 On-Page SEO Chuẩn Mực
1. **Thẻ Title**:
   - Độ dài lý tưởng: **50 - 60 ký tự**.
   - Cấu trúc chuẩn: `[Từ khóa chính] - [Mô tả ngắn bổ trợ] | [Tên Thương Hiệu]`
   - Ví dụ: `Thực Đơn Món Ăn & Đặt Bàn Trực Tuyến | Royal Bistro Restaurant`
   - Mỗi trang/route phải có title duy nhất!
2. **Thẻ Meta Description**:
   - Độ dài lý tưởng: **150 - 160 ký tự**.
   - Chứa từ khóa chính, thông tin kích thích hành động (Call to action - CTA): Đặt bàn nhanh, giao hàng tận nơi, ưu đãi hấp dẫn.
3. **Đường dẫn URL thân thiện (Clean SEO URLs)**:
   - Dùng chữ thường, phân tách bằng dấu gạch ngang `-`, không dấu tiếng Việt: `/thuc-don/mon-chinh/bo-bit-tet`.
   - Tránh dùng tham số vô nghĩa hoặc hash fragments (`#`).

### 5.2 Semantic HTML & Heading Hierarchy
1. **Thẻ ngữ nghĩa chuẩn HTML5**:
   - `<header>`: Phần đầu trang, logo, thông tin nhà hàng.
   - `<nav>`: Menu điều hướng chính.
   - `<main>`: Khu vực nội dung trọng tâm của trang.
   - `<article>`: Khối bài viết, chi tiết món ăn độc lập.
   - `<section>`: Từng phân đoạn danh mục món, thông tin liên hệ, đánh giá.
   - `<footer>`: Phần chân trang, bản quyền, địa chỉ và giờ mở cửa.
2. **Phân cấp Heading chuẩn xác**:
   - **Chỉ duy nhất một thẻ `<h1>` trên mỗi trang** mô tả chủ đề chính.
   - Phân cấp nghiêm ngặt: `<h1>` -> `<h2>` -> `<h3>` -> `<h4>`, tuyệt đối không nhảy cóc cấp bậc (ví dụ `<h1>` nhảy thẳng sang `<h3>`).
3. **Thuộc tính ảnh `alt` & Anchor text**:
   - Thẻ `<img>` bắt buộc có `alt` mô tả trực tiếp nội dung bức ảnh (hỗ trợ cả bot tìm kiếm và người khiếm thị dùng Screen Reader).
   - Tên file ảnh phải có nghĩa: `bo-bit-tet-wagyu-sot-tieu.webp` (thay vì `IMG_2391.jpg`).
   - Anchor text mô tả rõ đích đến: `<a href="/dat-ban">Đặt bàn tiệc gia đình</a>` thay vì "Bấm vào đây" hoặc "Xem thêm".

### 5.3 Meta Tags Nâng Cao & Open Graph
Khai báo đầy đủ trong `<head>`:
```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://royalbistro.vn/" />

  <title>ROYAL BISTRO - Hệ Thống Quản Lý Nhà Hàng & Đặt Món Trực Tuyến</title>
  <meta name="description" content="Khám phá ẩm thực Âu - Á cao cấp tại Royal Bistro. Đặt bàn online, quét mã QR gọi món tại bàn nhanh chóng, tận hưởng ưu đãi ẩm thực hấp dẫn." />
  <meta name="keywords" content="nhà hàng royal bistro, đặt bàn trực tuyến, gọi món qr, thực đơn bít tết, ẩm thực cao cấp" />
  <meta name="theme-color" content="#d97706" />

  <!-- Open Graph Meta Tags (Facebook, Zalo, LinkedIn) -->
  <meta property="og:type" content="restaurant" />
  <meta property="og:site_name" content="Royal Bistro" />
  <meta property="og:title" content="ROYAL BISTRO - Hệ Thống Quản Lý Nhà Hàng & Đặt Món Trực Tuyến" />
  <meta property="og:description" content="Khám phá ẩm thực Âu - Á thượng hạng tại Royal Bistro. Gọi món quét mã QR hiện đại và tiện lợi." />
  <meta property="og:image" content="https://royalbistro.vn/og-banner.jpg" />
  <meta property="og:url" content="https://royalbistro.vn/" />
  <meta property="og:locale" content="vi_VN" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="ROYAL BISTRO - Hệ Thống Quản Lý Nhà Hàng" />
  <meta name="twitter:description" content="Đặt bàn online và quét mã QR gọi món tiện lợi tại Royal Bistro." />
  <meta name="twitter:image" content="https://royalbistro.vn/og-banner.jpg" />
</head>
```

### 5.4 Dữ liệu cấu trúc Structured Data (JSON-LD & Schema.org)
JSON-LD là định dạng được Google khuyên dùng để kích hoạt kết quả tìm kiếm phong phú (**Rich Results**: sao đánh giá, mức giá, địa chỉ, thực đơn).
Ví dụ chuẩn Schema cho nhà hàng ẩm thực:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Royal Bistro Restaurant",
  "image": "https://royalbistro.vn/og-banner.jpg",
  "url": "https://royalbistro.vn",
  "telephone": "+84 374 685 094",
  "priceRange": "$$ - $$$",
  "servesCuisine": ["Âu", "Á", "Bít tết", "Hải sản"],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Đường Ẩm Thực, Quận 1",
    "addressLocality": "TP. Hồ Chí Minh",
    "addressCountry": "VN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 10.7769,
    "longitude": 106.7009
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "09:00",
      "closes": "22:30"
    }
  ],
  "hasMenu": "https://royalbistro.vn/?table=1"
}
</script>
```

### 5.5 robots.txt và sitemap.xml
1. **`robots.txt`**: Đặt tại thư mục gốc domain (`/robots.txt`). Cho phép bot thu thập dữ liệu các trang công khai, chặn thư mục quản trị và API riêng tư:
   ```txt
   User-agent: *
   Allow: /
   Disallow: /api/
   Disallow: /admin/
   Disallow: /pos/
   Disallow: /kds/

   Sitemap: https://royalbistro.vn/sitemap.xml
   ```
2. **`sitemap.xml`**: Khai báo danh mục các trang hợp lệ kèm ngày sửa đổi gần nhất và mức ưu tiên:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://royalbistro.vn/</loc>
       <lastmod>2026-10-14</lastmod>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>https://royalbistro.vn/?table=1</loc>
       <lastmod>2026-10-14</lastmod>
       <changefreq>weekly</changefreq>
       <priority>0.8</priority>
     </url>
   </urlset>
   ```

### 5.6 SEO cho ứng dụng Single Page Application (SPA)
- Tránh dùng URL dạng `#` (Hash router); luôn sử dụng **HTML5 History API**.
- Cập nhật linh hoạt thẻ `<title>` và `<meta name="description">` khi người dùng chuyển đổi module bằng `document.title` hoặc `react-helmet-async`.
- Đảm bảo trả về mã trạng thái HTTP 404 chuẩn khi truy cập vào đường dẫn không tồn tại.
- Đối với các trang thương mại cần cạnh tranh thứ hạng cao, xem xét giải pháp SSR (Next.js) hoặc Prerendering (SSG).

### 5.7 Mobile-first, Tốc độ, HTTPS & Accessibility (A11y)
- Thiết kế Responsive chuẩn với `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
- Kích thước nút bấm và khu vực chạm tối thiểu **48x48px** trên điện thoại.
- Độ tương phản màu sắc chữ và nền đạt chuẩn WCAG AA (tối thiểu 4.5:1).
- Hỗ trợ phím `Tab` và `Enter` điều hướng không cần chuột.
- 100% kết nối qua giao thức an toàn **HTTPS**.

---

## 6. QUY TRÌNH THỰC THI: "ĐO TRƯỚC – TỐI ƯU – ĐO LẠI"
Mọi chiến dịch tối ưu hóa phải tuân thủ nghiêm ngặt 3 bước:
1. **Bước 1: Đo lường ban đầu (Audit Baseline)**
   - Mở cửa sổ ẩn danh, chạy Lighthouse tab Mobile và Desktop.
   - Ghi lại các chỉ số: Performance Score, LCP, INP, CLS, TBT, SEO Score.
   - Xác định top 3 - 5 điểm nghẽn lớn nhất trong bảng Opportunities & Diagnostics.
2. **Bước 2: Thực hiện tối ưu (Implementation)**
   - Áp dụng kỹ thuật: nén ảnh WebP, bổ sung width/height, lazy loading, code splitting, tối ưu head tags, cấu hình caching, nén Gzip.
3. **Bước 3: Đo kiểm lại & So sánh (Verification)**
   - Chạy lại Lighthouse trong điều kiện tương đương.
   - Lập bảng so sánh Trước / Sau để chứng minh hiệu quả định lượng.

---

## 7. BẢNG KIỂM TRA (CHECKLIST) TRƯỚC KHI TRIỂN KHAI PRODUCTION
- [ ] Đã khai báo `<html lang="vi">`, `<meta charset="utf-8">` và `viewport`.
- [ ] Title thẻ duy nhất (50-60 ký tự), Meta Description đủ (150-160 ký tự).
- [ ] Chỉ có duy nhất 1 thẻ `<h1>` trên trang, các heading không nhảy cóc cấp bậc.
- [ ] Mọi thẻ `<img>` đều có `alt` mô tả, có khai báo `width` và `height`.
- [ ] Ảnh lớn nhất đầu trang (LCP) không lazy-load và có `fetchpriority="high"`.
- [ ] Các ảnh dưới nếp gấp màn hình đều có `loading="lazy"` và `decoding="async"`.
- [ ] Đã tách mã nguồn bằng Code Splitting (`React.lazy` + `Suspense`).
- [ ] Back-End đã bật nén văn bản Gzip/Brotli (`compression`).
- [ ] Tiêu đề `Cache-Control` được thiết lập chuẩn (`no-cache` cho HTML, `1 year immutable` cho static hashed).
- [ ] Đã có đầy đủ tệp `robots.txt` và `sitemap.xml`.
- [ ] Đã có Open Graph (`og:*`), Twitter Cards và JSON-LD (`Restaurant`/`Product`).
- [ ] Điểm số Lighthouse Performance ≥ 90 và SEO ≥ 95.
