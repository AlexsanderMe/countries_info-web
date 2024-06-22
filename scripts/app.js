document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const clearButton = document.getElementById('clear-button');
    const searchInput = document.getElementById('search-input');
    const sortFilter = document.getElementById('sort-filter');
    const countryContainer = document.getElementById('country-container');
    const paginationContainer = document.getElementById('pagination-container');

    const countriesPerPage = 12;
    let allCountries = [];
    let filteredCountries = [];
    let currentPage = 1;

    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            fetchCountryOrRegionData(query);
        } else {
            resetFilters();
            displayCountries(allCountries);
        }
    });

    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        sortFilter.value = '';
        resetFilters();
        displayCountries(allCountries);
    });

    sortFilter.addEventListener('change', () => {
        applySortAndDisplay(filteredCountries);
    });

    async function fetchCountryOrRegionData(query) {
        try {
            const response = await fetch(`https://restcountries.com/v3.1/name/${query}`);
            if (response.ok) {
                const data = await response.json();
                filteredCountries = data;
                applySortAndDisplay(filteredCountries);
                return;
            }

            const regionResponse = await fetch(`https://restcountries.com/v3.1/region/${query}`);
            if (regionResponse.ok) {
                const regionData = await regionResponse.json();
                filteredCountries = regionData;
                applySortAndDisplay(filteredCountries);
                return;
            }

            throw new Error('Network response was not ok');
        } catch (error) {
            displayError('Failed to fetch country or region data. Please try again.');
        }
    }

    async function fetchAllCountries() {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            allCountries = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
            filteredCountries = [...allCountries];
            displayCountries(allCountries);
        } catch (error) {
            displayError('Failed to fetch countries data. Please try again.');
        }
    }

    function displayCountries(countries) {
        countryContainer.innerHTML = '';
        const totalPages = Math.ceil(countries.length / countriesPerPage);
        const paginatedCountries = paginate(countries, countriesPerPage, currentPage);

        paginatedCountries.forEach(country => {
            const countryCard = document.createElement('div');
            countryCard.className = 'country-card';

            let populationClass = '';
            let areaClass = '';
            if (sortFilter.value === 'population') {
                populationClass = 'highlight';
            } else if (sortFilter.value === 'area') {
                areaClass = 'highlight';
            }

            countryCard.innerHTML = `
                <h2>${country.name.common}</h2>
                <p>Capital: ${country.capital ? country.capital[0] : 'N/A'}</p>
                <p>Region: ${country.region}</p>
                <p class="${populationClass}">Population: ${country.population.toLocaleString()}</p>
                <p class="${areaClass}">Area: ${country.area.toLocaleString()} km²</p>
                <img src="${country.flags.png}" alt="Flag of ${country.name.common}">
            `;

            countryContainer.appendChild(countryCard);
        });

        displayPagination(totalPages);
    }

    function displayPagination(totalPages) {
        paginationContainer.innerHTML = '';

        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        if (startPage > 1) {
            paginationContainer.appendChild(createPaginationButton(1));
            if (startPage > 2) {
                paginationContainer.appendChild(createEllipsis());
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationContainer.appendChild(createPaginationButton(i));
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationContainer.appendChild(createEllipsis());
            }
            paginationContainer.appendChild(createPaginationButton(totalPages));
        }
    }

    function createPaginationButton(page) {
        const button = document.createElement('button');
        button.className = 'pagination-button';
        button.textContent = page;

        if (page === currentPage) {
            button.classList.add('disabled');
        }

        button.addEventListener('click', () => {
            currentPage = page;
            displayCountries(filteredCountries);
        });

        return button;
    }

    function createEllipsis() {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'pagination-ellipsis';
        ellipsis.textContent = '...';
        return ellipsis;
    }

    function paginate(array, page_size, page_number) {
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    function sortCountries(countries, criteria) {
        if (criteria === 'population') {
            countries.sort((a, b) => b.population - a.population);
        } else if (criteria === 'area') {
            countries.sort((a, b) => b.area - a.area);
        } else {
            countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
        }
    }

    function applySortAndDisplay(countries) {
        sortCountries(countries, sortFilter.value);
        displayCountries(countries);
    }

    function displayError(message) {
        countryContainer.innerHTML = `<p class="error">${message}</p>`;
    }

    function resetFilters() {
        currentPage = 1;
        filteredCountries = [...allCountries];
        sortFilter.value = '';
        displayCountries(filteredCountries);
    }

    fetchAllCountries();
});