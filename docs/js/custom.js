// to get current year
function getYear() {
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    document.querySelector("#displayYear").innerHTML = currentYear;
}

getYear();

// client section owl carousel
$(".client_owl-carousel").owlCarousel({
    loop: true,
    margin: 20,
    dots: false,
    nav: true,
    navText: [],
    autoplay: true,
    autoplayHoverPause: true,
    navText: [
        '<i class="fa fa-angle-left" aria-hidden="true"></i>',
        '<i class="fa fa-angle-right" aria-hidden="true"></i>'
    ],
    responsive: {
        0: {
            items: 1
        },
        768: {
            items: 2
        }
    }
});

// selected order storage helper
function saveSelectedOrder(item) {
    // legacy single-item setter (keeps backward compatibility)
    localStorage.setItem('selectedOrder', JSON.stringify(item));
}

function getSelectedOrder() {
    var raw = localStorage.getItem('selectedOrder');
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

// Cart helpers (multi-item support)
function getCart() {
    var raw = localStorage.getItem('cartItems');
    if (!raw) return [];
    try {
        return JSON.parse(raw) || [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    if (!Array.isArray(cart)) cart = [];
    localStorage.setItem('cartItems', JSON.stringify(cart));
}

function addToCart(item) {
    var cart = getCart();
    var priceValue = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
    // try to find existing by title + price
    var idx = cart.findIndex(function(ci) { return ci.title === item.title && ci.price === item.price; });
    if (idx >= 0) {
        cart[idx].quantity = (cart[idx].quantity || 1) + 1;
    } else {
        cart.push({
            title: item.title,
            price: item.price,
            img: item.img,
            desc: item.desc || '',
            quantity: 1
        });
    }
    saveCart(cart);
}

function removeFromCart(index) {
    var cart = getCart();
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        saveCart(cart);
    }
}

function updateCartItemQuantity(index, qty) {
    var cart = getCart();
    qty = parseInt(qty, 10) || 0;
    if (index >= 0 && index < cart.length) {
        if (qty < 1) {
            // remove if quantity set to 0
            cart.splice(index, 1);
        } else {
            cart[index].quantity = qty;
        }
        saveCart(cart);
    }
}

function formatCurrency(value) {
    return '$' + value.toFixed(2);
}

function updateSidebarSummary(qty, unitPrice) {
    // If passed a cart array in place of qty, compute across cart
    var subtotal = 0;
    if (Array.isArray(qty)) {
        var cart = qty;
        cart.forEach(function(it) {
            var p = parseFloat((it.price || '').toString().replace(/[^0-9.]/g, '')) || 0;
            var q = parseInt(it.quantity, 10) || 0;
            subtotal += p * q;
        });
    } else {
        subtotal = (qty || 0) * (unitPrice || 0);
    }
    var tax = subtotal * 0.08;
    var discount = 0;
    var shipping = 0;
    var total = subtotal + tax - discount + shipping;

    $('#summarySubtotal').text(formatCurrency(subtotal));
    $('#summaryTax').text(formatCurrency(tax));
    $('#summaryShipping').text(shipping === 0 ? 'FREE' : formatCurrency(shipping));
    $('#summaryDiscount').text('-' + formatCurrency(discount));
    $('#summaryTotal').text(formatCurrency(total));
}

function updateOrderSummary() {
    var qty = parseInt($('#orderQuantity').val(), 10) || 1;
    var unitPrice = parseFloat($('#selectedProductSection').data('unit-price')) || 0;
    var subtotal = unitPrice * qty;
    var tax = subtotal * 0.08;
    var discount = 0;
    var shipping = 0;
    var total = subtotal + tax - discount + shipping;
    $('#orderTotal').text(formatCurrency(total));
    updateSidebarSummary(qty, unitPrice);
}

function renderOrdersPageSelection() {
        var section = $('#selectedProductSection');
        if (!section.length) return;
        var cart = getCart();
        if (!cart || cart.length === 0) {
                section.html('<div class="col-12"><div class="alert alert-info text-center mb-0">Your cart is empty. Browse <a href="products.html">Products</a> and add items to place an order.</div></div>');
                updateSidebarSummary([], 0);
                return;
        }

        var rows = cart.map(function(it, idx) {
                var p = parseFloat((it.price || '').toString().replace(/[^0-9.]/g, '')) || 0;
                var q = parseInt(it.quantity, 10) || 1;
                var subtotal = p * q;
                var tax = subtotal * 0.08;
                var itemTotal = formatCurrency(subtotal + tax);
                return `
                        <div class="list-group-item py-3">
                            <div class="row align-items-center">
                                <div class="col-md-2 text-center mb-3 mb-md-0">
                                    <img src="${it.img}" alt="${it.title}" class="img-fluid" style="max-height:90px;">
                                </div>
                                <div class="col-md-5">
                                    <h6 class="mb-1">${it.title}</h6>
                                    <p class="mb-1 text-pebble">${it.desc || ''}</p>
                                    <p class="mb-1"><strong>Unit price:</strong> ${it.price}</p>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-group mb-2">
                                        <label>Quantity</label>
                                        <input type="number" min="1" class="form-control cart-qty" data-index="${idx}" value="${q}">
                                    </div>
                                    <p class="mb-2"><strong>Item total:</strong> <span class="item-total" data-index="${idx}">${itemTotal}</span></p>
                                </div>
                                <div class="col-md-2 text-right">
                                    <button class="btn btn-outline-danger btn-sm remove-item" data-index="${idx}">Remove</button>
                                </div>
                            </div>
                        </div>
                `;
        }).join('');

        var html = `
                <div class="col-12">
                    <div class="list-group mb-4">
                        <div class="list-group-item p-3 bg-snow">
                            <h6 class="mb-0">Your Cart (${cart.length} item${cart.length>1?'s':''})</h6>
                        </div>
                        ${rows}
                        <div class="list-group-item p-3 text-right">
                            <button id="confirmCartButton" class="btn btn-primary">Confirm Order (${formatCurrency(computeCartTotal(cart))})</button>
                        </div>
                    </div>
                </div>
        `;

        section.html(html);
        updateSidebarSummary(cart, 0);
}

function computeCartTotal(cart) {
        cart = cart || getCart();
        var subtotal = 0;
        cart.forEach(function(it) {
                var p = parseFloat((it.price || '').toString().replace(/[^0-9.]/g, '')) || 0;
                var q = parseInt(it.quantity, 10) || 0;
                subtotal += p * q;
        });
        var tax = subtotal * 0.08;
        var discount = 0;
        var shipping = 0;
        return subtotal + tax - discount + shipping;
}

// Quick view modal: populate and show
$(document).on('click', '.quick-view', function(e) {
    e.preventDefault();
    var card = $(this).closest('.box');
    var title = card.find('.product-title').text().trim();
    var price = card.find('.price span').text().trim();
    var img = card.find('.img-box img').attr('src');
    var desc = card.find('.product-title').text().trim();

    window.selectedProduct = {
        title: title,
        price: price,
        img: img,
        desc: 'Delicious and freshly prepared.'
    };

    $('#quickViewModal .modal-title').text(title);
    $('#quickViewModal .modal-price').text(price);
    $('#quickViewModal .modal-image').attr('src', img);
    $('#quickViewModal').modal('show');
});

$(document).on('click', '#modalOrderButton', function(e) {
    e.preventDefault();
    if (!window.selectedProduct) return;
    addToCart(window.selectedProduct);
    // close modal and show lightweight confirmation so user can continue shopping
    $('#quickViewModal').modal('hide');
    var container = $('.container').first();
    var alert = $('<div class="alert alert-success add-to-cart-alert">Added to cart. <a href="orders.html">View Cart</a></div>');
    container.prepend(alert);
    setTimeout(function() { alert.fadeOut(300, function() { $(this).remove(); }); }, 3000);
});

// Cart quantity change (delegated)
$(document).on('input', '.cart-qty', function() {
    var idx = parseInt($(this).data('index'), 10);
    var qty = parseInt($(this).val(), 10) || 0;
    updateCartItemQuantity(idx, qty);
    // refresh item total and sidebar
    var cart = getCart();
    if (cart[idx]) {
        var p = parseFloat((cart[idx].price || '').toString().replace(/[^0-9.]/g, '')) || 0;
        var subtotal = p * (parseInt(cart[idx].quantity, 10) || 0);
        var tax = subtotal * 0.08;
        var itemTotal = formatCurrency(subtotal + tax);
        $('.item-total[data-index="' + idx + '"]').text(itemTotal);
    }
    $('#confirmCartButton').text('Confirm Order (' + formatCurrency(computeCartTotal(cart)) + ')');
    updateSidebarSummary(cart, 0);
});

// Remove item from cart
$(document).on('click', '.remove-item', function(e) {
    e.preventDefault();
    var idx = parseInt($(this).data('index'), 10);
    removeFromCart(idx);
    renderOrdersPageSelection();
});

// Confirm entire cart
$(document).on('click', '#confirmCartButton', function(e) {
    e.preventDefault();
    var cart = getCart();
    if (!cart || cart.length === 0) return;
    var total = computeCartTotal(cart);
    // mark quantities into items and save
    saveCart(cart);
    // show confirmation alert
    var msg = 'Order confirmed. Total amount: ' + formatCurrency(total) + '. Thank you!';
    if ($('#selectedProductSection .order-confirmed-alert').length === 0) {
        $('#selectedProductSection').prepend('<div class="col-12 order-confirmed-alert"><div class="alert alert-success">' + msg + '</div></div>');
    } else {
        $('#selectedProductSection .order-confirmed-alert .alert').text(msg);
    }
    // update sidebar
    updateSidebarSummary(cart, 0);
});

$(document).ready(function() {
    renderOrdersPageSelection();
});

/** google_map js **/

function myMap() {
    var mapProp = {
        center: new google.maps.LatLng(40.712775, -74.005973),
        zoom: 18,
    };
    var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
}