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

// Quick view modal: populate and show
$(document).on('click', '.quick-view', function(e) {
    e.preventDefault();
    var card = $(this).closest('.box');
    var title = card.find('.product-title').text().trim();
    var price = card.find('.price span').text().trim();
    var img = card.find('.img-box img').attr('src');

    $('#quickViewModal .modal-title').text(title);
    $('#quickViewModal .modal-price').text(price);
    $('#quickViewModal .modal-image').attr('src', img);
    $('#quickViewModal').modal('show');
});

/** google_map js **/

function myMap() {
    var mapProp = {
        center: new google.maps.LatLng(40.712775, -74.005973),
        zoom: 18,
    };
    var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
}