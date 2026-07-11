fetch('nav.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('navbar-placeholder').innerHTML = html;

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('data-page') === currentPage) {
                link.classList.add('active');
            }
        });
    })
    .catch(error => console.error('Error loading navbar:', error));
