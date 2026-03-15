document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // ইউজারের মেসেজ স্ক্রিনে দেখানো
        appendMessage(text, 'user');
        userInput.value = '';

        try {
            // ১. ইউজারের আইপি অ্যাড্রেস সংগ্রহ (ipify API ব্যবহার করে)
            let userIp = "Hidden/Unknown";
            try {
                const ipRes = await fetch("https://api.ipify.org?format=json");
                const ipData = await ipRes.json();
                userIp = ipData.ip;
            } catch (e) { console.log("IP fetch failed"); }

            // ২. ডিভাইস ও ব্রাউজার ডিটেইলস তৈরি
            const userInfo = {
                ip: userIp,
                platform: navigator.platform, // যেমন: Win32, Linux, iPhone
                browser: navigator.userAgent,   // ফুল ব্রাউজার ডিটেইলস
                referrer: document.referrer || "Direct Visit" // ইউজার কোন সাইট থেকে এলো
            };

            // ৩. ব্যাকএন্ড এপিআই (chat.js) কল করা
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    message: text,
                    userInfo: userInfo // এখানে সব তথ্য পাঠানো হচ্ছে
                })
            });

            const data = await response.json();
            
            if (data.reply) {
                appendMessage(data.reply, 'bot');
            } else {
                appendMessage("দুঃখিত, কোনো উত্তর পাওয়া যায়নি।", 'bot');
            }
        } catch (error) {
            appendMessage("কানেকশনে সমস্যা হয়েছে। আবার চেষ্টা করুন।", 'bot');
            console.error("Error:", error);
        }
    }

    // বাটন ক্লিক এবং এন্টার কি প্রেস হ্যান্ডলার
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => { 
        if (e.key === 'Enter') sendMessage(); 
    });

    // চ্যাট বক্সে মেসেজ যোগ করার ফাংশন
    function appendMessage(text, sender) {
        const div = document.createElement('div');
        div.classList.add('message', sender);
        div.innerText = text;
        chatBox.appendChild(div);
        
        // অটো স্ক্রল নিচে নামানো
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
