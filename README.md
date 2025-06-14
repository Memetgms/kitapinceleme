# Online Kitap İnceleme - Frontend

Bu proje, Online Kitap İnceleme uygulamasının frontend kısmını içerir. Modern ve responsive bir tasarımla kitap listeleme, kategori filtreleme ve arama özelliklerini sunar.

## 🚀 Özellikler

- **Responsive Tasarım**: Mobil, tablet ve masaüstü uyumlu
- **Kitap Listeleme**: Tüm kitapları grid layout ile görüntüleme
- **Kategori Filtreleme**: Türlere göre kitap filtreleme
- **Arama Fonksiyonu**: Kitap adı, yazar ve açıklamada arama
- **Sıralama**: İsim, yazar, fiyat ve tarihe göre sıralama
- **Modern UI/UX**: Bootstrap 5 ve custom CSS ile modern tasarım
- **Loading States**: Yükleme animasyonları
- **Error Handling**: Hata durumları için kullanıcı dostu mesajlar

## 📁 Dosya Yapısı

```
├── index.html          # Ana sayfa HTML dosyası
├── styles.css          # Custom CSS stilleri
├── script.js           # JavaScript fonksiyonları
└── README.md           # Proje dokümantasyonu
```

## 🛠️ Teknolojiler

- **HTML5**: Semantik markup
- **CSS3**: Modern stillendirme ve animasyonlar
- **JavaScript (ES6+)**: Dinamik içerik ve API entegrasyonu
- **Bootstrap 5**: Responsive grid ve UI bileşenleri
- **Font Awesome**: İkonlar

## 🔧 Kurulum

1. **Backend'i Başlatın**: 
   - Backend projenizi çalıştırın
   - API endpoint'lerinin erişilebilir olduğundan emin olun

2. **API URL'ini Güncelleyin**:
   - `script.js` dosyasında `API_BASE_URL` değişkenini backend'inizin adresine göre güncelleyin
   ```javascript
   const API_BASE_URL = 'https://localhost:7001/api'; // Backend adresiniz
   ```

3. **Dosyaları Açın**:
   - `index.html` dosyasını bir web tarayıcısında açın
   - Veya bir local server kullanın (CORS sorunlarını önlemek için)

## 📡 API Endpoint'leri

Frontend aşağıdaki API endpoint'lerini kullanır:

- `GET /api/books` - Tüm kitapları getir
- `GET /api/genre` - Tüm kategorileri getir
- `GET /api/genre/{genreId}` - Belirli kategorideki kitapları getir

## 🎨 Tasarım Özellikleri

### Hero Section
- Gradient arka plan
- Animasyonlu kitap ikonu
- Arama kutusu

### Kitap Kartları
- Hover efektleri
- Responsive grid layout
- Kitap fotoğrafı veya placeholder ikon
- Fiyat ve tarih bilgileri

### Filtreleme
- Kategori butonları
- Dropdown menü
- Sıralama seçenekleri

## 🔄 Fonksiyonlar

### Ana Fonksiyonlar
- `loadAllBooks()` - Tüm kitapları yükle
- `loadGenres()` - Kategorileri yükle
- `loadBooksByGenre(genreId)` - Kategoriye göre kitapları yükle
- `searchBooks()` - Kitaplarda arama yap
- `sortBooks()` - Kitapları sırala

### Yardımcı Fonksiyonlar
- `displayBooks(books)` - Kitapları görüntüle
- `filterAndDisplayBooks()` - Filtreleme ve görüntüleme
- `showLoading(show)` - Yükleme animasyonu
- `showError(message)` - Hata mesajı göster

## 🎯 Gelecek Özellikler

- [ ] Kitap detay sayfası
- [ ] Kullanıcı girişi/kayıt işlemleri
- [ ] Kitap yorumları
- [ ] Favori kitaplar
- [ ] Admin paneli
- [ ] Kitap ekleme/düzenleme

## 🐛 Sorun Giderme

### CORS Hatası
Backend'de CORS ayarlarının doğru yapılandırıldığından emin olun.

### API Bağlantı Hatası
- Backend'in çalıştığından emin olun
- `API_BASE_URL`'in doğru olduğunu kontrol edin
- Network sekmesinde hata detaylarını inceleyin

### Responsive Sorunları
- Bootstrap CSS'in yüklendiğinden emin olun
- Viewport meta tag'inin mevcut olduğunu kontrol edin

## 📱 Tarayıcı Desteği

- Chrome (önerilen)
- Firefox
- Safari
- Edge

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Sorularınız için lütfen iletişime geçin. 