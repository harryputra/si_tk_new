# 🎨 Antigravity UI/UX Design System Standard (v2.0)

Dokumen ini merupakan acuan resmi untuk pengembangan antarmuka (UI) dan pengalaman pengguna (UX) pada sistem ERP ini. Setiap komponen baru **WAJIB** mengikuti standar estetika "Premium & Dynamic" yang ditetapkan di sini.

---

## 1. Core Visual Principles
*   **Premium Aesthetics**: Menggunakan bayangan (shadow) yang lembut dan berwarna, bukan sekadar abu-abu.
*   **Glassmorphism & Gradients**: Penggunaan gradient halus dan efek blur untuk memberikan kedalaman (depth).
*   **Micro-Animations**: Setiap interaksi (hover, click, transition) harus memiliki animasi halus menggunakan Tailwind transition atau Framer Motion (jika tersedia).
*   **High Contrast Typography**: Menggunakan font weight yang kontras (Extra Bold/Black vs Medium) untuk hierarki informasi yang jelas.

---

## 2. Design Tokens

### 🎨 Color Palette (Curated HSL)
| Category | Tailwind Classes | Usage |
| :--- | :--- | :--- |
| **Primary** | `blue-600` to `indigo-600` | Branding, Action Utama, Links |
| **Success** | `emerald-500` to `teal-600` | Lunas, Aktif, Selesai |
| **Warning** | `amber-500` to `orange-600` | Pending, Parsial, Perhatian |
| **Danger** | `rose-500` to `red-600` | Tunggakan, Keluar, Error |
| **Neutral** | `gray-50` to `gray-900` | Background, Teks, Border |

### 📐 Layout & Spacing
*   **Border Radius**: 
    *   Container Utama: `rounded-[2.5rem]` (40px)
    *   Cards & Modals: `rounded-[2rem]` (32px)
    *   Buttons & Inputs: `rounded-xl` (12px) atau `rounded-2xl` (16px)
*   **Shadows**:
    *   Standard: `shadow-sm`
    *   Premium Hover: `shadow-2xl shadow-blue-200/50`
    *   Inner: `shadow-inner` untuk efek kedalaman.

---

## 3. Component Standards

### 🔘 Buttons
*   **Primary**: `bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 hover:shadow-blue-200 transition-all active:scale-95`
*   **Secondary**: `bg-white text-gray-500 border border-gray-100 font-black text-[10px] uppercase hover:bg-gray-50 transition-all`
*   **Action Icon**: `w-11 h-11 rounded-xl flex items-center justify-center transition-all`

### 📋 Data Tables
*   **Container**: Background putih, border `gray-100`, rounded `[2.5rem]`.
*   **Header**: Teks `[10px]`, `font-black`, `text-gray-400`, `uppercase`, `tracking-widest`.
*   **Rows**: Hover state `bg-gray-50/50`, border bottom halus.
*   **Avatars**: Rounded `2xl`, gradient background, rotasi subtle (`-rotate-2`).

### ⌨️ Form Inputs
*   **Styles**: `bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all`
*   **Labels**: `text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1`

---

## 4. Interaction Patterns
1.  **Group Hover**: Gunakan `group/name` pada parent dan `group-hover/name:transform` pada child untuk interaksi kompleks.
2.  **Navigation**: Link siswa harus selalu menggunakan efek hover (ganti warna teks ke biru + rotasi avatar).
3.  **Loading States**: Tombol harus menampilkan spinner atau skeleton saat proses async.
4.  **Feedback**: Gunakan `StatusBadge` yang konsisten untuk semua entitas.

---

## 5. Standard Page Structure (Layout)
```jsx
<AppLayout title="Page Title">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 1. Header Section (Title & Actions) */}
        <div className="flex items-center justify-between">...</div>

        {/* 2. Stats Section (Optional) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">...</div>

        {/* 3. Main Content (Table/Form) */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">...</div>
    </div>
</AppLayout>
```

---

## 6. Iconography
*   **Library**: `@heroicons/react/24/outline`
*   **Size**: Default `w-5 h-5` untuk tombol, `w-6 h-6` untuk header section.
*   **Treatment**: Gunakan container berwarna muda (`bg-blue-50`) di belakang ikon untuk penekanan.
