document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const nameSearchInput = document.getElementById('nameSearch');
    const searchButton = document.getElementById('searchButton');
    const resultContainer = document.getElementById('resultContainer');
    const noResultContainer = document.getElementById('noResultContainer');
    const guestNameElement = document.getElementById('guestName');
    const tableNameElement = document.getElementById('tableName');
    const seatNumberElement = document.getElementById('seatNumber');
    const tablematesListElement = document.getElementById('tablematesList');
    const venueMapElement = document.getElementById('venueMap');
    const englishBtn = document.getElementById('englishBtn');
    const vietnameseBtn = document.getElementById('vietnameseBtn');
    const backButton = document.getElementById('backButton');
    const tryAgainButton = document.getElementById('tryAgainButton');

    // Set default language as Vietnamese
    window.currentLanguage = localStorage.getItem('weddinglanguage') || 'vi';

    console.log("DOM fully loaded");

    // Add event listeners
    if (searchButton) {
        searchButton.addEventListener('click', searchGuest);
        console.log("Search button event listener added");
    }

    if (nameSearchInput) {
        nameSearchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                searchGuest();
            }
        });
        console.log("Search input event listener added");
    }

    // Back button functionality
    if (backButton) {
        backButton.addEventListener('click', function() {
            resultContainer.classList.add('hidden');
            nameSearchInput.value = '';
            nameSearchInput.focus();

            // Remove highlighting from all tables
            document.querySelectorAll('.table, .fixed-element').forEach(table => {
                table.classList.remove('highlighted');
            });
            
            // Clear any notices
            const noticeEl = document.getElementById('searchNotice');
            if (noticeEl) {
                noticeEl.remove();
            }
        });
    }

    // Try again button functionality
    if (tryAgainButton) {
        tryAgainButton.addEventListener('click', function() {
            noResultContainer.classList.add('hidden');
            nameSearchInput.value = '';
            nameSearchInput.focus();
        });
    }

    // Language button event listeners
    if (englishBtn) {
        englishBtn.addEventListener('click', function() {
            setLanguage('en');
        });
    }

    if (vietnameseBtn) {
        vietnameseBtn.addEventListener('click', function() {
            setLanguage('vi');
        });
    }

    // Function to set language
    function setLanguage(lang) {
        window.currentLanguage = lang;
        localStorage.setItem('weddinglanguage', window.currentLanguage);
        updateLanguageButtonState();
        applyTranslations();
        
        if (typeof window.initializeVenueMap === 'function') {
            console.log('Reinitializing venue map after language change');
            window.initializeVenueMap();
        }
        
        updateSearchNotices();
    }
    
    // Function to update search notices when language changes
    function updateSearchNotices() {
        const noticeEl = document.getElementById('searchNotice');
        if (noticeEl && noticeEl.hasAttribute('data-notice-type')) {
            const noticeType = noticeEl.getAttribute('data-notice-type');
            const selectedSide = document.querySelector('input[name="side"]:checked').value;
            const nameInput = document.getElementById('nameSearch');
            const searchName = nameInput ? nameInput.value : '';
            
            if (noticeType === 'opposite-side') {
                const oppositeSide = selectedSide === 'bride' ? 'groom' : 'bride';
                const oppositeSideName = window.currentLanguage === 'en' 
                    ? (oppositeSide === 'bride' ? 'Bride' : 'Groom') 
                    : (oppositeSide === 'bride' ? 'Cô Dâu' : 'Chú Rể');
                
                const guestName = guestNameElement ? guestNameElement.textContent : '';
                
                noticeEl.textContent = window.currentLanguage === 'en'
                    ? `Note: You selected the wrong side. "${guestName}" is a guest of the ${oppositeSideName}.`
                    : `Lưu ý: Bạn đã chọn sai bên. "${guestName}" là khách của ${oppositeSideName}.`;
            } else if (noticeType === 'fuzzy-match') {
                noticeEl.textContent = window.currentLanguage === 'en'
                    ? `Showing closest match for "${searchName}"`
                    : `Hiển thị kết quả gần nhất cho "${searchName}"`;
            }
        }
    }

    // Function to update language button state
    function updateLanguageButtonState() {
        if (window.currentLanguage === 'en') {
            englishBtn.classList.add('active');
            vietnameseBtn.classList.remove('active');
        } else {
            vietnameseBtn.classList.add('active');
            englishBtn.classList.remove('active');
        }
    }

    // Set initial active language button
    updateLanguageButtonState();

    // Function to apply translations to all elements
    function applyTranslations() {
        const elements = document.querySelectorAll('[data-lang-key]');

        elements.forEach(element => {
            const key = element.getAttribute('data-lang-key');

            if (element.tagName === 'INPUT') {
                element.placeholder = translations[window.currentLanguage][key];
            } else {
                element.textContent = translations[window.currentLanguage][key];
            }
        });

        // Update any dynamic content that's currently visible
        if (!resultContainer.classList.contains('hidden') && seatNumberElement.textContent) {
            const seatNumberMatch = seatNumberElement.textContent.match(/\d+/);
            if (seatNumberMatch) {
                const seatNumber = seatNumberMatch[0];
                seatNumberElement.textContent = getSeatNumberText(seatNumber, window.currentLanguage);
            }
        }
    }

    // Make the applyTranslations function globally available
    window.applyTranslations = applyTranslations;

    // Improved Levenshtein distance calculation
    function levenshteinDistance(str1, str2) {
        const matrix = [];
        
        if (str1 === str2) return 0;
        if (str1.length === 0) return str2.length;
        if (str2.length === 0) return str1.length;
        
        // Initialize the matrix
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        // Calculate distances
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,  // substitution
                        matrix[i][j - 1] + 1,       // insertion
                        matrix[i - 1][j] + 1        // deletion
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    // Enhanced similarity calculation with better accuracy
    function calculateSimilarity(str1, str2) {
        // Normalize strings
        const s1 = str1.toLowerCase().trim();
        const s2 = str2.toLowerCase().trim();
        
        // Exact match
        if (s1 === s2) return 1.0;
        
        // Empty string check
        if (!s1 || !s2) return 0;
        
        // Calculate edit distance
        const distance = levenshteinDistance(s1, s2);
        const maxLength = Math.max(s1.length, s2.length);
        
        // Base similarity score
        let similarity = 1 - (distance / maxLength);
        
        // Penalize large length differences
        const lengthDiff = Math.abs(s1.length - s2.length);
        const lengthRatio = Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length);
        
        // Apply penalty if lengths are very different
        if (lengthRatio < 0.5) {
            similarity *= 0.5; // Heavy penalty for very different lengths
        } else if (lengthRatio < 0.7) {
            similarity *= 0.8; // Moderate penalty
        }
        
        // Check for common typos and give slight bonus
        if (distance === 1) {
            // Single character difference - likely a typo
            const commonTypos = checkCommonTypos(s1, s2);
            if (commonTypos) {
                similarity = Math.min(similarity + 0.1, 0.95);
            }
        }
        
        return similarity;
    }

    // Check for common typing mistakes
    function checkCommonTypos(str1, str2) {
        // Check for doubled letters (e.g., "Garrrison" vs "Garrison")
        if (Math.abs(str1.length - str2.length) === 1) {
            const longer = str1.length > str2.length ? str1 : str2;
            const shorter = str1.length > str2.length ? str2 : str1;
            
            for (let i = 0; i < longer.length - 1; i++) {
                if (longer[i] === longer[i + 1]) {
                    // Found doubled letter, check if removing one matches
                    const withoutDouble = longer.slice(0, i) + longer.slice(i + 1);
                    if (withoutDouble === shorter) {
                        return true;
                    }
                }
            }
        }
        
        // Check for transposed letters (e.g., "hte" vs "the")
        if (str1.length === str2.length) {
            let differences = 0;
            let diffPositions = [];
            
            for (let i = 0; i < str1.length; i++) {
                if (str1[i] !== str2[i]) {
                    differences++;
                    diffPositions.push(i);
                }
            }
            
            if (differences === 2) {
                const [pos1, pos2] = diffPositions;
                if (str1[pos1] === str2[pos2] && str1[pos2] === str2[pos1]) {
                    return true;
                }
            }
        }
        
        return false;
    }

    // Smart name matching with multiple strategies
    function smartNameMatch(searchName, guestName, vietnameseName = null) {
        const search = searchName.toLowerCase().trim();
        const guest = guestName.toLowerCase().trim();
        const vietnamese = vietnameseName ? vietnameseName.toLowerCase().trim() : null;
        
        let scores = [];
        
        // Strategy 1: Full name exact match
        if (search === guest || (vietnamese && search === vietnamese)) {
            return 1.0;
        }
        
        // Strategy 2: Full name similarity
        scores.push(calculateSimilarity(search, guest));
        if (vietnamese) {
            scores.push(calculateSimilarity(search, vietnamese));
        }
        
        // Strategy 3: Name parts matching (for partial searches)
        const searchParts = search.split(/\s+/).filter(p => p.length > 0);
        const guestParts = guest.split(/\s+/).filter(p => p.length > 0);
        
        if (searchParts.length > 0 && guestParts.length > 0) {
            // Check if search is a subset of guest name parts
            let partScores = [];
            
            for (const searchPart of searchParts) {
                let bestPartScore = 0;
                for (const guestPart of guestParts) {
                    const partSim = calculateSimilarity(searchPart, guestPart);
                    bestPartScore = Math.max(bestPartScore, partSim);
                }
                partScores.push(bestPartScore);
            }
            
            // All parts must match reasonably well
            const avgPartScore = partScores.reduce((a, b) => a + b, 0) / partScores.length;
            const minPartScore = Math.min(...partScores);
            
            // Only consider part matching if all parts match well
            if (minPartScore > 0.8) {
                scores.push(avgPartScore);
            }
        }
        
        // Return the best score
        return Math.max(...scores, 0);
    }

    // Find guest with improved matching
    function findGuest(searchName, selectedSide) {
        if (!window.guestList || !Array.isArray(window.guestList)) {
            console.error('Guest list is not properly initialized');
            return { guest: null, foundOnOppositeSide: false };
        }

        console.log(`Finding guest: name="${searchName}", selected side="${selectedSide}"`);

        const normalizedSearchName = searchName.toLowerCase().trim();

        // Try to find on selected side first
        let guest = findGuestOnSide(normalizedSearchName, selectedSide);
        
        // If not found, try opposite side
        if (!guest) {
            const oppositeSide = selectedSide.toLowerCase() === 'bride' ? 'groom' : 'bride';
            console.log(`Guest not found on ${selectedSide} side, trying ${oppositeSide} side`);
            
            const oppositeGuest = findGuestOnSide(normalizedSearchName, oppositeSide);
            
            if (oppositeGuest) {
                console.log(`Found guest on ${oppositeSide} side instead`);
                return { 
                    guest: oppositeGuest, 
                    foundOnOppositeSide: true, 
                    oppositeSide: oppositeSide 
                };
            }
        }

        return { 
            guest: guest, 
            foundOnOppositeSide: false 
        };
    }

    // Helper function to find a guest on a specific side
    function findGuestOnSide(normalizedSearchName, side) {
        // Filter guests by side
        const sideGuests = window.guestList.filter(guest => 
            (guest.side || "").toLowerCase() === side.toLowerCase()
        );
        
        let bestMatch = null;
        let bestScore = 0;
        let matchType = '';
        
        for (const guest of sideGuests) {
            const score = smartNameMatch(
                normalizedSearchName, 
                guest.name || "", 
                guest.vietnamese_name || null
            );
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = guest;
                matchType = score === 1.0 ? 'exact' : 'fuzzy';
            }
            
            // If we found an exact match, stop searching
            if (score === 1.0) {
                break;
            }
        }
        
        // Log the result
        if (bestMatch) {
            console.log(`Found ${matchType} match: "${bestMatch.name}" with score ${bestScore.toFixed(2)}`);
        }
        
        // Return match if score is high enough
        // Lower threshold to 0.75 for better typo tolerance
        return bestScore >= 0.75 ? bestMatch : null;
    }

    // Function to highlight a table
    function highlightTable(tableId) {
        console.log('Highlighting table:', tableId);
        
        // Remove all existing highlights
        document.querySelectorAll('.table, .fixed-element').forEach(element => {
            element.classList.remove('highlighted');
        });
        
        const tableIdNum = parseInt(tableId);
        
        // Handle VIP table (ID 46)
        if (tableIdNum === 46) {
            const vipElements = document.querySelectorAll('[id*="vipTable"], [data-table-id="46"], [data-is-vip="true"]');
            let found = false;
            
            vipElements.forEach(element => {
                element.classList.add('highlighted');
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                found = true;
            });
            
            if (!found) {
                // Try to find by text content
                const fixedElements = document.querySelectorAll('.fixed-element');
                for (const element of fixedElements) {
                    if (element.textContent.toLowerCase().includes('vip')) {
                        element.classList.add('highlighted');
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        found = true;
                        break;
                    }
                }
            }
            
            if (!found) {
                console.error('VIP Table element not found');
            }
        } else {
            // Regular table
            const tableElement = document.getElementById(`table-${tableIdNum}`);
            if (tableElement) {
                tableElement.classList.add('highlighted');
                tableElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                console.error(`Table element with ID table-${tableIdNum} not found`);
            }
        }
        
        return true;
    }

    // Function to display guest information
    function displayGuestInfo(guest, wasTypo = false) {
        if (!guest) {
            console.error("displayGuestInfo called with null guest");
            return;
        }

        console.log("Displaying guest info:", guest);

        // Show the result container
        resultContainer.classList.remove('hidden');

        // Set guest name
        if (guestNameElement) {
            guestNameElement.textContent = guest.name;
        }

        // Check if VIP guest
        const isVipGuest = guest.table === 46 || (guest.tableObject && guest.tableObject.id === 46);

        // Set table name
        if (tableNameElement) {
            if (isVipGuest) {
                const vipTableText = window.currentLanguage === 'vi' ? 'Bàn VIP' : 'VIP Table';
                tableNameElement.textContent = vipTableText;
            } else if (guest.tableObject && guest.tableObject.name) {
                tableNameElement.textContent = guest.tableObject.name;
            } else {
                tableNameElement.textContent = `Table ${guest.table}`;
            }
        }

        // Set seat number
        if (seatNumberElement) {
            seatNumberElement.textContent = guest.seat ? getSeatNumberText(guest.seat, window.currentLanguage) : '';
        }

        // Highlight the table
        highlightTable(guest.table);

        // Display tablemates
        if (tablematesListElement) {
            tablematesListElement.innerHTML = '';

            // Find tablemates
            let tablemates = [];
            
            if (isVipGuest) {
                tablemates = window.guestList.filter(g => 
                    (g.table === 46 || (g.tableObject && g.tableObject.id === 46)) && 
                    g.name !== guest.name
                );
            } else if (guest.tableObject && guest.tableObject.guests) {
                tablemates = guest.tableObject.guests.filter(g => g.name !== guest.name);
            } else if (guest.table) {
                tablemates = window.guestList.filter(g => 
                    g.table === guest.table && 
                    g.name !== guest.name
                );
            }
            
            if (tablemates.length > 0) {
                tablemates.forEach(tablemate => {
                    const li = document.createElement('li');
                    li.textContent = tablemate.name;
                    tablematesListElement.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = window.currentLanguage === 'en' ? 
                    'No other guests at this table' : 
                    'Không có khách nào khác ở bàn này';
                tablematesListElement.appendChild(li);
            }
        }
        
        // Add notice if it was a typo correction
        if (wasTypo) {
            let noticeEl = document.getElementById('searchNotice');
            if (!noticeEl) {
                noticeEl = document.createElement('p');
                noticeEl.id = 'searchNotice';
                noticeEl.style.fontStyle = 'italic';
                noticeEl.style.marginTop = '10px';
                noticeEl.style.fontSize = '0.9rem';
                noticeEl.style.color = '#666';
                
                const guestNameElement = document.getElementById('guestName');
                if (guestNameElement && guestNameElement.parentNode) {
                    guestNameElement.parentNode.insertBefore(noticeEl, guestNameElement.nextSibling);
                }
            }
            
            noticeEl.setAttribute('data-notice-type', 'fuzzy-match');
            const searchValue = nameSearchInput.value;
            noticeEl.textContent = window.currentLanguage === 'en'
                ? `Showing result for "${guest.name}" (you searched for "${searchValue}")`
                : `Hiển thị kết quả cho "${guest.name}" (bạn đã tìm "${searchValue}")`;
        }
    }

    // Get seat number text
    function getSeatNumberText(seatNumber, lang) {
        if (lang === 'vi') {
            return `Số ghế của bạn là: ${seatNumber}`;
        } else {
            return `Your seat number is: ${seatNumber}`;
        }
    }

    // Main search function
    function searchGuest() {
        console.log("Search function called");

        // Check if guest list is loaded
        if (!window.guestList || !Array.isArray(window.guestList) || window.guestList.length === 0) {
            console.error("Guest list is not properly loaded");
            const errorMsg = document.getElementById('errorMessage');
            if (errorMsg) {
                errorMsg.textContent = window.currentLanguage === 'vi' ? 
                    "Lỗi: Danh sách khách chưa được tải. Vui lòng làm mới trang." :
                    "Error: Guest list not loaded. Please refresh the page.";
                errorMsg.classList.remove('hidden');
            }
            return;
        }

        // Check venue layout
        if (!window.venueLayout || !window.venueLayout.tables) {
            console.error("Venue layout is not properly loaded");
            if (typeof window.initializeVenueMap === 'function') {
                console.log("Attempting to initialize venue map");
                window.initializeVenueMap();
            }
        }

        // Get search input
        const searchName = nameSearchInput.value.trim();
        
        // Get selected side
        const sideInput = document.querySelector('input[name="side"]:checked');
        if (!sideInput) {
            console.error("No side selected");
            return;
        }
        const selectedSide = sideInput.value;

        console.log(`Searching for "${searchName}" on "${selectedSide}" side`);

        // Hide previous results
        resultContainer.classList.add('hidden');
        noResultContainer.classList.add('hidden');
        
        // Clear previous notices
        const oldNotice = document.getElementById('searchNotice');
        if (oldNotice) {
            oldNotice.remove();
        }

        // Don't search if empty
        if (!searchName) {
            console.log("Search input is empty");
            return;
        }

        // Find the guest
        const result = findGuest(searchName, selectedSide);
        
        if (result.guest) {
            console.log("Guest found:", result.guest);
            
            // Ensure guest has tableObject
            if (!result.guest.tableObject && result.guest.table) {
                if (window.venueLayout && window.venueLayout.tables) {
                    result.guest.tableObject = window.venueLayout.tables.find(t => 
                        t.id === parseInt(result.guest.table)
                    );
                }
            }

            // Check if name was an exact match or had typos
            const exactMatch = result.guest.name.toLowerCase() === searchName.toLowerCase() ||
                              (result.guest.vietnamese_name && 
                               result.guest.vietnamese_name.toLowerCase() === searchName.toLowerCase());

            // Display guest information
            displayGuestInfo(result.guest, !exactMatch);

            // Handle wrong side selection
            if (result.foundOnOppositeSide) {
                let noticeEl = document.getElementById('searchNotice');
                if (!noticeEl) {
                    noticeEl = document.createElement('p');
                    noticeEl.id = 'searchNotice';
                    noticeEl.style.marginTop = '10px';
                    noticeEl.style.fontSize = '0.9rem';
                    
                    const guestNameElement = document.getElementById('guestName');
                    if (guestNameElement && guestNameElement.parentNode) {
                        guestNameElement.parentNode.insertBefore(noticeEl, guestNameElement.nextSibling);
                    }
                }
                
                noticeEl.setAttribute('data-notice-type', 'opposite-side');
                noticeEl.style.color = '#e67e22';
                noticeEl.style.backgroundColor = '#fef9e7';
                noticeEl.style.padding = '10px';
                noticeEl.style.borderRadius = '5px';
                noticeEl.style.border = '1px solid #fadbd8';
                
                // Update the radio button
                const oppositeSideInput = document.querySelector(`input[name="side"][value="${result.oppositeSide}"]`);
                if (oppositeSideInput) {
                    oppositeSideInput.checked = true;
                }
                
                const oppositeSideName = window.currentLanguage === 'en' 
                    ? (result.oppositeSide === 'bride' ? 'Bride' : 'Groom') 
                    : (result.oppositeSide === 'bride' ? 'Cô Dâu' : 'Chú Rể');
                    
                noticeEl.textContent = window.currentLanguage === 'en'
                    ? `Note: "${result.guest.name}" is a guest of the ${oppositeSideName}.`
                    : `Lưu ý: "${result.guest.name}" là khách của ${oppositeSideName}.`;
            }
        } else {
            console.log("Guest not found");
            noResultContainer.classList.remove('hidden');
        }
    }

    // Make functions globally available
    window.highlightTable = highlightTable;
    window.displayGuestInfo = displayGuestInfo;
    window.getSeatNumberText = getSeatNumberText;
    window.searchGuest = searchGuest;

    // Initialize the application
    if (typeof window.initializeFromCSV === 'function') {
        window.initializeFromCSV();
    } else {
        console.error("initializeFromCSV function not found. Ensure csv-processor.js is loaded.");
    }
});
