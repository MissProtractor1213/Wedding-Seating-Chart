// This script processes the CSV guest list and generates the data structures needed for the application

// Helper function to parse CSV content
function parseCSV(csvContent) {
    // Split the content into lines
    const lines = csvContent.split(/\r\n|\n/);

    // Extract the headers
    const headers = lines[0].split(',');

    // Parse each line
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        // Skip empty lines
        if (lines[i].trim() === '') continue;

        const obj = {};
        const currentLine = lines[i].split(',');

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentLine[j] ? currentLine[j].trim() : '';
        }

        result.push(obj);
    }

    return result;
}

// Function to process the CSV data and generate the venue layout and guest list
function processGuestData(csvContent) {
    console.log("processGuestData called");

    // Parse the CSV content
    const rawGuests = parseCSV(csvContent);
    console.log(`Parsed ${rawGuests.length} guests from CSV`);

    // Extract unique tables
    const tablesMap = {};
    let vipTableGuests = []; // Store VIP table guests separately

    rawGuests.forEach(guest => {
        const tableId = parseInt(guest.table_id);
        const tableName = guest.table_name || `Table ${tableId}`;

        // Check if this is the VIP table (Table 46)
        if (tableId === 46 || tableName.toLowerCase() === 'vip') {
            // Add to VIP guests list instead of regular tables
            vipTableGuests.push({
                name: guest.name,
                table: 46,
                seat: guest.seat ? parseInt(guest.seat) : null,
                vietnamese_name: guest.vietnamese_name || null,
                side: guest.side || 'bride' // Default to bride's side if not specified
            });
            return; // Skip adding to regular tables
        }

        if (!tablesMap[tableId]) {
            tablesMap[tableId] = {
                id: tableId,
                name: tableName,
                // Positions will be set in the custom layout function
                x: 0,
                y: 0,
                size: 60, // Slightly smaller to fit more tables
                guests: []
            };
        }

        // Add this guest to the table's guest list
        tablesMap[tableId].guests.push({
            name: guest.name,
            table: tableId,
            seat: guest.seat ? parseInt(guest.seat) : null,
            vietnamese_name: guest.vietnamese_name || null,
            side: guest.side || 'bride' // Default to bride's side if not specified
        });
    });

    // Extract the tables as an array
    const tables = Object.values(tablesMap);

    // Apply custom layout based on the Table Seating Chart document
    arrangeTablesInCustomLayout(tables);

    // Create the venue layout
    const venueLayout = {
        width: 950,
        height: 1300,
        fixedElements: [
            // Stage at the bottom
            {
                type: 'rectangle',
                name: 'stage',
                x: 475,
                y: 1275,
                width: 300,
                height: 70,
                label: 'Stage'
            },
            // Bride and Groom area on the right side
            {
                type: 'rectangle',
                name: 'brideGroom',
                x: 875,
                y: 630,
                width: 70,
                height: 100,
                label: 'Bride and Groom'
            },
            // Dance Floor in the center
            {
                type: 'rectangle',
                name: 'danceFloor',
                x: 475,
                y: 975,
                width: 300,
                height: 300,
                label: 'Dance Floor'
            },
            // Cake area on the right side
            {
                type: 'rectangle',
                name: 'cakeGifts',
                x: 875,
                y: 430,
                width: 70,
                height: 100,
                label: 'Cake & Gifts'
            },
            // Bar area on the left side
            {
                type: 'rectangle',
                name: 'bar',
                x: 60,
                y: 660,
                width: 60,
                height: 200,
                label: 'BAR'
            },
            // VIP Table in the center-right area - Modified to include table ID and guests
            {
                type: 'rectangle',
                name: 'vipTable',
                id: 46, // Added table ID to match with guest data
                x: 535,
                y: 430,
                width: 120,
                height: 70,
                label: 'VIP Table',
                guests: vipTableGuests // Add the VIP guests to this fixed element
            }
        ],
        tables: tables
    };

    // Create the guest list
    const guestList = [];

    // Add guests from regular tables
    tables.forEach(table => {
        table.guests.forEach(guest => {
            guestList.push({
                name: guest.name,
                table: table.id,
                tableObject: table,
                seat: guest.seat,
                vietnamese_name: guest.vietnamese_name,
                side: guest.side
            });
        });
    });

    // Add VIP table guests
    vipTableGuests.forEach(guest => {
        guestList.push({
            name: guest.name,
            table: 46,
            tableObject: venueLayout.fixedElements.find(elem => elem.name === 'vipTable'),
            seat: guest.seat,
            vietnamese_name: guest.vietnamese_name,
            side: guest.side
        });
    });

    return {
        venueLayout: venueLayout,
        guestList: guestList
    };
}

// Function to arrange tables in a custom layout based on the provided image
function arrangeTablesInCustomLayout(tables) {
    // Define table positions according to the image
    const tablePositions = {
        // Row 1 (top row - tables 1-7)
        1: { x: 158, y: 126 },
        2: { x: 264, y: 126 },
        3: { x: 370, y: 126 },
        4: { x: 476, y: 126 },
        5: { x: 582, y: 126 },
        6: { x: 688, y: 126 },
        7: { x: 794, y: 126 },

        // Row 2 (tables 8-14)
        8: { x: 158, y: 202 },
        9: { x: 264, y: 202 },
        10: { x: 370, y: 202 },
        11: { x: 476, y: 202 },
        12: { x: 582, y: 202 },
        13: { x: 688, y: 202 },
        14: { x: 794, y: 202 },

        // Row 3 (tables 15-21)
        15: { x: 158, y: 278 },
        16: { x: 264, y: 278 },
        17: { x: 370, y: 278 },
        18: { x: 476, y: 278 },
        19: { x: 582, y: 278 },
        20: { x: 688, y: 278 },
        21: { x: 794, y: 278 },

        // Row 4 (tables 22-28)
        22: { x: 158, y: 354 },
        23: { x: 264, y: 354 },
        24: { x: 370, y: 354 },
        25: { x: 476, y: 354 },
        26: { x: 582, y: 354 },
        27: { x: 688, y: 354 },
        28: { x: 794, y: 354 },

        // Row 5 (tables 29-33)
        29: { x: 158, y: 430 },
        30: { x: 264, y: 430 },
        31: { x: 370, y: 430 },
        32: { x: 688, y: 430 },
        33: { x: 794, y: 430 },

        // Tables around the dance floor
        34: { x: 264, y: 826 },
        35: { x: 794, y: 826 },
        36: { x: 158, y: 902 },
        37: { x: 688, y: 902 },
        38: { x: 264, y: 978 },
        39: { x: 794, y: 978 },
        40: { x: 158, y: 1054 },
        41: { x: 688, y: 1054 },
        42: { x: 264, y: 1130 },
        43: { x: 794, y: 1130 },
        44: { x: 158, y: 1206 },
        45: { x: 688, y: 1206 }
    };

    // Apply positions to tables
    tables.forEach(table => {
        const position = tablePositions[table.id];
        if (position) {
            table.x = position.x;
            table.y = position.y;
        } else {
            // For any tables not in our defined positions (extras beyond 45),
            // place them along the bottom
            const extraIndex = table.id - 45;
            table.x = 400 + (extraIndex * 80);
            table.y = 1250;
        }
    });
}

// Validate CSV format
function validateCSV(csvContent) {
    // Check if CSV content exists
    if (!csvContent || csvContent.trim() === '') {
        console.error("CSV content is empty");
        return false;
    }

    // Split into lines
    const lines = csvContent.split(/\r\n|\n/);

    // Check if we have header and at least one row
    if (lines.length < 2) {
        console.error("CSV has insufficient lines");
        return false;
    }

    // Get the header and check for expected columns
    const header = lines[0].split(',');
    const requiredColumns = ['name', 'table_id', 'table_name', 'side'];
    const missingColumns = requiredColumns.filter(col => !header.includes(col));

    if (missingColumns.length > 0) {
        console.error("CSV is missing required columns:", missingColumns);
        return false;
    }

    console.log("CSV format appears valid");
    return true;
}

// Initialize UI elements after data is loaded
function initializeUI() {
    console.log('Initializing UI...');

    // Explicitly initialize the venue map
    if (window.venueLayout && typeof window.initializeVenueMap === 'function') {
        console.log('Calling initializeVenueMap from initializeUI');
        window.initializeVenueMap();
    } else {
        console.error('Cannot initialize venue map: ',
            window.venueLayout ? 'venueLayout exists' : 'venueLayout missing',
            typeof window.initializeVenueMap === 'function' ? 'initializeVenueMap exists' : 'function missing');
    }

    // Apply translations if the function exists
    if (typeof window.applyTranslations === 'function') {
        window.applyTranslations();
        console.log('Translations applied');
    } else {
        console.warn('applyTranslations function not found');
    }

    // Check if all elements are properly loaded
    const guestListLoaded = window.guestList && Array.isArray(window.guestList) && window.guestList.length > 0;
    console.log(`Guest list loaded: ${guestListLoaded ? 'YES' : 'NO'}`);

    const venueLayoutLoaded = window.venueLayout && Array.isArray(window.venueLayout.tables);
    console.log(`Venue layout loaded: ${venueLayoutLoaded ? 'YES' : 'NO'}`);

    // Enable UI elements now that data is loaded
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.disabled = false;
        console.log('Search button enabled');
    }
}

// This function loads the CSV file and initializes the data
async function initializeFromCSV() {
    try {
        console.log("initializeFromCSV called");

        // CHANGE 1: Hardcode the guest data for testing if fetch fails
        let csvContent;

        try {
            // Try to fetch the CSV file
            console.log("Attempting to fetch 'guests.csv'");
            const response = await fetch('guests.csv');
            console.log("Fetch response:", response); // Log the entire response object

            if (!response.ok) {
                throw new Error(`Failed to fetch guests.csv: ${response.status} ${response.statusText}`);
            }
            csvContent = await response.text();
            console.log(`CSV loaded from file, length: ${csvContent.length} characters`);
        } catch (fetchError) {
            console.warn("Failed to fetch CSV file, using hardcoded data:", fetchError);

            // Use the sample data from guests.csv
            csvContent = `name,table_id,table_name,seat,vietnamese_name,side
Luffy Monkey,1,Freesia,1,,bride
Naruto Uzumaki,1,Freesia,2,,bride
Sakura Kinomoto,1,Freesia,3,,bride
Sasuke Uchiha,1,Freesia,4,,bride
Hinata Hyuuga,1,Freesia,5,,bride
Tony Chopper,1,Freesia,6,,bride
Roronoa Zoro,1,Freesia,7,,bride
Nico Robin,1,Freesia,8,,bride
Kakashi Hatake,1,Freesia,9,,bride`;

            console.log("Using hardcoded CSV data as fallback");
        }

        // Validate CSV format
        if (!validateCSV(csvContent)) {
            throw new Error("CSV validation failed");
        }

        // Process the CSV data
        const data = processGuestData(csvContent);

        // Store the generated data in global variables
        window.venueLayout = data.venueLayout;
        window.guestList = data.guestList;

        console.log(`Successfully loaded ${data.guestList.length} guests at ${data.venueLayout.tables.length} tables.`);

        // Initialize the UI now that we have the data
        initializeUI();

        // CHANGE 2: Log the loaded guest data to verify it's working
        console.log("First few guests loaded:", window.guestList.slice(0, 3));

        // Return success
        return true;
    } catch (error) {
        console.error('Error loading guest data:', error);
        document.getElementById('errorMessage').textContent = `Failed to load guest data: ${error.message}`;
        document.getElementById('errorMessage').classList.remove('hidden');
        return false;
    }
}

// Make initializeFromCSV available globally
window.initializeFromCSV = initializeFromCSV;
