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
