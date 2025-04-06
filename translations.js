// This file contains translations for all text in the application
// It allows the website to switch between English and Vietnamese

const translations = {
    // English translations (default)
    "en": {
        "main-title": "WELCOME TO OUR WEDDING",
        "subtitle": "FIND YOUR TABLE AND SEE WHO YOU'LL BE CELEBRATING WITH!",
        "find-table": "FIND YOUR TABLE",
        "search-placeholder": "ENTER YOUR FULL NAME",
        "search-button": "FIND MY TABLE",
        "side-prompt": "I am a guest of:",
        "bride-side": "The Bride",
        "groom-side": "The Groom",
        "seated-at": "You are seated at:",
        "seat-number": "Your seat number is:",
        "seated-with": "You are seated with:",
        "table-location": "Table Location:",
        "no-result": "Sorry, we couldn't find your name. Please try again or check with the wedding hosts.",
        "back-button": "Back to Search",
        "try-again": "Try Again",
        "assistance-message": "IF YOU NEED ASSISTANCE, PLEASE ASK ONE OF OUR USHERS OR WEDDING PARTY MEMBERS.",
        "fuzzy-match": "Showing closest match for",
        "table-tip": "Tap on any table to see who's sitting there!",
        "table-guests": "Guests at this table:",
        "no-guests": "No guests assigned to this table",
        "close": "Close",
        
        // Venue element labels
        "stage-label": "Stage",
        "brideGroom-label": "Bride and Groom",
        "cakeGifts-label": "Cake & Gifts",
        "bar-label": "BAR",
        "vipTable-label": "VIP Table",
        "danceFloor-label": "Dance Floor",
        "table-click-hint": "Click to see guests at this table",
        "vip-click-hint": "Click to see VIP guests"
    },
    
    // Vietnamese translations
    "vi": {
        "main-title": "CHÀO MỪNG ĐẾN DỰ TIỆC CƯỚI",
        "subtitle": "TÌM BÀN CỦA BẠN VÀ XEM BẠN SẼ CHUNG VUI VỚI AI!",
        "find-table": "TÌM BÀN CỦA BẠN",
        "search-placeholder": "NHẬP TÊN ĐẦY ĐỦ CỦA BẠN",
        "search-button": "TÌM BÀN CỦA TÔI",
        "side-prompt": "Tôi là khách mời của:",
        "bride-side": "Cô Dâu",
        "groom-side": "Chú Rể",
        "seated-at": "Bạn được xếp chỗ tại:",
        "seat-number": "Số ghế của bạn là:",
        "seated-with": "Bạn ngồi cùng với:",
        "table-location": "Vị trí bàn:",
        "no-result": "Xin lỗi, chúng tôi không thể tìm thấy tên của bạn. Vui lòng thử lại hoặc liên hệ với cô dâu chú rể.",
        "back-button": "Quay Lại Tìm Kiếm",
        "try-again": "Thử Lại",
        "assistance-message": "NẾU BẠN CẦN HỖ TRỢ, VUI LÒNG HỎI MỘT TRONG CÁC PHỤC VỤ HOẶC THÀNH VIÊN TRONG ĐOÀN CƯỚI.",
        "fuzzy-match": "Hiển thị kết quả gần nhất cho",
        "table-tip": "Nhấn vào bất kỳ bàn nào để xem ai đang ngồi ở đó!",
        "table-guests": "Khách tại bàn này:",
        "no-guests": "Không có khách được phân công cho bàn này",
        "close": "Đóng",
        
        // Venue element labels
        "stage-label": "Sân Khấu",
        "brideGroom-label": "Cô Dâu và Chú Rể",
        "cakeGifts-label": "Bánh & Quà Tặng",
        "bar-label": "Quầy Bar",
        "vipTable-label": "Bàn VIP",
        "danceFloor-label": "Sàn Nhảy",
        "table-click-hint": "Nhấp để xem khách tại bàn này",
        "vip-click-hint": "Nhấp để xem khách VIP"
    }
};

// Function to update seat number text based on language
function getSeatNumberText(seatNumber, language) {
    if (language === 'en') {
        return `Your seat number is: ${seatNumber}`;
    } else {
        return `Số ghế của bạn là: ${seatNumber}`;
    }
}
