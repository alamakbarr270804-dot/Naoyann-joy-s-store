document.addEventListener("DOMContentLoaded", function() {

    // ==========================================
    // 1. LOGIKA UNTUK HALAMAN PRODUK (BARANG)
    // ==========================================
    
    const sizeBoxes = document.querySelectorAll('.size-box');
    const teksUkuranDipilih = document.getElementById('teks-ukuran-dipilih');

    if(sizeBoxes.length > 0) {
        sizeBoxes.forEach(box => {
            box.addEventListener('click', function() {
                sizeBoxes.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // PERUBAHAN DI SINI: Deteksi otomatis pria/wanita
                if(teksUkuranDipilih) {
                    let teksSekarang = teksUkuranDipilih.innerText;
                    let kategoriGender = teksSekarang.split(' ')[0]; 
                    teksUkuranDipilih.innerText = kategoriGender + " " + this.innerText;
                }
            });
        });
    }

    const btnMinus = document.getElementById('btn-minus');
    const btnPlus = document.getElementById('btn-plus');
    const inputQty = document.getElementById('input-qty');
    const teksJumlahTabel = document.getElementById('teks-jumlah-tabel');
    const teksTotalHarga = document.getElementById('teks-total-harga');
    
    // MENGAMBIL HARGA DINAMIS DARI TOMBOL
    const btnAddToCart = document.getElementById('btn-add-to-cart');
    let hargaPerPcs = 0; 
    
    if(btnAddToCart && btnAddToCart.getAttribute('data-price')) {
        hargaPerPcs = parseInt(btnAddToCart.getAttribute('data-price'));
    } else {
        hargaPerPcs = 199000; // Harga default
    }

    if (btnPlus && btnMinus && inputQty) {
        btnPlus.addEventListener('click', function() {
            let currentVal = parseInt(inputQty.value);
            inputQty.value = currentVal + 1;
            updateTabelHarga(inputQty.value);
        });

        btnMinus.addEventListener('click', function() {
            let currentVal = parseInt(inputQty.value);
            if (currentVal > 1) { 
                inputQty.value = currentVal - 1;
                updateTabelHarga(inputQty.value);
            }
        });
    }

    function updateTabelHarga(qty) {
        if(teksJumlahTabel) teksJumlahTabel.innerText = qty;
        let total = qty * hargaPerPcs;
        if(teksTotalHarga) teksTotalHarga.innerText = "Rp " + total.toLocaleString('id-ID');
    }

    // Tombol BELI: Simpan data lalu otomatis pindah ke Keranjang.html
    if (btnAddToCart) {
        btnAddToCart.addEventListener('click', function(e) {
            e.preventDefault(); 
            
            // Membuat ID unik otomatis dari nama produk
            let namaProduk = document.getElementById('nama-produk').innerText;
            let idProduk = namaProduk.replace(/\s+/g, '-').toUpperCase();

            const productData = {
                id: idProduk,
                name: namaProduk,
                price: hargaPerPcs,
                image: document.getElementById('gambar-produk').src,
                size: document.getElementById('teks-ukuran-dipilih').innerText,
                qty: parseInt(document.getElementById('input-qty').value),
                selected: true
            };

            let cart = JSON.parse(localStorage.getItem('naoyann_cart')) || [];
            let existingProduct = cart.find(item => item.id === productData.id && item.size === productData.size);
            
            if (existingProduct) {
                existingProduct.qty += productData.qty;
            } else {
                cart.push(productData);
            }

            localStorage.setItem('naoyann_cart', JSON.stringify(cart));
            
            // Redirect langsung ke file keranjang.html
            window.location.href = "../keranjang.html";
        });
    }

    // Perbarui angka keranjang di Navbar
    function updateCartNavCount() {
        let cart = JSON.parse(localStorage.getItem('naoyann_cart')) || [];
        const countSpan = document.getElementById('cart-nav-count');
        if(countSpan) countSpan.innerText = cart.length;
    }
    updateCartNavCount();

});

// ==========================================
// 2. LOGIKA UNTUK HALAMAN KERANJANG (CART)
// ==========================================

function renderCartPage() {
    const cartRoot = document.getElementById('cart-root');
    if (!cartRoot) return; 

    let cart = [];
    try { cart = JSON.parse(localStorage.getItem('naoyann_cart')) || []; } catch (e) { cart = []; }
    
    const navCount = document.getElementById('cart-nav-count');
    if(navCount) navCount.innerText = cart.length;

    if (cart.length === 0) {
        cartRoot.innerHTML = `
            <div class="cart-container mt-3">
                <div class="cart-header">Tas Belanja</div>
                <div class="select-all-container d-flex align-items-center">
                    <input type="checkbox" class="teal-chk" disabled>
                    <label class="chk-label text-muted">Pilih Semua</label>
                </div>
                <div class="text-center py-5 mt-4 mb-4">
                    <h4 class="empty-cart-title">Yah, keranjang belanja Anda kosong...</h4>
                    <p class="empty-cart-subtitle">Yuk mulai belanja</p>
                    <a href="index.html" class="btn-cari-produk">CARI PRODUK</a>
                </div>
            </div>
        `;
        return;
    }

    let totalQty = 0;
    let totalPrice = 0;
    let allChecked = true;
    let itemsHtml = '';

    cart.forEach((item, index) => {
        totalQty += item.qty;
        if (item.selected) { totalPrice += (item.price * item.qty); } else { allChecked = false; }

        let formattedPrice = item.price.toLocaleString('id-ID').replace(/\./g, ',');

        itemsHtml += `
            <div class="cart-item">
                <input type="checkbox" class="teal-chk" style="margin-top: 35px;" ${item.selected ? 'checked' : ''} onchange="toggleSelect(${index}, this.checked)">
                <img src="${item.image}" class="cart-item-img" onerror="this.onerror=null; this.src='https://via.placeholder.com/100';">
                
                <div class="cart-item-details">
                    <div>
                        <div class="item-name">${item.name}</div>
                        <div class="item-variant">Ukuran : ${item.size}</div>
                        <div class="item-price">${formattedPrice}</div>
                    </div>
                    
                    <div class="cart-item-bottom">
                        <div class="item-qty-text">QTY : ${item.qty}</div>
                        <div class="action-icons">
                            <i class="fas fa-pencil-alt" title="Edit"></i>
                            <i class="fas fa-trash-alt" title="Hapus" onclick="removeItem(${index})"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    cartRoot.innerHTML = `
        <div class="row g-4 mt-2">
            <div class="col-lg-8 col-12">
                <div class="filled-cart-container">
                    <div class="cart-title">Tas Belanja (${totalQty})</div>
                    <div class="d-flex align-items-center border-bottom pb-3">
                        <input type="checkbox" id="check-all" class="teal-chk" ${allChecked ? 'checked' : ''} onchange="toggleAll(this.checked)">
                        <label for="check-all" class="chk-label">Pilih Semua</label>
                    </div>
                    <div class="item-list-wrapper">${itemsHtml}</div>
                </div>
            </div>
            <div class="col-lg-4 col-12">
                <div class="summary-box">
                    <h5 class="fw-bold mb-4">Ringkasan Belanja</h5>
                    <div class="d-flex justify-content-between mb-3">
                        <span>Total Harga</span>
                        <span class="fw-bold">Rp ${totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                    <hr>
                    <div class="d-flex justify-content-between mb-4">
                        <span class="fw-bold text-dark fs-5">Total Tagihan</span>
                        <span class="fw-bold text-danger fs-5">Rp ${totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                    <button class="btn btn-checkout" onclick="checkout()">Beli (${totalQty})</button>
                </div>
            </div>
        </div>
    `;
}

function toggleSelect(index, isChecked) {
    let cart = JSON.parse(localStorage.getItem('naoyann_cart')) || [];
    cart[index].selected = isChecked;
    localStorage.setItem('naoyann_cart', JSON.stringify(cart));
    renderCartPage();
}

function toggleAll(isChecked) {
    let cart = JSON.parse(localStorage.getItem('naoyann_cart')) || [];
    cart.forEach(item => item.selected = isChecked);
    localStorage.setItem('naoyann_cart', JSON.stringify(cart));
    renderCartPage();
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('naoyann_cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('naoyann_cart', JSON.stringify(cart));
    renderCartPage();
}

function checkout() {
    let cart = JSON.parse(localStorage.getItem('naoyann_cart')) || [];
    let selectedItems = cart.filter(item => item.selected);
    if(selectedItems.length === 0) {
        alert("Silakan centang minimal 1 barang yang ingin dibeli terlebih dahulu.");
    } else {
        alert("Berhasil! Mengarahkan ke halaman pembayaran...");
    }
}

renderCartPage();