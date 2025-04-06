// Define the venue map initialization function in the global scope
window.initializeVenueMap = function() {
    console.log('initializeVenueMap called');
    
    // Ensure we have access to the translations and current language
    if (typeof window.currentLanguage === 'undefined') {
        window.currentLanguage = 'en';
        console.log('Setting default language in venue map');
    }
    
    // Check if venueLayout exists or create a default one
    if (!window.venueLayout) {
        console.log('Creating default venue layout');
        window.venueLayout = {
            width: 1000,
            height: 1200,
            fixedElements: [
                // Gifts area on the right side
                {
                    type: 'rectangle',
                    name: 'cakeGifts',
                    x: 880,
                    y: 445,
                    width: 100,
                    height: 100,
                    label: 'Cake & Gifts'
                },
                // Bar area on the left side
                {
                    type: 'rectangle',
                    name: 'bar',
                    x: 70,
                    y: 660,
                    width: 80,
                    height: 200,
                    label: 'BAR'
                },
                // Bride and Groom area on the right side
                {
                    type: 'rectangle',
                    name: 'brideGroom',
                    x: 880,
                    y: 650,
                    width: 100,
                    height: 120,
                    label: 'Bride and Groom'
                },
                // Dance Floor in the center
                {
                    type: 'rectangle',
                    name: 'danceFloor',
                    x: 500,
                    y: 940,
                    width: 280,
                    height: 280,
                    label: 'Dance Floor'
                },
                // Stage at the bottom
                {
                    type: 'rectangle',
                    name: 'stage',
                    x: 500,
                    y: 1150,
                    width: 280,
                    height: 80,
                    label: 'Stage'
                },
                // VIP Table in the center
                {
                    type: 'rectangle',
                    name: 'vipTable',
                    id: 46,
                    x: 535,
                    y: 430,
                    width: 120,
                    height: 70,
                    label: 'VIP Table'
                }
            ],
            tables: createWeddingTables()
        };
    }
    
    // Get the venueMapElement
    const venueMapElement = document.getElementById('venueMap');
    if (!venueMapElement) {
        console.error('Venue map element not found');
        return false;
    }
    
    // Clear any existing elements
    venueMapElement.innerHTML = '';
    
    // Set the map dimensions based on the container
    const mapWidth = venueMapElement.offsetWidth || 800;
    const mapHeight = venueMapElement.offsetHeight || 600;
    
    // Calculate scaling factors
    const scaleX = mapWidth / window.venueLayout.width;
    const scaleY = mapHeight / window.venueLayout.height;
    
    // Debug: Log scale factors
    console.log(`Venue map scaling factors - X: ${scaleX}, Y: ${scaleY}`);
    
    // Draw fixed elements (if any)
    if (window.venueLayout.fixedElements) {
        window.venueLayout.fixedElements.forEach((element, index) => {
            const elementDiv = document.createElement('div');
            elementDiv.className = 'fixed-element';
            elementDiv.id = `fixed-${element.name}-${index}`;
            elementDiv.style.left = `${element.x * scaleX - (element.width * scaleX / 2)}px`;
            elementDiv.style.top = `${element.y * scaleY - (element.height * scaleY / 2)}px`;
            elementDiv.style.width = `${element.width * scaleX}px`;
            elementDiv.style.height = `${element.height * scaleY}px`;
            
            // Special styling for specific elements
            if (element.name === 'danceFloor') {
                elementDiv.style.backgroundColor = '#f0e6ff';
                elementDiv.style.border = '2px dashed #9966cc';
            } else if (element.name === 'stage') {
                elementDiv.style.backgroundColor = '#e6f7ff';
                elementDiv.style.border = '2px solid #66b3cc';
            } else if (element.name === 'bar') {
                elementDiv.style.backgroundColor = '#e6ffe6';
                elementDiv.style.border = '2px solid #66cc66';
                elementDiv.style.fontWeight = 'bold';
            } else if (element.name === 'brideGroom') {
                elementDiv.style.backgroundColor = '#fff0f5';
                elementDiv.style.border = '2px solid #ff69b4';
            } else if (element.name === 'cakeGifts') {
                elementDiv.style.backgroundColor = '#fffacd';
                elementDiv.style.border = '2px solid #daa520';
            } else if (element.name === 'vipTable') {
                // Special VIP table styling
                elementDiv.style.backgroundColor = '#faebd7';
                elementDiv.style.border = '2px solid #d4af37';
                elementDiv.style.fontWeight = 'bold';
                elementDiv.style.color = '#8b4513';
                
                // Make VIP table clickable
                elementDiv.style.cursor = 'pointer';
                
                // Add data attributes for easier selection
                elementDiv.dataset.tableId = element.id || 46; // Store the table ID as data attribute
                elementDiv.setAttribute('data-is-vip', 'true');
                
                // Add click handler for VIP table
                elementDiv.addEventListener('click', function() {
                    console.log('VIP Table clicked');
                    if (typeof window.highlightTable === 'function') {
                        window.highlightTable(46); // 46 is the VIP table ID
                    }
                });
            }
            
            // Set the label based on language
            const labelKey = element.name + '-label';
            if (window.translations && 
                window.translations[window.currentLanguage] && 
                window.translations[window.currentLanguage][labelKey]) {
                elementDiv.textContent = window.translations[window.currentLanguage][labelKey];
            } else {
                elementDiv.textContent = element.label;
            }
            
            venueMapElement.appendChild(elementDiv);
        });
        
        console.log(`Drew ${window.venueLayout.fixedElements.length} fixed elements on the venue map`);
    }
    
    // Draw tables
    if (window.venueLayout.tables && window.venueLayout.tables.length > 0) {
        console.log(`Drawing ${window.venueLayout.tables.length} tables on venue map`);
        
        window.venueLayout.tables.forEach((table, index) => {
            const tableDiv = document.createElement('div');
            tableDiv.className = 'table table-new';
            tableDiv.id = `table-${table.id}`;
            
            // Position and size the table
            tableDiv.style.left = `${table.x * scaleX - (table.size * scaleX / 2)}px`;
            tableDiv.style.top = `${table.y * scaleY - (table.size * scaleY / 2)}px`;
            tableDiv.style.width = `${table.size * scaleX}px`;
            tableDiv.style.height = `${table.size * scaleY}px`;
            
            // Display table number
            tableDiv.textContent = `${table.id}`;
            
            // Add click event to highlight the table
            tableDiv.addEventListener('click', function() {
                console.log(`Table ${table.id} clicked`);
                highlightTable(table.id);
            });
            
            venueMapElement.appendChild(tableDiv);
        });
        
        console.log('Tables drawn successfully');
    } else {
        console.warn('No tables to draw in venue map');
        
        // Add a message when no tables are available
        const noTablesMessage = document.createElement('div');
        noTablesMessage.className = 'empty-map-message';
        noTablesMessage.textContent = 'Table information is loading or not available.';
        venueMapElement.appendChild(noTablesMessage);
    }
    
    return true;
};

// Function to create tables according to the exact layout in the diagram
function createWeddingTables() {
    const tables = [];
    const tableSize = 70;  // Standard size for all tables
    
    // Row 1 (tables 1-7)
    for (let i = 1; i <= 7; i++) {
        tables.push({
            id: i,
            name: `Table ${i}`,
            x: 160 + (i - 1) * 110,
            y: 125,
            size: tableSize
        });
    }
    
    // Row 2 (tables 8-14)
    for (let i = 8; i <= 14; i++) {
        tables.push({
            id: i,
            name: `Table ${i}`,
            x: 160 + (i - 8) * 110,
            y: 205,
            size: tableSize
        });
    }
    
    // Row 3 (tables 15-21)
    for (let i = 15; i <= 21; i++) {
        tables.push({
            id: i,
            name: `Table ${i}`,
            x: 160 + (i - 15) * 110,
            y: 285,
            size: tableSize
        });
    }
    
    // Row 4 (tables 22-28)
    for (let i = 22; i <= 28; i++) {
        tables.push({
            id: i,
            name: `Table ${i}`,
            x: 160 + (i - 22) * 110,
            y: 365,
            size: tableSize
        });
    }
    
    // Row 5 (tables 29-33, skipping VIP Table space)
    tables.push({
        id: 29,
        name: `Table 29`,
        x: 160,
        y: 445,
        size: tableSize
    });
    
    tables.push({
        id: 30,
        name: `Table 30`,
        x: 270,
        y: 445,
        size: tableSize
    });
    
    tables.push({
        id: 31,
        name: `Table 31`,
        x: 380,
        y: 445,
        size: tableSize
    });
    
    tables.push({
        id: 32,
        name: `Table 32`,
        x: 700,
        y: 445,
        size: tableSize
    });
    
    tables.push({
        id: 33,
        name: `Table 33`,
        x: 810,
        y: 445,
        size: tableSize
    });
    
    // Tables around the dance floor
    // Left side
    tables.push({
        id: 34,
        name: `Table 34`,
        x: 270,
        y: 825,
        size: tableSize
    });
    
    tables.push({
        id: 36,
        name: `Table 36`,
        x: 160,
        y: 905,
        size: tableSize
    });
    
    tables.push({
        id: 38,
        name: `Table 38`,
        x: 270,
        y: 970,
        size: tableSize
    });
    
    tables.push({
        id: 40,
        name: `Table 40`,
        x: 160,
        y: 1050,
        size: tableSize
    });
    
    tables.push({
        id: 42,
        name: `Table 42`,
        x: 270,
        y: 1110,
        size: tableSize
    });
    
    tables.push({
        id: 44,
        name: `Table 44`,
        x: 160,
        y: 1190,
        size: tableSize
    });
    
    // Right side
    tables.push({
        id: 35,
        name: `Table 35`,
        x: 810,
        y: 825,
        size: tableSize
    });
    
    tables.push({
        id: 37,
        name: `Table 37`,
        x: 700,
        y: 905,
        size: tableSize
    });
    
    tables.push({
        id: 39,
        name: `Table 39`,
        x: 810,
        y: 970,
        size: tableSize
    });
    
    tables.push({
        id: 41,
        name: `Table 41`,
        x: 700,
        y: 1050,
        size: tableSize
    });
    
    tables.push({
        id: 43,
        name: `Table 43`,
        x: 810,
        y: 1110,
        size: tableSize
    });
    
    tables.push({
        id: 45,
        name: `Table 45`,
        x: 700,
        y: 1190,
        size: tableSize
    });
    
    return tables;
}
