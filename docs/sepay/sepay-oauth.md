# Luồng xác thực

## Tìm hiểu chi tiết về luồng xác thực OAuth2 và cách triển khai trong ứng dụng của bạn.

---

**API Overview:**

API OAuth2 cho phép đối tác tích hợp với SePay để truy cập thông tin tài khoản ngân hàng, giao dịch và webhook.

**Base URL:** `https://my.sepay.vn/api/v1`

**OAuth2 Authorization URL:** `https://my.sepay.vn/oauth/authorize`

**OAuth2 Token URL:** `https://my.sepay.vn/oauth/token`

**Phạm vi (Scopes) hỗ trợ:**

- `bank-account:read` - Quyền đọc thông tin tài khoản ngân hàng
- `transaction:read` - Quyền đọc thông tin giao dịch
- `webhook:read` - Quyền đọc thông tin webhook
- `webhook:write` - Quyền ghi thông tin webhook
- `webhook:delete` - Quyền xóa thông tin webhook
- `profile` - Quyền đọc thông tin người dùng
- `company` - Quyền đọc thông tin công ty

---

### Tổng quan luồng xác thực

SePay triển khai OAuth2 theo luồng Authorization Code, một trong những luồng xác thực phổ biến và an toàn nhất của OAuth2. Luồng này phù hợp cho hầu hết các ứng dụng web và ứng dụng server-side.

<Image src="/images/user-guide/oauth_flowchart.png" alt="OAuth2 SePay Flowchart" />

Luồng xác thực OAuth2 trong SePay bao gồm các bước sau:

- **Bước 1:** Ứng dụng yêu cầu ủy quyền từ người dùng bằng cách chuyển hướng đến URL ủy quyền của SePay
- **Bước 2:** Người dùng đăng nhập vào SePay và đồng ý cấp quyền cho ứng dụng
- **Bước 3:** SePay chuyển hướng về redirect URI của ứng dụng kèm theo mã ủy quyền (authorization code)
- **Bước 4:** Ứng dụng đổi mã ủy quyền lấy access token từ SePay
- **Bước 5:** Ứng dụng sử dụng access token để gọi các API của SePay

### Bước 1: Yêu cầu ủy quyền

Để bắt đầu quá trình xác thực, chuyển hướng người dùng đến URL ủy quyền của SePay:

<TextBlock title="URL">
```text
https://my.sepay.vn/oauth/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=bank-account:read transaction:read&state=RANDOM_STATE_VALUE
```
</TextBlock>

**Giải thích tham số trên URL:**

<ParamsTable
rows={[
{ name: "response_type", type: "string", required: true, description: "Phải là code cho luồng Authorization Code" },
{ name: "client_id", type: "string", required: true, description: "Client ID của ứng dụng bạn, nhận được khi đăng ký ứng dụng" },
{ name: "redirect_uri", type: "string", required: true, description: "URL nhận mã ủy quyền, phải khớp với URL đã đăng ký" },
{ name: "scope", type: "string", required: true, description: "Các quyền truy cập yêu cầu, phân tách bằng dấu cách" },
{ name: "state", type: "string", required: true, description: "Giá trị ngẫu nhiên để ngăn tấn công CSRF, sẽ được trả về không thay đổi" }
]}
/>

<Callout type="info" title="Bảo mật quan trọng">
Tham số state nên được sử dụng để bảo vệ khỏi tấn công CSRF. Tạo một giá trị ngẫu nhiên, lưu trong session và xác minh khi nhận callback.
</Callout>

### Bước 2: Người dùng đồng ý cấp quyền

Sau khi chuyển hướng đến URL ủy quyền, người dùng sẽ thấy màn hình đăng nhập SePay (nếu chưa đăng nhập) và sau đó là màn hình xác nhận cấp quyền:

<Image src="/images/user-guide/oauth2.png" alt="OAuth2 SePay" />

Màn hình này hiển thị:

- Tên ứng dụng yêu cầu truy cập
- Các quyền mà ứng dụng yêu cầu
- Nút đồng ý hoặc từ chối cấp quyền

### Bước 3: Nhận mã ủy quyền

Sau khi người dùng đồng ý cấp quyền, SePay sẽ chuyển hướng về `redirect_uri` của bạn kèm theo mã ủy quyền:

<TextBlock title="URL">
```text
https://your-app.com/callback?code=AUTHORIZATION_CODE&state=RANDOM_STATE_VALUE
```
</TextBlock>

Ứng dụng của bạn cần:

- Xác minh tham số `state` khớp với giá trị đã gửi trước đó
- Lấy mã ủy quyền từ tham số code

<Callout type="warn" title="Lưu ý">
Mã ủy quyền chỉ có hiệu lực trong một thời gian ngắn (thường là 5 phút) và chỉ có thể sử dụng một lần. Bạn cần đổi nó lấy access token ngay sau khi nhận được.
</Callout>

### Bước 4: Đổi mã ủy quyền lấy access token

Sau khi nhận được mã ủy quyền, bạn cần đổi nó lấy access token bằng cách gửi yêu cầu POST đến endpoint token của SePay:

<Endpoint>
  <Method>POST</Method>

<Path>https://my.sepay.vn/oauth/token</Path>

  <Description>
    Lấy Access Token
  </Description>
</Endpoint>

```http
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
code=AUTHORIZATION_CODE
redirect_uri=YOUR_REDIRECT_URI
client_id=YOUR_CLIENT_ID
client_secret=YOUR_CLIENT_SECRET
```

**Giải thích tham số:**

<ParamsTable
rows={[
{ name: "grant_type", type: "string", required: true, description: "Phải là authorization_code" },
{ name: "code", type: "string", required: true, description: "Mã ủy quyền nhận được từ bước trước" },
{ name: "redirect_uri", type: "string", required: true, description: "URL chuyển hướng giống với URL đã sử dụng ở bước 1" },
{ name: "client_id", type: "string", required: true, description: "Client ID của ứng dụng bạn" },
{ name: "client_secret", type: "string", required: true, description: "Client Secret của ứng dụng bạn" }
]}
/>

<!-- No code tabs available -->

<Response title="RESPONSE">
```json
{
  "access_token": "ACCESS_TOKEN",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "REFRESH_TOKEN"
}
```
</Response>

<ResponseFields
rows={[
{ name: "access_token", type: "string", description: "Token dùng để gọi API SePay" },
{ name: "token_type", type: "string", description: "Loại token, luôn là Bearer" },
{ name: "expires_in", type: "integer", description: "Thời gian hiệu lực của token (tính bằng giây)" },
{ name: "refresh_token", type: "string", description: "Token dùng để lấy access token mới khi hết hạn" }
]}
/>

<Callout type="warn" title="Quan trọng">
Yêu cầu đổi token này phải được thực hiện từ phía máy chủ, không bao giờ thực hiện từ phía client vì cần sử dụng 
`client_secret`
.
</Callout>

### Bước 5: Sử dụng access token để gọi API

Sau khi nhận được access token, bạn có thể sử dụng nó để gọi các API của SePay bằng cách thêm vào header `Authorization`:

<Endpoint method="GET" path="https://my.sepay.vn/api/v1/bank-accounts" />

```http
Authorization: Bearer ACCESS_TOKEN
```

Dưới đây là ví dụ sử dụng cURL:

<Node title="cURL">
```js
curl -H 'Authorization: Bearer ACCESS_TOKEN' https://my.sepay.vn/api/v1/bank-accounts
```
</Node>

### Bước 6: Làm mới access token

Access token chỉ có hiệu lực trong một khoảng thời gian giới hạn (thường là 1 giờ). Khi access token hết hạn, bạn cần sử dụng refresh token để lấy token mới mà không yêu cầu người dùng xác thực lại:

<Endpoint>
  <Method>POST</Method>

<Path>https://my.sepay.vn/oauth/token</Path>

  <Description>
    Lấy Access Token
  </Description>
</Endpoint>

```http
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
refresh_token=REFRESH_TOKEN
client_id=YOUR_CLIENT_ID
client_secret=YOUR_CLIENT_SECRET
```

**Giải thích tham số:**

<ParamsTable
rows={[
{ name: "grant_type", type: "string", required: true, description: "Phải là refresh_token" },
{ name: "refresh_token", type: "string", required: true, description: "Refresh token nhận được khi lấy access token" },
{ name: "client_id", type: "string", required: true, description: "Client ID của ứng dụng bạn" },
{ name: "client_secret", type: "string", required: true, description: "Client Secret của ứng dụng bạn" }
]}
/>

<!-- No code tabs available -->

Phản hồi tương tự như khi đổi mã ủy quyền, bao gồm access token mới, refresh token mới và thời gian hết hạn.

<Response title="RESPONSE">
```json
{
  "access_token": "ACCESS_TOKEN",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "REFRESH_TOKEN"
}
```
</Response>

<Callout type="tip" title="Mẹo">
Nên lưu trữ refresh token an toàn và thực hiện làm mới token tự động khi access token gần hết hạn hoặc khi API trả về lỗi 401 Unauthorized.
</Callout>

### Xử lý lỗi

Khi có lỗi xảy ra trong quá trình xác thực, SePay sẽ trả về mã lỗi tương ứng. Dưới đây là một số lỗi phổ biến:

| Mã lỗi                   | Mô tả                                                                               | Giải pháp                                                          |
| ------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `invalid_request`        | Yêu cầu thiếu tham số bắt buộc hoặc chứa tham số không hợp lệ                       | Kiểm tra lại tất cả tham số trong yêu cầu                          |
| `invalid_client`         | Xác thực client thất bại                                                            | Kiểm tra lại `client_id` và `client_secret`                        |
| `invalid_grant`          | Mã ủy quyền hoặc refresh token không hợp lệ hoặc đã hết hạn                         | Yêu cầu người dùng xác thực lại hoặc kiểm tra refresh token        |
| `unauthorized_client`    | Client không được phép yêu cầu authorization code                                   | Kiểm tra lại cấu hình ứng dụng                                     |
| `access_denied`          | Người dùng từ chối cấp quyền                                                        | Thông báo cho người dùng rằng họ cần cấp quyền để sử dụng ứng dụng |
| `unsupported_grant_type` | Server không hỗ trợ kiểu grant được yêu cầu                                         | Kiểm tra tham số `grant_type`                                      |
| `invalid_scope`          | Phạm vi yêu cầu không hợp lệ, không được nhận diện hoặc vượt quá phạm vi đã đăng ký | Kiểm tra lại phạm vi yêu cầu                                       |

Phản hồi lỗi có định dạng:

<Response title="JSON">
```json
{
  "error": "invalid_grant",
  "error_description": "Authorization code expired"
}
```
</Response>

### Bước tiếp theo

Sau khi hiểu rõ về luồng xác thực OAuth2, bạn đã sẵn sàng để triển khai trong ứng dụng của mình. Tiếp theo, hãy tìm hiểu về cách sử dụng [Access Token](/vi/sepay-oauth2/access-token) với các API của SePay.
