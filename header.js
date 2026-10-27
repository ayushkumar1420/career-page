document.querySelectorAll('.career-hero .mil-animation-frame').forEach(function (frame) {
    var firstAnimation = frame.querySelector('.mil-animation');
    if (!firstAnimation || !firstAnimation.querySelector('.mil-dodecahedron')) {
        return;
    }

    [
        { className: 'mil-position-2', initialScale: '1.3', finalScale: '.8' },
        { className: 'mil-position-3', initialScale: '.52', finalScale: '.32' }
    ].forEach(function (position) {
        var animation = firstAnimation.cloneNode(true);
        animation.classList.remove('mil-position-1');
        animation.classList.add(position.className);
        animation.setAttribute('data-value-1', position.initialScale);
        animation.setAttribute('data-value-2', position.finalScale);
        frame.appendChild(animation);
    });
});

document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('.career-menu-toggle');
    var navigation = document.getElementById('careerMainNav');

    if (!toggle || !navigation) {
        return;
    }

    function closeMenu() {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation menu');
        navigation.classList.remove('is-open');
    }

    toggle.addEventListener('click', function () {
        var isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!isExpanded));
        toggle.setAttribute('aria-label', isExpanded ? 'Open navigation menu' : 'Close navigation menu');
        navigation.classList.toggle('is-open', !isExpanded);
    });

    navigation.addEventListener('click', function (event) {
        if (event.target.closest('a')) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });
});
