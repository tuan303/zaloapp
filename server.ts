import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Routes
  app.get("/api/news", async (req, res) => {
    try {
      console.log("Fetching news from school website: https://hoangmaistarschool.edu.vn/blog");
      const response = await fetch("https://hoangmaistarschool.edu.vn/blog");
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const news: any[] = [];
      
      // Try to find blog items. Common selectors for school/WP sites
      const selectors = [
        ".inner-news-item", ".blog-item", ".post-item", "article", ".item-blog", ".post", ".entry",
        ".vce-grid-item", ".elementor-post"
      ];
      
      let items: any = null;
      for (const selector of selectors) {
        const found = $(selector);
        if (found.length > 0) {
          items = found;
          console.log(`Found ${found.length} items with selector: ${selector}`);
          break;
        }
      }

      if (items) {
        items.each((i: number, el: any) => {
          if (i >= 10) return; // Limit to 10 items
          
          const $el = $(el);
          
          // Specific selectors for hoangmaistarschool.edu.vn
          let title = $el.find(".inner-title").text().trim();
          if (!title) title = $el.find("h1, h2, h3, .title, .entry-title").first().text().trim();
          
          let link = $el.find("a").first().attr("href");
          
          let img = $el.find("img").first().attr("src") || $el.find("img").first().attr("data-src");
          
          let date = $el.find(".inner-tag span:nth-child(2)").text().trim();
          if (!date) date = $el.find(".date, .time, .entry-date, time").first().text().trim() || new Date().toLocaleDateString("vi-VN");
          
          let tag = $el.find(".inner-tag span:nth-child(1)").text().trim() || "Tin tức";
          
          let desc = $el.find(".excerpt, .entry-content, p, .description").first().text().trim();
          if (!desc) desc = title; // Fallback if no description
          
          if (title) {
            news.push({
              id: `web-${i}`,
              title,
              date,
              tag,
              img: img?.startsWith("http") ? img : (img ? `https://hoangmaistarschool.edu.vn${img}` : "https://lh3.googleusercontent.com/aida-public/AB6AXuAmp0pra8FgPwn4a7TknxlEhMPqdIav7XOZBNgzGB3w2P4Og88NDdDNeL3e52jxPL1Q6-GRSYBkRRSWpCfytLFql3wHU28k9RjYAkF9vaXyodH_ZykLJQjHh_KP4nOVLEUzEJR9MqDZziu85tNthaJf4ENNeaaJRxKjILlWm7YyT0r2EMxUHqf395_kzg6xOnSNDY08aT5iE9NJ-Rd1INex8y6mMTzpo-D6l1ZtReCB4-iHmoTpYNj_4_Yvik13XxgJNkh2VLiLFtOk"),
              url: link?.startsWith("http") ? link : `https://hoangmaistarschool.edu.vn${link}`,
              desc: desc.substring(0, 150) + (desc.length > 150 ? "..." : ""),
              views: Math.floor(Math.random() * 500) + 100
            });
          }
        });
      }

      if (news.length > 0) {
        return res.json(news);
      }
      
      console.log("No news found via scraping, falling back to mock data.");
    } catch (error) {
      console.error("Error fetching news from website:", error);
    }

    // Fallback Mock Data
    const mockNews = [
      {
        id: "1",
        title: "WORKSHOP: KHI CON LÀ PHIÊN BẢN DUY NHẤT – HIỂU ĐÚNG ĐỂ ĐỒNG HÀNH ĐÚNG",
        date: "07/04/2026",
        tag: "Workshop",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmp0pra8FgPwn4a7TknxlEhMPqdIav7XOZBNgzGB3w2P4Og88NDdDNeL3e52jxPL1Q6-GRSYBkRRSWpCfytLFql3wHU28k9RjYAkF9vaXyodH_ZykLJQjHh_KP4nOVLEUzEJR9MqDZziu85tNthaJf4ENNeaaJRxKjILlWm7YyT0r2EMxUHqf395_kzg6xOnSNDY08aT5iE9NJ-Rd1INex8y6mMTzpo-D6l1ZtReCB4-iHmoTpYNj_4_Yvik13XxgJNkh2VLiLFtOk",
        url: "https://hoangmaistarschool.edu.vn/blog",
        desc: "Buổi chia sẻ chuyên sâu về tâm lý giáo dục, giúp phụ huynh thấu hiểu và đồng hành cùng con trên hành trình phát triển bản thân.",
        views: 185
      },
      {
        id: "2",
        title: "EDUTALK: GIẢI MÃ GIAI ĐOẠN CHUYỂN CẤP – XÂY DỰNG LỘ TRÌNH VỮNG CHẮC",
        date: "30/03/2026",
        tag: "EduTalk",
        img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1x6Q9nJ60TDpqukl98Dduj-kmMEzwN8MACsiv8UiqBUQ-QcUbJ3NgS9o0mCefUIfj-5dTuqsVnfTI3WtryMG3JNZ6vxW4JlpX2z66urE9Ja1W-rOpcmfBFVHMO33TQmy7slqu8NJ0MB0zal46J36fMrIR0-Bt_f061ZcYGOUw3Y4pXqCXwi0P_2SAD9UiuZnPqV2saUi3e9Ga2IwUUIAncu2DcXx2JJc6x3bC3Qx0FvsHumDeNdVzRWJGjhCqMxOhWSVArqD8PvEO",
        url: "https://hoangmaistarschool.edu.vn/blog",
        desc: "Lộ trình chuyển cấp từ Tiểu học lên THCS và từ THCS lên THPT với những định hướng chiến lược từ các chuyên gia giáo dục.",
        views: 116
      }
    ];

    res.json(mockNews);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
