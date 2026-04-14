// Site-wide constants for Long Nhan Hung Yen storefront

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.longnhanhungyen.shop';
export const SITE_NAME = 'Long Nhãn Tống Trân';
export const SITE_DESCRIPTION =
  'Long nhãn Hưng Yên — đặc sản chọn lọc, quà biếu sang trọng. Giao COD toàn quốc, Shopee, TikTok, Zalo.';

export const CONTACT_PHONE = '0922919456';
export const CONTACT_EMAIL = 'thudan.td@gmail.com';
export const CONTACT_ADDRESS = 'Tống Trân, Hưng Yên, Việt Nam';

export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/hai.code.me',
  zalo: 'https://zalo.me/0922919456',
  shopee: 'https://shopee.vn/sieuthithaomoc',
  tiktok: 'https://www.tiktok.com/@vtthien8999',
};

export const PAYMENT_METHODS = [
  { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng' },
];

// Vietnamese provinces for shipping form
export const PROVINCES = [
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Định',
  'Bình Dương',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Cần Thơ',
  'Đà Nẵng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Nội',
  'Hà Tĩnh',
  'Hải Dương',
  'Hải Phòng',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lạng Sơn',
  'Lào Cai',
  'Lâm Đồng',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'TP. Hồ Chí Minh',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái',
];
