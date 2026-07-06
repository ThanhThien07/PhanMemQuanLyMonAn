# BÁO CÁO CHI TIẾT TÍNH NĂNG VÀ PHÂN QUYỀN HỆ THỐNG
## Phần mềm Quản lý Món ăn & Vận hành Nhà hàng (PhanMemQuanLyMonAn)

Tài liệu này cung cấp cái nhìn chi tiết và toàn diện về toàn bộ tính năng của hệ thống, đồng thời phân tích chức năng và quyền hạn cụ thể của từng vai trò (role) trong vận hành thực tế.

---

## 1. TỔNG QUAN HỆ THỐNG
Hệ thống là giải pháp chuyển đổi số chuyên biệt cho ngành F&B, tối ưu hóa toàn diện từ trải nghiệm đặt món của khách hàng, điều phối bếp ăn, cho đến kiểm soát giá vốn nguyên vật liệu đầu vào và báo cáo tài chính điều hành. 

Hệ thống được thiết kế dựa trên sự liên kết chặt chẽ giữa 3 phân hệ cốt lõi:
1. **Bán hàng (Đặt món) & Trải nghiệm Khách hàng**
2. **Quản lý kho nguyên liệu theo Lô & Hạn sử dụng (FEFO - First Expired, First Out)**
3. **Định lượng công thức món ăn (Recipe Bill of Materials - BOM)**

---

## 2. PHÂN QUYỀN CHI TIẾT THEO VAI TRÒ (ROLES & PERMISSIONS)

Hệ thống phân chia quyền hạn truy cập rõ ràng thành **4 nhóm đối tượng** chính (3 vai trò đăng nhập hệ thống và 1 giao diện dành cho khách hàng):

*   **Khách Hàng (Giao diện Công cộng - Quét QR tại Bàn)**
    Khách hàng không cần đăng ký hay đăng nhập tài khoản. Chỉ cần dùng điện thoại quét mã QR dán tại mỗi bàn ăn, hệ thống sẽ tự động xác định vị trí bàn và cung cấp các chức năng tương tác:
    *   **Khai báo số lượng khách:** Nhập số khách ngồi tại bàn khi mới truy cập giao diện đặt món. Dữ liệu này được lưu trữ để tính toán lượng khách trong báo cáo quản lý.
    *   **Menu gọi món trực tuyến:**
        *   Xem danh mục món ăn phân loại rõ ràng (Khai vị, Món chính, Món phụ, Đồ uống, v.v.).
        *   Đặt món kèm ghi chú chế biến cụ thể (ví dụ: *"Không cay"*, *"Ít đá"*).
        *   Thiết lập **Thứ tự ưu tiên chế biến** cho từng dòng món ăn:
            *   *Mức 1:* Bình thường (Chờ chế biến theo thứ tự).
            *   *Mức 2:* Ra trước món chính (Khai vị, đồ uống).
            *   *Mức 3:* Ra món ngay lập tức.
    *   **Giám sát tiến độ nhà bếp (Real-time):** Xem trạng thái từng món ăn đã gọi (`Đang chờ`, `Đang làm`, `Đã xong`) kèm đồng hồ đếm ngược thời gian chờ ước tính được tính toán tự động bằng thuật toán lập lịch của bếp.
    *   **Yêu cầu thanh toán linh hoạt:** 
        *   Bấm yêu cầu thanh toán bằng **Tiền mặt** (nhân viên sẽ mang hóa đơn tới bàn).
        *   Bấm yêu cầu thanh toán bằng **Chuyển khoản QR ngân hàng** (hệ thống tự sinh mã QR động chứa số tiền cần thanh toán).
        *   Bấm xác nhận chuyển khoản thành công để báo hiệu cho thu ngân giải phóng bàn.

*   **Nhân Viên Phục Vụ & Thu Ngân (`nhan_vien`)**
    Đây là vai trò dành cho nhân sự chạy bàn, order trực tiếp và thực hiện nghiệp vụ thanh toán thu ngân.
    *   **Quản lý Sơ đồ bàn ăn trực quan:**
        *   Theo dõi danh sách bàn ăn kèm trạng thái thực tế bằng màu sắc trực quan: `Trống` (Xanh lá), `Có khách` (Xanh dương), `Đã gọi món` (Đỏ).
        *   Thêm bàn ăn mới vào hệ thống. Hệ thống tự động tạo mã QR đặt món riêng biệt cho bàn mới đó.
        *   In mã QR đặt món trực tiếp từ trình duyệt (in lẻ từng bàn hoặc in hàng loạt dạng lưới).
    *   **Nhận đơn & Quản lý gọi món:**
        *   Tiếp nhận yêu cầu gọi món từ khách hàng tại quầy hoặc tại bàn của những khách không dùng QR.
        *   Hủy món ăn khi khách yêu cầu:
            *   *Nếu bếp chưa nấu:* Hệ thống hủy món và **không** trừ kho nguyên liệu.
            *   *Nếu bếp đã hoặc đang chế biến:* Ghi nhận trạng thái hủy và đưa nguyên liệu vào mục **Hao hụt chế biến của bếp** (không tính tiền khách nhưng vẫn giảm trừ tồn kho của lô nguyên liệu tương ứng).
    *   **Chăm sóc Khách hàng thân thiết (CRM):**
        *   Tra cứu thông tin khách hàng bằng Số điện thoại.
        *   Thêm mới khách hàng vãng lai ngay tại màn hình thanh toán.
        *   **Tích điểm tự động:** Mỗi hóa đơn thanh toán được tích lũy điểm theo tỷ lệ 10.000đ = 1 điểm.
        *   **Tiêu điểm:** Cho phép trừ điểm tích lũy thành tiền mặt trực tiếp giảm trừ trên hóa đơn mới của khách hàng thân thiết.
    *   **Thực hiện nghiệp vụ Thanh toán linh hoạt:**
        *   **Thanh toán toàn bộ hóa đơn:** Thanh toán nhanh toàn bộ các món ăn tại bàn và giải phóng bàn về trạng thái `Trống`.
        *   **Thanh toán tách hóa đơn (Split Bill):** Kéo thả hoặc chọn số lượng món ăn để phân chia thành **Bill A** (Thanh toán trước để khách về trước) và **Bill B** (Giữ lại trên bàn cho khách ngồi lại tiếp tục sử dụng và thanh toán sau). Bàn chỉ được giải phóng khi tất cả các hóa đơn thành phần đã thanh toán xong.
    *   **Tải tài liệu Hướng dẫn sử dụng:** Xuất hướng dẫn vận hành dạng tài liệu `.doc` trực tiếp từ hệ thống.

*   **Nhà Bếp & Thủ Kho (`bep`)**
    Vai trò này tập trung vào khâu chế biến món ăn và quản lý chuỗi cung ứng nguyên vật liệu trong kho.
    *   **Màn hình bếp KDS Real-time (Kitchen Display System):**
        *   Giám sát toàn bộ danh sách món ăn cần chế biến được sắp xếp khoa học theo độ ưu tiên đặt món và thời gian chờ.
        *   **Cập nhật trạng thái chế biến:** Bấm tiếp nhận món (`dang_lam`) và hoàn thành món (`da_xong`).
        *   **Cấu hình Đầu bếp trực ca:** Tăng/giảm số lượng đầu bếp hoạt động tại bếp (từ 1 đến 15 đầu bếp) để hệ thống tự động chạy thuật toán phân bổ thời gian chờ nấu của các món ăn.
        *   Âm báo tự động Ding-Dong phát ra mỗi khi có món mới gửi đến bếp.
    *   **Cơ chế trừ kho FEFO tự động:** Khi bấm bắt đầu chế biến (`dang_lam`), hệ thống tự động chạy công cụ trừ kho đi sâu vào từng Lô hàng nhập (`lo_hang_nhap`), ưu tiên trừ những lô cận ngày hết hạn sử dụng nhất để tránh hết hạn hàng hóa.
    *   **Lưu vết Lịch sử tiêu hao chi tiết:** Mỗi món chế biến xong được ghi nhận vào bảng `chi_tiet_tieu_hao_dat_mon` để lưu lại giá vốn chính xác, nguồn gốc lô hàng đã dùng phục vụ việc truy xuất nguồn gốc (ví dụ: phục vụ kiểm tra vệ sinh an toàn thực phẩm hoặc truy vết sự cố).
    *   **Quản lý nguyên liệu & tồn kho theo Lô:**
        *   Theo dõi tồn kho tổng và danh sách chi tiết các Lô nhập khẩu độc lập.
        *   Cảnh báo cận hạn sử dụng (cảnh báo đỏ đối với các lô sắp hết hạn dùng).
        *   Quản lý thông tin nhà cung cấp, ngày nhập, giá vốn nhập và vị trí lưu kho chi tiết (ví dụ: *Tủ đông tầng 2*).
    *   **Quản lý chuỗi cung ứng & Nhập kho:**
        *   **So sánh giá nguyên liệu:** Gõ tên nguyên liệu để so sánh giá và chất lượng giữa các nhà cung cấp thực tế có trong cơ sở dữ liệu để tìm nhà cung cấp có giá tốt nhất.
        *   **Đề xuất mua nguyên liệu:** Tạo đơn đặt hàng nguyên liệu gửi tới nhà cung cấp đã chọn.
        *   **Kiểm duyệt thực nhận (Verify Import):** Khi hàng về, thủ kho thực hiện cân/đếm thực nhận và duyệt đơn hàng. Hệ thống tự động tính toán số lượng chênh lệch (đủ/thiếu/dư) và tự sinh Lô hàng nhập mới cập nhật vào kho.
    *   **Quản lý Biên bản Hao hụt & Hủy hàng:** Ghi nhận nguyên liệu bị hỏng tự nhiên (ôi thiu, dập nát, chuột bọ) kèm lý do chi tiết và trừ trực tiếp khỏi lô hàng nhập tương ứng.
    *   **Kiểm kê kho định kỳ:** Tạo phiếu kiểm kê thực tế cuối ngày/cuối tuần để cập nhật chênh lệch kho hệ thống so với thực tế và xuất báo cáo thất thoát cho quản lý.

*   **Ban Điều Hành & Quản Trị Viên (`admin`)**
    Đây là vai trò có quyền hạn cao nhất trong hệ thống, quản lý toàn bộ các khía cạnh nghiệp vụ, nhân sự và cấu hình cài đặt hệ thống.
    *   **Toàn quyền truy cập (Full Access):** Có quyền sử dụng tất cả các chức năng của cả `nhan_vien` (phục vụ/thu ngân) và `bep` (nhà bếp/thủ kho).
    *   **Báo cáo Ban điều hành đa chiều (7-Section Dashboard):**
        *   *1. Ca trực:* Thống kê số lượng nhân viên và tổng giờ công tích lũy trong ca để theo dõi hiệu suất.
        *   *2. Doanh thu:* Báo cáo doanh số chi tiết phân bổ theo nguồn tiền mặt (tiền két) và tiền chuyển khoản QR (chiếm ~65%), doanh thu chi tiết từng bàn phục vụ.
        *   *3. Đơn hàng:* Tổng số đơn đặt, tỷ lệ hoàn thành đơn và tỷ lệ đơn hủy (kiểm soát thất thoát).
        *   *4. Món ăn:* Thống kê TOP 5 món ăn bán chạy nhất và các món bán chậm nhất để tối ưu menu.
        *   *5. Nguyên liệu:* Theo dõi định mức tiêu hao nguyên vật liệu, cảnh báo đỏ các nguyên liệu sắp hết hàng (dưới 5kg) và tỷ lệ hao phí trong chế biến.
        *   *6. Nhân sự:* Kiểm soát chi phí lương tạm tính dựa trên số giờ làm và hiệu suất.
        *   *7. Sự cố:* Tổng hợp các sự cố phát sinh (ví dụ: hỏng hóc thiết bị, phản hồi không tốt từ khách) kèm các đề xuất cải tiến của ca làm việc.
    *   **Xuất báo cáo tài chính:** Hỗ trợ xuất dữ liệu hóa đơn bán hàng chi tiết ra tệp tin CSV/Excel có hỗ trợ định dạng UTF-8 để hiển thị đầy đủ tiếng Việt không lỗi font.
    *   **Lưu trữ & Tra cứu lịch sử báo cáo:** Bấm lưu báo cáo ca làm việc định kỳ vào cơ sở dữ liệu và truy vấn lại danh sách lịch sử báo cáo cũ bất kỳ lúc nào.
    *   **Quản trị danh mục Món ăn (Dish CRUD) & Công thức (Recipe BOM):**
        *   Thêm, sửa, xóa món ăn, hình ảnh, đơn giá và thời gian chế biến tiêu chuẩn.
        *   **Thiết lập công thức nấu ăn (BOM):** Chỉ định 1 món ăn khi nấu ra cần tiêu dùng chính xác bao nhiêu gam/kg/cái của các nguyên liệu nào trong kho.
    *   **Quản trị danh mục Loại món ăn & Nhà cung cấp:** CRUD danh mục loại món ăn và danh sách thông tin liên hệ nhà cung cấp.
    *   **Quản trị Nhân sự (User/Staff CRUD):** Thêm mới tài khoản nhân viên, chỉnh sửa thông tin, thay đổi mật khẩu và phân quyền vai trò cụ thể (`admin`, `nhan_vien`, `bep`).

---

## 3. BẢNG TỔNG HỢP SO SÁNH QUYỀN HẠN

Dưới đây là bảng tổng hợp trực quan so sánh quyền hạn truy cập của các vai trò trong hệ thống:

| Phân hệ / Chức năng | Khách Hàng | Nhân Viên Phục Vụ | Nhà Bếp / Thủ Kho | Ban Điều Hành (Admin) |
| :--- | :---: | :---: | :---: | :---: |
| **Xem menu & tự đặt món qua QR** | 🟢 Có | 🟢 Có | 🔴 Không | 🟢 Có |
| **Chọn độ ưu tiên món ăn & xem time chờ**| 🟢 Có | 🟢 Có | 🔴 Không | 🟢 Có |
| **Gửi yêu cầu thanh toán (Tiền mặt/QR)** | 🟢 Có | 🟢 Có | 🔴 Không | 🟢 Có |
| **Xem Sơ đồ bàn ăn & Trạng thái bàn** | 🔴 Không | 🟢 Có | 🔴 Không | 🟢 Có |
| **Thêm bàn ăn & In mã QR để dán** | 🔴 Không | 🟢 Có | 🔴 Không | 🟢 Có |
| **Thanh toán & Tách hóa đơn (Split Bill)** | 🔴 Không | 🟢 Có | 🔴 Không | 🟢 Có |
| **Quản lý CRM Khách hàng & Tích điểm** | 🔴 Không | 🟢 Có | 🔴 Không | 🟢 Có |
| **Màn hình KDS điều phối bếp ăn** | 🔴 Không | 🔴 Không | 🟢 Có | 🟢 Có |
| **Cấu hình số lượng đầu bếp trực ca** | 🔴 Không | 🔴 Không | 🟢 Có | 🟢 Có |
| **Thay đổi trạng thái chế biến món ăn** | 🔴 Không | 🟢 Có | 🟢 Có | 🟢 Có |
| **Xem chi tiết Lô nguyên liệu & Date** | 🔴 Không | 🔴 Không | 🟢 Có | 🟢 Có |
| **So sánh giá NCC & Đề xuất mua hàng** | 🔴 Không | 🔴 Không | 🟢 Có | 🟢 Có |
| **Duyệt nhập kho & Kiểm kê thực nhận** | 🔴 Không | 🔴 Không | 🟢 Có | 🟢 Có |
| **Tạo biên bản Hao hụt / Hủy hàng hỏng** | 🔴 Không | 🔴 Không | 🟢 Có | 🟢 Có |
| **Xem Dashboard báo cáo & Xuất Excel** | 🔴 Không | 🔴 Không | 🔴 Không | 🟢 Có |
| **Quản lý danh mục món ăn & Công thức BOM**| 🔴 Không | 🔴 Không | 🔴 Không | 🟢 Có |
| **Quản lý danh sách nhân sự & Phân quyền** | 🔴 Không | 🔴 Không | 🔴 Không | 🟢 Có |

---

## 4. QUY TRÌNH PHỐI HỢP VẬN HÀNH THỰC TẾ (WORKFLOW)

Mô hình dưới đây mô tả sự tương tác chặt chẽ giữa các vai trò khi có một giao dịch phát sinh:

1.  **Bước 1 (Khách Hàng):** Quét mã QR tại bàn ăn $\rightarrow$ Khai báo số khách $\rightarrow$ Lựa chọn món ăn $\rightarrow$ Chọn độ ưu tiên $\rightarrow$ Gửi yêu cầu đặt món.
2.  **Bước 2 (Nhà Bếp):** Nhận được âm thanh báo món mới $\rightarrow$ Bấm tiếp nhận chế biến (`dang_lam`) $\rightarrow$ Hệ thống tự động trừ kho nguyên liệu từ các Lô hàng có date gần nhất (FEFO) $\rightarrow$ Chế biến xong bấm hoàn thành (`da_xong`).
3.  **Bước 3 (Nhân Viên):** Nhìn thấy trạng thái món đã xong $\rightarrow$ Phục vụ món ra bàn $\rightarrow$ Cập nhật trạng thái đã giao cho khách.
4.  **Bước 4 (Khách Hàng & Thu Ngân):** Khách hàng bấm yêu cầu thanh toán $\rightarrow$ Thu ngân kiểm tra bàn $\rightarrow$ Thực hiện nghiệp vụ CRM tích điểm theo SĐT khách hàng $\rightarrow$ Thu ngân xác nhận thanh toán (hoặc tách bill) $\rightarrow$ Giải phóng bàn ăn về trạng thái `Trống`.
5.  **Bước 5 (Admin):** Cuối ca/cuối ngày, Admin truy cập Dashboard $\rightarrow$ Đối chiếu két tiền mặt và tài khoản chuyển khoản $\rightarrow$ Bấm lưu trữ báo cáo định kỳ $\rightarrow$ Xuất file Excel báo cáo phục vụ kiểm toán tài chính và lập kế hoạch mua hàng đợt tiếp theo.

---

## 5. ĐỒNG BỘ REAL-TIME KHÔNG CẦN F5 (LARAVEL REVERB + ECHO)

Hệ thống được tích hợp bộ đôi **Laravel Reverb (WebSocket server)** và **Laravel Echo** phía máy khách, mang lại khả năng đồng bộ hóa tức thời mọi hoạt động của nhà hàng mà hoàn toàn **không cần tải lại trang (F5)**:

*   **Tải và cập nhật tức thì trạng thái bếp (KDS):** Khi khách đặt món qua mã QR, màn hình bếp của đầu bếp (`bep.blade.php`) lập tức phát ra âm thanh thông báo và tự động vẽ lại danh sách món cần nấu. Đầu bếp thay đổi trạng thái sang `dang_lam` hoặc `da_giao`, hệ thống tự phát đi tín hiệu.
*   **Trải nghiệm Khách hàng mượt mà tại Bàn (QR Order):** Phía khách hàng, tiến độ chuẩn bị món ăn tại tab *Trạng Thái Bếp* tự động tăng % thanh tiến trình và đổi màu badge trạng thái mà không cần tải lại trang. Khi nhân viên xác nhận thanh toán thành công, màn hình điện thoại của khách lập tức chuyển sang chế độ "Cảm ơn quý khách" (`successScreen`).
*   **Đồng bộ sơ đồ bàn ăn và thông báo thanh toán cho Nhân viên:** Khi khách bấm nút yêu cầu thanh toán hoặc báo đã chuyển khoản thành công từ điện thoại của họ, sơ đồ bàn của nhân viên phục vụ (`nhan_vien.blade.php`) lập tức nhấp nháy chuyển màu trạng thái và cập nhật bảng tính tiền real-time.
*   **Cập nhật Dashboard điều hành tự động:** Dashboard của quản lý/admin (`quan_ly.blade.php`) liên tục cập nhật biểu đồ TOP 5 bán chạy, doanh thu tích lũy, mật độ bàn ăn và timeline gọi món mới theo thời gian thực mà không làm gián đoạn các thao tác lọc hay nhập dữ liệu của Admin.

*Kết quả dự kiến:* Đồng bộ dữ liệu tức thời giữa Khách hàng $\rightarrow$ Nhà bếp $\rightarrow$ Phục vụ $\rightarrow$ Quản lý, triệt tiêu hoàn toàn độ trễ, giảm thời gian chờ của khách và nâng cao tối đa hiệu quả vận hành của nhà hàng.

---

## 6. HỆ THỐNG TỰ ĐỘNG HÓA TÁC VỤ (LARAVEL CONSOLE COMMAND & SCHEDULER)

Để tối ưu hóa quy trình quản lý hành chính và bảo toàn dữ liệu, hệ thống tích hợp các tác vụ tự động hóa chạy ngầm qua Laravel Console Command (Artisan) và bộ lập lịch Scheduler:

1.  **Kiểm tra tồn kho và hạn sử dụng nguyên liệu (`php artisan inventory:check`):**
    *   *Nghiệp vụ:* Tự động quét toàn bộ bảng nguyên liệu để lọc ra các mặt hàng có tồn kho dưới 5 (kg/đơn vị). Đồng thời, quét các lô hàng nhập khẩu (`lo_hang_nhap`) để tìm các lô hàng sắp hết hạn (trong vòng 7 ngày) hoặc đã quá hạn sử dụng.
    *   *Tác vụ ngầm:* Tự động cảnh báo qua file log hệ thống (`storage/logs/laravel.log`) và đưa danh sách cảnh báo này lên bảng tin của nhà bếp/admin.
    *   *Lịch trình:* Tự động chạy vào lúc **08:00 sáng hàng ngày** để thủ kho chuẩn bị phương án nhập hàng trước ca làm việc.
2.  **Tự động tạo báo cáo định kỳ cuối tháng (`php artisan report:generate`):**
    *   *Nghiệp vụ:* Tổng hợp toàn bộ doanh thu, số lượng đơn hàng hoàn thành/bị hủy, lượng khách phục vụ, tính toán TOP 5 món bán chạy nhất/bán chậm nhất và danh sách nguyên liệu sắp hết tồn kho trong tháng.
    *   *Tác vụ ngầm:* Tự động tạo bản ghi mới trong bảng `bao_cao_quan_ly` và đồng thời xuất bản một file Excel báo cáo tháng có tích hợp biểu đồ sản lượng bán hàng trực quan (in-cell bar chart) lưu trữ trực tiếp trong thư mục `storage/app/backups/`.
    *   *Kích hoạt khẩn cấp:* Tích hợp nút **"Tạo báo cáo tháng tự động"** ngay trên giao diện Dashboard quản lý để Admin có thể kích hoạt tạo báo cáo tức thời bất kỳ lúc nào khi cần gấp mà không phải chờ cuối tháng.
    *   *Lịch trình tự động:* Tự động chạy ngầm vào lúc **23:30 đêm ngày cuối cùng của tháng (Last Day of Month)**.
3.  **Sao lưu toàn bộ cơ sở dữ liệu MySQL (`php artisan db:backup`):**
    *   *Nghiệp vụ:* Kết xuất toàn bộ cấu trúc bảng và toàn bộ dữ liệu hiện hữu của cơ sở dữ liệu MySQL thành một tệp SQL hoàn chỉnh (`.sql`), bao gồm: tài khoản nhân viên (`users`), hóa đơn & đơn hàng (`dat_mon`), tồn kho (`nguyen_lieu`, `lo_hang_nhap`), và lịch sử doanh thu (`bao_cao_quan_ly`).
    *   *Tác vụ ngầm:* Tự động tạo và lưu trữ tệp sao lưu tại thư mục `storage/app/backups/`.
    *   *Lịch trình:* Tự động chạy vào lúc **23:59 đêm hàng ngày**.
4.  **Sao lưu toàn bộ tệp tin hệ thống (`php artisan system:backup`):**
    *   *Nghiệp vụ:* Tải và lưu trữ các tệp vật lý của hệ thống bao gồm: Hình ảnh món ăn, mã QR bàn ăn (tải tự động từ API cho từng bàn), các tệp báo cáo doanh thu đã xuất dạng CSV, và tài liệu hướng dẫn vận hành dạng văn bản.
    *   *Tác vụ ngầm:* Tự động đóng gói và nén tất cả các thư mục trên thành một tệp ZIP lưu trữ tại `storage/app/backups/`.
    *   *Lịch trình:* Tự động chạy vào lúc **23:59 đêm hàng ngày**.

*Kết quả dự kiến:* Tự động hóa hoàn toàn các tác vụ quản lý và sao lưu định kỳ, giảm thiểu 100% thao tác thủ công của nhân sự, phòng ngừa triệt để các rủi ro về hết hạn nguyên liệu và mất an toàn dữ liệu.
