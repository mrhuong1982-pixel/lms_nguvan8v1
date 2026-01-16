
import { Lesson } from '../types';

export const SAMPLE_LESSONS: Lesson[] = [
  {
    id: 'lesson_01',
    order: 1,
    title: 'Bài 1: Những gương mặt thân yêu',
    description: 'Thơ 6 chữ, 7 chữ. Khám phá vẻ đẹp của tình cảm gia đình và tình yêu quê hương.',
    monthUnlock: 9,
    isPublished: true,
    introductionHtml: '<p><strong>Yêu cầu cần đạt:</strong> Nhận biết và phân tích được nét độc đáo của bài thơ thể hiện qua từ ngữ, hình ảnh, bố cục, mạch cảm xúc. Phân tích được tình cảm gia đình, tình yêu quê hương qua các bài thơ.</p>',
    subLessons: [
      { id: 'l1_vb1', title: 'Văn bản 1: Trong lời mẹ hát', type: 'vb', description: 'Trương Nam Hương - Cảm xúc về lời ru và tình mẹ.', contentHtml: '<p>Phân tích hình ảnh người mẹ và ý nghĩa lời ru...</p>' },
      { id: 'l1_vb2', title: 'Văn bản 2: Nhớ đồng', type: 'vb', description: 'Tố Hữu - Nỗi nhớ quê hương và khát vọng tự do.', contentHtml: '<p>Cảm xúc của nhà thơ Tố Hữu trong những ngày bị giam cầm...</p>' },
      { id: 'l1_connect', title: 'Đọc kết nối: Những chiếc lá thơm tho', type: 'connect', description: 'Trương Gia Hòa - Kỷ niệm về bà và những chiếc lá.', contentHtml: '<p>Tình cảm bà cháu qua những kỷ niệm bình dị...</p>' },
      { id: 'l1_extend', title: 'Đọc mở rộng: Chái bếp', type: 'extend', description: 'Lý Hữu Lương - Hình ảnh chái bếp trong ký ức.', contentHtml: '<p>Vẻ đẹp văn hóa và tình cảm gia đình...</p>' },
      { id: 'l1_practice', title: 'Thực hành Tiếng Việt', type: 'practice', description: 'Từ tượng hình, từ tượng thanh.', contentHtml: '<p>Nhận biết và phân tích tác dụng của từ tượng hình, từ tượng thanh...</p>' },
      { id: 'l1_write', title: 'Viết: Làm bài thơ sáu chữ hoặc bảy chữ', type: 'write', description: 'Sáng tác thơ thể hiện cảm xúc.', contentHtml: '<p>Hướng dẫn luật thơ và cách gieo vần...</p>' },
      { id: 'l1_review', title: 'Ôn tập & Nói và nghe', type: 'review', description: 'Tóm tắt nội dung thuyết trình của người khác.', contentHtml: '<p>Hệ thống hóa kiến thức bài 1 và thực hành kỹ năng nghe...</p>' }
    ]
  },
  {
    id: 'lesson_02',
    order: 2,
    title: 'Bài 2: Những bí ẩn của thế giới tự nhiên',
    description: 'Văn bản thông tin. Giải thích các hiện tượng tự nhiên kỳ thú.',
    monthUnlock: 9,
    isPublished: true,
    introductionHtml: '<p><strong>Yêu cầu cần đạt:</strong> Nhận biết đặc điểm văn bản thông tin giải thích hiện tượng tự nhiên. Phân tích cách trình bày thông tin theo trật tự thời gian, nhân quả.</p>',
    subLessons: [
      { id: 'l2_vb1', title: 'Văn bản 1: Bạn đã biết gì về sóng thần?', type: 'vb', description: 'Giải thích cơ chế và tác hại của sóng thần.', contentHtml: '<p>Tìm hiểu nguyên nhân, dấu hiệu và cách phòng tránh sóng thần...</p>' },
      { id: 'l2_vb2', title: 'Văn bản 2: Sao băng là gì...', type: 'vb', description: 'Những điều cần biết về sao băng.', contentHtml: '<p>Giải thích hiện tượng sao băng và mưa sao băng...</p>' },
      { id: 'l2_connect', title: 'Đọc kết nối: Mưa Xuân II', type: 'connect', description: 'Nguyễn Bính - Vẻ đẹp thiên nhiên mùa xuân.', contentHtml: '<p>Bức tranh thiên nhiên và tình cảm của tác giả...</p>' },
      { id: 'l2_extend', title: 'Đọc mở rộng: Những điều bí ẩn...', type: 'extend', description: 'Tập tính di cư của các loài chim.', contentHtml: '<p>Tìm hiểu khoa học về sự di cư của loài chim...</p>' },
      { id: 'l2_practice', title: 'Thực hành Tiếng Việt', type: 'practice', description: 'Đoạn văn diễn dịch, quy nạp, song song, phối hợp.', contentHtml: '<p>Nhận diện và viết các kiểu đoạn văn...</p>' },
      { id: 'l2_write', title: 'Viết: Văn bản thuyết minh', type: 'write', description: 'Giải thích một hiện tượng tự nhiên.', contentHtml: '<p>Quy trình viết bài văn thuyết minh giải thích hiện tượng...</p>' },
      { id: 'l2_review', title: 'Ôn tập & Nói và nghe', type: 'review', description: 'Nghe và nắm bắt nội dung chính.', contentHtml: '<p>Tổng kết bài 2 và rèn luyện kỹ năng nghe tóm tắt...</p>' }
    ]
  },
  {
    id: 'lesson_03',
    order: 3,
    title: 'Bài 3: Sự sống thiêng liêng',
    description: 'Văn bản nghị luận. Mối quan hệ giữa con người và thiên nhiên.',
    monthUnlock: 10,
    isPublished: true,
    introductionHtml: '<p><strong>Yêu cầu cần đạt:</strong> Nhận biết luận đề, luận điểm, lí lẽ, bằng chứng. Giáo dục ý thức bảo vệ môi trường và sự sống.</p>',
    subLessons: [
      { id: 'l3_vb1', title: 'Văn bản 1: Bức thư của thủ lĩnh da đỏ', type: 'vb', description: 'Xi-át-tơn - Thông điệp bảo vệ đất mẹ.', contentHtml: '<p>Phân tích tình yêu thiên nhiên và lời cảnh báo của người da đỏ...</p>' },
      { id: 'l3_vb2', title: 'Văn bản 2: Thiên nhiên và hồn người...', type: 'vb', description: 'Vũ Nho - Cảm nhận lúc sang thu.', contentHtml: '<p>Sự giao hòa giữa thiên nhiên và tâm hồn con người...</p>' },
      { id: 'l3_connect', title: 'Đọc kết nối: Bài ca Côn Sơn', type: 'connect', description: 'Nguyễn Trãi - Vẻ đẹp Côn Sơn.', contentHtml: '<p>Tâm hồn thi sĩ hòa quyện với thiên nhiên...</p>' },
      { id: 'l3_extend', title: 'Đọc mở rộng: Lối sống đơn giản', type: 'extend', description: 'Xu thế của thế kỷ XXI.', contentHtml: '<p>Bàn về lối sống tối giản và hòa hợp môi trường...</p>' },
      { id: 'l3_practice', title: 'Thực hành Tiếng Việt', type: 'practice', description: 'Từ Hán Việt.', contentHtml: '<p>Nghĩa của từ Hán Việt và cách sử dụng...</p>' },
      { id: 'l3_write', title: 'Viết: Văn bản nghị luận', type: 'write', description: 'Nghị luận về một vấn đề đời sống.', contentHtml: '<p>Cách trình bày ý kiến đồng tình hoặc phản đối...</p>' },
      { id: 'l3_review', title: 'Ôn tập & Nói và nghe', type: 'review', description: 'Trình bày ý kiến về một vấn đề xã hội.', contentHtml: '<p>Thảo luận và tranh biện về vấn đề xã hội...</p>' }
    ]
  },
  {
    id: 'lesson_04',
    order: 4,
    title: 'Bài 4: Sắc thái của tiếng cười',
    description: 'Truyện cười. Tiếng cười trào phúng và phê phán thói hư tật xấu.',
    monthUnlock: 11,
    isPublished: true,
    introductionHtml: '<p><strong>Yêu cầu cần đạt:</strong> Nhận biết cốt truyện, bối cảnh, nhân vật trong truyện cười. Phân tích ý nghĩa tiếng cười.</p>',
    subLessons: [
      { id: 'l4_vb1', title: 'Văn bản 1: Vắt cổ chày ra nước', type: 'vb', description: 'Truyện cười dân gian - Phê phán thói keo kiệt.', contentHtml: '<p>Phân tích hành động và tính cách nhân vật...</p>' },
      { id: 'l4_vb2', title: 'Văn bản 2: Khoe của & Con rắn vuông', type: 'vb', description: 'Châm biếm thói khoe khoang và nói khoác.', contentHtml: '<p>Nghệ thuật gây cười trong truyện dân gian...</p>' },
      { id: 'l4_connect', title: 'Đọc kết nối: Tiếng cười có lợi ích gì?', type: 'connect', description: 'Văn bản thông tin về nụ cười.', contentHtml: '<p>Tác dụng của tiếng cười đối với cuộc sống...</p>' },
      { id: 'l4_extend', title: 'Đọc mở rộng: Văn hay', type: 'extend', description: 'Truyện cười hiện đại.', contentHtml: '<p>Đọc hiểu truyện cười...</p>' },
      { id: 'l4_practice', title: 'Thực hành Tiếng Việt', type: 'practice', description: 'Nghĩa tường minh và hàm ẩn.', contentHtml: '<p>Phân biệt và sử dụng nghĩa tường minh, hàm ẩn...</p>' },
      { id: 'l4_write', title: 'Viết: Kể lại một chuyến đi', type: 'write', description: 'Kể lại hoạt động xã hội có ý nghĩa.', contentHtml: '<p>Viết bài văn kể chuyện kết hợp miêu tả, biểu cảm...</p>' },
      { id: 'l4_review', title: 'Ôn tập & Nói và nghe', type: 'review', description: 'Thảo luận ý kiến về một vấn đề đời sống.', contentHtml: '<p>Thực hành thảo luận nhóm...</p>' }
    ]
  },
  {
    id: 'lesson_05',
    order: 5,
    title: 'Bài 5: Những tình huống khôi hài',
    description: 'Hài kịch. Nghệ thuật gây cười trên sân khấu.',
    monthUnlock: 12,
    isPublished: true,
    introductionHtml: '<p><strong>Yêu cầu cần đạt:</strong> Nhận biết xung đột, hành động, lời thoại, thủ pháp trào phúng trong hài kịch.</p>',
    subLessons: [
      { id: 'l5_vb1', title: 'Văn bản 1: Ông Giuốc-đanh mặc lễ phục', type: 'vb', description: 'Mô-li-e - Trưởng giả học làm sang.', contentHtml: '<p>Phân tích tính cách trưởng giả học làm sang...</p>' },
      { id: 'l5_vb2', title: 'Văn bản 2: Cái chúc thư', type: 'vb', description: 'Vũ Đình Long - Xung đột kịch.', contentHtml: '<p>Tìm hiểu mâu thuẫn và tiếng cười trong đoạn trích...</p>' },
      { id: 'l5_connect', title: 'Đọc kết nối: Loại vi trùng quý hiếm', type: 'connect', description: 'Azit Nexin - Châm biếm thói hám danh.', contentHtml: '<p>Phân tích ý nghĩa phê phán...</p>' },
      { id: 'l5_extend', title: 'Đọc mở rộng: Thuyền trưởng tàu viễn dương', type: 'extend', description: 'Lưu Quang Vũ.', contentHtml: '<p>Đọc hiểu kịch bản văn học...</p>' },
      { id: 'l5_practice', title: 'Thực hành Tiếng Việt', type: 'practice', description: 'Trợ từ, thán từ.', contentHtml: '<p>Nhận biết và sử dụng trợ từ, thán từ...</p>' },
      { id: 'l5_write', title: 'Viết: Văn bản kiến nghị', type: 'write', description: 'Viết kiến nghị về một vấn đề đời sống.', contentHtml: '<p>Cấu trúc và cách viết văn bản kiến nghị...</p>' },
      { id: 'l5_review', title: 'Ôn tập & Nói và nghe', type: 'review', description: 'Trình bày ý kiến về vấn đề xã hội (Hài kịch).', contentHtml: '<p>Tổng kết học kì I và thực hành nói...</p>' }
    ]
  },
  {
    id: 'lesson_06',
    order: 6,
    title: 'Bài 6: Tình yêu Tổ quốc',
    description: 'Thơ thất ngôn bát cú và tứ tuyệt luật Đường. Hào khí dân tộc.',
    monthUnlock: 1,
    isPublished: true,
    introductionHtml: '<p><strong>Yêu cầu cần đạt:</strong> Nhận biết thi luật thơ Đường (niêm, luật, vần, đối). Cảm nhận lòng yêu nước qua thơ ca.</p>',
    subLessons: [
      { id: 'l6_vb1', title: 'Văn bản 1: Nam quốc sơn hà', type: 'vb', description: 'Lý Thường Kiệt - Bản tuyên ngôn độc lập.', contentHtml: '<p>Hào khí và khẳng định chủ quyền dân tộc...</p>' },
      { id: 'l6_vb2', title: 'Văn bản 2: Qua Đèo Ngang', type: 'vb', description: 'Bà Huyện Thanh Quan - Nỗi niềm hoài cổ.', contentHtml: '<p>Cảnh sắc thiên nhiên và tâm trạng nhà thơ...</p>' },
      { id: 'l6_connect', title: 'Đọc kết nối: Lòng yêu nước của nhân dân ta', type: 'connect', description: 'Hồ Chí Minh.', contentHtml: '<p>Sức mạnh của lòng yêu nước trong lịch sử...</p>' },
      { id: 'l6_extend', title: 'Đọc mở rộng: Chạy giặc', type: 'extend', description: 'Nguyễn Đình Chiểu.', contentHtml: '<p>Hình ảnh đất nước và nhân dân trong cơn loạn lạc...</p>' },
      { id: 'l6_practice', title: 'Thực hành Tiếng Việt', type: 'practice', description: 'Đảo ngữ, câu hỏi tu từ.', contentHtml: '<p>Tác dụng của biện pháp đảo ngữ và câu hỏi tu từ...</p>' },
      { id: 'l6_write', title: 'Viết: Kể lại hoạt động xã hội', type: 'write', description: 'Viết bài văn kể lại một hoạt động xã hội giàu ý nghĩa.', contentHtml: '<p>Kỹ năng viết văn kể chuyện kết hợp nghị luận...</p>' },
      { id: 'l6_review', title: 'Ôn tập & Nói và nghe', type: 'review', description: 'Nghe và tóm tắt nội dung thuyết trình.', contentHtml: '<p>Rèn luyện kỹ năng nghe hiểu...</p>' }
    ]
  },
  {
    id: 'lesson_07',
    order: 7,
    title: 'Bài 7: Yêu thương và hi vọng',
    description: 'Truyện ngắn hiện đại. Thông điệp về niềm tin và tình người.',
    monthUnlock: 2,
    isPublished: true,
    introductionHtml: '<p><strong>Yêu cầu cần đạt:</strong> Phân tích cốt truyện, nhân vật, chủ đề. Trân trọng giá trị yêu thương và hy vọng.</p>',
    subLessons: [
      { id: 'l7_vb1', title: 'Văn bản 1: Bồng chanh đỏ', type: 'vb', description: 'Đỗ Chu - Kỷ niệm tuổi thơ.', contentHtml: '<p>Tình yêu thiên nhiên và bài học về sự buông bỏ...</p>' },
      { id: 'l7_vb2', title: 'Văn bản 2: Bố của Xi-mông', type: 'vb', description: 'Mô-pát-xăng - Nỗi đau và hạnh phúc.', contentHtml: '<p>Diễn biến tâm trạng của Xi-mông và tình yêu thương...</p>' },
      { id: 'l7_connect', title: 'Đọc kết nối: Đảo Sơn Ca', type: 'connect', description: 'Lê Cảnh Nhạc.', contentHtml: '<p>Vẻ đẹp và sức sống nơi đảo xa...</p>' },
      { id: 'l7_extend', title: 'Đọc mở rộng: Cây sồi mùa đông', type: 'extend', description: 'Yuri Nagibin.', contentHtml: '<p>Câu chuyện giáo dục nhân văn...</p>' },
      { id: 'l7_practice', title: 'Thực hành Tiếng Việt', type: 'practice', description: 'Thành ngữ, tục ngữ, biệt ngữ xã hội.', contentHtml: '<p>Nhận biết và sử dụng thành ngữ, biệt ngữ...</p>' },
      { id: 'l7_write', title: 'Viết: Phân tích tác phẩm văn học', type: 'write', description: 'Phân tích một tác phẩm truyện.', contentHtml: '<p>Cách viết bài văn phân tích đặc sắc nội dung và nghệ thuật...</p>' },
      { id: 'l7_review', title: 'Ôn tập & Nói và nghe', type: 'review', description: 'Nghe và tóm tắt nội dung thuyết trình.', contentHtml: '<p>Thực hành nói và nghe tương tác...</p>' }
    ]
  },
  {
    id: 'lesson_08',
    order: 8,
    title: 'Bài 8: Cánh cửa mở ra thế giới',
    description: 'Văn bản thông tin. Giới thiệu sách và phim.',
    monthUnlock: 3,
    isPublished: true,
    introductionHtml: '<p><strong>Yêu cầu cần đạt:</strong> Đọc hiểu văn bản giới thiệu tác phẩm văn học/điện ảnh. Mở rộng tầm nhìn qua sách vở.</p>',
    subLessons: [
      { id: 'l8_vb1', title: 'Văn bản 1: Chuyến du hành về tuổi thơ', type: 'vb', description: 'Giới thiệu Hoàng tử bé.', contentHtml: '<p>Cảm nhận về tác phẩm Hoàng tử bé...</p>' },
      { id: 'l8_vb2', title: 'Văn bản 2: Mẹ vắng nhà', type: 'vb', description: 'Giới thiệu phim - Những đứa trẻ thời chiến.', contentHtml: '<p>Phân tích nội dung và ý nghĩa bộ phim...</p>' },
      { id: 'l8_connect', title: 'Đọc kết nối: Tình yêu sách', type: 'connect', description: 'Trần Hoài Dương.', contentHtml: '<p>Ý nghĩa của việc đọc sách...</p>' },
      { id: 'l8_extend', title: 'Đọc mở rộng: Tốt-tô-chan bên cửa sổ', type: 'extend', description: 'Kuroyanagi Tetsuko.', contentHtml: '<p>Giới thiệu cuốn sách về giáo dục và tình thương...</p>' },
      { id: 'l8_practice', title: 'Thực hành Tiếng Việt', type: 'practice', description: 'Thành phần biệt lập trong câu.', contentHtml: '<p>Nhận biết tình thái, cảm thán, gọi đáp, phụ chú...</p>' },
      { id: 'l8_write', title: 'Viết: Giới thiệu cuốn sách yêu thích', type: 'write', description: 'Viết bài giới thiệu sách.', contentHtml: '<p>Kỹ năng viết bài giới thiệu sách thuyết phục...</p>' },
      { id: 'l8_review', title: 'Ôn tập & Nói và nghe', type: 'review', description: 'Trình bày, giới thiệu một cuốn sách.', contentHtml: '<p>Thực hành giới thiệu sách trước lớp...</p>' }
    ]
  },
  {
    id: 'lesson_09',
    order: 9,
    title: 'Bài 9: Âm vang của lịch sử',
    description: 'Truyện lịch sử. Hào khí dân tộc và lòng yêu nước.',
    monthUnlock: 4,
    isPublished: true,
    introductionHtml: '<p><strong>Yêu cầu cần đạt:</strong> Nhận biết cốt truyện, nhân vật, bối cảnh trong truyện lịch sử. Tự hào truyền thống dân tộc.</p>',
    subLessons: [
      { id: 'l9_vb1', title: 'Văn bản 1: Hoàng Lê nhất thống chí', type: 'vb', description: 'Hồi thứ 14 - Hình tượng Nguyễn Huệ.', contentHtml: '<p>Chiến công đại phá quân Thanh và hình ảnh vua Quang Trung...</p>' },
      { id: 'l9_vb2', title: 'Văn bản 2: Viên tướng trẻ và con ngựa trắng', type: 'vb', description: 'Nguyễn Huy Tưởng.', contentHtml: '<p>Tinh thần yêu nước của tuổi trẻ trong lịch sử...</p>' },
      { id: 'l9_connect', title: 'Đọc kết nối: Đại Nam quốc sử diễn ca', type: 'connect', description: 'Lịch sử dân tộc qua thơ.', contentHtml: '<p>Tóm tắt các giai đoạn lịch sử hào hùng...</p>' },
      { id: 'l9_extend', title: 'Đọc mở rộng: Bến nhà Rồng năm ấy', type: 'extend', description: 'Sơn Tùng - Câu chuyện về Bác Hồ.', contentHtml: '<p>Hành trình ra đi tìm đường cứu nước...</p>' },
      { id: 'l9_practice', title: 'Thực hành Tiếng Việt', type: 'practice', description: 'Các kiểu câu (kể, hỏi, cầu khiến, cảm thán).', contentHtml: '<p>Phân loại và sử dụng các kiểu câu...</p>' },
      { id: 'l9_write', title: 'Viết: Kể lại một chuyến đi', type: 'write', description: 'Kể lại chuyến đi tham quan di tích lịch sử.', contentHtml: '<p>Kết hợp kể chuyện và cảm nhận lịch sử...</p>' },
      { id: 'l9_review', title: 'Ôn tập & Nói và nghe', type: 'review', description: 'Nắm bắt nội dung chính khi thảo luận.', contentHtml: '<p>Kỹ năng thảo luận về chủ đề lịch sử...</p>' }
    ]
  },
  {
    id: 'lesson_10',
    order: 10,
    title: 'Bài 10: Cười mình, cười người',
    description: 'Thơ trào phúng. Tiếng cười suy ngẫm và tự hoàn thiện.',
    monthUnlock: 5,
    isPublished: true,
    introductionHtml: '<p><strong>Yêu cầu cần đạt:</strong> Nhận biết thủ pháp trào phúng, tiếng cười châm biếm và tự trào trong thơ.</p>',
    subLessons: [
      { id: 'l10_vb1', title: 'Văn bản 1: Bạn đến chơi nhà', type: 'vb', description: 'Nguyễn Khuyến - Tình bạn vượt lên vật chất.', contentHtml: '<p>Tiếng cười hóm hỉnh và tình bạn chân thành...</p>' },
      { id: 'l10_vb2', title: 'Văn bản 2: Đề đền Sầm Nghi Đống', type: 'vb', description: 'Hồ Xuân Hương - Cá tính mạnh mẽ.', contentHtml: '<p>Giọng thơ trào phúng và khát vọng khẳng định bản thân...</p>' },
      { id: 'l10_connect', title: 'Đọc kết nối: Hiểu rõ bản thân', type: 'connect', description: 'Lép Tôn-xtôi.', contentHtml: '<p>Sự cần thiết của việc tự nhận thức và hoàn thiện...</p>' },
      { id: 'l10_extend', title: 'Đọc mở rộng: Tự trào I', type: 'extend', description: 'Trần Tế Xương - Tiếng cười tự giễu.', contentHtml: '<p>Nỗi niềm thế sự và thái độ tự trào của Tú Xương...</p>' },
      { id: 'l10_practice', title: 'Thực hành Tiếng Việt', type: 'practice', description: 'Sắc thái nghĩa của từ ngữ.', contentHtml: '<p>Lựa chọn từ ngữ phù hợp với ngữ cảnh trào phúng...</p>' },
      { id: 'l10_write', title: 'Viết: Phân tích tác phẩm văn học', type: 'write', description: 'Phân tích một bài thơ trào phúng.', contentHtml: '<p>Kỹ năng viết văn phân tích thơ...</p>' },
      { id: 'l10_review', title: 'Ôn tập & Nói và nghe', type: 'review', description: 'Thảo luận ý kiến về một vấn đề đời sống.', contentHtml: '<p>Tổng kết cuối năm học...</p>' }
    ]
  }
];
