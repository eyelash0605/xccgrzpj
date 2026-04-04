/* ============================================
   主入口文件 - app.js
   功能：初始化页面动画、表单提交、鼠标视差效果、作品瀑布流
   ============================================ */

(function() {
  'use strict';

  /* ============================================
     腾讯云 COS CDN 配置
     ============================================ */
  const COS_CDN_BASE = 'https://grjltp-1305447954.cos.ap-guangzhou.myqcloud.com';

  /* ============================================
     鼠标视差效果 - 背景 + 四角
     ============================================ */
  function initParallax() {
    const bgImage = document.querySelector('.g-bg-image, #home-bg');
    const corners = document.querySelectorAll('.g-corner');
    
    if (!bgImage) return;

    const sensitivity = 120; // 背景灵敏度
    const cornerSensitivity = 160; // 四角灵敏度

    // PC端鼠标移动
    document.addEventListener('mousemove', function(e) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      applyParallax(mouseX, mouseY, centerX, centerY);
    });

    // 移动端触摸移动
    document.addEventListener('touchmove', function(e) {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        applyParallax(touch.clientX, touch.clientY, centerX, centerY);
      }
    });

    // 触摸结束或鼠标离开时重置
    document.addEventListener('touchend', resetParallax);
    document.addEventListener('mouseleave', resetParallax);

    function applyParallax(mouseX, mouseY, centerX, centerY) {
      const bgOffsetX = (mouseX - centerX) / sensitivity;
      const bgOffsetY = (mouseY - centerY) / sensitivity;
      bgImage.style.transform = `translate(${-bgOffsetX}px, ${-bgOffsetY}px)`;

      corners.forEach(function(corner) {
        const offsetX = (mouseX - centerX) / cornerSensitivity;
        const offsetY = (mouseY - centerY) / cornerSensitivity;
        corner.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      });
    }

    function resetParallax() {
      bgImage.style.transform = 'translate(0, 0)';
      corners.forEach(function(corner) {
        corner.style.transform = 'translate(0, 0)';
      });
    }
  }

  /* ============================================
     文字磁力拉扯效果 - 自动识别版本
     ============================================ */
  function initMagneticText() {
    const strength = 8; // 拉扯强度
    
    // 需要添加动画的元素选择器
    const targetSelectors = [
      // 关于我页面
      '.m-hero__greeting',
      '.m-hero__name',
      '.m-hero__title',
      '.m-hero__desc',
      // 经历页面
      '.m-title',
      '.m-subtitle',
      '.m-timeline__title',
      '.m-timeline__company',
      '.m-timeline__period',
      // 作品页面
      '.m-works__category-card h3',
      '.m-works__category-card p',
      // 联系页面
      '.m-contact__label',
      '.m-contact__value'
    ];

    targetSelectors.forEach(function(selector) {
      const containers = document.querySelectorAll(selector);
      
      containers.forEach(function(container) {
        // 保存原始文本内容
        const originalHTML = container.innerHTML;
        const isSmallText = selector === '.m-hero__desc';
        
        container.innerHTML = '';
        
        // 逐字符处理原始HTML
        let charIndex = 0;
        for (let i = 0; i < originalHTML.length; i++) {
          const char = originalHTML[i];
          
          // 保留 <br> 标签
          if (originalHTML.substring(i, i + 4) === '<br>') {
            const br = document.createElement('br');
            container.appendChild(br);
            i += 3;
            continue;
          }
          
          // 跳过标签
          if (char === '<') {
            const tagEnd = originalHTML.indexOf('>', i);
            if (tagEnd !== -1) {
              const tag = originalHTML.substring(i, tagEnd + 1);
              container.innerHTML += tag;
              i = tagEnd;
              continue;
            }
          }
          
          const span = document.createElement('span');
          span.className = 'magnetic-char';
          if (isSmallText) {
            span.classList.add('magnetic-char--small');
          }
          if (char === '|') {
            span.classList.add('magnetic-char--divider');
          }
          span.textContent = char;
          container.appendChild(span);
          charIndex++;
        }
        
        // 检测是否为移动端
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // 为每个字符添加事件
        const chars = container.querySelectorAll('.magnetic-char');

        if (isMobile) {
          // 移动端：陀螺仪效果
          let gyroX = 0;
          let gyroY = 0;

          window.addEventListener('deviceorientation', function(e) {
            gyroX = e.gamma || 0; // 左右倾斜 -90 ~ 90
            gyroY = e.beta || 0;  // 前后倾斜 -180 ~ 180

            chars.forEach(function(charEl) {
              const moveX = gyroX * 0.5;
              const moveY = gyroY * 0.3;
              charEl.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
          });

          window.addEventListener('touchend', function() {
            chars.forEach(function(charEl) {
              charEl.style.transform = 'translate(0, 0)';
            });
          });
        } else {
          // PC端：鼠标移动触发
          chars.forEach(function(charEl) {
            charEl.addEventListener('mousemove', function(e) {
              const rect = charEl.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;

              const deltaX = (e.clientX - centerX) / (rect.width / 2);
              const deltaY = (e.clientY - centerY) / (rect.height / 2);

              const moveX = deltaX * strength;
              const moveY = deltaY * strength;

              charEl.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });

            charEl.addEventListener('mouseleave', function() {
              charEl.style.transform = 'translate(0, 0)';
            });
          });
        }
      });
    });
  }

  /* ============================================
     移动端卡片触摸动画
     ============================================ */
  function initMobileCardTouch() {
    const categoryCards = document.querySelectorAll('.m-works__category-card');
    
    // 检测是否为移动端
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isMobile) return;

    categoryCards.forEach(function(card) {
      card.addEventListener('touchstart', function() {
        this.classList.add('touch-active');
      });

      card.addEventListener('touchend', function() {
        this.classList.remove('touch-active');
      });

      card.addEventListener('touchcancel', function() {
        this.classList.remove('touch-active');
      });
    });
  }

  /* ============================================
     花瓣网风格瀑布流功能
     ============================================ */
  function initWorksMasonry() {
    const categories = document.getElementById('works-categories');
    const masonry = document.getElementById('works-masonry');
    const masonryGrid = document.getElementById('masonry-grid');
    const masonryTitle = document.getElementById('masonry-title');
    const backBtn = document.getElementById('works-back');

    if (!categories || !masonry) return;

    // 作品数据（使用腾讯云 COS CDN）
    const worksData = {
      brand: {
        title: '平面设计',
        folder: COS_CDN_BASE + '/zyk/pm/',
        items: ['mp (1).jpg', 'mp (2).jpg', 'mp (3).jpg', 'mp (4).jpg', 'mp (5).jpg', 'mp (6).jpg', 'mp (7).jpg', 'mp (8).jpg', 'mp (9).jpg', 'mp (10).jpg', 'mp (11).jpg', 'mp (12).jpg', 'mp (13).jpg', 'mp (14).jpg', 'mp (15).jpg', 'mp (16).jpg', 'mp (17).jpg', 'mp (18).jpg', 'mp (19).jpg', 'mp (20).jpg']
      },
      ecommerce: {
        title: '电商美工',
        folder: COS_CDN_BASE + '/zyk/ds/',
        items: ['ds (1).jpg', 'ds (2).jpg', 'ds (3).jpg', 'ds (4).jpg', 'ds (5).jpg', 'ds (6).jpg', 'ds (7).jpg', 'ds (8).jpg']
      },
      poster: {
        title: '衍生品设计',
        folder: COS_CDN_BASE + '/zyk/ysp/',
        items: ['ysp (1).jpg', 'ysp (2).jpg', 'ysp (3).jpg', 'ysp (4).jpg', 'ysp (5).jpg', 'ysp (6).jpg', 'ysp (7).jpg', 'ysp (8).jpg', 'ysp (9).jpg', 'ysp (10).jpg', 'ysp (11).jpg', 'ysp (12).jpg', 'ysp (13).jpg', 'ysp (14).jpg', 'ysp (15).jpg', 'ysp (16).jpg', 'ysp (17).jpg']
      },
      photo: {
        title: '摄影',
        folder: COS_CDN_BASE + '/zyk/sy/',
        items: ['sy (1).jpg']
      },
      video: {
        title: '视频',
        folder: COS_CDN_BASE + '/zyk/sp/',
        items: ['sp (1).mp4']
      }
    };

    const columnCount = 5;
    const gap = 8;
    let loadedImages = 0;
    let totalImages = 0;

    // 瀑布流布局算法
    function waterfallLayout() {
      const containerWidth = masonryGrid.offsetWidth;
      const columnWidth = (containerWidth - gap * (columnCount - 1)) / columnCount;
      const columnHeights = new Array(columnCount).fill(0);

      const items = masonryGrid.querySelectorAll('.m-works__masonry-item');

      items.forEach(function(item) {
        // 找到最短的列
        let minHeight = columnHeights[0];
        let minIndex = 0;
        for (let i = 1; i < columnCount; i++) {
          if (columnHeights[i] < minHeight) {
            minHeight = columnHeights[i];
            minIndex = i;
          }
        }

        // 设置位置
        const left = minIndex * (columnWidth + gap);
        const top = minHeight;

        item.style.width = columnWidth + 'px';
        item.style.left = left + 'px';
        item.style.top = top + 'px';

        // 更新列高度
        const img = item.querySelector('img');
        const video = item.querySelector('video');
        if (img && img.complete && img.naturalWidth > 0) {
          const imgHeight = (columnWidth / img.naturalWidth) * img.naturalHeight;
          columnHeights[minIndex] += imgHeight + gap;
        } else if (video) {
          // 视频默认16:9比例
          const videoHeight = (columnWidth / 16) * 9;
          columnHeights[minIndex] += videoHeight + gap;
        }
      });

      // 设置容器高度
      const maxHeight = Math.max(...columnHeights) - gap;
      masonryGrid.style.height = maxHeight + 'px';
    }

    // 点击分类方块
    const categoryCards = categories.querySelectorAll('.m-works__category-card');
    categoryCards.forEach(function(card) {
      card.addEventListener('click', function() {
        const category = this.dataset.category;
        const data = worksData[category];

        if (data) {
          masonryTitle.textContent = data.title;

          // 清空并生成瀑布流项目
          masonryGrid.innerHTML = '';
          masonryGrid.style.height = 'auto';
          loadedImages = 0;
          totalImages = data.items.length;

          data.items.forEach(function(item) {
            const div = document.createElement('div');
            div.className = 'm-works__masonry-item';

            if (data.folder) {
              const isVideo = item.endsWith('.mp4') || item.endsWith('.webm') || item.endsWith('.mov');
              if (isVideo) {
                const video = document.createElement('video');
                video.src = data.folder + item;
                video.style.width = '100%';
                video.style.display = 'block';
                video.controls = true;
                video.muted = true;
                video.loop = true;
                div.appendChild(video);
                loadedImages++;
              } else {
                const img = document.createElement('img');
                img.src = data.folder + item;
                img.alt = item;
                img.style.width = '100%';
                img.style.display = 'block';

                img.onload = function() {
                  loadedImages++;
                  if (loadedImages === totalImages) {
                    waterfallLayout();
                  }
                };

                img.onerror = function() {
                  loadedImages++;
                };

                div.appendChild(img);
              }
            } else {
              div.innerHTML = '<div class="placeholder">' + item + '</div>';
            }

            masonryGrid.appendChild(div);
          });

          // 切换显示
          categories.classList.add('hidden');
          masonry.classList.add('active');

          // 等待图片加载完成后布局
          setTimeout(waterfallLayout, 100);
        }
      });
    });

    // 返回按钮
    backBtn.addEventListener('click', function() {
      masonry.classList.remove('active');
      categories.classList.remove('hidden');
    });

    // 窗口调整时重新布局
    window.addEventListener('resize', function() {
      if (masonry.classList.contains('active')) {
        waterfallLayout();
      }
    });
  }

  /* ============================================
     图片预览功能
     ============================================ */
  function initImagePreview() {
    const preview = document.getElementById('works-preview');
    const previewImg = document.getElementById('preview-img');

    if (!preview || !previewImg) return;

    // 点击图片放大
    document.addEventListener('click', function(e) {
      if (e.target.tagName === 'IMG' && e.target.closest('.m-works__masonry-item')) {
        const imgSrc = e.target.src;
        const imgAlt = e.target.alt || '预览图片';
        previewImg.src = imgSrc;
        previewImg.alt = imgAlt;
        preview.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });

    // 关闭预览
    function closePreview() {
      preview.classList.remove('active');
      previewImg.src = '';
      document.body.style.overflow = '';
    }

    // 点击遮罩关闭
    preview.addEventListener('click', function(e) {
      if (e.target === preview) {
        closePreview();
      }
    });

    // ESC键关闭
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && preview.classList.contains('active')) {
        closePreview();
      }
    });
  }

  /* ============================================
     DOM 准备就绪
     ============================================ */
  function onDOMReady() {
    /* 初始化鼠标视差效果 */
    initParallax();

    /* 初始化文字磁力拉扯效果 */
    initMagneticText();

    /* 初始化移动端卡片触摸动画 */
    initMobileCardTouch();

    /* 初始化作品瀑布流 */
    initWorksMasonry();

    /* 初始化图片预览 */
    initImagePreview();

    console.log('个人简历网页初始化完成');
  }

  /* ============================================
     启动应用
     ============================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDOMReady);
  } else {
    onDOMReady();
  }

})();
