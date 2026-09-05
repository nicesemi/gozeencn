
    (function() {
      var preconnectOrigins = ["https://cdn.shopify.com"];
      var scripts = ["/cdn/shopifycloud/checkout-web/assets/c1/polyfills.C7jITNoQ.js","/cdn/shopifycloud/checkout-web/assets/c1/app.DJR6hGkC.js","/cdn/shopifycloud/checkout-web/assets/c1/esnext-vendor.a_XaC4HL.js","/cdn/shopifycloud/checkout-web/assets/c1/context-browser.BqODThLH.js","/cdn/shopifycloud/checkout-web/assets/c1/useShopPayExternalAppContext.3grsT4qP.js","/cdn/shopifycloud/checkout-web/assets/c1/addresses-mailing-address.wxJLLtDb.js","/cdn/shopifycloud/checkout-web/assets/c1/Title.BkVLYVTu.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShopPayCheckoutGqlVersion.Cb-Kn37p.js","/cdn/shopifycloud/checkout-web/assets/c1/utils-shopId.DK_xcKdt.js","/cdn/shopifycloud/checkout-web/assets/c1/payment-methods-filterAvailableMethods.iaqIM5Ox.js","/cdn/shopifycloud/checkout-web/assets/c1/shop-pay-normalizeBuyerDetails.-FY-yAUO.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-UserPrivacySettingsSetMutation.Bje7eXsK.js","/cdn/shopifycloud/checkout-web/assets/c1/utils-getCommonShopPayExternalTelemetryAttributes.BwHk1iqp.js","/cdn/shopifycloud/checkout-web/assets/c1/extensions-rpc.Cency1rd.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useUnauthenticatedErrorModal.CQ4CMLtK.js","/cdn/shopifycloud/checkout-web/assets/c1/hydrate.CBxwVxLl.js","/cdn/shopifycloud/checkout-web/assets/c1/locale-en.CwVOIXbB.js","/cdn/shopifycloud/checkout-web/assets/c1/page-OnePage.z5jlSjYj.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useWalletsTimeout.DlpwgQRA.js","/cdn/shopifycloud/checkout-web/assets/c1/MarketsProDisclaimer.qtzQuhN3.js","/cdn/shopifycloud/checkout-web/assets/c1/remember-me-hooks.7ItBlWoj.js","/cdn/shopifycloud/checkout-web/assets/c1/color-contrast-colorContrast.JDWhveVY.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useHasOrdersFromMultipleShops.Cx5BjJc0.js","/cdn/shopifycloud/checkout-web/assets/c1/OffsitePaymentFailed.D_5N9iY7.js","/cdn/shopifycloud/checkout-web/assets/c1/NoAddressLocationFullDetour.AOUxmmrN.js","/cdn/shopifycloud/checkout-web/assets/c1/components-DeliveryTransition.DZxygyIL.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useGeneralPaymentErrorMessage.BLYq69HK.js","/cdn/shopifycloud/checkout-web/assets/c1/ChangeCompanyLocationLink.CZN7jd0S.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useStableHostMethodsReferences.BMb6yY0c.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useSandboxTelemetry.CGjHmBOz.js","/cdn/shopifycloud/checkout-web/assets/c1/BillingAddressForm.BGitbtiu.js","/cdn/shopifycloud/checkout-web/assets/c1/PhoneField.DuR7sg75.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useFormattedPhoneNumber.Ev5uGuZB.js","/cdn/shopifycloud/checkout-web/assets/c1/EmptyState.gdb60xt6.js","/cdn/shopifycloud/checkout-web/assets/c1/Choice.Bs1N7xYG.js","/cdn/shopifycloud/checkout-web/assets/c1/Checkbox.CVQb_0sr.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-usePostPurchase.CqXw4ZF2.js","/cdn/shopifycloud/checkout-web/assets/c1/Interaction-tracker.CDfRnwRz.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useCanChangeCompanyLocation.CFs30NnY.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useForceShopPayUrl.DI-K71p2.js","/cdn/shopifycloud/checkout-web/assets/c1/ShopPayLogo.SnuoVNuj.js","/cdn/shopifycloud/checkout-web/assets/c1/AutocompleteField-hooks.DfcVZ1OP.js","/cdn/shopifycloud/checkout-web/assets/c1/PendingShipping.gZHXg0A4.js","/cdn/shopifycloud/checkout-web/assets/c1/ImpressionEventCapture.D39jBKLi.js","/cdn/shopifycloud/checkout-web/assets/c1/StoreCreditRedemption-StoreCreditRedemptionErrorBanner.BHOCXc_Y.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentIcon.Cyis11LY.js","/cdn/shopifycloud/checkout-web/assets/c1/shop-cash-context.DNW7-RW5.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentLine.D4F70WVY.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShopPayProgressIntercepts.BDB7vIUB.js","/cdn/shopifycloud/checkout-web/assets/c1/billing-address-hooks.C5QA8PPL.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShowShopPayOptin.CrzFjToV.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useUpdateCheckoutAddress.CU_in-nu.js","/cdn/shopifycloud/checkout-web/assets/c1/Section.CY-0PmO9.js","/cdn/shopifycloud/checkout-web/assets/c1/useShopPaySessionTokenStorage.5mWDvigY.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useOnePageFormSubmit.ClQzK-k8.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentButtons.CbkDeO_c.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-shop-pay-alternative-payment-flow.CpVdPshr.js","/cdn/shopifycloud/checkout-web/assets/c1/shop-cash-monorail.BMAN6WKj.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useAvailableShopPromotionDiscount.DxuGlwdW.js","/cdn/shopifycloud/checkout-web/assets/c1/BillingAddressSelector.CdHMnjnq.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentErrorBanner.-ASxQniH.js","/cdn/shopifycloud/checkout-web/assets/c1/Switch.BVpBBb2E.js","/cdn/shopifycloud/checkout-web/assets/c1/shipping-rates-progressiveShippingRatesLoading.C8iHko-9.js","/cdn/shopifycloud/checkout-web/assets/c1/ShipmentBreakdown.waxEJCSe.js","/cdn/shopifycloud/checkout-web/assets/c1/MerchandiseModal.Cxk_dfFq.js","/cdn/shopifycloud/checkout-web/assets/c1/extension-targets-shipping-options.DmyhbW1q.js","/cdn/shopifycloud/checkout-web/assets/c1/EstimatedDeliveryContent.rNu4IF6t.js","/cdn/shopifycloud/checkout-web/assets/c1/ShippingMethodRateLabel.CeYe77gg.js","/cdn/shopifycloud/checkout-web/assets/c1/StackedMerchandisePreview.D7QZKuD4.js","/cdn/shopifycloud/checkout-web/assets/c1/ShippingMethodSelector.BOkahuor.js","/cdn/shopifycloud/checkout-web/assets/c1/TextArea.BFg1IPjO.js","/cdn/shopifycloud/checkout-web/assets/c1/SubscriptionPriceBreakdown.Bi4IjImh.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-usePaypalRowEffects.B9yqe9Zx.js","/cdn/shopifycloud/checkout-web/assets/c1/Middot.Cz7zrvvh.js","/cdn/shopifycloud/checkout-web/assets/c1/ShippingGroupsSummaryLine.BtgxlS4a.js","/cdn/shopifycloud/checkout-web/assets/c1/StockProblems-StockProblemsLineItemList.B7T1ImWb.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-publishMessage.DGGqWp-U.js"];
      var styles = ["/cdn/shopifycloud/checkout-web/assets/c1/assets/app.DzgRLp2z.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPayExternalAppContext.PQOzdEj1.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/getNormalizedPaymentMethodName.DWyYIMpE.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/OnePage.RWWzwUS2.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/DeliveryTransition.BbEi6fhy.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/StoreCreditRedemptionErrorBanner.DlkKDmBG.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPaySessionTokenStorage.CqVkJv9Z.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useOnePageFormSubmit.RkI_m_c8.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useGeneralPaymentErrorMessage.BrcQzLuH.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPayProgressIntercepts.CIy8uDiZ.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Choice.HiYlaz_E.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/EmptyState.BEvzDDvy.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ChangeCompanyLocationLink.uqpm88mq.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Section.CU18S7Ap.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentLine.7870thps.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Switch.Dq_6Ius6.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentIcon.CLVwzp6i.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/progressiveShippingRatesLoading.LcqrKXE1.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/BillingAddressForm.BdwN7V1K.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PhoneField.DN6CUyst.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Middot.D7Ujmshx.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/EstimatedDeliveryContent.CGkrPwWj.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentButtons.CuS5ve3d.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/usePostPurchase.uv-X4L1-.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/NoAddressLocationFullDetour.CpFaJIpx.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Checkbox.RMAxlIo4.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useSandboxTelemetry.CnR7qNLY.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ShippingMethodSelector.B0hio2RO.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/SubscriptionPriceBreakdown.vTcdVGq4.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/StackedMerchandisePreview.D6OuIVjc.css"];
      var fontPreconnectUrls = [];
      var fontPrefetchUrls = [];
      var imgPrefetchUrls = ["https://cdn.shopify.com/s/files/1/0555/0234/0277/files/EXO_Logo_Black_4x_ddf58d27-b2d6-4caf-b6c7-89db0c854b88_x320.png?v=1634555689"];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = preconnectOrigins.concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res, next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        function run() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        }
        var next = (self.requestIdleCallback || setTimeout).bind(self, run);
        next();
      }

      function onLoaded() {
        try {
          if (parseFloat(navigator.connection.effectiveType) > 2 && !navigator.connection.saveData) {
            preconnectAssets();
            prefetchAssets();
          }
        } catch (e) {}
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  