/*! tp-defer.js — 境外第三方脚本延迟加载器
 *
 * 作用：
 *   页面中标记为 <script type="text/tp-defer"> 的节点不会被浏览器在解析阶段下载/执行，
 *   而是等 window load 完成（或用户首次交互）后，由本脚本按原始 DOM 顺序重建并执行。
 *
 * 目的：
 *   gozeen.hk 上嵌入的境外统计/广告/遥测脚本（googletagmanager.com、mc.yandex.ru、
 *   t.contentsquare.net、monorail-edge.shopifysvc.com、cdn.shopify.com portable-wallets 等）
 *   在无 VPN 网络下会长时间 TCP 超时，直接拖死 window load 事件（实测 226.7s）。
 *   延迟到 load 之后注入，可在不删除任何脚本、不损失数据采集的前提下恢复首屏加载速度。
 *
 * 用法：
 *   1) 外链脚本：<script type="text/tp-defer" data-tp-src="https://..."></script>
 *      module 脚本：<script type="text/tp-defer" data-tp-type="module" data-tp-src="..."></script>
 *   2) 内联脚本：<script type="text/tp-defer">...</script>
 *   3) 页面中引入本文件：<script src="/assets/js/tp-defer.js"></script>（放在 </body> 前）
 *
 * 说明：不改动脚本内容，仅改变执行时机；如需彻底移除某脚本，直接删除对应标签即可。
 */
(function () {
  'use strict';

  var SELECTOR = 'script[type="text/tp-defer"]';
  var triggered = false;

  function inject() {
    var list = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
    var i = 0;

    function step() {
      if (i >= list.length) {
        return;
      }
      var old = list[i++];
      var s = document.createElement('script');

      // 继承原节点除 type / data-tp-src / data-tp-type 之外的全部属性
      // （如 id、class、crossorigin、onerror、data-* 等）
      for (var j = 0; j < old.attributes.length; j++) {
        var at = old.attributes[j];
        if (at.name === 'type' || at.name === 'data-tp-src' || at.name === 'data-tp-type') {
          continue;
        }
        s.setAttribute(at.name, at.value);
      }

      var tpType = old.getAttribute('data-tp-type');
      if (tpType) {
        s.type = tpType;
      }

      var src = old.getAttribute('data-tp-src');
      if (src) {
        s.src = src;
        s.async = false;
        s.onload = step;
        s.onerror = step;
        old.parentNode.insertBefore(s, old);
      } else {
        s.text = old.textContent;
        old.parentNode.insertBefore(s, old);
        step();
      }
    }

    try {
      step();
    } catch (e) {
      /* 静默失败：任何第三方脚本异常都不得影响站点自身功能 */
    }
  }

  function go() {
    if (triggered) {
      return;
    }
    triggered = true;
    setTimeout(inject, 200);
  }

  if (document.readyState === 'complete') {
    go();
  } else {
    window.addEventListener('load', go);
  }

  ['pointerdown', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(function (ev) {
    window.addEventListener(ev, go, { once: true, passive: true });
  });
})();
