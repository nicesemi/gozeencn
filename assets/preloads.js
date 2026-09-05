
    (function() {
      var preconnectOrigins = ["https://cdn.shopify.com"];
      var scripts = ["/cdn/shopifycloud/checkout-web/assets/c1/polyfills.BYz7ePEv.js","/cdn/shopifycloud/checkout-web/assets/c1/app.Cy_YOTk6.js","/cdn/shopifycloud/checkout-web/assets/c1/esnext-vendor.BNFQlDGZ.js","/cdn/shopifycloud/checkout-web/assets/c1/context-browser.vhmrDEZK.js","/cdn/shopifycloud/checkout-web/assets/c1/useShopPayCheckoutGqlVersion.B4r2GaUL.js","/cdn/shopifycloud/checkout-web/assets/c1/addresses-mailing-address.Vu6vyith.js","/cdn/shopifycloud/checkout-web/assets/c1/payment-methods-filterAvailableMethods.DVNiJ9Jn.js","/cdn/shopifycloud/checkout-web/assets/c1/shop-pay-normalizeBuyerDetails.Q_F1xQ7A.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-UserPrivacySettingsSetMutation.B_SI7JP1.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useUnauthenticatedErrorModal.C_k3dU_q.js","/cdn/shopifycloud/checkout-web/assets/c1/utils-getCommonShopPayExternalTelemetryAttributes.CDzZEXeY.js","/cdn/shopifycloud/checkout-web/assets/c1/extensions-rpc.wkht7rey.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-PaymentSessionMutation._bQfXtfE.js","/cdn/shopifycloud/checkout-web/assets/c1/hydrate.BZfJPGDU.js","/cdn/shopifycloud/checkout-web/assets/c1/Title.DSPVdAIW.js","/cdn/shopifycloud/checkout-web/assets/c1/locale-en.Eh_wgNTs.js","/cdn/shopifycloud/checkout-web/assets/c1/OnePage.BjHyw8MG.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useWalletsTimeout.B0-UDnxX.js","/cdn/shopifycloud/checkout-web/assets/c1/MarketsProDisclaimer.COpwU7e5.js","/cdn/shopifycloud/checkout-web/assets/c1/remember-me-hooks.BUIP8jwb.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useHasOrdersFromMultipleShops.CzwRxuq2.js","/cdn/shopifycloud/checkout-web/assets/c1/components-DeliveryTransition.rw-aeqEq.js","/cdn/shopifycloud/checkout-web/assets/c1/useShopPayButtonClassName.WttfDo0i.js","/cdn/shopifycloud/checkout-web/assets/c1/ChangeCompanyLocationLink.DpUd62Ob.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useStableHostMethodsReferences.VxDd8sS4.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useSandboxTelemetry.DZpiCWer.js","/cdn/shopifycloud/checkout-web/assets/c1/BillingAddressForm.BhtvoBIZ.js","/cdn/shopifycloud/checkout-web/assets/c1/PhoneField.CYIw8U0P.js","/cdn/shopifycloud/checkout-web/assets/c1/ImpressionEventCapture.kPBgQW5k.js","/cdn/shopifycloud/checkout-web/assets/c1/EmptyState.ng83uD4f.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useCanChangeCompanyLocation.DrmSpxQb.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-usePickupPoints.D_jey_eq.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-usePostPurchase.Dvnvg0v4.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useForceShopPayUrl.CwxGb0xX.js","/cdn/shopifycloud/checkout-web/assets/c1/ShopPayLogo.CE4ckeEp.js","/cdn/shopifycloud/checkout-web/assets/c1/AutocompleteField-hooks.Dm18hpIg.js","/cdn/shopifycloud/checkout-web/assets/c1/PendingShipping.CHYfvXN7.js","/cdn/shopifycloud/checkout-web/assets/c1/StoreCreditRedemption-StoreCreditRedemptionErrorBanner.Od6P-0FK.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentIcon.BLq4k0Od.js","/cdn/shopifycloud/checkout-web/assets/c1/shop-cash-context.CwHhGQze.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useGeneralPaymentErrorMessage.AqokTlvU.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentLine.CBPKBA5b.js","/cdn/shopifycloud/checkout-web/assets/c1/NoAddressLocationFullDetour.BXXX7CUN.js","/cdn/shopifycloud/checkout-web/assets/c1/OffsitePaymentFailed.BEhLPZKP.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShopPayProgressIntercepts.zMEe4i2W.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useShowShopPayOptin.Dr4PS2sL.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useUpdateCheckoutAddress.DNx6LUdk.js","/cdn/shopifycloud/checkout-web/assets/c1/Section.CvyNj3G7.js","/cdn/shopifycloud/checkout-web/assets/c1/useShopPaySessionTokenStorage.CF5DQY9d.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useOnePageFormSubmit.2Dchtj0Q.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentButtons.BuH1TGxm.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-shop-pay-alternative-payment-flow.DKiVs8n0.js","/cdn/shopifycloud/checkout-web/assets/c1/shop-cash-monorail.mNBhz2xt.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useAvailableShopPromotionDiscount.DWnk7KHn.js","/cdn/shopifycloud/checkout-web/assets/c1/BillingAddressSelector.DK0r15j7.js","/cdn/shopifycloud/checkout-web/assets/c1/PaymentErrorBanner.Cf8mzSZ2.js","/cdn/shopifycloud/checkout-web/assets/c1/Switch.BQbOsJVM.js","/cdn/shopifycloud/checkout-web/assets/c1/shipping-rates-progressiveShippingRatesLoading.CTlfkftK.js","/cdn/shopifycloud/checkout-web/assets/c1/ShipmentBreakdown.BPq5CjC6.js","/cdn/shopifycloud/checkout-web/assets/c1/MerchandiseModal.bArj1gfr.js","/cdn/shopifycloud/checkout-web/assets/c1/extension-targets-shipping-options.CRIbV7iu.js","/cdn/shopifycloud/checkout-web/assets/c1/EstimatedDeliveryContent.ox-b0Qf4.js","/cdn/shopifycloud/checkout-web/assets/c1/ShippingMethodRateLabel.9KrZSTBr.js","/cdn/shopifycloud/checkout-web/assets/c1/ShippingMethodSelector.BKjWJY2F.js","/cdn/shopifycloud/checkout-web/assets/c1/TextArea.B-kaTvSK.js","/cdn/shopifycloud/checkout-web/assets/c1/SubscriptionPriceBreakdown.bIx34ED9.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-usePaypalRowEffects.CjFINcCw.js","/cdn/shopifycloud/checkout-web/assets/c1/Middot.BKG-qTHI.js","/cdn/shopifycloud/checkout-web/assets/c1/StockProblems-StockProblemsLineItemList.eiFhL1xy.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-publishMessage.YuzbFXJg.js"];
      var styles = ["/cdn/shopifycloud/checkout-web/assets/c1/assets/app.DzgRLp2z.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPayCheckoutGqlVersion.PQOzdEj1.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/getNormalizedPaymentMethodName.B9Go32vR.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/OnePage.RWWzwUS2.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/DeliveryTransition.BbEi6fhy.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/StoreCreditRedemptionErrorBanner.DlkKDmBG.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPaySessionTokenStorage.CqVkJv9Z.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useOnePageFormSubmit.RkI_m_c8.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPayProgressIntercepts.CIy8uDiZ.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useCanChangeCompanyLocation.HiYlaz_E.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/EmptyState.BEvzDDvy.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/ChangeCompanyLocationLink.uqpm88mq.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Section.CU18S7Ap.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/useShopPayButtonClassName.BrcQzLuH.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentLine.7870thps.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Switch.Dq_6Ius6.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentIcon.CLVwzp6i.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/progressiveShippingRatesLoading.LcqrKXE1.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/NoAddressLocationFullDetour.D14orovx.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/BillingAddressForm.BdwN7V1K.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PhoneField.DN6CUyst.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/Middot.D7Ujmshx.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/MerchandiseModal.D6OuIVjc.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/EstimatedDeliveryContent.CGkrPwWj.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/PaymentButtons.CuS5ve3d.css","/cdn/shopifycloud/checkout-web/assets/c1/assets/usePostPurchase.uv-X4L1-.css"];
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
  