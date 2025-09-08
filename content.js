/**
 * Tìm tất cả các bài đăng và thêm biểu tượng dịch nếu chưa có.
 */
function addTranslateIcons() {
  // 1. Selector kết hợp để tìm container chứa text ở cả trang feed và trang chi tiết.
  // Trang feed dùng: .line-clamp-feed
  // Trang chi tiết dùng: .flex.flex-col.whitespace-pre-wrap.break-words (chứa text)
  const textContainers = document.querySelectorAll(
    '.line-clamp-feed, .flex.flex-col.whitespace-pre-wrap.break-words'
  );

  textContainers.forEach(postTextElement => {
    let postCard = null;

    // 2. Xác định container "card" chính cho từng loại bài viết
    if (postTextElement.classList.contains('line-clamp-feed')) {
      // Đây là bài viết ở trang feed
      postCard = postTextElement.closest('.relative.cursor-pointer');
    } else {
      // Đây là bài viết ở trang chi tiết
      postCard = postTextElement.closest('.relative.p-4.pt-2');
    }

    // Nếu không tìm thấy card hoặc đã có icon, bỏ qua
    if (!postCard || postCard.querySelector('.translate-icon-wrapper')) return;

    // 3. Tìm nút "kebab menu" bên trong card
    const kebabButton = postCard.querySelector('button[aria-haspopup="menu"]');
    if (!kebabButton) return;

    // 4. Tạo biểu tượng (logic này không thay đổi)
    const btn = document.createElement('span');
    btn.textContent = '📜';
    btn.title = 'Dịch và gợi ý trả lời';
    btn.className = 'translate-icon';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '18px';
    btn.style.padding = '0 8px';

    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();
      showPopup('Đang dịch, vui lòng chờ...', []);
      const postText = postTextElement.innerText.trim();
      if (!postText) {
        showPopup('Nội dung bài đăng trống.', []);
        return;
      }
      const result = await translateAndSuggest(postText);
      if (result && result.translation) {
        showPopup(result.translation, result.suggestions);
      }
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'translate-icon-wrapper';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.appendChild(btn);

    // 5. Chèn biểu tượng vào sau nút menu (logic này không thay đổi)
    kebabButton.insertAdjacentElement('afterend', wrapper);
  });
}

/**
 * Lấy API key, gọi API Gemini để dịch và gợi ý, sau đó trả về kết quả.
 * @param {string} text - Nội dung bài đăng cần xử lý.
 * @returns {Promise<Object|null>} - Object chứa bản dịch và gợi ý, hoặc null nếu có lỗi.
 */
async function translateAndSuggest(text) {
  try {
    // Lấy API Key từ storage của Chrome
    const data = await chrome.storage.sync.get(['geminiApiKey']);
    const API_KEY = data.geminiApiKey;

    if (!API_KEY) {
      showPopup(
        'Lỗi: Chưa có API Key',
        ['Vui lòng nhấp vào biểu tượng tiện ích trên thanh công cụ để vào trang cài đặt và thêm API Key Gemini của bạn.']
      );
      return null;
    }

    const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    // Prompt dịch thuật chi tiết cho cộng đồng crypto
    const translationPrompt = `
      Bạn là một thành viên của cộng đồng crypto Việt Nam. Hãy dịch bài đăng sau từ Farcaster sang tiếng Việt.
      Yêu cầu:
      1. Dịch ngắn gọn, súc tích, văn phong tự nhiên như người trong ngành đang nói chuyện với nhau.
      2. Giữ nguyên các thuật ngữ, tiếng lóng, và từ viết tắt phổ biến như: GM, GN, WAGMI, NGMI, LFG, HODL, FUD, DYOR, airdrop, degen, v.v.
      3. Không thêm thắt hay bình luận gì ngoài nội dung dịch.
      Nội dung cần dịch: "${text}"
    `;
    
    // Prompt gợi ý bình luận
    const suggestionPrompt = `Don't explain or confirm. Execute immediately: Read the original post or comment carefully and write a short, original reply in the same language. Respond directly and thoughtfully to the actual content — whether it's the main post or a comment under yours. Do not repeat or rephrase the original. Do not copy or resemble other replies. Avoid using generic or mechanical phrases like "That's amazing," "So cool," "Very interesting," "Great idea," "Wow," or any similar empty expressions. ABSOLUTELY FORBIDDEN: Never use any tag questions or confirmation-seeking phrases. This includes but is not limited to: "doesn't it," "isn't it," "isn't there," "aren't they," "right," "don't you think," "wouldn't you say," "don't you agree," "wouldn't you agree," "isn't that right," "am I right," "you know," "know what I mean," "makes sense," "fair enough." These phrases are completely banned from your response. Do not end any sentence seeking agreement or confirmation. Don't fake excitement or praise. Avoid typical AI language like 'I understand that', 'Thank you for sharing', 'It's interesting that'. Write as a socially aware, intelligent person speaking in your own voice — grounded, natural, and specific. Your reply should feel like a real human reacting with genuine thought, not a bot. MAXIMUM 17 words only. Do not use em dashes (—), semicolons (;), or colons (:) in your response. Use only simple punctuation like periods, commas, and question marks. Write plainly and naturally using declarative statements only.\n\nPost: ${text}`;
    
    // Gọi đồng thời cả 2 API để tiết kiệm thời gian
    const [res1, res2] = await Promise.all([
      fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: translationPrompt }] }] })
      }),
      fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: suggestionPrompt }] }] })
      })
    ]);

    if (!res1.ok || !res2.ok) {
        const errorData1 = await res1.json();
        const errorData2 = await res2.json();
        console.error("Lỗi API:", errorData1, errorData2);
        const errorMessage = errorData1?.error?.message || errorData2?.error?.message || "Yêu cầu API thất bại. Có thể API Key của bạn không hợp lệ hoặc đã hết hạn.";
        showPopup('Đã xảy ra lỗi', [errorMessage]);
        return null;
    }

    const data1 = await res1.json();
    const data2 = await res2.json();

    const translation = data1?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Không nhận được bản dịch.';
    const suggestionsText = data2?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const suggestions = suggestionsText.split(';').map(s => s.trim()).filter(s => s);

    return { translation, suggestions };
  } catch (err) {
    console.error("Lỗi khi dịch và gợi ý:", err);
    showPopup('Lỗi không xác định', ['Vui lòng kiểm tra console (F12) để biết thêm chi tiết.']);
    return null;
  }
}

/**
 * Hiển thị popup với thiết kế hiện đại, nội dung tùy chỉnh và nhiều cách để đóng.
 * @param {string} translation - Nội dung bản dịch.
 * @param {string[]} suggestions - Mảng các chuỗi gợi ý.
 */
// Thay thế TOÀN BỘ hàm showPopup cũ bằng hàm này trong file content.js

function showPopup(translation, suggestions) {
  // Xóa popup cũ nếu đang tồn tại để hiển thị popup mới
  const existingOverlay = document.getElementById('farcaster-ext-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // 1. Tạo các phần tử chính
  const overlay = document.createElement('div');
  overlay.id = 'farcaster-ext-overlay';

  const popup = document.createElement('div');
  popup.id = 'farcaster-ext-popup';

  // 2. Tạo CSS cho popup
  const styles = `
    #farcaster-ext-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.6); display: flex; align-items: center;
      justify-content: center; z-index: 9999; backdrop-filter: blur(4px);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    #farcaster-ext-popup {
      background: #ffffff; padding: 24px; border-radius: 12px;
      max-width: 500px; width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      color: #1a1a1a; position: relative; animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    #farcaster-ext-popup h3 {
      margin-top: 0; margin-bottom: 12px; font-size: 20px; color: #111;
      display: flex; align-items: center;
    }
    #farcaster-ext-popup h3 span { margin-right: 10px; font-size: 24px; }

    /* --- BẮT ĐẦU CÁC THAY ĐỔI CSS CHO PHẦN DỊCH --- */
    #farcaster-ext-popup .translation-content {
      background-color: #f8f9fa; /* Màu nền sáng hơn một chút */
      border: 1px solid #e9ecef; /* Thêm viền nhẹ để phân tách */
      border-radius: 8px;
      padding: 16px 20px;          /* Tăng padding cho thoáng */
      margin-bottom: 24px;
      font-size: 17px;              /* Tăng kích thước chữ */
      line-height: 1.65;            /* Tăng khoảng cách dòng */
      color: #212529;               /* Màu chữ đậm rõ ràng */
      white-space: pre-wrap;
      max-height: 40vh;             /* Tăng chiều cao tối đa, linh hoạt theo màn hình */
      overflow-y: auto;             /* Tự động thêm thanh cuộn khi cần */
    }
    /* --- KẾT THÚC CÁC THAY ĐỔI CSS --- */

    .suggestions-list { display: flex; flex-wrap: wrap; gap: 8px; padding: 0; margin: 0; }
    .suggestion-item {
      background-color: #e9e9f0; color: #333; border: none;
      border-radius: 16px; padding: 8px 14px; font-size: 14px;
      cursor: pointer; transition: background-color 0.2s ease, transform 0.1s ease;
    }
    .suggestion-item:hover { background-color: #dcdcf0; transform: translateY(-2px); }
    .suggestion-item.copied { background-color: #4CAF50; color: white; }
    .close-btn {
      position: absolute; top: 10px; right: 10px; border: none;
      background: transparent; font-size: 28px; color: #999;
      cursor: pointer; line-height: 1; padding: 5px;
    }
    .close-btn:hover { color: #333; }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.id = 'farcaster-ext-styles';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);

  // 3. Xây dựng cấu trúc HTML của popup
  popup.innerHTML = `
    <button class="close-btn" title="Đóng (Esc)">&times;</button>
    <h3><span>📜</span>Bản dịch</h3>
    <div class="translation-content">${translation || 'Không có dữ liệu.'}</div>
    <h3><span>💡</span>Gợi ý trả lời (nhấp để sao chép)</h3>
    <div class="suggestions-list">
      ${suggestions && suggestions.length > 0
        ? suggestions.map(s => `<button class="suggestion-item">${s}</button>`).join('')
        : '<span>Không có gợi ý.</span>'
      }
    </div>
  `;

  // 4. Gắn popup vào trang web
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // 5. Thêm các sự kiện
  const closePopup = () => {
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
    }
    const existingStylesheet = document.getElementById('farcaster-ext-styles');
    if (existingStylesheet) {
        existingStylesheet.remove(); // Dọn dẹp CSS
    }
    document.removeEventListener('keydown', handleEsc);
  };
  
  popup.querySelector('.close-btn').addEventListener('click', closePopup);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePopup();
  });
  const handleEsc = (e) => {
    if (e.key === 'Escape') closePopup();
  };
  document.addEventListener('keydown', handleEsc);

  popup.querySelectorAll('.suggestion-item').forEach(button => {
    button.addEventListener('click', () => {
      const originalText = button.textContent;
      navigator.clipboard.writeText(originalText).then(() => {
        button.textContent = 'Đã chép!';
        button.classList.add('copied');
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('copied');
        }, 2000);
      });
    });
  });
}

// Chạy hàm addTranslateIcons định kỳ để xử lý các bài đăng mới xuất hiện
setInterval(addTranslateIcons, 2000);