document.querySelectorAll('.career-hero .mil-animation-frame, .explore-hero .mil-animation-frame, .life-hero .mil-animation-frame').forEach(function (frame) {
    var firstAnimation = frame.querySelector('.mil-animation');
    if (!firstAnimation || !firstAnimation.querySelector('.mil-dodecahedron')) {
        return;
    }
    if (frame.querySelectorAll('.mil-animation').length > 1) {
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

function buildCareerServicesMenu() {
    var servicesList = document.getElementById('servicesMenuList');
    if (!servicesList || !window.SITE_SERVICES) return;

    var prefix = '../';
    var html = '';

    Object.keys(window.SITE_SERVICES).forEach(function (slug) {
        var service = window.SITE_SERVICES[slug];
        var servicePath = service.route || slug;
        var direct = service.direct_sub_services || [];
        var subPage = service.sub_services_page;
        var title = service.full_title || service.title || slug;

        html += '<li class="mil-service-menu-group mil-has-children">';
        html += '<a href="' + prefix + servicePath + '/index.html">' + title + '</a>';

        if (service.sub_services && service.sub_services.length) {
            html += '<ul class="mil-submenu">';
            service.sub_services.forEach(function (sub) {
                var isDirect = direct.indexOf(sub.slug) !== -1;
                var href = prefix + servicePath + '/' + (isDirect || !subPage ? sub.slug + '/index.html' : subPage);
                html += '<li><a href="' + href + '">' + sub.name + '</a></li>';
            });
            html += '</ul>';
        }
        html += '</li>';
    });

    servicesList.innerHTML = html;
}

function buildCareerPortfolioMenu() {
    var portfolioList = document.getElementById('portfolioMenuList');
    if (!portfolioList || !window.SITE_PORTFOLIO) return;

    var prefix = '../';
    var portfolio = window.SITE_PORTFOLIO;
    var html = '';

    if (portfolio.allProjects) {
        html += '<li><a href="' + prefix + portfolio.allProjects.href + '">' + portfolio.allProjects.name + '</a></li>';
    }

    if (portfolio.socialMediaManagement) {
        html += '<li class="mil-has-children mil-portfolio-social-menu">';
        html += '<a href="#">' + portfolio.socialMediaManagement.name + '</a>';
        html += '<ul class="mil-submenu">';
        (portfolio.socialMediaManagement.children || []).forEach(function (project) {
            html += '<li><a href="' + prefix + project.href + '">' + project.name + '</a></li>';
        });
        html += '</ul></li>';
    }

    portfolioList.innerHTML = html;
}

function initCareerMenu() {
    buildCareerServicesMenu();
    buildCareerPortfolioMenu();

    var menuFrame = document.querySelector('.mil-menu-frame');
    var menuButtons = document.querySelectorAll('.mil-menu-btn, .career-menu-toggle');

    if (!menuFrame) return;

    function openMenu() {
        menuFrame.classList.add('mil-active');
        menuButtons.forEach(function (btn) {
            btn.classList.add('mil-active');
            btn.setAttribute('aria-expanded', 'true');
        });
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        menuFrame.classList.remove('mil-active');
        menuButtons.forEach(function (btn) {
            btn.classList.remove('mil-active');
            btn.setAttribute('aria-expanded', 'false');
        });
        document.body.style.overflow = '';

        menuFrame.querySelectorAll('.mil-main-menu .mil-active').forEach(function (el) {
            el.classList.remove('mil-active');
        });
        menuFrame.querySelectorAll('.mil-main-menu .mil-sub-open').forEach(function (el) {
            el.classList.remove('mil-sub-open');
        });
    }

    function toggleMenu() {
        if (menuFrame.classList.contains('mil-active')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    menuButtons.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menuFrame.classList.contains('mil-active')) {
            closeMenu();
        }
    });

    // Close when clicking outside content
    menuFrame.addEventListener('click', function (e) {
        if (e.target === menuFrame || e.target.classList.contains('container') || e.target.classList.contains('mil-menu-layout')) {
            closeMenu();
        }
    });

    // Submenu accordion for mobile
    var mainLinks = menuFrame.querySelectorAll('.mil-main-menu > ul > li.mil-has-children > a');
    mainLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            var submenu = link.nextElementSibling;
            if (!submenu || !submenu.classList.contains('mil-submenu')) return;

            if (window.innerWidth <= 992) {
                e.preventDefault();
                var isOpen = submenu.classList.contains('mil-active');
                menuFrame.querySelectorAll('.mil-main-menu > ul > li > ul').forEach(function (ul) {
                    ul.classList.remove('mil-active');
                });
                menuFrame.querySelectorAll('.mil-main-menu > ul > li > a').forEach(function (a) {
                    a.classList.remove('mil-active');
                });
                if (!isOpen) {
                    link.classList.add('mil-active');
                    submenu.classList.add('mil-active');
                }
            }
        });
    });

    // Nested sub-services click for mobile
    menuFrame.addEventListener('click', function (e) {
        var groupLink = e.target.closest('.mil-service-menu-group > a, .mil-portfolio-social-menu > a, .mil-submenu > li.mil-has-children > a');
        if (groupLink && window.innerWidth <= 992) {
            var parentLi = groupLink.parentElement;
            var subUl = groupLink.nextElementSibling;
            if (subUl) {
                e.preventDefault();
                parentLi.classList.toggle('mil-sub-open');
                subUl.classList.toggle('mil-active');
            }
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCareerMenu);
} else {
    initCareerMenu();
}
