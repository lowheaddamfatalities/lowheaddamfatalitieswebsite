 // -------------------- DATA LAYER --------------------
        const DataService = (function() {
            // Private variables
            let damData = [];
            let metaData = {};
            const DATA_URL = "https://script.google.com/macros/s/AKfycbzcHGj4uH2fZB5JPNiRGYoc60Xt8w_aZobIkTnp2vdcEs9e5kRerFsmwqP0VW1VvP-KRQ/exec";
            const stateMap = {
                    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
                    'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
                    'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
                    'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
                    'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
                    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
                    'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
                    'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
                    'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
                    'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
                    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
                    'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
                    'wisconsin': 'WI', 'wyoming': 'WY'
                };

            // Create a reverse map from abbreviations to full names
                    const reverseStateMap = Object.fromEntries(Object.entries(stateMap).map(([name, abbr]) => [abbr.toLowerCase(), name])
                );

            // Private methods
            async function fetchData() {
                try {
                    const response = await fetch(DATA_URL);
                    const json = await response.json();

                    // Process each dam to sort incidents by date (newest first)
                    json.dams.forEach(dam => {
                        if (dam.incidents && dam.incidents.length > 0) {
                            // Sort incidents by date (newest first)
                            dam.incidents.sort((a, b) => {
                                const dateA = new Date(parseDateString(a.date));
                                const dateB = new Date(parseDateString(b.date));
                                return dateB - dateA;
                            });
                        }
                    });

                    damData = json.dams;
                    metaData = json.meta;
                    return damData;

                } catch (error) {
                    console.error("Error fetching data:", error);
                    throw new Error("Failed to fetch dam data");
                }
            }

    // Helper function to parse date strings of various formats
    function parseDateString(dateStr) {
    // Handle missing or invalid date strings
    if (!dateStr || dateStr.trim() === '' || dateStr.toLowerCase() === 'unknown date') {
        return new Date(0); // Default to ancient date if missing or unknown
    }

     
    // Handle MM/DD/YYYY or MM-DD-YYYY
    const usMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (usMatch) {
        return new Date(`${usMatch[3]}-${usMatch[1].padStart(2, '0')}-${usMatch[2].padStart(2, '0')}`);
    }

    // Handle YYYY-MM-DD (ISO)
    const isoMatch = dateStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (isoMatch) {
        return new Date(dateStr);
    }

    // Try to parse directly (for "Month Day, Year" format)
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        return date;
    }

    // Default if nothing works - only log warning for truly unexpected formats
    if (dateStr.toLowerCase() !== 'unknown date') {
        console.warn(`Could not parse date: ${dateStr}`);
    }
    return new Date(0);
}

            // Extract date parts for filtering
            function extractDateParts(dateStr) {
                const date = parseDateString(dateStr);
                return {
                    year: date.getFullYear(),
                    month: date.getMonth() + 1, // 1-12
                    day: date.getDate()
                };
            }

            // Public API
            return {
                initialize: async function() {
                    damData = await fetchData();
                    return damData;
                },

                getData: function() {
                    return damData;
                },

                 getMeta: function() {
                     return metaData;
                 },
             

                getDamById: function(id) {
                    return damData.find(dam => dam.id === id);
                },

                getSortedDams: function(sortBy = 'name', order = 'asc') {
                return [...damData].sort((a, b) => {
                    if (sortBy === 'fatalities') {
                        return order === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy];
                    } else if (sortBy === 'name') {
                        const nameA = (a.name || '').toLowerCase();
                        const nameB = (b.name || '').toLowerCase();
                        return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
                    } else if (sortBy === 'state') {
                        const stateA = (a.state || '').toLowerCase();
                        const stateB = (b.state || '').toLowerCase();
                        return order === 'asc' ? stateA.localeCompare(stateB) : stateB.localeCompare(stateA);
                    } else if (sortBy === 'river') {
                        const riverA = (a.River_name || '').toLowerCase();
                        const riverB = (b.River_name || '').toLowerCase();
                        return order === 'asc' ? riverA.localeCompare(riverB) : riverB.localeCompare(riverA);
                    }
                    return 0;
                });
            },

                searchDams: function(criteria) {
    return damData.filter(dam => {
     
        // State Search
        if (criteria.state) {
            if (!dam.state || dam.state.toUpperCase() !== criteria.state.toUpperCase()) {
                return false;
            }
        }

        // River Name Search
        if (criteria.riverName) {
          const riverName = criteria.riverName.toLowerCase();
           if (!dam.River_name || !dam.River_name.toLowerCase().includes(riverName)) {
               return false;
            }
        }
        
        // Text search
        if (criteria.text) {
            const searchTerm = criteria.text.trim().toLowerCase();

            const maybeAbbr = stateMap[searchTerm]; // e.g., "texas" => "TX"
            const maybeFull = reverseStateMap[searchTerm]; // e.g., "tx" => "Texas"

            const nameMatch = dam.name?.toLowerCase().includes(searchTerm) || false;
            const locationMatch = dam?.location.toLowerCase().includes(searchTerm) || false;
            const countyMatch = dam.county ? dam.county.toLowerCase().includes(searchTerm) : false;            
            const riverMatch = dam.River_name?.toLowerCase().includes(searchTerm) || false;
         
            let stateMatch = false;
            if (dam.state) {
                const damStateUpper = dam.state.toUpperCase();
                if (
                    damStateUpper === searchTerm.toUpperCase() ||
                    damStateUpper === (maybeAbbr || "").toUpperCase() ||
                    (maybeFull && maybeFull.toLowerCase() === dam.state.toLowerCase())
                ) {
                    stateMatch = true;
                }
            }

            let descriptionMatch = false;
            if (dam.incidents && dam.incidents.length > 0) {
                descriptionMatch = dam.incidents.some(incident =>
                    incident.description && incident.description.toLowerCase().includes(searchTerm)
                );
            }

            if (!(nameMatch || locationMatch || countyMatch || stateMatch || descriptionMatch)) {
                return false;
            }
        }

        // Fatality count filter
        if (criteria.minFatalities !== undefined || criteria.maxFatalities !== undefined) {
            const minFatalities = criteria.minFatalities !== undefined ? parseInt(criteria.minFatalities) : 0;
            const maxFatalities = criteria.maxFatalities !== undefined ? parseInt(criteria.maxFatalities) : Infinity;

            if (dam.fatalities < minFatalities || dam.fatalities > maxFatalities) {
                return false;
            }
        }

        // Date range filter
        if (criteria.startDate || criteria.endDate) {
            if (!dam.incidents || dam.incidents.length === 0) {
                return false;
            }

            const startDate = criteria.startDate ? new Date(criteria.startDate) : new Date(0);
            const endDate = criteria.endDate ? new Date(criteria.endDate) : new Date(9999, 11, 31);

            const hasIncidentInRange = dam.incidents.some(incident => {
                const incidentDate = parseDateString(incident.date);
                return incidentDate >= startDate && incidentDate <= endDate;
            });

            if (!hasIncidentInRange) {
                return false;
            }
        }

        return true;
    });
},    

                // Utility function exposed for date parsing elsewhere
                parseDateString: parseDateString
            };
        })();

        // -------------------- UI LAYER --------------------
        const UIController = (function() {
            // DOM references
            const DOMElements = {
                map: document.getElementById('map'),
                damList: document.getElementById('damList'),
                searchInput: document.getElementById('searchInput'),
                loading: document.querySelector('.loading'),
                lastUpdated: document.getElementById('lastUpdated'),
                totalFatalities: document.getElementById('totalFatalities'),
                fatalSites: document.getElementById('fatalSites'),
                maxFatalities: document.getElementById('maxFatalities'),
                siteWithMostFatalities: document.getElementById('siteWithMostFatalities'),
                avgFatalitiesPerSite: document.getElementById('avgFatalitiesPerSite'),
                sortBy: document.getElementById('sortBy'),

                // Advanced search elements
                advancedSearchBtn: document.getElementById('advancedSearchBtn'),
                advancedSearchPanel: document.getElementById('advancedSearchPanel'),
                closeAdvancedSearch: document.getElementById('closeAdvancedSearch'),
                incidentStartDate: document.getElementById('incidentStartDate'),
                incidentEndDate: document.getElementById('incidentEndDate'),
                fatalityMin: document.getElementById('fatalityMin'),
                fatalityMax: document.getElementById('fatalityMax'),
                keywordSearch: document.getElementById('keywordSearch'),
                riverNameSearch: document.getElementById('riverNameSearch'),
                applyAdvancedSearch: document.getElementById('applyAdvancedSearch'),
                resetAdvancedSearch: document.getElementById('resetAdvancedSearch'),
                stateFilter: document.getElementById('stateFilter'),
                activeFilters: document.getElementById('activeFilters')
            };

            // Private methods
            function createDamListItem(dam) {
    const damItem = document.createElement('div');
    damItem.className = 'dam-item';
    damItem.dataset.damId = dam.id;
    // Create dam header with name, location and toggle button
    const damHeader = document.createElement('div');
    damHeader.className = 'dam-header';
    const damInfo = document.createElement('div');
    damInfo.innerHTML = `
      <div class="dam-name"> ${dam.name}${dam.River_name && dam.River_name.trim() !== '' ? ' - ' + dam.River_name : ''} </div>
        <div class="dam-location"> ${dam.location}${dam.county ? ' - ' + dam.county : ''} </div>
    <div class="dam-fatalities"> ${dam.fatalities} ${dam.fatalities === 1 ? 'fatality' : 'fatalities'} </div>
    `;
    const toggleIndicator = document.createElement('span');
    toggleIndicator.className = 'toggle-indicator';
    toggleIndicator.innerHTML = '▼';
    damHeader.appendChild(damInfo);
    damHeader.appendChild(toggleIndicator);
    damItem.appendChild(damHeader);
    // Create incidents container (initially hidden)
    const incidentsContainer = document.createElement('div');
    incidentsContainer.className = 'dam-incidents-container';
    // Add incident cards if there are any
    if (dam.incidents && dam.incidents.length > 0) {
        const incidentHeader = document.createElement('div');
        incidentHeader.className = 'incident-header';
        incidentHeader.textContent = `Incident History (${dam.incidents.length} ${dam.incidents.length === 1 ? 'incident' : 'incidents'})`;
        incidentsContainer.appendChild(incidentHeader);
        dam.incidents.forEach(incident => {
            const incidentCard = createIncidentCard(incident);
            incidentsContainer.appendChild(incidentCard);
        });
    } else {
        const noIncidents = document.createElement('div');
        noIncidents.className = 'no-incidents';
        noIncidents.textContent = 'No incident details available.';
        incidentsContainer.appendChild(noIncidents);
    }
    damItem.appendChild(incidentsContainer);
    // Add click event for toggling incidents
    damHeader.addEventListener('click', function(e) {
        e.stopPropagation();
        const isVisible = toggleIncidents(incidentsContainer, toggleIndicator);
        
        if (isVisible) {
            // Zoom to dam location when expanding incidents
            MapController.focusOnDam(dam.id, 12); // Zoom level 12
         
            // Add image if it exists
            if (!damItem.querySelector('.dam-image')&& dam.imageUrl && dam.imageUrl !== 'null') {
                const image = document.createElement('img');
                image.src = `assets/images/${dam.imageUrl}`;
                image.className = 'dam-image';
                image.style.cssText = 'max-width: 100%; border-radius: 6px; margin-top: 10px;';
                damItem.insertBefore(image, incidentsContainer);
            }
        } else {
            // Remove image if it exists when closing
            const existingImage = damItem.querySelector('.dam-image');
            if (existingImage) {
                damItem.removeChild(existingImage);
            }
        }
    });
    
    return damItem;
}

            function createIncidentCard(incident) {
                const card = document.createElement('div');
                card.className = 'incident-card';
                let cardHtml = `
                <div class="incident-date">${incident.date}</div>
                <div class="incident-fatalities">${incident.fatalities} ${incident.fatalities === 1 ? 'fatality' : 'fatalities'}</div>
                <div class="incident-description">${incident.description}</div>
                `;
                 // Add validation link if available - check webaddress first, then file
                   if (incident.validation_webaddress || incident.validation_file) {
                    cardHtml += `<div class="incident-validation">`;
                
                    if (incident.validation_webaddress) {
                        cardHtml += `
                        <a href="${incident.validation_webaddress}" target="_blank">Web Source</a>
                        `;
                    }
                
                    if (incident.validation_file) {
                        cardHtml += `
                        <a href="assets/validation_uploads/${incident.validation_file}" target="_blank">File Source</a>
                        `;
                    }
                
                    cardHtml += `</div>`;
                }

                // Append image if available
                if (incident.image && incident.image !== 'null' && incident.image.trim() !== '') {
                    const imagePath = `assets/images/${incident.image}`;
                    cardHtml += `
                    <div class="incident-image">
                    <img src="${imagePath}" alt="Incident photo" style="max-width: 100%; border-radius: 4px; margin-bottom: 10px;">
                    </div>
                    `;
                }
                // Documentation links (if any)
                let docsHtml = '';
                if (incident.webDocumentation || incident.fileDocumentation) {
                    docsHtml = '<div class="documentation-links">';
                    if (incident.webDocumentation) {
                        docsHtml += `
                        <a href="${incident.webDocumentation}" target="_blank" class="doc-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        Web Documentation
                        </a>`;
                    }
                    if (incident.fileDocumentation) {
                        docsHtml += `
                        <a href="${incident.fileDocumentation}" target="_blank" class="doc-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                       a>`;
                    }
                    docsHtml += '</div>';
                }
                card.innerHTML = cardHtml + docsHtml;
                return card;
            }

            function toggleIncidents(container, indicator) {
                const isVisible = container.classList.toggle('visible');

                if (isVisible) {
                    indicator.classList.add('open');
                    indicator.innerHTML = '▲';
                } else {
                    indicator.classList.remove('open');
                    indicator.innerHTML = '▼';
                }
                return isVisible;
            }

            function createPopupContent(dam) {
                let content = `<div class="marker-popup">
                <h3>${dam.name}</h3>`;
                if (dam.imageUrl && dam.imageUrl !== 'null' && dam.imageUrl.trim() !== '') {
                    content += `<div class="popup-image" id="popup-image-${dam.id}"></div>`;
                }
                content += `
                <p><strong>Location:</strong> ${dam.location}</p>`;
                if (dam.county) {
                    content += `<p><strong>County:</strong> ${dam.county}</p>`;
                }
                content += `
                <p><strong>Fatalities:</strong> ${dam.fatalities}</p>
                <button onclick="AppController.showDamDetails(${dam.id})" style="background-color: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 10px;">View Incidents</button>
                </div>`;
                return content;
            }


            // Public API
            return {
                getDOMElements: function() {
                    return DOMElements;
                },

                populateDamList: function(dams) {
                    DOMElements.damList.innerHTML = '';

                    dams.forEach(dam => {
                        const damItem = createDamListItem(dam);
                        DOMElements.damList.appendChild(damItem);
                    });
                },

                createPopupContent: createPopupContent,

                updateStatistics: function(stats) {
                    DOMElements.totalFatalities.textContent = stats.totalFatalities;
                    DOMElements.fatalSites.textContent = stats.fatalSites;
                    DOMElements.maxFatalities.textContent = stats.maxFatalities;
                    DOMElements.siteWithMostFatalities.textContent = stats.siteWithMostFatalities;
                    DOMElements.avgFatalitiesPerSite.textContent = stats.avgFatalitiesPerSite;
                },

                highlightDamInList: function(damId, shouldExpand = false) {
                const listItems = document.querySelectorAll('.dam-item');
            
                for (const item of listItems) {
    item.style.backgroundColor = '';

    if (parseInt(item.dataset.damId) === damId) {
        item.style.backgroundColor = '#e3f2fd';

        if (shouldExpand) {
            const incidentsContainer = item.querySelector('.dam-incidents-container');
            const toggleIndicator = item.querySelector('.toggle-indicator');

            if (incidentsContainer && !incidentsContainer.classList.contains('visible')) {
                const isVisible = toggleIncidents(incidentsContainer, toggleIndicator);

                const dam = DataService.getDamById(damId);
                if (isVisible && dam.imageUrl && dam.imageUrl !== 'null' && dam.imageUrl.trim() !== '') {
                    const existingImage = item.querySelector('.dam-image');
                    if (!existingImage) {
                        const image = document.createElement('img');
                        image.src = `assets/images/${dam.imageUrl}`;
                        image.className = 'dam-image';
                        image.style.cssText = 'max-width: 100%; border-radius: 6px; margin-top: 10px;';
                        item.insertBefore(image, incidentsContainer);
                    }
                }
            }
        }

        return item; // ✅ Actually returns the DOM element now
    }
}
return null;

            },

                hideLoading: function() {
                    DOMElements.loading.style.display = 'none';
                },

                updateLastUpdated: function(dateStr) {
                      if (dateStr && dateStr !== "Unknown") {
                          const date = new Date(dateStr);
                          DOMElements.lastUpdated.textContent = date.toLocaleDateString(undefined, {
                              year: 'numeric', month: 'long', day: 'numeric'
                          });
                      } else {
                          DOMElements.lastUpdated.textContent = 'Unknown';
                      }
                  },


                showError: function(message) {
                    alert(message);
                }
            };
        })();

        // -------------------- MAP CONTROLLER --------------------
        const MapController = (function() {
            // Private variables
            let map;
            let markers = [];

            // Public API
            return {
                initialize: function(mapElement) {
                    // Center the map on the US
                    map = L.map(mapElement).setView([39.8283, -98.5795], 4);

                    // Add the tile layer (OpenStreetMap)
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(map);

                    return map;
                },

                addMarkers: function(dams, popupContentCallback, markerClickCallback) {
    // Clear any existing markers
    markers.forEach(marker => marker.remove());
    markers = [];

    dams.forEach(dam => {
        const lat = Number(dam.latitude);
        const lng = Number(dam.longitude);

        // Skip if lat/lng are not valid numbers
        if (isNaN(lat) || isNaN(lng)) {
            console.warn(`Skipping dam with invalid coordinates:`, dam);
            return; // Skips to the next iteration correctly
        }

        const marker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(popupContentCallback(dam));

        marker.damId = dam.id;
        markers.push(marker);

        // Marker click behavior
        marker.on('click', function() {
            markerClickCallback(dam.id, false); // Pass false to not expand

            // Lazy-load image
            setTimeout(() => {
                const container = document.getElementById(`popup-image-${dam.id}`);
                if (
                    container &&
                    dam.imageUrl &&
                    dam.imageUrl !== 'null' &&
                    dam.imageUrl.trim() !== '' &&
                    container.childNodes.length === 0
                ) {
                    const img = document.createElement('img');
                    img.src = `assets/images/${dam.imageUrl}`;
                    img.style.cssText = 'max-width: 100%; border-radius: 4px; margin-bottom: 10px;';
                    container.appendChild(img);
                }
            }, 150);
        });
    });

    return markers;
},


                filterMarkers: function(visibleDamIds) {
                    markers.forEach(marker => {
                        if (visibleDamIds.includes(marker.damId)) {
                            if (!map.hasLayer(marker)) {
                                marker.addTo(map);
                            }
                        } else {
                            marker.remove();
                        }
                    });
                },

                focusOnDam: function(damId, zoomLevel = 12) {
                    const dam = DataService.getDamById(damId);
                    if (dam) {
                        map.setView([dam.latitude, dam.longitude], zoomLevel);

                        // Find and open marker popup
                        const marker = markers.find(m => m.damId === damId);
                        if (marker) {
                            marker.openPopup();
                        }
                    }
                },

                getMap: function() {
                    return map;
                },

                getMarkers: function() {
                    return markers;
                },

                updateMarkerPopup: function(damId, content) {
                    const marker = markers.find(m => m.damId === damId);
                    if (marker) {
                        marker.setPopupContent(content);
                        if (!marker.isPopupOpen()) {
                            marker.openPopup();
                        }
                    }
                }
            };
        })();

        // -------------------- PAGINATION SUPPORT --------------------
        const PaginationController = (function() {
            const PAGE_SIZE = 20;
            let currentPage = 1;
            let filteredDams = [];

            function getPaginatedDams() {
                const start = (currentPage - 1) * PAGE_SIZE;
                const end = start + PAGE_SIZE;
                return filteredDams.slice(start, end);
            }

            function updatePageDisplay(uiCtrl) {
                const damList = getPaginatedDams();
                uiCtrl.populateDamList(damList);
                renderPaginationControls();
            }

            function renderPaginationControls() {
                const container = document.getElementById('paginationControls');
                container.innerHTML = '';

                const totalPages = Math.ceil(filteredDams.length / PAGE_SIZE);

                const prevBtn = document.createElement('button');
                prevBtn.textContent = 'Previous';
                prevBtn.disabled = currentPage === 1;
                prevBtn.onclick = () => {
                    currentPage--;
                    updatePageDisplay(UIController);
                };
                container.appendChild(prevBtn);

                for (let i = 1; i <= totalPages; i++) {
                    const pageBtn = document.createElement('button');
                    pageBtn.textContent = i;
                    pageBtn.className = 'pagination-btn';
                    if (i === currentPage) {
                        pageBtn.classList.add('active');
                    }
                    pageBtn.onclick = () => {
                        currentPage = i;
                        updatePageDisplay(UIController);
                    };
                    container.appendChild(pageBtn);
                }

                const nextBtn = document.createElement('button');
                nextBtn.textContent = 'Next';
                nextBtn.disabled = currentPage === totalPages;
                nextBtn.onclick = () => {
                    currentPage++;
                    updatePageDisplay(UIController);
                };
                container.appendChild(nextBtn);

                const pageInfo = document.createElement('div');
                pageInfo.style.marginTop = '10px';
                pageInfo.textContent = `Showing page ${currentPage} of ${totalPages}`;
                container.appendChild(pageInfo);
            }

            return {
              setFilteredDams: function(dams, targetPage = 1, scrollToId = null) {
                filteredDams = dams;
                currentPage = targetPage;
                updatePageDisplay(UIController);
            
                if (scrollToId !== null) {
                    setTimeout(() => {
                        const element = UIController.highlightDamInList(scrollToId, true);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 100);
                }
            },

                refresh: function() {
                    updatePageDisplay(UIController);
                }
            };
        })();

        // -------------------- APP CONTROLLER (MAIN) --------------------
        const AppController = (function(dataService, uiCtrl, mapCtrl) {
            // Private variables
            const DOM = uiCtrl.getDOMElements();

            // Private methods
            function setupEventListeners() {
                // Basic search functionality
                DOM.searchInput.addEventListener('input', function() {
                    const searchTerm = this.value.toLowerCase();
                    performSearch({ text: searchTerm });
                });
             
             // Sort Dams By Feature
             DOM.sortBy.addEventListener('change', function() {
                 const sortValue = this.value;
                 const order = sortValue === 'fatalities' ? 'desc' : 'asc';
                 const sortedDams = dataService.getSortedDams(sortValue, order);
                 PaginationController.setFilteredDams(sortedDams);
                 
                 // Update map markers
                 const visibleDamIds = sortedDams.map(dam => dam.id);
                 mapCtrl.filterMarkers(visibleDamIds);
             });


                // Advanced search toggle
                DOM.advancedSearchBtn.addEventListener('click', function() {
              const isOpen = DOM.advancedSearchPanel.style.display === 'block';
          
              DOM.advancedSearchPanel.style.display = isOpen ? 'none' : 'block';

                   // Toggle arrow indicator
                   this.classList.toggle('open');
                   this.innerHTML = isOpen ? 'Advanced Search ▼' : 'Advanced Search ▲';
               });


                // Close advanced search
                DOM.closeAdvancedSearch.addEventListener('click', function() {
                    DOM.advancedSearchPanel.style.display = 'none';
                });

                // Apply advanced search filters
                DOM.applyAdvancedSearch.addEventListener('click', function() {
                    applyAdvancedSearch();
                });

                // Reset advanced search filters
                DOM.resetAdvancedSearch.addEventListener('click', function() {
                    resetAdvancedSearch();
                });
            }

            // Perform search based on search criteria
            function performSearch(criteria) {
                // Apply search
                const filteredDams = dataService.searchDams(criteria);

              // Apply current sort to filtered results
                 const sortValue = DOM.sortBy.value;
                 const order = sortValue === 'fatalities' ? 'desc' : 'asc';
                 const sortedFilteredDams = [...filteredDams].sort((a, b) => {
                     if (sortValue === 'fatalities') {
                         return order === 'desc' ? b[sortValue] - a[sortValue] : a[sortValue] - b[sortValue];
                     } else if (sortValue === 'name') {
                         const nameA = (a.name || '').toLowerCase();
                         const nameB = (b.name || '').toLowerCase();
                         return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
                     } else if (sortValue === 'state') {
                         const stateA = (a.state || '').toLowerCase();
                         const stateB = (b.state || '').toLowerCase();
                         return order === 'asc' ? stateA.localeCompare(stateB) : stateB.localeCompare(stateA);
                     } else if (sortValue === 'river') {
                         const riverA = (a.River_name || '').toLowerCase();
                         const riverB = (b.River_name || '').toLowerCase();
                         return order === 'asc' ? riverA.localeCompare(riverB) : riverB.localeCompare(riverA);
                     }
                     return 0;
                 });


                // Update UI with filtered dams
                PaginationController.setFilteredDams(sortedFilteredDams);


                // Update map markers
                 const visibleDamIds = sortedFilteredDams.map(dam => dam.id);
                 mapCtrl.filterMarkers(visibleDamIds);

                // Update active filters display
                updateActiveFilters(criteria);
            }

            // Apply advanced search filters
            function applyAdvancedSearch() {
                const criteria = {
                    text: DOM.searchInput.value.toLowerCase(),
                    startDate: DOM.incidentStartDate.value || undefined,
                    endDate: DOM.incidentEndDate.value || undefined,
                    minFatalities: DOM.fatalityMin.value || undefined,
                    maxFatalities: DOM.fatalityMax.value || undefined,
                    keywords: DOM.keywordSearch.value || undefined,
                    riverName: DOM.riverNameSearch.value || undefined,
                    state: DOM.stateFilter.value || undefined
                };

                // Combine keyword search with text search
                if (criteria.keywords) {
                    criteria.text = criteria.text ? 
                        `${criteria.text} ${criteria.keywords}` : 
                        criteria.keywords;
                }

                performSearch(criteria);

                // Hide the advanced search panel
                DOM.advancedSearchPanel.style.display = 'none';
            }

            // Reset advanced search filters
            function resetAdvancedSearch() {
                // Clear all advanced search inputs
                DOM.incidentStartDate.value = '';
                DOM.incidentEndDate.value = '';
                DOM.fatalityMin.value = '';
                DOM.fatalityMax.value = '';
                DOM.keywordSearch.value = '';
                DOM.riverNameSearch.value = '';

                // Reset to basic search only
                performSearch({ text: DOM.searchInput.value.toLowerCase() });
            }

            // Update active filters display
            function updateActiveFilters(criteria) {
                DOM.activeFilters.innerHTML = '';

                // Date range filter
                if (criteria.startDate || criteria.endDate) {
                    const dateLabel = criteria.startDate && criteria.endDate ?
                        `Date: ${formatDate(criteria.startDate)} to ${formatDate(criteria.endDate)}` :
                        criteria.startDate ?
                            `Date: After ${formatDate(criteria.startDate)}` :
                            `Date: Before ${formatDate(criteria.endDate)}`;

                    addFilterTag(dateLabel, function() {
                        DOM.incidentStartDate.value = '';
                        DOM.incidentEndDate.value = '';
                        applyAdvancedSearch();
                    });
                }
             
               // River Names
               if (criteria.riverName) {
                  addFilterTag(`River: ${criteria.riverName}`, function() {
                      DOM.riverNameSearch.value = '';
                      applyAdvancedSearch();
                  });
              }


                // Fatality range filter
                if (criteria.minFatalities !== undefined || criteria.maxFatalities !== undefined) {
                    const fatalityLabel = criteria.minFatalities !== undefined && criteria.maxFatalities !== undefined ?
                        `Fatalities: ${criteria.minFatalities} to ${criteria.maxFatalities}` :
                        criteria.minFatalities !== undefined ?
                            `Fatalities: Min ${criteria.minFatalities}` :
                            `Fatalities: Max ${criteria.maxFatalities}`;

                    addFilterTag(fatalityLabel, function() {
                        DOM.fatalityMin.value = '';
                        DOM.fatalityMax.value = '';
                        applyAdvancedSearch();
                    });
                }

                // Keyword filter (only if different from search input)
                if (criteria.keywords && criteria.keywords !== criteria.text) {
                    addFilterTag(`Keywords: ${criteria.keywords}`, function() {
                        DOM.keywordSearch.value = '';
                        applyAdvancedSearch();
                    });
                }
            }

            // Helper function to add a filter tag
            function addFilterTag(label, removeCallback) {
                const tag = document.createElement('div');
                tag.className = 'filter-tag';
                tag.innerHTML = `
                    ${label}
                    <button class="remove-filter">×</button>
                `;

                // Add remove filter event
                tag.querySelector('.remove-filter').addEventListener('click', removeCallback);

                DOM.activeFilters.appendChild(tag);
            }

            // Format date for display
            function formatDate(dateStr) {
                const date = new Date(dateStr);
                return date.toLocaleDateString();
            }

            function calculateStatistics() {
                const dams = dataService.getData();
                let totalFatalities = 0;
                let mostDangerousDam = { name: '', fatalities: 0 };
                let damsWithFatalities = 0;

                dams.forEach(dam => {
                    totalFatalities += dam.fatalities;

                    if (dam.fatalities > 0) {
                        damsWithFatalities++;
                    }

                    if (dam.fatalities > mostDangerousDam.fatalities) {
                        mostDangerousDam = { name: dam.name, fatalities: dam.fatalities };
                    }
                });

                // Calculate average fatalities per site (only for sites with fatalities)
                const avgFatalitiesPerSite = damsWithFatalities > 0 ? 
                    (totalFatalities / damsWithFatalities).toFixed(1) : 0;

                return {
                    totalFatalities,
                    fatalSites: damsWithFatalities,
                    maxFatalities: mostDangerousDam.fatalities,
                    siteWithMostFatalities: mostDangerousDam.name,
                    avgFatalitiesPerSite
                };
            }

            // Public API
            return {
                init: async function() {
                    try {
                        // Initialize data
                        await dataService.initialize();

                        // Initialize map
                        mapCtrl.initialize(DOM.map);

                        // Add markers to map
                        mapCtrl.addMarkers(
                            dataService.getData(),
                            uiCtrl.createPopupContent,
                            this.highlightDam
                        );

                        // Calculate and display statistics
                        const stats = calculateStatistics();
                        uiCtrl.updateStatistics(stats);

                        // Populate dam list with sorted dams
                        const sortedDams = dataService.getSortedDams('name', 'asc');
                        PaginationController.setFilteredDams(sortedDams);

                        // Setup event listeners
                        setupEventListeners();

                        // Update UI state
                        uiCtrl.hideLoading();
                        uiCtrl.updateLastUpdated(dataService.getMeta()?.lastUpdated);

                    } catch (error) {
                        console.error("Error initializing the application:", error);
                        uiCtrl.showError("There was an error loading the data. Please try again later.");
                    }
                },

                highlightDam: function(damId, shouldExpand = false, shouldScroll = false) {
                  uiCtrl.highlightDamInList(damId, shouldExpand);
                  
                  if (shouldScroll) {
                      setTimeout(() => {
                          const damItem = document.querySelector(`[data-dam-id="${damId}"]`);
                          if (damItem) {
                              damItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                      }, 100);
                  }
              },

showDamDetails: function(damId) {
    const allDams = DataService.getSortedDams();
    const index = allDams.findIndex(d => d.id === damId);

    if (index === -1) return;

    const PAGE_SIZE = 20;
    const page = Math.floor(index / PAGE_SIZE) + 1;

    PaginationController.setFilteredDams(allDams, page, damId);
    PaginationController.refresh = function() {
    const start = (page - 1) * PAGE_SIZE;
    const pagedDams = allDams.slice(start, start + PAGE_SIZE);
    UIController.populateDamList(pagedDams);

    // Now call the central highlight function with scroll = true
    AppController.highlightDam(damId, true, true);
};

    PaginationController.refresh();
    MapController.focusOnDam(damId);
}

            };
        })(DataService, UIController, MapController);

        // Make AppController globally accessible for the "View Incidents" button in popups
        window.AppController = AppController;

        // Open the Google Form for reporting incidents
        function openReportForm() {
            // Google Form URL
            window.open('https://docs.google.com/forms/d/e/1FAIpQLSfuBcrTwOhsHVn6hPtdDmvcEXAMU2a8Sozux8hXwc8tXETUIA/viewform?usp=dialog', '_blank');
        }

        // Initialize when the page loads
        window.addEventListener('load', function() {
            AppController.init();
        });
