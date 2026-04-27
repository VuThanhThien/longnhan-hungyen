export type FooterPageSection = {
  heading: string;
  paragraphs: string[];
};

export type FooterPageData = {
  slug: string;
  title: string;
  seoDescription: string;
  sections: FooterPageSection[];
};

export const FOOTER_PAGES: FooterPageData[] = [
  {
    slug: 'chinh-sach-khach-hang-than-thiet',
    title: 'Chính sách khách hàng thân thiết',
    seoDescription:
      'Chương trình khách hàng thân thiết Long Nhãn Tống Trân — ưu đãi tích điểm, quà tặng đặc biệt dành cho khách hàng trung thành.',
    sections: [
      {
        heading: 'Giới thiệu chương trình',
        paragraphs: [
          'Chương trình Khách hàng thân thiết của Long Nhãn Tống Trân được xây dựng nhằm tri ân những khách hàng đã tin tưởng và đồng hành cùng thương hiệu. Mỗi đơn hàng bạn thực hiện đều được ghi nhận và tích lũy để nhận những ưu đãi hấp dẫn.',
        ],
      },
      {
        heading: 'Quyền lợi thành viên',
        paragraphs: [
          'Tích điểm trên mỗi đơn hàng thành công (1.000đ = 1 điểm). Điểm tích lũy có thể quy đổi thành voucher giảm giá cho lần mua tiếp theo.',
          'Nhận quà tặng đặc biệt vào các dịp lễ, Tết và sinh nhật. Được ưu tiên trải nghiệm sản phẩm mới trước khi ra mắt chính thức.',
        ],
      },
      {
        heading: 'Điều kiện tham gia',
        paragraphs: [
          'Tất cả khách hàng đã đặt hàng thành công ít nhất 1 lần đều tự động trở thành thành viên chương trình. Điểm tích lũy có hiệu lực trong vòng 12 tháng kể từ ngày phát sinh.',
        ],
      },
    ],
  },
  {
    slug: 'chinh-sach-bao-mat',
    title: 'Chính sách bảo mật thông tin',
    seoDescription:
      'Chính sách bảo mật thông tin cá nhân của Long Nhãn Tống Trân — cam kết bảo vệ dữ liệu khách hàng an toàn, minh bạch.',
    sections: [
      {
        heading: 'Cam kết bảo mật',
        paragraphs: [
          'Long Nhãn Tống Trân cam kết bảo vệ thông tin cá nhân của khách hàng. Chúng tôi thu thập thông tin (họ tên, số điện thoại, địa chỉ giao hàng, email) chỉ nhằm mục đích xử lý đơn hàng và nâng cao chất lượng dịch vụ.',
        ],
      },
      {
        heading: 'Phạm vi sử dụng thông tin',
        paragraphs: [
          'Thông tin khách hàng chỉ được sử dụng cho các mục đích: xác nhận và giao đơn hàng, gửi thông báo về tình trạng đơn hàng, liên hệ hỗ trợ khi cần thiết, và gửi thông tin khuyến mãi (nếu khách hàng đồng ý nhận).',
          'Chúng tôi không chia sẻ, bán hoặc trao đổi thông tin cá nhân của khách hàng cho bất kỳ bên thứ ba nào, trừ trường hợp có yêu cầu từ cơ quan pháp luật.',
        ],
      },
      {
        heading: 'Bảo mật dữ liệu',
        paragraphs: [
          'Mọi thông tin giao dịch được mã hóa và lưu trữ trên hệ thống bảo mật. Khách hàng có quyền yêu cầu chỉnh sửa hoặc xóa thông tin cá nhân bất kỳ lúc nào bằng cách liên hệ với chúng tôi.',
        ],
      },
    ],
  },
  {
    slug: 'chinh-sach-van-chuyen',
    title: 'Chính sách vận chuyển',
    seoDescription:
      'Chính sách vận chuyển Long Nhãn Tống Trân — giao hàng toàn quốc, đóng gói cẩn thận, hỗ trợ theo dõi đơn hàng.',
    sections: [
      {
        heading: 'Phạm vi giao hàng',
        paragraphs: [
          'Long Nhãn Tống Trân giao hàng trên toàn quốc thông qua các đơn vị vận chuyển uy tín. Đơn hàng được đóng gói cẩn thận, đảm bảo chất lượng sản phẩm trong suốt quá trình vận chuyển.',
        ],
      },
      {
        heading: 'Thời gian giao hàng',
        paragraphs: [
          'Nội thành Hà Nội và Hưng Yên: 1–2 ngày làm việc. Các tỉnh thành khác: 3–5 ngày làm việc. Thời gian có thể thay đổi vào các dịp lễ, Tết hoặc do điều kiện thời tiết.',
        ],
      },
      {
        heading: 'Phí vận chuyển',
        paragraphs: [
          'Phí vận chuyển được tính dựa trên khoảng cách và khối lượng đơn hàng. Miễn phí vận chuyển cho đơn hàng đạt giá trị tối thiểu theo chương trình khuyến mãi hiện hành. Chi tiết phí vận chuyển sẽ được hiển thị khi bạn đặt hàng.',
        ],
      },
      {
        heading: 'Theo dõi đơn hàng',
        paragraphs: [
          'Sau khi đơn hàng được gửi đi, bạn sẽ nhận được mã vận đơn qua tin nhắn hoặc email để theo dõi tình trạng giao hàng trực tiếp trên website.',
        ],
      },
    ],
  },
  {
    slug: 'chinh-sach-doi-tra',
    title: 'Chính sách đổi - trả hàng',
    seoDescription:
      'Chính sách đổi trả hàng Long Nhãn Tống Trân — hỗ trợ đổi trả trong 7 ngày, hoàn tiền nhanh chóng.',
    sections: [
      {
        heading: 'Điều kiện đổi trả',
        paragraphs: [
          'Khách hàng có thể yêu cầu đổi hoặc trả hàng trong vòng 7 ngày kể từ ngày nhận hàng trong các trường hợp: sản phẩm bị lỗi do nhà sản xuất, sản phẩm giao không đúng loại hoặc số lượng đã đặt, sản phẩm bị hư hỏng trong quá trình vận chuyển.',
          'Sản phẩm đổi trả cần còn nguyên bao bì, chưa qua sử dụng (trừ trường hợp lỗi phát hiện khi mở hàng). Vui lòng chụp ảnh sản phẩm lỗi và liên hệ với chúng tôi để được hỗ trợ nhanh nhất.',
        ],
      },
      {
        heading: 'Quy trình đổi trả',
        paragraphs: [
          'Bước 1: Liên hệ qua Zalo hoặc hotline để thông báo yêu cầu đổi trả. Bước 2: Gửi hình ảnh sản phẩm lỗi để xác nhận. Bước 3: Gửi trả sản phẩm theo hướng dẫn. Bước 4: Nhận sản phẩm thay thế hoặc hoàn tiền trong 3–5 ngày làm việc.',
        ],
      },
      {
        heading: 'Trường hợp không áp dụng',
        paragraphs: [
          'Không áp dụng đổi trả cho sản phẩm đã qua sử dụng, sản phẩm hư hỏng do lỗi của khách hàng, hoặc yêu cầu đổi trả sau 7 ngày kể từ ngày nhận hàng.',
        ],
      },
    ],
  },
  {
    slug: 'chinh-sach-thanh-toan',
    title: 'Chính sách thanh toán',
    seoDescription:
      'Chính sách thanh toán Long Nhãn Tống Trân — hỗ trợ COD, chuyển khoản ngân hàng, thanh toán an toàn.',
    sections: [
      {
        heading: 'Phương thức thanh toán',
        paragraphs: [
          'Long Nhãn Tống Trân hỗ trợ các phương thức thanh toán sau: Thanh toán khi nhận hàng (COD) — bạn kiểm tra hàng và thanh toán trực tiếp cho nhân viên giao hàng. Chuyển khoản ngân hàng — chuyển khoản trước khi giao hàng, thông tin tài khoản sẽ được cung cấp khi xác nhận đơn hàng.',
        ],
      },
      {
        heading: 'Xác nhận thanh toán',
        paragraphs: [
          'Với hình thức chuyển khoản, đơn hàng sẽ được xử lý sau khi chúng tôi xác nhận nhận được thanh toán. Vui lòng ghi đúng nội dung chuyển khoản theo hướng dẫn để quá trình xác nhận được nhanh chóng.',
        ],
      },
      {
        heading: 'Hóa đơn',
        paragraphs: [
          'Khách hàng có nhu cầu xuất hóa đơn VAT vui lòng thông báo khi đặt hàng và cung cấp đầy đủ thông tin xuất hóa đơn. Hóa đơn sẽ được gửi qua email trong vòng 3 ngày làm việc sau khi đơn hàng hoàn tất.',
        ],
      },
    ],
  },
];

export function getFooterPageBySlug(slug: string): FooterPageData | undefined {
  return FOOTER_PAGES.find((p) => p.slug === slug);
}
