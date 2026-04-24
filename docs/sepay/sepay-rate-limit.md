# Tạo API Token

## SePay sử dụng API Token cho chứng thực. Vì vậy bước đầu tiên bạn cần làm là tạo API Token.

---

**API Overview:**

API truy vấn giao dịch ngân hàng, tài khoản ngân hàng và Virtual Account (VA) theo đơn hàng.

**Base URL:** `https://my.sepay.vn`

**Rate Limits:** 2 requests/giây. Vượt quá sẽ trả về HTTP 429 với header `x-sepay-userapi-retry-after`.

---

<Callout type="info" title="Lưu ý">
API Token dùng chung cho cả API v1 và v2. Nếu đã có token từ v1, bạn có thể sử dụng lại mà không cần tạo mới.
</Callout>

### Các bước tạo API Token

- **Bước 1:** Vào Cấu hình Công ty → **[API Access](https://my.sepay.vn/companyapi)**

- **Bước 2:** Chọn vào button **+ Thêm API** ở phía trên, bên phải

- **Bước 3:** Điền đầy đủ thông tin, bao gồm:
  - **Tên:** Bạn đặt tên bất kỳ
  - **Trạng thái:** Chọn Hoạt động

- **Bước 4:** Chọn **Thêm**
  - Sau khi thêm thành công, bạn sẽ thấy API Token tại danh sách API Access.

<Callout type="info" title="Lưu ý">
Hiện tại SePay chưa hỗ trợ phân quyền cho API. Điều này đồng nghĩa với việc API Key được tạo có toàn quyền.
</Callout>

### Hướng dẫn sử dụng API Token

- API Token cần được đưa vào header mỗi khi request đến SePay API. Với cấu trúc Authorization: Bearer API_TOKEN

- Ví dụ sử dụng API Token để lấy thông tin giao dịch

<Image src="/images/user-guide/api_token_example.png" alt="API Token SePay" caption="API Token SePay" />
