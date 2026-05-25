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

function formatCurrency(value) {
    return '$' + value.toFixed(2);
}

function updateSidebarSummary(qty, unitPrice) {
    var subtotal = qty * unitPrice;
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
    var total = qty * unitPrice;
    $('#orderTotal').text(formatCurrency(total));
    updateSidebarSummary(qty, unitPrice);
}

function renderOrdersPageSelection() {
    var item = getSelectedOrder();
    var section = $('#selectedProductSection');
    if (!section.length) {
        return;
    }

    if (!item) {
        section.html('<div class="col-12"><div class="alert alert-info text-center mb-0">No product selected yet. Pick an item from <a href="products.html">Products</a> to begin your order.</div></div>');
        updateSidebarSummary(0, 0);
        return;
    }

    var priceValue = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
    var description = item.desc || 'Ready to order.';
    var quantity = item.quantity || 1;
    var itemTotal = formatCurrency(priceValue * quantity);

    section.html(`
        <div class="col-12">
          <div class="list-group mb-4">
            <div class="list-group-item p-3 bg-snow">
              <h6 class="mb-0">Selected Item</h6>
            </div>
            <div class="list-group-item py-3">
              <div class="row align-items-center">
                <div class="col-md-2 text-center mb-3 mb-md-0">
                  <img src="${item.img}" alt="${item.title}" class="img-fluid" style="max-height:110px;">
                </div>
                <div class="col-md-6">
                  <h5 class="mb-1">${item.title}</h5>
                  <p class="mb-2 text-pebble">${description}</p>
                  <p class="mb-1"><strong>Unit price:</strong> ${item.price}</p>
                </div>
                <div class="col-md-4">
                  <div class="form-group mb-2">
                    <label for="orderQuantity">Quantity</label>
                    <input id="orderQuantity" type="number" min="1" value="${quantity}" class="form-control">
                  </div>
                  <p class="mb-2"><strong>Total:</strong> <span id="orderTotal">${itemTotal}</span></p>
                  <button id="updateQuantityButton" class="btn btn-secondary btn-sm mr-2">Update</button>
                  <button id="confirmOrderButton" class="btn btn-primary btn-sm">Confirm Order</button>
                </div>
              </div>
            </div>
          </div>
        </div>
    `);
    section.data('unit-price', priceValue);
    updateSidebarSummary(quantity, priceValue);
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
    if (!window.selectedProduct) {
        return;
    }
    saveSelectedOrder(window.selectedProduct);
    window.location.href = 'orders.html';
});

$(document).on('click', '#updateQuantityButton', function(e) {
    e.preventDefault();
    updateOrderSummary();
});

$(document).on('input', '#orderQuantity', function() {
    updateOrderSummary();
});

$(document).on('click', '#confirmOrderButton', function(e) {
    e.preventDefault();
    var item = getSelectedOrder();
    if (!item) {
        return;
    }
    var qty = parseInt($('#orderQuantity').val(), 10) || 1;
    var unitPrice = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
    item.quantity = qty;
    item.total = formatCurrency(unitPrice * qty);
    saveSelectedOrder(item);

    if ($('#selectedProductSection .order-confirmed-alert').length === 0) {
        $('#selectedProductSection').prepend('<div class="col-12 order-confirmed-alert"><div class="alert alert-success">Your order is ready. Total amount: ' + item.total + '. You can continue to review or change quantity.</div></div>');
    }
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