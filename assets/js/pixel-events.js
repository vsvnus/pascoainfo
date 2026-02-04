/**
 * Facebook CAPI Deduplication Helper
 * Handles unique event_id generation and URL appending for Cakto
 */

// Helper to generate UUID v4
function generateEventID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Tracks InitiateCheckout and redirects to checkout with event_id
 * @param {string} url - The checkout URL
 */
window.trackAndRedirect = function (url) {
    var eventId = generateEventID();
    console.log('🚀 [Pixel] Tracking InitiateCheckout with EventID:', eventId);

    // Fire Facebook Pixel (Browser Side)
    // Partytown forwards this to the worker
    if (typeof fbq === 'function') {
        fbq('track', 'InitiateCheckout', {
            content_name: 'Fórmula Chocolate & Lucro',
            content_ids: ['formula-chocolate-lucro'],
            content_type: 'product',
            currency: 'BRL',
            value: 97.90
        }, {
            eventID: eventId
        });
    } else {
        console.warn('⚠️ [Pixel] fbq is not defined');
    }

    // Prepare URL with ID for Server Side (CAPI)
    // We pass 'event_id' parameter which Cakto (or backend middleware) should pick up
    var separator = url.includes('?') ? '&' : '?';
    var finalUrl = url + separator + 'event_id=' + eventId;

    // 500ms delay to ensure checking (worker) gets a chance to fire
    // For Partytown, allow a bit of time for the message to pass
    setTimeout(function () {
        window.location.href = finalUrl;
    }, 500);
};

// Auto-attach to static checkout links
document.addEventListener('DOMContentLoaded', function () {
    // Select all links pointing to Cakto checkout
    var checkoutLinks = document.querySelectorAll('a[href*="pay.cakto.com.br"]');

    checkoutLinks.forEach(function (link) {
        // Avoid double-binding if called multiple times
        if (link.dataset.pixelTracking === 'true') return;

        link.dataset.pixelTracking = 'true';
        link.addEventListener('click', function (e) {
            e.preventDefault(); // Stop default navigation
            window.trackAndRedirect(this.href);
        });

        console.log('✅ [Pixel] Attached tracking to link:', link.href);
    });
});
